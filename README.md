# Lead Emergence Bundle Platform

Reusable capability bundles for Lead Emergence. This repository owns bundle
contracts, OpenAI plugin packages, workflow definitions, shared policy and
provenance primitives, and the composition runtime. It does **not** contain the
Lead Emergence Workspace web application or client-private configuration.

## Product boundary

- `abostwick12/lead-emergence-workspace` remains the authenticated system of
  record and the primary web experience.
- This repository provides portable, versioned bundle definitions and the
  official plugin packaging used by ChatGPT and Codex.
- Bundle assignment is backend data. A UI or tool is available only when the
  same server-authorized entitlement source admits it.
- Functional bundles contribute declarative UI metadata; the Workspace
  Experience composer renders it inside Lead Emergence.

## Current contents

- Six independently discoverable plugin shells under `plugins/`.
- Versioned Bundle and UI Manifest contracts.
- Bundle and capability registries with deterministic composition.
- Fail-closed identity, entitlement, provider, domain, and mutation policy
  primitives.
- Shared provenance and epistemic-state controls.
- Private native editor recovery shapes for all 16 Ministry, Nonprofit,
  Investor, and Executive record kinds; Writer keeps its specialized recovery.
- Architecture decisions and the P0 discovery record under `docs/`.

## Local validation

```text
npm install
npm run check
```

Plugin packages and their included skills are additionally validated with
OpenAI's installed plugin and skill validators. No provider, hosted backend, or
production system is contacted by the test suite.

Local implementation is not a commercial release. See
[client shipment readiness](docs/release/client-readiness.md) for the current
evidence and the remaining representative, installed-host, deployed, provider,
payment and support gates.
