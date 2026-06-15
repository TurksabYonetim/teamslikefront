// web/src/features/webinar/webinar.dom.test.ts
import { describe, it, expect } from "vitest";
import {
  validateRegistration, simulivePosition, segmentAttendees, sortQna,
  eventStatus, registrationCapacity, nextApproval, admitFromWaitlist, approvalOf,
} from "./webinar.dom";
import type { AppEvent, QnaItem, RegField, Registration } from "./webinar.types";

const fields: RegField[] = [
  { id: "name", label: "Name", required: true, type: "text" },
  { id: "email", label: "Email", required: true, type: "email" },
];

describe("validateRegistration", () => {
  it("flags required-empty and bad email", () => {
    const res = validateRegistration(fields, { name: "", email: "nope" });
    expect(res.ok).toBe(false);
    expect(res.errors.name).toBe("required");
    expect(res.errors.email).toBe("email");
  });
  it("passes valid input", () => {
    expect(validateRegistration(fields, { name: "A", email: "a@b.co" }).ok).toBe(true);
  });
});

describe("simulivePosition", () => {
  it("clamps elapsed and computes pct", () => {
    const p = simulivePosition(1000, 1000 + 30_000, 60);
    expect(p.elapsedSec).toBe(30);
    expect(p.pct).toBe(50);
    expect(p.live).toBe(true);
  });
  it("is not live after duration", () => {
    expect(simulivePosition(0, 61_000, 60).live).toBe(false);
  });
});

describe("segmentAttendees", () => {
  it("computes show rate", () => {
    const regs = [
      { status: "attended" }, { status: "attended" }, { status: "no_show" },
    ] as Registration[];
    const seg = segmentAttendees(regs);
    expect(seg.registered).toBe(3);
    expect(seg.attended).toBe(2);
    expect(seg.noShow).toBe(1);
    expect(seg.showRate).toBeCloseTo(2 / 3);
  });
});

describe("sortQna", () => {
  it("sorts by upvotes desc then earlier tSec", () => {
    const items: QnaItem[] = [
      { id: "a", eventId: "e", authorId: "x", text: "", upvotes: ["1"], answered: false, tSec: 50 },
      { id: "b", eventId: "e", authorId: "x", text: "", upvotes: ["1", "2"], answered: false, tSec: 80 },
      { id: "c", eventId: "e", authorId: "x", text: "", upvotes: ["1"], answered: false, tSec: 10 },
    ];
    expect(sortQna(items).map((q) => q.id)).toEqual(["b", "c", "a"]);
  });
});

describe("approvalOf", () => {
  it("defaults to approved when approval is absent", () => {
    expect(approvalOf({ approval: undefined } as Registration)).toBe("approved");
  });
  it("returns the explicit approval value", () => {
    expect(approvalOf({ approval: "waitlisted" } as Registration)).toBe("waitlisted");
  });
});

describe("eventStatus", () => {
  it("classifies upcoming/live/ended", () => {
    // startsAt/now epoch ms, durationSec saniye → bitiş = startsAt + durationSec*1000
    expect(eventStatus(100_000, 10, 50_000)).toBe("upcoming"); // now < startsAt
    expect(eventStatus(0, 100, 50_000)).toBe("live"); // 50_000 < 100_000
    expect(eventStatus(0, 10, 50_000)).toBe("ended"); // 50_000 >= 10_000
  });
});

const townhall: AppEvent = {
  id: "ev_townhall", title: "TH", type: "townhall", startsAt: 0, durationSec: 10,
  capacity: 2, viewOnlyCapacity: 5, requireApproval: true,
  branding: { accent: "#000" }, registrationFields: [], sessions: [],
};

describe("registrationCapacity + approvals", () => {
  it("computes interactive/waitlist/pending tiers", () => {
    const regs: Registration[] = [
      { id: "1", eventId: "ev_townhall", values: {}, status: "registered", approval: "approved" },
      { id: "2", eventId: "ev_townhall", values: {}, status: "registered", approval: "approved" },
      { id: "3", eventId: "ev_townhall", values: {}, status: "registered", approval: "waitlisted" },
      { id: "4", eventId: "ev_townhall", values: {}, status: "registered", approval: "pending" },
    ];
    const cap = registrationCapacity(townhall, regs);
    expect(cap.interactive).toEqual({ used: 2, limit: 2, full: true });
    expect(cap.waitlisted).toBe(1);
    expect(cap.pending).toBe(1);
  });
  it("nextApproval = pending when approval required", () => {
    expect(nextApproval(townhall, [])).toBe("pending");
  });
  it("admitFromWaitlist returns oldest waitlisted", () => {
    const regs: Registration[] = [
      { id: "x", eventId: "e", values: {}, status: "registered", approval: "waitlisted" },
    ];
    expect(admitFromWaitlist(regs)?.id).toBe("x");
  });
});
