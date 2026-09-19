# P2 local proof handoff

Date: 2026-09-08. Owner: Codex2.

## Status

Writer and Workspace Experience are implemented together on the isolated
Workspace branch `codex2/bundle-experience-integration`, based on published main
`044382c856ca948c4c032c683446b29989dc30e1`. This is a local integration checkpoint,
not a production release and not full P2 host acceptance.

The Workspace uses a SHA-256-checked export of eleven platform source files from
bundle commit `ff0f9d1f8264ca97acd7345f82e109e7f1ecfcca`. No portable contract
changed: Bundle Contract `1.0` and UI Manifest `1.0` remain current.
This repository's P2 change connects `writer-resource-review` to the verified
read-only MCP operations and clarifies fallback, ambiguity, provenance, and
revoked-access behavior. The plugin remains skills-only; no undeployed endpoint
or invented app dependency was added.

## Implemented in Workspace

- Backend-derived bundle/capability composition; manifest-driven navigation and
  registered attention widgets; no per-client code.
- Writing library, title/author/topic search, publication filter, resource source
  text, recorded metadata checks, provenance, and copyable notes.
- Web and MCP use the same tenant-scoped read functions and entitlement source.
- Resource isolation, time-window enforcement, active capability checks,
  no-store responses, and clear-on-revocation browser state.
- Repeatable isolated Supabase, real OAuth/PKCE and HTTP MCP acceptance, and
  desktop/mobile browser tests with fictional accounts.

The test is a real local service integration, not a claim that the skill was
invoked through an installed ChatGPT/Codex plugin. The latter is still untested.

## Integration and publication gates

The published Workspace consent page has not yet adopted newer grant-resolution
and activation work present on another active branch. The local integration test
performs real user approval and then calls the existing activation RPC. It does
not certify hosted consent or Entry handoff. Reconcile that work with its owner
and use an authorized non-production preview before host acceptance.

On 2026-09-08, after the local proof, the user explicitly approved publication
of the vendored platform sources to the public Workspace integration branch.
The reusable bundle repository remains private; this is not permission to
change repository visibility or submit a plugin to a public marketplace.
Previously published source cannot be recalled by later making a repository
private. Future paid access belongs in server-side authorization, not source
visibility. The branch publication does not close the host/preview gate.
No main branch was modified or merged. No production data, hosted migration,
provider connection, paid infrastructure, or public plugin submission occurred.

## Next scope

Complete the real host/preview gate with the Writer A/B entitlement proof.
Then use a small authorized resource library to measure actual time saved,
source quality, accepted metadata, and repeat usage before expanding to Wix
inventory or the other bundles. P3 mutations still require validated preview
and approval behavior.

The complete implementation notes and exact test record live in the Workspace
checkout at `docs/architecture/writer-bundle-experience.md` and
`docs/testing/test-evidence.md`.
