// web/src/features/appointments/appointments.types.ts
/**
 * Scheduling & Workspace bounded context. Cal.com/Calendly tarzı: slot'lar
 * müsaitlik + buffer + min-notice'tan hesaplanır. Frontend-only mock; tipler
 * WS sözleşmesini de modeller (`SchedulingEvent`).
 */

export type AssignmentMode = "solo" | "roundrobin" | "collective";
export type MeetingLocation = "aura_meet" | "phone" | "in_person";

export interface EventType {
  id: string;
  workspaceId?: string;
  ownerId: string;
  slug: string;
  title: string;
  durationMin: number;
  bufferBefore: number;
  bufferAfter: number;
  minNoticeMin: number;
  location: MeetingLocation;
  assignment: AssignmentMode;
  hostIds: string[];
}

/** Haftalık müsaitlik kuralı (yerel gece yarısından dakika). */
export interface HoursRule {
  weekday: number; // 0=Pazar(Sun) … 6=Cumartesi(Sat) — JS Date.getDay() ile aynı
  startMin: number;
  endMin: number;
}

/** Tarihe özel istisna (tatil / ek saat). */
export interface DateOverride {
  date: string; // yyyy-mm-dd
  available: boolean;
  startMin?: number;
  endMin?: number;
}

export interface AvailabilitySchedule {
  id: string;
  ownerId: string;
  timezone: string;
  rules: HoursRule[];
  overrides: DateOverride[];
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "rescheduled";

export interface Booking {
  id: string;
  eventTypeId: string;
  inviteeName: string;
  inviteeEmail: string;
  startMs: number;
  endMs: number;
  status: BookingStatus;
  location: MeetingLocation;
  hostId?: string;
  meetingId?: string;
}

export interface Reminder {
  id: string;
  bookingId: string;
  channel: "email" | "sms" | "push";
  offsetMin: number;
}

/** Üretilen (kalıcı olmayan) rezerve edilebilir zaman penceresi. */
export interface Slot {
  startMs: number;
  endMs: number;
}

export type SchedulingEvent =
  | { type: "booking.requested"; booking: Booking }
  | { type: "booking.confirmed"; bookingId: string }
  | { type: "booking.cancelled"; bookingId: string }
  | { type: "booking.rescheduled"; bookingId: string; startMs: number; endMs: number }
  | { type: "reminder.scheduled"; reminder: Reminder }
  | { type: "slot.held"; eventTypeId: string; startMs: number };

/* ───────────── Workspace reservation (Zoom Spaces parity) ───────────── */

export type DeskKind = "desk" | "room";
export type DeskSlot = "am" | "pm" | "full";

export interface Desk {
  id: string;
  label: string;
  zone: string;
  kind: DeskKind;
  capacity: number;
  amenities: string[];
}

export interface Reservation {
  id: string;
  deskId: string;
  userId: string;
  dateISO: string; // yyyy-mm-dd
  slot: DeskSlot;
  checkedIn: boolean;
}
