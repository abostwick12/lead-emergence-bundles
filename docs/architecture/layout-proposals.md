# P22 — grounded approval-only layout proposals

Milestone: P22. Portable source branch: `codex2/bundle-platform-v1`.
Overall client shipment remains **NOT READY TO SHIP**.

## Product boundary

Workspace Experience can receive an immutable layout recommendation without
giving an assistant layout authority. The assistant first reads a capability-
filtered context, then proposes bounded operations against the exact layout and
access revisions. Only the native user can review, reject or accept the result.

The assistant context includes active navigation/widgets, their current visible,
pinned and order states, available starting routes, and only a count of dormant
choices. It excludes unavailable item identities, private domain bodies and any
layout-write credential.

## Grounding contract

Every operation targets one admitted item or starting route and carries a reason
plus one or more evidence bases. Assistant inference may be disclosed as an
additional basis, but cannot be the only basis. Valid grounding is limited to a
user-stated priority, the current layout and an enabled capability.

Operations may set visibility, pin state, order or the starting workspace. They
are canonical, bounded and unique. Applying them preserves dormant choices,
rejects inactive identifiers/routes and produces a normal Workspace Layout 1.0
document. Hiding remains presentation only and cannot revoke access, delete work
or stop notification state.

## Host obligations

A conforming host must:

- bind context and proposal creation to the current user, layout revision and
  entitlement revision;
- authorize assistant access through a current OAuth/MCP grant and current
  `workspace.personalize` capability;
- preserve unavailable layout choices without disclosing their identifiers;
- independently validate and apply every operation inside the database;
- store immutable proposal/request evidence with exact retry semantics;
- mark proposals stale after layout or access drift;
- expose proposal review and decision only to the direct native user;
- require preview plus explicit confirmation before acceptance persists layout;
- retain rejection/acceptance history without granting a model a decision tool;
  and
- keep the existing Home/Settings recovery paths available.

## Remaining release work

The Workspace integration branch now implements and locally verifies this
contract through real loopback OAuth/PKCE/MCP plus native desktop/mobile review.
That evidence does not prove installed-host discovery, automatic recommendation
quality, representative usefulness, hosted recovery, privacy/support operations
or payment enforcement. Those gates remain separate.
