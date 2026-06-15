// web/src/features/support/conversation.store.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { conversationStore } from "./conversation.store";
import { MACROS } from "./support.data";

beforeEach(() => conversationStore.getState().reset());

const get = () => conversationStore.getState();
const conv = (id: string) => get().conversations.find((c) => c.id === id)!;

describe("conversationStore", () => {
  it("setActive unread'i sıfırlar", () => {
    expect(conv("cv1").unread).toBe(1);
    get().setActive("cv1");
    expect(get().activeConversationId).toBe("cv1");
    expect(conv("cv1").unread).toBe(0);
  });

  it("sendReply giden agent mesajı ekler", () => {
    const before = conv("cv1").messages.length;
    get().sendReply("cv1", "Merhaba", "usr_1");
    const msgs = conv("cv1").messages;
    expect(msgs.length).toBe(before + 1);
    expect(msgs[msgs.length - 1]).toMatchObject({ direction: "out", authorType: "agent", body: "Merhaba" });
  });

  it("addNote private not ekler", () => {
    get().addNote("cv1", "iç not", "usr_1");
    const last = conv("cv1").messages.at(-1)!;
    expect(last.authorType).toBe("note");
    expect(last.private).toBe(true);
  });

  it("assign + setStatus + setPriority", () => {
    get().assign("cv2", "usr_3");
    expect(conv("cv2").assigneeId).toBe("usr_3");
    get().setStatus("cv2", "resolved");
    expect(conv("cv2").status).toBe("resolved");
    get().setPriority("cv2", "low");
    expect(conv("cv2").priority).toBe("low");
  });

  it("assignNext uygun agent'ı round-robin atar", () => {
    get().assignNext("cv2");
    expect(conv("cv2").assigneeId).toBe("usr_1"); // ilk uygun
  });

  it("addLabel/removeLabel (tekrarsız)", () => {
    get().addLabel("cv3", "vip");
    get().addLabel("cv3", "vip");
    expect(conv("cv3").labels.filter((l) => l === "vip").length).toBe(1);
    get().removeLabel("cv3", "vip");
    expect(conv("cv3").labels).not.toContain("vip");
  });

  it("applyMacro durum/öncelik/etiket + reply uygular", () => {
    const refund = MACROS.find((m) => m.id === "mac_refund")!;
    const before = conv("cv2").messages.length;
    get().applyMacro("cv2", refund);
    const c = conv("cv2");
    expect(c.status).toBe("resolved");
    expect(c.labels).toContain("refund");
    expect(c.messages.length).toBe(before + 1);
  });

  it("submitCsat puan kaydeder", () => {
    get().submitCsat("cv1", 4);
    expect(conv("cv1").csat).toBe(4);
  });
});
