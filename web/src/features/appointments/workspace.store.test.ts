// web/src/features/appointments/workspace.store.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { workspaceStore } from "./workspace.store";

beforeEach(() => workspaceStore.getState().reset());

describe("workspaceStore", () => {
  it("setSlot + setDate", () => {
    workspaceStore.getState().setSlot("am");
    workspaceStore.getState().setDate("2030-02-02");
    expect(workspaceStore.getState().slot).toBe("am");
    expect(workspaceStore.getState().dateISO).toBe("2030-02-02");
  });

  it("reserve boş masayı rezerve eder", () => {
    workspaceStore.getState().setDate("2030-02-02");
    workspaceStore.getState().setSlot("full");
    const before = workspaceStore.getState().reservations.length;
    workspaceStore.getState().reserve("dsk_a2");
    expect(workspaceStore.getState().reservations.length).toBe(before + 1);
  });

  it("reserve çakışmada no-op", () => {
    workspaceStore.getState().setDate("2030-02-02");
    workspaceStore.getState().setSlot("full");
    workspaceStore.getState().reserve("dsk_a2");
    const count = workspaceStore.getState().reservations.length;
    workspaceStore.getState().reserve("dsk_a2"); // aynı masa+tarih+full → çakışır
    expect(workspaceStore.getState().reservations.length).toBe(count);
  });

  it("cancel + checkIn", () => {
    workspaceStore.getState().setDate("2030-02-02");
    workspaceStore.getState().reserve("dsk_a2");
    const r = workspaceStore.getState().reservations.at(-1)!;
    workspaceStore.getState().checkIn(r.id);
    expect(workspaceStore.getState().reservations.find((x) => x.id === r.id)?.checkedIn).toBe(true);
    workspaceStore.getState().cancel(r.id);
    expect(workspaceStore.getState().reservations.find((x) => x.id === r.id)).toBeUndefined();
  });
});
