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

## Open installed-host gates

Before client shipment, use the published feature ref in a controlled
non-client ChatGPT/Codex account and record:

1. GitHub marketplace import at the exact commit and successful catalog sync.
2. Installation and new-session discovery for all six packages.
3. Positive, negative and edge-case prompt selection for each focused skill.
4. Confirmation that installation grants no Workspace entitlement or provider
   connection and cannot bypass direct-user approval.
5. Package update, removal and post-removal non-discovery without residual
   access.
6. A final metadata and screenshot review on each intended client surface.

These tests require an installed host and, where applicable, an approved test
account. They are not established by source validation. Public-directory
submission remains prohibited until separately authorized.
