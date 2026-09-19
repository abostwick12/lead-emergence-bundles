import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
import {admittedSearchProviders,nativeSearchProviders,searchResultRoute,workspaceSearchInputSchema,workspaceSearchCatalogSchema,workspaceSearchResultSchema} from "../bundles/workspace-experience/discovery";
describe("native saved-work discovery",()=>{
 it("registers 16 individually authorized scopes and excludes private profiles",()=>{
  expect(nativeSearchProviders).toHaveLength(16);
  expect(new Set(nativeSearchProviders.map(p=>p.id)).size).toBe(16);
  expect(nativeSearchProviders.some(p=>(p.kind as string)==="profile")).toBe(false);
  for(const bundle of ["writer-editor","ministry","nonprofit-founder","investor","executive"]){
   const ui=JSON.parse(readFileSync("bundles/"+bundle+"/ui-manifest.json","utf8"));
   for(const p of nativeSearchProviders.filter(p=>p.bundleKey===ui.bundleKey))
    expect(ui.searchProviders.some((item:{id:string})=>item.id===p.id)).toBe(true);
  }
 });
 it("requires Experience and all provider capabilities, never any one capability",()=>{
  expect(admittedSearchProviders(["writer.resource.library","writer.resource.review"])).toEqual([]);
  expect(admittedSearchProviders(["workspace.search","writer.resource.library"])).toEqual([]);
  expect(admittedSearchProviders(["workspace.search","writer.resource.library","writer.resource.review"]).map(p=>p.id)).toEqual(["writer.search.resources"]);
  expect(admittedSearchProviders(["workspace.search","investor.thesis"]).map(p=>p.id)).toEqual(["investor.search.thesis"]);
  expect(admittedSearchProviders(["workspace.search"])).toEqual([]);
 });
 const input={query:"saved work",providerIds:["writer.search.resources"],authorityRevision:"current",offset:0};
 it("trims search without storing or interpreting it as a route",()=>expect(workspaceSearchInputSchema.parse({...input,query:" saved work "}).query).toBe("saved work"));
 it.each([{query:"a"},{query:"x".repeat(201)},{providerIds:[]},{providerIds:["ministry.search.profile"]},{providerIds:["writer.search.resources","writer.search.resources"]},{workspaceId:"forged"},{offset:1},{offset:10025},{authorityRevision:""}])("rejects malformed or injected requests %#",patch=>expect(workspaceSearchInputSchema.safeParse({...input,...patch}).success).toBe(false));
 it("builds original links only from registered providers and UUIDs",()=>{
  expect(searchResultRoute("investor.search.thesis","a1000000-0000-4000-8000-000000000001")).toBe("/workspace/investing/thesis/a1000000-0000-4000-8000-000000000001");
  expect(()=>searchResultRoute("ministry.search.profile","a1000000-0000-4000-8000-000000000001")).toThrow();
  expect(()=>searchResultRoute("writer.search.resources","../../profile")).toThrow();
 });
 it("rejects unknown catalogs, duplicate scopes and contradictory coverage",()=>{
  const base={workspaceId:"a1000000-0000-4000-8000-000000000001",authorityRevision:"current"};
  expect(workspaceSearchCatalogSchema.safeParse({...base,providerIds:["unknown"]}).success).toBe(false);
  const result={...base,retrievedAt:"2026-09-12T12:00:00Z",query:"saved work",offset:0,matchingCount:0,coverage:[{providerId:"writer.search.resources",matchingCount:0}],results:[]};
  expect(workspaceSearchResultSchema.safeParse(result).success).toBe(true);
  expect(workspaceSearchResultSchema.safeParse({...result,matchingCount:1}).success).toBe(false);
  expect(workspaceSearchResultSchema.safeParse({...result,coverage:[...result.coverage,...result.coverage]}).success).toBe(false);
 });
});
