import { describe, expect, it } from "vitest";
import { emptyExecutiveData, executiveSchemas, executiveSave, executiveProposalInput, executiveDecision,
  executiveReference, executiveSharingInput, executiveAttention, type ExecutiveData, type ExecutiveSignal } from "../bundles/executive/contracts";
import { attentionChange, normalizeAssistantExecutive, prepareExecutiveBrief, sortExecutiveSignals } from "../bundles/executive/analysis";
import { proposeExecutiveTimes } from "../bundles/executive/scheduling";

const id = "85000000-0000-4000-8000-000000000001", other = "85000000-0000-4000-8000-000000000002";
const today = "2026-09-09", now = today + "T12:00:00Z";
const commitment = { ...emptyExecutiveData("commitment", today), title: "Follow through", outcome: "Deliver the agreed outline." };
const source = { capabilityId: "executive.coordination", kind: "commitment", documentId: id, revision: 1 };
const signal: ExecutiveSignal = { id: "commitment:" + id, source, title: "An explicit commitment", priority: "normal",
  dueDate: today, reason: "The saved due date is today.", evidence: "Saved commitment revision 1.",
  action: "Review the saved commitment.", sourceUpdatedAt: now, sourceReviewState: "user_stated" };
const snapshot = { asOfDate: today, retrievedAt: now, items: [signal], total: 1,
  coverage: [{ capabilityId: "executive.coordination", state: "current", total: 1 }] };
