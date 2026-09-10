import { describe, expect, it } from "vitest";
import {
  inspectSourceIntakeDescriptor, sourceBatchCommit, sourceBatchItems, sourceBatchLimits,
  sourceBatchReview, sourceBatchSnapshot, sourceIntakeExtraction, sourceIntakeLimits, sourceIntakeTitle
} from "../bundles/source-intake";

describe("source intake contract", () => {
  it.each([
    ["notes.txt", "text/plain", "plain_text"],
    ["draft.MD", "text/markdown; charset=utf-8", "markdown"],
    ["sermon.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "word_docx"],
    ["filing.pdf", "application/pdf", "pdf"]
  ] as const)("classifies %s using an allowlisted extension and compatible declared type", (fileName, mediaType, format) => {
    expect(inspectSourceIntakeDescriptor({ fileName, mediaType, byteSize: 42 })).toEqual({ fileName, mediaType: mediaType.split(";")[0].toLowerCase(), byteSize: 42, format });
  });

  it.each([
    { fileName: "report.pdf.exe", mediaType: "application/pdf", byteSize: 10 },
    { fileName: "report.pdf", mediaType: "text/html", byteSize: 10 },
    { fileName: "../report.pdf", mediaType: "application/pdf", byteSize: 10 },
    { fileName: "report\u0000.pdf", mediaType: "application/pdf", byteSize: 10 },
    { fileName: ".hidden.pdf", mediaType: "application/pdf", byteSize: 10 },
    { fileName: "empty.txt", mediaType: "text/plain", byteSize: 0 },
    { fileName: "large.docx", mediaType: "application/octet-stream", byteSize: sourceIntakeLimits.maximumFileBytes + 1 }
  ])("rejects unsafe, incompatible, empty, or oversized descriptors %#", input => {
    expect(() => inspectSourceIntakeDescriptor(input)).toThrow();
  });

  it("creates a bounded human title without retaining path syntax", () => {
    expect(sourceIntakeTitle("A_long-sermon-draft.docx")).toBe("A long sermon draft");
    expect(sourceIntakeTitle(".docx")).toBe("Imported document");
  });

  it("publishes bounded archive and PDF limits for independent host enforcement", () => {
    expect(sourceIntakeLimits).toMatchObject({ maximumPdfPages: 100, maximumDocxEntries: 500,
      maximumDocxExpandedBytes: 15_000_000, maximumDocxEntryBytes: 10_000_000, maximumDocxCompressionRatio: 200 });
  });

  it("accepts a content-free extraction receipt and verifies derived fields", () => {
    const value = { schemaVersion: "1.0", file: { name: "sermon.docx", format: "word_docx", mediaType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", byteSize: 100, sha256: "a".repeat(64) },
      titleSuggestion: "Sermon", text: "A useful source", characterCount: 15, wordCount: 3,
      pageCount: null, warnings: ["formatting_not_preserved", "review_extracted_text"], originalRetained: false } as const;
    expect(sourceIntakeExtraction.safeParse(value).success).toBe(true);
    expect(sourceIntakeExtraction.safeParse({ ...value, characterCount: 14 }).success).toBe(false);
    expect(sourceIntakeExtraction.safeParse({ ...value, pageCount: 1 }).success).toBe(false);
    expect(sourceIntakeExtraction.safeParse({ ...value, warnings: ["review_extracted_text", "review_extracted_text"] }).success).toBe(false);
    expect(sourceIntakeExtraction.safeParse({ ...value, originalRetained: true }).success).toBe(false);
  });

  it("bounds resumable source batches by item identity and aggregate extracted text", () => {
    const extraction = { schemaVersion: "1.0", file: { name: "source.txt", format: "plain_text", mediaType: "text/plain", byteSize: 3, sha256: "a".repeat(64) },
      titleSuggestion: "Source", text: "one", characterCount: 3, wordCount: 1, pageCount: null,
      warnings: ["review_extracted_text"], originalRetained: false } as const;
    const item = { itemId: "19111111-1111-4111-8111-111111111111", extraction, title: "Source", sourceLabel: "Imported from source.txt", resourceType: "article", included: true } as const;
    expect(sourceBatchItems.safeParse([item]).success).toBe(true);
    expect(sourceBatchItems.safeParse([item, item]).success).toBe(false);
    expect(sourceBatchLimits).toEqual({ maximumItems: 20, maximumAggregateCharacters: 500_000, maximumRequestBytes: 650_000 });
    expect(sourceBatchSnapshot.safeParse({ schemaVersion: "1.0", version: 1, requestId: item.itemId, items: [item], savedAt: "2026-09-10T12:00:00Z" }).success).toBe(true);
    expect(sourceBatchSnapshot.safeParse({ schemaVersion: "1.0", version: 1, requestId: item.itemId, items: [item], savedAt: null }).success).toBe(false);
  });

  it("validates current duplicate-review tokens and bounded atomic import receipts", () => {
    const review = { schemaVersion: "1.0", version: 2, reviewedAt: "2026-09-10T12:00:00Z", reviewToken: "b".repeat(64), items: [{ itemId: "19111111-1111-4111-8111-111111111111",
      candidates: [{ candidateType: "existing_resource", candidateId: "19222222-2222-4222-8222-222222222222", title: "Existing", signals: ["same_text_ignoring_whitespace"] }] }] } as const;
    expect(sourceBatchReview.safeParse(review).success).toBe(true);
    expect(sourceBatchReview.safeParse({ ...review, reviewToken: "not-a-token" }).success).toBe(false);
    expect(sourceBatchCommit.safeParse({ schemaVersion: "1.0", batchVersion: 3, replayed: false,
      resources: [{ itemId: review.items[0].itemId, resourceId: "19333333-3333-4333-8333-333333333333", title: "Source" }] }).success).toBe(true);
  });
});
