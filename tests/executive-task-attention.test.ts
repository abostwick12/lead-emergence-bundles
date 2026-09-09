import { describe, expect, it } from "vitest";
import { emptyExecutiveData, executiveSchemas, executiveReference, referenceKey, executiveTaskKinds } from "../bundles/executive/contracts";
import {
 executiveSharingV2Input, executiveSharingV2, executiveResolutionV2, executiveAttentionV2,
 executiveSourceSearchInput, executiveSourceSearchResult, sourceCursorKey,
 executiveAllCapabilities, prepareExecutiveFocusBrief, executiveAttentionQuery
} from "../bundles/executive/attention";
const id="85000000-0000-4000-8000-000000000001", taskId="85000000-0000-4000-8000-000000000002";
const date="2026-09-09", now=date+"T12:00:00Z";
const record={capabilityId:"nonprofit.roadmap",kind:"plan",documentId:id,revision:1};
const task={...record,item:{kind:"milestone" as const,id:taskId}};
const metadata={title:"PRIVATE_TASK_TITLE",state:"blocked",reviewState:null,revision:1,dueDate:date,sourceUpdatedAt:now,
 parentTitle:"PRIVATE_PARENT_TITLE",owner:"PRIVATE_OWNER",nextAction:"PRIVATE_NEXT_ACTION",priority:"high",dateState:null,openPrerequisites:1};
const item={id:referenceKey(task),source:task,title:metadata.title,priority:"high",dueDate:date,
 reason:"Saved task is blocked.",evidence:"Saved task status.",action:"Review in its source workspace",
 sourceUpdatedAt:now,sourceReviewState:null,parentTitle:metadata.parentTitle,state:"blocked",owner:metadata.owner,
 nextAction:metadata.nextAction,dateState:null,openPrerequisites:1};
