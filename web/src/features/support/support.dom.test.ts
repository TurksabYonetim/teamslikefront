// web/src/features/support/support.dom.test.ts
import { describe, it, expect } from "vitest";
import { pickAgent, slaState, expandMacro, renderCanned, csatAverage, searchKb } from "./support.dom";
import type { Agent, Conversation, KbArticle, Macro } from "./support.types";

const agents: Agent[] = [
  { id: "a", name: "A", available: true },
  { id: "b", name: "B", available: false },
  { id: "c", name: "C", available: true },
];

describe("pickAgent", () => {
  it("uygun olmayanı atlayarak round-robin seçer", () => {
    expect(pickAgent(agents, -1)?.id).toBe("a");
    expect(pickAgent(agents, 0)?.id).toBe("c"); // b unavailable → atla
    expect(pickAgent(agents, 2)?.id).toBe("a"); // sar
  });
  it("boş listede null", () => {
    expect(pickAgent([], -1)).toBeNull();
  });
});

describe("slaState", () => {
  it("breached/due_soon/ok sınıflandırır", () => {
    const now = 1_000_000;
    expect(slaState(now - 1, now)).toBe("breached");
    expect(slaState(now + 4 * 60_000, now)).toBe("due_soon");
    expect(slaState(now + 10 * 60_000, now)).toBe("ok");
  });
});

describe("expandMacro", () => {
  it("aksiyonları tek patch'e indirger", () => {
    const macro: Macro = {
      id: "m", name: "M",
      actions: [
        { type: "reply", value: "hi" },
        { type: "status", value: "resolved" },
        { type: "priority", value: "urgent" },
        { type: "label", value: "x" },
        { type: "label", value: "y" },
        { type: "assign", value: "a" },
      ],
    };
    const p = expandMacro(macro);
    expect(p.reply).toBe("hi");
    expect(p.status).toBe("resolved");
    expect(p.priority).toBe("urgent");
    expect(p.labels).toEqual(["x", "y"]);
    expect(p.assigneeId).toBe("a");
  });
});

describe("renderCanned", () => {
  it("{{değişken}} ikame eder, bilinmeyeni korur", () => {
    expect(renderCanned("Merhaba {{name}}, {{plan}} {{x}}", { name: "Jo", plan: "Pro" })).toBe("Merhaba Jo, Pro {{x}}");
  });
});

describe("csatAverage", () => {
  it("puanlı konuşmaların ortalaması (2 ondalık)", () => {
    const convs = [{ csat: 5 }, { csat: 4 }, {}] as Conversation[];
    expect(csatAverage(convs)).toBe(4.5);
    expect(csatAverage([] as Conversation[])).toBe(0);
  });
});

describe("searchKb", () => {
  const articles: KbArticle[] = [
    { id: "a", title: "Fatura sorunu", body: "Orantısal hesaplama" },
    { id: "b", title: "Dışa aktarma", body: "500 hatası ve yeniden deneme" },
  ];
  it("boş sorguda tüm makaleleri döner", () => {
    expect(searchKb(articles, "")).toHaveLength(2);
    expect(searchKb(articles, "   ")).toHaveLength(2);
  });
  it("başlık veya gövdede büyük/küçük harf duyarsız eşleşir", () => {
    expect(searchKb(articles, "FATURA").map((a) => a.id)).toEqual(["a"]);
    expect(searchKb(articles, "500").map((a) => a.id)).toEqual(["b"]);
  });
  it("eşleşme yoksa boş döner", () => {
    expect(searchKb(articles, "xyz")).toHaveLength(0);
  });
});
