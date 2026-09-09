# Current OpenAI plugin platform findings

Retrieved: **2026-09-08**

This record uses current official OpenAI documentation. It replaces historical
ChatGPT plugin assumptions for this repository.

| Official documentation | Important architectural requirement |
| --- | --- |
| [Plugin architecture](https://developers.openai.com/plugins/concepts/plugins) | A plugin is the installable package shared by ChatGPT and Codex. It may contain skills, an MCP server, or both; MCP may return optional UI. Start with the smallest useful shape. |
| [Package your plugin](https://developers.openai.com/plugins/build/plugins) | Every plugin requires .codex-plugin/plugin.json. Skills live at the plugin root under skills/; .app.json, .mcp.json, assets, and hooks are optional root-level companions. |
| [Marketplace metadata](https://developers.openai.com/plugins/build/plugins#marketplace-metadata) | A repo marketplace lives at .agents/plugins/marketplace.json. Local source.path values are ./-prefixed and resolved from the marketplace root. Each local entry includes installation policy, authentication policy, and category. |
| [Build skills](https://developers.openai.com/plugins/build/skills) | Each skill requires SKILL.md; workflow boundaries must define expected input, steps, output, non-inferences, and stopping behavior. |
| [Authentication](https://developers.openai.com/plugins/build/auth) | Customer-specific data and write actions authenticate. MCP authorization uses protected-resource metadata, an authorization server, authorization code + PKCE with S256, audience validation, scopes, and runtime authentication challenges. |
| [Connect and test](https://developers.openai.com/plugins/deploy/connect-chatgpt) | Test declared schemas, auth failures, positive and negative tool selection, optional UI, and a representative evaluation set. Metadata changes require refresh and a new conversation. |
| [Security and privacy](https://developers.openai.com/plugins/guides/security-privacy) | Apply least privilege, explicit consent for linking and writes, prompt-injection defenses, auditability, data minimization, and PII-safe logs. |
| [Submit plugins](https://developers.openai.com/plugins/deploy/submission) | Public release goes through the OpenAI Platform review flow. Submission may include skills, MCP, UI, starter prompts, test cases, regions, and attestations. This repository is not authorized for public submission. |
| [Plugins in ChatGPT and Codex](https://learn.chatgpt.com/docs/plugins) | ChatGPT and Codex use one universal plugin directory on supported surfaces. New sessions are required after installation in Codex CLI; the IDE extension does not support plugins. |
| [Build plugins](https://learn.chatgpt.com/docs/build-plugins) | Local marketplaces are the supported authoring/test path before universal-directory publication. |
| [GitHub plugin management](https://learn.chatgpt.com/docs/enterprise/plugin-management) | Workspace admins can import public or private GitHub marketplace repositories and sync them. .agents/plugins/marketplace.json is supported at the selected root or path. Workspace admins configure access and required apps; import does not grant app access or connect accounts. |

## Confirmed decisions

1. .agents/plugins/marketplace.json is the correct private-beta repository
   source and is implemented here.
2. Official plugin packages live under plugins/, matching current repo
   marketplace conventions. Product bundle definitions remain under bundles/;
   plugin packaging is an adapter, not the product contract.
3. P1 plugins are skills-only. No .app.json or .mcp.json is declared until a
   registered app or a working MCP server actually exists. This avoids false
   provider claims and the desktop-only behavior associated with bundled MCP
   configuration in GitHub-imported plugins.
4. The Lead Emergence Workspace remains the primary application UI. Bundle UI
   manifests in this repo describe that product's navigation and experiences;
   they do not attempt to alter ChatGPT or Codex native navigation.
5. One shared Workspace MCP can later expose entitlement-filtered tools to both
   ChatGPT and Codex. Separate bundle plugins supply focused skills and
   distribution metadata; they do not become independent authorization
   authorities.
6. Public plugin submission and universal-directory publication remain out of
   scope until explicitly authorized.

## Authentication implications

- Plugin installation does not grant a Lead Emergence entitlement.
- A valid OpenAI-side plugin or app connection does not grant Workspace record
  access.
- The runtime maps the verified token subject to a tenant and workspace
  server-side, resolves active bundle entitlements, and only then advertises or
  invokes capabilities.
- Provider OAuth remains separate from Lead Emergence identity. Revoked,
  expired, wrong-subject, wrong-audience, or insufficient-scope connections
  fail closed.
- Read-only and propose operations are distinct from execute operations.
  Execution requires a current operation-specific user approval.

## Open questions deferred to the relevant milestone

- The registered OpenAI app ID for the production Workspace MCP.
- Whether the official Wix integration supports the required read and later
  approval-backed mutation operations.
- Which verified Logos Desktop automation surface, if any, justifies an
  optional local companion.
- Whether the optional Finances plugin exposes a suitably scoped personal
  portfolio context. General investment research cannot depend on it.
# P2 authentication verification — 2026-09-08

Rechecked [plugin authentication](https://developers.openai.com/plugins/build/auth)
and [MCP server guidance](https://developers.openai.com/plugins/build/mcp-server).
The Workspace integration retains OAuth discovery, authorization-code/PKCE,
per-request token/entitlement verification, explicit tool schemas, and truthful
read-only annotations. Real local OAuth and HTTP MCP tests pass; an installed
ChatGPT/Codex host connection is not yet validated. No app identifier or
undeployed server was fabricated in the plugin manifest.

## Ministry native/connected implementation — 2026-09-08

Rechecked [MCP server guidance](https://developers.openai.com/plugins/build/mcp-server).
Six focused Ministry tools use strict inputs and outputs with explicit private
read/proposal semantics. Only the proposal tool is marked as a write. Tool
annotations are descriptive, not authorization: every invocation uses current
server-derived ownership and capability checks. Current theological context may
be read by an authorized assistant; confirmation, history and final proposal
approval remain direct-user operations enforced in the database.

Real loopback registration, consent, PKCE and HTTP MCP/native parity are proven
locally. This is not an installed-host test or marketplace release. The plugin
remains a skill adapter; no invented app ID, provider connection or deployable
MCP endpoint was added to its package.
