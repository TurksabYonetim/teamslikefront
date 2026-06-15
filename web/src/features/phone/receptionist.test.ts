import { describe, it, expect } from "vitest";
import {
  matchIntent,
  receptionistGreeting,
  resolveAction,
  captureComplete,
  receptionistReply,
} from "./receptionist";
import type { ReceptionistConfig, ReceptionistIntent } from "./phone.types";

const intents: ReceptionistIntent[] = [
  { id: "sales", label: "Sales", phrases: ["buy", "pricing plan"], action: "route_queue", target: "q1" },
  { id: "support", label: "Support", phrases: ["broken", "help"], action: "human" },
  { id: "hours", label: "Hours", phrases: ["open hours"], action: "answer_faq", answer: "9 to 5." },
];

const config: ReceptionistConfig = {
  id: "r1",
  enabled: true,
  greeting: "Welcome!",
  afterHoursGreeting: "We are closed.",
  hoursId: "h1",
  intents,
  captureFields: ["name", "phone"],
  fallback: "voicemail",
  smsFollowUp: true,
};

describe("matchIntent", () => {
  it("matches when all phrase tokens appear", () => {
    expect(matchIntent("I want a pricing plan today", intents)?.id).toBe("sales");
  });
  it("prefers the longer matching phrase", () => {
    expect(matchIntent("what are your open hours", intents)?.id).toBe("hours");
  });
  it("returns null when nothing overlaps", () => {
    expect(matchIntent("totally unrelated", intents)).toBeNull();
  });

  it("prefers the intent whose matching phrase has more tokens (competitive scoring)", () => {
    const competing: ReceptionistIntent[] = [
      { id: "help", label: "Help", phrases: ["help"], action: "human" },
      { id: "helpdesk", label: "Help desk", phrases: ["help desk"], action: "route_queue", target: "q1" },
    ];
    expect(matchIntent("I need the help desk please", competing)?.id).toBe("helpdesk");
  });

  it("resolves a score tie to the earliest intent", () => {
    const tied: ReceptionistIntent[] = [
      { id: "first", label: "First", phrases: ["help"], action: "human" },
      { id: "second", label: "Second", phrases: ["help"], action: "human" },
    ];
    expect(matchIntent("help me", tied)?.id).toBe("first");
  });
});

describe("receptionistGreeting", () => {
  it("uses the open greeting within hours", () => {
    expect(receptionistGreeting(config, true)).toBe("Welcome!");
  });
  it("uses the after-hours greeting otherwise", () => {
    expect(receptionistGreeting(config, false)).toBe("We are closed.");
  });
});

describe("resolveAction", () => {
  it("uses the intent action", () => {
    expect(resolveAction(config, intents[1])).toBe("human");
  });
  it("falls back when no intent", () => {
    expect(resolveAction(config, null)).toBe("voicemail");
  });
});

describe("captureComplete", () => {
  it("true when all required fields present", () => {
    expect(captureComplete(["name", "phone"], { name: "A", phone: "1" })).toBe(true);
  });
  it("false when a required field is blank", () => {
    expect(captureComplete(["name", "phone"], { name: "A", phone: "  " })).toBe(false);
  });

  it("false when a required field key is entirely absent", () => {
    expect(captureComplete(["name", "phone"], { name: "A" })).toBe(false);
  });
});

describe("receptionistReply", () => {
  it("returns the FAQ answer for answer_faq", () => {
    expect(receptionistReply(intents[2], "answer_faq")).toBe("9 to 5.");
  });
  it("returns a confirmation line for routing", () => {
    expect(receptionistReply(intents[0], "route_queue")).toMatch(/team/i);
  });

  it("returns the generic FAQ line when there is no intent", () => {
    expect(receptionistReply(null, "answer_faq")).toBe("Here's what I can share on that.");
  });
});
