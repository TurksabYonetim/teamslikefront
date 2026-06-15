// web/src/features/appointments/appointments.store.ts
import { createStore } from "@/lib/createStore";
import { BOOKINGS, EVENT_TYPES, ME_ID, SCHEDULES } from "./appointments.data";
import { pickRoundRobin, rescheduleBooking } from "./slots";
import type { AvailabilitySchedule, Booking, EventType, SchedulingEvent } from "./appointments.types";

let seq = 0;
const bid = () => `bk_${Date.now()}_${seq++}`;
const etid = () => `et_${Date.now()}_${seq++}`;
// Seed'i derin kopyala: nested array'ler (hostIds/rules/overrides) modül sabitine
// aliased kalmasın — aksi halde UI in-place mutasyonu seed'i bozar (reset sızar).
const cloneEventTypes = (): EventType[] => EVENT_TYPES.map((e) => ({ ...e, hostIds: [...e.hostIds] }));
const cloneSchedules = (): AvailabilitySchedule[] =>
  SCHEDULES.map((s) => ({ ...s, rules: s.rules.map((r) => ({ ...r })), overrides: s.overrides.map((o) => ({ ...o })) }));
const cloneBookings = (): Booking[] => BOOKINGS.map((b) => ({ ...b }));
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "event";

const DEFAULT_ET = EVENT_TYPES[0].id;

interface SchedState {
  eventTypes: EventType[];
  schedules: AvailabilitySchedule[];
  bookings: Booking[];
  activeEventTypeId: string;
  rrIndex: number;

  setActiveEventType: (id: string) => void;
  addEventType: (partial: { title: string; durationMin: number }) => void;
  updateEventType: (id: string, patch: Partial<EventType>) => void;
  removeEventType: (id: string) => void;
  updateSchedule: (id: string, patch: Partial<AvailabilitySchedule>) => void;
  book: (eventTypeId: string, name: string, email: string, startMs: number) => void;
  cancel: (bookingId: string) => void;
  reschedule: (bookingId: string, newStartMs: number) => void;
  /** WS/event-bus köprüsü: booking.requested/confirmed/cancelled/rescheduled. */
  applyEvent: (event: SchedulingEvent) => void;
  reset: () => void;
}

export const appointmentsStore = createStore<SchedState>((set) => ({
  eventTypes: cloneEventTypes(),
  schedules: cloneSchedules(),
  bookings: cloneBookings(),
  activeEventTypeId: DEFAULT_ET,
  rrIndex: -1,

  setActiveEventType: (id) => set({ activeEventTypeId: id }),

  addEventType: ({ title, durationMin }) =>
    set((s) => ({
      eventTypes: [
        ...s.eventTypes,
        {
          id: etid(), ownerId: ME_ID, slug: slugify(title), title, durationMin,
          bufferBefore: 0, bufferAfter: 0, minNoticeMin: 0, location: "aura_meet",
          assignment: "solo", hostIds: [ME_ID],
        },
      ],
    })),
  updateEventType: (id, patch) =>
    set((s) => ({ eventTypes: s.eventTypes.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
  removeEventType: (id) =>
    set((s) => {
      const eventTypes = s.eventTypes.filter((e) => e.id !== id);
      const activeEventTypeId = s.activeEventTypeId === id ? (eventTypes[0]?.id ?? "") : s.activeEventTypeId;
      return { eventTypes, activeEventTypeId };
    }),

  updateSchedule: (id, patch) =>
    set((s) => ({ schedules: s.schedules.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)) })),

  book: (eventTypeId, name, email, startMs) =>
    set((s) => {
      const et = s.eventTypes.find((e) => e.id === eventTypeId);
      if (!et) return {};
      let rrIndex = s.rrIndex;
      let hostId = et.hostIds[0];
      if (et.assignment === "roundrobin" && et.hostIds.length > 0) {
        hostId = pickRoundRobin(et.hostIds, rrIndex);
        rrIndex = (rrIndex + 1) % et.hostIds.length;
      }
      const booking: Booking = {
        id: bid(), eventTypeId, inviteeName: name, inviteeEmail: email,
        startMs, endMs: startMs + et.durationMin * 60_000, status: "confirmed",
        location: et.location, hostId,
      };
      return { bookings: [...s.bookings, booking], rrIndex };
    }),

  cancel: (bookingId) =>
    set((s) => ({ bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b)) })),

  reschedule: (bookingId, newStartMs) =>
    set((s) => ({
      bookings: s.bookings.map((b) => {
        if (b.id !== bookingId) return b;
        const et = s.eventTypes.find((e) => e.id === b.eventTypeId);
        return rescheduleBooking(b, newStartMs, et?.durationMin ?? Math.round((b.endMs - b.startMs) / 60000));
      }),
    })),

  applyEvent: (event) =>
    set((s) => {
      switch (event.type) {
        case "booking.requested": {
          // Idempotency: aynı ID zaten varsa olayı yoksay (tekrar teslim güvenli).
          if (s.bookings.some((b) => b.id === event.booking.id)) return {};
          return { bookings: [...s.bookings, event.booking] };
        }
        case "booking.confirmed":
          return { bookings: s.bookings.map((b) => (b.id === event.bookingId ? { ...b, status: "confirmed" } : b)) };
        case "booking.cancelled":
          return { bookings: s.bookings.map((b) => (b.id === event.bookingId ? { ...b, status: "cancelled" } : b)) };
        case "booking.rescheduled":
          return {
            bookings: s.bookings.map((b) =>
              b.id === event.bookingId ? { ...b, startMs: event.startMs, endMs: event.endMs, status: "rescheduled" } : b,
            ),
          };
        default:
          // reminder.scheduled / slot.held → store durumunu etkilemez (no-op).
          return {};
      }
    }),

  reset: () =>
    set({ eventTypes: cloneEventTypes(), schedules: cloneSchedules(), bookings: cloneBookings(), activeEventTypeId: DEFAULT_ET, rrIndex: -1 }),
}));
