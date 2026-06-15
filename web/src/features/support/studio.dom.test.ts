import { describe, it, expect } from "vitest";
import { matchAgentIntent, agentReady, runAgentTest, resolutionRate } from "./studio.dom";
import type { AgentIntent, StudioAgent } from "./support.types";

const intents: AgentIntent[] = [
  { id: "inv", label: "Fatura", phrases: ["fatura", "ödeme tutarı"], reply: "Faturanı çekiyorum." },
  { id: "ref", label: "İade", phrases: ["iade", "para geri"], reply: "İaden işleniyor." },
];

describe("matchAgentIntent", () => {
  it("token örtüşmesiyle eşleştirir (noktalama/büyük harf duyarsız)", () => {
    expect(matchAgentIntent("FATURA nerede?", intents)?.id).toBe("inv");
    expect(matchAgentIntent("para geri istiyorum", intents)?.id).toBe("ref");
  });
  it("çok kelimeli ifade tam örtüşme ister", () => {
    expect(matchAgentIntent("ödeme tutarı nedir", intents)?.id).toBe("inv");
    expect(matchAgentIntent("ödeme", intents)).toBeNull(); // "tutarı" eksik
  });
  it("eşleşme yoksa null", () => {
    expect(matchAgentIntent("hava nasıl", intents)).toBeNull();
  });
});

const base: StudioAgent = {
  id: "a", name: "Asistan", goal: "Yardım et", channels: ["webchat"], status: "draft",
  knowledge: [], tools: [], intents, metrics: { runs: 0, resolved: 0 },
};

describe("agentReady", () => {
  it("tüm gereksinimler tamsa ok", () => {
    expect(agentReady(base)).toEqual({ ok: true, missing: [] });
  });
  it("eksikleri listeler", () => {
    const r = agentReady({ ...base, name: " ", goal: "", channels: [], intents: [] });
    expect(r.ok).toBe(false);
    expect(r.missing).toEqual(["name", "goal", "channels", "intents"]);
  });
});

describe("runAgentTest", () => {
  it("eşleşen intent → çözülen yanıt", () => {
    const r = runAgentTest(base, "fatura sorum var");
    expect(r.resolved).toBe(true);
    expect(r.intentId).toBe("inv");
    expect(r.reply).toBe("Faturanı çekiyorum.");
  });
  it("eşleşme yok → çözülmedi + devir", () => {
    const r = runAgentTest(base, "kediler hakkında");
    expect(r.resolved).toBe(false);
    expect(r.intentId).toBeUndefined();
  });
});

describe("resolutionRate", () => {
  it("çözülen ÷ çalıştırma", () => {
    expect(resolutionRate({ ...base, metrics: { runs: 420, resolved: 315 } })).toBe(0.75);
  });
  it("çalıştırma yoksa 0", () => {
    expect(resolutionRate(base)).toBe(0);
  });
});
