import { describe, it, expect } from "vitest";
import { buildAgenda, agendaTotal, agendaProgress, extractActionItems, meetingChapters } from "./facilitator";

describe("facilitator", () => {
  it("buildAgenda lays items on a cumulative timeline", () => {
    const a = buildAgenda([{ title: "Intro", minutes: 5 }, { title: "Demo", minutes: 10 }]);
    expect(a[0]).toMatchObject({ startMin: 0, endMin: 5 });
    expect(a[1]).toMatchObject({ startMin: 5, endMin: 15 });
  });
  it("agendaTotal sums minutes (clamped)", () => {
    expect(agendaTotal([{ title: "a", minutes: 5 }, { title: "b", minutes: -3 }, { title: "c", minutes: 10 }])).toBe(15);
  });
  it("agendaProgress finds current item and overrun", () => {
    const a = buildAgenda([{ title: "a", minutes: 5 }, { title: "b", minutes: 5 }]);
    expect(agendaProgress(a, 3)).toMatchObject({ index: 0, done: false, overrunMin: 0 });
    expect(agendaProgress(a, 12)).toMatchObject({ done: true, overrunMin: 2 });
    expect(agendaProgress([], 5)).toMatchObject({ index: -1, done: true });
  });
  it("extractActionItems mines cue words with speaker as owner", () => {
    const items = extractActionItems([
      { speaker: "Defne", text: "I'll send the deck tomorrow" },
      { speaker: "Marco", text: "Nice work everyone" },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ owner: "Defne" });
  });
  it("meetingChapters segments transcript", () => {
    const lines = Array.from({ length: 5 }, (_, i) => ({ speaker: "X", text: `line ${i}` }));
    const ch = meetingChapters(lines, 2);
    expect(ch).toHaveLength(3);
    expect(ch[0]).toMatchObject({ index: 0, lineCount: 2 });
  });
});
