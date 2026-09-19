import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  BundleReleaseCatalog,
  bundleArtifactDigest,
  bundleReleaseSchema,
  createBundleRelease,
  type BundleReleaseArtifact,
  type BundleReleaseMetadata
} from "@lead-emergence/bundle-release";
import { loadArtifacts } from "./fixtures";
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

function sotf100(): BundleReleaseArtifact {
  return loadArtifacts().find((item) => item.manifest.identity.key === "sotf_transition")!;
}

describe("Bundle release catalog", () => {
  it("records the SOTF 1.0.0 baseline against the source revision containing its artifact", () => {
    const recorded = bundleReleaseSchema.parse(JSON.parse(readFileSync(
      "bundles/sotf-transition/releases/1.0.0.json",
      "utf8"
    )));
    expect(recorded).toMatchObject({
      bundleKey: "sotf_transition",
      version: "1.0.0",
      sourceRevision: "100f503f492df359357e2e83a74d55681fb62249",
      validation: { state: "passed", deterministic: true }
    });
    expect(recorded.artifactDigest).toBe(bundleArtifactDigest(sotf100()));
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
