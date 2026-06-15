// web/src/features/appointments/slots.ts
import type { AvailabilitySchedule, Booking, EventType, Slot } from "./appointments.types";

/** Saf Scheduling helper'ları — framework'süz, birim test edilebilir. */

export function generateSlots(
  schedule: AvailabilitySchedule,
  eventType: EventType,
  dateISO: string,
  nowMs: number = Date.now(),
): Slot[] {
  const day = new Date(`${dateISO}T00:00:00`);
  const dayMs = day.getTime();
  const weekday = day.getDay();

  let startMin: number;
  let endMin: number;
  const override = schedule.overrides.find((o) => o.date === dateISO);
  if (override) {
    if (!override.available) return [];
    if (override.startMin != null && override.endMin != null) {
      startMin = override.startMin;
      endMin = override.endMin;
    } else {
      const rule = schedule.rules.find((r) => r.weekday === weekday);
      if (!rule) return [];
      startMin = rule.startMin;
      endMin = rule.endMin;
    }
  } else {
    const rule = schedule.rules.find((r) => r.weekday === weekday);
    if (!rule) return [];
    startMin = rule.startMin;
    endMin = rule.endMin;
  }

  // Math.max(1, …): durationMin=0 + tampon yoksa step=0 → sonsuz döngüyü önle.
  const step = Math.max(1, eventType.durationMin + eventType.bufferBefore + eventType.bufferAfter);
  const out: Slot[] = [];
  for (let s = startMin; s + eventType.durationMin <= endMin; s += step) {
    const startMs = dayMs + s * 60_000;
    if (startMs - nowMs >= eventType.minNoticeMin * 60_000) {
      out.push({ startMs, endMs: startMs + eventType.durationMin * 60_000 });
    }
  }
  return out;
}

/** Mevcut rezervasyonlara karşı örtüşme (bitişiklik çakışma DEĞİL). */
export function hasConflict(slot: Slot, bookings: { startMs: number; endMs: number }[]): boolean {
  return bookings.some((b) => slot.startMs < b.endMs && slot.endMs > b.startMs);
}

/** Round-robin host seçimi (sarmalar). */
export function pickRoundRobin(hostIds: string[], lastIndex: number): string {
  return hostIds[(lastIndex + 1) % hostIds.length];
}

/** Rezervasyonu yeni başlangıca taşı, end'i yeniden hesapla, rescheduled işaretle. */
export function rescheduleBooking(booking: Booking, newStartMs: number, durationMin: number): Booking {
  return { ...booking, startMs: newStartMs, endMs: newStartMs + durationMin * 60_000, status: "rescheduled" };
}

/** Tarayıcı timezone'u (UI'da override edilebilir). */
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
