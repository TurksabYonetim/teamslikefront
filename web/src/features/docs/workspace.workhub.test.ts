import { describe, expect, it } from "vitest";
import {
  approvalSummary,
  commentsForDoc,
  hasShiftConflict,
  openComments,
  openShifts,
  shiftsOverlap,
  tallyResponses,
  weeklyHours,
} from "./workspace.workhub";
import type { ApprovalRequest, DocComment, FormDef, FormResponse, Shift } from "./workspace.types";

describe("approvalSummary", () => {
  it("counts by status", () => {
    const reqs: ApprovalRequest[] = [
      { id: "1", title: "", requesterId: "", approverId: "", status: "pending", createdMin: 0 },
      { id: "2", title: "", requesterId: "", approverId: "", status: "approved", createdMin: 0 },
      { id: "3", title: "", requesterId: "", approverId: "", status: "pending", createdMin: 0 },
    ];
    expect(approvalSummary(reqs)).toEqual({ pending: 2, approved: 1, rejected: 0 });
  });
});

const shift = (over: Partial<Shift>): Shift => ({
  id: "s",
  userId: "u",
  userName: "U",
  day: 1,
  startMin: 540,
  endMin: 1020,
  role: "Support",
  ...over,
});

describe("shifts", () => {
  it("weeklyHours sums a user's minutes to hours (2 decimals)", () => {
    expect(weeklyHours([shift({ startMin: 540, endMin: 1020 }), shift({ userId: "x", startMin: 0, endMin: 600 })], "u")).toBe(8);
  });

  it("shiftsOverlap detects same-day overlap", () => {
    expect(shiftsOverlap(shift({ startMin: 540, endMin: 720 }), shift({ startMin: 700, endMin: 900 }))).toBe(true);
    expect(shiftsOverlap(shift({ day: 1 }), shift({ day: 2 }))).toBe(false);
  });

  it("hasShiftConflict finds double-booking", () => {
    expect(
      hasShiftConflict([shift({ id: "a", startMin: 540, endMin: 720 }), shift({ id: "b", startMin: 700, endMin: 900 })], "u"),
    ).toBe(true);
    expect(
      hasShiftConflict([shift({ id: "a", startMin: 540, endMin: 600 }), shift({ id: "b", startMin: 700, endMin: 900 })], "u"),
    ).toBe(false);
  });

  it("openShifts returns open or unassigned shifts", () => {
    const shifts = [shift({ id: "a" }), shift({ id: "b", userId: "", userName: "" }), shift({ id: "c", open: true })];
    expect(openShifts(shifts).map((s) => s.id)).toEqual(["b", "c"]);
  });
});

describe("tallyResponses", () => {
  it("counts responses per option, 0-filling all options", () => {
    const form: FormDef = {
      id: "f",
      title: "T",
      question: "Q",
      options: [
        { id: "o1", text: "A" },
        { id: "o2", text: "B" },
      ],
    };
    const responses: FormResponse[] = [
      { id: "1", formId: "f", optionId: "o1", responderId: "x" },
      { id: "2", formId: "f", optionId: "o1", responderId: "y" },
      { id: "3", formId: "other", optionId: "o2", responderId: "z" },
    ];
    expect(tallyResponses(form, responses)).toEqual({ o1: 2, o2: 0 });
  });
});

describe("doc comments", () => {
  const comments: DocComment[] = [
    { id: "1", docId: "d1", blockId: "b", authorId: "a", body: "x", atMin: 0 },
    { id: "2", docId: "d1", blockId: "b", authorId: "a", body: "y", atMin: 0, resolved: true },
    { id: "3", docId: "d2", blockId: "b", authorId: "a", body: "z", atMin: 0 },
  ];

  it("commentsForDoc filters by docId", () => {
    expect(commentsForDoc(comments, "d1").map((c) => c.id)).toEqual(["1", "2"]);
  });

  it("openComments excludes resolved", () => {
    expect(openComments(comments, "d1").map((c) => c.id)).toEqual(["1"]);
  });
});
