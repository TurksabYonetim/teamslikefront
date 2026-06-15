import { beforeEach, describe, expect, it } from "vitest";
import { smsStore } from "./smsStore";

const s = () => smsStore.getState();

beforeEach(() => {
  s().resetStore();
});

describe("smsStore — temel", () => {
  it("seed thread'leriyle başlar", () => {
    expect(s().threads.length).toBeGreaterThan(0);
    expect(s().templates.length).toBeGreaterThan(0);
    expect(s().scheduled).toEqual([]);
    expect(s().activeThreadId).toBeNull();
  });

  it("selectThread() aktif thread'i seçer ve okundu işaretler", () => {
    const t = s().threads.find((x) => x.unread > 0)!;
    s().selectThread(t.id);
    expect(s().activeThreadId).toBe(t.id);
    expect(s().threads.find((x) => x.id === t.id)?.unread).toBe(0);
  });

  it("sendMessage() giden mesaj ekler (outbound, hattan)", () => {
    const t = s().threads[0];
    const before = t.messages.length;
    s().sendMessage(t.id, "Merhaba dünya");
    const after = s().threads.find((x) => x.id === t.id)!;
    expect(after.messages.length).toBe(before + 1);
    const last = after.messages[after.messages.length - 1];
    expect(last.outbound).toBe(true);
    expect(last.body).toBe("Merhaba dünya");
    expect(last.from).toBe("+14155551000");
    expect(last.to).toBe(t.e164);
  });

  it("sendMessage() boş gövdeyi yok sayar", () => {
    const t = s().threads[0];
    const before = t.messages.length;
    s().sendMessage(t.id, "   ");
    expect(s().threads.find((x) => x.id === t.id)!.messages.length).toBe(before);
  });

  it("sendMessage() media ile MMS ekler", () => {
    const t = s().threads[0];
    s().sendMessage(t.id, "bak", [{ kind: "image", name: "foto.jpg" }]);
    const last = s().threads.find((x) => x.id === t.id)!.messages.slice(-1)[0];
    expect(last.media).toEqual([{ kind: "image", name: "foto.jpg" }]);
  });

  it("markThreadRead() okunmamışı sıfırlar", () => {
    const t = s().threads.find((x) => x.unread > 0)!;
    s().markThreadRead(t.id);
    expect(s().threads.find((x) => x.id === t.id)?.unread).toBe(0);
  });
});

describe("smsStore — zamanlı gönderim", () => {
  it("scheduleSms() kuyruğa ekler, mesajı henüz göndermez", () => {
    const t = s().threads[0];
    const before = t.messages.length;
    s().scheduleSms(t.id, "Sonra", 9_999_999_999_999);
    expect(s().scheduled.length).toBe(1);
    expect(s().threads.find((x) => x.id === t.id)!.messages.length).toBe(before);
  });

  it("flushDue() yalnızca zamanı gelenleri gönderir", () => {
    const t = s().threads[0];
    const before = t.messages.length;
    s().scheduleSms(t.id, "Geçmiş", 1_000);
    s().scheduleSms(t.id, "Gelecek", 9_999_999_999_999);
    s().flushDue(2_000);
    const after = s().threads.find((x) => x.id === t.id)!;
    expect(after.messages.length).toBe(before + 1);
    expect(after.messages.slice(-1)[0].body).toBe("Geçmiş");
    expect(s().scheduled.length).toBe(1);
    expect(s().scheduled[0].body).toBe("Gelecek");
  });

  it("flushDue() gönderilenleri outbound mesaj yapar", () => {
    const t = s().threads[0];
    s().scheduleSms(t.id, "Plan", 1_000);
    s().flushDue(2_000);
    const last = s().threads.find((x) => x.id === t.id)!.messages.slice(-1)[0];
    expect(last.outbound).toBe(true);
    expect(last.body).toBe("Plan");
  });

  it("resetStore() seed'e döner", () => {
    s().sendMessage(s().threads[0].id, "x");
    s().scheduleSms(s().threads[0].id, "y", 1);
    s().resetStore();
    expect(s().scheduled).toEqual([]);
    expect(s().activeThreadId).toBeNull();
  });
});
