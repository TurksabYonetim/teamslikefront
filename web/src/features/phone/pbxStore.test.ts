import { beforeEach, describe, expect, it } from "vitest";
import { pbxStore } from "./pbxStore";

const s = () => pbxStore.getState();
const Q = "queue_sales";

beforeEach(() => {
  s().resetStore();
});

describe("pbxStore — kuyruk", () => {
  it("seed verisiyle başlar", () => {
    expect(s().queues.length).toBeGreaterThan(0);
    expect(s().ivrMenus.length).toBeGreaterThan(0);
    expect(s().businessHours.length).toBeGreaterThan(0);
    expect(s().routingRules.length).toBeGreaterThan(0);
  });

  it("toggleAgentAvailable() ajan uygunluğunu çevirir", () => {
    const q = s().queues.find((x) => x.id === Q)!;
    const ag = q.agents[0];
    const before = ag.available;
    s().toggleAgentAvailable(Q, ag.id);
    expect(s().queues.find((x) => x.id === Q)!.agents.find((a) => a.id === ag.id)!.available).toBe(!before);
  });

  it("requestCallback() bekleyen çağrıyı callback ister yapar", () => {
    const q = s().queues.find((x) => x.id === Q)!;
    const call = q.waiting.find((c) => !c.callbackRequested)!;
    s().requestCallback(Q, call.id);
    expect(s().queues.find((x) => x.id === Q)!.waiting.find((c) => c.id === call.id)!.callbackRequested).toBe(true);
  });

  it("assignNext() en eski bekleyeni kaldırır", () => {
    const before = s().queues.find((x) => x.id === Q)!.waiting.length;
    s().assignNext(Q);
    expect(s().queues.find((x) => x.id === Q)!.waiting.length).toBe(before - 1);
  });

  it("assignNext() uygun ajan yoksa kuyruğu değiştirmez", () => {
    const q = s().queues.find((x) => x.id === Q)!;
    for (const a of q.agents) if (a.available) s().toggleAgentAvailable(Q, a.id);
    const before = s().queues.find((x) => x.id === Q)!.waiting.length;
    s().assignNext(Q);
    expect(s().queues.find((x) => x.id === Q)!.waiting.length).toBe(before);
  });

  it("removeWaiting() bekleyen çağrıyı kaldırır", () => {
    const call = s().queues.find((x) => x.id === Q)!.waiting[0];
    s().removeWaiting(Q, call.id);
    expect(s().queues.find((x) => x.id === Q)!.waiting.some((c) => c.id === call.id)).toBe(false);
  });
});

describe("pbxStore — IVR", () => {
  it("addIvrOption() yeni tuş ekler, var olan tuşu yok sayar", () => {
    const m = s().ivrMenus[0];
    const before = m.options.length;
    s().addIvrOption(m.id, { key: "5", label: "Yeni", action: "voicemail" });
    expect(s().ivrMenus[0].options.length).toBe(before + 1);
    s().addIvrOption(m.id, { key: "5", label: "Tekrar", action: "voicemail" });
    expect(s().ivrMenus[0].options.length).toBe(before + 1);
  });

  it("removeIvrOption() tuşu kaldırır", () => {
    const m = s().ivrMenus[0];
    const key = m.options[0].key;
    s().removeIvrOption(m.id, key);
    expect(s().ivrMenus[0].options.some((o) => o.key === key)).toBe(false);
  });
});

describe("pbxStore — yönlendirme", () => {
  it("addRoutingRule() kural ekler", () => {
    const before = s().routingRules.length;
    s().addRoutingRule({ id: "rr_x", lineId: "line_main", condition: "noAnswer", action: "voicemail" });
    expect(s().routingRules.length).toBe(before + 1);
  });

  it("updateRoutingRule() kuralı düzenler", () => {
    const r = s().routingRules[0];
    s().updateRoutingRule(r.id, { action: "voicemail", target: undefined });
    expect(s().routingRules.find((x) => x.id === r.id)!.action).toBe("voicemail");
  });

  it("removeRoutingRule() kuralı kaldırır", () => {
    const r = s().routingRules[0];
    s().removeRoutingRule(r.id);
    expect(s().routingRules.some((x) => x.id === r.id)).toBe(false);
  });

  it("resetStore() seed'e döner", () => {
    s().removeRoutingRule(s().routingRules[0].id);
    s().resetStore();
    expect(s().routingRules.length).toBeGreaterThan(0);
  });
});
