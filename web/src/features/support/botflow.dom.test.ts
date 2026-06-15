import { describe, it, expect } from "vitest";
import { nextNodeId, traverse, danglingTargets, unreachableNodes, flowStats, nodeById } from "./botflow.dom";
import type { BotFlow } from "./support.types";

const flow: BotFlow = {
  id: "f", name: "F", startId: "welcome",
  nodes: [
    { id: "welcome", kind: "message", text: "Merhaba", next: "intent" },
    {
      id: "intent", kind: "question", text: "Konu?",
      options: [
        { label: "Fatura", next: "cond" },
        { label: "Teknik", next: "tech" },
      ],
    },
    { id: "cond", kind: "condition", text: "VIP mi?", variable: "tier", equals: "vip", yes: "handoff", no: "collect" },
    { id: "collect", kind: "collect", text: "Bilgi", fields: [{ id: "order", label: "Sipariş" }], next: "end" },
    { id: "tech", kind: "message", text: "Yeniden başlat", next: "end" },
    { id: "end", kind: "end", text: "Bitti" },
    { id: "handoff", kind: "handoff", text: "Temsilciye" },
  ],
};

describe("nextNodeId", () => {
  it("message ve collect next'i izler", () => {
    expect(nextNodeId(flow.nodes[0])).toBe("intent");
    expect(nextNodeId(nodeById(flow, "collect")!)).toBe("end");
  });
  it("question seçilen seçeneğe dallanır", () => {
    expect(nextNodeId(nodeById(flow, "intent")!, { answer: "Teknik" })).toBe("tech");
    expect(nextNodeId(nodeById(flow, "intent")!, { answer: "Yok" })).toBeNull();
  });
  it("condition vars eşleşmesine göre yes/no döner", () => {
    const c = nodeById(flow, "cond")!;
    expect(nextNodeId(c, { vars: { tier: "vip" } })).toBe("handoff");
    expect(nextNodeId(c, { vars: { tier: "free" } })).toBe("collect");
  });
  it("handoff ve end terminaldir", () => {
    expect(nextNodeId(nodeById(flow, "handoff")!)).toBeNull();
    expect(nextNodeId(nodeById(flow, "end")!)).toBeNull();
  });
});

describe("traverse", () => {
  it("varsayılan yolu (seçeneksiz) dolaşır", () => {
    expect(traverse(flow)).toEqual(["welcome", "intent"]); // intent'te cevap yok → durur
  });
  it("cevap + vars ile uçtan uca dolaşır", () => {
    const path = traverse(flow, { intent: "Fatura" }, { tier: "free" });
    expect(path).toEqual(["welcome", "intent", "cond", "collect", "end"]);
  });
  it("döngüde sonsuza gitmez", () => {
    const loop: BotFlow = {
      id: "l", name: "L", startId: "a",
      nodes: [
        { id: "a", kind: "message", text: "a", next: "b" },
        { id: "b", kind: "message", text: "b", next: "a" },
      ],
    };
    expect(traverse(loop)).toEqual(["a", "b"]);
  });
});

describe("danglingTargets", () => {
  it("var olmayan hedefleri yakalar", () => {
    const bad: BotFlow = {
      id: "b", name: "B", startId: "x",
      nodes: [{ id: "x", kind: "message", text: "x", next: "ghost" }],
    };
    expect(danglingTargets(bad)).toEqual(["ghost"]);
  });
  it("temiz akışta boş döner", () => {
    expect(danglingTargets(flow)).toEqual([]);
  });
});

describe("unreachableNodes", () => {
  it("hiçbir kenarın işaret etmediği düğümü bulur", () => {
    const f: BotFlow = {
      id: "u", name: "U", startId: "a",
      nodes: [
        { id: "a", kind: "message", text: "a", next: "b" },
        { id: "b", kind: "end", text: "b" },
        { id: "orphan", kind: "message", text: "o" },
      ],
    };
    expect(unreachableNodes(f)).toEqual(["orphan"]);
  });
  it("start her zaman ulaşılabilir sayılır", () => {
    expect(unreachableNodes(flow)).toEqual([]);
  });
});

describe("flowStats", () => {
  it("türe göre sayar", () => {
    const s = flowStats(flow);
    expect(s.message).toBe(2);
    expect(s.question).toBe(1);
    expect(s.condition).toBe(1);
    expect(s.collect).toBe(1);
    expect(s.handoff).toBe(1);
    expect(s.end).toBe(1);
  });
});