describe("Executive native coordination contracts", () => {
  it("starts with no invented people, commitments, schedule agreement or source permission", () => {
    for (const kind of ["commitment", "decision", "meeting", "daily_brief", "weekly_review"] as const) {
      const value = emptyExecutiveData(kind, today);
      expect(value.title).toBe(""); expect(value.references).toEqual([]); expect(value.reviewState).toBe("user_stated");
    }
    expect(emptyExecutiveData("meeting", today)).toMatchObject({ startsAt: null, timeZone: "", agreement: "not_agreed", participants: [] });
  });
  it("requires native exact-record confirmation and rejects tenant and executable side effects", () => {
    const save = { kind: "commitment", documentId: null, expectedRevision: 0, requestId: id, data: commitment, confirmExactRecord: true };
    expect(executiveSave.safeParse(save).success).toBe(true);
    for (const patch of [{ confirmExactRecord: false }, { expectedRevision: 1 }, { kind: "decision" }, { tenantId: other }])
      expect(executiveSave.safeParse({ ...save, ...patch }).success).toBe(false);
    for (const patch of [{ calendarEventId: id }, { sendEmail: true }, { providerToken: "not-a-token" }])
      expect(executiveSchemas.commitment.safeParse({ ...commitment, ...patch }).success).toBe(false);
    expect(executiveDecision.safeParse({ proposalId: id, expectedRevision: 0, decision: "approve", confirmExactRecord: false }).success).toBe(false);
    expect(executiveDecision.safeParse({ proposalId: id, expectedRevision: 0, decision: "reject", confirmExactRecord: false }).success).toBe(true);
  });
  it("bounds proposals independently from canonical saves", () => {
    const value = { kind: "commitment", documentId: null, expectedRevision: 0, requestId: id, data: commitment,
      scope: "executive_coordination_only", reason: "Requested next move", evidence: "User supplied this commitment." };
    expect(executiveProposalInput.safeParse(value).success).toBe(true);
    expect(executiveProposalInput.safeParse({ ...value, scope: "all_private_content" }).success).toBe(false);
    expect(executiveProposalInput.safeParse({ ...value, documentId: id }).success).toBe(false);
  });
  it("preserves completion and blocker evidence without guessing dates", () => {
    expect(executiveSchemas.commitment.safeParse({ ...commitment, state: "completed" }).success).toBe(false);
    expect(executiveSchemas.commitment.safeParse({ ...commitment, state: "completed", completedOn: today }).success).toBe(true);
    expect(executiveSchemas.commitment.safeParse({ ...commitment, completedOn: today }).success).toBe(false);
    expect(executiveSchemas.commitment.safeParse({ ...commitment, state: "blocked" }).success).toBe(false);
    expect(executiveSchemas.commitment.safeParse({ ...commitment, dueDate: "2026-02-30" }).success).toBe(false);
  });
  it("requires a decision's own option, rationale and date", () => {
    const value = { ...emptyExecutiveData("decision", today), title: "Choose a first step", question: "Which step creates value?",
      options: [{ id, title: "Pilot", upside: "Learn", downside: "Limited reach", evidence: "Explicit tradeoff" }] };
    expect(executiveSchemas.decision.safeParse(value).success).toBe(true);
    const decided = { ...value, state: "decided", selectedOptionId: id, decidedOn: today, rationale: "Learn before scaling" };
    expect(executiveSchemas.decision.safeParse(decided).success).toBe(true);
    for (const patch of [{ selectedOptionId: other }, { rationale: "" }, { decidedOn: null }, { state: "open" }])
      expect(executiveSchemas.decision.safeParse({ ...decided, ...patch }).success).toBe(false);
  });
  it("keeps meeting plans distinct from agreements and actual calendar bookings", () => {
    const value = { ...emptyExecutiveData("meeting", today), title: "Plan a conversation", objective: "Align on the next move", timeZone: "America/Chicago" };
    expect(executiveSchemas.meeting.safeParse(value).success).toBe(true);
    for (const patch of [{ timeZone: "Not/AZone" }, { durationMinutes: 30.5 }, { startsAt: "2026-09-09T10:00:00" },
      { agreement: "user_reported_agreed" }, { calendarBooked: true }, { state: "held" }])
      expect(executiveSchemas.meeting.safeParse({ ...value, ...patch }).success).toBe(false);
    expect(executiveSchemas.meeting.safeParse({ ...value, startsAt: now, agreement: "user_reported_agreed" }).success).toBe(true);
  });
  it("enforces a one-day brief and an inclusive weekly window of at most seven days", () => {
    const daily = { ...emptyExecutiveData("daily_brief", today), title: "Today", focus: "What deserves attention?" };
    const weekly = { ...emptyExecutiveData("weekly_review", today), title: "Review", focus: "What changed?" };
    expect(executiveSchemas.daily_brief.safeParse(daily).success).toBe(true);
    expect(executiveSchemas.daily_brief.safeParse({ ...daily, periodEnd: "2026-09-10" }).success).toBe(false);
    expect(executiveSchemas.weekly_review.safeParse({ ...weekly, periodStart: "2026-09-03" }).success).toBe(true);
    expect(executiveSchemas.weekly_review.safeParse({ ...weekly, periodStart: "2026-09-02" }).success).toBe(false);
    expect(executiveSchemas.weekly_review.safeParse({ ...weekly, periodStart: "2026-09-10" }).success).toBe(false);
  });
  it("links only matching source identifiers, never snapshots or full domain content", () => {
    expect(executiveReference.safeParse(source).success).toBe(true);
    expect(executiveReference.safeParse({ ...source, capabilityId: "ministry.research" }).success).toBe(false);
    expect(executiveReference.safeParse({ ...source, body: "Private manuscript" }).success).toBe(false);
    expect(executiveReference.safeParse({ ...source, capabilityId: "ministry.archive", kind: "archive" }).success).toBe(true);
    expect(executiveSchemas.commitment.safeParse({ ...commitment, references: [source, source] }).success).toBe(false);
  });
  it("requires explicit native sharing selections and cannot silently expand their scope", () => {
    const value = { sourceCapabilities: [], expectedRevision: 0, requestId: id, confirmTaskMetadataOnly: true };
    expect(executiveSharingInput.safeParse(value).success).toBe(true);
    for (const patch of [{ confirmTaskMetadataOnly: false }, { sourceCapabilities: ["ministry.profile"] },
      { sourceCapabilities: ["investor.thesis", "investor.thesis"] }, { fullContent: true }])
      expect(executiveSharingInput.safeParse({ ...value, ...patch }).success).toBe(false);
  });
  it("demotes changed assistant claims, preserving unchanged user-confirmed actions", () => {
    const base = executiveSchemas.commitment.parse({ ...commitment, reviewState: "confirmed" });
    expect(normalizeAssistantExecutive(base, base)).toEqual(base);
    expect(normalizeAssistantExecutive({ ...base, nextAction: "A suggested move" }, base).reviewState).toBe("inferred");
    expect(base.reviewState).toBe("confirmed");
    const meeting = executiveSchemas.meeting.parse({ ...emptyExecutiveData("meeting", today), title: "Conversation", objective: "Agree a next move",
      startsAt: now, timeZone: "UTC", agreement: "user_reported_agreed",
      actions: [{ id, title: "Bring outline", owner: "", dueDate: today, state: "open", nextAction: "", evidence: "User request", reviewState: "confirmed" }] });
    const changed = normalizeAssistantExecutive({ ...meeting, startsAt: today + "T13:00:00Z" }, meeting);
    expect(changed.agreement).toBe("not_agreed"); expect(changed.actions[0].reviewState).toBe("confirmed");
    const fresh = normalizeAssistantExecutive(meeting, null); expect(fresh.actions[0].reviewState).toBe("inferred");
  });
  it("validates coverage and never copies private task titles into a generated brief", () => {
    expect(executiveAttention.safeParse(snapshot).success).toBe(true);
    const brief = prepareExecutiveBrief("daily_brief", today, snapshot);
    expect(executiveSchemas.daily_brief.safeParse(brief).success).toBe(true);
    expect(brief.references).toEqual([source]); expect(JSON.stringify(brief)).not.toContain(signal.title);
    expect(brief.reviewState).toBe("inferred");
    expect(() => prepareExecutiveBrief("daily_brief", "2026-09-10", snapshot)).toThrow(/Refresh/);
    expect(executiveAttention.safeParse({ ...snapshot, coverage: [] }).success).toBe(false);
    expect(executiveAttention.safeParse({ ...snapshot, total: 0 }).success).toBe(false);
  });
  it("does not mistake unavailable or incomplete sources for no material change", () => {
    const later = { ...snapshot, retrievedAt: today + "T13:00:00Z" };
    expect(attentionChange(snapshot, later).status).toBe("unchanged");
    expect(attentionChange(snapshot, { ...later, items: [{ ...signal, dueDate: "2026-09-10" }] }).status).toBe("changed");
    const unavailable = { ...later, items: [], total: 0, coverage: [{ capabilityId: "executive.coordination", state: "unavailable", total: null }] };
    expect(attentionChange(snapshot, unavailable).status).toBe("coverage_changed");
    expect(attentionChange(unavailable, unavailable).status).toBe("incomplete");
    expect(attentionChange(snapshot, { ...later, total: 2 }).status).toBe("incomplete");
    const draft = prepareExecutiveBrief("daily_brief", today, unavailable) as Extract<ExecutiveData, { recordType: "daily_brief" }>;
    expect(draft.summary).toMatch(/unavailable/); expect(draft.summary).toMatch(/does not establish/);
  });
  it("orders consequence before date and leaves input order untouched", () => {
    const items = [signal, { ...signal, id: "second", priority: "high" as const, dueDate: null }];
    expect(sortExecutiveSignals(items)[0].id).toBe("second"); expect(items[0].id).toBe(signal.id);
  });
});
describe("Executive scheduling from explicit checked availability", () => {
  const input = { offered: [{ start: today + "T14:00:00Z", end: today + "T18:00:00Z" }],
    available: [{ start: today + "T14:00:00Z", end: today + "T18:00:00Z" }],
    busy: [{ start: today + "T15:00:00Z", end: today + "T16:00:00Z" }],
    checkedAt: now, source: "User checked the calendar manually", confirmAvailabilityChecked: true,
    timeZone: "America/Chicago", durationMinutes: 30, bufferMinutes: 15 };
  it("respects busy intervals, buffers and agreement without claiming a booking", () => {
    const result = proposeExecutiveTimes(input, now);
    expect(result).toMatchObject({ status: "proposal", calendarBooked: false, requiresAgreement: true });
    expect(result.slots[0]).toEqual({ start: today + "T14:15:00.000Z", end: today + "T14:45:00.000Z" });
    expect(result.slots.every(s => Date.parse(s.end) <= Date.parse(today + "T14:45:00Z") || Date.parse(s.start) >= Date.parse(today + "T16:15:00Z"))).toBe(true);
  });
  it("rejects stale/future availability, local ambiguous timestamps and hidden calendars", () => {
    for (const patch of [{ checkedAt: "2026-09-07T12:00:00Z" }, { checkedAt: today + "T13:00:00Z" },
      { confirmAvailabilityChecked: false }, { timeZone: "Bad/Zone" }, { providerCredential: "not-a-secret" },
      { offered: [{ start: today + "T14:00:00", end: today + "T18:00:00" }] }])
      expect(() => proposeExecutiveTimes({ ...input, ...patch }, now)).toThrow();
  });
  it("compares actual instants through a daylight-saving overlap", () => {
    const value = { ...input, offered: [{ start: "2026-11-01T01:00:00-04:00", end: "2026-11-01T02:00:00-05:00" }],
      available: [{ start: "2026-11-01T01:00:00-04:00", end: "2026-11-01T02:00:00-05:00" }], busy: [],
      checkedAt: "2026-11-01T04:00:00Z", timeZone: "America/New_York", bufferMinutes: 0 };
    const result = proposeExecutiveTimes(value, value.checkedAt);
    expect(result.slots).toHaveLength(3);
    expect(result.slots[0].start).toBe("2026-11-01T05:00:00.000Z");
    expect(result.slots[2].start).toBe("2026-11-01T06:00:00.000Z");
  });
  it("reports no overlap rather than inventing availability", () => {
    const value = { ...input, busy: [{ start: today + "T12:00:00Z", end: today + "T20:00:00Z" }] };
    expect(proposeExecutiveTimes(value, now)).toMatchObject({ status: "no_overlap", slots: [], calendarBooked: false });
  });
});
