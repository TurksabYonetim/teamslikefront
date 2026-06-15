import { describe, expect, it } from "vitest";
import { docProgress, moveCard, runWorkflow, toggleBlock } from "./workspace.canvas";
import type { Block, Card, Workflow } from "./workspace.types";

describe("toggleBlock", () => {
  const blocks: Block[] = [
    { id: "b1", type: "todo", content: "a", checked: false },
    { id: "b2", type: "text", content: "t" },
  ];

  it("toggles a todo block's checked state", () => {
    expect(toggleBlock(blocks, "b1")[0].checked).toBe(true);
    expect(toggleBlock(toggleBlock(blocks, "b1"), "b1")[0].checked).toBe(false);
  });

  it("ignores non-todo blocks and unknown ids", () => {
    expect(toggleBlock(blocks, "b2")).toEqual(blocks);
    expect(toggleBlock(blocks, "nope")).toEqual(blocks);
  });

  it("does not mutate the input array", () => {
    const copy = JSON.parse(JSON.stringify(blocks));
    toggleBlock(blocks, "b1");
    expect(blocks).toEqual(copy);
  });
});

describe("moveCard", () => {
  const cards: Card[] = [
    { id: "c1", title: "A", columnId: "col_a" },
    { id: "c2", title: "B", columnId: "col_b" },
  ];

  it("moves the card to a new column", () => {
    expect(moveCard(cards, "c1", "col_b")[0].columnId).toBe("col_b");
  });

  it("leaves other cards untouched", () => {
    expect(moveCard(cards, "c1", "col_b")[1]).toEqual(cards[1]);
  });
});

describe("runWorkflow", () => {
  it("returns a done result per step with kind:value label", () => {
    const wf: Workflow = {
      id: "wf",
      name: "n",
      trigger: "message",
      steps: [
        { id: "s1", kind: "send_message", value: "hi" },
        { id: "s2", kind: "wait", value: "300" },
      ],
    };
    const log = runWorkflow(wf);
    expect(log).toHaveLength(2);
    expect(log[0]).toEqual({ id: "s1", label: "send_message: hi", status: "done" });
    expect(log.every((r) => r.status === "done")).toBe(true);
  });

  it("returns an empty log for a stepless workflow", () => {
    expect(runWorkflow({ id: "w", name: "n", trigger: "schedule", steps: [] })).toEqual([]);
  });
});

describe("docProgress", () => {
  it("computes done/total/pct across todo blocks", () => {
    const blocks: Block[] = [
      { id: "1", type: "heading", content: "h" },
      { id: "2", type: "todo", content: "a", checked: true },
      { id: "3", type: "todo", content: "b", checked: false },
      { id: "4", type: "todo", content: "c", checked: true },
    ];
    expect(docProgress(blocks)).toEqual({ done: 2, total: 3, pct: 67 });
  });

  it("returns 0% when there are no todos", () => {
    expect(docProgress([{ id: "1", type: "text", content: "x" }])).toEqual({ done: 0, total: 0, pct: 0 });
  });
});
