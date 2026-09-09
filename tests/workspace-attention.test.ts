import {describe,it,expect} from "vitest";
import {admittedAttentionScopes,attentionSources,attentionReferenceKey,attentionSourceRoute,nativeAttentionInput,nativeAttentionCatalog,nativeAttentionItem,nativeAttentionResult} from "../bundles/workspace-experience/attention";
const id="10000000-0000-4000-8000-000000000001",child="20000000-0000-4000-8000-000000000001";
const caps=["workspace.attention",...attentionSources.map(s=>s.capabilityId)];
const record={capabilityId:"writer.resource.library",kind:"resource",documentId:id,revision:1};
const item=()=>({id:attentionReferenceKey(record),source:record,title:"Fictional saved writing",priority:"normal",dueDate:null,reason:"Draft awaits review",state:"draft",evidence:"Saved draft; revision 1.",action:"Open the original",sourceUpdatedAt:"2026-09-09T12:00:00Z",sourceReviewState:null,parentTitle:null,owner:null,nextAction:null,dateState:null,openPrerequisites:0});
const result=()=>({schemaVersion:"1.0",workspaceId:id,authorityRevision:"verified",asOfDate:"2026-09-09",retrievedAt:"2026-09-09T12:00:00Z",bundleKey:null,priority:null,offset:0,total:1,overallTotal:1,coverage:[{capabilityId:"writer.resource.library",level:"record",total:1}],groups:[{bundleKey:"writer_editor",priority:"normal",total:1}],items:[item()]});
describe("native user attention contract",()=>{
 it("admits thirteen record and nine task scopes only with Experience attention",()=>{
  expect(admittedAttentionScopes(caps)).toHaveLength(22);expect(admittedAttentionScopes(caps.slice(1))).toEqual([]);
  expect(admittedAttentionScopes(["workspace.attention","writer.resource.library"])).toEqual([{capabilityId:"writer.resource.library",level:"record"}]);
 });
 it("does not require Executive permission to display native assigned domains",()=>{
  expect(admittedAttentionScopes(caps.filter(c=>!c.startsWith("executive.")))).toHaveLength(16);
 });
 it("requires a safe date and exact bounded page",()=>{
  expect(nativeAttentionInput.parse({asOfDate:"2026-09-09",authorityRevision:"r"}).offset).toBe(0);
  expect(nativeAttentionInput.parse({asOfDate:"2026-09-09",authorityRevision:"r",offset:10025}).offset).toBe(10025);
  for(const patch of [{asOfDate:"2026-02-30"},{asOfDate:"9999-12-25"},{offset:1},{offset:2147483025},{bundleKey:"private_profile"},{priority:"urgent"},{workspaceId:id}]){
   expect(nativeAttentionInput.safeParse({asOfDate:"2026-09-09",authorityRevision:"r",...patch}).success).toBe(false);
  }
 });
 it("rejects duplicate and unsupported scope declarations",()=>{
  const base={workspaceId:id,authorityRevision:"r"};
  expect(nativeAttentionCatalog.safeParse({...base,scopes:[{capabilityId:"ministry.profile",level:"record"}]}).success).toBe(false);
  const s={capabilityId:"ministry.research",level:"record"};
  expect(nativeAttentionCatalog.safeParse({...base,scopes:[s,s]}).success).toBe(false);
 });
 it("constructs only known saved-record routes",()=>{
  expect(attentionSourceRoute(record)).toBe("/workspace/writing/"+id);
  expect(()=>attentionSourceRoute({...record,kind:"thesis"})).toThrow();
 });
 it("resolves the precise child without accepting arbitrary fragments",()=>{
  expect(attentionSourceRoute({capabilityId:"nonprofit.roadmap",kind:"plan",documentId:id,revision:2,item:{kind:"milestone",id:child}})).toBe("/workspace/nonprofit/plan/"+id+"#task-milestone-"+child);
  expect(()=>attentionSourceRoute({...record,item:{kind:"catalyst",id:child}})).toThrow();
  expect(()=>attentionSourceRoute({capabilityId:"nonprofit.partners",kind:"partner",documentId:id,revision:1,item:{kind:"followup",id:child}})).toThrow();
 });
 it("keeps body, account and supplied URLs outside metadata",()=>{
  expect(nativeAttentionItem.safeParse(item()).success).toBe(true);
  for(const patch of [{body:"private"},{url:"https://evil.invalid"},{accountId:id},{parentTitle:"unexpected"},{id:"forged"}])
   expect(nativeAttentionItem.safeParse({...item(),...patch}).success).toBe(false);
 });
 it("requires named task metadata, not an accidental full document",()=>{
  const source={capabilityId:"executive.coordination",kind:"meeting",documentId:id,revision:1,item:{kind:"action" as const,id:child}};
  const x={...item(),id:attentionReferenceKey(source),source,parentTitle:"Meeting",owner:"Fictional owner",nextAction:"Review notes"};
  expect(nativeAttentionItem.safeParse(x).success).toBe(true);
  expect(nativeAttentionItem.safeParse({...x,nextAction:null}).success).toBe(false);
 });
 it("accepts a complete internally consistent current read",()=>expect(nativeAttentionResult.safeParse(result()).success).toBe(true));
 it("rejects group totals, wrong-bundle counts and duplicate groups",()=>{
  for(const groups of [[{bundleKey:"writer_editor",priority:"normal",total:2}],[{bundleKey:"investor",priority:"normal",total:1}],[...result().groups,...result().groups]])
   expect(nativeAttentionResult.safeParse({...result(),groups}).success).toBe(false);
 });
 it("rejects unadmitted items and mismatched filters",()=>{
  expect(nativeAttentionResult.safeParse({...result(),coverage:[{capabilityId:"ministry.research",level:"record",total:1}]}).success).toBe(false);
  expect(nativeAttentionResult.safeParse({...result(),priority:"high"}).success).toBe(false);
  expect(nativeAttentionResult.safeParse({...result(),bundleKey:"investor"}).success).toBe(false);
 });
 it("requires complete page lengths, including no-result filtered states",()=>{
  expect(nativeAttentionResult.safeParse({...result(),items:[]}).success).toBe(false);
  expect(nativeAttentionResult.safeParse({...result(),priority:"high",total:0,items:[]}).success).toBe(true);
 });
});
