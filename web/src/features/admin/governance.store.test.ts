import { describe, it, expect, beforeEach } from "vitest";
import { adminStore } from "./governance.store";

beforeEach(() => {
  localStorage.clear();
  adminStore.getState().reset();
});

describe("governance.store", () => {
  it("seeds default mock data", () => {
    const s = adminStore.getState();
    expect(s.policies.length).toBeGreaterThan(0);
    expect(s.federation.length).toBeGreaterThan(0);
    expect(s.billing.plan).toBe("business");
  });

  it("recordAudit prepends a new event", () => {
    const before = adminStore.getState().audit.length;
    adminStore.getState().recordAudit("test.action", "res", "usr_1");
    const after = adminStore.getState().audit;
    expect(after.length).toBe(before + 1);
    expect(after[0].action).toBe("test.action");
  });

  it("togglePolicy flips enabled and records an audit event", () => {
    const pol = adminStore.getState().policies[0];
    const before = adminStore.getState().audit.length;
    adminStore.getState().togglePolicy(pol.id);
    const next = adminStore.getState().policies.find((p) => p.id === pol.id)!;
    expect(next.enabled).toBe(!pol.enabled);
    expect(adminStore.getState().audit.length).toBe(before + 1);
    expect(adminStore.getState().audit[0].action).toBe("policy.update");
  });

  it("setPolicyConfig updates a single config key only", () => {
    const pol = adminStore.getState().policies.find((p) => p.kind === "retention")!;
    adminStore.getState().setPolicyConfig(pol.id, "days", "180");
    const next = adminStore.getState().policies.find((p) => p.id === pol.id)!;
    expect(next.config.days).toBe("180");
  });

  it("addBridge adds unique bridges and dedupes", () => {
    const fed = adminStore.getState().federation[0];
    adminStore.getState().addBridge(fed.id, "discord");
    let next = adminStore.getState().federation.find((f) => f.id === fed.id)!;
    expect(next.bridges).toContain("discord");
    const len = next.bridges.length;
    adminStore.getState().addBridge(fed.id, "discord"); // duplicate
    next = adminStore.getState().federation.find((f) => f.id === fed.id)!;
    expect(next.bridges.length).toBe(len);
  });

  it("upgradePlan changes plan (UI flow) and records audit", () => {
    adminStore.getState().upgradePlan("enterprise");
    expect(adminStore.getState().billing.plan).toBe("enterprise");
    expect(adminStore.getState().audit[0].action).toBe("subscription.update");
  });

  it("applyEvent is idempotent for audit.recorded", () => {
    const evt = {
      type: "audit.recorded" as const,
      event: {
        id: "dup1",
        tenantId: "t1",
        actorId: "u1",
        action: "x",
        resource: "r",
        at: Date.now(),
      },
    };
    adminStore.getState().applyEvent(evt);
    const len = adminStore.getState().audit.length;
    adminStore.getState().applyEvent(evt); // same id again
    expect(adminStore.getState().audit.length).toBe(len);
  });

  it("persists to localStorage and reload restores", () => {
    adminStore.getState().upgradePlan("pro");
    const raw = localStorage.getItem("tl.admin.governance.v1");
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).billing.plan).toBe("pro");
  });

  it("reset restores defaults", () => {
    adminStore.getState().upgradePlan("free");
    adminStore.getState().reset();
    expect(adminStore.getState().billing.plan).toBe("business");
  });
});
