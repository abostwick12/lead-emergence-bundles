import { existsSync, readFileSync, readdirSync } from "node:fs";
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

type PluginInterface = {
  displayName: string;
  category: string;
  defaultPrompt: string[];
};

type PortablePlugin = {
  $schema: string;
  name: string;
  version: string;
  description: string;
  author: { name: string; url: string };
  homepage: string;
  repository: string;
  keywords: string[];
  skills?: unknown;
  apps?: unknown;
  mcpServers?: unknown;
  extensions: { "com.openai": { interface: PluginInterface } };
};

type CompatibilityPlugin = {
  name: string;
  version: string;
  description: string;
  author: { name: string; url: string };
  homepage: string;
  repository: string;
  keywords: string[];
  skills: string;
  apps?: unknown;
  mcpServers?: unknown;
  interface: PluginInterface;
};

describe("OpenAI repo marketplace", () => {
  const root = process.cwd();
  const maximumInstalledSkillBytes = 7_500;
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

  it("points every entry to a portable skills-only package with an exact compatibility fallback", () => {
    for (const entry of marketplace.plugins) {
      const pluginRoot = join(root, entry.source.path);
      const portable = JSON.parse(
        readFileSync(join(pluginRoot, "plugin.json"), "utf8")
      ) as PortablePlugin;
      const compatibility = JSON.parse(
        readFileSync(join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8")
      ) as CompatibilityPlugin;

      expect(portable.$schema).toBe(
        "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"
      );
      expect(Object.keys(portable).sort()).toEqual([
        "$schema",
        "author",
        "description",
        "extensions",
        "homepage",
        "keywords",
        "name",
        "repository",
        "version"
      ]);
      expect(Object.keys(portable.author).sort()).toEqual(["name", "url"]);
      expect(portable.name).toBe(entry.name);
      expect(portable.name.length).toBeLessThanOrEqual(64);
      expect(portable.name).toMatch(/^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/);
      expect(portable.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(portable.description.length).toBeGreaterThan(0);
      expect(portable.keywords.length).toBeGreaterThan(0);
      expect(portable.extensions["com.openai"].interface.category).toBe(entry.category);
      expect(portable.extensions["com.openai"].interface.defaultPrompt.length).toBeGreaterThan(0);
      expect(portable.skills).toBeUndefined();
      expect(portable.apps).toBeUndefined();
      expect(portable.mcpServers).toBeUndefined();

      expect({
        name: compatibility.name,
        version: compatibility.version,
        description: compatibility.description,
        author: compatibility.author,
        homepage: compatibility.homepage,
        repository: compatibility.repository,
        keywords: compatibility.keywords,
        interface: compatibility.interface
      }).toEqual({
        name: portable.name,
        version: portable.version,
        description: portable.description,
        author: portable.author,
        homepage: portable.homepage,
        repository: portable.repository,
        keywords: portable.keywords,
        interface: portable.extensions["com.openai"].interface
      });
      expect(compatibility.skills).toBe("./skills/");
      expect(compatibility.apps).toBeUndefined();
      expect(compatibility.mcpServers).toBeUndefined();
      expect(existsSync(join(pluginRoot, "skills"))).toBe(true);
      expect(existsSync(join(pluginRoot, "mcp.json"))).toBe(false);
      expect(existsSync(join(pluginRoot, ".mcp.json"))).toBe(false);
      expect(existsSync(join(pluginRoot, ".app.json"))).toBe(false);
    }
  });

  it("maps every product bundle to one marketplace plugin", () => {
    const pluginNames = new Set(marketplace.plugins.map((entry) => entry.name));
    for (const artifact of loadArtifacts()) {
      expect(pluginNames.has(artifact.manifest.distribution.pluginName)).toBe(true);
    }
    expect(bundleSlugs).toHaveLength(marketplace.plugins.length);
  });

  it("keeps installed skill entrypoints below the observed host truncation boundary", () => {
    for (const entry of marketplace.plugins) {
      const skillsRoot = join(root, entry.source.path, "skills");
      const skillDirectories = readdirSync(skillsRoot, { withFileTypes: true })
        .filter(item => item.isDirectory());
      expect(skillDirectories).toHaveLength(1);
      const skill = readFileSync(join(skillsRoot, skillDirectories[0].name, "SKILL.md"));
      expect(skill.byteLength, `${entry.name} should use references before its entrypoint reaches the installed-host limit`)
        .toBeLessThanOrEqual(maximumInstalledSkillBytes);
    }
  });
});
