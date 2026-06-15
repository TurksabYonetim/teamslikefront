import { describe, expect, it } from "vitest";
import {
  autoChapters,
  autoSummary,
  clipToDoc,
  clipToMessage,
  clipToWorkItem,
  completionRate,
  extractTasks,
  isLinkExpired,
  reactionTotal,
  removeFillerWords,
  sentences,
  topClips,
} from "./workspace.clips";
import type { Clip } from "./workspace.types";

const baseClip = (over: Partial<Clip> = {}): Clip => ({
  id: "c",
  title: "Demo",
  authorId: "usr_1",
  durationSec: 100,
  transcript: "",
  views: 0,
  ...over,
});

describe("sentences", () => {
  it("splits on . ! ? and newlines, trimming empties", () => {
    expect(sentences("One. Two!  \nThree?")).toEqual(["One", "Two", "Three"]);
  });
});

describe("removeFillerWords", () => {
  it("removes EN filler words case-insensitively", () => {
    expect(removeFillerWords("Um, this is, like, basically done.")).toBe("this is, done.");
  });

  it("removes Turkish filler words", () => {
    expect(removeFillerWords("Yani bu işte tamam.")).toBe("bu tamam.");
  });

  it("does not touch words that merely contain a filler substring", () => {
    expect(removeFillerWords("umbrella")).toBe("umbrella");
  });
});

describe("autoSummary", () => {
  it("takes the first 1-2 sentences and ends with a period", () => {
    expect(autoSummary("First sentence. Second one. Third one.")).toBe("First sentence. Second one.");
  });

  it("truncates with an ellipsis past maxLen", () => {
    const out = autoSummary("a".repeat(200), 20);
    expect(out.length).toBe(20);
    expect(out.endsWith("…")).toBe(true);
  });

  it("returns empty for an empty transcript", () => {
    expect(autoSummary("")).toBe("");
  });
});

describe("autoChapters", () => {
  it("creates up to max evenly time-stamped chapters", () => {
    const ch = autoChapters("a b c d e f. g h. i j. k l. m n.", 90, 3);
    expect(ch).toHaveLength(3); // capped at max
    expect(ch[0].atSec).toBe(0);
    expect(ch[0].title.split(" ").length).toBeLessThanOrEqual(5);
  });

  it("returns empty for empty transcript", () => {
    expect(autoChapters("", 90)).toEqual([]);
  });
});

describe("extractTasks", () => {
  it("keeps sentences containing action cues (EN + TR)", () => {
    const out = extractTasks("We should ship the fix. Sky is blue. Takip et.");
    expect(out).toEqual(["We should ship the fix", "Takip et"]);
  });
});

describe("clip transforms", () => {
  it("clipToDoc numbers the steps under a heading", () => {
    expect(clipToDoc(baseClip({ title: "T", transcript: "Step one. Step two." }))).toBe(
      "# T\n\n1. Step one\n2. Step two",
    );
  });

  it("clipToWorkItem renders checkbox tasks", () => {
    const wi = clipToWorkItem(baseClip({ title: "T", tasks: ["A", "B"] }));
    expect(wi).toEqual({ title: "T", body: "- [ ] A\n- [ ] B" });
  });

  it("clipToMessage uses the summary", () => {
    expect(clipToMessage(baseClip({ title: "T", summary: "Hi." }))).toBe('Recorded a quick clip — "T". Hi.');
  });
});

describe("engagement helpers", () => {
  it("isLinkExpired respects linkExpiresAt", () => {
    expect(isLinkExpired(baseClip({ linkExpiresAt: 10 }), 20)).toBe(true);
    expect(isLinkExpired(baseClip({ linkExpiresAt: 30 }), 20)).toBe(false);
    expect(isLinkExpired(baseClip(), 20)).toBe(false);
  });

  it("completionRate clamps to 0..1", () => {
    expect(completionRate(baseClip({ completionRate: 1.4 }))).toBe(1);
    expect(completionRate(baseClip({ completionRate: -1 }))).toBe(0);
    expect(completionRate(baseClip())).toBe(0);
  });

  it("reactionTotal sums all emoji counts", () => {
    expect(reactionTotal(baseClip({ reactions: [{ emoji: "🔥", count: 4 }, { emoji: "👍", count: 7 }] }))).toBe(11);
  });

  it("topClips sorts by views desc and slices", () => {
    const clips = [baseClip({ id: "a", views: 1 }), baseClip({ id: "b", views: 9 }), baseClip({ id: "c", views: 5 })];
    expect(topClips(clips, 2).map((c) => c.id)).toEqual(["b", "c"]);
  });
});
