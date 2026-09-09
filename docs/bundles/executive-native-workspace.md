# Executive native coordination — implementation in progress

Updated 2026-09-09. **Not client-ready.**

The reusable source now defines five distinct records: commitments, decisions,
meeting plans, daily briefs and weekly reviews. Bundle version 0.2.0 uses the
unchanged Bundle Contract 1.0 and UI Manifest Contract 1.0. The declared native
routes are a host integration contract, not proof that those pages are available.

Native saves and proposal decisions require exact-record confirmation and the
current base revision. Source references hold capability, kind, identifier and
revision only. Cross-bundle task metadata sharing starts off; the host must
enforce direct-user selection, current source entitlement and per-request checks.
No manuscript, theological profile, research finding, patient record, personal
account, provider credential or external execution belongs in the metadata result.

Pure source logic prepares an unsaved, coverage-aware brief without copying
task titles or private bodies into durable text. It distinguishes changed
attention from access/coverage changes, and refuses no-change conclusions from
unavailable or truncated sources. Assistant changes retain inference labels;
new meeting-time proposals cannot retain a claim of existing agreement.

Scheduling computes candidate instants only from explicit, recently checked
availability, offered windows and busy intervals, with bounded buffers and a
named display zone. It neither reads an external calendar nor books a meeting.
The tests include the repeated hour at the daylight-saving fall transition.

## Proof so far

Seventeen Executive behavioral contract/analysis/scheduling tests pass alongside
the existing 47 source tests. They cover exact-save boundaries, stale-context
rejection, decision/completion evidence, source-kind matching, sharing scope,
inference preservation, coverage honesty, no booking claims and explicit time
arithmetic. A valid schema is not server authorization or live integration proof.

Workspace now implements the private persistence and source-permission foundation:
five record kinds; exact-revision native saves/proposal decisions; retained
originals; permission revisions; and a six-field, live-permission-checked source
reference projection. Seven real native authenticated RPC groups pass, including
four-domain private-text canaries, cross-client denial and source revocation.
All 27 migrations replayed freshly, and 488 PostgreSQL assertions across fourteen
suites pass (67 Executive). The source schemas and source-capability map match
the trusted SQL literals exactly. The existing 217 Workspace unit tests and
normal type/lint/boundary/build checks also pass.

Task attention aggregation, API/MCP wiring, editors, source controls, end-to-end
browser/connected permission tests and approved automation lifecycle still need
implementation and proof. The host still uses its P8 runtime export; the declared
Executive routes are not active UI. No installed-host, provider, hosted migration
or deployment proof is claimed by this source change.

The full six-bundle goal remains active. Executive must be integrated and tested,
then Workspace Experience, recovery and representative client-value acceptance
must be completed. All-six status remains NOT READY TO SHIP.
