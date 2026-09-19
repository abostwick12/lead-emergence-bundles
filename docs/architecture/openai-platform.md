# Current OpenAI plugin platform findings

Retrieved: **2026-09-11**

This record uses current official OpenAI documentation. It replaces historical
ChatGPT plugin assumptions for this repository.

| Official documentation | Important architectural requirement |
| --- | --- |
| [Plugin architecture](https://developers.openai.com/plugins/concepts/plugins) | A plugin is the installable package shared by ChatGPT and Codex. It may contain skills, an MCP server, or both; MCP may return optional UI. Start with the smallest useful shape. |
| [Package your plugin](https://developers.openai.com/plugins/build/plugins) | A new portable plugin requires root `plugin.json` with the Agent Plugins schema. Portable skills are discovered at `skills/`, portable MCP configuration uses root `mcp.json`, and OpenAI presentation settings belong under `extensions.com.openai`. `.codex-plugin/plugin.json` remains an optional compatibility fallback. |
| [Marketplace metadata](https://developers.openai.com/plugins/build/plugins#build-your-own-curated-plugin-list) | A repo marketplace lives at `.agents/plugins/marketplace.json`. Local `source.path` values are `./`-prefixed and resolved from the marketplace root. Git-backed marketplaces can be added, pinned to a ref, sparsely checked out, upgraded and removed through the Codex plugin commands. |
| [Build skills](https://developers.openai.com/plugins/build/skills) | Each skill requires SKILL.md; workflow boundaries must define expected input, steps, output, non-inferences, and stopping behavior. |
| [Authentication](https://developers.openai.com/plugins/build/auth) | Customer-specific data and write actions authenticate. MCP authorization uses protected-resource metadata, an authorization server, authorization code + PKCE with S256, audience validation, scopes, and runtime authentication challenges. |
| [Connect and test](https://developers.openai.com/plugins/deploy/connect-chatgpt) | Test each skill, tool, UI and auth boundary before package installation, then repeat representative positive, negative and edge-case prompts in a newly installed host session. Local MCP testing needs a reachable HTTPS endpoint or the Secure MCP Tunnel. |
| [Security and privacy](https://developers.openai.com/plugins/guides/security-privacy) | Apply least privilege, explicit consent for linking and writes, prompt-injection defenses, auditability, data minimization, and PII-safe logs. |
| [Submit plugins](https://developers.openai.com/plugins/deploy/submission) | Public release goes through the OpenAI Platform review flow. Submission may include skills, MCP, UI, starter prompts, test cases, regions, and attestations. This repository is not authorized for public submission. |
| [Plugins in ChatGPT and Codex](https://learn.chatgpt.com/docs/plugins) | ChatGPT and Codex use one universal plugin directory on supported surfaces. New sessions are required after installation in Codex CLI; the IDE extension does not support plugins. |
| [Build plugins](https://learn.chatgpt.com/docs/build-plugins) | Local marketplaces are the supported authoring/test path before universal-directory publication. |
| [GitHub plugin management](https://learn.chatgpt.com/docs/enterprise/plugin-management) | Workspace admins can import public or private GitHub marketplace repositories and sync them. .agents/plugins/marketplace.json is supported at the selected root or path. Workspace admins configure access and required apps; import does not grant app access or connect accounts. |

## P12 native attention boundary — retrieved 2026-09-09

Rechecked [official authentication guidance](https://developers.openai.com/plugins/build/auth).
Servers must validate token signature, issuer, audience, expiry and scopes;
installation and declared metadata are not authorization. P12 keeps shared
attention native-only, with actual OAuth denial at HTTP and database boundaries.
No OpenAI protocol, model runtime, package connection or installed-host claim changes.

## Confirmed decisions

1. `.agents/plugins/marketplace.json` remains the repository marketplace source
   and is implemented here. It is separate from universal-directory publication.
2. Official plugin packages live under plugins/, matching current repo
   marketplace conventions. Product bundle definitions remain under bundles/;
   plugin packaging is an adapter, not the product contract.
3. The six version 0.2.0 packages are portable skills-only plugins. Their root
   `plugin.json` manifests are canonical and their `.codex-plugin/plugin.json`
   manifests preserve compatibility with current Codex scaffolds. Identity,
   release metadata and OpenAI interface metadata must remain exactly aligned.
4. No `.app.json`, `mcp.json` or legacy `.mcp.json` is declared until a
   registered app or a working MCP server actually exists. This avoids false
   provider and installed-runtime claims.
5. The Lead Emergence Workspace remains the primary application UI. Bundle UI
   manifests in this repo describe that product's navigation and experiences;
   they do not attempt to alter ChatGPT or Codex native navigation.
6. One shared Workspace MCP can later expose entitlement-filtered tools to both
   ChatGPT and Codex. Separate bundle plugins supply focused skills and
   distribution metadata; they do not become independent authorization
   authorities.
7. Public plugin submission and universal-directory publication remain out of
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

## Nonprofit tool contract review — 2026-09-08

Rechecked [official MCP server guidance](https://developers.openai.com/plugins/build/mcp-server).
Focused list, read and proposal tools will use explicit bounded schemas and
per-request server authorization. Read-only/private-workspace annotations must
describe actual behavior; they do not replace authorization or native approval.
Research source recording does not itself browse the internet. The skill may
use separately available public research tools without sending private records.
No new plugin app identifier, installed-plugin change or public submission is
part of this native implementation. The missing build-chatgpt-app skill remains
covered by official documentation and available authoring/validation guidance.

## Investor native tool review — 2026-09-08

Rechecked [official MCP server guidance](https://developers.openai.com/plugins/build/mcp-server).
The Investor contract separates private list/read/propose tools from a bounded
public SEC lookup. The public lookup needs truthful open-world metadata and
shared rate control; private research tools do not browse sources implicitly.
Every operation retains server-side identity/capability checks. Native approval
cannot silently upgrade assistant-extracted facts or changed source evidence.
No marketplace identity, registered app ID or installed plugin is fabricated.

The resulting Investor implementation exercises actual loopback registration,
consent, PKCE and fourteen HTTP MCP tools. Four tools propose private records;
canonical save, approval/rejection and private history remain native-only.
Changed source evidence demotes dependent confirmations; exact retries normalize
against the immutable base. The one public reader has explicit open-world
metadata, fixed destinations, current access checks and shared request budgets.
One real SEC request was declined; no live-provider success or installed-host
proof is claimed. See the Investor native contract and client-readiness ledger.

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

## Executive implementation in progress — 2026-09-09

Rechecked [MCP server guidance](https://developers.openai.com/plugins/build/mcp-server).
Executive source contracts preserve focused record operations, strict inputs and
outputs, descriptive safety metadata and server-enforced authorization. Native
source-sharing consent is distinct from source entitlement and from canonical
record confirmation. A task-metadata projection must not return full domain
content. Scheduling from explicit availability does not imply a calendar read
or booking. The revised skill distinguishes missing tools, unsaved drafts,
proposals and actual execution. P9a proves native database operations locally;
app HTTP/MCP and installed-host proof remain pending;
no package app ID, marketplace update, install or provider connection was added.

## Executive connected implementation — 2026-09-09

P9b applies the [official MCP server guidance](https://developers.openai.com/plugins/build/mcp-server)
to seventeen focused Executive tools: five list/get/propose groups and two
metadata-only coordination reads. Five proposal tools are the only writes;
none can grant source sharing, approve canonical work, book or send anything.
Strict bounded schemas and truthful private/read-only annotations accompany
live authorization in every handler. Annotations do not grant authority.

Actual local OAuth consent, PKCE and HTTP MCP pass against fictional accounts,
including source withdrawal, current-entitlement revocation and disconnect.
Native approval preserves inference labels. Installed ChatGPT/Codex discovery,
tool selection and update/removal are separate, still-unproven release gates.
No new OpenAI app ID, package install, provider connection or submission was
invented to stand in for those tests. No OpenAI model API runtime was added.

## P13 connection evidence — 2026-09-09

[Authentication guidance](https://developers.openai.com/plugins/build/auth)
requires current runtime authorization rather than trusting tool metadata.
The native center independently distinguishes active Workspace grants, completed
registration, plan/admission blocks and revoked access. It exposes no tokens.

[Connection/testing guidance](https://developers.openai.com/plugins/deploy/connect-chatgpt)
separates local MCP success from complete installed-plugin acceptance. Setup now
uses the current Developer Mode/Plugins instructions, writes only after a user's
explicit preparation action, and never treats a stored label as installation proof.
Sources checked 2026-09-09. No new app ID, host installation or submission occurred.
