import { describe, expect, it } from "vitest";
import { emptyInvestorData, investorSave, investorProposalInput, investorDecision, investorSchemas, investorSource,
  investorThesis, investorFiling, sourceUrl, type InvestorThesis } from "../bundles/investor/contracts";
import { ageDays, filingWarnings, normalizeAssistantResearch, researchGaps, scenarioSummary } from "../bundles/investor/analysis";
const id = "84000000-0000-4000-8000-000000000001", other = "84000000-0000-4000-8000-000000000002";
const third = "84000000-0000-4000-8000-000000000003", today = "2026-09-09";
const instrument = { name: "Fictional Research Company", ticker: "FICTION", exchange: "Example exchange", cik: "" };
const source = { id, title: "Fictional earnings release", publisher: "Fictional issuer", url: "https://example.org/evidence",
  type: "earnings", sourceDate: today, periodEnd: "2026-06-30", retrievedAt: today + "T12:00:00Z",
  reference: "Illustrative evidence only", excerpt: "Fictional operating result.", status: "checked", limitations: "" };
const claim = { id: other, kind: "FACT", text: "The illustrative source reports an operating result.", relation: "supports",
  sourceIds: [id], epistemicState: "confirmed", confidence: null, uncertainty: "Illustrative, not market data." };
const thesis = { ...emptyInvestorData("thesis", today), title: "Fictional research thesis", instrument,
  question: "What would change this view?", thesis: "An illustrative research hypothesis.", horizon: "Twelve months",
  sources: [source], claims: [claim] };
