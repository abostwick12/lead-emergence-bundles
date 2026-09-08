import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { bundleSlugs, loadArtifacts } from "./fixtures";

type Marketplace = {
  name: string;
  interface: { displayName: string };
  plugins: Array<{
    name: string;
    source: { source: string; path: string };
    policy: { installation: string; authentication: string };
    category: string;
  }>;
};

describe("OpenAI repo marketplace", () => {
  const root = process.cwd();
  const marketplace = JSON.parse(
    readFileSync(join(root, ".agents", "plugins", "marketplace.json"), "utf8")
  ) as Marketplace;

  it("uses the verified repo marketplace path and required metadata", () => {
    expect(marketplace.name).toBe("lead-emergence-bundles");
    expect(marketplace.interface.displayName).toBe("Lead Emergence Bundles");
    expect(marketplace.plugins).toHaveLength(6);
    for (const entry of marketplace.plugins) {
      expect(entry.source.source).toBe("local");
      expect(entry.source.path).toMatch(/^\.\/plugins\//);
      expect(entry.policy.installation).toBe("AVAILABLE");
      expect(entry.policy.authentication).toBe("ON_INSTALL");
      expect(entry.category).toBeTruthy();
    }
  });

  it("points every entry to a valid, matching skills-only plugin package", () => {
    for (const entry of marketplace.plugins) {
      const pluginRoot = join(root, entry.source.path);
      const plugin = JSON.parse(
        readFileSync(join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8")
      ) as {
        name: string;
        skills: string;
        apps?: unknown;
        mcpServers?: unknown;
        interface: { defaultPrompt: string[] };
      };
      expect(plugin.name).toBe(entry.name);
      expect(plugin.skills).toBe("./skills/");
      expect(plugin.apps).toBeUndefined();
      expect(plugin.mcpServers).toBeUndefined();
      expect(plugin.interface.defaultPrompt.length).toBeGreaterThan(0);
      expect(existsSync(join(pluginRoot, "skills"))).toBe(true);
    }
  });

  it("maps every product bundle to one marketplace plugin", () => {
    const pluginNames = new Set(marketplace.plugins.map((entry) => entry.name));
    for (const artifact of loadArtifacts()) {
      expect(pluginNames.has(artifact.manifest.distribution.pluginName)).toBe(true);
    }
    expect(bundleSlugs).toHaveLength(marketplace.plugins.length);
  });
});
