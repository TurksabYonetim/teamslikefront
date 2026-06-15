import { describe, it, expect } from "vitest";
import { coachingToastVariant, newCoachingCues } from "./intel.coaching";
import type { CoachingCue } from "./intel.types";

const cue = (id: string, kind: CoachingCue["kind"]): CoachingCue => ({
  id,
  kind,
  text: `cue ${id}`,
  tSec: 0,
});

describe("coachingToastVariant", () => {
  it("warning maps to warning (amber tone)", () => {
    expect(coachingToastVariant("warning")).toBe("warning");
  });
  it("tip and praise map to default", () => {
    expect(coachingToastVariant("tip")).toBe("default");
    expect(coachingToastVariant("praise")).toBe("default");
  });
});

describe("newCoachingCues", () => {
  it("returns only cues whose id was not in the previous list", () => {
    const prev = [cue("a", "tip")];
    const next = [cue("a", "tip"), cue("b", "warning")];
    expect(newCoachingCues(prev, next)).toEqual([cue("b", "warning")]);
  });
  it("returns empty when nothing new", () => {
    const list = [cue("a", "tip")];
    expect(newCoachingCues(list, list)).toEqual([]);
  });
  it("returns all when prev is empty", () => {
    const next = [cue("a", "tip"), cue("b", "praise")];
    expect(newCoachingCues([], next)).toEqual(next);
  });
});
