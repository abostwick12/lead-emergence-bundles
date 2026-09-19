# P19 — secure rich-source intake contract

Milestone: P19. Portable source branch: `codex2/bundle-platform-v1`.
Published contract revision: `8ec825b3959f873e7b9ab0140c593107380593a6`.
Overall client shipment remains **NOT READY TO SHIP**.

## Product boundary

Writer & Editor resources and Ministry archive records can accept one `.txt`,
`.md`, `.docx`, or text-based `.pdf` source through a host-provided, review-first
flow. The reusable contract classifies the declared filename/type, publishes
hard parser limits, validates the extraction receipt and makes non-retention
explicit. It does not parse files itself or grant a host permission to do so.

The original file is an ephemeral input. The resulting plain text, reviewed
filename and normal domain record may be saved only through the destination's
existing native workflow. Formatting, images, attachments, macros, links,
annotations, document metadata and PDF actions are not imported. Scanned PDFs
require a separate text export; OCR is not claimed.

## Published limits

| Boundary | Limit |
| --- | ---: |
| File bytes | 4,000,000 |
| Multipart request bytes | 4,250,000 |
| Extracted characters | 100,000 |
| PDF pages | 100 |
| DOCX entries | 500 |
| DOCX expanded bytes | 15,000,000 |
| One DOCX entry | 10,000,000 |
| DOCX aggregate compression ratio | 200:1 |
| Filename characters | 255 |

Extensions and compatible MIME hints are allowlisted. Paths, hidden names,
control characters, incompatible types, empty documents and oversized inputs
fail before parsing. The host must additionally verify the file signature and,
for DOCX, inspect the ZIP central directory for multi-disk/ZIP64 markers, unsafe
paths, duplicates, required Word entries and bounded expansion.

## Host obligations

Before reading a request body, a host must authenticate the user. Before parsing
the file, it must authorize one fixed destination against current entitlement.
Assistant/OAuth sessions must not receive file-intake authority. A host returns
plain text only, a SHA-256 receipt, bounded counts, review warnings and
`originalRetained: false`; it must not return HTML or parser diagnostics.

The UI must show an extraction preview and require a separate apply action.
Applying extracted text is not an official save, publication, belief
confirmation or assistant approval. The destination's existing confirmation,
revision and tenant rules continue to govern canonical records.

## Remaining release work

P19 is single-document intake, not bulk library migration. Representative source
quality, difficult real-world documents, large-library ergonomics, installed
hosts, deployed resource limits/recovery, privacy/retention operations and
support procedures remain release gates.
