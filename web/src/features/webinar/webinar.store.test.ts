// web/src/features/webinar/webinar.store.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { webinarStore } from "./webinar.store";

beforeEach(() => webinarStore.getState().reset());

describe("webinarStore", () => {
  it("toggles console/live phase", () => {
    webinarStore.getState().goLive();
    expect(webinarStore.getState().phase).toBe("live");
    webinarStore.getState().exitLive();
    expect(webinarStore.getState().phase).toBe("console");
  });

  it("setEvent switches active event + mode", () => {
    webinarStore.getState().setEvent("ev_townhall");
    expect(webinarStore.getState().activeEventId).toBe("ev_townhall");
    expect(webinarStore.getState().mode).toBe("townhall");
  });

  it("register on town hall (requireApproval) → pending", () => {
    webinarStore.getState().setEvent("ev_townhall");
    const before = webinarStore.getState().registrations.length;
    webinarStore.getState().register({ name: "New Person", email: "n@p.co", team: "Ops" });
    const regs = webinarStore.getState().registrations;
    expect(regs.length).toBe(before + 1);
    expect(regs[regs.length - 1].approval).toBe("pending");
  });

  it("approve + reject pending registration", () => {
    webinarStore.getState().approveRegistration("th3");
    expect(webinarStore.getState().registrations.find((r) => r.id === "th3")?.approval).toBe("approved");
    webinarStore.getState().rejectRegistration("th4");
    expect(webinarStore.getState().registrations.find((r) => r.id === "th4")?.approval).toBe("rejected");
  });

  it("admitNext promotes oldest waitlisted for active event", () => {
    webinarStore.getState().setEvent("ev_townhall");
    webinarStore.getState().admitNext();
    expect(webinarStore.getState().registrations.find((r) => r.id === "th5")?.approval).toBe("approved");
  });
});
