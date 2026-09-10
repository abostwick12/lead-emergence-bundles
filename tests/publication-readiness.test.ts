import { describe, expect, it } from "vitest";
import {
  normalizePublicationDestination, publicationEvidenceInput, publicationQueueItem,
  publicationQueueReceipt, publicationQueueSaveInput, publicationReadinessLimits
} from "../bundles/publication-readiness";

const destination = "https://resources.example.com/sermons/welcome";
const confirmations = { accuracyAndQuotesReviewed: true, voiceReviewed: true, rightsConfirmed: true };

describe("publication readiness contract", () => {
  it("normalizes a public HTTPS destination without contacting it", () => {
    expect(normalizePublicationDestination(" HTTPS://Resources.Example.com/sermons/welcome ")).toBe(destination);
    expect(publicationReadinessLimits.evidenceFreshnessDays).toBe(30);
  });

  it.each([
    "http://resources.example.com", "https://localhost/path", "https://cms.internal/path",
    "https://127.0.0.1/path", "https://[::1]/path", "https://user:secret@example.com/path",
    "https://example.com:8443/path", "https://single-label/path"
  ])("rejects unsafe or non-public-looking destination %s", value => {
    expect(() => normalizePublicationDestination(value)).toThrow("invalid_publication_destination");
  });

  it("requires an explicit, revision-bound queue decision", () => {
    const value = { resourceId: "21111111-1111-4111-8111-111111111111", expectedResourceRevision: 2, expectedVersion: 0,
      requestId: "21222222-2222-4222-8222-222222222222", destinationUrl: destination, note: "Fictional handoff",
      stage: "queued", confirmations, confirmQueueChange: true } as const;
    expect(publicationQueueSaveInput.parse(value).destinationUrl).toBe(destination);
    expect(publicationQueueSaveInput.safeParse({ ...value, confirmQueueChange: false }).success).toBe(false);
  });

  it("requires redirect evidence to identify its final destination", () => {
    const value = { queueId: "21333333-3333-4333-8333-333333333333", expectedVersion: 1,
      requestId: "21444444-4444-4444-8444-444444444444", result: "redirected", finalUrl: null,
      note: "Observed manually", confirmObservation: true } as const;
    expect(publicationEvidenceInput.safeParse(value).success).toBe(false);
    expect(publicationEvidenceInput.safeParse({ ...value, finalUrl: "https://www.example.com/final" }).success).toBe(true);
    expect(publicationEvidenceInput.safeParse({ ...value, result: "working", finalUrl: "https://www.example.com/final" }).success).toBe(false);
  });

  it("keeps readiness derived from the current blocker evidence", () => {
    const item = { id: "21333333-3333-4333-8333-333333333333", resourceId: "21111111-1111-4111-8111-111111111111",
      title: "Fictional resource", resourceRevision: 2, currentResourceRevision: 2, version: 3, stage: "ready_for_handoff",
      publicationState: "ready", destinationUrl: destination, note: "", confirmations, pendingProposals: 0,
      evidenceStatus: "checked", lastEvidence: { id: "21555555-5555-4555-8555-555555555555", resourceRevision: 2,
        targetUrl: destination, result: "working", finalUrl: null, note: "", checkedAt: "2026-09-10T12:00:00Z" },
      blockers: [], readyForHandoff: true, createdAt: "2026-09-10T11:00:00Z", updatedAt: "2026-09-10T12:00:00Z" } as const;
    expect(publicationQueueItem.safeParse(item).success).toBe(true);
    expect(publicationQueueItem.safeParse({ ...item, readyForHandoff: false }).success).toBe(false);
    expect(publicationQueueReceipt.safeParse({ item, replayed: true }).success).toBe(true);
  });
});
