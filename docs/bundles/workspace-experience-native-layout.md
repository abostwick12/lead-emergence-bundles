# Workspace Experience — native user-owned layout

Workspace Experience 0.2.0 uses Bundle Contract 1.0, UI Manifest Contract 1.0
and its strict Layout Schema 1.0. Source implementation:
`bundles/workspace-experience/layout.ts`. **Not a client shipment release.**

The native Workspace registers composition and personalization as ordinary
assigned capabilities. Search and automated attention remain planned. UI
contributions are filtered by live capabilities before preferences are applied.
Pins, hidden items, ordering and the starting workspace do not confer access.

The native page previews changes, requires explicit confirmation, detects
stale preference/access revisions and retains exact retry semantics. Recovery
loads an earlier version or defaults as an unsaved draft. Home remains an
escape, and unavailable saved choices remain dormant across revocation.
Layout revisions are separate from authority revisions so open editor drafts
survive layout refresh. Explicit sign-in destinations are not hijacked.

Workspace Designer can recommend but cannot claim to save a layout. No
model-accessible layout persistence tool exists. An actual fictional all-six
OAuth connection has been tested: domain tools compose, while both HTTP and
direct RPC deny reading or writing native preferences.

Source proof: 120 tests, typecheck, six plugin and six skill validations.
Host proof and final browser results belong in Workspace's
`docs/testing/workspace-layout-acceptance.md`. P10's native storage, SQL
boundary tests and actual HTTP/OAuth acceptance are not installed-host,
provider, commercial or representative client-value proof.

Next: scoped search, actionable commands, grounded advisory layout proposals,
connection/notification consumers and the remaining shared shipment gates.
Do not enable an unavailable capability simply because its declarative
manifest exists. The goal remains to finish and verify all six bundles.
