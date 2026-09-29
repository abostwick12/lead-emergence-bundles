import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
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
    expect(portable.version).toBe("1.0.1");
    expect(compatibility.version).toBe("1.0.1");
    expect((bundle.identity as { key: string; version: string })).toEqual(expect.objectContaining({
      key: "sotf_transition", version: "1.0.1"
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
});
