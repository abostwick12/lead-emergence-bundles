---
name: ministry-source-layered-research
description: Prepare biblical, theological, sermon, or teaching research with explicit source layers and client-owned theological configuration.
---

# Source-layered ministry research

Build a useful research brief while keeping evidence and interpretation
legible.

Distinguish these layers whenever they are relevant:

- biblical text;
- textual or original-language evidence;
- academic interpretation;
- historical theology;
- Reformed or Presbyterian traditions;
- PC(USA) sources;
- the user's prior writings;
- AI synthesis.

Treat the theological profile as user-owned configuration. Never infer Andrew
Bostwick's preferences, transfer one person's theology to another, or silently
turn an inference into the user's belief. Label positions as inferred,
user-stated, confirmed, or rejected, and ask for confirmation before treating
an inferred position as durable.

Use citations or precise source references for research claims. Represent
meaningful disagreement fairly. If Logos is unavailable or not authorized,
continue with the sources actually available and say that Logos-specific
library research was not performed.

Return the research question, source-layered findings, interpretive tensions,
a proposed teaching or sermon direction when requested, and a bibliography.

## Connected Ministry workspace

When the authorized Ministry tools are available, use
`ministry_list_research` and `ministry_read_research` to recover the existing
question, sources, notes and teaching outline before starting over.
`ministry_get_profile` supplies only the current client-owned configuration.
A missing or cleared profile is unset; proceed without inventing preferences.
Within a saved profile, each position retains its own epistemic state:
an inferred position is not the client's belief, and a rejected position is
not an instruction to adopt it. Profile confirmation does not promote those
individual states. Suggest profile changes conversationally; the client must
review and confirm them in the native Ministry preferences page.

Use actual available sources for new research. Record a precise reference or
locator, author when known, source and retrieval dates when known, and bounded
excerpts that support the note. Do not invent page numbers, bibliographic
details, original-language analysis, source access or a date of retrieval.
Place AI synthesis in its own layer and keep interpretive notes inferred.
Different source layers are perspectives to compare, not eight mandatory
boxes to fill or an automatic ranking of scholarly quality.

`ministry_propose_research` saves a proposal only. Read the current revision,
include only changed project fields, and preserve unchanged sources/notes
when replacing an array. Notes cite source IDs from that project. Include a
reason and source evidence; use a stable request UUID when retrying the same
proposal. The server marks newly assistant-authored notes inferred. An approval
does not make them user testimony or a confirmed theological position.
Direct the client to compare the saved proposal in Workspace before applying.
Do not claim the canonical project changed merely because a proposal was saved.

`ministry_search_archive` and `ministry_read_archive` recover authorized prior
sermons or teaching, including their recorded date, source and revision.
Prior writing is historical evidence of that writing, not proof of current
belief or permission to retrieve Writing, financial or nonprofit records.
Do not infer a cross-domain grant from shared ownership.

These tools read recorded private data; they do not fetch websites, verify
quotations, search Logos, confirm beliefs, publish or send communications.
Use actual research tools separately when available and authorized. If they
are unavailable, offer a source-gathering plan or work from supplied evidence,
clearly separating gaps from conclusions. No native profile-save, recovery
history or canonical-approval tool is exposed to the assistant.
