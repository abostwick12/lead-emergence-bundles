import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assessInstalledModelRehearsal, installedModelRehearsalRun } from "../bundles/model-rehearsal";
import { representativePilotKitByBundle } from "../bundles/pilot-kit";

const completeRun = () => {
  const kit = representativePilotKitByBundle.executive;
  return installedModelRehearsalRun.parse({
    schemaVersion: "1.0",
    scenarioId: kit.scenarioId,
    bundleKey: kit.bundleKey,
    packageName: "lead-emergence-executive",
    packageVersion: "0.2.2",
    qualifiedSkill: "lead-emergence-executive:executive-daily-brief",
    sourceRevision: "2a0b742000000000000000000000000000000000",
    attemptedOn: "2026-09-11",
    host: "codex-cli",
    cliVersion: "0.153.4",
    model: "gpt-5.6-sol",
    promptSource: "representative_pilot_packet",
    fictionalData: true,
    representativeUserUsed: false,
    clientValidationClaimed: false,
    externalConnectionsUsed: false,
    installedInvocationObserved: true,
    artifactComplete: true,
    entrypointTruncated: false,
    reviewerIndependence: "same_model_family",
    outputSummary: "A bounded fictional attention brief.",
    hostLimitations: [],
    rubricResults: kit.rubric.map(item => ({ rubricId: item.id, status: "pass" as const, evidence: item.passDescription })),
    safetyResults: kit.safetyChecks.map(item => ({ issueCode: item.issueCode, status: "pass" as const, evidence: item.passDescription }))
  });
};

describe("installed model rehearsal evidence", () => {
  it("validates one bounded installed-Sol result for every bundle without claiming shipment", () => {
    const records = JSON.parse(readFileSync(join(process.cwd(), "docs", "release", "evidence",
      "installed-sol-2026-09-11.json"), "utf8")) as unknown[];
    const results = records.map(record => {
      const run = installedModelRehearsalRun.parse(record);
      return assessInstalledModelRehearsal(representativePilotKitByBundle[run.bundleKey], run);
    });
    expect(new Set(results.map(result => result.bundleKey))).toEqual(new Set(Object.keys(representativePilotKitByBundle)));
    expect(results).toHaveLength(6);
    expect(results.every(result => result.decision === "bounded_pass_with_host_limitations")).toBe(true);
    expect(results.reduce((sum, result) => sum + result.passedRubrics, 0)).toBe(23);
    expect(results.reduce((sum, result) => sum + result.passedSafetyChecks, 0)).toBe(17);
    expect(results.reduce((sum, result) => sum + result.notObservable, 0)).toBe(2);
    expect(results.every(result => !result.representativeEvidence && !result.clientShipmentDecision)).toBe(true);
  });

  it("reports a bounded pass without converting it into client evidence", () => {
    const result = assessInstalledModelRehearsal(representativePilotKitByBundle.executive, completeRun());
    expect(result).toMatchObject({ decision: "bounded_pass", totalRubrics: 4, totalSafetyChecks: 3,
      representativeEvidence: false, clientShipmentDecision: false });
  });

  it("preserves honest host limitations", () => {
    const run = { ...completeRun(), hostLimitations: ["The host loaded unrelated global context."] };
    expect(assessInstalledModelRehearsal(representativePilotKitByBundle.executive, run).decision)
      .toBe("bounded_pass_with_host_limitations");
  });

  it("requires iteration after truncation, incompleteness, or a failed safety check", () => {
    const base = completeRun();
    const run = { ...base, artifactComplete: false, entrypointTruncated: true,
      safetyResults: base.safetyResults.map((item, index) => index ? item : { ...item, status: "fail" as const }) };
    const result = assessInstalledModelRehearsal(representativePilotKitByBundle.executive, run);
    expect(result.decision).toBe("iterate");
    expect(result.reasons).toEqual(expect.arrayContaining(["artifact_incomplete", "entrypoint_truncated", "safety_failure"]));
  });

  it("rejects incomplete or mismatched scorecards", () => {
    const run = completeRun();
    expect(() => assessInstalledModelRehearsal(representativePilotKitByBundle.executive,
      { ...run, rubricResults: run.rubricResults.slice(1) })).toThrow("every pilot rubric");
    expect(() => assessInstalledModelRehearsal(representativePilotKitByBundle.investor, run)).toThrow("match");
  });
});
