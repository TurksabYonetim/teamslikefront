// web/src/features/messaging/chat.test.ts
import { describe, it, expect } from "vitest";
import {
  deliveryNext, canEditWithin, voiceWaveform, highlightHit, priorityRank, rewriteMessage,
  urgentRepeatSchedule,
} from "./chat";

describe("chat helpers", () => {
  it("deliveryNext advances the state machine and stops at read", () => {
    expect(deliveryNext("sending")).toBe("sent");
    expect(deliveryNext("sent")).toBe("delivered");
    expect(deliveryNext("delivered")).toBe("read");
    expect(deliveryNext("read")).toBe("read");
  });

  it("canEditWithin enforces a 15-minute window", () => {
    expect(canEditWithin(0)).toBe(true);
    expect(canEditWithin(14)).toBe(true);
    expect(canEditWithin(15)).toBe(false);
    expect(canEditWithin(60)).toBe(false);
  });

  it("voiceWaveform is deterministic and bounded 0..1", () => {
    const a = voiceWaveform("seed", 15);
    const b = voiceWaveform("seed", 15);
    expect(a).toEqual(b);
    expect(a).toHaveLength(15);
    expect(a.every((n) => n >= 0 && n <= 1)).toBe(true);
  });

  it("highlightHit is case-insensitive substring match", () => {
    expect(highlightHit("Hello World", "world")).toBe(true);
    expect(highlightHit("Hello", "xyz")).toBe(false);
    expect(highlightHit("anything", "")).toBe(false);
  });

  it("priorityRank orders urgent > important > normal", () => {
    expect(priorityRank("urgent")).toBeGreaterThan(priorityRank("important"));
    expect(priorityRank("important")).toBeGreaterThan(priorityRank("normal"));
    expect(priorityRank(undefined)).toBe(0);
  });

  it("rewriteMessage transforms tone", () => {
    expect(rewriteMessage("hello there", "professional")).toBe("Hello there.");
    expect(rewriteMessage("hello.", "friendly")).toBe("Hello!");
    expect(rewriteMessage("um just really do it", "concise")).toBe("do it");
  });
});

describe("urgentRepeatSchedule", () => {
  it("emits reminders every 2 minutes until read, starting after the first interval", () => {
    // sent at t=0, not yet read → reminders at 2,4,6 within a 0..6 min window
    expect(urgentRepeatSchedule({ sentAtMin: 0, nowMin: 6 })).toEqual([2, 4, 6]);
  });

  it("returns no reminders before the first interval elapses", () => {
    expect(urgentRepeatSchedule({ sentAtMin: 0, nowMin: 1 })).toEqual([]);
  });

  it("stops at the read time when the message is read", () => {
    // read at 5 → reminders only at 2 and 4 (no 6)
    expect(urgentRepeatSchedule({ sentAtMin: 0, nowMin: 10, readAtMin: 5 })).toEqual([2, 4]);
  });

  it("emits nothing once read before the first interval", () => {
    expect(urgentRepeatSchedule({ sentAtMin: 0, nowMin: 10, readAtMin: 1 })).toEqual([]);
  });

  it("honours a custom interval and is offset-relative to sentAtMin", () => {
    expect(urgentRepeatSchedule({ sentAtMin: 10, nowMin: 13, intervalMin: 1 })).toEqual([11, 12, 13]);
  });

  it("never produces negative or unbounded output for invalid windows", () => {
    expect(urgentRepeatSchedule({ sentAtMin: 5, nowMin: 0 })).toEqual([]);
    expect(urgentRepeatSchedule({ sentAtMin: 0, nowMin: 6, intervalMin: 0 })).toEqual([]);
  });
});
