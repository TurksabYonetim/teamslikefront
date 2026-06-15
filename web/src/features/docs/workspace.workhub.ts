import type { ApprovalRequest, FormDef, FormResponse, Shift } from "./workspace.types";

/**
 * Teams "apps" yüzeyleri için saf yardımcılar — Onaylar, Vardiyalar, Formlar.
 * Framework'siz → birim test edilebilir; backend aynısını hesaplardı.
 */

export interface ApprovalSummary {
  pending: number;
  approved: number;
  rejected: number;
}

/** Onayları duruma göre say. */
export function approvalSummary(requests: ApprovalRequest[]): ApprovalSummary {
  return {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };
}

/** Kullanıcının hafta boyunca planlanan toplam saati (2 ondalık). */
export function weeklyHours(shifts: Shift[], userId: string): number {
  const mins = shifts.filter((s) => s.userId === userId).reduce((n, s) => n + (s.endMin - s.startMin), 0);
  return Math.round((mins / 60) * 100) / 100;
}

/** İki vardiya aynı günde çakışır mı? */
export function shiftsOverlap(a: Shift, b: Shift): boolean {
  return a.day === b.day && a.startMin < b.endMin && b.startMin < a.endMin;
}

/** Kullanıcının çakışan (çift rezervasyon) vardiyası var mı? */
export function hasShiftConflict(shifts: Shift[], userId: string): boolean {
  const mine = shifts.filter((s) => s.userId === userId);
  for (let i = 0; i < mine.length; i++) {
    for (let j = i + 1; j < mine.length; j++) {
      if (shiftsOverlap(mine[i], mine[j])) return true;
    }
  }
  return false;
}

/** Üstlenilebilir açık (atanmamış) vardiyalar. */
export function openShifts(shifts: Shift[]): Shift[] {
  return shifts.filter((s) => s.open || s.userId === "");
}

/** Form yanıtlarını say → optionId → adet (her seçenek 0 ile dolu). */
export function tallyResponses(form: FormDef, responses: FormResponse[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const o of form.options) counts[o.id] = 0;
  for (const r of responses) {
    if (r.formId === form.id && counts[r.optionId] !== undefined) counts[r.optionId]++;
  }
  return counts;
}

/* ───────────── Doc collab (yorumlar) ───────────── */

export function commentsForDoc<T extends { docId: string }>(comments: T[], docId: string): T[] {
  return comments.filter((c) => c.docId === docId);
}

export function openComments<T extends { docId: string; resolved?: boolean }>(comments: T[], docId: string): T[] {
  return commentsForDoc(comments, docId).filter((c) => !c.resolved);
}
