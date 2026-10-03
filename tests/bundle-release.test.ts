import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  BundleReleaseCatalog,
  bundleArtifactDigest,
  bundleReleaseSchema,
  createBundleRelease,
  releaseChannelSchema,
  type BundleReleaseArtifact,
  type BundleReleaseMetadata
} from "@lead-emergence/bundle-release";
import { parseBundleManifest } from "@lead-emergence/bundle-contract";
import { uiManifestSchema } from "@lead-emergence/ui-manifest";
import { syntheticSotf101 } from "./fixtures/sotf-release-1.0.1";

const baseMetadata: BundleReleaseMetadata = {
  sourceRepository: "https://github.com/abostwick12/lead-emergence-bundles",
  sourceRevision: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  compatibility: {
    bundleContractMajor: 1,
    minimumWorkspaceHostContract: "1.0.0",
    persistedStateCompatible: true,
    hostAdapterCompatible: true
  },
  validation: {
    state: "passed",
    deterministic: true,
    validatorVersion: "1.0.0",
    validatedAt: "2026-09-19T20:00:00.000Z"
  }
};

function sotf101(): BundleReleaseArtifact {
  // Exact manifest/UI bytes from released source e8f14615405ec3222c19dc358334003e5df60b19.
  // Never derive historical release evidence from the current candidate.
  return {
    manifest: parseBundleManifest(JSON.parse(readFileSync(
      "tests/fixtures/historical-sotf-1.0.1/bundle.json", "utf8"
    ))),
    uiManifest: uiManifestSchema.parse(JSON.parse(readFileSync(
      "tests/fixtures/historical-sotf-1.0.1/ui-manifest.json", "utf8"
    )))
  };
}

function sotf100(): BundleReleaseArtifact {
  const artifact = structuredClone(sotf101());
  artifact.manifest.identity.version = "1.0.0";
  for (const capability of artifact.manifest.capabilities) capability.version = "1.0.0";
  for (const workflow of artifact.manifest.workflows) workflow.version = "1.0.0";
  return artifact;
}

