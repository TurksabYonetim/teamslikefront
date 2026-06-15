// web/src/features/appointments/appointments.data.ts
import type { AvailabilitySchedule, Booking, Desk, EventType, Reservation } from "./appointments.types";

const base = Date.now();
/** Bugün yyyy-mm-dd (yerel) — seed rezervasyonlar görünür varsayılan güne düşsün. */
const todayISO = new Date().toISOString().slice(0, 10);

/** Mock "current user" kimliği (auth store yok; frontend-only). */
export const ME_ID = "usr_1";

export const HOST_NAMES: Record<string, string> = {
  usr_1: "Sen",
  usr_2: "Aylin Demir",
  usr_3: "Devin Roy",
};

export const EVENT_TYPES: EventType[] = [
  {
    id: "et_intro", ownerId: "usr_1", slug: "intro-call", title: "Tanışma görüşmesi",
    durationMin: 30, bufferBefore: 0, bufferAfter: 10, minNoticeMin: 60,
    location: "aura_meet", assignment: "solo", hostIds: ["usr_1"],
  },
  {
    id: "et_strategy", workspaceId: "ws_core", ownerId: "usr_1", slug: "strategy-session", title: "Strateji oturumu",
    durationMin: 60, bufferBefore: 10, bufferAfter: 10, minNoticeMin: 240,
    location: "aura_meet", assignment: "roundrobin", hostIds: ["usr_1", "usr_2"],
  },
  {
    id: "et_growth", workspaceId: "ws_growth", ownerId: "usr_2", slug: "growth-sync", title: "Büyüme senkronu",
    durationMin: 20, bufferBefore: 0, bufferAfter: 5, minNoticeMin: 30,
    location: "phone", assignment: "solo", hostIds: ["usr_2"],
  },
];

/** Pzt–Cum 09:00–17:00 (dakika: 540–1020). */
export const SCHEDULES: AvailabilitySchedule[] = [
  {
    id: "av_default", ownerId: "usr_1", timezone: "Europe/Istanbul",
    rules: [1, 2, 3, 4, 5].map((weekday) => ({ weekday, startMin: 540, endMin: 1020 })),
    overrides: [{ date: "2026-01-01", available: false }],
  },
];

export const BOOKINGS: Booking[] = [
  {
    id: "bk1", eventTypeId: "et_intro", inviteeName: "Jordan Blake", inviteeEmail: "jordan@acme.com",
    startMs: base + 26 * 60 * 60 * 1000, endMs: base + 26 * 60 * 60 * 1000 + 30 * 60000,
    status: "confirmed", location: "aura_meet", hostId: "usr_1",
  },
  {
    id: "bk2", eventTypeId: "et_strategy", inviteeName: "Dana Wu", inviteeEmail: "dana@globex.io",
    startMs: base + 50 * 60 * 60 * 1000, endMs: base + 50 * 60 * 60 * 1000 + 60 * 60000,
    status: "confirmed", location: "aura_meet", hostId: "usr_2",
  },
];

export const DESKS: Desk[] = [
  { id: "dsk_a1", label: "Masa A1", zone: "3. Kat · Kuzey", kind: "desk", capacity: 1, amenities: ["çift-monitör", "dock", "pencere"] },
  { id: "dsk_a2", label: "Masa A2", zone: "3. Kat · Kuzey", kind: "desk", capacity: 1, amenities: ["dock"] },
  { id: "dsk_b1", label: "Masa B1", zone: "3. Kat · Güney", kind: "desk", capacity: 1, amenities: ["çift-monitör", "ayakta"] },
  { id: "dsk_b2", label: "Masa B2", zone: "3. Kat · Güney", kind: "desk", capacity: 1, amenities: [] },
  { id: "room_focus", label: "Odak Odası", zone: "3. Kat · Kuzey", kind: "room", capacity: 4, amenities: ["beyaz tahta", "ekran"] },
  { id: "room_board", label: "Yönetim Odası", zone: "5. Kat", kind: "room", capacity: 12, amenities: ["beyaz tahta", "ekran", "video"] },
];

export const RESERVATIONS: Reservation[] = [
  { id: "rsv1", deskId: "dsk_a1", userId: "usr_2", dateISO: todayISO, slot: "full", checkedIn: true },
  { id: "rsv2", deskId: "dsk_b1", userId: "usr_3", dateISO: todayISO, slot: "am", checkedIn: false },
  { id: "rsv3", deskId: "room_board", userId: "usr_2", dateISO: todayISO, slot: "pm", checkedIn: false },
];
