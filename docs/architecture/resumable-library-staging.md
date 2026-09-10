# P20 — resumable Writer library staging contract

Milestone: P20. Portable source branch: `codex2/bundle-platform-v1`.
Contract foundation revision: `74a7b3f971b62b273873bc0c36b0333267d8267a`;
receipt hardening revision: `ec7190ca553184f412f02c879a59be830f85612c`.
Overall client shipment remains **NOT READY TO SHIP**.

## Product boundary

The reusable source contract supports a host-controlled staging list of up to
20 rich-source extraction receipts. Each item has an immutable UUID, the P19
non-retained extraction receipt, a reviewed title and source label, one Writer
resource type, and an explicit include choice. The aggregate extracted-text
limit is 500,000 characters and the JSON request ceiling is 650,000 bytes.

The portable layer validates data shapes and receipts. It does not upload,
parse, retain, compare, save, merge, delete, publish, or transfer a document. It
does not assign a bundle or authorize a caller.

## Recovery and review receipts

`sourceBatchSnapshot` describes optimistic version, latest request identity,
private staged items, and save time. Version zero is the only state without a
request identity. A content-free tombstone has a positive version and no items
or save time, preventing an old tab from recreating retired staging text.

`sourceBatchReview` records a bounded set of exact-match candidates and a
SHA-256 review token. The only supported evidence is:

- same recorded text after whitespace normalization;
- same title after case and whitespace normalization.

Candidates explicitly distinguish an existing resource from another staged
item. Signals, item identities and candidates must be unique. This is not
semantic similarity, plagiarism detection, canonical deduplication or a merge
instruction.

`sourceBatchCommit` returns the positive reviewed batch version and the unique
item/resource identities created by one host operation. A replay flag lets the
host disclose an exact idempotent retry without claiming a second import.

## Host obligations

A conforming host must authenticate and reauthorize current Writer manage and
review access for every read or write. Staging, review and commit must remain
native-only; an OAuth/assistant credential must not read unfinished extracted
text or replay a user's approval. The host must enforce the portable limits
again at its persistence boundary and derive workspace identity from authority,
never request data.

The host must use exact-version writes, immutable retry identities and a
per-workspace serialization boundary. Duplicate evidence must be recalculated
after staging changes and again inside the final transaction. A commit requires
an explicit user confirmation and either imports every included item or none.
Successful commit retires the staging text while retaining a content-free retry
receipt. Excluded items are not imported.

Original binaries remain ephemeral P19 inputs. The host may persist reviewed
plain text and the filename as normal private Writer resources; it must not
imply that the binary, formatting, images or document actions were retained.

## Remaining release work

This closes the reusable contract for a native bulk-library workflow. It does
not establish representative-document quality, full-library migration at client
scale, semantic deduplication, link verification, Wix connectivity, installed
ChatGPT/Codex behavior, hosted recovery/retention, provider readiness or paid
shipment. Those remain explicit release gates.
