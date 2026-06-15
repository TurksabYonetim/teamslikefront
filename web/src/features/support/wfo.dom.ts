// web/src/features/support/wfo.dom.ts
/**
 * Saf WFO/WEM yardımcıları (vardiya, uyum, kalite skorlama).
 * Framework'süz → birim test edilebilir. Gerçek backend tam Erlang-C kullanır;
 * burada demoya uygun, şeffaf bir doluluk-tabanlı yaklaşım var.
 */
import type { ScorecardCriterion, StaffingInterval } from "./support.types";

/** Gereken temsilci ≈ ceil(hacim × AHT ÷ (aralık × hedef doluluk)). */
export function requiredAgents(volume: number, ahtSec: number, intervalSec: number, occupancy = 0.85): number {
  if (volume <= 0 || intervalSec <= 0 || occupancy <= 0) return 0;
  return Math.ceil((volume * ahtSec) / (intervalSec * occupancy));
}

/** Vardiyadaki − gereken (negatif = personel açığı). */
export function staffingGap(interval: StaffingInterval): number {
  return interval.scheduled - interval.required;
}

/** Uyum oranı 0..1 = programdaki dakika ÷ programlanan dakika (üst sınırlı). */
export function adherence(scheduledMin: number, adherentMin: number): number {
  if (scheduledMin <= 0) return 0;
  return Math.min(adherentMin, scheduledMin) / scheduledMin;
}

/** Ağırlıklı skorkart toplamı 0..100'e normalize (her kriter 0..5). */
export function scorecardTotal(scores: Record<string, number>, criteria: ScorecardCriterion[]): number {
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);
  if (totalWeight <= 0) return 0;
  const earned = criteria.reduce((s, c) => s + ((scores[c.id] ?? 0) / 5) * c.weight, 0);
  return Math.round((earned / totalWeight) * 100);
}

/** Vardiyadaki < gereken olan aralıklar — gün-içi kendini-iyileştirme adayları. */
export function understaffed(intervals: StaffingInterval[]): StaffingInterval[] {
  return intervals.filter((i) => staffingGap(i) < 0);
}

/** Tüm aralıkların ortalama hizmet seviyesi (0..1): planlı ÷ gereken, üst sınır 1. */
export function serviceLevel(intervals: StaffingInterval[]): number {
  if (intervals.length === 0) return 0;
  const sum = intervals.reduce((s, i) => s + (i.required <= 0 ? 1 : Math.min(1, i.scheduled / i.required)), 0);
  return Math.round((sum / intervals.length) * 100) / 100;
}
