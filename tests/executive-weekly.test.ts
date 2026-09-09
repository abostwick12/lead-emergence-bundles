import { describe, expect, it } from "vitest";
import { executiveWeeklyQuery, executiveWeeklyEvent, executiveWeeklyReport, executiveOutcomeRules,
 classifyExecutiveOutcome, weeklyEventKey, weeklyOutcomeLabel, prepareExecutiveWeeklyReview, dateInZone } from "../bundles/executive/weekly";
import { executiveSchemas } from "../bundles/executive/contracts";
const id = "86000000-0000-4000-8000-000000000001", task = "86000000-0000-4000-8000-000000000002";
const source = { capabilityId: "executive.coordination", kind: "commitment", documentId: id, revision: 2 };
const event = { id: weeklyEventKey(source), source, change: "recorded", outcome: "completed", title: "PRIVATE_OUTCOME_TITLE",
 parentTitle: "PRIVATE_PARENT_TITLE", previousState: "open", state: "completed", reportedDate: "2026-08-15", previousReportedDate: null,
 recordedAt: "2026-09-09T12:00:00Z", origin: "user", reviewState: "user_stated", currentRevision: 3, currentState: "open", currentTargetPresent: true };
const report = { schemaVersion: "1.0", periodStart: "2026-09-03", periodEnd: "2026-09-09", timeZone: "America/Chicago",
 windowStart: "2026-09-03T05:00:00Z", windowEndExclusive: "2026-09-10T05:00:00Z", recordedThrough: "2026-09-09T18:00:00Z",
 retrievedAt: "2026-09-09T18:01:00Z", consistency: "recorded_time_cutoff_live_access", offset: 0, limit: 25, total: 1, events: [event],
 coverage: ["executive.coordination", "executive.brief", "executive.review"].map(capabilityId => ({capabilityId, state: "current", total: capabilityId === source.capabilityId ? 1 : 0})) };
