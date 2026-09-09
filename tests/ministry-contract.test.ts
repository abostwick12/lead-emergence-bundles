import { describe, expect, it } from "vitest";
import { documentSave, emptyArchive, emptyProfile, emptyProject, ministryDocument, researchProject, researchSource, theologicalProfile } from "../bundles/ministry/contracts";
const id = "82000000-0000-4000-8000-000000000001";
const other = "82000000-0000-4000-8000-000000000002";
const source = { id, title: "A fictional source", layer: "biblical_text", reference: "Fictional passage reference", author: "", url: null, sourceDate: null, retrievedDate: null, excerpt: "Source evidence.", comment: "" };
describe("Reusable Ministry domain contract", () => {
 it("has no inherited client theology or translations", () => {
  expect(theologicalProfile.parse(emptyProfile)).toEqual({ traditionContext: "", preferredTranslations: [], interpretiveNotes: "", dialoguePreferences: "", positions: [] });
 });
 it("preserves distinct position states instead of promoting inferred belief", () => {
  const positions = ["inferred", "user_stated", "confirmed", "rejected"].map((epistemicState, i) => ({ id: id.slice(0, -1) + (i + 1), statement: "Fictional position " + i, epistemicState, sourceReference: "User review" }));
  expect(theologicalProfile.parse({ ...emptyProfile, positions }).positions.map(p => p.epistemicState)).toEqual(["inferred", "user_stated", "confirmed", "rejected"]);
 });
 it("requires native profile confirmation and rejects tenant/status overrides", () => {
  const input = { kind: "profile", documentId: null, expectedRevision: 0, requestId: id, data: emptyProfile, confirmProfile: true };
  expect(documentSave.safeParse(input).success).toBe(true);
  expect(documentSave.safeParse({ ...input, confirmProfile: false }).success).toBe(false);
  expect(documentSave.safeParse({ ...input, tenantId: other }).success).toBe(false);
  expect(theologicalProfile.safeParse({ ...emptyProfile, epistemicState: "confirmed" }).success).toBe(false);
 });
 it("separates a cleared profile from empty research or archive data", () => {
  const base = { documentId: null, expectedRevision: 0, requestId: id, data: null, confirmProfile: true };
  expect(documentSave.safeParse({ ...base, kind: "profile" }).success).toBe(true);
  expect(documentSave.safeParse({ ...base, kind: "research" }).success).toBe(false);
  expect(documentSave.safeParse({ ...base, kind: "archive" }).success).toBe(false);
 });
 it("requires notes to cite actual project sources and rejects duplicate IDs", () => {
  const p = { ...emptyProject, title: "A question", question: "What does the evidence support?", sources: [source], notes: [{ id: other, kind: "interpretation", text: "A tentative reading.", sourceIds: [id], epistemicState: "inferred" }] };
  expect(researchProject.safeParse(p).success).toBe(true);
  expect(researchProject.safeParse({ ...p, sources: [] }).success).toBe(false);
  expect(researchProject.safeParse({ ...p, sources: [source, source] }).success).toBe(false);
  expect(researchProject.safeParse({ ...p, notes: [p.notes[0], p.notes[0]] }).success).toBe(false);
 });
 it("keeps synthesis inferred even when it has a source reference", () => {
  const p = { ...emptyProject, title: "A question", question: "What follows?", sources: [source], notes: [{ id: other, kind: "ai_synthesis", text: "A proposed synthesis.", sourceIds: [id], epistemicState: "user_stated" }] };
  expect(researchProject.safeParse(p).success).toBe(false);
  expect(researchProject.safeParse({ ...p, notes: [{ ...p.notes[0], epistemicState: "inferred" }] }).success).toBe(true);
 });
 it("bounds excerpts and refuses invented source layers or executable URLs", () => {
  for (const url of ["", "not a URL", "https://", "https://example.org:invalid/"])
   expect(researchSource.safeParse({ ...source, url }).success).toBe(false);
  for (const fields of [{ excerpt: "x".repeat(8001) }, { layer: "financial_context" }, { reference: "" }, { url: "javascript:alert(1)" }, { url: "https://user:secret@example.com/" }, { sourceDate: "2026-02-30" }])
   expect(researchSource.safeParse({ ...source, ...fields }).success).toBe(false);
 });
 it("prevents mismatched document kinds and assistant-origin profiles", () => {
  const d = { id, kind: "profile", revision: 1, data: emptyProfile, origin: "user", createdAt: "2026-09-08T00:00:00Z", updatedAt: "2026-09-08T00:00:00Z" };
  expect(ministryDocument.safeParse(d).success).toBe(true);
  expect(ministryDocument.safeParse({ ...d, origin: "assistant" }).success).toBe(false);
  expect(ministryDocument.safeParse({ ...d, kind: "archive", data: { ...emptyArchive, title: "Prior work", sourceLabel: "My archive" } }).success).toBe(true);
  expect(ministryDocument.safeParse({ ...d, kind: "research" }).success).toBe(false);
 });
});
