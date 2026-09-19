import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
import {notificationDefinitions,notificationQuery,notificationChange,notificationItem} from "../bundles/workspace-experience/notifications";
const requestId="14111111-1111-4111-8111-111111111111",id="a".repeat(64),revision="b".repeat(64);
describe("native notification contracts",()=>{
 it("matches every implemented manifest type and required capability",()=>{
  const folders=["writer-editor","ministry","nonprofit-founder","investor","executive","workspace-experience"];
  const manifestTypes=folders.flatMap(f=>JSON.parse(readFileSync("bundles/"+f+"/ui-manifest.json","utf8")).notificationTypes);
  expect(manifestTypes).toHaveLength(notificationDefinitions.length);
  for(const def of notificationDefinitions)expect(manifestTypes.find(t=>t.id===def.id)).toMatchObject({capabilityId:def.capabilityId,defaultEnabled:true});
 });
 it("accepts canonical bounded pages only",()=>{
  expect(notificationQuery.parse({})).toEqual({view:"inbox",offset:0});
  for(const q of [{offset:1},{offset:-25},{offset:2147483025},{view:"sent"},{workspaceId:requestId},{typeId:"foreign"}])expect(notificationQuery.safeParse(q).success).toBe(false);
 });
 it("bounds and deduplicates reviewed item changes",()=>{
  const v={kind:"items",requestId,expectedVersion:0,action:"read",items:[{id,revision}]};
  expect(notificationChange.safeParse(v).success).toBe(true);
  for(const patch of [{items:[]},{items:Array(26).fill({id,revision})},{items:[{id,revision},{id,revision}]},{action:"send"},{expectedVersion:1.5},{workspaceId:requestId}])
   expect(notificationChange.safeParse({...v,...patch}).success).toBe(false);
 });
 it("requires exact boolean type preferences and rejects mixed mutations",()=>{
  const v={kind:"preference",requestId,expectedVersion:2,typeId:notificationDefinitions[0].id,enabled:false};
  expect(notificationChange.safeParse(v).success).toBe(true);
  for(const patch of [{enabled:"false"},{enabled:null},{typeId:"unknown"},{action:"read"}])expect(notificationChange.safeParse({...v,...patch}).success).toBe(false);
 });
 it("permits only native source destinations",()=>{
  const v={id,revision,typeId:notificationDefinitions[0].id,title:"Fictional resource",reason:"Marked ready",
   sourceHref:"/workspace/writing/"+requestId,sourceLabel:"Writing",dueDate:null,priority:"normal",status:"unread",snoozedUntil:null};
  expect(notificationItem.safeParse(v).success).toBe(true);
  for(const sourceHref of ["https://example.invalid","//example.invalid","/workspace/../settings","/workspace/writing/"+requestId+"?token=private"])
   expect(notificationItem.safeParse({...v,sourceHref}).success).toBe(false);
 });
});
