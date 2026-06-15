import { describe, it, expect } from "vitest";
import { speakerStats, topKeywords, actionItems } from "./intel.notes";
import type { TranscriptSegment } from "./intel.types";
const segs: TranscriptSegment[] = [
  { id: "1", speakerId: "usr_2", speakerName: "Defne", startSec: 0, en: "We will ship the pricing page", tr: "", sentiment: "neutral" },
  { id: "2", speakerId: "usr_3", speakerName: "Marco", startSec: 10, en: "Great pricing pricing work everyone", tr: "", sentiment: "positive" },
];
describe("intel.notes", () => {
  it("speakerStats computes words + wpm per speaker", () => {
    const st = speakerStats(segs);
    expect(st).toHaveLength(2);
    expect(st[0].speakerId).toBe("usr_2");
    expect(st[0].wpm).toBeGreaterThan(0);
  });
  it("topKeywords removes stopwords/short tokens and ranks", () => {
    const kw = topKeywords(segs, 5);
    expect(kw.find((k) => k.word === "pricing")?.count).toBe(3);
    expect(kw.some((k) => k.word === "we")).toBe(false);
  });
  it("actionItems detects cue sentences", () => {
    expect(actionItems(segs)).toContain("We will ship the pricing page");
  });
});
