# Executive native coordination — implementation in progress

Updated 2026-09-09. **Not client-ready.** P9b now has real Workspace pages and
connected tools; this does not close the full Executive or six-bundle goal.

The reusable source defines five distinct records: commitments, decisions,
meeting plans, daily briefs and weekly reviews. Bundle version 0.2.0 retains
Bundle Contract 1.0 and UI Manifest Contract 1.0. Workspace imports a pinned,
26-file allowlist at ff7d7c29a1e856818d828f6fa821718642463c20 and registers
Executive in its entitlement-based composer and MCP server.

## Implemented source and host

Native saves and proposal decisions require exact-record confirmation and the
current base revision. Source references hold capability, kind, identifier and
revision only. Cross-bundle metadata sharing starts off; the native source page
requires an explicit current selection and explains that titles can be sensitive.
Live server checks require source sharing and current source entitlement.
No manuscript, theological profile, research finding, patient record, personal
account or provider credential belongs in the metadata projection.

Pure source logic prepares an unsaved, coverage-aware brief without copying
task titles or private bodies into durable text. It distinguishes changed
attention from access changes and refuses no-change conclusions from unavailable
or truncated sources. Assistant changes retain inference labels through native
approval. Native pages add five focused editors, revision/proposal review,
original recovery, saved-only handoffs and explicit changed/unavailable links.

Workspace's read-only attention projection has thirteen coverage states, exact
matching counts and at most fifty priority-ordered cues. It reads parent-record
metadata only. The picker currently exposes this first page, not complete source
search. Weekly preparation explicitly does not claim a complete historical
account. Nested tasks, milestones, catalysts and actual full-period outcomes
remain implementation work.

The 17 Executive MCP tools comprise five sets of list/get/propose plus attention
and reference resolution. Only the five proposal tools write. Native canonical
save, approval/history, source-sharing changes and external execution are not
assistant tools. Tool annotations never replace per-invocation authorization.

Scheduling source logic computes candidate instants only from explicit, recently
checked availability, offered windows and busy intervals, with bounded buffers
and a named display zone. It neither reads calendars nor books meetings. Native
meeting-time entry handles nonexistent/repeated local hours and clears reported
agreement after timing or participant edits, but the full availability workflow
is still absent. No recurring scheduler or notification worker is active.

## Evidence and release boundary

Seventeen Executive behavioral source cases pass alongside the existing 47
tests. Five generated base schemas and ten source definitions match trusted SQL.
Workspace now exercises actual native HTTP, local OAuth/PKCE and HTTP MCP,
including four-domain private-text canaries, source withdrawal, live source
revocation, capability removal and disconnect. Desktop/mobile browser journeys
cover failed saves, confirmation reset, ambiguity, evidence, original recovery
and proposal conflicts.

Use Workspace docs/testing/test-evidence.md for final P9b counts and the complete
regression receipt; docs/architecture/executive-native-workspace.md explains
scope and docs/runbooks/executive-local-proof.md makes it reproducible. These are
fictional-account local checks, not installed-host or representative client proof.

Remaining: nested attention and complete source discovery; full weekly outcomes;
availability scheduling UI; approved recurring work and meaningful-change
notifications; shared Workspace Experience and crash/autosave recovery; installed
host, representative utility, deployed privacy/retention and commercial gates.
All six remain NOT READY TO SHIP. No hosted migration, deployment, installed
plugin change, client/provider connection or marketplace submission is implied.
