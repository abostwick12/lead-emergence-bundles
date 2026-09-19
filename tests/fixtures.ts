import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { BundleArtifact, EntitlementSnapshot } from "@lead-emergence/bundle-registry";
import { parseBundleManifest } from "@lead-emergence/bundle-contract";
import { uiManifestSchema } from "@lead-emergence/ui-manifest";

export const bundleSlugs = [
  "executive",
  "writer-editor",
  "ministry",
  "nonprofit-founder",
  "investor",
  "workspace-experience"
] as const;

export const principal = {
  subjectId: "11111111-1111-4111-8111-111111111111",
  tenantId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  workspaceId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  source: "verified_session" as const,
  serverBound: true as const
};

export function loadArtifacts(): BundleArtifact[] {
  return bundleSlugs.map((slug) => {
    const directory = join(process.cwd(), "bundles", slug);
    const manifest = parseBundleManifest(readJson(join(directory, "bundle.json")));
    const uiManifest = uiManifestSchema.parse(readJson(join(directory, "ui-manifest.json")));
    return { manifest, uiManifest };
  });
}

export function entitlementSnapshot(
  bundleKeys: string[],
  override: Partial<EntitlementSnapshot> = {}
): EntitlementSnapshot {
  return {
    principal,
    revision: "test-revision-1",
    resolvedAt: "2026-09-08T18:00:00.000Z",
    assignments: bundleKeys.map((bundleKey) => ({
      bundleKey,
      status: "active" as const,
      startsAt: "2026-01-01T00:00:00.000Z"
    })),
    ...override
  };
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}
