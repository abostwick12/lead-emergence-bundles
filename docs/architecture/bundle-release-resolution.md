# Bundle release resolution

## Purpose

Bundle entitlement and bundle release resolution are separate decisions.

- **Entitlement** answers whether a verified principal may use a logical bundle
  key such as `sotf_transition`.
- **Release resolution** answers which immutable, validated artifact version a
  host should load for that logical key.

The existing `BundleRegistry` remains the entitlement-side catalog. This slice
adds a bundle-repository `BundleReleaseCatalog`; it does not connect the two or
change Workspace.

## Immutable release identity

A release records:

- logical bundle key and semantic version;
- SHA-256 digest of the canonical bundle manifest and UI manifest bytes;
- source repository and 40-character source revision;
- Bundle Contract major and minimum compatible Workspace host contract;
- persisted-state and host-adapter compatibility declarations; and
- deterministic validation state, validator version, and timestamp.

The catalog stores multiple versions for one logical key. Re-registering the
same key, version, and digest is an idempotent no-op. Reusing a version with a
different digest is rejected. The artifact manifest key/version must match the
release record, and its digest is recomputed before registration.

## Channels and compatibility

`development`, `beta`, and `stable` are explicit release channels. Promotion is
an atomic catalog operation: all checks run before the channel is changed.
A candidate must:

1. advance the semantic version without crossing a major-version boundary;
2. keep the same Bundle Contract major;
3. declare persisted-state and host-adapter compatibility;
4. satisfy the supplied host contract version; and
5. have passed deterministic validation.

Failure leaves the channel on its previous release. Stable promotion is always
explicit; registration alone never promotes a release.

## Current boundary and next slice

SOTF 1.0.0 is the first canonical release baseline. A synthetic 1.0.1 artifact
exists only in tests to prove coexistence and compatible patch promotion; it is
not a customer release or a product change.

This repository does not own a Workspace release pointer, per-client pin,
resolver cache, rollback controller, database migration, or host adapter. The
next vertical slice is the Workspace projection/resolver that maps an entitled
logical key to an explicitly selected compatible release. That work remains
blocked until the active Phase 2.2 stream releases its overlapping Workspace
migration and projection boundaries.
