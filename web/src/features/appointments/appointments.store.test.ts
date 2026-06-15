// web/src/features/appointments/appointments.store.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { appointmentsStore } from "./appointments.store";
import type { Booking } from "./appointments.types";

beforeEach(() => appointmentsStore.getState().reset());

const mkBooking = (id: string, overrides: Partial<Booking> = {}): Booking => ({
  id,
  eventTypeId: "et_intro",
  inviteeName: "Trinity",
  inviteeEmail: "trinity@m.co",
  startMs: Date.now() + 20 * 60 * 60 * 1000,
  endMs: Date.now() + 20 * 60 * 60 * 1000 + 30 * 60000,
  status: "pending",
  location: "aura_meet",
  hostId: "usr_1",
  ...overrides,
});

describe("appointmentsStore", () => {
  it("setActiveEventType aktif event type'ı değiştirir", () => {
    appointmentsStore.getState().setActiveEventType("et_strategy");
    expect(appointmentsStore.getState().activeEventTypeId).toBe("et_strategy");
  });

  it("updateEventType alanları kalıcı günceller", () => {
    appointmentsStore.getState().updateEventType("et_intro", { durationMin: 45 });
    expect(appointmentsStore.getState().eventTypes.find((e) => e.id === "et_intro")?.durationMin).toBe(45);
  });

  it("addEventType + removeEventType", () => {
    const before = appointmentsStore.getState().eventTypes.length;
    appointmentsStore.getState().addEventType({ title: "Demo", durationMin: 15 });
    const after = appointmentsStore.getState().eventTypes;
    expect(after.length).toBe(before + 1);
    const id = after[after.length - 1].id;
    expect(after[after.length - 1].slug).toContain("demo");
    appointmentsStore.getState().removeEventType(id);
    expect(appointmentsStore.getState().eventTypes.length).toBe(before);
  });

  it("book onaylı rezervasyon oluşturur (solo → tek host)", () => {
    const start = Date.now() + 10 * 60 * 60 * 1000;
    const before = appointmentsStore.getState().bookings.length;
    appointmentsStore.getState().book("et_intro", "Neo", "neo@m.co", start);
    const b = appointmentsStore.getState().bookings;
    expect(b.length).toBe(before + 1);
    const last = b[b.length - 1];
    expect(last.status).toBe("confirmed");
    expect(last.endMs).toBe(start + 30 * 60000);
    expect(last.hostId).toBe("usr_1");
  });

  it("book roundrobin → host'lar arasında döner", () => {
    const start = Date.now() + 10 * 60 * 60 * 1000;
    appointmentsStore.getState().book("et_strategy", "A", "a@m.co", start);
    const h1 = appointmentsStore.getState().bookings.at(-1)!.hostId;
    appointmentsStore.getState().book("et_strategy", "B", "b@m.co", start + 3 * 60 * 60 * 1000);
    const h2 = appointmentsStore.getState().bookings.at(-1)!.hostId;
    expect(h1).not.toBe(h2);
  });

  it("cancel + reschedule", () => {
    appointmentsStore.getState().cancel("bk1");
    expect(appointmentsStore.getState().bookings.find((b) => b.id === "bk1")?.status).toBe("cancelled");
    const newStart = Date.now() + 100 * 60 * 60 * 1000;
    appointmentsStore.getState().reschedule("bk2", newStart);
    const b2 = appointmentsStore.getState().bookings.find((b) => b.id === "bk2")!;
    expect(b2.status).toBe("rescheduled");
    expect(b2.startMs).toBe(newStart);
  });

  it("updateSchedule timezone'u günceller", () => {
    appointmentsStore.getState().updateSchedule("av_default", { timezone: "UTC" });
    expect(appointmentsStore.getState().schedules.find((s) => s.id === "av_default")?.timezone).toBe("UTC");
  });

  describe("applyEvent (event-bus)", () => {
    it("booking.requested yeni rezervasyon ekler", () => {
      const before = appointmentsStore.getState().bookings.length;
      appointmentsStore.getState().applyEvent({ type: "booking.requested", booking: mkBooking("ev_1") });
      const b = appointmentsStore.getState().bookings;
      expect(b.length).toBe(before + 1);
      expect(b.at(-1)!.id).toBe("ev_1");
      expect(b.at(-1)!.status).toBe("pending");
    });

    it("booking.requested aynı ID için idempotent (atlar)", () => {
      appointmentsStore.getState().applyEvent({ type: "booking.requested", booking: mkBooking("dup") });
      const after1 = appointmentsStore.getState().bookings.length;
      appointmentsStore.getState().applyEvent({ type: "booking.requested", booking: mkBooking("dup", { inviteeName: "Other" }) });
      const b = appointmentsStore.getState().bookings;
      expect(b.length).toBe(after1); // ikinci kez eklenmedi
      expect(b.find((x) => x.id === "dup")!.inviteeName).toBe("Trinity"); // orijinal korunur
    });

    it("booking.confirmed durumu confirmed yapar", () => {
      appointmentsStore.getState().applyEvent({ type: "booking.requested", booking: mkBooking("c1") });
      appointmentsStore.getState().applyEvent({ type: "booking.confirmed", bookingId: "c1" });
      expect(appointmentsStore.getState().bookings.find((b) => b.id === "c1")!.status).toBe("confirmed");
    });

    it("booking.cancelled durumu cancelled yapar", () => {
      appointmentsStore.getState().applyEvent({ type: "booking.cancelled", bookingId: "bk1" });
      expect(appointmentsStore.getState().bookings.find((b) => b.id === "bk1")!.status).toBe("cancelled");
    });

    it("booking.rescheduled start/end + durum günceller", () => {
      const ns = Date.now() + 200 * 60 * 60 * 1000;
      appointmentsStore.getState().applyEvent({ type: "booking.rescheduled", bookingId: "bk2", startMs: ns, endMs: ns + 60 * 60000 });
      const b = appointmentsStore.getState().bookings.find((x) => x.id === "bk2")!;
      expect(b.startMs).toBe(ns);
      expect(b.endMs).toBe(ns + 60 * 60000);
      expect(b.status).toBe("rescheduled");
    });

    it("bilinmeyen bookingId'de no-op (çökmiyor)", () => {
      const snapshot = appointmentsStore.getState().bookings;
      appointmentsStore.getState().applyEvent({ type: "booking.confirmed", bookingId: "yok" });
      expect(appointmentsStore.getState().bookings).toEqual(snapshot);
    });
  });
});
