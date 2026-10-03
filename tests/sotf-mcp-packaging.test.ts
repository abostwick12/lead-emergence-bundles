import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve, relative, isAbsolute } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const pluginRoot = join(root, "plugins", "lead-emergence-sotf");
const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;

describe("SOTF portable MCP package", () => {
  it("declares only the existing OAuth-protected Workspace streamable HTTP server", () => {
    const config = readJson(join(pluginRoot, "mcp.json"));
    expect(config).toEqual({
      $schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
      mcpServers: {
        lewis: {
          type: "streamable-http",
          url: "https://workspace.leademergence.com/api/mcp"
        }
      }
    });
    const endpoint = new URL((config.mcpServers as { lewis: { url: string } }).lewis.url);
    expect(endpoint.username).toBe("");
    expect(endpoint.password).toBe("");
    expect(endpoint.search).toBe("");
    expect(endpoint.hash).toBe("");
    expect(existsSync(join(pluginRoot, ".mcp.json"))).toBe(false);
    expect(existsSync(join(pluginRoot, ".app.json"))).toBe(false);
  });

  it("aligns the patch version and existing marketplace resolution", () => {
    const portable = readJson(join(pluginRoot, "plugin.json"));
    const compatibility = readJson(join(pluginRoot, ".codex-plugin", "plugin.json"));
    const bundle = readJson(join(root, "bundles", "sotf-transition", "bundle.json"));
    const marketplace = readJson(join(root, ".agents", "plugins", "marketplace.json"));
    const entries = (marketplace.plugins as Array<{ name: string; source: { path: string } }>);
    expect(portable.version).toBe("1.0.2");
    expect(compatibility.version).toBe("1.0.2");
    expect((bundle.identity as { key: string; version: string })).toEqual(expect.objectContaining({
      key: "sotf_transition", version: "1.0.2"
    }));
    expect(entries.filter((entry) => entry.name === portable.name)).toEqual([{
      name: "lead-emergence-sotf",
      source: { source: "local", path: "./plugins/lead-emergence-sotf" },
      policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
      category: "Productivity"
    }]);
    for (const entry of entries.filter((entry) => entry.name !== "lead-emergence-sotf")) {
      expect(existsSync(join(root, entry.source.path, "mcp.json"))).toBe(false);
    }
  });

  it("ships every linked workflow reference inside the existing skill package", () => {
    const skillRoot = join(pluginRoot, "skills", "sotf-transition-loop");
    const skill = readFileSync(join(skillRoot, "SKILL.md"), "utf8");
    const links = [...skill.matchAll(/\]\((references\/[^)]+)\)/g)].map((match) => match[1]);
    const files = readdirSync(join(skillRoot, "references")).filter((name) => name.endsWith(".md"));
    expect(links.length).toBeGreaterThan(0);
    expect(new Set(links)).toEqual(new Set(files.map((name) => `references/${name}`)));
    for (const link of links) {
      const target = resolve(skillRoot, link);
      const withinSkill = relative(skillRoot, target);
      expect(isAbsolute(withinSkill) || withinSkill.startsWith("..")).toBe(false);
      expect(readFileSync(target, "utf8").trim().length).toBeGreaterThan(0);
    }
  });
});
