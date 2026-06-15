// web/src/features/appointments/ics.test.ts
import { describe, it, expect } from "vitest";
import { buildIcs } from "./ics";

describe("buildIcs", () => {
  it("VEVENT + DTSTART + SUMMARY içerir", () => {
    const ics = buildIcs({ start: Date.UTC(2030, 0, 1, 9, 0, 0), durationMin: 30, title: "Tanışma" });
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART:20300101T090000Z");
    expect(ics).toContain("SUMMARY:Tanışma");
    expect(ics).toContain("END:VCALENDAR");
  });
  it("attendee verilince ATTENDEE satırı ekler; özel karakter kaçışı", () => {
    const ics = buildIcs({ start: 0, durationMin: 15, title: "a, b", attendeeEmail: "x@y.co" });
    expect(ics).toContain("ATTENDEE;CN=x@y.co:mailto:x@y.co");
    expect(ics).toContain("SUMMARY:a\\, b");
  });
});
