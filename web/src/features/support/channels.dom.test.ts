import { describe, it, expect } from "vitest";
import { channelOnboardingState, advanceConnection, canEnableCoexistence, connectedCount } from "./channels.dom";
import type { Inbox } from "./support.types";

describe("channelOnboardingState", () => {
  it("durumu adım + ilerlemeye eşler", () => {
    expect(channelOnboardingState("disconnected")).toEqual({ step: "connect", progress: 0 });
    expect(channelOnboardingState("pending").step).toBe("verifying");
    expect(channelOnboardingState("coexistence").step).toBe("migrating");
    expect(channelOnboardingState("connected")).toEqual({ step: "live", progress: 1 });
  });
  it("varsayılan disconnected", () => {
    expect(channelOnboardingState().step).toBe("connect");
  });
});

describe("advanceConnection", () => {
  it("sihirbazda bir sonraki duruma ilerler", () => {
    expect(advanceConnection("disconnected")).toBe("pending");
    expect(advanceConnection("pending")).toBe("coexistence");
    expect(advanceConnection("coexistence")).toBe("connected");
  });
  it("canlıda kalır", () => {
    expect(advanceConnection("connected")).toBe("connected");
  });
});

describe("canEnableCoexistence", () => {
  const wa = (c: Inbox["connection"], p: Inbox["provider"] = "cloud_api"): Inbox =>
    ({ id: "x", channelType: "whatsapp", name: "WA", connection: c, provider: p });
  it("Cloud API WhatsApp + doğrulanmış numara için açık", () => {
    expect(canEnableCoexistence(wa("pending"))).toBe(true);
    expect(canEnableCoexistence(wa("connected"))).toBe(true);
  });
  it("bağlı değilken kapalı", () => {
    expect(canEnableCoexistence(wa("disconnected"))).toBe(false);
  });
  it("BSP veya WhatsApp olmayan için kapalı", () => {
    expect(canEnableCoexistence(wa("pending", "bsp"))).toBe(false);
    expect(canEnableCoexistence({ id: "e", channelType: "email", name: "E", connection: "connected" })).toBe(false);
  });
});

describe("connectedCount", () => {
  it("connected + coexistence sayar", () => {
    const inboxes: Inbox[] = [
      { id: "a", channelType: "whatsapp", name: "A", connection: "connected" },
      { id: "b", channelType: "whatsapp", name: "B", connection: "coexistence" },
      { id: "c", channelType: "email", name: "C", connection: "pending" },
      { id: "d", channelType: "sms", name: "D", connection: "disconnected" },
    ];
    expect(connectedCount(inboxes)).toBe(2);
  });
});
