import { describe, it, expect, beforeEach } from "vitest";
import { captionsStore } from "./captions.store";
const S = () => captionsStore.getState();
beforeEach(() => S().resetStore());
describe("captionsStore", () => {
  it("startSession creates a session with target langs", () => {
    S().startSession("src_standup", ["tr"]);
    expect(S().session?.sourceId).toBe("src_standup");
    expect(S().session?.targetLangs).toEqual(["tr"]);
  });
  it("applyCaption buffers and applyTranslation merges", () => {
    S().startSession("src_standup");
    S().applyCaption({ id: "c1", speakerId: "usr_2", startSec: 0, en: "hi", tr: "selam", sentiment: "neutral" });
    S().applyTranslation("c1", "es", "hola");
    expect(S().caption("c1", "es")).toBe("hola");
  });
  it("setTargetLangs recomputes voicePreserving", () => {
    S().startSession("src_standup", ["off"]);
    S().setTargetLangs(["es"]);
    expect(S().session?.voicePreserving).toBe(true);
  });
});
