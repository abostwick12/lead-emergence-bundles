# Lead Emergence Bundle Platform — Agent Instructions

## Product boundary

This repository owns reusable bundle contracts, plugin packages, skills,
workflow definitions, and composition primitives. It does not own the Lead
Emergence Workspace application or production data.

- Never store client-private configuration, credentials, tokens, or production
  exports here.
- Never treat a model-supplied client or tenant identifier as authorization.
- Provider authentication and server-side entitlement checks fail closed.
- Keep functional capability separate from declarative presentation metadata.
- Do not add client-specific conditionals to product code.

## Delivery boundary

- Do not change or deploy abostwick12/lead-emergence-workspace from this repo.
- Reinspect workspace main, active branches, and ownership before a future
  integration branch is created.
- Never write to a branch owned by Codex1. This initiative's current branch is
  codex2/bundle-platform-v1.
- Do not merge to main, publish plugins publicly, create paid infrastructure,
  connect providers, or change production without explicit authorization.

## Required checks

Before claiming a milestone is ready:

1. Run npm run typecheck.
2. Run npm run test.
3. Validate each plugin with the installed OpenAI plugin validator.
4. Validate each skill with the installed skill validator.
5. Record anything not integration-tested as such.
