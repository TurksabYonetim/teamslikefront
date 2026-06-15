// web/src/features/messaging/chat.ts
import type { Channel, Community, DeliveryStatus, Message, MessagePriority } from "./types";

/** Teslim durum makinesi: sending → sent → delivered → read (read son durak). */
export function deliveryNext(s: DeliveryStatus): DeliveryStatus {
  const order: DeliveryStatus[] = ["sending", "sent", "delivered", "read"];
  const i = order.indexOf(s);
  return i < 0 || i === order.length - 1 ? "read" : order[i + 1];
}

/** WhatsApp-benzeri 15 dakikalık düzenleme penceresi. */
export const canEditWithin = (minutesAgo: number): boolean => minutesAgo < 15;

/** Seed string'ten deterministik 0..1 dalga formu (n bar). */
export function voiceWaveform(seed: string, bars: number): number[] {
  const out: number[] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  for (let i = 0; i < bars; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    out.push(((h % 1000) / 1000) * 0.8 + 0.2); // 0.2..1.0 görünür yükseklik
  }
  return out;
}

/** Büyük/küçük harf duyarsız alt-dize eşleşmesi (boş sorgu = eşleşme yok). */
export function highlightHit(text: string, query: string): boolean {
  if (!query) return false;
  return text.toLowerCase().includes(query.toLowerCase());
}

/** Sıralama ağırlığı. */
export function priorityRank(p?: MessagePriority): number {
  return p === "urgent" ? 2 : p === "important" ? 1 : 0;
}

/**
 * Acil mesaj için yeniden bildirim zamanlaması (saf fonksiyon).
 * Mesaj okunana kadar `intervalMin` dakikada bir hatırlatma anı üretir.
 * - İlk hatırlatma `sentAtMin + intervalMin` anındadır (gönderim anında değil).
 * - `readAtMin` verilirse o ana kadar olan hatırlatmalar üretilir (okununca durur).
 * - Pencere `nowMin`'e kadar uzanır; geçmiş/geçersiz girişlerde boş döner.
 * Dönüş: artan, sentinel'e göreli mutlak dakika damgaları (örn. [2, 4, 6]).
 */
export function urgentRepeatSchedule(args: {
  sentAtMin: number;
  nowMin: number;
  readAtMin?: number;
  intervalMin?: number;
}): number[] {
  const interval = args.intervalMin ?? 2;
  if (interval <= 0) return [];
  // Okununca hatırlatma akışı durur: üst sınır = min(now, readAt).
  const upper = args.readAtMin != null ? Math.min(args.nowMin, args.readAtMin) : args.nowMin;
  const out: number[] = [];
  for (let t = args.sentAtMin + interval; t <= upper; t += interval) {
    out.push(t);
  }
  return out;
}

/** Bir topluluğun kanallarını sırayı koruyarak süz. */
export function communityChannels(community: Community, channels: Channel[]): Channel[] {
  return community.channelIds
    .map((id) => channels.find((c) => c.id === id))
    .filter((c): c is Channel => Boolean(c));
}

/** Ardışık aynı yazar mesajlarını grupla (≤ gapMin dk). Üst düzey mesajlar için. */
export function groupAlbums(messages: Message[], gapMin = 8): Message[][] {
  const groups: Message[][] = [];
  for (const m of messages) {
    const last = groups[groups.length - 1];
    const prev = last?.[last.length - 1];
    if (prev && prev.authorId === m.authorId && Math.abs(prev.tMinutes - m.tMinutes) <= gapMin) {
      last.push(m);
    } else {
      groups.push([m]);
    }
  }
  return groups;
}

const FILLERS = ["um", "uh", "just", "really", "actually", "basically", "literally"];
/** AI-stili ton dönüşümü (mock). */
export function rewriteMessage(text: string, tone: "professional" | "friendly" | "concise"): string {
  const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
  const t = text.trim();
  if (tone === "professional") {
    const c = cap(t);
    return /[.!?]$/.test(c) ? c : `${c}.`;
  }
  if (tone === "friendly") {
    return cap(t).replace(/\.$/, "!");
  }
  // concise: doldurma kelimelerini at
  return t
    .split(/\s+/)
    .filter((w) => !FILLERS.includes(w.toLowerCase()))
    .join(" ");
}
