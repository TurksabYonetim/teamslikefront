import { describe, it, expect } from "vitest";
import {
  LINES,
  ROUTING_RULES,
  VOICEMAILS,
  SMS_THREADS,
  SMS_TEMPLATES,
  CALL_QUEUES,
  HUNT_GROUPS,
  IVR_MENUS,
  BUSINESS_HOURS,
  RECEPTIONIST_CONFIG,
} from "./data";

describe("phone seed data", () => {
  it("has a primary line with extensions", () => {
    expect(LINES.length).toBeGreaterThan(0);
    expect(LINES[0].e164).toMatch(/^\+/);
    expect(LINES[0].extensions.length).toBeGreaterThan(0);
  });
  it("routing rules reference the primary line and include a catch-all", () => {
    expect(ROUTING_RULES.every((r) => r.lineId === LINES[0].id)).toBe(true);
    expect(ROUTING_RULES.some((r) => r.condition === "always")).toBe(true);
  });
  it("seeds voicemail, sms, templates", () => {
    expect(VOICEMAILS.length).toBeGreaterThan(0);
    expect(SMS_THREADS[0].messages.length).toBeGreaterThan(0);
    expect(SMS_TEMPLATES.some((t) => t.body.includes("{{"))).toBe(true);
  });
  it("seeds a call queue, hunt group and IVR menu", () => {
    expect(CALL_QUEUES[0].agents.length).toBeGreaterThan(0);
    expect(HUNT_GROUPS[0].members.length).toBeGreaterThan(0);
    expect(IVR_MENUS[0].options.length).toBeGreaterThan(0);
  });
  it("receptionist config points at the seeded business hours", () => {
    expect(BUSINESS_HOURS.some((h) => h.id === RECEPTIONIST_CONFIG.hoursId)).toBe(true);
    expect(RECEPTIONIST_CONFIG.intents.length).toBeGreaterThan(0);
  });
});
