import { describe, it, expect } from "vitest";
import {
  windowState, messageBillable, messageCost, monthlyEstimate, volumeTier, categoryBreakdown, RATE_CARD, CSW_MIN,
} from "./messagingCost.dom";
import type { BillingContext } from "./messagingCost.dom";

describe("windowState", () => {
  it("açık pencere kalan süreyi verir", () => {
    const ws = windowState(0, 120); // 2 saat geçti
    expect(ws.open).toBe(true);
    expect(ws.remainingMin).toBe(CSW_MIN - 120);
  });
  it("süre dolunca kapalı", () => {
    const ws = windowState(0, CSW_MIN + 10);
    expect(ws.open).toBe(false);
    expect(ws.remainingMin).toBe(0);
  });
});

describe("messageBillable", () => {
  it("ücretsiz giriş noktası asla faturalı değil", () => {
    expect(messageBillable({ category: "marketing", withinWindow: false, freeEntryPoint: true })).toBe(false);
  });
  it("service ücretsiz", () => {
    expect(messageBillable({ category: "service", withinWindow: true })).toBe(false);
  });
  it("utility pencere içinde ücretsiz, dışında faturalı", () => {
    expect(messageBillable({ category: "utility", withinWindow: true })).toBe(false);
    expect(messageBillable({ category: "utility", withinWindow: false })).toBe(true);
  });
  it("marketing ve authentication her zaman faturalı", () => {
    expect(messageBillable({ category: "marketing", withinWindow: true })).toBe(true);
    expect(messageBillable({ category: "authentication", withinWindow: true })).toBe(true);
  });
});

describe("volumeTier", () => {
  it("hacme göre kademe + çarpan", () => {
    expect(volumeTier(100).tier).toBe("standard");
    expect(volumeTier(300_000).tier).toBe("growth");
    expect(volumeTier(2_000_000)).toEqual({ tier: "scale", multiplier: 0.8 });
  });
});

describe("messageCost", () => {
  it("TR marketing tam oran", () => {
    expect(messageCost({ category: "marketing", withinWindow: false }, "TR")).toBe(RATE_CARD.TR.marketing);
  });
  it("faturalı değilse 0", () => {
    expect(messageCost({ category: "service", withinWindow: true }, "TR")).toBe(0);
  });
  it("hacim indirimi uygulanır", () => {
    const c = messageCost({ category: "marketing", withinWindow: false }, "TR", 2_000_000);
    expect(c).toBeCloseTo(RATE_CARD.TR.marketing * 0.8, 4);
  });
  it("bilinmeyen bölge default'a düşer", () => {
    expect(messageCost({ category: "utility", withinWindow: false }, "ZZ")).toBe(RATE_CARD.default.utility);
  });
});

const SAMPLE: BillingContext[] = [
  { category: "marketing", withinWindow: false },
  { category: "marketing", withinWindow: false },
  { category: "utility", withinWindow: false },
  { category: "service", withinWindow: true },
];

describe("monthlyEstimate", () => {
  it("örnek trafiğin toplamını verir", () => {
    const total = monthlyEstimate(SAMPLE, "TR");
    expect(total).toBeGreaterThan(0);
    expect(total).toBe(Math.round(total * 100) / 100);
  });
});

describe("categoryBreakdown", () => {
  it("kategori başına döküm; service 0", () => {
    const b = categoryBreakdown(SAMPLE, "TR");
    expect(b.service).toBe(0);
    expect(b.marketing).toBeGreaterThan(0);
    expect(b.marketing + b.utility + b.authentication + b.service).toBeCloseTo(monthlyEstimate(SAMPLE, "TR"), 2);
  });
});
