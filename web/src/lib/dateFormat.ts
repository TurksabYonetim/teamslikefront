// web/src/lib/dateFormat.ts
/**
 * Tarih/saat biçimlendirme tek kaynağı. Feature'lar arası kopyalanan
 * `fmtDate`/`fmtTime` yardımcılarının davranışını (geçersiz/boş girdi
 * yönetimi dahil) burada toplar. Girdi ISO string, epoch ms veya Date olabilir.
 */
export type DateInput = string | number | Date | null | undefined;

/** Girdiyi geçerli bir Date'e çevirir; boş/geçersizse null. */
export function toValidDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Tam tarih+saat (ortam yereli, `toLocaleString`). Geçersiz/boş → `fallback` (varsayılan "—"). */
export function formatDateTime(value: DateInput, fallback = "—"): string {
  const d = toValidDate(value);
  return d ? d.toLocaleString() : fallback;
}

/** Saat:dakika (2 haneli). Geçersiz/boş → `fallback` (varsayılan ""). locale verilmezse ortam yereli. */
export function formatTime(
  value: DateInput,
  opts: { locale?: string | string[]; fallback?: string } = {},
): string {
  const d = toValidDate(value);
  if (!d) return opts.fallback ?? "";
  return d.toLocaleTimeString(opts.locale ?? [], { hour: "2-digit", minute: "2-digit" });
}
