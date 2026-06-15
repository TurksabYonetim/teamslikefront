/** Admin modülü — client-side türetilmiş veri yardımcıları (grafik + CSV).
 *  Backend/API değişmez: tüm hesaplamalar mevcut audit log listesinden yapılır. */
import type { AuditLog } from "./admin.types";

/* ---- grafik veri türevleri -------------------------------------------- */

export interface ActionCount {
  action: string;
  count: number;
}

export interface DayCount {
  /** ISO tarih (YYYY-MM-DD). */
  date: string;
  count: number;
}

/** Aksiyona göre dağılım (azalan sıralı). Pie/bar için ortak kaynak. */
export function countByAction(logs: AuditLog[]): ActionCount[] {
  const map = new Map<string, number>();
  for (const l of logs) {
    const key = l.action || "—";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map, ([action, count]) => ({ action, count })).sort(
    (a, b) => b.count - a.count,
  );
}

/** Son `days` günün her biri için olay sayısı (boş günler 0 ile doldurulur). */
export function countByDay(logs: AuditLog[], days = 14): DayCount[] {
  const buckets = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Tüm günleri 0 ile seed et (en eskiden en yeniye).
  const order: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toDayKey(d);
    order.push(key);
    buckets.set(key, 0);
  }

  for (const l of logs) {
    if (!l.created_at) continue;
    const d = new Date(l.created_at);
    if (Number.isNaN(d.getTime())) continue;
    const key = toDayKey(d);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return order.map((date) => ({ date, count: buckets.get(date) ?? 0 }));
}

function toDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Gün anahtarını kısa etiket (DD.MM) olarak biçimlendirir. */
export function shortDayLabel(dayKey: string): string {
  const [, m, d] = dayKey.split("-");
  return `${d}.${m}`;
}

/* ---- CSV dışa aktarım -------------------------------------------------- */

function csvCell(value: string | null | undefined): string {
  const s = value ?? "";
  // Çift tırnak kaçışı + ayraç/yeni satır içeren hücreleri tırnakla.
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Audit loglarını UTF-8 BOM'lu CSV string'ine çevirir. */
export function auditLogsToCsv(logs: AuditLog[]): string {
  const header = ["id", "created_at", "action", "target", "actor_user_id", "ip"];
  const lines = [header.join(",")];
  for (const l of logs) {
    lines.push(
      [
        csvCell(l.id),
        csvCell(l.created_at),
        csvCell(l.action),
        csvCell(l.target),
        csvCell(l.actor_user_id),
        csvCell(l.ip),
      ].join(","),
    );
  }
  return lines.join("\r\n");
}

/** CSV içeriğini UTF-8 BOM ile Blob olarak tarayıcıdan indirir. */
export function downloadCsv(filename: string, csv: string): void {
  const BOM = "﻿";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Sonraki tick'te URL'i serbest bırak.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/* ---- tarih aralığı filtresi ------------------------------------------- */

/** `from`/`to` (YYYY-MM-DD, dahil) aralığına göre logları süzer. */
export function filterByDateRange(
  logs: AuditLog[],
  from: string,
  to: string,
): AuditLog[] {
  if (!from && !to) return logs;
  const fromTs = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity;
  const toTs = to ? new Date(`${to}T23:59:59.999`).getTime() : Infinity;
  return logs.filter((l) => {
    if (!l.created_at) return false;
    const ts = new Date(l.created_at).getTime();
    if (Number.isNaN(ts)) return false;
    return ts >= fromTs && ts <= toTs;
  });
}
