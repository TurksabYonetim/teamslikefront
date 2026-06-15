import { beforeEach, describe, expect, it } from "vitest";
import { voicemailStore } from "./voicemailStore";

const s = () => voicemailStore.getState();

beforeEach(() => {
  s().resetStore();
});

describe("voicemailStore", () => {
  it("seed verisiyle başlar (en az bir okunmamış)", () => {
    expect(s().voicemails.length).toBeGreaterThan(0);
    expect(s().voicemails.some((v) => !v.heard)).toBe(true);
    expect(typeof s().greeting).toBe("string");
  });

  it("markHeard() bir kaydı dinlendi olarak işaretler", () => {
    const target = s().voicemails.find((v) => !v.heard)!;
    s().markHeard(target.id);
    expect(s().voicemails.find((v) => v.id === target.id)?.heard).toBe(true);
  });

  it("markHeard() bilinmeyen id'de durumu bozmaz", () => {
    const before = s().voicemails;
    s().markHeard("yok");
    expect(s().voicemails).toBe(before);
  });

  it("setGreeting() karşılama metnini günceller", () => {
    s().setGreeting("Yeni karşılama");
    expect(s().greeting).toBe("Yeni karşılama");
  });

  it("resetStore() seed'e döner", () => {
    s().markHeard(s().voicemails[0].id);
    s().setGreeting("x");
    s().resetStore();
    expect(s().greeting).not.toBe("x");
    expect(s().voicemails.some((v) => !v.heard)).toBe(true);
  });
});
