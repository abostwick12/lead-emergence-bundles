import { describe, expect, it } from "vitest";
import { editorKinds, editorDraftChange, editorDraftSnapshot, editorRecoveryShapes, validEditorValues, recoveryShape } from "../bundles/editor-recovery";
import { emptyProfile, emptyProject, emptyArchive, researchProject } from "../bundles/ministry/contracts";
import { emptyNonprofitData } from "../bundles/nonprofit-founder/contracts";
import { emptyInvestorData } from "../bundles/investor/contracts";
import { emptyExecutiveData } from "../bundles/executive/contracts";
const empty = (domain:string,kind:string) => domain==="ministry"?({profile:emptyProfile,research:emptyProject,archive:emptyArchive} as Record<string,object>)[kind]
  :domain==="nonprofit"?emptyNonprofitData[kind as keyof typeof emptyNonprofitData]
  :domain==="investor"?emptyInvestorData(kind as Parameters<typeof emptyInvestorData>[0],"2026-09-15")
  :emptyExecutiveData(kind as Parameters<typeof emptyExecutiveData>[0],"2026-09-15");
const target = {domain:"ministry" as const,kind:"research",documentId:null};
const requestId = "15111111-1111-4111-8111-111111111111";
const input = {target,requestId,expectedVersion:0,operation:"save",schemaVersion:1,baseRevision:0,values:{data:structuredClone(emptyProject),ui:{}}};
describe("native editor recovery contracts",()=>{
  for(const [domain,kinds] of Object.entries(editorKinds)) for(const kind of kinds) {
    it("recovers an incomplete "+domain+" "+kind+" without approving it",()=>{
      expect(editorDraftChange.safeParse({...input,target:{domain,kind,documentId:null},values:{data:empty(domain,kind),ui:{}}}).success).toBe(true);
    });
  }
  it("retains shape and upper bounds while allowing temporarily invalid content",()=>{
    const value = structuredClone(emptyProject);
    value.sources.push({id:requestId,title:"",layer:"biblical_text",reference:"",author:"",url:"unfinished link",sourceDate:null,retrievedDate:null,excerpt:"",comment:""});
    expect(researchProject.safeParse(value).success).toBe(false);
    expect(editorDraftChange.safeParse({...input,values:{data:value,ui:{}}}).success).toBe(true);
    expect(editorDraftChange.safeParse({...input,values:{data:{...value,notes:"broken"},ui:{}}}).success).toBe(false);
    expect(editorDraftChange.safeParse({...input,values:{data:{...value,question:"a".repeat(4001)},ui:{}}}).success).toBe(false);
    expect(editorDraftChange.safeParse({...input,values:{data:{...value,status:"approved_by_ai"},ui:{}}}).success).toBe(false);
  });
  it("rejects identity injection, cross-domain kinds, extra fields and persisted approvals",()=>{
    for(const patch of [{workspaceId:requestId},{target:{...target,userId:requestId}},{target:{...target,kind:"thesis"}},{schemaVersion:2},{expectedVersion:-1}])
      expect(editorDraftChange.safeParse({...input,...patch}).success).toBe(false);
    expect(editorDraftChange.safeParse({...input,values:{data:{...emptyProject,hiddenToken:"x"},ui:{}}}).success).toBe(false);
    expect(editorDraftChange.safeParse({...input,values:{data:emptyProject,ui:{confirm:true}}}).success).toBe(false);
    expect(editorDraftChange.safeParse({...input,values:{data:emptyProject,ui:{unsetProfile:true}}}).success).toBe(false);
  });
  it("retains unapplied meeting time without treating it as a recorded instant",()=>{
    const meeting=emptyExecutiveData("meeting","2026-09-15");
    expect(editorDraftChange.safeParse({...input,target:{domain:"executive",kind:"meeting",documentId:null},values:{data:meeting,ui:{meetingTime:{local:"2026-11-01T01:30",selection:"",pending:true}}}}).success).toBe(true);
    expect(meeting.recordType==="meeting"&&meeting.startsAt).toBeNull();
  });
  it("requires explicit commit confirmation and exact draft version, not replacement data",()=>{
    const commit={operation:"commit",target,requestId,expectedVersion:2,confirm:true};
    expect(editorDraftChange.safeParse(commit).success).toBe(true);
    expect(editorDraftChange.safeParse({...commit,confirm:false}).success).toBe(false);
    expect(editorDraftChange.safeParse({...commit,data:emptyProject}).success).toBe(false);
    expect(editorDraftChange.safeParse({...commit,baseRevision:9}).success).toBe(false);
    expect(editorDraftChange.safeParse({operation:"discard",target,requestId,expectedVersion:2}).success).toBe(true);
  });
  it("validates recovered response data for the requested editor",()=>{
    const snapshot={target,schemaVersion:1,version:1,baseRevision:0,currentRevision:0,values:input.values,savedAt:"2026-09-15T00:00:00Z",receipt:null};
    expect(editorDraftSnapshot.safeParse(snapshot).success).toBe(true);
    expect(editorDraftSnapshot.safeParse({...snapshot,target:{domain:"investor",kind:"thesis",documentId:null}}).success).toBe(false);
    expect(validEditorValues(target,{data:emptyProject,ui:{meetingTime:{local:"",selection:"",pending:false}}})).toBe(false);
  });
  it("fails closed on unsupported schema compositions",()=>{
    expect(()=>recoveryShape({$ref:"#/definitions/secret"})).toThrow();
    expect(()=>recoveryShape({allOf:[]})).toThrow();
    expect(Object.values(editorRecoveryShapes).flatMap(Object.keys)).toHaveLength(16);
  });
});

