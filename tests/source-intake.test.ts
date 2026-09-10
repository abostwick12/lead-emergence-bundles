import { describe, expect, it } from "vitest";
import {
  inspectSourceIntakeDescriptor, sourceIntakeExtraction, sourceIntakeLimits,
  sourceIntakeTitle
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
});
