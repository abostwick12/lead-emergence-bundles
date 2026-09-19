import { createHash } from "node:crypto";
import { z } from "zod";
import type { BundleManifest } from "@lead-emergence/bundle-contract";
import { bundleKeySchema, parseBundleManifest, semverSchema } from "@lead-emergence/bundle-contract";
import type { UiManifest } from "@lead-emergence/ui-manifest";
import { uiManifestSchema } from "@lead-emergence/ui-manifest";

export const releaseChannelSchema = z.enum(["development", "beta", "stable"]);

export const releaseCompatibilitySchema = z.object({
  bundleContractMajor: z.number().int().positive(),
  minimumWorkspaceHostContract: semverSchema,
  persistedStateCompatible: z.boolean(),
  hostAdapterCompatible: z.boolean()
}).strict();

export const releaseValidationSchema = z.object({
  state: z.enum(["pending", "passed", "failed"]),
  deterministic: z.boolean(),
  validatorVersion: semverSchema,
  validatedAt: z.string().datetime({ offset: true }).optional()
}).strict().superRefine((validation, context) => {
  if (validation.state === "passed" && !validation.validatedAt) {
    context.addIssue({ code: "custom", message: "Passed validation requires validatedAt" });
  }
});

export const bundleReleaseSchema = z.object({
  bundleKey: bundleKeySchema,
  version: semverSchema,
  artifactDigest: z.string().regex(/^sha256:[0-9a-f]{64}$/),
  sourceRepository: z.string().url(),
  sourceRevision: z.string().regex(/^[0-9a-f]{40}$/),
  compatibility: releaseCompatibilitySchema,
  validation: releaseValidationSchema
}).strict();

export type ReleaseChannel = z.infer<typeof releaseChannelSchema>;
export type BundleRelease = z.infer<typeof bundleReleaseSchema>;
export type BundleReleaseArtifact = {
  manifest: BundleManifest;
  uiManifest: UiManifest;
};
export type BundleReleaseMetadata = Omit<BundleRelease, "bundleKey" | "version" | "artifactDigest">;

export class BundleReleaseError extends Error {
  readonly code = "BUNDLE_RELEASE_ERROR";
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
    .join(",")}}`;
}

export function bundleArtifactDigest(artifactInput: BundleReleaseArtifact): string {
  const artifact = parseArtifact(artifactInput);
  const bytes = canonicalJson({ manifest: artifact.manifest, uiManifest: artifact.uiManifest });
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export function createBundleRelease(
  artifactInput: BundleReleaseArtifact,
  metadata: BundleReleaseMetadata
): BundleRelease {
  const artifact = parseArtifact(artifactInput);
  return bundleReleaseSchema.parse({
    bundleKey: artifact.manifest.identity.key,
    version: artifact.manifest.identity.version,
    artifactDigest: bundleArtifactDigest(artifact),
    ...metadata
  });
}

function parseArtifact(input: BundleReleaseArtifact): BundleReleaseArtifact {
  const manifest = parseBundleManifest(input.manifest);
  const uiManifest = uiManifestSchema.parse(input.uiManifest);
  if (manifest.identity.key !== uiManifest.bundleKey) {
    throw new BundleReleaseError("Bundle and UI manifest keys must match.");
  }
  return { manifest, uiManifest };
}

function parseSemver(value: string): [number, number, number] {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(value);
  if (!match) throw new BundleReleaseError(`Invalid semantic version: ${value}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareSemver(left: string, right: string): number {
  const leftParts = parseSemver(left);
  const rightParts = parseSemver(right);
  for (let index = 0; index < leftParts.length; index += 1) {
    const difference = leftParts[index] - rightParts[index];
    if (difference !== 0) return difference;
  }
  return 0;
}

