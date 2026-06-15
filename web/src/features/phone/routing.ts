import type {
  CallerClass,
  PhoneContact,
  Presence,
  RoutingActionKind,
  RoutingRule,
} from "./phone.types";

/**
 * Pür Telephony-domain yardımcıları. Framework'ten bağımsız → store/React olmadan
 * test edilir; taşıyıcı-bağımsız çevirme & yönlendirme kurallarını kodlar.
 */

/** DTMF / numara normalizasyonu — dialable E.164-benzeri string. */
export function normalizeNumber(input: string): string {
  const s = input.trim();
  let plus = s.startsWith("+");
  let digits = s.replace(/\D/g, "");
  if (!plus && digits.startsWith("00")) {
    plus = true;
    digits = digits.slice(2);
  }
  return (plus ? "+" : "") + digits;
}

/** Görünüm biçimi — +1 numaralar için ulusal gruplama, diğerleri dokunulmaz. */
export function formatNumber(e164: string): string {
  if (/^\+1\d{10}$/.test(e164)) {
    const d = e164.slice(2);
    return `+1 (${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return e164;
}

export interface RoutingContext {
  afterHours?: boolean;
  busy?: boolean;
  noAnswer?: boolean;
}

/** Find-me/follow-me: ilk eşleşen koşullu kural kazanır (dizi sırası); `always` catch-all'dur. */
export function evaluateRouting(rules: RoutingRule[], ctx: RoutingContext): RoutingRule | null {
  const matches = (r: RoutingRule): boolean =>
    r.condition === "afterHours"
      ? !!ctx.afterHours
      : r.condition === "busy"
        ? !!ctx.busy
        : r.condition === "noAnswer"
          ? !!ctx.noAnswer
          : false;
  return rules.find(matches) ?? rules.find((r) => r.condition === "always") ?? null;
}

/** Presence → varsayılan yönlendirme aksiyonu (online bağlar; aksi voicemail). */
export function presenceToRouting(presence: Presence): RoutingActionKind {
  return presence === "online" ? "forward" : "voicemail";
}

/** Numarayı kişi adına çözer, yoksa biçimlenmiş haline (caller-ID). */
export function callerName(e164: string, contacts: PhoneContact[]): string {
  return contacts.find((c) => c.e164 === e164)?.name ?? formatNumber(e164);
}

/** Çağıran itibarı: blocked → trusted → spam (heuristik) → unknown. */
export function classifyCaller(
  e164: string,
  opts: { contacts: PhoneContact[]; blocklist: string[] },
): CallerClass {
  if (opts.blocklist.includes(e164)) return "blocked";
  if (opts.contacts.some((c) => c.e164 === e164)) return "trusted";
  const digits = e164.replace(/\D/g, "");
  if (digits.length < 7) return "spam";
  if (/(\d)\1{4,}/.test(digits)) return "spam";
  return "unknown";
}

/** İsim + numara üzerinde büyük/küçük harf duyarsız rehber araması. */
export function searchContacts(contacts: PhoneContact[], q: string): PhoneContact[] {
  const s = q.trim().toLowerCase();
  if (!s) return contacts;
  return contacts.filter(
    (c) => c.name.toLowerCase().includes(s) || c.e164.toLowerCase().includes(s),
  );
}

/** {{değişken}} yer tutucularını değiştir; bilinmeyenler korunur. */
export function renderTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{(\w+)\}\}/g, (m, key) => (Object.hasOwn(vars, key) ? vars[key] : m));
}
