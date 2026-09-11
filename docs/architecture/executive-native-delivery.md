# Executive native delivery contract

Updated 2026-09-10. Executive 0.6 defines a provider-neutral review rhythm for
daily briefs and weekly reviews. It is a portable contract and workflow
declaration, not a background scheduler or an external delivery service.

## User outcome

A user can choose a named time zone, local time, daily or weekly cadence, and
whether every occurrence or only a changed attention summary should create a
native review cue. The user owns creation, update, pause, resume and final
cancellation. Every mutation carries the complete intended definition, current
version, unique request identity and explicit confirmation.

The list contract retains cancelled schedule history while permitting at most
one non-cancelled schedule for each review kind. It reports current capability
availability separately from schedule state, so retained configuration never
implies that revoked access can still run.

## Evidence boundary

A delivery event reports the complete current attention total and, separately,
the inspected first-page count and high-priority count. This avoids presenting a
bounded first page as a complete priority count. The event is fixed to an exact
native unsaved-editor route and must state that user review is required,
external delivery is false, and canonical record creation is false.

The `when_attention_summary_changes` policy compares a stable, bounded current
attention projection. Unshared or unavailable sources, inboxes, calendars, live
markets and external provider state are not part of that comparison.

## Authority boundary

The Executive plugin does not receive schedule tools. Native schedule lifecycle
and occurrence evaluation are direct-user responsibilities in the Workspace
host. Assistant proposals cannot create, change, trigger or cancel schedules.
Provider authentication is therefore neither implied nor bypassed.

The portable contract declares `backgroundDeliveryAvailable: false`. A host
without a separately deployed and accepted runner must explain that due
occurrences are evaluated only when the user opens the native Executive area.

## Time semantics

Cadences use IANA-compatible named zones and local `HH:MM` values. A host must
apply one deterministic daylight-saving policy, test spring gaps and repeated
hours, advance past missed periods without flooding, and display the next
occurrence in the schedule's named zone.

Overall client shipment remains gated on host migration/runtime proof,
representative user acceptance, installed-host behavior and deployed operational
acceptance.
