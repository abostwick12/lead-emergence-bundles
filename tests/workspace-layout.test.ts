import {describe,it,expect} from "vitest";
import {applyWorkspaceLayout,emptyWorkspaceLayout,inactiveLayoutChoices,workspaceLayoutSchema,workspaceLayoutCatalog} from "../bundles/workspace-experience/layout";
import {composeUiManifests} from "../packages/ui-manifest/src";
import type {UiManifest} from "../packages/ui-manifest/src";
const manifest=(bundleKey:string):UiManifest=>({
 schemaVersion:"1.0",bundleKey,
 primaryNavigation:[{id:bundleKey+".nav.main",label:bundleKey,order:10,route:"/workspace/"+bundleKey,capabilityId:bundleKey+".read"}],
 secondaryNavigation:[],dashboardWidgets:[{id:bundleKey+".widget.main",label:bundleKey,order:10,type:"attention",capabilityId:bundleKey+".read",attentionTypes:[]}],
 quickActions:[],commandPaletteActions:[],searchProviders:[],notificationTypes:[],emptyStates:[],bundleSettings:[]
});
const first=manifest("alpha"),second=manifest("bravo"),base=composeUiManifests([first,second]);
describe("user-owned workspace layout",()=>{
 it("keeps an explicit Home default and a complete restoration catalog",()=>{
  const result=applyWorkspaceLayout(base,emptyWorkspaceLayout());
  expect(result.defaultWorkspaceRoute).toBe("/workspace");
  expect(workspaceLayoutCatalog(base).navigation).toHaveLength(2);
 });
 it("pins navigation and widgets independently, then applies deterministic order",()=>{
  const result=applyWorkspaceLayout(base,{...emptyWorkspaceLayout(),pinnedNavigationIds:["bravo:bravo.nav.main"],pinnedWidgetIds:["alpha:alpha.widget.main"],
   orderOverrides:{"alpha:alpha.nav.main":0,"bravo:bravo.nav.main":100,"bravo:bravo.widget.main":0,"alpha:alpha.widget.main":100}});
  expect(result.primaryNavigation.map(x=>x.sourceBundleKey)).toEqual(["bravo","alpha"]);
  expect(result.dashboardWidgets.map(x=>x.sourceBundleKey)).toEqual(["alpha","bravo"]);
 });
 it("hides presentation without changing search, actions, authority or the input",()=>{
  const before=structuredClone(base),result=applyWorkspaceLayout(base,{...emptyWorkspaceLayout(),hiddenItemIds:["alpha:alpha.nav.main","bravo:bravo.widget.main"]});
  expect(result.primaryNavigation.map(x=>x.sourceBundleKey)).toEqual(["bravo"]);
  expect(result.dashboardWidgets.map(x=>x.sourceBundleKey)).toEqual(["alpha"]);
  expect(result.searchProviders).toEqual(base.searchProviders);expect(base).toEqual(before);
  expect(workspaceLayoutCatalog(base).navigation).toHaveLength(2);
 });
 it("never creates missing contributions and falls back safely when a preferred route is no longer admitted",()=>{
  const preferences={...emptyWorkspaceLayout(),pinnedNavigationIds:["other:other.nav.main"],defaultWorkspaceRoute:"/workspace/other"};
  const result=applyWorkspaceLayout(base,preferences);
  expect(result.primaryNavigation).toHaveLength(2);expect(result.defaultWorkspaceRoute).toBe("/workspace");
  expect(preferences.defaultWorkspaceRoute).toBe("/workspace/other");expect(inactiveLayoutChoices(base,preferences)).toBe(1);
 });
 it("preserves a hidden yet admitted default and restores dormant choices after re-admission",()=>{
  const preferences={...emptyWorkspaceLayout(),hiddenItemIds:["alpha:alpha.nav.main"],defaultWorkspaceRoute:"/workspace/alpha"};
  expect(applyWorkspaceLayout(base,preferences).defaultWorkspaceRoute).toBe("/workspace/alpha");
  expect(applyWorkspaceLayout(composeUiManifests([second]),preferences).defaultWorkspaceRoute).toBe("/workspace");
  expect(applyWorkspaceLayout(base,preferences).primaryNavigation.map(x=>x.sourceBundleKey)).toEqual(["bravo"]);
 });
 it("keeps the Home escape route available even if a caller tries to hide it",()=>{
  const home={...manifest("shell"),primaryNavigation:[{id:"shell.nav.home",label:"Home",route:"/workspace",order:0}]};
  const result=applyWorkspaceLayout(composeUiManifests([home]),{...emptyWorkspaceLayout(),hiddenItemIds:["shell:shell.nav.home"]});
  expect(result.primaryNavigation).toHaveLength(1);
 });
 it.each([
  {hiddenItemIds:["alpha:alpha.nav.main","alpha:alpha.nav.main"]},
  {hiddenItemIds:["alpha:alpha.nav.main"],pinnedNavigationIds:["alpha:alpha.nav.main"]},
  {defaultWorkspaceRoute:"https://example.invalid"}, {defaultWorkspaceRoute:"/workspace/../../login"},
  {orderOverrides:{"alpha:alpha.nav.main":-1}}, {orderOverrides:{"alpha:alpha.nav.main":0.5}},
  {tenantId:"forged"}, {pinnedWidgetIds:["invalid"]},
  {orderOverrides:Object.fromEntries(Array.from({length:201},(_,i)=>["alpha:alpha.item."+i,i]))}
 ])("rejects invalid preference input %#",patch=>expect(workspaceLayoutSchema.safeParse({...emptyWorkspaceLayout(),...patch}).success).toBe(false));
});
