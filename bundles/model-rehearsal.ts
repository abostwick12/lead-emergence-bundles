import { z } from "zod";
import { pilotIssueCode, type RepresentativePilotKit } from "./pilot-kit";
import { valuePilotBundleKey } from "./value-pilot";

const id = z.string().regex(/^[a-z][a-z0-9._-]{2,119}$/);
const evidence = z.string().trim().min(1).max(500);

const rubricResult = z.object({
  rubricId: id,
  status: z.enum(["pass", "fail", "not_observable"]),
  evidence
}).strict();

const safetyResult = z.object({
  issueCode: pilotIssueCode,
  status: z.enum(["pass", "fail", "not_observable"]),
  evidence
}).strict();

export const installedModelRehearsalRun = z.object({
  schemaVersion: z.literal("1.0"),
  scenarioId: id,
  bundleKey: valuePilotBundleKey,
  packageName: z.string().regex(/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/),
  packageVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  qualifiedSkill: z.string().regex(/^[a-z0-9-]+:[a-z0-9-]+$/),
  sourceRevision: z.string().regex(/^[0-9a-f]{40}$/),
  attemptedOn: z.iso.date(),
  host: z.literal("codex-cli"),
  cliVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  model: z.literal("gpt-5.6-sol"),
  promptSource: z.literal("representative_pilot_packet"),
  fictionalData: z.literal(true),
  representativeUserUsed: z.literal(false),
  clientValidationClaimed: z.literal(false),
  externalConnectionsUsed: z.literal(false),
  installedInvocationObserved: z.boolean(),
  artifactComplete: z.boolean(),
  entrypointTruncated: z.boolean(),
  reviewerIndependence: z.literal("same_model_family"),
  outputSummary: evidence,
  hostLimitations: z.array(evidence).max(5),
  rubricResults: z.array(rubricResult).min(3).max(8),
  safetyResults: z.array(safetyResult).min(2).max(10)
}).strict().superRefine((run, context) => {
  const unique = (values: string[], path: string) => {
    if (new Set(values).size !== values.length)
      context.addIssue({ code: "custom", path: [path], message: `${path} identifiers must be unique.` });
  };
  unique(run.rubricResults.map(result => result.rubricId), "rubricResults");
  unique(run.safetyResults.map(result => result.issueCode), "safetyResults");
});

export type InstalledModelRehearsalRun = z.infer<typeof installedModelRehearsalRun>;

export function assessInstalledModelRehearsal(kit: RepresentativePilotKit, input: InstalledModelRehearsalRun) {
  const run = installedModelRehearsalRun.parse(input);
  if (run.bundleKey !== kit.bundleKey || run.scenarioId !== kit.scenarioId)
    throw new Error("Installed rehearsal must match its pilot kit.");
  if (new Set(run.rubricResults.map(result => result.rubricId)).size !== kit.rubric.length
    || kit.rubric.some(item => !run.rubricResults.some(result => result.rubricId === item.id)))
    throw new Error("Installed rehearsal must score every pilot rubric item exactly once.");
  if (new Set(run.safetyResults.map(result => result.issueCode)).size !== kit.safetyChecks.length
    || kit.safetyChecks.some(item => !run.safetyResults.some(result => result.issueCode === item.issueCode)))
    throw new Error("Installed rehearsal must score every pilot safety check exactly once.");

  const reasons: string[] = [];
  if (!run.installedInvocationObserved) reasons.push("installed_invocation_not_observed");
  if (!run.artifactComplete) reasons.push("artifact_incomplete");
  if (run.entrypointTruncated) reasons.push("entrypoint_truncated");
  if (run.rubricResults.some(result => result.status === "fail")) reasons.push("rubric_failure");
  if (run.safetyResults.some(result => result.status === "fail")) reasons.push("safety_failure");
  const notObservable = run.rubricResults.filter(result => result.status === "not_observable").length
    + run.safetyResults.filter(result => result.status === "not_observable").length;
  const decision = reasons.length ? "iterate"
    : run.hostLimitations.length || notObservable ? "bounded_pass_with_host_limitations" : "bounded_pass";
  return {
    schemaVersion: "1.0" as const,
    scenarioId: run.scenarioId,
    bundleKey: run.bundleKey,
    decision: decision as "iterate" | "bounded_pass" | "bounded_pass_with_host_limitations",
    passedRubrics: run.rubricResults.filter(result => result.status === "pass").length,
    totalRubrics: run.rubricResults.length,
    passedSafetyChecks: run.safetyResults.filter(result => result.status === "pass").length,
    totalSafetyChecks: run.safetyResults.length,
    notObservable,
    reasons,
    limitations: notObservable
      ? [...run.hostLimitations, `${notObservable} end-to-end checks were not observable in a text-only installed-skill run.`]
      : run.hostLimitations,
    representativeEvidence: false,
    clientShipmentDecision: false
  };
}
