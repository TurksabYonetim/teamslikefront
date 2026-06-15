// web/src/features/appointments/appointments.workspace.ts
import type { Desk, Reservation, DeskSlot } from "./appointments.types";

/** Workspace-reservation (Zoom Spaces parity) helper'ları. Gün granülaritesi,
 *  AM/PM/full-day slot'lar. Framework'süz → birim test edilebilir. */

/** Aynı masa+tarihte iki gün-slotu çakışıyor mu? `full` her iki yarımı kapsar. */
export function slotsOverlap(a: DeskSlot, b: DeskSlot): boolean {
  if (a === "full" || b === "full") return true;
  return a === b;
}

/** Masa `dateISO`+`slot` için boş mu? */
export function isDeskFree(reservations: Reservation[], deskId: string, dateISO: string, slot: DeskSlot): boolean {
  return !reservations.some((r) => r.deskId === deskId && r.dateISO === dateISO && slotsOverlap(r.slot, slot));
}

export interface DeskAvailability extends Desk {
  free: boolean;
  takenBy?: Reservation;
}

/** Her masayı istenen tarih+slot için müsaitlikle işaretle. */
export function deskAvailability(desks: Desk[], reservations: Reservation[], dateISO: string, slot: DeskSlot): DeskAvailability[] {
  return desks.map((d) => {
    const takenBy = reservations.find((r) => r.deskId === d.id && r.dateISO === dateISO && slotsOverlap(r.slot, slot));
    return { ...d, free: !takenBy, takenBy };
  });
}

function slotWeight(slot: DeskSlot): number {
  return slot === "full" ? 2 : 1;
}

/** Bir gün için doluluk = rezerve yarım-slot / toplam (masa×2). [0,1] aralığı. */
export function occupancyRate(desks: Desk[], reservations: Reservation[], dateISO: string): number {
  const total = desks.length * 2;
  if (total === 0) return 0;
  const deskIds = new Set(desks.map((d) => d.id));
  const reserved = reservations
    .filter((r) => r.dateISO === dateISO && deskIds.has(r.deskId))
    .reduce((sum, r) => sum + slotWeight(r.slot), 0);
  return Math.min(1, reserved / total);
}
