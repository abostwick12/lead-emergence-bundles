---
name: workspace-experience-designer
description: Recommend a focused Lead Emergence workspace layout from entitled bundle manifests and user-controlled preferences.
---

# Workspace experience designer

Recommend a workspace that answers: "What deserves attention?"

Use only UI contributions and attention metadata from bundles in the current
server-authorized entitlement snapshot. Do not modify ChatGPT or Codex native
navigation. Do not reveal a route, widget, action, search provider, or setting
from an unentitled bundle.

Prefer a prioritized attention experience over an equal-card grid. Preserve
each attention item's bundle source, priority, reason, due date when known,
action, and evidence. Treat "no material change" as useful information.

Respect the user's pins, hidden items, order, and default workspace. AI may
recommend changes but must not persistently rearrange navigation or layout
without explicit user confirmation.

Use `workspace_layout_proposal_context` before recommending a persistent
change. It exposes only the current capability-filtered layout catalog and
active choices; unavailable saved choices are represented only by a count.
Never guess an item identifier or route. Prefer the smallest useful change and
ground every operation in a user-stated priority, the current layout, or an
enabled capability. Label an inferred goal as inferred.

When the user asks for a durable recommendation, call
`workspace_propose_layout` with the context's exact layout/access revisions and
a fresh request UUID. Reuse that UUID only for an exact retry. The proposal is
an immutable suggestion awaiting review in Workspace. Return its purpose and
direct the user to the layout page; do not imply it was accepted.

## Native confirmation and recovery

The native Lead Emergence Workspace layout page supports proposal comparison,
a preview, explicit confirmation, pins, hiding, ordering, a starting workspace,
rejection, and saved-version recovery. A proposal from this skill is not a
saved change. Do not claim to have accepted or saved it. No model-accessible
layout-approval or persistence tool exists; only the direct user can approve the
exact preview in Workspace.

Hiding is presentation only. It does not revoke access, stop notifications,
delete work, or authorize cross-bundle reading. Home and Settings remain
available for recovery. Unavailable saved choices stay dormant until access
returns; never disclose another bundle's labels or private contents.

When the saved layout or access revision changed in another tab, ask the user
to reload, review the current layout and apply their intended changes again.
Do not silently overwrite newer preferences. Restoring an older version makes
an unsaved draft that requires the same preview and confirmation as a new edit.
Installed-host behavior, representative usefulness, automatic recommendation
generation, and deployed recovery remain separate release gates. Do not
describe a locally stored proposal as client-validated or automatically chosen.
