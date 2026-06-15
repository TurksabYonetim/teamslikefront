import { describe, it, expect } from "vitest";
import { attendanceReport, breakoutCountdown, watermarkLabel, searchArchive, MEETING_ARCHIVE } from "./meetParity";

describe("meetParity", () => {
  it("attendanceReport computes present/noShow/rate", () => {
    const r = attendanceReport(["a", "b", "c", "d"], ["a", "c"]);
    expect(r).toMatchObject({ invited: 4, present: 2, noShow: 2 });
    expect(r.rate).toBeCloseTo(0.5);
  });
  it("breakoutCountdown clamps and flags expiry", () => {
    expect(breakoutCountdown(10_000, 4_000)).toMatchObject({ remainingSec: 6, expired: false });
    expect(breakoutCountdown(1_000, 5_000)).toMatchObject({ remainingSec: 0, expired: true });
  });
  it("watermarkLabel formats name · id · mm:ss", () => {
    expect(watermarkLabel("Ada", "mtg1", 75)).toBe("Ada · mtg1 · 1:15");
  });
  it("searchArchive filters by title or summary; empty query returns all", () => {
    expect(searchArchive(MEETING_ARCHIVE, "")).toHaveLength(MEETING_ARCHIVE.length);
    expect(searchArchive(MEETING_ARCHIVE, "standup").length).toBeGreaterThan(0);
    expect(searchArchive(MEETING_ARCHIVE, "zzzzz")).toHaveLength(0);
  });
});
