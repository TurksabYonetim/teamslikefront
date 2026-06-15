// web/src/features/messaging/store.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { messagingStore } from "./store";
import { ME_ID } from "./members";

const S = () => messagingStore.getState();

beforeEach(() => {
  S().resetStore();
});

describe("messaging store", () => {
  it("seeds with channels, topics and messages", () => {
    expect(S().channels.length).toBeGreaterThan(0);
    expect(S().messages.length).toBeGreaterThan(0);
    expect(S().activeChannelId).toBe(S().channels[0].id);
  });

  it("send appends an optimistic message and clears the draft", () => {
    const ch = S().activeChannelId;
    const before = S().messages.length;
    S().setDraft(S().activeTopicId, "draft");
    S().send("Merhaba", ME_ID);
    const msgs = S().messages.filter((m) => m.channelId === ch);
    const last = msgs[msgs.length - 1];
    expect(S().messages.length).toBe(before + 1);
    expect(last.body).toBe("Merhaba");
    expect(last.status).toBe("sending");
    expect(S().draftsByTopic[S().activeTopicId]).toBe("");
  });

  it("delivery progresses sending → read over time", () => {
    vi.useFakeTimers();
    S().send("Hi", ME_ID);
    const id = S().messages[S().messages.length - 1].id;
    vi.advanceTimersByTime(3000);
    const m = S().messages.find((x) => x.id === id)!;
    expect(m.status).toBe("read");
    vi.useRealTimers();
  });

  it("toggleReaction adds, then removes the user's reaction", () => {
    const id = S().messages[0].id;
    S().toggleReaction(id, "🔥", ME_ID);
    let m = S().messages.find((x) => x.id === id)!;
    expect(m.reactions.find((r) => r.emoji === "🔥")?.userIds).toContain(ME_ID);
    S().toggleReaction(id, "🔥", ME_ID);
    m = S().messages.find((x) => x.id === id)!;
    expect(m.reactions.find((r) => r.emoji === "🔥")).toBeUndefined();
  });

  it("postCall appends a call system message into the active conversation", () => {
    const ch = S().activeChannelId;
    const topic = S().activeTopicId;
    const before = S().messages.length;
    S().postCall({ kind: "call", meetingId: "mtg_42" });
    expect(S().messages.length).toBe(before + 1);
    const last = S().messages[S().messages.length - 1];
    expect(last.kind).toBe("call");
    expect(last.callMeetingId).toBe("mtg_42");
    expect(last.channelId).toBe(ch);
    expect(last.topicId).toBe(topic);
  });

  it("editMessage sets edited flag and new body", () => {
    const id = S().messages[0].id;
    S().editMessage(id, "düzeltildi");
    const m = S().messages.find((x) => x.id === id)!;
    expect(m.body).toBe("düzeltildi");
    expect(m.edited).toBe(true);
  });

  it("deleteForEveryone tombstones the message", () => {
    const id = S().messages[0].id;
    S().deleteForEveryone(id);
    const m = S().messages.find((x) => x.id === id)!;
    expect(m.deleted).toBe(true);
    expect(m.body).toBe("");
  });

  it("createPoll then vote toggles a single choice", () => {
    S().createPoll("Hangisi?", ["A", "B"], {}, ME_ID);
    const poll = S().messages.find((m) => m.kind === "poll")!;
    S().vote(poll.id, poll.poll!.options[0].id, ME_ID);
    let p = S().messages.find((m) => m.id === poll.id)!.poll!;
    expect(p.options[0].votes).toContain(ME_ID);
    // tek seçim: ikinciye oy verince ilkinden düşer
    S().vote(poll.id, p.options[1].id, ME_ID);
    p = S().messages.find((m) => m.id === poll.id)!.poll!;
    expect(p.options[0].votes).not.toContain(ME_ID);
    expect(p.options[1].votes).toContain(ME_ID);
  });

  it("setChannel clears unread and updates active topic", () => {
    const target = S().channels.find((c) => (c.unread ?? 0) > 0)!;
    S().setChannel(target.id);
    expect(S().activeChannelId).toBe(target.id);
    expect(S().channels.find((c) => c.id === target.id)!.unread).toBe(0);
  });
});

