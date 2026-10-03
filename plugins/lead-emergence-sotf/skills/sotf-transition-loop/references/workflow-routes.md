# Existing SOTF workflow routes

Resume first. `sotf_prepare_next_move` prepares from saved ordinary transition
operations; it does not save or execute the prepared action. Use its `workflow`
values below only when the current host exposes the tool and matching schema.
Names in the Save column are **command types** passed to
`sotf_record_transition_step`, not standalone tools. Read only rows relevant to
the current request. The live tool contract wins if a version differs.

| Request | Prepare route and required context | Save after review |
|---|---|---|
| Direction and hypotheses | `direction`; `recordId` is an existing hypothesis ID | `save_hypothesis`, `confirm_criteria`; `start_transition` only for an absent chapter the user wants to create |
| Opportunity assessment | `opportunity`; existing opportunity ID | `record_opportunity`, `record_evidence`, `review_evidence`, `resolve_requirement`, `decide_opportunity` |
| Meeting/conversation preparation | `meeting`; existing meeting ID | `record_meeting`; preparation is not attendance |
| Networking strategy | `networking`; optional `recordId` is the selected week, not a person ID | `save_person` with the existing networking fields; see networking below |
| Outreach and follow-up | Resume the existing person/action | `prepare_outreach`, `prepare_action`, `approve_action`, `revise_action`, `record_action_result`; no send occurs |
| Debrief and next touch | Resume the actual meeting/person | `debrief_meeting`, `save_commitment`, `resolve_commitment`; preserve said/inferred/unresolved distinctions |
| Coaching preparation | `coaching`; optional offset-aware `since` | Reviewed evidence and commitments; protected/confidential coaching material stays outside this pilot |
| Weekly learning | `weekly`; optional offset-aware `since` | `review_week`; no schedule implied |
| Story recall | `stories`; optional `query` | `save_story` only after truthful wording and uncertain numbers are reviewed |
| Resume and other materials | Use relevant stories and the actual opportunity; use a separately available resume skill only when authorized | `save_material`, linked to a real opportunity with truthful content confirmed; separate resume-skill availability is not guaranteed by this package |
| Interview preparation | `interview`; existing interview ID; optional interviewer context in `query` | `record_interview`; distinguish self-assessment from sourced employer feedback |
| Offer comparison | `offers`; actual saved offers | `record_offer`; preserve written/reported/estimated/unknown terms. `accept_offer` only after actual user-confirmed acceptance |
| Professional-work planning | `professional_work` | Existing offer/checkpoint/chapter commands; no protected Professional Context access |
| Scheduling proposals | `scheduling`; explicit checked `availability` | Proposal only; see scheduling below |
| Invitation preparation | `invitation`; accepted meeting ID linked to a person | Returns a `prepare_action` draft for review; no calendar event is created |

If required records or real inputs are missing, identify the gap; do not create
fictional people, interviews, offers or evidence to make the route appear complete.
Choose a reviewable draft or deliberate pause instead. A preparation case may
finish with a useful draft; a save, send or completion case needs its own evidence.

## Networking and follow-through

Use the deployed strategy rather than inventing a second ranking system. Keep
organization-level LAMP context separate from why this specific person matters.
Preserve the candidate's verified source URL, week, person rationale, contribution
angle, recommended action, pathway, status and next touch. The weekly strategy
supports a 25-person queue; report fewer verified candidates honestly.

Pathways are `direct_outreach`, `thoughtful_comment`, `warm_introduction` and
`research_wait`. A thoughtful comment is not a DM; a proposed introduction is not
a completed introduction. Track identified, attempted, accepted, replied,
conversation scheduled and conversation completed using real evidence. Reuse
meeting preparation, debrief and commitments. Do not count recent unanswered
attempts as mature-cohort failures or manufacture conversions to improve metrics.

## Scheduling without implied calendar access

Obtain authorized availability from the client's host Calendar tools or explicit
user-checked availability. The existing schema requires `offered`, `available`,
`busy`, `calendarChecked: true`, `checkedAt`, `source`, `timeZone`,
`durationMinutes` and optional `bufferMinutes`. Supply offset-aware instants and
the actual named timezone. Do not set calendarChecked true without a real check;
the current server rejects checks older than 24 hours or implausibly future-dated.

Proposed times require agreement. An invitation requires an existing accepted
meeting and correct person. Verify recipient, local time and location/link before
preparing it. A draft never proves an invitation was sent or an event exists.

The separate `prepare_scheduling_reply` command uses the server's configured
branded booking destination. Verify that destination is intended for this client;
do not assume a globally configured booking page is their personal calendar or
override the authoritative URL. If unsuitable, report the gap and use an
authorized availability-based proposal without claiming branded booking works.

## Other Workspace tools

For explicitly requested ordinary Workspace tasks, captures, memory or career
records, discover and use the existing list/create/update tools and their own
confirmation/idempotency contracts. List before modifying an existing item.
Generic career records and SOTF opportunities are separate persistence paths;
do not silently duplicate data or claim synchronization. Clock/connection controls
and destructive actions require the user's specific request, not routine startup.
Morning/daily briefing preferences from SKILL.md apply to every route.
