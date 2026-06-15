/**
 * Intelligence — canlı koçluk fısıltısı yardımcıları (saf mantık).
 *
 * Canlı modda yeni bir koçluk cue'su geldiğinde yöneticiye (admin.access)
 * bir "fısıltı" toast'ı gösterilir. Cue türü toast varyantına eşlenir:
 *   - warning → "warning" (dikkat çekici amber tonu)
 *   - tip / praise → "default"
 * Toast altyapısı artık `warning` varyantını destekliyor (bkz. Toast.tsx).
 */
import type { CoachingCue } from "./intel.types";

export type CoachingToastVariant = "default" | "warning";

/** Cue türünü toast varyantına eşler (warning → amber tonu). */
export function coachingToastVariant(
  kind: CoachingCue["kind"],
): CoachingToastVariant {
  return kind === "warning" ? "warning" : "default";
}

/**
 * İki cue listesini (önceki/sonraki) karşılaştırıp YENİ eklenen cue'ları
 * (id'ye göre) döndürür. Toast yalnızca yeni cue'lar için tetiklenir;
 * yeniden render / aynı liste tekrar gönderilirse boş döner.
 */
export function newCoachingCues(
  prev: CoachingCue[],
  next: CoachingCue[],
): CoachingCue[] {
  const seen = new Set(prev.map((c) => c.id));
  return next.filter((c) => !seen.has(c.id));
}