const validThesis = () => investorThesis.parse(thesis);
describe("Investor reusable native research contract", () => {
  it("starts without securities, client preferences, holdings or fabricated probabilities", () => {
    for (const kind of ["watchlist", "thesis", "filing", "brief"] as const) {
      const data = emptyInvestorData(kind, today);
      expect(data.title).toBe(""); expect(data.status).toBe("draft");
      expect(data).not.toHaveProperty("holdings"); expect(data).not.toHaveProperty("accountId");
    }
    expect((emptyInvestorData("thesis", today) as InvestorThesis).confidence).toBeNull();
  });
  it("requires native confirmation and exact revision authority, not model tenant fields", () => {
    const save = { kind: "thesis", documentId: null, expectedRevision: 0, requestId: id, data: thesis, confirmResearchOnly: true };
    expect(investorSave.safeParse(save).success).toBe(true);
    for (const patch of [{ confirmResearchOnly: false }, { clientId: id }, { tenantId: id }, { expectedRevision: 1 }, { kind: "watchlist" }])
      expect(investorSave.safeParse({ ...save, ...patch }).success).toBe(false);
    expect(investorDecision.safeParse({ proposalId: id, expectedRevision: 0, decision: "reject", confirmResearchOnly: false }).success).toBe(true);
    expect(investorDecision.safeParse({ proposalId: id, expectedRevision: 0, decision: "approve", confirmResearchOnly: false }).success).toBe(false);
  });
  it("permits a new research proposal but rejects account data, trades and wrong scopes", () => {
    const proposal = { kind: "thesis", documentId: null, expectedRevision: 0, requestId: id, data: thesis,
      reason: "A requested research update", evidence: "Recorded public source", scope: "public_research_only" };
    expect(investorProposalInput.safeParse(proposal).success).toBe(true);
    for (const data of [{ ...thesis, tradeOrder: "buy" }, { ...thesis, accountId: id }, { ...thesis, nonprofitRecords: [] }])
      expect(investorProposalInput.safeParse({ ...proposal, data }).success).toBe(false);
    expect(investorProposalInput.safeParse({ ...proposal, scope: "private_portfolio" }).success).toBe(false);
  });
  it("requires source-linked fact claims and rejects dangling, repeated or duplicate evidence", () => {
    expect(investorThesis.safeParse(thesis).success).toBe(true);
    for (const patch of [{ claims: [{ ...claim, sourceIds: [] }] }, { claims: [{ ...claim, sourceIds: [third] }] },
      { claims: [{ ...claim, sourceIds: [id, id] }] }, { sources: [source, source] }, { claims: [claim, claim] }])
      expect(investorThesis.safeParse({ ...thesis, ...patch }).success).toBe(false);
  });
  it("does not certify a no-change result from an empty notebook", () => {
    expect(investorThesis.safeParse({ ...thesis, changeAssessment: "no_material_change" }).success).toBe(false);
    expect(investorThesis.safeParse({ ...thesis, changeAssessment: "no_material_change", changeReason: "The recorded evidence does not change this hypothesis." }).success).toBe(true);
    expect(researchGaps(validThesis(), today).join(" ")).toMatch(/research gap/);
  });
  it("labels forecasts separately and requires evidence for assessed invalidation", () => {
    expect(investorThesis.safeParse({ ...thesis, claims: [{ ...claim, kind: "PREDICTION", sourceIds: [], epistemicState: "inferred" }] }).success).toBe(true);
    expect(investorThesis.safeParse({ ...thesis, invalidations: [{ id, condition: "A measurable threshold", status: "triggered", sourceIds: [], assessment: "Unverified" }] }).success).toBe(false);
  });
  it("validates probability bounds and computes only an explicitly complete hypothetical set", () => {
    const first = { id, title: "Downside", assumptions: "Illustrative assumption", outcome: "Illustrative outcome",
      probability: 40, returnPercent: -25, invalidatedBy: "Evidence that contradicts the assumption" };
    const second = { ...first, id: other, title: "Upside", probability: 60, returnPercent: 20 };
    const complete = investorThesis.parse({ ...thesis, scenarios: [first, second], scenarioMode: "exclusive_complete" });
    expect(scenarioSummary(complete).weightedReturnPercent).toBeCloseTo(2);
    expect(scenarioSummary({ ...complete, scenarioMode: "draft" }).weightedReturnPercent).toBeNull();
    expect(scenarioSummary({ ...complete, scenarios: [{ ...first, returnPercent: null }, second] }).weightedReturnPercent).toBeNull();
    for (const scenarios of [[first], [first, { ...second, probability: 70 }], [{ ...first, probability: -1 }, second], [first, { ...second, probability: null }]])
      expect(investorThesis.safeParse({ ...thesis, scenarios, scenarioMode: "exclusive_complete" }).success).toBe(false);
  });
  it("keeps 13F reporting period distinct from filing date and current holdings", () => {
    const filing = { ...emptyInvestorData("filing", today), title: "Fictional 13F review", instrument,
      filerName: "Fictional manager", form: "13F-HR", filingUrl: "https://example.org/13f",
      periodEnd: "2026-06-30", filedDate: "2026-08-14", question: "What can this snapshot establish?",
      holdingsLimitations: "Delayed snapshot; excludes short positions." };
    const f = investorFiling.parse(filing);
    expect(filingWarnings(f, today).join(" ")).toMatch(/not a current portfolio/);
    expect(filingWarnings(f, today).join(" ")).toMatch(/71 days/);
    for (const patch of [{ periodEnd: null }, { holdingsLimitations: "" }, { periodEnd: "2026-09-10" }])
      expect(investorFiling.safeParse({ ...filing, ...patch }).success).toBe(false);
  });
  it("handles malformed sources and real calendar boundaries without throwing", () => {
    for (const url of ["", "not a URL", "https://", "https://example.org:bad/", "javascript:alert(1)", "https://u:p@example.org/"])
      expect(sourceUrl.safeParse(url).success).toBe(false);
    expect(investorSource.safeParse({ ...source, sourceDate: "2026-02-30" }).success).toBe(false);
    expect(ageDays("2026-08-31", "2026-09-01")).toBe(1);
    expect(investorSchemas.brief.safeParse({ ...emptyInvestorData("brief", today), title: "Brief", scope: "Example",
      summary: "Illustrative", periodStart: "2026-09-10", periodEnd: today }).success).toBe(false);
  });
  it("normalizes only changed assistant evidence against the immutable base", () => {
    const base = validThesis();
    const changed = { ...base, claims: [{ ...base.claims[0], text: "A changed AI-extracted claim" }] };
    const normalized = normalizeAssistantResearch(changed, base);
    expect(normalized.status).toBe("review_required");
    expect(normalized.claims[0].epistemicState).toBe("inferred");
    expect(normalized.sources[0].status).toBe("checked");
    const fresh = normalizeAssistantResearch(base, null);
    expect(fresh.sources[0].status).toBe("unverified");
    expect(fresh.claims[0].epistemicState).toBe("inferred");
    expect(normalizeAssistantResearch(base, base)).toEqual(base);
    expect(base.claims[0].epistemicState).toBe("confirmed");
    const changedSource = normalizeAssistantResearch({ ...base, sources: [{ ...base.sources[0], excerpt: "A revised source finding" }] }, base);
    expect(changedSource.sources[0].status).toBe("unverified");
    expect(changedSource.claims[0].epistemicState).toBe("inferred");
  });
  it("requires evidence for dated announced catalysts and rejects duplicate watchlist identities", () => {
    const c = { id, title: "Earnings", type: "earnings", eventDate: today, dateState: "announced",
      status: "open", sourceIds: [], whyItMatters: "Tests the hypothesis", nextCheck: "" };
    expect(investorThesis.safeParse({ ...thesis, catalysts: [c] }).success).toBe(false);
    expect(investorThesis.safeParse({ ...thesis, catalysts: [{ ...c, sourceIds: [id] }] }).success).toBe(true);
    const e = { id, instrument, rationale: "Question to investigate", nextQuestion: "", reviewDate: null, status: "watching" };
    expect(investorSchemas.watchlist.safeParse({ ...emptyInvestorData("watchlist", today), title: "Watch",
      entries: [e, { ...e, id: other }] }).success).toBe(false);
  });
});
