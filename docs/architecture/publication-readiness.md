# P21 — publication readiness and link-evidence contract

Milestone: P21. Portable source branch: `codex2/bundle-platform-v1`.
Overall client shipment remains **NOT READY TO SHIP**.

## Product boundary

The Writer & Editor bundle now defines a provider-neutral publication queue for
one exact saved resource revision. Queue state is not website state. The
portable contract uses `ready_for_handoff` and `handed_off`, never treats an
export as a publication, and does not call Wix or any other provider.

Readiness is derived from current blockers. A caller cannot make
`readyForHandoff` true independently of the evidence returned with the item.
The queue carries the bound resource revision, current resource revision,
destination, human-review confirmations, pending-proposal count, latest link
observation, evidence status and complete current blocker list.

## Destination and evidence safety

Publication destinations are normalized without contacting them. They must be
public-looking HTTPS DNS names with no credentials or custom port. IP literals,
single-label hosts and reserved private/local suffixes are rejected. This
contract is deliberately not an SSRF-capable URL fetcher.

Link evidence records what an authenticated user observed after opening the
destination themselves. It distinguishes working, redirected, broken and
access-limited outcomes. Redirect evidence must record the final public HTTPS
destination. Evidence becomes stale after 30 days and whenever the bound
resource revision or destination no longer matches. `unchecked`, `checked`,
`stale` and `error` are explicit states; a recorded URL alone is never
verification.

## Host obligations

A conforming host must:

- derive workspace and actor identity from current authorization;
- deny native queue reads and writes to assistants and OAuth clients;
- apply exact-version concurrency and immutable request identities;
- preserve queue decisions and link observations as an audit history;
- require direct confirmation for queue changes and link observations;
- reset human confirmations when rebasing to a newer resource revision;
- calculate blockers again inside any transition to ready or handed off;
- keep queue status separate from canonical resource and provider state; and
- never fetch or publish to the recorded destination as part of this workflow.

The review confirmations cover accuracy/quotations, author voice and rights.
They are user attestations, not automated certification. A host must also block
handoff readiness for stale revisions, unresolved proposals, uncertain source
evidence, missing publication fields, missing destination, and absent, stale or
failed link evidence.

## Remaining release work

This contract does not prove a host implementation, real client link quality,
Wix read access, publication permissions, installed-host behavior, hosted
privacy/recovery, representative value or commercial readiness. Those gates
remain separate and must not be inferred from schema validation.
