# Existing Workspace discovery

Inspected read-only on **2026-09-08**.

Repository: `abostwick12/lead-emergence-workspace`

Default branch: `main`
Inspected HEAD: 044382c856ca948c4c032c683446b29989dc30e1

No Workspace files, branches, deployments, hosted databases, or production
configuration were changed.

## Existing foundations to reuse

- Next.js 16.3.2, React 18, TypeScript, Supabase Auth/database, MCP SDK, Zod,
  Vitest, Playwright, and a stateless Streamable HTTP MCP endpoint.
- Workspace-owned data lives in exposed workspace; private helpers live in
  unexposed workspace_private. Runtime uses authenticated JWT + RLS and
  prohibits a service-role key.
- Bundle foundation already includes generic definitions, bundle-to-capability
  mappings, time-bounded/revocable entitlements, idempotent assignment/invite
  paths, RLS, owner checks, and audit history.
- The public entitlement resolver returns bundle state and enabled capability
  mappings only for the authenticated active member.
- MCP admission already checks the authenticated subject, exact resource
  audience, workspace_mcp claim, client identity, expiry, connection state,
  plan capability, and controlled RPC/tool boundary.
- The existing Home already centers "What deserves attention?" and preserves
  confirmed configuration rather than presenting inference as fact.

## Integration gaps

- Browser product state currently resolves plan capabilities plus a
  SOTF-specific pilot access boolean. It does not yet fetch a generic set of
  active bundle definitions and UI manifests.
- Workspace navigation is a hard-coded React list with one SOTF feature-flag
  conditional. P2 should replace the bundle-specific conditional with a generic
  manifest adapter while preserving core Workspace navigation and locked states.
- The existing bundle key database constraint uses lower snake case. This repo
  adopts that canonical key format.
- The bundle catalog currently contains SOTF pilot data, not the six new product
  bundle definitions.
- UI layout preferences do not yet cover bundle pin/hide/order/default workspace.
- Provider catalog entries describe planned connections honestly; most are not
  production-ready and must not be presented as connected.

## Branch and ownership check

Existing codex/* branches include active product, MCP, and bundle work,
including codex/personal-os-transition-bundle. Open pull requests at inspection
time were #10 (codex/client-admission-controls) and #11
(codex/unified-entry-frontdoor-workspace).

Branch ownership is not machine-verifiable from Git metadata. This initiative
therefore treats every existing Workspace branch as non-Codex2-owned and will
write to none of them. Before P2, re-fetch, verify main, recheck active
branches/PRs, and create codex2/bundle-experience-integration only if there is
still no conflict.

## P2 adapter seam

The clean seam is the current Workspace provider/shell:

1. Fetch an authenticated generic entitlement snapshot.
2. Load version-compatible UI manifests from a deployed registry artifact.
3. Compose contributions with user preferences.
4. Render the resulting navigation/widgets/actions in the existing shell.
5. Filter MCP tool registration from the same entitlement revision.

This preserves the Workspace as product and system of record while allowing
bundle assignment/removal to take effect as data.
