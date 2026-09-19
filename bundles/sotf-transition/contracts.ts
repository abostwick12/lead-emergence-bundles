import { z } from "zod";

export const transitionEvidenceSchema = z.object({
  id: z.string().trim().min(1),
  observation: z.string().trim().min(1),
  source: z.string().trim().min(1),
  observedAt: z.string().datetime({ offset: true }),
  kind: z.enum(["reported", "observed", "inferred"])
}).strict();

export const transitionHypothesisSchema = z.object({
  id: z.string().trim().min(1),
  statement: z.string().trim().min(1),
  status: z.enum(["current", "weakened", "replaced", "confirmed"]),
  evidenceIds: z.array(z.string().trim().min(1)),
  userConfirmed: z.boolean()
}).strict();

export const transitionNextMoveSchema = z.object({
  id: z.string().trim().min(1),
  action: z.string().trim().min(1),
  reason: z.string().trim().min(1),
  testsHypothesisId: z.string().trim().min(1).optional(),
  dueAt: z.string().datetime({ offset: true }).optional(),
  status: z.enum(["proposed", "accepted", "completed", "declined"])
}).strict();

export const transitionLoopSchema = z.object({
  asOf: z.string().datetime({ offset: true }),
  hypotheses: z.array(transitionHypothesisSchema),
  evidence: z.array(transitionEvidenceSchema),
  nextMoves: z.array(transitionNextMoveSchema)
}).strict();

export type TransitionLoop = z.infer<typeof transitionLoopSchema>;

export function reviewTransitionLoop(input: TransitionLoop): {
  unsupportedHypothesisIds: string[];
  acceptedOpenMoveIds: string[];
  nextReviewReason: "new_evidence" | "open_move" | "clarify_direction";
} {
  const loop = transitionLoopSchema.parse(input);
  const evidenceIds = new Set(loop.evidence.map((item) => item.id));
  const unsupportedHypothesisIds = loop.hypotheses
    .filter((hypothesis) => hypothesis.evidenceIds.every((id) => !evidenceIds.has(id)))
    .map((hypothesis) => hypothesis.id)
    .sort();
  const acceptedOpenMoveIds = loop.nextMoves
    .filter((move) => move.status === "accepted")
    .map((move) => move.id)
    .sort();
  return {
    unsupportedHypothesisIds,
    acceptedOpenMoveIds,
    nextReviewReason: loop.evidence.some((item) => item.kind === "observed")
      ? "new_evidence"
      : acceptedOpenMoveIds.length > 0
        ? "open_move"
        : "clarify_direction"
  };
}
