import { describe, expect, it } from "vitest";
import { emptyNonprofitData, founderPlan, meetingRecord, newFounderAction, nonprofitDecision, nonprofitDocument, nonprofitProposalInput, nonprofitResearch, nonprofitSave, nonprofitSource, partnerRecord } from "../bundles/nonprofit-founder/contracts";
const id = "83000000-0000-4000-8000-000000000001", other = "83000000-0000-4000-8000-000000000002";
const plan = {...emptyNonprofitData.plan, title: "Fictional community project"};
const source = {id, title: "Fictional agency material", authority: "Fictional authority", authorityType: "government", url: "https://example.org/fictional-evidence", reference: "Test only, not legal guidance", jurisdiction: "Fictional jurisdiction", retrievedDate: "2026-09-08", effectiveDate: null, sourceDate: null, finding: "A recorded test finding."};
const research = {...emptyNonprofitData.research, title: "A research question", jurisdiction: "Fictional jurisdiction", question: "Which authority should review this?", sources: [source]};
describe("Reusable Nonprofit Founder contracts", () => {
 it("starts without client-specific organizations, jurisdiction or commitments", () => {
  expect(plan.jurisdiction).toBe(""); expect(plan.milestones).toEqual([]);
  expect(emptyNonprofitData.partner.contactEmail).toBe(""); expect(emptyNonprofitData.meeting.timeZone).toBe("");
 });
 it("requires exact native administrative confirmation and rejects model tenant authority", () => {
  const input = {kind: "plan", documentId: null, expectedRevision: 0, requestId: id, data: plan, confirmAdministrative: true};
  expect(nonprofitSave.safeParse(input).success).toBe(true);
  for(const fields of [{confirmAdministrative: false}, {tenantId: id}, {clientId: id}, {expectedRevision: 1}])
   expect(nonprofitSave.safeParse({...input,...fields}).success).toBe(false);
 });
 it("supports new and current-revision proposals but not mismatched kinds or clinical fields", () => {
  const input = {kind: "plan", documentId: null, expectedRevision: 0, requestId: id, data: plan, scope: "administrative_only", reason: "A requested first roadmap.", evidence: "User-supplied mission."};
  expect(nonprofitProposalInput.safeParse(input).success).toBe(true);
  expect(nonprofitProposalInput.safeParse({...input,documentId: other,expectedRevision: 3}).success).toBe(true);
  for(const fields of [{scope: "clinical"}, {kind: "partner"}, {data: {...plan,patientRecords: []}}, {data: {...plan,diagnosis: "not an allowed field"}}, {documentId: other}])
   expect(nonprofitProposalInput.safeParse({...input,...fields}).success).toBe(false);
 });
 it("rejects dangling, duplicate and cyclical milestone dependencies", () => {
  const first = {...newFounderAction(id), title: "First", category: "formation", dependsOn: []};
  const second = {...newFounderAction(other), title: "Second", category: "governance", dependsOn: [id]};
  expect(founderPlan.safeParse({...plan,milestones: [first,second]}).success).toBe(true);
  for(const milestones of [[second], [first,first], [{...first,dependsOn:[other]},second], [{...first,dependsOn:[id]}], [first,{...second,dependsOn:[id,id]}]])
   expect(founderPlan.safeParse({...plan,milestones}).success).toBe(false);
 });
 it("bounds inputs and requires real source fields instead of promoting an unsourced conclusion", () => {
  expect(nonprofitResearch.safeParse(research).success).toBe(true);
  for(const url of ["","not a URL","https://","https://example.org:invalid/"])
   expect(nonprofitSource.safeParse({...source,url}).success).toBe(false);
  for(const fields of [{uncertainty: ""}, {professionalReview: ""}, {jurisdiction: ""}, {sources: [source,source]}, {status: "compliant"}, {epistemicState: "certified"}, {status: "reviewed",sources: []}])
   expect(nonprofitResearch.safeParse({...research,...fields}).success).toBe(false);
  for(const fields of [{url: "javascript:alert(1)"}, {url: "https://someone:password@example.org/"}, {retrievedDate: "2026-02-30"}, {finding: ""}, {effectiveDate: "yesterday"}, {authorityType: "ai"}])
   expect(nonprofitSource.safeParse({...source,...fields}).success).toBe(false);
 });
 it("keeps administrative partnerships distinct from donations, provider actions and clinical records", () => {
  const p = {...emptyNonprofitData.partner,title: "Fictional partner"};
  expect(partnerRecord.safeParse(p).success).toBe(true);
  for(const fields of [{contactEmail: "bad email"}, {sent: true}, {patientId: id}, {paymentAuthorization: true}, {outreachDraft: "x".repeat(8001)}])
   expect(partnerRecord.safeParse({...p,...fields}).success).toBe(false);
 });
 it("makes meeting dates and time zones explicit without pretending to book a calendar", () => {
  const m = {...emptyNonprofitData.meeting,title: "Fictional planning meeting"};
  expect(meetingRecord.safeParse(m).success).toBe(true);
  expect(meetingRecord.safeParse({...m,scheduledDate: "2026-09-09",localTime: "09:30",timeZone: "America/Chicago"}).success).toBe(true);
  for(const fields of [{localTime:"09:30"}, {localTime:"25:00"}, {timeZone:"Imaginary/Nowhere"}, {scheduledDate:"2026-02-30"}, {externalCalendarId:id}])
   expect(meetingRecord.safeParse({...m,...fields}).success).toBe(false);
 });
 it("keeps source content and interpretation separate and returns typed records", () => {
  expect(nonprofitDecision.safeParse({proposalId:id,expectedRevision:0,decision:"reject",confirmAdministrative:false}).success).toBe(true);
  expect(nonprofitDecision.safeParse({proposalId:id,expectedRevision:0,decision:"approve",confirmAdministrative:false}).success).toBe(false);
  const d = {id,kind: "research",revision: 1,data: research,origin: "assistant",createdAt: "2026-09-08T00:00:00Z",updatedAt: "2026-09-08T00:00:00Z"};
  expect(nonprofitDocument.safeParse(d).success).toBe(true);
  expect(nonprofitDocument.safeParse({...d,kind: "plan"}).success).toBe(false);
 });
});
