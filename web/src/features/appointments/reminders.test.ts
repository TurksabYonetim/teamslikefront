// web/src/features/appointments/reminders.test.ts
import { describe, it, expect } from "vitest";
import { reminderTimes, hasConflict } from "./reminders";

describe("reminderTimes", () => {
  it("offset'leri başlangıçtan çıkarır, sıralı + start öncesi", () => {
    const start = 10_000_000;
    const times = reminderTimes(start, [60, 1440]);
    expect(times).toEqual([start - 1440 * 60000, start - 60 * 60000]);
  });
  it("start sonrası (negatif/0 offset) elenir", () => {
    expect(reminderTimes(1000, [0])).toEqual([]);
  });
});

describe("hasConflict", () => {
  it("örtüşmeyi yakalar", () => {
    const existing = [{ startMs: 0, durationMin: 60 }];
    expect(hasConflict(existing, 30 * 60000, 60)).toBe(true);
    expect(hasConflict(existing, 60 * 60000, 30)).toBe(false);
  });
});