describe("Recorded Executive weekly outcomes", () => {
 for (const [kind, rule] of Object.entries(executiveOutcomeRules)) {
  it("classifies recorded, corrected and withdrawn " + kind + " outcomes without ordinary-edit noise", () => {
   const k = kind as keyof typeof executiveOutcomeRules;
   const completed = {state: rule.outcomes[0], [rule.corrections[0]]: "original"};
   expect(classifyExecutiveOutcome(k, null, completed)).toEqual({change: "recorded", outcome: completed.state});
   expect(classifyExecutiveOutcome(k, completed, {...completed, notes: "Unrelated note"})).toBeNull();
   expect(classifyExecutiveOutcome(k, completed, {...completed, [rule.corrections[0]]: "corrected"})).toEqual({change: "corrected", outcome: completed.state});
   expect(classifyExecutiveOutcome(k, completed, {state: "open"})).toEqual({change: "withdrawn", outcome: completed.state});
   expect(classifyExecutiveOutcome(k, {state: "open"}, {state: "waiting"})).toBeNull();
  });
 }
 it("does not call an archived review withdrawn or a reversed decision an accomplishment", () => {
  expect(classifyExecutiveOutcome("weekly_review", {state: "reviewed"}, {state: "archived"})).toBeNull();
  expect(classifyExecutiveOutcome("decision", {state: "decided"}, {state: "reversed"})).toEqual({change: "recorded", outcome: "reversed"});
  expect(weeklyOutcomeLabel({...event, source, change: "recorded", outcome: "reversed"})).toBe("Decision marked reversed");
  expect(classifyExecutiveOutcome("action", {state: "completed"}, null)).toEqual({change: "withdrawn", outcome: "completed"});
 });
 it("bounds inclusive local periods and requires an explicit valid time zone", () => {
  const input = {periodStart: report.periodStart, periodEnd: report.periodEnd, timeZone: report.timeZone};
  expect(executiveWeeklyQuery.parse(input)).toMatchObject({offset: 0, limit: 25});
  for (const patch of [{periodEnd: "2026-09-10"}, {periodEnd: "2026-09-02"}, {timeZone: "not/a/zone"}, {limit: 51}, {offset: -1}, {workspaceId: id}, {periodStart: "2026-02-30"}])
   expect(executiveWeeklyQuery.safeParse({...input, ...patch}).success).toBe(false);
 });
 it("uses recorded timestamps, not a backdated completion date, to select the week", () => {
  expect(executiveWeeklyReport.safeParse(report).success).toBe(true);
  expect(executiveWeeklyReport.safeParse({...report, events: [{...event, recordedAt: "2026-09-03T04:59:59Z"}]}).success).toBe(false);
  expect(executiveWeeklyReport.safeParse({...report, events: [{...event, recordedAt: "2026-09-03T05:00:00Z"}]}).success).toBe(true);
  expect(executiveWeeklyReport.safeParse({...report, events: [{...event, recordedAt: "2026-09-09T18:00:00.001Z"}]}).success).toBe(false);
 });
 it("recognizes both repeated local hours and does not assume a day always has 24 hours", () => {
  expect(dateInZone("2026-11-01T05:30:00Z", "America/New_York")).toBe("2026-11-01");
  expect(dateInZone("2026-11-01T06:30:00Z", "America/New_York")).toBe("2026-11-01");
  expect(dateInZone("2026-03-09T03:59:59Z", "America/New_York")).toBe("2026-03-08");
  expect(dateInZone("2026-03-09T04:00:00Z", "America/New_York")).toBe("2026-03-09");
 });
 it("never presents scheduled meeting times as actual outcome dates", () => {
  const ref = {...source, kind: "meeting"};
  const held = {...event, source: ref, id: weeklyEventKey(ref), outcome: "held", state: "held", previousState: "planned", reportedDate: null};
  expect(executiveWeeklyEvent.safeParse(held).success).toBe(true);
  expect(executiveWeeklyEvent.safeParse({...held, reportedDate: "2026-09-09"}).success).toBe(false);
 });
 it("keeps removed action history explicit and its source parent recoverable", () => {
  const ref = {...source, kind: "meeting", item: {kind: "action" as const, id: task}};
  const removed = {...event, source: ref, id: weeklyEventKey(ref), change: "withdrawn", previousState: "completed", state: null,
   reportedDate: null, currentState: null, currentTargetPresent: false};
  expect(executiveWeeklyEvent.safeParse(removed).success).toBe(true);
  const draft = prepareExecutiveWeeklyReview({...report, events: [removed]});
  expect(draft.references).toEqual([{capabilityId: source.capabilityId, kind: "meeting", documentId: id, revision: 3}]);
 });
 it("rejects foreign history, wrong identities and impossible revisions", () => {
  for (const patch of [{id: "invented"}, {currentRevision: 1}, {currentTargetPresent: false},
   {source: {...source, capabilityId: "nonprofit.roadmap", kind: "plan"}}, {change: "corrected"}, {state: "waiting"}])
   expect(executiveWeeklyEvent.safeParse({...event, ...patch}).success).toBe(false);
 });
 it("requires honest coverage, counts and live review admission", () => {
  for (const patch of [{total: 2}, {coverage: [report.coverage[0], report.coverage[0], report.coverage[2]]},
   {coverage: report.coverage.map(c => c.capabilityId === "executive.review" ? {...c, state: "unavailable", total: null} : c)},
   {coverage: report.coverage.map(c => c.capabilityId === source.capabilityId ? {...c, state: "unavailable"} : c)}])
   expect(executiveWeeklyReport.safeParse({...report, ...patch}).success).toBe(false);
  expect(executiveWeeklyReport.safeParse({...report, coverage: report.coverage.map(c => c.capabilityId === "executive.brief" ? {...c, state: "unavailable", total: null} : c)}).success).toBe(true);
 });
 it("orders ties by stable identity and rejects duplicate events", () => {
  const laterSource = {...source, revision: 3}, later = {...event, currentRevision: 4, source: laterSource, id: weeklyEventKey(laterSource)};
  const many = {...report, total: 2, coverage: report.coverage.map(c => ({...c, total: c.capabilityId === source.capabilityId ? 2 : 0}))};
  expect(executiveWeeklyReport.safeParse({...many, events: [later, event]}).success).toBe(true);
  expect(executiveWeeklyReport.safeParse({...many, events: [event, later]}).success).toBe(false);
  expect(executiveWeeklyReport.safeParse({...many, events: [event, event]}).success).toBe(false);
 });
 it("builds an unsaved, bounded review without permanently copying private outcome titles", () => {
  const draft = prepareExecutiveWeeklyReview(report);
  expect(executiveSchemas.weekly_review.safeParse(draft).success).toBe(true);
  expect(draft).toMatchObject({periodStart: report.periodStart, periodEnd: report.periodEnd, state: "draft", reviewState: "inferred", actions: []});
  expect(draft.references[0].revision).toBe(3);
  expect(JSON.stringify(draft)).not.toContain("PRIVATE_OUTCOME_TITLE");
  expect(JSON.stringify(draft)).not.toContain("PRIVATE_PARENT_TITLE");
  expect(draft.summary).toContain("not independently verified accomplishments");
  expect(draft.summary).toContain("not a frozen snapshot");
  expect(() => prepareExecutiveWeeklyReview({...report, events: [], offset: 1})).toThrow(/first outcome page/);
 });
 it("compares microseconds and rejects malformed instants without throwing", () => {
  const laterSource = {...source, revision: 3};
  const later = {...event, source: laterSource, id: weeklyEventKey(laterSource), currentRevision: 4, recordedAt: "2026-09-09T12:00:00.000001Z"};
  const newer = {...event, recordedAt: "2026-09-09T12:00:00.000002Z"};
  const many = {...report, total: 2, coverage: report.coverage.map(c => ({...c, total: c.capabilityId === source.capabilityId ? 2 : 0}))};
  expect(executiveWeeklyReport.safeParse({...many, events: [newer, later]}).success).toBe(true);
  expect(executiveWeeklyReport.safeParse({...many, events: [later, newer]}).success).toBe(false);
  for (const patch of [{recordedThrough: "invalid"}, {windowStart: "invalid"}, {timeZone: "invalid"}, {events: [{...event, recordedAt: "invalid"}]}])
   expect(executiveWeeklyReport.safeParse({...report, ...patch}).success).toBe(false);
 });
 it("ignores object-key order just as the private JSONB classifier does", () => {
  expect(classifyExecutiveOutcome("weekly_review", {state: "reviewed", observations: [{title: "a", id: "b"}]},
   {state: "reviewed", observations: [{id: "b", title: "a"}]})).toBeNull();
 });
 it("does not turn an empty period into a claim that all work is complete", () => {
  const draft = prepareExecutiveWeeklyReview({...report, events: [], total: 0, coverage: report.coverage.map(c => ({...c, total: 0}))});
  expect(draft.summary).toContain("0 recorded outcome changes");
  expect(draft.summary).toContain("other bundles' history");
  expect(draft.references).toEqual([]);
 });
});
