import { describe, expect, it } from "vitest";
import { BundleRegistry } from "@lead-emergence/bundle-registry";
import { WorkflowRuntime } from "@lead-emergence/workflow-runtime";
import {
  assertDomainAccess,
  assertMutationBoundary,
  PolicyDeniedError
} from "@lead-emergence/policy";
import {
  assertProviderAuthorized,
  ProviderAuthorizationError
} from "@lead-emergence/provider-contracts";
import {
  createProvenance,
  isDurableFact,
  provenanceSchema,
  reviewClaim
} from "@lead-emergence/provenance";
import { entitlementSnapshot, loadArtifacts, principal } from "./fixtures";

const now = new Date("2026-09-08T18:00:00.000Z");

describe("hostile authorization boundaries", () => {
  it("denies unauthenticated and cross-tenant reads", () => {
    expect(() => assertDomainAccess({
      principal: null,
      sourceDomain: "writing",
      targetDomain: "writing",
      targetTenantId: principal.tenantId,
      targetWorkspaceId: principal.workspaceId,
      dataClass: "full_content",
      operation: "read"
    })).toThrow(PolicyDeniedError);
    expect(() => assertDomainAccess({
      principal,
      sourceDomain: "writing",
      targetDomain: "writing",
      targetTenantId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      targetWorkspaceId: principal.workspaceId,
      dataClass: "full_content",
      operation: "read"
    })).toThrow(/Cross-tenant/);
  });

  it("denies investor-to-nonprofit and ministry-to-investing reads by default", () => {
    for (const [sourceDomain, targetDomain] of [
      ["investing", "nonprofit"],
      ["ministry", "investing"]
    ] as const) {
      expect(() => assertDomainAccess({
        principal,
        sourceDomain,
        targetDomain,
        targetTenantId: principal.tenantId,
        targetWorkspaceId: principal.workspaceId,
        dataClass: "full_content",
        operation: "read"
      })).toThrow(/explicit cross-domain grant/);
    }
  });

  it("allows only explicitly granted Executive task metadata, not underlying content", () => {
    const base = {
      principal,
      sourceDomain: "executive" as const,
      targetDomain: "ministry" as const,
      targetTenantId: principal.tenantId,
      targetWorkspaceId: principal.workspaceId,
      operation: "read" as const,
      crossDomainGrants: [{
        from: "executive" as const,
        to: "ministry" as const,
        dataClass: "task_metadata" as const,
        operations: ["read" as const]
      }]
    };
    expect(() => assertDomainAccess({ ...base, dataClass: "task_metadata" })).not.toThrow();
    expect(() => assertDomainAccess({ ...base, dataClass: "full_content" })).toThrow(/explicit cross-domain grant/);
  });

  it("fails closed when provider authorization is revoked or belongs to another user", () => {
    const requirement = {
      id: "writer.provider.wix",
      provider: "wix",
      required: false,
      authorization: { required: true, method: "oauth2" as const },
      scopes: ["resources:read"],
      operations: ["read" as const],
      dataBoundary: "One explicitly permitted resource collection."
    };
    expect(() => assertProviderAuthorized(requirement, {
      provider: "wix",
      status: "revoked",
      grantedScopes: ["resources:read"],
      authorizedSubjectId: principal.subjectId
    }, "read", principal.subjectId, now)).toThrow(ProviderAuthorizationError);
    expect(() => assertProviderAuthorized(requirement, {
      provider: "wix",
      status: "connected",
      grantedScopes: ["resources:read"],
      authorizedSubjectId: "22222222-2222-4222-8222-222222222222"
    }, "read", principal.subjectId, now)).toThrow(ProviderAuthorizationError);
  });

  it("keeps propose separate from execute and requires exact current approval", () => {
    expect(() => assertMutationBoundary("propose", "writer.workflow.resource_review", principal)).not.toThrow();
    expect(() => assertMutationBoundary("execute", "writer.workflow.publish", principal)).toThrow(/operation-specific/);
    expect(() => assertMutationBoundary("execute", "writer.workflow.publish", principal, {
      id: "approval-1",
      operation: "writer.workflow.publish",
      authorizedBySubjectId: principal.subjectId,
      expiresAt: "2026-09-08T19:00:00.000Z"
    }, now)).not.toThrow();
  });

  it("will not prepare an unentitled workflow", () => {
    const registry = new BundleRegistry();
    for (const artifact of loadArtifacts()) registry.register(artifact);
    const runtime = new WorkflowRuntime(registry);
    expect(() => runtime.prepare({
      snapshot: entitlementSnapshot(["workspace_experience"]),
      bundleKey: "writer_editor",
      workflowId: "writer.workflow.resource_review",
      principal,
      domainRequest: {
        sourceDomain: "writing",
        targetDomain: "writing",
        targetTenantId: principal.tenantId,
        targetWorkspaceId: principal.workspaceId,
        dataClass: "full_content"
      },
      providerConnections: []
    }, now)).toThrow(/not entitled/);
  });
});

describe("provenance and epistemic safety", () => {
  it("does not treat AI inference as durable fact", () => {
    const inferred = createProvenance({
      origin: "ai",
      epistemicState: "inferred",
      source: "model synthesis",
      confidence: 0.6,
      retrievedAt: "2026-09-08T18:00:00.000Z"
    });
    expect(isDurableFact(inferred)).toBe(false);
    expect(provenanceSchema.safeParse({
      ...inferred,
      epistemicState: "confirmed"
    }).success).toBe(false);
    expect(isDurableFact(reviewClaim(inferred, "confirmed", principal.subjectId, "2026-09-08T18:05:00.000Z"))).toBe(true);
  });
});
