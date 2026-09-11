# Milestone plan

## P0 — Platform discovery

Complete in this branch: official OpenAI findings, Workspace read-only
inspection, architecture, security model, provider strategy, ADRs, and plan.

## P1 — Bundle platform skeleton

Implemented in this branch: marketplace, six plugin shells, versioned contracts,
registries, runtime composition, provenance/policy/provider primitives, and
hostile tests.

## P2 — Workspace Experience + Writer proof

Create a conflict-free Workspace integration branch after a fresh ownership
check. Prove Writer navigation/widget/tool entitlement parity for User A vs
User B, removal without deployment, and cross-tenant denial.

Local implementation and real loopback OAuth/MCP integration are now validated
on the isolated Workspace branch. The Writer skill routes to those read-only
tools when connected. Installed ChatGPT/Codex host acceptance and the approved
preview/consent integration remain open; see
[the P2 handoff](architecture/workspace-p2-handoff.md).

## P3 — Wix resource workflow

Add canonical resource inventory, taxonomy, metadata, duplicates, link checks,
and publishing queue. Validate read-only Wix operations before any
preview-and-approval mutation path.

The P3 native foundation is now implemented and locally validated in Workspace:
bounded review-first text/Markdown/Word/text-PDF intake; resumable 20-item
library staging with isolated file failures, editable type/source metadata,
exact duplicate warnings and confirmed atomic import; canonical metadata;
immutable proposals; native-only approval; source-preserving revision history;
an assistant proposal tool; and a provider-neutral readiness queue with exact-
revision human review, user-observed public-link evidence, explicit blockers and
an honest handoff record. It does not fetch a destination, publish, connect to or
mutate Wix. Representative full-library quality, real-site link quality,
authorized read-only Wix evidence, client testing and installed-host/provider
acceptance remain open.
Track all six bundles in [client shipment readiness](release/client-readiness.md).

## P4 — Ministry

Add theological profile configuration and source-layered research. Prototype
the optional Logos companion independently and only for verified operations.

## P5 — Nonprofit Founder

Add generic founder operations and source-first regulatory research. Configure
the first counseling initiative without clinical records, diagnosis, therapy,
treatment, risk assessment, or default PHI ingestion.

## P6 — Investor

Add lawful public-market intelligence and thesis tracking. Keep optional
portfolio context separate and never execute trades.

## P7 — Executive orchestration and automations

Add daily/weekly review, scoped attention aggregation, supported schedules, and
meaningful-change notification rules.

## P8 — Productization

Validate installation, GitHub sync, assignments/removal, provider authorization,
Workspace/ChatGPT/Codex parity, security, observability, and public-readiness.
Do not submit publicly without authorization.

The provider-free Workspace product surface now includes grounded, immutable
assistant layout recommendations. The connected assistant sees only the active
catalog and exact revisions, while the direct native user alone previews,
accepts, rejects or saves. Installed-host, hosted operations, representative
value and commercial enforcement remain the P8 release gates.

The first productization slice upgrades all six skills-only adapters to the
portable Agent Plugins 1.0.0 package shape. Root `plugin.json` manifests are
canonical, `.codex-plugin/plugin.json` remains as a compatibility fallback, and
tests require exact identity/version/interface parity. No MCP, registered-app or
provider file is claimed. Package structure and the repo marketplace validate
locally; installed ChatGPT/Codex behavior and GitHub-source refresh/removal are
still separate P8 acceptance gates. See
[plugin packaging readiness](release/plugin-packaging-readiness.md).
