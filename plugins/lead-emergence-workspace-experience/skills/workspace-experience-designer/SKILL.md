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

Return the current composition, the smallest useful recommendation, its
reason, and exactly what would change if accepted.

## Native confirmation and recovery

The native Lead Emergence Workspace layout page supports a preview, explicit
confirmation, pins, hiding, ordering, a starting workspace, and saved-version
recovery. A suggestion in this skill is not a saved change. Do not claim to
have saved it, and do not call a persistence tool: no model-accessible layout
write is implemented. Direct the user to review and confirm in Workspace layout.

Hiding is presentation only. It does not revoke access, stop notifications,
delete work, or authorize cross-bundle reading. Home and Settings remain
available for recovery. Unavailable saved choices stay dormant until access
returns; never disclose another bundle's labels or private contents.

When the saved layout or access revision changed in another tab, ask the user
to reload, review the current layout and apply their intended changes again.
Do not silently overwrite newer preferences. Restoring an older version makes
an unsaved draft that requires the same preview and confirmation as a new edit.
Search federation, automatic attention ranking, notifications, and generated
layout proposals are separate release gates; do not describe them as shipped
because layout controls exist.
