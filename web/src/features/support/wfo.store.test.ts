import { describe, it, expect, beforeEach } from "vitest";
import { wfoStore } from "./wfo.store";

beforeEach(() => {
  localStorage.clear();
  wfoStore.getState().reset();
});
const get = () => wfoStore.getState();

describe("wfoStore", () => {
  it("seed aralık + skorkart + değerlendirmelerle başlar", () => {
    expect(get().intervals.length).toBeGreaterThan(0);
    expect(get().criteria.length).toBeGreaterThan(0);
    expect(get().evaluations.length).toBeGreaterThanOrEqual(1);
  });

  it("hacmi değiştirince gereken-temsilci yeniden hesaplanır", () => {
    const id = get().intervals[0].id;
    get().setVolume(id, 60);
    const i = get().intervals.find((x) => x.id === id)!;
    expect(i.forecastVolume).toBe(60);
    // 60 × 240 ÷ (1800 × 0.85) = 14400/1530 = 9.4 → 10
    expect(i.required).toBe(10);
  });

  it("negatif hacmi 0'a sıkıştırır", () => {
    const id = get().intervals[0].id;
    get().setVolume(id, -5);
    expect(get().intervals.find((x) => x.id === id)!.forecastVolume).toBe(0);
  });

  it("bumpScheduled vardiyadakini artırır", () => {
    const i = get().intervals[1];
    const before = i.scheduled;
    get().bumpScheduled(i.id);
    expect(get().intervals.find((x) => x.id === i.id)!.scheduled).toBe(before + 1);
  });

  it("değerlendirme ekler", () => {
    const before = get().evaluations.length;
    get().addEvaluation("usr_1", "cv1", { sc_greet: 5 });
    expect(get().evaluations.length).toBe(before + 1);
    expect(get().evaluations.at(-1)?.agentId).toBe("usr_1");
  });

  it("durumu kalıcı kılar", () => {
    get().setVolume(get().intervals[0].id, 99);
    expect(JSON.parse(localStorage.getItem("tl.support.wfo.v1")!).intervals).toBeDefined();
  });
});
