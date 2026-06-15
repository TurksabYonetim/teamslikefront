// web/src/features/webinar/webinar.api.test.ts
import { describe, it, expect } from "vitest";
import { webinarApi, delay } from "./webinar.api";
import { EVENTS } from "./webinar.data";

describe("webinar.api — FastAPI sözleşme taklidi (frontend-only)", () => {
  it("delay resolves after the given ms", async () => {
    const t0 = Date.now();
    await delay(5);
    expect(Date.now() - t0).toBeGreaterThanOrEqual(0);
  });

  it("fetchEvents returns a cloned list (mutasyon sızdırmaz)", async () => {
    const list = await webinarApi.fetchEvents();
    expect(list.map((e) => e.id)).toEqual(EVENTS.map((e) => e.id));
    list[0].title = "MUTATED";
    expect(EVENTS[0].title).not.toBe("MUTATED");
  });

  it("fetchEvent returns the matching event", async () => {
    const ev = await webinarApi.fetchEvent("ev_townhall");
    expect(ev?.id).toBe("ev_townhall");
  });

  it("fetchEvent rejects unknown ids with null", async () => {
    expect(await webinarApi.fetchEvent("nope")).toBeNull();
  });

  it("submitRegistration assigns approval via domain rules", async () => {
    const reg = await webinarApi.submitRegistration("ev_townhall", { name: "T", email: "t@x.co", team: "Ops" });
    // ev_townhall requireApproval=true → pending
    expect(reg.approval).toBe("pending");
    expect(reg.eventId).toBe("ev_townhall");
    expect(reg.id).toMatch(/^rg_/);
  });

  it("createPoll returns a live poll with empty votes", async () => {
    const poll = await webinarApi.createPoll("ev_launch", "Ship next?", ["A", "B"]);
    expect(poll.state).toBe("live");
    expect(poll.options.map((o) => o.text)).toEqual(["A", "B"]);
    expect(poll.options.every((o) => o.votes.length === 0)).toBe(true);
  });

  it("createQna returns an unanswered item authored by the caller", async () => {
    const q = await webinarApi.createQna("ev_launch", "u1", "Why?");
    expect(q.answered).toBe(false);
    expect(q.authorId).toBe("u1");
    expect(q.upvotes).toEqual([]);
  });

  it("upvoteQna toggles a voter on/off", async () => {
    const seed = { id: "q", eventId: "ev_launch", authorId: "a", text: "", upvotes: [] as string[], answered: false, tSec: 0 };
    const added = await webinarApi.upvoteQna(seed, "v1");
    expect(added.upvotes).toEqual(["v1"]);
    const removed = await webinarApi.upvoteQna(added, "v1");
    expect(removed.upvotes).toEqual([]);
  });
});
