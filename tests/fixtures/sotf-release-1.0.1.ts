import type { BundleReleaseArtifact } from "@lead-emergence/bundle-release";

export function syntheticSotf101(source: BundleReleaseArtifact): BundleReleaseArtifact {
  const fixture = structuredClone(source);
  fixture.manifest.identity.version = "1.0.1";
  for (const capability of fixture.manifest.capabilities) capability.version = "1.0.1";
  for (const workflow of fixture.manifest.workflows) workflow.version = "1.0.1";
  return fixture;
}
