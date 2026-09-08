# Identity, entitlements, domain isolation, and providers

## Identity and entitlement model

An authenticated principal is accepted only when created from a verified
session or verified MCP token and marked server-bound. It contains the canonical
subject, tenant, and workspace resolved by the server. Public tool input never
selects an arbitrary tenant.

An entitlement snapshot contains that principal, a backend revision, resolution
time, and bundle assignments. A bundle resolves only when its assignment is
active, started, and unexpired. Revoked, expired, unavailable, malformed, or
missing assignments fail closed.

Both surfaces use the same source:

~~~
Workspace web request ─┐
                      ├─> Workspace identity + entitlement service
ChatGPT/Codex MCP ─────┘
~~~

The web application uses the snapshot to compose UI. MCP uses it to filter tools
and authorize calls. Removing an entitlement therefore removes both surfaces
without rebuilding the web application.

## Domain isolation

Primary domains are writing, ministry, nonprofit, and investing. executive and
workspace coordinate them without erasing the boundary.

- Same-domain access still requires exact tenant and workspace identity.
- Cross-domain access requires a declared grant for source domain, target
  domain, operation, and data class.
- Executive coordination defaults to task_metadata; it does not inherit full
  content.
- UI composition consumes manifests and permitted attention metadata, not
  arbitrary domain records.
- Cross-tenant and cross-workspace requests are denied before workflow
  preparation.

## Provider composition

Provider requirements declare authorization method, exact scopes, permitted
operations, and a human-readable data boundary. Connections are admitted only
when connected, unexpired, non-revoked, for the same subject, and sufficient in
scope.

Prefer an official OpenAI app or connected service when it satisfies the use
case. Reference a registered app through .app.json only after its real ID,
authorization behavior, and scopes are verified. Add an MCP server only for
controlled Lead Emergence data/actions or when no supported official provider
exists.

Provider states:

~~~
planned -> requires_authorization -> connected
                                  -> expired
                                  -> revoked
                                  -> unavailable
~~~

No provider state may be inferred from a catalog listing. Read-only integration
must be validated before propose or execute behavior. Every execute operation
requires an operation-specific, unexpired approval.

## Provenance

Every durable claim records origin, epistemic state, retrieval time, optional
source/source date/confidence, and review information. Confirmed or rejected
claims require a reviewer. inferred, suggested, and hypothesized content
remains non-durable until reviewed.