describe("messaging store — composer actions", () => {
  it("sendNote appends a note-kind message", () => {
    const before = S().messages.length;
    S().sendNote("dahili not", ME_ID);
    const last = S().messages[S().messages.length - 1];
    expect(S().messages.length).toBe(before + 1);
    expect(last.kind).toBe("note");
    expect(last.body).toBe("dahili not");
  });
  it("sendVoice appends a voice message with duration", () => {
    S().sendVoice(7, ME_ID);
    const last = S().messages[S().messages.length - 1];
    expect(last.kind).toBe("voice");
    expect(last.voiceSec).toBe(7);
  });
  it("sendSticker appends a sticker message", () => {
    S().sendSticker("🎉", ME_ID);
    const last = S().messages[S().messages.length - 1];
    expect(last.kind).toBe("sticker");
    expect(last.sticker).toBe("🎉");
  });
  it("sendFile appends a file message", () => {
    S().sendFile({ name: "rapor.pdf", fileType: "pdf", sizeKb: 240 }, ME_ID);
    const last = S().messages[S().messages.length - 1];
    expect(last.kind).toBe("file");
    expect(last.file?.name).toBe("rapor.pdf");
  });
  it("schedule then sendNow flips scheduled off; delete removes it", () => {
    S().scheduleMessage("sonra", ME_ID);
    let m = S().messages[S().messages.length - 1];
    expect(m.scheduled).toBe(true);
    S().sendScheduledNow(m.id);
    m = S().messages.find((x) => x.id === m.id)!;
    expect(m.scheduled).toBe(false);
    S().scheduleMessage("sil beni", ME_ID);
    const id = S().messages[S().messages.length - 1].id;
    S().deleteScheduled(id);
    expect(S().messages.some((x) => x.id === id)).toBe(false);
  });
});

describe("messaging store — phase 5", () => {
  it("translate sets translating then translated with bodyAlt", () => {
    vi.useFakeTimers();
    const id = S().messages[0].id;
    S().translate(id);
    expect(S().messages.find((m) => m.id === id)!.translating).toBe(true);
    vi.advanceTimersByTime(500);
    const m = S().messages.find((x) => x.id === id)!;
    expect(m.translated).toBe(true);
    expect(m.bodyAlt).toBeTruthy();
    vi.useRealTimers();
  });
  it("submitCsat sets rating and resolves the conversation", () => {
    const ch = S().channels.find((c) => c.isCustomer)!;
    S().submitCsat(ch.id, 5);
    const updated = S().channels.find((c) => c.id === ch.id)!;
    expect(updated.csat).toBe(5);
    expect(updated.status).toBe("resolved");
  });
});

describe("messaging store — phase 6", () => {
  it("createDm adds a dm channel + topic and activates it", () => {
    const beforeChannels = S().channels.length;
    S().createDm(["usr_2"]);
    expect(S().channels.length).toBe(beforeChannels + 1);
    const active = S().channels.find((c) => c.id === S().activeChannelId)!;
    expect(active.kind).toBe("dm");
    expect(active.name).toBe("Defne Yıldız");
    expect(active.dmUserId).toBe("usr_2");
    // active topic belongs to the new channel
    const topic = S().topics.find((t) => t.id === S().activeTopicId)!;
    expect(topic.channelId).toBe(active.id);
  });
  it("createDm with multiple members builds a group name", () => {
    S().createDm(["usr_2", "usr_3"]);
    const active = S().channels.find((c) => c.id === S().activeChannelId)!;
    expect(active.name).toContain("Defne Yıldız");
    expect(active.name).toContain("Marco Rossi");
    expect(active.dmUserId).toBeUndefined();
    expect(active.memberIds).toEqual(["usr_2", "usr_3"]);
  });
});

describe("palette state", () => {
  beforeEach(() => S().resetStore());

  it("defaults to closed", () => {
    expect(S().paletteOpen).toBe(false);
  });

  it("togglePalette() flips, and accepts explicit value", () => {
    S().togglePalette();
    expect(S().paletteOpen).toBe(true);
    S().togglePalette(false);
    expect(S().paletteOpen).toBe(false);
    S().togglePalette(true);
    expect(S().paletteOpen).toBe(true);
  });
});

describe("messaging postExternal", () => {
  it("posts a message into a given channel/topic", () => {
    const before = S().messages.filter((m) => m.channelId === "ch_product").length;
    S().postExternal("ch_product", "tp_product", "merhaba", "usr_1");
    const after = S().messages.filter((m) => m.channelId === "ch_product" && m.body === "merhaba");
    expect(after.length).toBe(1);
    expect(S().messages.filter((m) => m.channelId === "ch_product").length).toBe(before + 1);
  });
});
