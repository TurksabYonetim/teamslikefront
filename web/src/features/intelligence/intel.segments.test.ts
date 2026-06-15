import { describe, it, expect } from "vitest";
import { segmentText, resolveLangPair, mergeSegments } from "./intel.segments";
import type { TranscriptSegment } from "./intel.types";
const seg = (over: Partial<TranscriptSegment> = {}): TranscriptSegment => ({
  id: "s1", speakerId: "usr_2", startSec: 0, en: "hello", tr: "merhaba", sentiment: "neutral", ...over,
});
describe("intel.segments", () => {
  it("segmentText resolves by lang with fallback", () => {
    expect(segmentText(seg(), "en")).toBe("hello");
    expect(segmentText(seg(), "tr")).toBe("merhaba");
    expect(segmentText(seg({ translations: { es: "hola" } }), "es")).toBe("hola");
    expect(segmentText(seg(), "zz")).toBe("merhaba"); // fallback tr
  });
  it("resolveLangPair flags translation need", () => {
    expect(resolveLangPair("en", "off")).toMatchObject({ sameLang: true, needsTranslation: false });
    expect(resolveLangPair("en", "tr")).toMatchObject({ sameLang: false, needsTranslation: true });
    expect(resolveLangPair("en", "en")).toMatchObject({ sameLang: true });
  });
  it("mergeSegments collapses consecutive same-speaker within gap", () => {
    const out = mergeSegments([seg({ id: "a", startSec: 0, en: "hi" }), seg({ id: "b", startSec: 3, en: "there" })], { gapSec: 8 });
    expect(out).toHaveLength(1);
    expect(out[0].en).toBe("hi there");
    const out2 = mergeSegments([seg({ id: "a", speakerId: "usr_2", startSec: 0 }), seg({ id: "b", speakerId: "usr_3", startSec: 1 })]);
    expect(out2).toHaveLength(2);
  });
});
