# Bundle platform architecture

## System of authority

~~~
verified identity
  -> server-mapped tenant and workspace
  -> entitlement snapshot
  -> bundle registry
  -> capability registry
  -> workflow, provider, provenance, and policy gates
  -> declarative UI manifests
  -> Workspace Experience composer
~~~

The Workspace backend is authoritative for identity, tenant membership,
entitlements, provider grants, client configuration, and data. This repository
is authoritative for versioned bundle definitions and portable workflow/UI
contracts. Neither a plugin installation nor a client-supplied identifier is
authorization.

## Repository model

~~~
.agents/plugins/marketplace.json   GitHub/private-beta catalog
plugins/                           OpenAI plugin packages and skills
bundles/                           versioned product and UI definitions
packages/                          reusable contract and policy primitives
apps/lead-emergence-runtime/       composition entry point
companions/logos-windows/          optional, isolated future bridge
docs/                              architecture, ADRs, and bundle records
tests/                             contract and hostile-boundary tests
~~~

The product's bundle key uses the existing Workspace-compatible lower
snake-case form. Filesystem and plugin names use lower kebab-case.

## Contract boundaries

- The Bundle Contract declares identity, experience promise, capabilities,
  skills, workflows, providers/apps, permissions, automations, attention types,
  and the path to a separate UI manifest.
- The UI Manifest is declarative. It contributes routes, navigation, widgets,
  quick actions, search providers, command actions, notifications, empty states,
  and settings without referencing React components.
- The Bundle Registry resolves only active, time-valid assignments from a
  server-bound entitlement snapshot.
- The Capability Registry rejects duplicate capability IDs and returns only
  capabilities belonging to entitled bundles.
- The policy layer enforces tenant, workspace, domain, provider, and
  propose/execute boundaries before workflow preparation.
- Provenance prevents AI inference from silently becoming confirmed durable
  fact.

## Indispensable experience standard

Every bundle must earn continued use through a compact value loop:

1. **Fast first value:** a useful outcome in the first session, with a declared
   time-to-value target.
2. **Trusted result:** evidence, freshness, provenance, uncertainty, and
   fact/inference distinctions are visible where they matter.
3. **Lower user effort:** the bundle combines steps the user would otherwise
   perform across documents, websites, notes, or recurring reviews.
4. **Actionable handoff:** the result ends in a small next move, not a data dump.
5. **Learning with consent:** user corrections improve confirmed configuration;
   AI inference never becomes belief or fact silently.
6. **Meaningful return:** attention items surface consequential change. No
   material change is an acceptable, useful result.

The contract's experience block makes first-run outcome, time to value,
success signals, and trust gates testable product requirements rather than
marketing copy.

P16's first-value pilot contract measures one session without storing work
content: the user's usual-process baseline is fixed before starting, elapsed
time is host-measured, and ratings remain explicitly user-reported. A strong
single-session signal is not representative client proof.

## Runtime composition

Composition is deterministic: explicit user order overrides win, pinned widgets
come first, then manifest order, bundle key, and contribution ID provide stable
ties. Hiding or removing a bundle entitlement removes its contributions on the
next entitlement resolution; no application deployment is required.

AI can propose layout changes. Only user-confirmed preferences may persistently
change pins, hidden items, ordering, or the default workspace.
