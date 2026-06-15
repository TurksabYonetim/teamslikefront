import { describe, it, expect } from "vitest";
import {
  quotaState,
  proration,
  filterAudit,
  retentionExpired,
  residencyAllowed,
  dlpScan,
  dlpRedact,
  sensitivityRank,
  sensitivityDowngradeBlocked,
  barrierBlocks,
  flaggedTerms,
  aiCreditState,
  creditOverage,
} from "./admin.governance";

describe("quotaState", () => {
  it("ok below 80%", () => {
    expect(quotaState(50, 100)).toBe("ok");
    expect(quotaState(79, 100)).toBe("ok");
  });
  it("warn at ≥80% (and <100%)", () => {
    expect(quotaState(80, 100)).toBe("warn");
    expect(quotaState(99, 100)).toBe("warn");
  });
  it("exceeded at ≥100%", () => {
    expect(quotaState(100, 100)).toBe("exceeded");
    expect(quotaState(120, 100)).toBe("exceeded");
  });
  it("ok when limit ≤ 0", () => {
    expect(quotaState(5, 0)).toBe("ok");
    expect(quotaState(5, -1)).toBe("ok");
  });
});

describe("proration", () => {
  it("prorates remaining days, rounded to 2 decimals", () => {
    // half period remaining, +20 price diff → 10
    expect(proration(0, 20, 15, 30)).toBe(10);
  });
  it("returns 0 when daysInPeriod ≤ 0", () => {
    expect(proration(0, 20, 15, 0)).toBe(0);
  });
  it("handles downgrade (negative)", () => {
    expect(proration(40, 22, 30, 30)).toBe(-18);
  });
});

describe("filterAudit", () => {
  const events = [
    { actorId: "u1", action: "auth.login" },
    { actorId: "u2", action: "policy.update" },
    { actorId: "u1", action: "billing.view" },
  ];
  it("filters by actor (exact)", () => {
    expect(filterAudit(events, { actorId: "u1" })).toHaveLength(2);
  });
  it("filters by action substring (case-insensitive)", () => {
    expect(filterAudit(events, { action: "POLICY" })).toEqual([
      { actorId: "u2", action: "policy.update" },
    ]);
  });
  it("combines filters", () => {
    expect(filterAudit(events, { actorId: "u1", action: "auth" })).toHaveLength(1);
  });
  it("returns all with empty filters", () => {
    expect(filterAudit(events, {})).toHaveLength(3);
  });
});

describe("retentionExpired", () => {
  it("expires only when older than window", () => {
    expect(retentionExpired(91, 90)).toBe(true);
    expect(retentionExpired(90, 90)).toBe(false);
    expect(retentionExpired(10, 90)).toBe(false);
  });
});

describe("residencyAllowed", () => {
  const enabled = { kind: "residency", enabled: true, config: { region: "EU" } };
  it("allows matching region", () => {
    expect(residencyAllowed(enabled, "EU")).toBe(true);
  });
  it("blocks mismatched region", () => {
    expect(residencyAllowed(enabled, "US")).toBe(false);
  });
  it("allows when disabled or non-residency", () => {
    expect(residencyAllowed({ ...enabled, enabled: false }, "US")).toBe(true);
    expect(residencyAllowed({ kind: "dlp", enabled: true, config: {} }, "US")).toBe(true);
  });
});

describe("dlpScan / dlpRedact", () => {
  it("detects a credit card", () => {
    const f = dlpScan("Pay 4111 1111 1111 1111 today");
    expect(f.some((x) => x.kind === "card")).toBe(true);
  });
  it("detects email and TR IBAN", () => {
    expect(dlpScan("mail a@b.com").some((x) => x.kind === "email")).toBe(true);
    expect(
      dlpScan("TR33 0006 1005 1978 6457 8413 26").some((x) => x.kind === "iban"),
    ).toBe(true);
  });
  it("returns empty for clean text", () => {
    expect(dlpScan("hello world")).toEqual([]);
  });
  it("redacts every hit with default mask", () => {
    const out = dlpRedact("card 4111 1111 1111 1111 mail a@b.com");
    expect(out).not.toContain("4111");
    expect(out).not.toContain("a@b.com");
    expect(out).toContain("•••");
  });
});

describe("sensitivity", () => {
  it("ranks labels 0…3", () => {
    expect(sensitivityRank("public")).toBe(0);
    expect(sensitivityRank("restricted")).toBe(3);
  });
  it("blocks downgrade only", () => {
    expect(sensitivityDowngradeBlocked("confidential", "public")).toBe(true);
    expect(sensitivityDowngradeBlocked("public", "confidential")).toBe(false);
    expect(sensitivityDowngradeBlocked("general", "general")).toBe(false);
  });
});

describe("barrierBlocks", () => {
  const barriers: [string, string][] = [["Research", "Sales"]];
  it("blocks both directions", () => {
    expect(barrierBlocks("Research", "Sales", barriers)).toBe(true);
    expect(barrierBlocks("Sales", "Research", barriers)).toBe(true);
  });
  it("never blocks same group", () => {
    expect(barrierBlocks("Sales", "Sales", barriers)).toBe(false);
  });
  it("allows unlisted pairs", () => {
    expect(barrierBlocks("Research", "Legal", barriers)).toBe(false);
  });
});

describe("flaggedTerms", () => {
  it("flags matched supervised terms (case-insensitive)", () => {
    expect(flaggedTerms("Do not LEAK this", ["leak", "bribe"])).toEqual(["leak"]);
  });
  it("returns empty when none match", () => {
    expect(flaggedTerms("all good", ["leak"])).toEqual([]);
  });
  it("ignores blank terms", () => {
    expect(flaggedTerms("anything", ["  "])).toEqual([]);
  });
});

describe("aiCreditState / creditOverage", () => {
  it("reuses quota thresholds", () => {
    expect(aiCreditState(4300, 5000)).toBe("warn");
    expect(aiCreditState(5000, 5000)).toBe("exceeded");
    expect(aiCreditState(100, 5000)).toBe("ok");
  });
  it("computes USD overage rounded to 2 decimals", () => {
    expect(creditOverage(5200, 5000, 0.01)).toBe(2);
    expect(creditOverage(4000, 5000, 0.01)).toBe(0);
  });
});
