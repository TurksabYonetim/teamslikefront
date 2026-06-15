// web/src/features/webinar/webinarEvents.store.test.ts
import { describe, it, expect } from "vitest";
import { webinarEventsStore } from "./webinarEvents.store";

describe("webinarEventsStore", () => {
  it("adds + removes a tier", () => {
    const s = webinarEventsStore.getState();
    const before = s.tiers.length;
    s.addTier({ name: "Test", currency: "USD", price: 10, quantity: 5 });
    const added = webinarEventsStore.getState().tiers;
    expect(added.length).toBe(before + 1);
    const id = added[added.length - 1].id;
    expect(added[added.length - 1].sold).toBe(0);
    webinarEventsStore.getState().removeTier(id);
    expect(webinarEventsStore.getState().tiers.length).toBe(before);
  });

  it("sellTicket increments sold but not past quantity", () => {
    webinarEventsStore.getState().sellTicket("tt_vip"); // 120/120 sold-out
    expect(webinarEventsStore.getState().tiers.find((t) => t.id === "tt_vip")?.sold).toBe(120);
    webinarEventsStore.getState().sellTicket("tt_local"); // has stock
    expect(webinarEventsStore.getState().tiers.find((t) => t.id === "tt_local")?.sold).toBe(89);
  });

  it("toggles badge field + queues/clears", () => {
    webinarEventsStore.getState().toggleBadgeField("email");
    expect(webinarEventsStore.getState().badge.fields).toContain("email");
    webinarEventsStore.getState().queueBadges(["rg1", "rg1", "rg2"]);
    expect(webinarEventsStore.getState().printQueue).toEqual(["rg1", "rg2"]);
    webinarEventsStore.getState().clearQueue();
    expect(webinarEventsStore.getState().printQueue).toEqual([]);
  });
});
