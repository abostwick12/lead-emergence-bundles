import { describe, expect, it } from "vitest";
import { BundleRegistry } from "@lead-emergence/bundle-registry";
import { loadArtifacts } from "./fixtures";

describe("Bundle Contract", () => {
  it("validates all six independent bundle and UI artifacts", () => {
    const artifacts = loadArtifacts();
    expect(artifacts.map((item) => item.manifest.identity.key)).toEqual([
      "executive",
      "writer_editor",
      "ministry",
      "nonprofit_founder",
      "investor",
      "workspace_experience"
    ]);
    for (const artifact of artifacts) {
      expect(artifact.manifest.schemaVersion).toBe("1.0");
      expect(artifact.manifest.experience.timeToFirstValueMinutes).toBeLessThanOrEqual(60);
      expect(artifact.manifest.experience.successSignals.length).toBeGreaterThan(0);
    }
  });

  it("registers UI references only when capabilities, workflows, attention, and actions exist", () => {
    const registry = new BundleRegistry();
    for (const artifact of loadArtifacts()) registry.register(artifact);
    expect(registry.list()).toHaveLength(6);
  });

  it("keeps presentation in a separate declarative artifact", () => {
    const artifact = loadArtifacts().find(item => item.manifest.identity.key === "nonprofit_founder")!;
    expect(artifact.uiManifest.secondaryNavigation.every(item => item.capabilityId)).toBe(true);
    expect(() => new BundleRegistry().register({...artifact, uiManifest: {...artifact.uiManifest,
      primaryNavigation: [{...artifact.uiManifest.primaryNavigation[0], capabilityId: "investor.private"}]
    }})).toThrow(/unknown capability/);
    for (const artifact of loadArtifacts()) {
      expect(artifact.manifest.uiManifestPath).toMatch(/ui-manifest\.json$/);
      expect(JSON.stringify(artifact.uiManifest)).not.toMatch(/React|component/i);
    }
  });

  it("contains no client-specific Dad conditionals", () => {
    const serialized = JSON.stringify(loadArtifacts()).toLowerCase();
    expect(serialized).not.toContain("dad");
    expect(serialized).not.toContain("if_client");
  });
});
