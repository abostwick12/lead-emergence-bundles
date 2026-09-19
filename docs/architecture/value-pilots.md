# Bundle first-value pilots

The bundle contract already declares a promise, first-run outcome,
time-to-first-value target, success signals and trust gates. P16 adds a portable
measurement contract so those fields can guide an honest pilot instead of
remaining marketing copy.

## Measurement boundary

A value check records the user's usual-process estimate before work begins. The
host supplies the current manifest target and signal catalog, records the server
start time, and measures elapsed time when the user finishes or stops. The user
then reports whether the outcome occurred, which declared signal occurred,
usefulness, trust, actionability, correction count and whether the declared
evidence, provenance and mutation-control gates held.

The contract admits no prompt, source excerpt, output, notes, contact data,
provider data or other client work. Baseline and ratings are explicitly
user-reported. Elapsed time is server-measured. Estimated time saved is the
pre-work baseline minus rounded-up elapsed minutes, never less than zero.

`strong_signal`, `promising_signal` and `needs_iteration` describe one bounded
session. They are not claims of representative value, causality, installed-host
success or commercial readiness.

## Required host behavior

- Derive definitions from the installed portable manifests and independently
  enforce current bundle entitlement on the server.
- Keep sessions private to the native owner workspace and unavailable to
  assistant/OAuth credentials.
- Persist no free text or work content.
- Allow one active measurement per owner and bundle.
- Use optimistic versions, serialization, exact request hashes and durable
  receipts so uncertain responses never create duplicate sessions.
- Keep completed history after entitlement changes, while denying new work for
  a revoked bundle.
- Make unavailable bundles visible before a user attempts to start.
- Present ratings and estimated time saved as user reports, with representative
  evaluation still required before shipment claims.

The Workspace host implements this boundary as a native value-check page. See
[client shipment readiness](../release/client-readiness.md) for current evidence
and the remaining pilot and deployment gates.
