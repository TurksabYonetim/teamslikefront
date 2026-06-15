// web/src/features/webinar/webinarEvents.test.ts
import { describe, it, expect } from "vitest";
import { ticketsRemaining, isSoldOut, ticketRevenue, formatPrice, agendaByDay, agendaConflicts } from "./webinarEvents";
import type { AgendaItem, TicketTier } from "./webinar.types";

const tiers: TicketTier[] = [
  { id: "a", name: "A", currency: "USD", price: 100, quantity: 10, sold: 4 },
  { id: "b", name: "B", currency: "USD", price: 50, quantity: 2, sold: 2 },
  { id: "c", name: "C", currency: "EUR", price: 20, quantity: 5, sold: 1 },
];

describe("ticket helpers", () => {
  it("computes remaining + sold-out", () => {
    expect(ticketsRemaining(tiers[0])).toBe(6);
    expect(isSoldOut(tiers[1])).toBe(true);
  });
  it("computes revenue per currency", () => {
    expect(ticketRevenue(tiers)).toEqual({ USD: 100 * 4 + 50 * 2, EUR: 20 * 1 });
  });
  it("formats price with currency", () => {
    expect(formatPrice(149, "USD")).toContain("149");
  });
});

const agenda: AgendaItem[] = [
  { id: "1", day: "Day 1", track: "Main", start: "10:00", end: "11:00", title: "A" },
  { id: "2", day: "Day 1", track: "Main", start: "10:30", end: "11:30", title: "B" }, // çakışır
  { id: "3", day: "Day 1", track: "Main", start: "09:00", end: "09:45", title: "C" },
  { id: "4", day: "Day 2", track: "Main", start: "09:00", end: "10:00", title: "D" },
];

describe("agenda helpers", () => {
  it("groups by day, sorted by start", () => {
    const days = agendaByDay(agenda);
    expect(days.map((d) => d.day)).toEqual(["Day 1", "Day 2"]);
    expect(days[0].items.map((i) => i.id)).toEqual(["3", "1", "2"]);
  });
  it("detects overlapping same-track conflicts", () => {
    const clashes = agendaConflicts(agenda);
    expect(clashes.length).toBe(1);
    expect(clashes[0].map((i) => i.id).sort()).toEqual(["1", "2"]);
  });
});
