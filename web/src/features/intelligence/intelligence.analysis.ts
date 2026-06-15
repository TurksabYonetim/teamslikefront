/**
 * Intelligence — client-side metin analizi yardımcıları.
 *
 * Tümü transcript `content` metninden türetilir; backend/API'ye dokunmaz.
 * Konuşma süresi tahmini ortalama ~130 kelime/dakika varsayımıyla hesaplanır.
 */
import type {
  TranscriptAnalytics,
  TranscriptSegment,
  WordFrequency,
} from "./intelligence.types";

/** Ortalama konuşma hızı (kelime/dakika) — konuşma süresi tahmini için. */
export const WORDS_PER_MINUTE = 130;

/** Metni kelimelere böler (Unicode harf/rakam, Türkçe karakterler dahil). */
function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[\p{L}\p{N}]+/gu);
  return matches ?? [];
}

/**
 * Frekans analizinde elenecek çok sık/anlamsız kelimeler (TR + EN).
 * Sadece görsel gürültüyü azaltmak için; istatistiklere dahil değildir.
 */
const STOP_WORDS = new Set([
  // TR
  "ve", "ile", "bir", "bu", "şu", "o", "da", "de", "ki", "mi", "mı", "mu", "mü",
  "için", "ama", "fakat", "çünkü", "gibi", "kadar", "ne", "her", "çok", "daha",
  "en", "ya", "veya", "ise", "ben", "sen", "biz", "siz", "onlar", "var", "yok",
  "bı", "şey", "olarak", "ben", "evet", "hayır", "tamam",
  // EN
  "the", "a", "an", "and", "or", "but", "if", "of", "to", "in", "on", "for",
  "is", "are", "was", "were", "be", "been", "it", "this", "that", "with", "as",
  "at", "by", "we", "you", "i", "he", "she", "they", "so", "do", "not", "yes",
  "no", "ok", "okay",
]);

/** Bir metin için temel analitik hesaplar. */
export function computeAnalytics(text: string): TranscriptAnalytics {
  const trimmed = text.trim();
  const words = trimmed ? tokenize(trimmed).length : 0;
  const lines = trimmed
    ? trimmed.split(/\n+/).filter((l) => l.trim().length > 0).length
    : 0;
  const sentences = trimmed
    ? (trimmed.match(/[.!?…]+/g)?.length ?? 0) || (words > 0 ? 1 : 0)
    : 0;
  const speakingMinutes =
    Math.max(0, Math.round((words / WORDS_PER_MINUTE) * 10) / 10);
  return {
    words,
    characters: text.length,
    lines,
    sentences,
    speakingMinutes,
    wpm: WORDS_PER_MINUTE,
  };
}

/**
 * En sık geçen kelimeleri (stop-word'ler hariç) frekansa göre döndürür.
 * @param limit Döndürülecek en sık kelime sayısı.
 */
export function computeWordFrequency(text: string, limit = 12): WordFrequency[] {
  const counts = new Map<string, number>();
  for (const tok of tokenize(text)) {
    if (tok.length < 3 || STOP_WORDS.has(tok)) continue;
    counts.set(tok, (counts.get(tok) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, limit);
}

/**
 * "İsim: söylenen…" kalıbındaki satırları konuşmacı segmentlerine ayrıştırır.
 * Hiç kalıp bulunmazsa boş dizi döner (çağıran düz metne döner).
 *
 * Kabul edilen kalıp: satır başında 1-4 kelimelik isim + ":" + içerik.
 */
export function parseSegments(text: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  // Satır başında "Ad Soyad:" veya "[00:12] Ad:" gibi kalıplar.
  const speakerLine =
    /^\s*(?:\[?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*\]?\s+)?([\p{L}][\p{L}\s.'-]{0,30}?)\s*:\s*(.*)$/u;

  let current: TranscriptSegment | null = null;
  for (const raw of text.split(/\n/)) {
    const line = raw.replace(/\s+$/, "");
    const m = line.match(speakerLine);
    // İsim kısmı tek kelimeyse en az 2 harf, çok kelimeyse makul olmalı.
    const looksLikeSpeaker =
      m && m[2] && m[2].trim().split(/\s+/).length <= 4 && m[2].trim().length >= 2;
    if (looksLikeSpeaker) {
      if (current) segments.push(current);
      current = {
        speaker: m[2].trim(),
        timestamp: m[1] ?? null,
        text: m[3] ?? "",
      };
    } else if (current) {
      // Devam satırı: mevcut segmentin metnine ekle.
      if (line.trim()) current.text += (current.text ? "\n" : "") + line.trim();
    }
  }
  if (current) segments.push(current);
  // En az iki konuşmacı yoksa segmentleme anlamlı değil → düz metin.
  const speakers = new Set(segments.map((s) => s.speaker.toLowerCase()));
  if (segments.length < 2 || speakers.size < 2) return [];
  return segments;
}

/** Segment listesinden konuşmacı başına kelime/segment özetini çıkarır. */
export function summarizeSpeakers(
  segments: TranscriptSegment[],
): { speaker: string; words: number; segments: number; share: number }[] {
  const map = new Map<string, { words: number; segments: number }>();
  for (const seg of segments) {
    const key = seg.speaker;
    const words = tokenize(seg.text).length;
    const cur = map.get(key) ?? { words: 0, segments: 0 };
    cur.words += words;
    cur.segments += 1;
    map.set(key, cur);
  }
  const total = [...map.values()].reduce((a, b) => a + b.words, 0) || 1;
  return [...map.entries()]
    .map(([speaker, v]) => ({
      speaker,
      words: v.words,
      segments: v.segments,
      share: Math.round((v.words / total) * 100),
    }))
    .sort((a, b) => b.words - a.words);
}

/**
 * Bir metni, verilen sorguya göre eşleşen/eşleşmeyen parçalara böler.
 * Vurgulama (highlight) için kullanılır; regex özel karakterleri kaçırılır.
 */
export function splitHighlight(
  text: string,
  query: string,
): { text: string; match: boolean }[] {
  const q = query.trim();
  if (!q) return [{ text, match: false }];
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${escaped})`, "giu");
  const lowerQ = q.toLowerCase();
  return text
    .split(re)
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, match: part.toLowerCase() === lowerQ }));
}

/** Sorgunun metinde kaç kez geçtiğini sayar (case-insensitive). */
export function countMatches(text: string, query: string): number {
  const q = query.trim();
  if (!q) return 0;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = text.match(new RegExp(escaped, "giu"));
  return matches?.length ?? 0;
}
