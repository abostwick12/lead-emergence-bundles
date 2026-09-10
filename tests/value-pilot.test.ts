import { describe, expect, it } from "vitest";
import { assessValuePilot, valuePilotChange, valuePilotDashboard, valuePilotSession } from "../bundles/value-pilot";

const ids = ["executive.signal.brief_accepted"];
const requiredGates = { evidenceRequired: true, provenanceRequired: true, mutationConfirmationRequired: true };
const ratings = { usefulness: 4, trust: 5, actionability: 4 };
const gates = { evidenceVisible: true, provenanceVisible: true, mutationControlPreserved: true };
const base = {
  schemaVersion: "1.0", id: "11111111-1111-4111-8111-111111111111", bundleKey: "executive",
  status: "completed", version: 2, manifestVersion: "0.5.0", targetMinutes: 8, baselineMinutes: 30,
  availableSignalIds: ids, requiredGates, startedAt: "2026-09-10T12:00:00Z",
  completedAt: "2026-09-10T12:07:00Z", abandonedAt: null, abandonment: null,
  result: { elapsedSeconds: 420, outcomeAchieved: true, successSignalIds: ids, ratings, gates,
    correctionCount: 1, targetMet: true, qualityGatesMet: true, estimatedMinutesSaved: 23, assessment: "strong_signal" },
  receipt: { requestId: "22222222-2222-4222-8222-222222222222", operation: "finish", version: 2, recordedAt: "2026-09-10T12:07:00Z" }
} as const;

describe("bundle value pilot contract", () => {
  it("derives time and trust outcomes without turning them into verified facts", () => {
    expect(assessValuePilot({ baselineMinutes: 30, targetMinutes: 8, elapsedSeconds: 420,
      outcomeAchieved: true, ratings, gates, requiredGates })).toEqual({
        targetMet: true, qualityGatesMet: true, estimatedMinutesSaved: 23, assessment: "strong_signal"
      });
    expect(assessValuePilot({ baselineMinutes: 5, targetMinutes: 8, elapsedSeconds: 600,
      outcomeAchieved: true, ratings: { ...ratings, trust: 2 }, gates, requiredGates })).toEqual({
        targetMet: false, qualityGatesMet: true, estimatedMinutesSaved: 0, assessment: "needs_iteration"
      });
  });
  it("rejects retrospective baseline edits, prose content and contradictory outcomes", () => {
    expect(valuePilotChange.safeParse({ operation: "start", requestId: crypto.randomUUID(), bundleKey: "ministry", baselineMinutes: 30 }).success).toBe(true);
    expect(valuePilotChange.safeParse({ operation: "finish", requestId: crypto.randomUUID(), pilotId: crypto.randomUUID(), expectedVersion: 1,
      baselineMinutes: 90, outcomeAchieved: false, successSignalIds: [], ratings, gates, correctionCount: 0 }).success).toBe(false);
    expect(valuePilotChange.safeParse({ operation: "finish", requestId: crypto.randomUUID(), pilotId: crypto.randomUUID(), expectedVersion: 1,
      outcomeAchieved: false, successSignalIds: ids, ratings, gates, correctionCount: 0 }).success).toBe(false);
    expect(valuePilotChange.safeParse({ operation: "abandon", requestId: crypto.randomUUID(), pilotId: crypto.randomUUID(), expectedVersion: 1,
      reason: "source_gap", notes: "private client details" }).success).toBe(false);
  });
  it("verifies derived session fields and dashboard completeness", () => {
    expect(valuePilotSession.safeParse(base).success).toBe(true);
    expect(valuePilotSession.safeParse({ ...base, result: { ...base.result, estimatedMinutesSaved: 24 } }).success).toBe(false);
    const definition = (bundleKey: string) => ({ schemaVersion: "1.0", bundleKey, manifestVersion: "0.1.0", displayName: bundleKey,
      promise: "A useful outcome.", firstRunOutcome: "One useful outcome.", targetMinutes: 10,
      successSignals: [{ id: `${bundleKey}.signal.complete`, description: "A user-reported useful result." }],
      qualityGates: requiredGates, workspaceRoute: "/workspace", available: true });
    const keys = ["executive", "writer_editor", "ministry", "nonprofit_founder", "investor", "workspace_experience"];
    expect(valuePilotDashboard.safeParse({ schemaVersion: "1.0", generatedAt: "2026-09-10T12:08:00Z",
      definitions: keys.map(definition), sessions: [base] }).success).toBe(true);
    expect(valuePilotDashboard.safeParse({ schemaVersion: "1.0", generatedAt: "2026-09-10T12:08:00Z",
      definitions: keys.slice(1).map(definition), sessions: [] }).success).toBe(false);
  });
});
