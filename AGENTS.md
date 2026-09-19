# Canonical Lead Emergence Control Plane

Before any diagnosis, implementation, branch/worktree creation, or code change in this repository, read the private canonical control plane:

- Repository: `abostwick12/lead-emergence-control-plane` (default branch `main`)
- Shared agent mandate: `AGENTS.md`
- Canonical roadmap: `docs/ROADMAP.md`
- Canonical production state: `docs/status/PRODUCTION_STATE.md`
- Durable decisions: `docs/DECISIONS.md`
- Backlog: `docs/BACKLOG.md`
- Protocols: `agent-skills/`

The control-plane `AGENTS.md` and Software Factory V1 workflow govern shared development behavior. This repository's rules below remain in force unless they directly conflict with that shared workflow; otherwise preserve the stricter rule.

Do **not** create an independent editable copy of `ROADMAP.md` or `PRODUCTION_STATE.md` in this repository. If you cannot access the private control-plane repository, stop and report that access failure to Andrew rather than working from a stale copy or prior handoff.

---

# Lead Emergence Bundle Platform — Repository-Specific Rules

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
- Never write to a branch owned by another agent. Treat
  `origin/codex2/bundle-platform-v1` as read-only source history.
- Do not merge to main, publish plugins publicly, create paid infrastructure,
  connect providers, or change production without explicit authorization.

## Required checks

Before claiming a milestone is ready:

1. Run npm run typecheck.
2. Run npm run test.
3. Validate each plugin with the installed OpenAI plugin validator.
4. Validate each skill with the installed skill validator.
5. Record anything not integration-tested as such.