function assertReleaseReady(release: BundleRelease, hostContractVersion: string): void {
  semverSchema.parse(hostContractVersion);
  if (release.validation.state !== "passed" || !release.validation.deterministic) {
    throw new BundleReleaseError("Release must pass deterministic validation before promotion.");
  }
  if (!release.compatibility.persistedStateCompatible) {
    throw new BundleReleaseError("Release is incompatible with persisted state.");
  }
  if (!release.compatibility.hostAdapterCompatible) {
    throw new BundleReleaseError("Release is incompatible with the host adapter contract.");
  }
  if (compareSemver(hostContractVersion, release.compatibility.minimumWorkspaceHostContract) < 0) {
    throw new BundleReleaseError("Workspace host contract does not satisfy the release minimum.");
  }
}

export function assertCompatiblePromotion(
  current: BundleRelease,
  candidate: BundleRelease,
  hostContractVersion: string
): void {
  if (current.bundleKey !== candidate.bundleKey) {
    throw new BundleReleaseError("A channel cannot change bundle identity.");
  }
  if (compareSemver(candidate.version, current.version) <= 0) {
    throw new BundleReleaseError("A channel promotion must advance the release version.");
  }
  if (parseSemver(current.version)[0] !== parseSemver(candidate.version)[0]) {
    throw new BundleReleaseError("Major-version promotion requires an explicit compatibility contract.");
  }
  if (current.compatibility.bundleContractMajor !== candidate.compatibility.bundleContractMajor) {
    throw new BundleReleaseError("Bundle contract major changed.");
  }
  assertReleaseReady(candidate, hostContractVersion);
}

type RegisteredRelease = {
  release: BundleRelease;
  artifact: BundleReleaseArtifact;
};

export class BundleReleaseCatalog {
  readonly #releases = new Map<string, RegisteredRelease>();
  readonly #channels = new Map<string, string>();

  register(releaseInput: BundleRelease, artifactInput: BundleReleaseArtifact): BundleRelease {
    const release = bundleReleaseSchema.parse(releaseInput);
    const artifact = parseArtifact(artifactInput);
    if (
      release.bundleKey !== artifact.manifest.identity.key
      || release.version !== artifact.manifest.identity.version
    ) {
      throw new BundleReleaseError("Release identity must match the immutable manifest identity.");
    }
    if (bundleArtifactDigest(artifact) !== release.artifactDigest) {
      throw new BundleReleaseError("Release digest does not match the bundle artifact bytes.");
    }
    const key = this.#releaseKey(release.bundleKey, release.version);
    const existing = this.#releases.get(key);
    if (existing) {
      if (existing.release.artifactDigest !== release.artifactDigest) {
        throw new BundleReleaseError(`Release version already exists with different content: ${key}`);
      }
      return existing.release;
    }
    this.#releases.set(key, { release, artifact });
    return release;
  }

  get(bundleKey: string, version: string): RegisteredRelease | undefined {
    return this.#releases.get(this.#releaseKey(bundleKey, version));
  }

  list(bundleKey: string): BundleRelease[] {
    return [...this.#releases.values()]
      .map((item) => item.release)
      .filter((item) => item.bundleKey === bundleKey)
      .sort((left, right) => compareSemver(left.version, right.version));
  }

  promote(
    bundleKey: string,
    channelInput: ReleaseChannel,
    version: string,
    hostContractVersion: string
  ): BundleRelease {
    const channel = releaseChannelSchema.parse(channelInput);
    const candidate = this.get(bundleKey, version)?.release;
    if (!candidate) throw new BundleReleaseError(`Unknown release: ${bundleKey}@${version}`);
    const channelKey = `${bundleKey}:${channel}`;
    const currentIdentity = this.#channels.get(channelKey);
    const current = currentIdentity ? this.#releases.get(currentIdentity)?.release : undefined;
    if (current) assertCompatiblePromotion(current, candidate, hostContractVersion);
    else assertReleaseReady(candidate, hostContractVersion);
    this.#channels.set(channelKey, this.#releaseKey(bundleKey, version));
    return candidate;
  }

  channel(bundleKey: string, channelInput: ReleaseChannel): BundleRelease | undefined {
    const channel = releaseChannelSchema.parse(channelInput);
    const identity = this.#channels.get(`${bundleKey}:${channel}`);
    return identity ? this.#releases.get(identity)?.release : undefined;
  }

  #releaseKey(bundleKey: string, version: string): string {
    return `${bundleKey}@${version}`;
  }
}
