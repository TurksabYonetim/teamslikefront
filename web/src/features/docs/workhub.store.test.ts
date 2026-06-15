import { beforeEach, describe, expect, it } from "vitest";
import { workhubStore, WORKHUB_SELF_ID } from "./workhub.store";

beforeEach(() => workhubStore.getState().reset());

describe("workhubStore", () => {
  it("requestApproval prepends a pending request", () => {
    const before = workhubStore.getState().approvals.length;
    workhubStore.getState().requestApproval("New thing");
    expect(workhubStore.getState().approvals).toHaveLength(before + 1);
    expect(workhubStore.getState().approvals[0]).toMatchObject({ title: "New thing", status: "pending" });
  });

  it("decideApproval sets the status", () => {
    const id = workhubStore.getState().approvals[0].id;
    workhubStore.getState().decideApproval(id, "approved");
    expect(workhubStore.getState().approvals.find((a) => a.id === id)!.status).toBe("approved");
  });

  it("claimShift assigns the open shift to the current user and closes it", () => {
    const open = workhubStore.getState().shifts.find((s) => s.open)!;
    workhubStore.getState().claimShift(open.id);
    const after = workhubStore.getState().shifts.find((s) => s.id === open.id)!;
    expect(after.userId).toBe(WORKHUB_SELF_ID);
    expect(after.open).toBe(false);
  });

  it("respondForm appends a response for the current user", () => {
    const form = workhubStore.getState().forms[0];
    const before = workhubStore.getState().responses.length;
    workhubStore.getState().respondForm(form.id, form.options[0].id);
    expect(workhubStore.getState().responses).toHaveLength(before + 1);
    expect(workhubStore.getState().responses.at(-1)).toMatchObject({ formId: form.id, optionId: form.options[0].id, responderId: WORKHUB_SELF_ID });
  });
});
