/**
 * Saf governance domain yardımcıları — çerçeve bağımsız, birim test edilebilir.
 * Admin · Güvenlik/Uyumluluk · Faturalandırma bounded context'leri (Teams/Purview paritesi).
 *
 * Tehlikeli aksiyonlar (ödeme, izin, kalıcı silme) yalnızca UI akışıdır; gerçek
 * yürütme açık onayla backend'de yapılır, asla burada çalıştırılmaz.
 */

export type QuotaLevel = "ok" | "warn" | "exceeded";

/** Kullanım/limit oranına göre kota durumu (warn ≥%80, exceeded ≥%100). */
export function quotaState(used: number, limit: number): QuotaLevel {
  if (limit <= 0) return "ok";
  if (used >= limit) return "exceeded";
  return used / limit >= 0.8 ? "warn" : "ok";
}

/** Plan değişikliği için dönemde kalan günlere göre oransal fark ücreti (2 ondalık). */
export function proration(
  oldPrice: number,
  newPrice: number,
  daysLeft: number,
  daysInPeriod: number,
): number {
  if (daysInPeriod <= 0) return 0;
  return Math.round((((newPrice - oldPrice) * daysLeft) / daysInPeriod) * 100) / 100;
}

/** Denetim olaylarını aktör (tam) ve/veya aksiyon (alt dizi, harf duyarsız) ile süzer. */
export function filterAudit(
  events: { actorId: string; action: string }[],
  filters: { actorId?: string; action?: string },
): { actorId: string; action: string }[] {
  return events.filter(
    (e) =>
      (!filters.actorId || e.actorId === filters.actorId) &&
      (!filters.action || e.action.toLowerCase().includes(filters.action.toLowerCase())),
  );
}

/** Verinin yaşı (gün) saklama penceresini aştı mı (temizlenmeli mi)? */
export function retentionExpired(ageDays: number, retentionDays: number): boolean {
  return ageDays > retentionDays;
}

/** Veri ikamet kontrolü: etkin bir residency politikası bölge ile eşleşmeli. */
export function residencyAllowed(
  policy: { kind: string; enabled: boolean; config: Record<string, string> },
  region: string,
): boolean {
  if (policy.kind !== "residency" || !policy.enabled) return true;
  return policy.config.region === region;
}

/* ───────────── Purview-sınıfı governance (Teams paritesi) ───────────── */

export type DlpKind = "iban" | "card" | "tckn" | "email";
export interface DlpFinding {
  kind: DlpKind;
  match: string;
}

/** Lineer, ReDoS-güvenli DLP desenleri; öncelik sırasıyla denenir. */
const DLP_PATTERNS: { kind: DlpKind; re: RegExp }[] = [
  { kind: "iban", re: /\bTR\d{2}(?: ?\d{4}){5} ?\d{2}\b/gi },
  { kind: "card", re: /\b(?:\d{4}[ -]){3}\d{4}\b|\b\d{13,16}\b/g },
  { kind: "tckn", re: /\b\d{11}\b/g },
  { kind: "email", re: /[\w.+-]+@[\w-]+\.[\w.-]+/g },
];

/** Metni DLP politikasının engelleyeceği hassas tokenlar için tarar (kart/IBAN/TC/e-posta). */
export function dlpScan(text: string): DlpFinding[] {
  const findings: DlpFinding[] = [];
  for (const { kind, re } of DLP_PATTERNS) {
    for (const m of text.matchAll(re)) findings.push({ kind, match: m[0] });
  }
  return findings;
}

/** Tüm DLP eşleşmelerini `mask` ile maskeler (güvenli görüntüleme / egress engelleme). */
export function dlpRedact(text: string, mask = "•••"): string {
  let out = text;
  for (const { re } of DLP_PATTERNS) out = out.replace(new RegExp(re.source, re.flags), mask);
  return out;
}

export type SensitivityLabel = "public" | "general" | "confidential" | "restricted";
const SENSITIVITY_ORDER: SensitivityLabel[] = ["public", "general", "confidential", "restricted"];

/** Hassasiyet etiketini 0 (public) … 3 (restricted) olarak rank'ler. */
export function sensitivityRank(label: SensitivityLabel): number {
  return SENSITIVITY_ORDER.indexOf(label);
}

/** `from`'dan `to`'ya düşürmenin engellenip engellenmediği (etiketler yalnızca yukarı çıkabilir). */
export function sensitivityDowngradeBlocked(
  from: SensitivityLabel,
  to: SensitivityLabel,
): boolean {
  return sensitivityRank(to) < sensitivityRank(from);
}

/** Bilgi bariyerleri: A ve B grupları iletişim kurmaktan men edilmiş mi? */
export function barrierBlocks(a: string, b: string, barriers: [string, string][]): boolean {
  if (a === b) return false;
  return barriers.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

/** İletişim uyumluluğu: bir mesaj denetlenen/engellenen terimlerden hangilerine takılır? */
export function flaggedTerms(text: string, terms: string[]): string[] {
  const t = text.toLowerCase();
  return terms.filter((w) => w.trim() && t.includes(w.trim().toLowerCase()));
}

/* ───────────── Şeffaf AI faturalandırması (dahil krediler, çözüm-başı yok) ───────────── */

/** AI-kredi kullanım durumu — kota eşiklerini yeniden kullanır (warn ≥%80, exceeded ≥%100). */
export function aiCreditState(used: number, included: number): QuotaLevel {
  return quotaState(used, included);
}

/** Dahil kontenjanı aşan krediler için USD aşım maliyeti (2 ondalık). */
export function creditOverage(used: number, included: number, perCreditCost: number): number {
  const over = Math.max(0, used - included);
  return Math.round(over * perCreditCost * 100) / 100;
}
