// web/src/features/appointments/reminders.ts
/** Booking hatırlatıcı kuralları + conflict tespiti. Saf + test edilebilir. */

/** Toplantı başlangıcından önce, verilen dakika offset'leri için hatırlatıcı
 *  zamanları (örn. [1440, 60] = 1 gün + 1 saat önce). Sıralı, yalnız start öncesi. */
export function reminderTimes(startMs: number, offsetsMin: number[]): number[] {
  return offsetsMin
    .map((m) => startMs - m * 60_000)
    .filter((t) => t < startMs)
    .sort((a, b) => a - b);
}

export interface ReminderSlot {
  startMs: number;
  durationMin: number;
}

/** [startMs, +duration) mevcut bir rezervasyonla örtüşüyor mu? */
export function hasConflict(existing: ReminderSlot[], startMs: number, durationMin: number): boolean {
  const end = startMs + durationMin * 60_000;
  return existing.some((b) => {
    const bEnd = b.startMs + b.durationMin * 60_000;
    return startMs < bEnd && b.startMs < end;
  });
}
