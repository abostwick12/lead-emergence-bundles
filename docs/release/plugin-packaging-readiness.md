# Plugin packaging readiness

Checkpoint: 2026-09-11

## Outcome

All six Lead Emergence distribution adapters are portable skills-only Agent
Plugins packages. Each package contains:

- canonical root `plugin.json` using the Agent Plugins 1.0.0 schema;
- one fixed-root `skills/` directory;
- OpenAI install-surface metadata under `extensions.com.openai.interface`; and
- a matching `.codex-plugin/plugin.json` compatibility fallback.

The package version is 0.2.0. This version identifies the packaging migration;
it is independent from the version of each product bundle's functional
contract.

## Truthful boundary

No package contains `mcp.json`, legacy `.mcp.json` or `.app.json`. The packages
therefore do not claim a bundled MCP server, a registered OpenAI app, provider
authorization, background execution or Workspace entitlement. Installation is
only distribution of a focused skill. Workspace identity, authorization,
entitlements and direct-user confirmation remain server-enforced boundaries.

The repository marketplace remains an authoring and team-distribution catalog.
It is not a universal-directory publication, paid entitlement mechanism or
client installation record.

## Automated acceptance

- All six compatibility packages pass the bundled plugin validator.
- Every marketplace entry resolves to one portable package and one fallback.
- Canonical and fallback identity, version, discovery metadata and OpenAI
  interface metadata match exactly.
- Portable root keys and names satisfy the published 1.0.0 schema constraints.
- Every package supplies starter prompts and a root skill directory.
- Tests reject accidental MCP, legacy MCP or registered-app declarations.
- Repository typecheck and all 231 tests in 23 files pass.

## Codex installed-host acceptance

Codex CLI 0.153.4 was used with a non-client local account and Sol on
2026-09-11. The controlled lifecycle produced these results:

1. The public `abostwick12/lead-emergence-bundles` marketplace imported from
   ref `codex2/bundle-platform-v1` using sparse `.agents/plugins` and `plugins`
   paths.
2. Codex discovered six marketplace entries and installed each as enabled at
   version 0.2.0.
3. Each installed cache contained exactly three files and matched the Git
   marketplace snapshot by relative path and SHA-256 hash.
4. A fresh ephemeral Sol session exposed all six exact package-qualified skill
   names.
5. A read-only routing evaluation loaded all six installed `SKILL.md` files,
   routed six fictional domain requests to the expected skills and routed an
   unrelated translation request to no Lead Emergence plugin skill.
6. A no-change GitHub refresh completed without error and retained all six
   enabled packages at 0.2.0.
7. All six packages and the marketplace were removed. The command left one
   empty marketplace cache root; it was verified empty and removed explicitly.
   Existing core plugins remained enabled.
8. A final fresh ephemeral Sol session exposed zero removed package-qualified
   skills.

The six packages do not declare MCP. During the first two fresh-host sessions,
a separately configured Lead Emergence Workspace MCP attempted an unauthenticated
startup handshake and received an authentication-required response. No account
was authorized and no bundle tool was called. The final removal session disabled
both separately configured remote Lead Emergence MCP entries explicitly and made
no handshake. This observation is host configuration evidence, not a capability
of the six packages.

## Open release gates

Before client shipment, use the published feature ref in a controlled
non-client environment and record:

1. ChatGPT plugin-directory installation, presentation and new-chat discovery.
2. A GitHub refresh that adopts a deliberately changed package version, followed
   by verified cache replacement and rollback/removal.
3. Representative end-to-end output-quality and safety evaluation for every
   bundle, not only routing classification.
4. Confirmation in each intended surface that installation grants neither
   Workspace entitlement nor a provider connection and cannot bypass
   direct-user approval.
5. A final metadata and screenshot review on each intended client surface.

These tests require an installed host and, where applicable, an approved test
account. They are not established by source validation. Public-directory
submission remains prohibited until separately authorized.
