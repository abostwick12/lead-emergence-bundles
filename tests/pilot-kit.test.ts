import { describe, expect, it } from "vitest";
import { assessRepresentativePilot, representativePilotKit, representativePilotKitByBundle,
  representativePilotKits, representativePilotRun } from "../bundles/pilot-kit";
import { loadArtifacts } from "./fixtures";

const completed = (bundleKey: keyof typeof representativePilotKitByBundle, index: number, overrides = {}) => {
  const kit = representativePilotKitByBundle[bundleKey];
  return representativePilotRun.parse({
    schemaVersion: "1.0", scenarioId: kit.scenarioId, bundleKey, pilotId: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    mode: "authorized_representative", attemptedAt: `2026-09-${String(index).padStart(2, "0")}T12:00:00Z`, facilitatorActions: 0,
    issueCodes: [], status: "completed", elapsedSeconds: kit.targetMinutes * 60 - 1, baselineMinutes: kit.targetMinutes + 15,
    outcomeAchieved: true, successSignalIds: [kit.expectedSignalIds[0]], ratings: { usefulness: 4, trust: 4, actionability: 4 },
    gates: { evidenceVisible: true, provenanceVisible: true, mutationControlPreserved: true }, correctionCount: 1, ...overrides
  });
};

describe("representative bundle pilot kits", () => {
  it("defines one bounded synthetic scenario for every bundle manifest", () => {
    const bundleArtifacts = loadArtifacts();
    expect(representativePilotKits).toHaveLength(6);
    expect(new Set(representativePilotKits.map(kit => kit.bundleKey))).toEqual(new Set(bundleArtifacts.map(item => item.manifest.identity.key)));
    for (const artifact of bundleArtifacts) {
      const kit = representativePilotKitByBundle[artifact.manifest.identity.key as keyof typeof representativePilotKitByBundle];
      expect(representativePilotKit.parse(kit)).toEqual(kit);
      expect(kit.manifestVersion).toBe(artifact.manifest.identity.version);
      expect(kit.targetMinutes).toBe(artifact.manifest.experience.timeToFirstValueMinutes);
      expect(kit.expectedSignalIds).toEqual(artifact.manifest.experience.successSignals.map(signal => signal.id));
      expect(kit.syntheticDataNotice.toLowerCase()).toContain("fictional");
      expect(kit.preparation.every(step => step.excludedFromTimer)).toBe(true);
      expect(kit.thresholds.minimumRepresentativeAttempts).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps run records structured and refuses work content or participant identity", () => {
    const valid = completed("writer_editor", 1);
    expect(valid.status).toBe("completed");
    expect(representativePilotRun.safeParse({ ...valid, notes: "private source text" }).success).toBe(false);
    expect(representativePilotRun.safeParse({ ...valid, outcomeAchieved: false }).success).toBe(false);
    expect(representativePilotRun.safeParse({ ...valid, participantName: "A Person" }).success).toBe(false);
  });

  it("excludes rehearsal attempts and requires representative repeated use", () => {
    const kit = representativePilotKitByBundle.executive;
    const rehearsal = completed("executive", 1, { mode: "synthetic_rehearsal" });
    const result = assessRepresentativePilot(kit, [rehearsal]);
    expect(result.decision).toBe("insufficient_evidence");
    expect(result.metrics.representativeAttempts).toBe(0);
    expect(result.metrics.rehearsalAttemptsExcluded).toBe(1);
  });

  it("advances only a repeated, unaided, safe and useful representative cohort", () => {
    const kit = representativePilotKitByBundle.ministry;
    const result = assessRepresentativePilot(kit, [completed("ministry", 1), completed("ministry", 2), completed("ministry", 3)]);
    expect(result.decision).toBe("advance_to_controlled_beta");
    expect(result.reasons).toEqual([]);
    expect(result.metrics).toMatchObject({ representativeAttempts: 3, completedAttempts: 3, unaidedAttempts: 3,
      completionRate: 1, outcomeRate: 1, targetRate: 1, medianCorrections: 1, allTrustGatesMet: true, criticalIssueCount: 0 });
  });

  it("requires iteration when trust, usability, or safety evidence fails", () => {
    const kit = representativePilotKitByBundle.nonprofit_founder;
    const poor = { ratings: { usefulness: 2, trust: 2, actionability: 2 },
      gates: { evidenceVisible: false, provenanceVisible: false, mutationControlPreserved: true },
      correctionCount: 8, issueCodes: ["unsafe_domain_guidance"] };
    const result = assessRepresentativePilot(kit, [completed("nonprofit_founder", 1),
      completed("nonprofit_founder", 2, poor), completed("nonprofit_founder", 3, poor)]);
    expect(result.decision).toBe("iterate_and_repeat");
    expect(result.reasons).toEqual(expect.arrayContaining(["median_rating_below_threshold", "corrections_above_threshold", "trust_gate_failure", "critical_issue_observed"]));
  });

  it("rejects duplicate, cross-bundle, and undeclared-signal evidence", () => {
    const kit = representativePilotKitByBundle.investor;
    const run = completed("investor", 1);
    expect(() => assessRepresentativePilot(kit, [run, run])).toThrow("unique");
    expect(() => assessRepresentativePilot(kit, [completed("executive", 2)])).toThrow("match");
    expect(() => assessRepresentativePilot(kit, [completed("investor", 3, { successSignalIds: ["investor.signal.unknown"] })])).toThrow("outside");
  });
});
