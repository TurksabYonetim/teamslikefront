/** Phone modülü saf yardımcıları — eşleştirme, gruplama, normalizasyon. */

import type { CallLog, Contact } from "./phone.types";

/** Numarayı eşleştirme için normalize eder (sadece rakamlar). */
export function digitsOnly(raw: string): string {
  return (raw || "").replace(/[^\d]/g, "");
}

/**
 * Bir numaranın rehberdeki kişiyle eşleşip eşleşmediğini bulur.
 * Son 7+ hane üzerinden karşılaştırır (ülke kodu farklarına toleranslı).
 */
export function matchContact(
  number: string,
  contacts: Contact[],
): Contact | undefined {
  const target = digitsOnly(number);
  if (target.length < 3) return undefined;
  const tail = target.slice(-7);
  return contacts.find((c) => {
    const cand = digitsOnly(c.number);
    if (!cand) return false;
    return cand === target || cand.endsWith(tail) || target.endsWith(cand.slice(-7));
  });
}

/** Numaraya karşılık gelen kişi adını döndürür; eşleşme yoksa undefined. */
export function nameForNumber(
  number: string,
  contacts: Contact[],
): string | undefined {
  return matchContact(number, contacts)?.name;
}

/** Tarih grubu anahtarları (i18n ile etiketlenir). */
export type DateGroupKey = "today" | "yesterday" | "thisWeek" | "older";

/** Verilen tarihin hangi gruba düştüğünü hesaplar (yerel saate göre). */
export function dateGroupKey(date: Date, now: Date = new Date()): DateGroupKey {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = startOfDay(now);
  const target = startOfDay(date);
  const dayMs = 86_400_000;
  if (target === today) return "today";
  if (target === today - dayMs) return "yesterday";
  if (target > today - 7 * dayMs) return "thisWeek";
  return "older";
}

export interface CallLogGroup {
  key: DateGroupKey;
  items: CallLog[];
}

const GROUP_ORDER: DateGroupKey[] = ["today", "yesterday", "thisWeek", "older"];

/** Arama kayıtlarını tarih gruplarına böler (grup sırası: bugün → eski). */
export function groupCallLogsByDate(
  logs: CallLog[],
  now: Date = new Date(),
): CallLogGroup[] {
  const buckets = new Map<DateGroupKey, CallLog[]>();
  for (const log of logs) {
    const key = dateGroupKey(new Date(log.started_at), now);
    const arr = buckets.get(key);
    if (arr) arr.push(log);
    else buckets.set(key, [log]);
  }
  return GROUP_ORDER.filter((k) => buckets.has(k)).map((key) => ({
    key,
    items: buckets.get(key)!,
  }));
}

/** Kayıtları başlangıç zamanına göre azalan sıralar (en yeni üstte). */
export function sortByStartedDesc(logs: CallLog[]): CallLog[] {
  return [...logs].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime(),
  );
}

/** Bir kişinin gruplama harfini döndürür (A-Z, harf değilse "#"). */
export function contactLetter(name: string): string {
  const ch = (name || "").trim().charAt(0).toLocaleUpperCase("tr");
  return /[A-ZÇĞİÖŞÜ]/.test(ch) ? ch : "#";
}

export interface ContactGroup {
  letter: string;
  items: Contact[];
}

/** Kişileri ada göre sıralayıp baş harfe göre gruplar. */
export function groupContactsByLetter(
  contacts: Contact[],
  locale = "tr",
): ContactGroup[] {
  const sorted = [...contacts].sort((a, b) =>
    a.name.localeCompare(b.name, locale, { sensitivity: "base" }),
  );
  const buckets = new Map<string, Contact[]>();
  for (const c of sorted) {
    const letter = contactLetter(c.name);
    const arr = buckets.get(letter);
    if (arr) arr.push(c);
    else buckets.set(letter, [c]);
  }
  const letters = [...buckets.keys()].sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b, locale);
  });
  return letters.map((letter) => ({ letter, items: buckets.get(letter)! }));
}

/** Basit metin filtresi: ad/numara/e-postada arama terimini arar. */
export function filterContacts(contacts: Contact[], query: string): Contact[] {
  const q = query.trim().toLocaleLowerCase("tr");
  if (!q) return contacts;
  const qDigits = digitsOnly(query);
  return contacts.filter((c) => {
    const inName = c.name.toLocaleLowerCase("tr").includes(q);
    const inNumber = qDigits.length > 0 && digitsOnly(c.number).includes(qDigits);
    const inEmail = (c.email ?? "").toLocaleLowerCase("tr").includes(q);
    return inName || inNumber || inEmail;
  });
}

/** Arama geçmişinde ada/numaraya göre filtre (rehber adını da hesaba katar). */
export function filterCallLogs(
  logs: CallLog[],
  query: string,
  contacts: Contact[],
): CallLog[] {
  const q = query.trim().toLocaleLowerCase("tr");
  if (!q) return logs;
  const qDigits = digitsOnly(query);
  return logs.filter((log) => {
    const resolvedName =
      log.peer_name || nameForNumber(log.peer_number, contacts) || "";
    const inName = resolvedName.toLocaleLowerCase("tr").includes(q);
    const inNumber =
      qDigits.length > 0 && digitsOnly(log.peer_number).includes(qDigits);
    return inName || inNumber;
  });
}
