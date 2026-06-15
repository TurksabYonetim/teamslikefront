// web/src/features/appointments/appointments.api.ts
import { inActiveWorkspace } from "@/lib/tenantStore";
import { BOOKINGS, EVENT_TYPES, SCHEDULES } from "./appointments.data";
import { generateSlots } from "./slots";
import type { Booking, EventType, Slot } from "./appointments.types";

/**
 * Frontend-only mock API. İmza, backend geldiğinde değiştirilmeden swap
 * edilebilecek şekilde async + gerçekçi gecikmelidir (~120ms). Veri kaynağı
 * `appointments.data` seed'i + saf `slots` helper'larıdır; store ile bağımsız
 * çalışır (UI prefetch / önizleme bu katmanı kullanabilir).
 */

const LATENCY_MS = 120;
let seq = 0;

/** Promise'i ~120ms geciktirir (snapshot kopyası döndürerek mutasyondan korur). */
function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

export interface CreateBookingInput {
  eventTypeId: string;
  inviteeName: string;
  inviteeEmail: string;
  startMs: number;
}

export const appointmentsApi = {
  /** Etkinlik türleri; `workspaceId` verilirse aktif alana göre süzülür. */
  fetchEventTypes: (workspaceId: string | null = null): Promise<EventType[]> => {
    const rows = EVENT_TYPES.filter((e) => inActiveWorkspace(e.workspaceId, workspaceId)).map((e) => ({
      ...e,
      hostIds: [...e.hostIds],
    }));
    return delay(rows);
  },

  /** Bir etkinlik türü + tarih için rezerve edilebilir slotlar (çakışma süzülmüş). */
  fetchSlots: (eventTypeId: string, dateISO: string): Promise<Slot[]> => {
    const et = EVENT_TYPES.find((e) => e.id === eventTypeId);
    if (!et) return delay<Slot[]>([]);
    const schedule = SCHEDULES.find((s) => s.ownerId === et.ownerId) ?? SCHEDULES[0];
    if (!schedule) return delay<Slot[]>([]);
    const slots = generateSlots(schedule, et, dateISO);
    const taken = BOOKINGS.filter((b) => b.eventTypeId === eventTypeId && b.status !== "cancelled");
    const free = slots.filter((s) => !taken.some((b) => s.startMs < b.endMs && s.endMs > b.startMs));
    return delay(free);
  },

  /** Rezervasyon talebi → `pending` booking (sunucu onayı ayrı olayla gelir). */
  createBooking: (input: CreateBookingInput): Promise<Booking> => {
    const et = EVENT_TYPES.find((e) => e.id === input.eventTypeId);
    const durationMin = et?.durationMin ?? 30;
    const booking: Booking = {
      id: `bk_api_${Date.now()}_${seq++}`,
      eventTypeId: input.eventTypeId,
      inviteeName: input.inviteeName,
      inviteeEmail: input.inviteeEmail,
      startMs: input.startMs,
      endMs: input.startMs + durationMin * 60_000,
      status: "pending",
      location: et?.location ?? "aura_meet",
      hostId: et?.hostIds[0],
    };
    return delay(booking);
  },

  /** Mevcut bir rezervasyonu kısmen günceller (durum/zaman). */
  patchBooking: (id: string, patch: Partial<Booking>): Promise<Booking> => {
    const current = BOOKINGS.find((b) => b.id === id);
    const merged: Booking = {
      ...(current ?? {
        id,
        eventTypeId: "",
        inviteeName: "",
        inviteeEmail: "",
        startMs: Date.now(),
        endMs: Date.now(),
        status: "pending",
        location: "aura_meet",
      }),
      ...patch,
      id,
    };
    return delay(merged);
  },
};