const coverage=[
 ...executiveAllCapabilities.map(capabilityId=>({capabilityId,level:"record",state:"current",total:0})),
 ...Object.keys(executiveTaskKinds).map(capabilityId=>({capabilityId,level:"task",state:"current",total:capabilityId===task.capabilityId?1:0}))
];
const snapshot={schemaVersion:"2.0",asOfDate:date,retrievedAt:now,items:[item],total:1,offset:0,limit:25,coverage};
describe("Executive individually consented task metadata",()=>{
 it("keeps record references valid and distinct from several tasks in the same record",()=>{
  const second={...task,item:{kind:"milestone",id}};
  expect(executiveReference.safeParse(record).success).toBe(true);
  expect(executiveReference.safeParse(task).success).toBe(true);
  const brief={...emptyExecutiveData("daily_brief",date),title:"Today",focus:"Next move",references:[record,task,second]};
  expect(executiveSchemas.daily_brief.safeParse(brief).success).toBe(true);
  expect(executiveSchemas.daily_brief.safeParse({...brief,references:[task,{...task,item:{...task.item,id:taskId.toUpperCase()}}]}).success).toBe(false);
 });
 it("restricts every task collection to its exact capability and parent kind",()=>{
  for(const [capabilityId,kinds] of Object.entries(executiveTaskKinds)) for(const [kind,itemKinds] of Object.entries(kinds)) {
   for(const itemKind of itemKinds) {
    const ref={capabilityId,kind,documentId:id,revision:1,item:{kind:itemKind,id:itemKind==="followup"?id:taskId}};
    expect(executiveReference.safeParse(ref).success).toBe(true);
    expect(executiveReference.safeParse({...ref,kind:"commitment"}).success).toBe(false);
   }
  }
  for(const patch of [{item:{kind:"catalyst",id:taskId}},{capabilityId:"ministry.research",kind:"research"},
   {item:{kind:"milestone",id:taskId,body:"PRIVATE"}},{capabilityId:"nonprofit.partners",kind:"partner",item:{kind:"followup",id:taskId}}])
   expect(executiveReference.safeParse({...task,...patch}).success).toBe(false);
 });
 it("requires a versioned, separately confirmed, parent-scoped task permission",()=>{
  const input={sourceCapabilities:["nonprofit.roadmap"],taskCapabilities:["nonprofit.roadmap"],expectedRevision:0,requestId:id,
   confirmTaskMetadataOnly:true,confirmExpandedTaskMetadata:true,taskMetadataVersion:"task-metadata-v1"};
  expect(executiveSharingV2Input.safeParse(input).success).toBe(true);
  for(const patch of [{sourceCapabilities:[]},{confirmExpandedTaskMetadata:false},{taskMetadataVersion:"all-content"},
   {taskCapabilities:["writer.resource.library"]},{taskCapabilities:["nonprofit.roadmap","nonprofit.roadmap"]},{clientId:id}])
   expect(executiveSharingV2Input.safeParse({...input,...patch}).success).toBe(false);
  expect(executiveSharingV2Input.safeParse({...input,taskCapabilities:[],confirmExpandedTaskMetadata:false}).success).toBe(true);
  expect(executiveSharingV2.safeParse({revision:1,sourceCapabilities:[],taskCapabilities:["nonprofit.roadmap"],taskMetadataVersion:"task-metadata-v1",updatedAt:now}).success).toBe(false);
 });
 it("checks exact resolution scope, parent revision and a closed scalar allowlist",()=>{
  const value={references:[{reference:task,state:"current",metadata}],retrievedAt:now};
  expect(executiveResolutionV2.safeParse(value).success).toBe(true);
  for(const m of [{...metadata,privateBody:"PRIVATE"},{...metadata,revision:2},{...metadata,openPrerequisites:51}])
   expect(executiveResolutionV2.safeParse({...value,references:[{reference:task,state:"current",metadata:m}]}).success).toBe(false);
  expect(executiveResolutionV2.safeParse({...value,references:[{reference:record,state:"current",metadata}]}).success).toBe(false);
  expect(executiveResolutionV2.safeParse({...value,references:[{reference:task,state:"changed",metadata:{...metadata,revision:2}}]}).success).toBe(true);
  expect(executiveResolutionV2.safeParse({...value,references:[{reference:task,state:"unavailable",metadata:null}]}).success).toBe(true);
 });
 it("requires all 22 distinct coverage scopes and exact page totals",()=>{
  expect(executiveAttentionV2.safeParse(snapshot).success).toBe(true);
  for(const patch of [{coverage:coverage.slice(1)},{coverage:[...coverage.slice(1),coverage[1]]},{total:2},{offset:1},
   {items:[{...item,id:"unrelated"}]},{items:[{...item,owner:null}]},
   {coverage:coverage.map(c=>c.total?{...c,state:"not_shared"}:c)}])
   expect(executiveAttentionV2.safeParse({...snapshot,...patch}).success).toBe(false);
  expect(executiveAttentionV2.safeParse({...snapshot,items:[],offset:1}).success).toBe(true);
  expect(executiveAttentionQuery.safeParse({offset:-1}).success).toBe(false);
 });
 it("pages source discovery by stable identity, not a title or authorization token",()=>{
  const input={capabilityId:task.capabilityId,level:"task",after:sourceCursorKey(task)};
  expect(executiveSourceSearchInput.safeParse(input).success).toBe(true);
  for(const patch of [{after:"secret-title"},{after:"plan:"+"-".repeat(36)},{capabilityId:"ministry.research"},{limit:51},{search:"x".repeat(201)}])
   expect(executiveSourceSearchInput.safeParse({...input,...patch}).success).toBe(false);
  const result={scope:{capabilityId:task.capabilityId,level:"task"},state:"current",total:2,
   items:[{reference:task,metadata}],nextCursor:sourceCursorKey(task),retrievedAt:now};
  expect(executiveSourceSearchResult.safeParse(result).success).toBe(true);
  for(const patch of [{nextCursor:sourceCursorKey({...task,documentId:taskId})},{state:"unavailable"},{total:0},
   {scope:{capabilityId:task.capabilityId,level:"record"}},{items:[{reference:task,metadata:{...metadata,revision:2}}]}])
   expect(executiveSourceSearchResult.safeParse({...result,...patch}).success).toBe(false);
 });
 it("prepares identifier-only live links without permanently copying task titles, owners or next steps",()=>{
  const brief=prepareExecutiveFocusBrief("daily_brief",date,snapshot);
  expect(executiveSchemas.daily_brief.safeParse(brief).success).toBe(true);
  expect(brief.references).toEqual([task]);
  expect(JSON.stringify(brief)).not.toContain("PRIVATE_");
  expect(brief.reviewState).toBe("inferred");
  expect(()=>prepareExecutiveFocusBrief("daily_brief",date,{...snapshot,items:[],offset:1})).toThrow(/first attention page/);
  const weekly=prepareExecutiveFocusBrief("weekly_review",date,snapshot);
  expect(weekly).toMatchObject({periodStart:"2026-09-03"});
  expect(JSON.stringify(weekly)).toContain("not a complete record");
 });
});
