import type { Clip, ClipChapter } from "./workspace.types";

/**
 * Saf Clips (async-video) yardımcıları — Loom-paritesi AI + gizlilik + etkileşim.
 * Framework'siz → birim test edilebilir. AI çıktıları transkriptin deterministik
 * dönüşümleridir (gerçek backend aynı sözleşmeyle bir LLM çağırırdı).
 *
 * Loom'a fark: dolgu-kelime temizleme & AI iş akışları TR + EN çalışır
 * (Loom dolgu temizleme ve doc iş akışlarını yalnız İngilizce'ye kapatır).
 */

/** `removeFillerWords` ile silinen dolgu kelime/ifadeler — İngilizce + Türkçe. */
const FILLER_WORDS = [
  // İngilizce
  "um",
  "uh",
  "erm",
  "like",
  "you know",
  "i mean",
  "actually",
  "basically",
  "literally",
  "sort of",
  "kind of",
  // Türkçe
  "şey",
  "yani",
  "işte",
  "hani",
  "falan",
  "aslında",
  "aslında ya",
];

const ACTION_CUES = [
  "follow up",
  "todo",
  "action",
  "need to",
  "we should",
  "should",
  "let's",
  "next step",
  "ship",
  // Türkçe
  "yapılacak",
  "takip",
  "gerekiyor",
  "sonraki adım",
  "halletmeli",
];

/** Transkripti kırpılmış, boş olmayan cümlelere böl. */
export function sentences(transcript: string): string[] {
  return transcript
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Dolgu kelime/ifadeleri sil (duyarsız, EN + TR), boşlukları düzelt. */
export function removeFillerWords(text: string): string {
  let out = text;
  for (const f of FILLER_WORDS) {
    const re = new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b,?`, "gi");
    out = out.replace(re, "");
  }
  return out
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,!?])/g, "$1")
    .trim();
}

/** İlk 1–2 cümle, `maxLen` ile kırpılarak → otomatik özet. */
export function autoSummary(transcript: string, maxLen = 140): string {
  const text = sentences(transcript).slice(0, 2).join(". ");
  if (!text) return "";
  const withDot = text.endsWith(".") ? text : `${text}.`;
  return withDot.length > maxLen ? `${withDot.slice(0, maxLen - 1).trimEnd()}…` : withDot;
}

/** Transkriptten eşit aralıklı zaman damgalı bölümler (en fazla `max`). */
export function autoChapters(transcript: string, durationSec: number, max = 5): ClipChapter[] {
  const segs = sentences(transcript).slice(0, max);
  if (segs.length === 0) return [];
  return segs.map((seg, i) => ({
    atSec: Math.round((i / segs.length) * Math.max(0, durationSec)),
    title: seg.split(/\s+/).slice(0, 5).join(" "),
  }));
}

/** Aksiyon öğesi gibi görünen cümleler (EN + TR ipucu kelimeleri). */
export function extractTasks(transcript: string): string[] {
  return sentences(transcript).filter((s) => {
    const low = s.toLowerCase();
    return ACTION_CUES.some((cue) => low.includes(cue));
  });
}

/** Klip → SOP/adım doc metni (AI iş akışı: video → doküman). */
export function clipToDoc(clip: Clip): string {
  const steps = sentences(clip.transcript);
  const body = steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
  return `# ${clip.title}\n\n${body}`;
}

/** Klip → iş öğesi (Jira/Linear) başlık + gövde (AI iş akışı). */
export function clipToWorkItem(clip: Clip): { title: string; body: string } {
  const tasks = clip.tasks && clip.tasks.length > 0 ? clip.tasks : extractTasks(clip.transcript);
  const body = tasks.map((t) => `- [ ] ${t}`).join("\n") || clip.transcript;
  return { title: clip.title, body };
}

/** Klip → sohbet/e-posta tonunda mesaj (AI iş akışı). */
export function clipToMessage(clip: Clip): string {
  const summary = clip.summary || autoSummary(clip.transcript);
  return `Recorded a quick clip — "${clip.title}". ${summary}`;
}

/** Public link süresi doldu mu? (süre yok = asla). */
export function isLinkExpired(clip: Clip, now: number = Date.now()): boolean {
  return typeof clip.linkExpiresAt === "number" && clip.linkExpiresAt <= now;
}

/** Tamamlanma oranı 0..1'e clamp (etkileşim). */
export function completionRate(clip: Clip): number {
  const r = clip.completionRate ?? 0;
  return Math.max(0, Math.min(1, r));
}

/** Tüm emojiler arası toplam reaksiyon. */
export function reactionTotal(clip: Clip): number {
  return (clip.reactions ?? []).reduce((sum, r) => sum + r.count, 0);
}

/** Görüntülenmeye göre azalan sıralı klipler (analitik "top clips"). */
export function topClips(clips: Clip[], n = 5): Clip[] {
  return clips
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, n);
}
