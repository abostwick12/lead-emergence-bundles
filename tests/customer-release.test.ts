import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseBundleManifest } from "@lead-emergence/bundle-contract";
import { uiManifestSchema } from "@lead-emergence/ui-manifest";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const releaseIndex = JSON.parse(
  readFileSync(join(root, "releases", "customer.v1.json"), "utf8")
) as Record<string, unknown>;
const marketplace = JSON.parse(
  readFileSync(join(root, ".agents", "plugins", "marketplace.json"), "utf8")
) as {
  plugins: Array<{ name: string; source: { source: string; path: string } }>;
};

function validateBundlePath(path: string): string {
  expect(path).toMatch(/^\.\/bundles\/[a-z0-9-]+\/bundle\.json$/);
  const manifest = parseBundleManifest(JSON.parse(readFileSync(join(root, path), "utf8")));
  const uiPath = manifest.uiManifestPath;
  expect(uiPath).toMatch(/^\.\/bundles\/[a-z0-9-]+\/ui-manifest\.json$/);
  const ui = uiManifestSchema.parse(JSON.parse(readFileSync(join(root, uiPath), "utf8")));
  expect(ui.bundleKey).toBe(manifest.identity.key);

  expect(manifest.distribution.marketplacePath).toBe("./.agents/plugins/marketplace.json");
  const matches = marketplace.plugins.filter((entry) => entry.name === manifest.distribution.pluginName);
  expect(matches).toHaveLength(1);
  const entry = matches[0];
  expect(entry.source.source).toBe("local");
  expect(entry.source.path).toMatch(/^\.\/plugins\/[a-z0-9-]+$/);
  const plugin = JSON.parse(readFileSync(join(root, entry.source.path, "plugin.json"), "utf8")) as { name: string };
  expect(plugin.name).toBe(manifest.distribution.pluginName);
  for (const skill of manifest.skills) {
    expect(skill.path.startsWith(`${entry.source.path}/skills/`)).toBe(true);
    expect(existsSync(join(root, skill.path, "SKILL.md"))).toBe(true);
  }
  return manifest.identity.key;
}

describe("customer release index", () => {
  it("is a versioned, explicit allowlist for the customer channel", () => {
    expect(Object.keys(releaseIndex).sort()).toEqual(["approvedBundleManifests", "channel", "schemaVersion"]);
    expect(releaseIndex.schemaVersion).toBe("1.0");
    expect(releaseIndex.channel).toBe("customer");
    expect(Array.isArray(releaseIndex.approvedBundleManifests)).toBe(true);
    const paths = releaseIndex.approvedBundleManifests as string[];
    expect(new Set(paths).size).toBe(paths.length);
    const keys = paths.map(validateBundlePath);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("derives the package and skill paths from a manifest without a second plugin allowlist", () => {
    validateBundlePath("./bundles/writer-editor/bundle.json");
    expect(() => validateBundlePath("./bundles/missing/bundle.json")).toThrow();
  });
});
