import type { BundleArtifact, EntitlementSnapshot } from "@lead-emergence/bundle-registry";
import { BundleRegistry } from "@lead-emergence/bundle-registry";
import { CapabilityRegistry } from "@lead-emergence/capability-registry";
import type { UiPreferences } from "@lead-emergence/ui-manifest";
import { composeUiManifests } from "@lead-emergence/ui-manifest";

export function composeExperience(
  artifacts: BundleArtifact[],
  entitlementSnapshot: EntitlementSnapshot,
  preferences: UiPreferences = {},
  now = new Date()
) {
  const bundles = new BundleRegistry();
  const capabilities = new CapabilityRegistry();
  for (const artifact of artifacts) {
    bundles.register(artifact);
    capabilities.registerBundle(artifact.manifest);
  }
  const entitledBundles = bundles.resolve(entitlementSnapshot, now);
  const bundleKeys = entitledBundles.map((bundle) => bundle.manifest.identity.key);
  return {
    entitlementRevision: entitlementSnapshot.revision,
    bundles: entitledBundles,
    capabilities: capabilities.resolveForBundles(bundleKeys),
    ui: composeUiManifests(entitledBundles.map((bundle) => bundle.uiManifest), preferences)
  };
}
