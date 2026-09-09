# Nonprofit Founder native workspace — implementation contract

The 0.2.0 contract adds four independently authorized record kinds: founder
roadmaps, administrative partnerships, meetings, and source-first research.
These are reusable product types, not a counseling-center product.

New and revised records can be proposed without becoming canonical data.
Native user review is required for approval. Every save binds to an exact
revision; immutable history preserves originals. Research distinguishes
recorded authority findings from interpretation, uncertainty, required action
and recommended professional review. Approval does not turn an assistant's
inference into a verified fact.

A roadmap can sequence formation, governance, volunteers, partnerships, funding
and launch milestones. Dependencies must be internal and acyclic. Administrative
partnership roles cover partners, volunteers, donors, grantmakers and board
contacts. Meetings preserve a date, local time and time zone, decisions and owned
actions. Neither meeting records nor outreach drafts perform external actions.

The attention contract reports its as-of date and only capability-admitted work.
It exposes meaningful unfinished milestones, due follow-ups, meetings/actions
and research review gaps, with reasons, owners, dates and saved-record evidence.

## Clinical boundary

There are no clinical record types, patient identifiers, treatment plans,
diagnoses or clinical risk workflows. Unknown fields are rejected; native saves
require an administrative-only confirmation. Free text is not a PHI detector.
Users must exclude substantive patient information; the skill stops and requests
a nonclinical administrative version if sensitive clinical information is supplied.
No public search receives private operational content by default.

## Implementation/acceptance status

- Reusable domain schema and structural/hostile contract tests: implemented.
- Source plugin skill: updated to the intended native tool contract.
- Native persistence, API, MCP and UI: in implementation on the separate
  Workspace-owned integration branch, not released or client-ready.
- Real isolated OAuth, cross-client/domain, revocation, concurrency and browser
  acceptance: required before marking the native slice validated.
- Installed ChatGPT/Codex, hosted migration, representative client first-use,
  live public-source research and external provider workflows: not yet validated.
- Twelve-minute first value is a design target, not a measured result.

No hosted migration, provider connection, public submission or clinical system
is authorized or implied by these artifacts.
