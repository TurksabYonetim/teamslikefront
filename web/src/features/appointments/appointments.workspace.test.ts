// web/src/features/appointments/appointments.workspace.test.ts
import { describe, it, expect } from "vitest";
import { slotsOverlap, isDeskFree, deskAvailability, occupancyRate } from "./appointments.workspace";
import type { Desk, Reservation } from "./appointments.types";

const desks: Desk[] = [
  { id: "d1", label: "D1", zone: "z", kind: "desk", capacity: 1, amenities: [] },
  { id: "d2", label: "D2", zone: "z", kind: "desk", capacity: 1, amenities: [] },
];
const res: Reservation[] = [
  { id: "r1", deskId: "d1", userId: "u", dateISO: "2030-01-01", slot: "full", checkedIn: false },
];

describe("slotsOverlap", () => {
  it("full her şeyle, am/pm yalnız kendisiyle çakışır", () => {
    expect(slotsOverlap("full", "am")).toBe(true);
    expect(slotsOverlap("am", "am")).toBe(true);
    expect(slotsOverlap("am", "pm")).toBe(false);
  });
});

describe("isDeskFree", () => {
  it("dolu masa için false, boş için true", () => {
    expect(isDeskFree(res, "d1", "2030-01-01", "am")).toBe(false);
    expect(isDeskFree(res, "d2", "2030-01-01", "am")).toBe(true);
    expect(isDeskFree(res, "d1", "2030-01-02", "am")).toBe(true);
  });
});

describe("deskAvailability", () => {
  it("her masayı free/takenBy ile işaretler", () => {
    const a = deskAvailability(desks, res, "2030-01-01", "full");
    expect(a.find((d) => d.id === "d1")?.free).toBe(false);
    expect(a.find((d) => d.id === "d1")?.takenBy?.id).toBe("r1");
    expect(a.find((d) => d.id === "d2")?.free).toBe(true);
  });
});

describe("occupancyRate", () => {
  it("rezerve yarım-slot / toplam (masa×2)", () => {
    // 2 masa × 2 = 4 yarım-slot; full = 2 → 0.5
    expect(occupancyRate(desks, res, "2030-01-01")).toBeCloseTo(0.5);
    expect(occupancyRate(desks, res, "2030-01-02")).toBe(0);
    expect(occupancyRate([], res, "2030-01-01")).toBe(0);
  });
});
