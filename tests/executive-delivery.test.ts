import {describe,expect,it} from "vitest";
import {executiveDeliveryDefinition,executiveDeliveryEvent,executiveDeliveryList,executiveDeliveryMutation,executiveDeliverySchedule} from "../bundles/executive/delivery";
const scheduleId="91000000-0000-4000-8000-000000000001",requestId="91000000-0000-4000-8000-000000000002",now="2026-09-10T18:00:00Z";
const daily={schemaVersion:"1.0" as const,deliveryKind:"daily_brief" as const,label:"Weekday daily brief",timeZone:"America/Chicago",
 cadence:{kind:"daily" as const,localTime:"07:30"},changePolicy:"when_attention_summary_changes" as const,deliveryTarget:"native_executive_inbox" as const};
const weekly={...daily,deliveryKind:"weekly_review" as const,label:"Friday weekly review",cadence:{kind:"weekly" as const,localTime:"16:00",weekdays:[5]}};
const record={scheduleId,version:1,definition:daily,status:"active" as const,capabilityAvailable:true,nextOccurrence:"2026-09-11T12:30:00Z",lastEvaluatedAt:null,lastDeliveredAt:null,createdAt:now,updatedAt:now,replayed:false};
describe("Executive native delivery contract",()=>{
 it("accepts strict daily and weekly definitions with named zones",()=>{
  expect(executiveDeliveryDefinition.safeParse(daily).success).toBe(true);expect(executiveDeliveryDefinition.safeParse(weekly).success).toBe(true);
  for(const value of [{...daily,timeZone:"Imaginary/Nowhere"},{...daily,cadence:{kind:"daily",localTime:"24:00"}},{...daily,deliveryKind:"weekly_review"},{...weekly,cadence:{...weekly.cadence,weekdays:[5,5]}}])
   expect(executiveDeliveryDefinition.safeParse(value).success).toBe(false);
 });
 it("binds creation, updates and lifecycle operations to exact identities",()=>{
  expect(executiveDeliveryMutation.safeParse({scheduleId:null,expectedVersion:0,requestId,operation:"create",definition:daily,confirmExactSchedule:true}).success).toBe(true);
  expect(executiveDeliveryMutation.safeParse({scheduleId,expectedVersion:1,requestId,operation:"pause",definition:null,confirmExactSchedule:true}).success).toBe(true);
  for(const value of [{scheduleId,expectedVersion:0,operation:"create",definition:daily},{scheduleId:null,expectedVersion:0,operation:"update",definition:daily},{scheduleId,expectedVersion:1,operation:"resume",definition:daily},{scheduleId,expectedVersion:1,operation:"update",definition:null}])
   expect(executiveDeliveryMutation.safeParse({...value,requestId,confirmExactSchedule:true}).success).toBe(false);
  expect(executiveDeliveryMutation.safeParse({scheduleId,expectedVersion:Number.MAX_SAFE_INTEGER+1,requestId,operation:"pause",definition:null,confirmExactSchedule:true}).success).toBe(false);
 });
 it("requires next occurrence only for active schedules",()=>{
 expect(executiveDeliverySchedule.safeParse(record).success).toBe(true);
  expect(executiveDeliverySchedule.safeParse({...record,capabilityAvailable:false}).success).toBe(true);
  expect(executiveDeliverySchedule.safeParse({...record,status:"paused",nextOccurrence:null}).success).toBe(true);
  expect(executiveDeliverySchedule.safeParse({...record,status:"paused"}).success).toBe(false);
 });
 it("labels native delivery honestly and never claims an external send or saved record",()=>{
  const event={deliveryId:requestId,scheduleId,scheduleVersion:1,deliveryKind:"daily_brief",label:daily.label,dueAt:now,evaluatedAt:now,outcome:"ready",reason:"The scheduled native review is ready.",currentAttentionCount:60,inspectedAttentionCount:50,inspectedHighPriorityCount:8,route:"/workspace/executive/daily_brief/new",requiresUserReview:true,externalDelivery:false,recordCreated:false};
  expect(executiveDeliveryEvent.safeParse(event).success).toBe(true);
  expect(executiveDeliveryEvent.safeParse({...event,externalDelivery:true}).success).toBe(false);
  expect(executiveDeliveryEvent.safeParse({...event,deliveryKind:"weekly_review"}).success).toBe(false);
  expect(executiveDeliveryEvent.safeParse({...event,inspectedHighPriorityCount:51}).success).toBe(false);
  expect(executiveDeliveryList.safeParse({schemaVersion:"1.0",workspaceId:scheduleId,authorityRevision:"r1",serverNow:now,schedules:[record],deliveries:[event],backgroundDeliveryAvailable:false}).success).toBe(true);
  expect(executiveDeliveryList.safeParse({schemaVersion:"1.0",workspaceId:scheduleId,authorityRevision:"r1",serverNow:now,schedules:[record,{...record,scheduleId:requestId}],deliveries:[],backgroundDeliveryAvailable:false}).success).toBe(false);
  expect(executiveDeliveryList.safeParse({schemaVersion:"1.0",workspaceId:scheduleId,authorityRevision:"r1",serverNow:now,schedules:[record,{...record,scheduleId:requestId,status:"cancelled",nextOccurrence:null}],deliveries:[],backgroundDeliveryAvailable:false}).success).toBe(true);
 });
});
