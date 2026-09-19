# Native editor recovery contract

P15 defines one portable recovery boundary for the 16 native Ministry,
Nonprofit Founder, Investor and Executive record kinds. Writer retains its
specialized recovery contract. This repository defines data shape and policy;
the Workspace host owns identity, storage, canonical save dispatch and UI.

## Separation from canonical work

A recovery value contains bounded editor data plus narrowly admitted UI state.
Its relaxed shape keeps canonical object/array structure, enums and upper bounds
while permitting incomplete strings, dates, links and numeric entry. It is only
for protecting unfinished work. Canonical domain schemas remain the authority
for saved revisions, proposals, exports and assistant reads.

The only UI-only values are:

- Ministry profile unset intent;
- Executive meeting local-time selection that has not become an instant; and
- Executive meeting availability-planner state that has not been applied.

These fields are admitted only for their exact editor. Profile intent is rejected
for Ministry research/archive even when false. Pending meeting state cannot be
mistaken for a canonical meeting field.

## Operations

`save` carries schema version 1, the exact editor target, base revision, expected
draft version, request UUID and recovery values. `discard` carries no replacement
data. `commit` carries no client-supplied canonical replacement; it requires an
explicit true confirmation and lets the host atomically dispatch the protected
draft through the real domain save.

Targets contain domain, admitted kind and nullable document UUID. They never
contain owner, tenant, email, account, client ID or bearer identity. The host must
derive authority from a direct native session, deny OAuth/client credentials,
enforce current entitlement and keep drafts private.

Receipts identify request, operation, draft version and optional committed
document/revision. Snapshots include current/base revisions and optional values,
saved time and receipt. Response values are revalidated against their exact
editor shape.

## Required host invariants

- Separate private storage and RLS per domain; no direct public CRUD.
- Exact request hashing and idempotent replay; conflicting UUID reuse fails.
- Expected-version checks and per-target serialization for competing tabs.
- Source-revision recheck during commit.
- Canonical save and draft tombstone in one transaction.
- No assistant-readable recovery tool or use of recovery validation to authorize
  a canonical save.
- Explicit restore/discard/compare decisions and truthful failure feedback.

The current Workspace integration verifies these invariants with 265 database
assertions and optimized desktop/mobile browser acceptance. See
[client shipment readiness](../release/client-readiness.md) for evidence and the
remaining installed, representative, deployed, provider and commercial gates.
