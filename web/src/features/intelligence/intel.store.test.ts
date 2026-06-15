import { describe, it, expect, beforeEach } from "vitest";
import { intelStore } from "./intel.store";
import { SOURCES } from "./intel.data";
const S = () => intelStore.getState();
beforeEach(() => S().resetStore());
describe("intelStore", () => {
  it("seeds with the first source", () => {
    expect(S().activeSourceId).toBe(SOURCES[0].id);
    expect(Array.isArray(S().segments)).toBe(true);
  });
  it("setSource switches and resets filters", () => {
    S().setSearch("x"); S().setSource(SOURCES[1].id);
    expect(S().activeSourceId).toBe(SOURCES[1].id);
    expect(S().search).toBe("");
  });
  it("applyEvent appends caption idempotently", () => {
    const id = "ev_seg_1";
    const seg = { id, speakerId: "usr_2", startSec: 0, en: "hi", tr: "selam", sentiment: "neutral" as const };
    S().applyEvent({ type: "caption.emitted", sourceId: S().activeSourceId, segment: seg });
    const n = S().segments.filter((x) => x.id === id).length;
    S().applyEvent({ type: "caption.emitted", sourceId: S().activeSourceId, segment: seg });
    expect(S().segments.filter((x) => x.id === id).length).toBe(n); // duplicate ignored
  });
  it("applyEvent ignores events for another source", () => {
    const before = S().segments.length;
    S().applyEvent({ type: "caption.emitted", sourceId: "other", segment: { id: "z", speakerId: "x", startSec: 0, en: "", tr: "", sentiment: "neutral" } });
    expect(S().segments.length).toBe(before);
  });
  it("toggleLive flips live", () => { const b = S().live; S().toggleLive(); expect(S().live).toBe(!b); });
});
