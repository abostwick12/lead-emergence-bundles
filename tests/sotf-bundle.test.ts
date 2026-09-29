import { describe, expect, it } from "vitest";
import { reviewTransitionLoop, SOTF_OPERATING_LOOP } from "../bundles/sotf-transition/contracts";
import { loadArtifacts } from "./fixtures";

describe("SOTF bundle", () => {
  const artifact = loadArtifacts().find((item) => item.manifest.identity.key === "sotf_transition")!;

  it("is the seventh canonical bundle with the exact approved capabilities", () => {
    expect(artifact.manifest.identity).toMatchObject({
      key: "sotf_transition",
      version: "1.0.1",
      displayName: "SOTF Bundle"
    });
    expect(artifact.manifest.capabilities.map((item) => item.id)).toEqual([
      "career",
      "daily_brief",
      "memory",
      "workspace_mcp",
      "agentic_workflows"
    ]);
    expect(JSON.stringify(artifact)).not.toContain("professional_context");
  });

  it("keeps core_workspace separate as a host prerequisite", () => {
    expect(artifact.manifest.hostPrerequisites).toEqual([{
      id: "core_workspace",
      minimumContractVersion: "1.0.0",
      required: true,
      purpose: expect.stringContaining("not granted")
    }]);
    expect(artifact.manifest.capabilities.some((item) => item.id === "core_workspace")).toBe(false);
    expect(artifact.manifest.appRequirements).toEqual([]);
    expect(artifact.manifest.providerRequirements).toEqual([]);
  });

  it("defines the transition operating loop without a host implementation", () => {
    expect(SOTF_OPERATING_LOOP).toEqual([
      "conversation",
      "decision",
      "action",
      "evidence",
      "learning",
      "better_next_decision"
    ]);
    expect(artifact.manifest.workflows.map((item) => item.id)).toEqual([
      "sotf.workflow.clarify_direction",
      "sotf.workflow.assess_opportunity",
      "sotf.workflow.prepare_conversation",
      "sotf.workflow.daily_brief",
      "sotf.workflow.weekly_learning"
    ]);
    expect(artifact.manifest.workflows.every((item) => item.mode === "propose")).toBe(true);
  });

  it("reviews evidence, hypotheses, and accepted next moves deterministically", () => {
    expect(reviewTransitionLoop({
      asOf: "2026-09-19T20:00:00.000Z",
      evidence: [{
        id: "evidence-1",
        observation: "A hiring manager requested a second conversation.",
        source: "user report",
        observedAt: "2026-09-19T19:00:00.000Z",
        kind: "observed"
      }],
      hypotheses: [
        {
          id: "hypothesis-supported",
          statement: "The opportunity is worth testing.",
          status: "current",
          evidenceIds: ["evidence-1"],
          userConfirmed: true
        },
        {
          id: "hypothesis-unsupported",
          statement: "The role has executive sponsorship.",
          status: "current",
          evidenceIds: ["missing-evidence"],
          userConfirmed: false
        }
      ],
      nextMoves: [{
        id: "move-1",
        action: "Prepare three questions for the second conversation.",
        reason: "Test scope and sponsorship.",
        testsHypothesisId: "hypothesis-unsupported",
        status: "accepted"
      }]
    })).toEqual({
      unsupportedHypothesisIds: ["hypothesis-unsupported"],
      acceptedOpenMoveIds: ["move-1"],
      nextReviewReason: "new_evidence"
    });
  });
});
