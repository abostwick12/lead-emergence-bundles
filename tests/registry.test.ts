import { describe, expect, it } from "vitest";
import { BundleRegistry } from "@lead-emergence/bundle-registry";
import { CapabilityRegistry } from "@lead-emergence/capability-registry";
import { composeExperience } from "@lead-emergence/runtime";
import { composeUiManifests } from "@lead-emergence/ui-manifest";
import { entitlementSnapshot, loadArtifacts } from "./fixtures";

const now = new Date("2026-09-08T18:00:00.000Z");

describe("entitlement-derived bundle composition", () => {
  it("shows Writer navigation and content only to the entitled user", () => {
    const artifacts = loadArtifacts();
    const userA = composeExperience(
      artifacts,
      entitlementSnapshot(["workspace_experience", "writer_editor"]),
      {},
      now
    );
    const userB = composeExperience(
      artifacts,
      entitlementSnapshot(["workspace_experience"]),
      {},
      now
    );
    expect(userA.bundles.map((item) => item.manifest.identity.key)).toContain("writer_editor");
    expect(userA.capabilities.map((item) => item.id)).toContain("writer.resource.review");
    expect(userA.ui.primaryNavigation.map((item) => item.label)).toContain("Writing");
    expect(userA.ui.dashboardWidgets.map((item) => item.id)).toContain("writer.widget.publication_queue");
    expect(userB.bundles.map((item) => item.manifest.identity.key)).not.toContain("writer_editor");
    expect(userB.capabilities.map((item) => item.id)).not.toContain("writer.resource.review");
    expect(userB.ui.primaryNavigation.map((item) => item.label)).not.toContain("Writing");
    expect(userB.ui.dashboardWidgets.map((item) => item.id)).not.toContain("writer.widget.publication_queue");
  });

  it("removes Writer UI and capability on entitlement removal without changing the registry", () => {
    const artifacts = loadArtifacts();
    const before = composeExperience(artifacts, entitlementSnapshot(["workspace_experience", "writer_editor"]), {}, now);
    const after = composeExperience(artifacts, entitlementSnapshot(["workspace_experience"]), {}, now);
    expect(before.bundles).toHaveLength(2);
    expect(after.bundles).toHaveLength(1);
    expect(before.ui.primaryNavigation.map((item) => item.label)).toContain("Writing");
    expect(after.ui.primaryNavigation.map((item) => item.label)).not.toContain("Writing");
    expect(after.entitlementRevision).toBe("test-revision-1");
  });

  it("excludes revoked, expired, future, and unavailable assignments", () => {
    const registry = new BundleRegistry();
    for (const artifact of loadArtifacts()) registry.register(artifact);
    const snapshot = entitlementSnapshot([], {
      assignments: [
        { bundleKey: "writer_editor", status: "revoked", startsAt: "2026-01-01T00:00:00.000Z" },
        { bundleKey: "ministry", status: "expired", startsAt: "2026-01-01T00:00:00.000Z", expiresAt: "2026-08-01T00:00:00.000Z" },
        { bundleKey: "investor", status: "active", startsAt: "2027-01-01T00:00:00.000Z" },
        { bundleKey: "nonprofit_founder", status: "unavailable", startsAt: "2026-01-01T00:00:00.000Z" }
      ]
    });
    expect(registry.resolve(snapshot, now)).toEqual([]);
  });

  it("composes UI deterministically regardless of registration order", () => {
    const manifests = loadArtifacts().map((item) => item.uiManifest);
    const forward = composeUiManifests(manifests);
    const reverse = composeUiManifests([...manifests].reverse());
    expect(reverse).toEqual(forward);
    expect(forward.primaryNavigation.map((item) => item.label)).toEqual([
      "Home",
      "Writing",
      "Ministry",
      "Nonprofit",
      "Investing"
    ]);
  });

  it("applies only explicit user pin, hide, order, and default-workspace preferences", () => {
    const manifests = loadArtifacts().map((item) => item.uiManifest);
    const composed = composeUiManifests(manifests, {
      pinnedWidgetIds: ["investor:investor.widget.thesis_changes"],
      hiddenItemIds: ["writer_editor:writer.widget.publication_queue"],
      orderOverrides: { "investor:investor.nav.home": 5 },
      defaultWorkspaceRoute: "/workspace/investing"
    });
    expect(composed.dashboardWidgets[0]?.id).toBe("investor.widget.thesis_changes");
    expect(composed.dashboardWidgets.map((item) => item.id)).not.toContain("writer.widget.publication_queue");
    expect(composed.primaryNavigation[1]?.label).toBe("Investing");
    expect(composed.defaultWorkspaceRoute).toBe("/workspace/investing");
  });

  it("discovers capabilities independently and rejects duplicate registration", () => {
    const registry = new CapabilityRegistry();
    const writer = loadArtifacts().find((item) => item.manifest.identity.key === "writer_editor");
    expect(writer).toBeDefined();
    registry.registerBundle(writer!.manifest);
    expect(registry.resolveForBundles(["writer_editor"]).map((item) => item.id)).toContain("writer.resource.review");
    expect(() => registry.registerBundle(writer!.manifest)).toThrow(/already registered/);
  });
});
