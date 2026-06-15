import { describe, it, expect, beforeEach } from "vitest";
import { botflowStore, activeFlow } from "./botflow.store";

beforeEach(() => {
  localStorage.clear();
  botflowStore.getState().reset();
});
const get = () => botflowStore.getState();

describe("botflowStore", () => {
  it("seed akışlarla başlar", () => {
    expect(get().flows.length).toBeGreaterThanOrEqual(2);
    expect(activeFlow(get()).id).toBe(get().activeFlowId);
  });

  it("aktif akışı değiştirir", () => {
    const second = get().flows[1].id;
    get().setActiveFlow(second);
    expect(get().activeFlowId).toBe(second);
  });

  it("aktif akışa düğüm ekler", () => {
    const before = activeFlow(get()).nodes.length;
    get().addNode("message");
    expect(activeFlow(get()).nodes.length).toBe(before + 1);
    expect(activeFlow(get()).nodes.at(-1)?.kind).toBe("message");
  });

  it("düğümü siler ve ona işaret eden kenarları temizler", () => {
    const flow = activeFlow(get());
    // intent → "Fatura" seçeneği n_vip'e gider; n_vip'i silersek o kenar temizlenir.
    const target = "n_vip";
    get().removeNode(target);
    const after = activeFlow(get());
    expect(after.nodes.some((n) => n.id === target)).toBe(false);
    const intent = after.nodes.find((n) => n.id === "n_intent");
    expect(intent?.options?.some((o) => o.next === target)).toBe(false);
    void flow;
  });

  it("durumu localStorage'a yazar", () => {
    get().addNode("end");
    const raw = localStorage.getItem("tl.support.botflow.v1");
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).flows).toBeDefined();
  });

  it("reset seed'e döner", () => {
    get().addNode("message");
    get().reset();
    expect(activeFlow(get()).nodes.some((n) => n.id.startsWith("n_") && n.text === "Yeni mesaj")).toBe(false);
  });
});
