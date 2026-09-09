import {describe,it,expect} from "vitest";
import {emptyExecutiveData,executiveSchemas,executiveMeetingAvailability,type ExecutiveData} from "../bundles/executive/contracts";
import {proposeExecutiveTimes,chooseExecutiveMeetingTime,executiveAvailabilityMatches} from "../bundles/executive/scheduling";
const now="2026-09-09T12:00:00Z",at=(hour:string)=>"2026-09-09T"+hour+":00Z";
const window=(start:string,end:string)=>({start:at(start),end:at(end)});
const input={offered:[window("14:00","18:00")],available:[window("14:00","18:00")],busy:[],source:"Fictional manually reviewed availability",
 checkedAt:now,confirmAvailabilityChecked:true as const,timeZone:"UTC",durationMinutes:30,bufferMinutes:15};
const meeting={...emptyExecutiveData("meeting","2026-09-09"),title:"Fictional meeting",objective:"Choose a next step",timeZone:"UTC",
 durationMinutes:30,participants:[{name:"Fictional colleague",role:"Reviewer"}]} as Extract<ExecutiveData,{recordType:"meeting"}>;
const snapshot={input,participants:meeting.participants};
describe("Resumable Executive availability planning",()=>{
 it("merges overlapping and adjacent free windows before reserving buffers",()=>{
  const result=proposeExecutiveTimes({...input,offered:[window("14:00","14:30"),window("14:30","16:00")],
   available:[window("14:00","14:30"),window("14:20","16:00")]},now);
  expect(result.slots[0]).toEqual({start:at("14:15").replace("Z",".000Z"),end:at("14:45").replace("Z",".000Z")});
  expect(result.slots).toHaveLength(2);
 });
 it("handles unsorted, overlapping and enclosing busy windows without skipping a valid boundary",()=>{
  const result=proposeExecutiveTimes({...input,busy:[window("15:15","16:00"),window("15:00","17:00"),window("14:30","15:30")]},now);
  expect(result.slots).toEqual([{start:at("17:15").replace("Z",".000Z"),end:at("17:45").replace("Z",".000Z")}]);
 });
 it("permutes input order without changing proposals and never mutates inputs",()=>{
  const value={...input,offered:[window("17:00","18:00"),window("14:00","16:00")],busy:[window("15:00","15:30"),window("17:00","17:15")]};
  const before=structuredClone(value),first=proposeExecutiveTimes(value,now);
  expect(proposeExecutiveTimes({...value,offered:[...value.offered].reverse(),busy:[...value.busy].reverse()},now)).toEqual(first);
  expect(value).toEqual(before);
 });
 it("rounds starts forward to five-minute boundaries and honors exact busy boundaries",()=>{
  const result=proposeExecutiveTimes({...input,bufferMinutes:0,offered:[window("14:01","15:30")],busy:[window("14:35","15:00")]},now);
  expect(result.slots.map(s=>s.start)).toEqual([at("14:05").replace("Z",".000Z"),at("15:00").replace("Z",".000Z")]);
 });
 it("does not return past slots or invent overlap after buffers remove all room",()=>{
  expect(proposeExecutiveTimes(input,at("18:01")).status).toBe("no_overlap");
  expect(proposeExecutiveTimes({...input,available:[window("14:00","14:30")]},now).slots).toEqual([]);
 });
 it("retains a strict, optional availability snapshot without invalidating legacy meetings",()=>{
  expect(executiveSchemas.meeting.safeParse(meeting).success).toBe(true);
  const saved=executiveSchemas.meeting.parse({...meeting,availability:snapshot});
  expect(saved.availability).toEqual(snapshot);
  expect(executiveMeetingAvailability.safeParse({...snapshot,privateCalendarToken:"not-a-token"}).success).toBe(false);
  expect(executiveMeetingAvailability.safeParse({...snapshot,input:{...input,confirmAvailabilityChecked:false}}).success).toBe(false);
 });
 it("retains stale historical availability but requires a new check before using it",()=>{
  const stale={...snapshot,input:{...input,checkedAt:"2026-09-01T12:00:00Z"}};
  expect(executiveSchemas.meeting.safeParse({...meeting,availability:stale}).success).toBe(true);
  expect(()=>chooseExecutiveMeetingTime(meeting,stale,at("14:15"),now)).toThrow(/Recheck/);
 });
 it.each(["participants","duration","zone"])("rejects choices for changed %s",kind=>{
  const changed={...meeting,...(kind==="participants"?{participants:[]}:
   kind==="duration"?{durationMinutes:60}:{timeZone:"America/Chicago"})};
  expect(executiveAvailabilityMatches(changed,snapshot)).toBe(false);
  expect(()=>chooseExecutiveMeetingTime(changed,snapshot,at("14:15"),now)).toThrow(/changed/);
 });
 it("chooses a still-fitting slot with provenance and clears agreement/confirmation claims",()=>{
  const original={...meeting,agreement:"user_reported_agreed" as const,reviewState:"confirmed" as const,startsAt:at("13:00")};
  const next=chooseExecutiveMeetingTime(original,snapshot,at("14:15"),now);
  expect(next).toMatchObject({startsAt:"2026-09-09T14:15:00.000Z",agreement:"not_agreed",reviewState:"inferred",availability:snapshot});
  expect(executiveSchemas.meeting.safeParse(next).success).toBe(true);
  expect(original.agreement).toBe("user_reported_agreed");
 });
 it("rejects a stale displayed choice that now starts in the past or conflicts",()=>{
  expect(()=>chooseExecutiveMeetingTime(meeting,snapshot,at("14:15"),at("14:16"))).toThrow(/no longer fits/);
  expect(()=>chooseExecutiveMeetingTime(meeting,{...snapshot,input:{...input,busy:[window("14:00","15:00")]}},at("14:15"),now)).toThrow(/no longer fits/);
 });
 it("rounds submillisecond input conservatively instead of proposing inside a conflict",()=>{
  const start="2026-09-09T14:00:00.000001Z",end="2026-09-09T15:00:00Z";
  expect(proposeExecutiveTimes({...input,bufferMinutes:0,offered:[{start,end}]},now).slots[0].start).toBe("2026-09-09T14:05:00.000Z");
  expect(proposeExecutiveTimes({...input,bufferMinutes:0,busy:[{start:at("13:00"),end:start}]},now).slots[0].start).toBe("2026-09-09T14:05:00.000Z");
 });
 it("ignores object property order when checking the participant snapshot",()=>{
  expect(executiveAvailabilityMatches(meeting,{...snapshot,participants:[{role:"Reviewer",name:"Fictional colleague"}]})).toBe(true);
 });
 it("rejects inverted, overlong, zero-length and unzoned retained windows",()=>{
  for(const offered of [[window("15:00","14:00")],[window("14:00","14:00")],
   [{start:now,end:"2026-11-09T12:00:00Z"}],[{start:"2026-09-09T14:00:00",end:at("15:00")}]]){
   expect(executiveSchemas.meeting.safeParse({...meeting,availability:{...snapshot,input:{...input,offered}}}).success).toBe(false);
  }
 });
});
