import { beforeEach, describe, expect, it } from "vitest";
import { receptionistStore } from "./receptionistStore";

const s = () => receptionistStore.getState();

beforeEach(() => {
  s().resetStore();
});

describe("receptionistStore — config", () => {
  it("seed config'le başlar", () => {
    expect(s().config.intents.length).toBeGreaterThan(0);
    expect(s().config.enabled).toBe(true);
    expect(s().session.turns).toEqual([]);
  });

  it("toggleEnabled() çevirir", () => {
    s().toggleEnabled();
    expect(s().config.enabled).toBe(false);
  });

  it("addIntent() / removeIntent()", () => {
    const before = s().config.intents.length;
    s().addIntent({ id: "int_x", label: "Yeni", phrases: ["merhaba"], action: "human" });
    expect(s().config.intents.length).toBe(before + 1);
    s().removeIntent("int_x");
    expect(s().config.intents.some((i) => i.id === "int_x")).toBe(false);
  });

  it("toggleCaptureField() ekler/kaldırır", () => {
    s().toggleCaptureField("name");
    expect(s().config.captureFields.includes("name")).toBe(false);
    s().toggleCaptureField("name");
    expect(s().config.captureFields.includes("name")).toBe(true);
  });
});

describe("receptionistStore — canlı oturum", () => {
  it("ask() çağıran+AI turn ekler ve intent algılar (route_queue)", () => {
    s().ask("fiyat almak istiyorum");
    expect(s().session.turns.length).toBe(2);
    expect(s().session.turns[0].who).toBe("caller");
    expect(s().session.turns[1].who).toBe("ai");
    expect(s().session.detectedIntentId).toBe("int_sales");
    expect(s().session.action).toBe("route_queue");
  });

  it("ask() FAQ intent'inde intent.answer'ı yanıtlar", () => {
    s().ask("çalışma saatleri nedir");
    expect(s().session.turns[1].text).toContain("09:00");
    expect(s().session.action).toBe("answer_faq");
  });

  it("ask() eşleşme yoksa fallback aksiyonu (voicemail)", () => {
    s().ask("zzz qqq xxx");
    expect(s().session.detectedIntentId).toBeUndefined();
    expect(s().session.action).toBe("voicemail");
  });

  it("ask() boş metni yok sayar", () => {
    s().ask("   ");
    expect(s().session.turns.length).toBe(0);
  });

  it("resetSession() oturumu temizler, config'i korur", () => {
    s().ask("fiyat");
    s().toggleEnabled();
    s().resetSession();
    expect(s().session.turns).toEqual([]);
    expect(s().config.enabled).toBe(false);
  });

  it("resetStore() her şeyi seed'e döndürür", () => {
    s().toggleEnabled();
    s().ask("fiyat");
    s().resetStore();
    expect(s().config.enabled).toBe(true);
    expect(s().session.turns).toEqual([]);
  });
});
