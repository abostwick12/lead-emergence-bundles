import {describe,expect,it} from "vitest";
import {emptyWorkspaceLayout} from "../bundles/workspace-experience/layout";
import {
  applyLayoutProposalOperations,layoutProposalChanges,layoutProposalContext,layoutProposalDecision,
  layoutProposalInput,layoutProposalRecord
} from "../bundles/workspace-experience/layout-proposal";

const catalog={items:[
  {id:"writer_editor:writer.nav.writing",kind:"navigation" as const,route:"/workspace/writing"},
  {id:"writer_editor:writer.widget.publication_queue",kind:"widget" as const,route:null}
],defaultRoutes:["/workspace","/workspace/writing"]};
const reason={reason:"The user said Writing is the first workspace they open each day.",basis:["user_stated_priority" as const,"enabled_capability" as const]};
const input={schemaVersion:"1.0" as const,expectedLayoutRevision:2,expectedAuthorityRevision:"authority-two",
 requestId:"22000000-0000-4000-8000-000000000001",title:"Put current writing first",goal:"Reach active writing with less navigation",
 goalSource:"user_stated" as const,summary:"Pin Writing, keep its handoff card visible, and use Writing as the starting workspace.",operations:[
  {kind:"set_visibility" as const,itemId:catalog.items[0].id,visible:true,...reason},
  {kind:"set_pin" as const,itemId:catalog.items[0].id,pinned:true,...reason},
  {kind:"set_default_workspace" as const,route:"/workspace/writing",...reason}
 ]};

describe("grounded approval-only layout proposals",()=>{
 it("applies admitted operations without mutating the saved input",()=>{
  const current={...emptyWorkspaceLayout(),hiddenItemIds:[catalog.items[0].id,"ministry:ministry.nav.home"]};
  const before=structuredClone(current),result=applyLayoutProposalOperations(current,catalog,input.operations);
  expect(result.hiddenItemIds).toEqual(["ministry:ministry.nav.home"]);
  expect(result.pinnedNavigationIds).toEqual([catalog.items[0].id]);
  expect(result.defaultWorkspaceRoute).toBe("/workspace/writing");expect(current).toEqual(before);
 });
 it("preserves dormant choices while editing only the admitted catalog",()=>{
  const current={...emptyWorkspaceLayout(),pinnedNavigationIds:["ministry:ministry.nav.home"],orderOverrides:{"ministry:ministry.nav.home":7}};
  const result=applyLayoutProposalOperations(current,catalog,[{kind:"set_order",itemId:catalog.items[0].id,order:1,...reason}]);
  expect(result.pinnedNavigationIds).toEqual(["ministry:ministry.nav.home"]);
  expect(result.orderOverrides).toEqual({"ministry:ministry.nav.home":7,[catalog.items[0].id]:1});
 });
 it("unhides a pinned item and removes pins from a hidden item",()=>{
  const pinned=applyLayoutProposalOperations(emptyWorkspaceLayout(),catalog,[{kind:"set_pin",itemId:catalog.items[0].id,pinned:true,...reason}]);
  expect(pinned.hiddenItemIds).toEqual([]);expect(pinned.pinnedNavigationIds).toEqual([catalog.items[0].id]);
  const hidden=applyLayoutProposalOperations(pinned,catalog,[{kind:"set_visibility",itemId:catalog.items[0].id,visible:false,...reason}]);
  expect(hidden.hiddenItemIds).toEqual([catalog.items[0].id]);expect(hidden.pinnedNavigationIds).toEqual([]);
 });
 it("rejects unentitled items, unavailable defaults and invalid pin kinds",()=>{
  expect(()=>applyLayoutProposalOperations(emptyWorkspaceLayout(),catalog,[{kind:"set_visibility",itemId:"ministry:ministry.nav.home",visible:false,...reason}])).toThrow("not currently available");
  expect(()=>applyLayoutProposalOperations(emptyWorkspaceLayout(),catalog,[{kind:"set_default_workspace",route:"/workspace/ministry",...reason}])).toThrow("not currently available");
  const result=applyLayoutProposalOperations(emptyWorkspaceLayout(),catalog,[{kind:"set_pin",itemId:catalog.items[1].id,pinned:true,...reason}]);
  expect(result.pinnedWidgetIds).toEqual([catalog.items[1].id]);expect(result.pinnedNavigationIds).toEqual([]);
 });
 it("requires every operation to cite non-inference evidence",()=>{
  const operation={kind:"set_visibility",itemId:catalog.items[0].id,visible:true,reason:"An unsupported assistant guess should never be enough.",basis:["assistant_inference"]};
  expect(layoutProposalInput.safeParse({...input,operations:[operation]}).success).toBe(false);
 });
 it("rejects duplicate exact operations and accepts complementary changes",()=>{
  expect(layoutProposalInput.safeParse({...input,operations:[input.operations[0],input.operations[0]]}).success).toBe(false);
  expect(layoutProposalInput.safeParse(input).success).toBe(true);
 });
 it("reports exact item and default-route differences",()=>{
  const current=emptyWorkspaceLayout(),proposed=applyLayoutProposalOperations(current,catalog,input.operations);
  const changes=layoutProposalChanges(current,proposed);
  expect(changes.items).toEqual([{itemId:catalog.items[0].id,before:{hidden:false,navigationPinned:false,widgetPinned:false,order:null},after:{hidden:false,navigationPinned:true,widgetPinned:false,order:null}}]);
  expect(changes.defaultWorkspace).toEqual({before:"/workspace",after:"/workspace/writing"});
 });
 it("keeps dormant identifiers out of the assistant context schema",()=>{
  const context={schemaVersion:"1.0",workspaceId:input.requestId,layoutRevision:2,authorityRevision:"authority-two",
   items:[{id:catalog.items[0].id,bundleKey:"writer_editor",kind:"navigation",label:"Writing",route:"/workspace/writing",visible:true,pinned:false,order:null}],
   defaultWorkspaces:[{route:"/workspace",label:"Home",current:true}],defaultUnavailable:true,dormantChoiceCount:3};
  expect(layoutProposalContext.safeParse(context).success).toBe(true);
  expect(layoutProposalContext.safeParse({...context,dormantItemIds:["ministry:ministry.nav.home"]}).success).toBe(false);
 });
 it("keeps acceptance a separate confirmed native decision",()=>{
  const decision={proposalId:input.requestId,expectedProposalVersion:1,expectedLayoutRevision:2,expectedAuthorityRevision:"authority-two",
   requestId:"22000000-0000-4000-8000-000000000002",decision:"accept",confirmed:true,note:"Reviewed the exact preview."};
  expect(layoutProposalDecision.safeParse(decision).success).toBe(true);
  expect(layoutProposalDecision.safeParse({...decision,confirmed:false}).success).toBe(false);
 });
 it("requires strict proposal records with explicit provenance and status",()=>{
  const proposed=applyLayoutProposalOperations(emptyWorkspaceLayout(),catalog,input.operations);
  const record={schemaVersion:"1.0",proposalId:input.requestId,status:"pending",baseLayoutRevision:2,authorityRevision:"authority-two",
   createdAt:"2026-09-10T20:00:00Z",version:1,title:input.title,goal:input.goal,goalSource:input.goalSource,summary:input.summary,
   operations:input.operations,proposedPreferences:proposed,createdBy:"assistant",decidedAt:null,decisionNote:""};
  expect(layoutProposalRecord.safeParse(record).success).toBe(true);
  expect(layoutProposalRecord.safeParse({...record,published:true}).success).toBe(false);
 });
});
