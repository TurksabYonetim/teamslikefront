import { describe, it, expect } from "vitest";
import {
  pickAgent,
  pickAgentBySkill,
  isWithinHours,
  ivrResolve,
  monitorAudio,
  canActOnBehalf,
  oldestWaiting,
  estimatedWaitSec,
  nextHuntMember,
} from "./pbx";
import type { BusinessHours, CallQueue, HuntGroup, IVRMenu } from "./phone.types";

const queue = (over: Partial<CallQueue> = {}): CallQueue => ({
  id: "q1",
  name: "Sales",
  lineId: "l1",
  strategy: "round_robin",
  maxWaitSec: 300,
  overflowAction: "voicemail",
  waiting: [],
  agents: [
    { id: "a1", name: "A", idleSec: 10, available: true, weight: 1, skills: ["en"] },
    { id: "a2", name: "B", idleSec: 90, available: true, weight: 5, skills: ["tr"] },
    { id: "a3", name: "C", idleSec: 5, available: false, weight: 9, skills: ["tr"] },
  ],
  ...over,
});

describe("pickAgent", () => {
  it("longest_idle picks the most idle available agent", () => {
    expect(pickAgent(queue({ strategy: "longest_idle" }))?.id).toBe("a2");
  });
  it("weighted picks the highest-weight available agent", () => {
    expect(pickAgent(queue({ strategy: "weighted" }))?.id).toBe("a2");
  });
  it("round_robin advances past the cursor and skips unavailable", () => {
    expect(pickAgent(queue({ strategy: "round_robin" }), 0)?.id).toBe("a2");
  });
  it("simultaneous picks the first available in order", () => {
    expect(pickAgent(queue({ strategy: "simultaneous" }))?.id).toBe("a1");
  });
  it("returns null when no agent is available", () => {
    expect(pickAgent(queue({ agents: [{ id: "x", name: "X", idleSec: 1, available: false }] }))).toBeNull();
  });
});

describe("pickAgentBySkill", () => {
  it("restricts to agents holding the skill", () => {
    expect(pickAgentBySkill(queue({ strategy: "longest_idle" }), "tr")?.id).toBe("a2");
  });
  it("returns null when no skilled agent exists", () => {
    expect(pickAgentBySkill(queue(), "de")).toBeNull();
  });
});

describe("isWithinHours", () => {
  const hours: BusinessHours = {
    id: "h1",
    name: "Mesai",
    timezone: "UTC",
    weekly: [{ day: 1, openMin: 9 * 60, closeMin: 17 * 60 }], // Pazartesi 09:00-17:00
    holidays: ["2026-06-08"],
  };
  it("true inside the weekly window", () => {
    expect(isWithinHours(hours, new Date(2026, 5, 1, 10, 0))).toBe(true); // Pzt
  });
  it("false outside the window", () => {
    expect(isWithinHours(hours, new Date(2026, 5, 1, 18, 0))).toBe(false);
  });
  it("false on a holiday", () => {
    expect(isWithinHours(hours, new Date(2026, 5, 8, 10, 0))).toBe(false);
  });
  it("false on a day with no window", () => {
    expect(isWithinHours(hours, new Date(2026, 5, 2, 10, 0))).toBe(false); // Salı
  });
});

describe("ivrResolve", () => {
  const menus: IVRMenu[] = [
    { id: "m1", name: "Main", greeting: "hi", options: [
      { key: "1", label: "Sales", action: "queue", target: "q1" },
      { key: "2", label: "Submenu", action: "menu", target: "m2" },
    ] },
    { id: "m2", name: "Sub", greeting: "sub", options: [] },
  ];
  it("returns the matched option", () => {
    expect(ivrResolve(menus, "m1", "1").option?.target).toBe("q1");
  });
  it("drills into a submenu", () => {
    expect(ivrResolve(menus, "m1", "2").nextMenu?.id).toBe("m2");
  });
  it("returns empty when no option matches", () => {
    expect(ivrResolve(menus, "m1", "9")).toEqual({});
  });
  it("returns the option with an undefined nextMenu when the menu target does not exist", () => {
    const menus: IVRMenu[] = [
      { id: "m1", name: "Main", greeting: "hi", options: [{ key: "1", label: "Bad", action: "menu", target: "ghost" }] },
    ];
    const res = ivrResolve(menus, "m1", "1");
    expect(res.option?.target).toBe("ghost");
    expect(res.nextMenu).toBeUndefined();
  });
});

describe("monitorAudio", () => {
  it("listen: supervisor hears, nobody hears supervisor", () => {
    expect(monitorAudio("listen")).toMatchObject({ agentHearsSupervisor: false, customerHearsSupervisor: false });
  });
  it("barge: everyone hears the supervisor", () => {
    expect(monitorAudio("barge")).toMatchObject({ agentHearsSupervisor: true, customerHearsSupervisor: true });
  });
  it("takeover: agent dropped", () => {
    expect(monitorAudio("takeover").agentConnected).toBe(false);
  });
  it("whisper: agent hears the supervisor but the customer does not", () => {
    expect(monitorAudio("whisper")).toMatchObject({ agentHearsSupervisor: true, customerHearsSupervisor: false });
  });
});

describe("canActOnBehalf", () => {
  it("checks the matching permission", () => {
    const d = { id: "d1", name: "PA", canAnswer: true, canPlaceOnBehalf: false };
    expect(canActOnBehalf(d, "answer")).toBe(true);
    expect(canActOnBehalf(d, "place")).toBe(false);
  });
});

describe("oldestWaiting", () => {
  it("returns the earliest enqueued caller", () => {
    const q = queue({ waiting: [
      { id: "w1", from: "+1", since: 200 },
      { id: "w2", from: "+2", since: 100 },
    ] });
    expect(oldestWaiting(q)?.id).toBe("w2");
  });
  it("returns null when empty", () => {
    expect(oldestWaiting(queue())).toBeNull();
  });
});

describe("estimatedWaitSec", () => {
  it("divides callers-ahead by available agents", () => {
    const q = queue({ waiting: [
      { id: "w1", from: "+1", since: 1 },
      { id: "w2", from: "+2", since: 2 },
    ] });
    expect(estimatedWaitSec(q, 180)).toBe(180); // 2 ahead × 180 / 2 available
  });
  it("ignores callback-requested callers", () => {
    const q = queue({ waiting: [
      { id: "w1", from: "+1", since: 1, callbackRequested: true },
      { id: "w2", from: "+2", since: 2 },
    ] });
    expect(estimatedWaitSec(q, 180)).toBe(90); // 1 ahead × 180 / 2
  });
  it("returns ahead × avg when no agent is available (avoids divide-by-zero)", () => {
    const q = queue({
      agents: [],
      waiting: [
        { id: "w1", from: "+1", since: 1 },
        { id: "w2", from: "+2", since: 2 },
        { id: "w3", from: "+3", since: 3 },
      ],
    });
    expect(estimatedWaitSec(q, 180)).toBe(540); // 3 ahead × 180, no division
  });
});

describe("nextHuntMember", () => {
  const group: HuntGroup = {
    id: "g1",
    name: "Support",
    ring: "sequential",
    members: [
      { id: "m1", name: "A", available: false },
      { id: "m2", name: "B", available: true },
    ],
  };
  it("sequential skips unavailable from the cursor", () => {
    expect(nextHuntMember(group, 0)?.id).toBe("m2");
  });
  it("all picks the first available", () => {
    expect(nextHuntMember({ ...group, ring: "all" })?.id).toBe("m2");
  });
});
