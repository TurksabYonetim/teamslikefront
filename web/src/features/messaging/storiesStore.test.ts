import { describe, it, expect, beforeEach } from "vitest";
import { storiesStore, unseenFor } from "./storiesStore";
import { ME_ID } from "./members";

const S = () => storiesStore.getState();

beforeEach(() => S().reset());

describe("storiesStore", () => {
  it("seeds with stories", () => {
    expect(S().stories.length).toBeGreaterThan(0);
  });

  it("addStory prepends a fresh story with tMinutes 0", () => {
    const before = S().stories.length;
    S().addStory(ME_ID, "Selam");
    expect(S().stories.length).toBe(before + 1);
    const first = S().stories[0];
    expect(first.text).toBe("Selam");
    expect(first.authorId).toBe(ME_ID);
    expect(first.tMinutes).toBe(0);
    expect(first.seenBy).toEqual([]);
  });

  it("markSeen adds a user once", () => {
    const id = S().stories[0].id;
    S().markSeen(id, ME_ID);
    S().markSeen(id, ME_ID);
    const st = S().stories.find((s) => s.id === id)!;
    expect(st.seenBy.filter((u) => u === ME_ID)).toHaveLength(1);
  });

  it("unseenFor excludes own and already-seen stories", () => {
    const all = S().stories;
    const own = all.find((s) => s.authorId === ME_ID);
    expect(own).toBeUndefined(); // seed has no own stories
    const target = all[0];
    let unseen = unseenFor(S().stories, ME_ID);
    expect(unseen.some((s) => s.id === target.id)).toBe(true);
    S().markSeen(target.id, ME_ID);
    unseen = unseenFor(S().stories, ME_ID);
    expect(unseen.some((s) => s.id === target.id)).toBe(false);
  });
});
