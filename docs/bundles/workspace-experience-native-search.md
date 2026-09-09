# Workspace Experience — native saved-work discovery

Workspace Experience 0.3.0; Bundle Contract and UI Manifest Contract 1.0.
This is a native implementation checkpoint, not client shipment.

The reusable discovery contract registers sixteen individually authorized
saved-work kinds across Writing, Ministry, Nonprofit Founder, Investor and
Executive. The host implements current native-user search with exact scope
disclosure, source-labelled cards, rank reasons, saved revisions and links
to originals. Current reads are paged 25 at a time and reauthorize on every
request. Queries are lexical, not semantic retrieval or evidence verification.

Writing requires both library and review for body retrieval. Ministry private
profiles, pending proposals, prior versions, recovery drafts, provider accounts
and general Workspace tasks are excluded. No shared private corpus or model
search capability is created.

Ten concrete host handlers open existing native workflows. The action palette
uses Ctrl/Command+Shift+K; Ctrl/Command+K still opens Quick Capture. Shortcuts
do not save, publish, send or book. Manual customization is not misrepresented
as the planned AI-generated layout recommendation.

An actual all-six OAuth connection was denied native search through both
HTTP and direct database RPC. Native owner, current assignment, per-kind
capability and authority revision remain required independently of the UI.
Source contracts/provider declarations are not authorization.

Source proof: 134 tests, typecheck, six plugin and six skill validations.
Host evidence belongs in docs/testing/workspace-search-acceptance.md and
docs/architecture/workspace-saved-search.md in the Workspace repository.
P11 also proves a clean 33-migration local replay and 650 database assertions.

Still required: shared attention and connection/notification consumers;
grounded approval-only layout recommendations; representative source quality
and measured first-use value; installed-host, deployed recovery/privacy and
commercial release acceptance. Do not enable a planned capability just
because its manifest exists.
