import {describe,it,expect} from "vitest";
import {connectionQuery,connectionReview,connectionSnapshot,assistantConnection,externalConnection,connectionReceipt} from "../bundles/workspace-experience/connections";
const id="a".repeat(64),revision="b".repeat(64),requestId="11111111-1111-4111-8111-111111111111";
const assistant={kind:"assistant",id,revision,provider:"other",state:"setup_required",grantActive:true,registered:false,scopes:["openid"],registeredAt:null,authorizedAt:"2026-09-09T12:00:00Z",canDisconnect:true};
describe("native connection privacy contracts",()=>{
 it("admits bounded complete-page offsets only",()=>{
  expect(connectionQuery.parse({})).toEqual({offset:0});
  expect(connectionQuery.parse({offset:15000}).offset).toBe(15000);
  for(const value of [{offset:1},{offset:-25},{offset:2147483025},{offset:null},{workspaceId:requestId}])expect(connectionQuery.safeParse(value).success).toBe(false);
 });
 it("requires exact review, confirmation and retry identity without caller authority",()=>{
  const input={kind:"assistant",id,revision,requestId,confirmed:true};
  expect(connectionReview.parse(input)).toEqual(input);
  for(const patch of [{confirmed:false},{revision:"stale"},{id:requestId},{clientId:requestId},{userId:requestId}])expect(connectionReview.safeParse({...input,...patch}).success).toBe(false);
 });
 it("distinguishes authorized-but-unregistered grants from working assistant proof",()=>{
  expect(assistantConnection.parse(assistant).registered).toBe(false);
  expect(assistantConnection.safeParse({...assistant,state:"connected"}).success).toBe(false);
  expect(assistantConnection.safeParse({...assistant,clientId:requestId}).success).toBe(false);
 });
 it("never upgrades a stored credential into a connected provider claim",()=>{
  const item={kind:"external",id,revision,family:"google",providers:["gmail","google_calendar","google_drive"],canDisconnect:true,credentialState:"expired",metadataState:"connected",lastRecordedAt:null,expiresAt:null};
  expect(externalConnection.parse(item).credentialState).toBe("expired");
  for(const patch of [{credentialState:"connected"},{ciphertext:"private"},{refreshToken:"private"}])expect(externalConnection.safeParse({...item,...patch}).success).toBe(false);
 });
 it("rejects overfull pages, undeclared secrets and forged receipt scope",()=>{
  const snapshot={workspaceId:requestId,retrievedAt:"2026-09-09T12:00:00Z",assistantAccessIncluded:true,assistantAdmissionEnabled:true,externalAccessIncluded:false,offset:0,pageSize:25,assistantTotal:26,authorizedTotal:0,activeGrantTotal:26,assistants:Array(25).fill(assistant),external:[],releasedProviders:[]};
  expect(connectionSnapshot.parse(snapshot).assistantTotal).toBe(26);
  expect(connectionSnapshot.safeParse({...snapshot,assistants:Array(26).fill(assistant)}).success).toBe(false);
  expect(connectionSnapshot.safeParse({...snapshot,accessToken:"private"}).success).toBe(false);
  const receipt={requestId,kind:"assistant",id,disconnectedAt:"2026-09-09T12:00:00Z",scope:"workspace_assistant_access",affectedProviders:["other"]};
  expect(connectionReceipt.parse(receipt)).toEqual(receipt);
  expect(connectionReceipt.safeParse({...receipt,scope:"provider_grant_revoked"}).success).toBe(false);
 });
});
