// web/src/features/appointments/slots.test.ts
import { describe, it, expect } from "vitest";
import { generateSlots, hasConflict, pickRoundRobin, rescheduleBooking, detectTimezone } from "./slots";
import type { AvailabilitySchedule, Booking, EventType } from "./appointments.types";

const schedule: AvailabilitySchedule = {
  id: "s", ownerId: "u", timezone: "UTC",
  rules: [{ weekday: 1, startMin: 540, endMin: 660 }], // Pazartesi 09:00–11:00
  overrides: [{ date: "2030-01-07", available: false }], // bir Pazartesi kapalı
};
const et: EventType = {
  id: "et", ownerId: "u", slug: "x", title: "X", durationMin: 30,
  bufferBefore: 0, bufferAfter: 0, minNoticeMin: 0, location: "aura_meet",
  assignment: "solo", hostIds: ["u"],
};

// 2030-01-14 bir Pazartesi (weekday 1).
const MONDAY = "2030-01-14";
const beforeMonday = new Date(`${MONDAY}T00:00:00`).getTime() - 1_000;

describe("generateSlots", () => {
  it("kural penceresinde duration+buffer adımıyla slot üretir", () => {
    const slots = generateSlots(schedule, et, MONDAY, beforeMonday);
    expect(slots.length).toBe(4); // 09:00, 09:30, 10:00, 10:30
    expect(new Date(slots[0].startMs).getHours()).toBe(9);
  });
  it("override.available=false → boş", () => {
    expect(generateSlots(schedule, et, "2030-01-07", beforeMonday)).toEqual([]);
  });
  it("kuralı olmayan gün → boş", () => {
    expect(generateSlots(schedule, et, "2030-01-15", beforeMonday)).toEqual([]); // Salı
  });
  it("min-notice geçmiş slot'ları eler", () => {
    const late = new Date(`${MONDAY}T10:00:00`).getTime();
    const slots = generateSlots(schedule, et, MONDAY, late);
    expect(slots.every((s) => s.startMs >= late)).toBe(true);
  });
});

describe("hasConflict", () => {
  it("örtüşmeyi yakalar, bitişikliği değil", () => {
    const slot = { startMs: 100, endMs: 200 };
    expect(hasConflict(slot, [{ startMs: 150, endMs: 250 }])).toBe(true);
    expect(hasConflict(slot, [{ startMs: 200, endMs: 300 }])).toBe(false);
  });
});

describe("pickRoundRobin", () => {
  it("sarmalayarak sıradakini seçer", () => {
    expect(pickRoundRobin(["a", "b"], -1)).toBe("a");
    expect(pickRoundRobin(["a", "b"], 0)).toBe("b");
    expect(pickRoundRobin(["a", "b"], 1)).toBe("a");
  });
});

describe("rescheduleBooking", () => {
  it("yeni başlangıç + end + rescheduled durumu", () => {
    const b = { id: "1", eventTypeId: "et", inviteeName: "", inviteeEmail: "", startMs: 0, endMs: 0, status: "confirmed", location: "aura_meet" } as Booking;
    const r = rescheduleBooking(b, 1000, 30);
    expect(r.startMs).toBe(1000);
    expect(r.endMs).toBe(1000 + 30 * 60000);
    expect(r.status).toBe("rescheduled");
  });
});

describe("detectTimezone", () => {
  it("string döndürür", () => {
    expect(typeof detectTimezone()).toBe("string");
  });
});
