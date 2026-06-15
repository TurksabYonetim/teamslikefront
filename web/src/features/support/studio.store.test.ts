import { describe, it, expect, beforeEach } from "vitest";
import { studioStore } from "./studio.store";

beforeEach(() => {
  localStorage.clear();
  studioStore.getState().reset();
});
const get = () => studioStore.getState();
const active = () => get().agents.find((a) => a.id === get().activeAgentId)!;

describe("studioStore", () => {
  it("seed agent'larla başlar", () => {
    expect(get().agents.length).toBeGreaterThanOrEqual(2);
    expect(active()).toBeTruthy();
  });

  it("agent oluşturur ve aktif yapar", () => {
    const before = get().agents.length;
    get().createAgent("Bot X");
    expect(get().agents.length).toBe(before + 1);
    expect(active().name).toBe("Bot X");
    expect(active().status).toBe("draft");
  });

  it("ad/hedef/kanal/araç günceller", () => {
    get().setName("Yeni Ad");
    get().setGoal("Yeni hedef");
    get().toggleChannel("voice");
    expect(active().name).toBe("Yeni Ad");
    expect(active().goal).toBe("Yeni hedef");
    expect(active().channels).toContain("voice");
    get().toggleChannel("voice");
    expect(active().channels).not.toContain("voice");
  });

  it("intent ekler/siler", () => {
    const before = active().intents.length;
    get().addIntent({ label: "Selam", phrases: ["merhaba"], reply: "Selam!" });
    expect(active().intents.length).toBe(before + 1);
    const added = active().intents.at(-1)!;
    get().removeIntent(added.id);
    expect(active().intents.length).toBe(before);
  });

  it("test çalıştırınca günlük + metrik güncellenir", () => {
    get().selectAgent("ag_support");
    const before = active().metrics.runs;
    get().runTest("fatura sorum var");
    expect(get().testLog).toHaveLength(2);
    expect(get().testLog[1].who).toBe("agent");
    expect(active().metrics.runs).toBe(before + 1);
  });

  it("eşleşmeyen ifade çözülmez (resolved artmaz)", () => {
    get().selectAgent("ag_support");
    const r0 = active().metrics.resolved;
    get().runTest("kuantum fiziği");
    expect(active().metrics.resolved).toBe(r0);
  });

  it("publish durumu published yapar; agent seçimi günlüğü temizler", () => {
    get().publish();
    expect(active().status).toBe("published");
    get().runTest("x");
    get().selectAgent(get().agents[1].id);
    expect(get().testLog).toHaveLength(0);
  });

  it("agent tanımını kalıcı kılar (test günlüğü hariç)", () => {
    get().setName("Kalıcı");
    const raw = JSON.parse(localStorage.getItem("tl.support.studio.v1")!);
    expect(raw.agents).toBeDefined();
    expect(raw.testLog).toBeUndefined();
  });
});