describe("Bundle release catalog", () => {
  it("accepts only the three explicit release channels", () => {
    expect(["development", "beta", "stable"].map((item) => releaseChannelSchema.parse(item))).toEqual([
      "development",
      "beta",
      "stable"
    ]);
    expect(releaseChannelSchema.safeParse("production").success).toBe(false);
  });

  it("records the SOTF 1.0.0 baseline against the source revision containing its artifact", () => {
    const recorded = bundleReleaseSchema.parse(JSON.parse(readFileSync(
      "bundles/sotf-transition/releases/1.0.0.json",
      "utf8"
    )));
    expect(recorded).toMatchObject({
      bundleKey: "sotf_transition",
      version: "1.0.0",
      sourceRevision: "70f6d14f25b391ea319080e6701e5fe74d1785a5",
      validation: { state: "passed", deterministic: true }
    });
    expect(recorded.artifactDigest).toBe(bundleArtifactDigest(sotf100()));
    expect(syntheticSotf101(sotf100())).toEqual(sotf101());
  });

  it("records the real SOTF 1.0.1 patch without losing the immutable baseline", () => {
    const release100 = bundleReleaseSchema.parse(JSON.parse(readFileSync(
      "bundles/sotf-transition/releases/1.0.0.json", "utf8"
    )));
    const release101 = bundleReleaseSchema.parse(JSON.parse(readFileSync(
      "bundles/sotf-transition/releases/1.0.1.json", "utf8"
    )));
    expect(release101).toMatchObject({
      bundleKey: "sotf_transition",
      version: "1.0.1",
      sourceRevision: "e8f14615405ec3222c19dc358334003e5df60b19",
      compatibility: release100.compatibility
    });
    expect(release101.artifactDigest).toBe(bundleArtifactDigest(sotf101()));

    const catalog = new BundleReleaseCatalog();
    catalog.register(release100, sotf100());
    catalog.register(release101, sotf101());
    expect(catalog.list("sotf_transition").map((release) => release.version)).toEqual(["1.0.0", "1.0.1"]);
    catalog.promote("sotf_transition", "stable", "1.0.0", "1.0.0");
    expect(catalog.promote("sotf_transition", "stable", "1.0.1", "1.0.0")).toEqual(release101);
    expect(catalog.get("sotf_transition", "1.0.0")?.release).toEqual(release100);
  });

  it("keeps multiple immutable releases for one logical bundle key", () => {
    const catalog = new BundleReleaseCatalog();
    const artifact100 = sotf100();
    const artifact101 = syntheticSotf101(artifact100);
    const release100 = createBundleRelease(artifact100, baseMetadata);
    const release101 = createBundleRelease(artifact101, {
      ...baseMetadata,
      sourceRevision: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    });

    expect(catalog.register(release100, artifact100)).toEqual(release100);
    expect(catalog.register(release101, artifact101)).toEqual(release101);
    expect(catalog.list("sotf_transition").map((item) => item.version)).toEqual(["1.0.0", "1.0.1"]);
    expect(catalog.get("sotf_transition", "1.0.0")?.release).toEqual(release100);
    expect(catalog.get("sotf_transition", "1.0.1")?.release).toEqual(release101);
  });

  it("rejects malformed artifacts before they enter release inventory", () => {
    const catalog = new BundleReleaseCatalog();
    const artifact = sotf100();
    const release = createBundleRelease(artifact, baseMetadata);
    const malformed = structuredClone(artifact);
    malformed.uiManifest.bundleKey = "executive";
    expect(() => catalog.register(release, malformed)).toThrow(/keys must match/);
    expect(catalog.list("sotf_transition")).toEqual([]);
  });

  it("handles an exact duplicate deterministically and rejects version reuse with different bytes", () => {
    const catalog = new BundleReleaseCatalog();
    const artifact = sotf100();
    const release = createBundleRelease(artifact, baseMetadata);
    expect(catalog.register(release, artifact)).toEqual(release);
    expect(catalog.register(release, artifact)).toEqual(release);

    const changed = structuredClone(artifact);
    changed.manifest.identity.description = "Different artifact bytes under the same version.";
    const conflicting = createBundleRelease(changed, baseMetadata);
    expect(() => catalog.register(conflicting, changed)).toThrow(/already exists with different content/);
    expect(catalog.list("sotf_transition")).toHaveLength(1);
  });

  it("promotes a compatible patch atomically through explicit channels", () => {
    const catalog = new BundleReleaseCatalog();
    const artifact100 = sotf100();
    const artifact101 = syntheticSotf101(artifact100);
    catalog.register(createBundleRelease(artifact100, baseMetadata), artifact100);
    catalog.register(createBundleRelease(artifact101, baseMetadata), artifact101);

    catalog.promote("sotf_transition", "stable", "1.0.0", "1.0.0");
    expect(catalog.promote("sotf_transition", "stable", "1.0.1", "1.0.0").version).toBe("1.0.1");
    expect(catalog.channel("sotf_transition", "stable")?.version).toBe("1.0.1");
    expect(catalog.channel("sotf_transition", "beta")).toBeUndefined();
  });

  it.each([
    ["contract major", { compatibility: { ...baseMetadata.compatibility, bundleContractMajor: 2 } }, /contract major changed/],
    ["persisted state", { compatibility: { ...baseMetadata.compatibility, persistedStateCompatible: false } }, /persisted state/],
    ["host adapter", { compatibility: { ...baseMetadata.compatibility, hostAdapterCompatible: false } }, /host adapter/],
    ["deterministic validation", { validation: { ...baseMetadata.validation, deterministic: false } }, /deterministic validation/],
    ["validation state", { validation: { ...baseMetadata.validation, state: "failed" as const } }, /deterministic validation/]
  ])("rejects a patch release when %s compatibility fails", (_label, override, expected) => {
    const catalog = new BundleReleaseCatalog();
    const artifact100 = sotf100();
    const artifact101 = syntheticSotf101(artifact100);
    catalog.register(createBundleRelease(artifact100, baseMetadata), artifact100);
    catalog.register(createBundleRelease(artifact101, { ...baseMetadata, ...override }), artifact101);
    catalog.promote("sotf_transition", "stable", "1.0.0", "1.0.0");

    expect(() => catalog.promote("sotf_transition", "stable", "1.0.1", "1.0.0")).toThrow(expected);
    expect(catalog.channel("sotf_transition", "stable")?.version).toBe("1.0.0");
  });

  it("rejects incompatible semantic major and insufficient host contract", () => {
    const catalog = new BundleReleaseCatalog();
    const artifact100 = sotf100();
    const artifact200 = structuredClone(artifact100);
    artifact200.manifest.identity.version = "2.0.0";
    for (const capability of artifact200.manifest.capabilities) capability.version = "2.0.0";
    for (const workflow of artifact200.manifest.workflows) workflow.version = "2.0.0";
    const artifact101 = syntheticSotf101(artifact100);
    catalog.register(createBundleRelease(artifact100, baseMetadata), artifact100);
    catalog.register(createBundleRelease(artifact200, baseMetadata), artifact200);
    catalog.register(createBundleRelease(artifact101, {
      ...baseMetadata,
      compatibility: { ...baseMetadata.compatibility, minimumWorkspaceHostContract: "1.1.0" }
    }), artifact101);
    catalog.promote("sotf_transition", "stable", "1.0.0", "1.0.0");

    expect(() => catalog.promote("sotf_transition", "stable", "2.0.0", "1.0.0")).toThrow(/Major-version promotion/);
    expect(() => catalog.promote("sotf_transition", "stable", "1.0.1", "1.0.0")).toThrow(/does not satisfy/);
    expect(catalog.channel("sotf_transition", "stable")?.version).toBe("1.0.0");
  });
});
