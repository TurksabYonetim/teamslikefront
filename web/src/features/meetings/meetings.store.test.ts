import { describe, it, expect, beforeEach } from "vitest";
import { meetingStore } from "./meetings.store";

const S = () => meetingStore.getState();
beforeEach(() => S().resetStore());

describe("meetingStore", () => {
  it("seeds an in-progress meeting with participants", () => {
    expect(S().phase).toBe("in");
    expect(S().participants.length).toBeGreaterThan(0);
    expect(S().activeMeetingId).toBeTruthy();
  });
  it("toggleMic flips self mic", () => {
    const before = S().micOn; S().toggleMic(); expect(S().micOn).toBe(!before);
  });
  it("setSidePanel toggles tab and closes on repeat", () => {
    S().setSidePanel("chat"); expect(S().sidePanel).toBe("chat");
    S().setSidePanel("chat"); expect(S().sidePanel).toBe("none");
  });
  it("admit moves a lobby entry into participants", () => {
    const e = S().lobbyQueue[0];
    S().admit(e.id);
    expect(S().lobbyQueue.find((l) => l.id === e.id)).toBeUndefined();
    expect(S().participants.find((p) => p.id === e.id)).toBeTruthy();
  });
  it("muteAll mutes everyone except self", () => {
    S().muteAll();
    expect(S().participants.filter((p) => !p.isSelf).every((p) => !p.micOn)).toBe(true);
    expect(S().participants.find((p) => p.isSelf)!.micOn).toBe(true);
  });
  it("createBreakouts distributes participants across rooms", () => {
    S().createBreakouts(2);
    expect(S().breakouts).toHaveLength(2);
    const total = S().breakouts.reduce((n, b) => n + b.participantIds.length, 0);
    expect(total).toBe(S().participants.length);
  });
  it("launchPoll + votePoll toggles a single choice", () => {
    S().launchPoll("Hangi gün?", ["Cuma", "Pazartesi"]);
    const opt = S().meetingPoll!.options[0].id;
    S().votePoll(opt);
    expect(S().meetingPoll!.options[0].votes).toContain("usr_1");
  });
  it("leave returns to idle", () => { S().leave(); expect(S().phase).toBe("idle"); });

  it("sendReaction caps the floating reaction buffer at 50", () => {
    for (let i = 0; i < 80; i++) S().sendReaction("👍");
    expect(S().reactions.length).toBe(50);
  });
  it("sendReaction keeps the most recent reactions when capped", () => {
    for (let i = 0; i < 50; i++) S().sendReaction("👍");
    S().sendReaction("🎉");
    const last = S().reactions[S().reactions.length - 1];
    expect(last.emoji).toBe("🎉");
    expect(S().reactions.length).toBe(50);
  });

  it("startFromChannel links a channel + topic and enters prejoin", () => {
    S().startFromChannel("ch_product", "tp_product", "Standup");
    expect(S().phase).toBe("prejoin");
    expect(S().linkedChannelId).toBe("ch_product");
    expect(S().linkedTopicId).toBe("tp_product");
    expect(S().activeTitle).toBe("Standup");
  });
  it("postToLinkedChannel is a no-op without a linked topic", () => {
    expect(() => S().postToLinkedChannel("hi")).not.toThrow();
  });
});
