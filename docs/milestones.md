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
and an assistant proposal tool. It does not connect or mutate Wix. Representative
full-library quality, link verification, read-only Wix evidence, client testing
and real installed-host/provider acceptance remain open.
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
