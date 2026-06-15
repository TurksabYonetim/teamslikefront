import { describe, it, expect } from "vitest";
import { runIntelCopilot } from "./intel.ai";
import type { Recap } from "./intel.types";

const recap: Recap = {
  tldr: "Launch is on track.",
  decisions: ["Go/no-go at 15:00", "Ship pending pricing page"],
  actions: [
    { id: "a1", text: "Finalize load-test report", ownerId: "u3" },
    { id: "a2", text: "Publish dark-mode tokens", ownerId: "u4" },
  ],
  nextSteps: ["Reconvene at 15:00"],
};

describe("runIntelCopilot", () => {
  it("summarize → headline is the tldr and lines include decisions", () => {
    const r = runIntelCopilot("summarize", recap);
    expect(r.kind).toBe("summarize");
    expect(r.headline).toBe("Launch is on track.");
    expect(r.lines).toEqual([
      "Launch is on track.",
      "Go/no-go at 15:00",
      "Ship pending pricing page",
    ]);
  });

  it("actions → lines are the action texts; headline is the first", () => {
    const r = runIntelCopilot("actions", recap);
    expect(r.kind).toBe("actions");
    expect(r.headline).toBe("Finalize load-test report");
    expect(r.lines).toEqual([
      "Finalize load-test report",
      "Publish dark-mode tokens",
    ]);
  });

  it("missing recap → empty result (no crash)", () => {
    const r = runIntelCopilot("summarize", undefined);
    expect(r.headline).toBe("");
    expect(r.lines).toEqual([]);
  });

  it("filters out blank lines", () => {
    const r = runIntelCopilot("summarize", { ...recap, tldr: "  ", decisions: ["X", ""] });
    expect(r.lines).toEqual(["X"]);
  });
});
