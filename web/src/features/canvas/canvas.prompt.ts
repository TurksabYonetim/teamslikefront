/**
 * Saf istemci "prompt → blok" motoru.
 *
 * Backend yok: serbest doğal-dil prompt'unu anahtar-kelime eşleşmesiyle bir
 * blok şablonuna çevirir. İki adım:
 *   1) matchPrompt — tip + temizlenmiş başlığı çıkarır (deterministik, saf).
 *   2) buildBlock  — eşleşmeden tipe özgü içerik şablonu üretir (CreateRequest).
 *
 * Tamamen saf/yan-etkisiz olduğundan kolayca test edilir (TDD).
 */
import type { BlockType, CreateCanvasBlockRequest } from "./canvas.types";

/** buildBlock çıktısı: title + content her zaman dolu (CreateRequest uyumlu). */
export interface BuiltBlock extends CreateCanvasBlockRequest {
  title: string;
  content: string;
}

export interface PromptMatch {
  type: BlockType;
  /** Anahtar kelime soyularak elde edilen başlık (görüntü-dostu). */
  title: string;
  /** İçerik türetmek için kullanılan, anahtar kelime soyulmuş gövde. */
  body: string;
}

/** Başlık üst sınırı (tek satırlık kart başlığı). */
const MAX_TITLE = 80;

/**
 * Tip öncelik sırası: daha spesifik tipler önce gelir; ilk eşleşen kazanır.
 * `note` bilinçli olarak listede yok — hiçbir şey eşleşmezse varsayılan odur.
 */
const KEYWORDS: { type: BlockType; words: string[] }[] = [
  {
    type: "checklist",
    words: [
      "checklist",
      "check list",
      "to-do",
      "todo",
      "to do",
      "task list",
      "yapılacak",
      "yapilacak",
      "yapılacaklar",
      "görev listesi",
    ],
  },
  {
    type: "table",
    words: ["table", "comparison", "matrix", "grid", "tablo", "karşılaştırma", "kıyasla"],
  },
  {
    type: "metric",
    words: ["metric", "kpi", "number", "stat", "gauge", "metrik", "gösterge", "sayı"],
  },
  {
    type: "action",
    words: ["action", "follow up", "follow-up", "decision", "aksiyon", "karar", "eylem"],
  },
  {
    type: "summary",
    words: ["summary", "summarize", "recap", "tldr", "tl;dr", "özet", "özetle"],
  },
];

/** Başlangıçtaki ayraç/etiket kalıntısını temizler ("checklist:" → ""). */
function cleanTitle(raw: string): string {
  let s = raw.replace(/\s+/g, " ").trim();
  // baştaki ayraçları soy
  s = s.replace(/^[\s:–—\-•]+/, "").trim();
  if (s.length > MAX_TITLE) s = s.slice(0, MAX_TITLE).trimEnd();
  return s;
}

/**
 * Serbest metni bir blok eşleşmesine çevirir.
 * Boş/whitespace girişte `null` döner.
 */
export function matchPrompt(input: string): PromptMatch | null {
  const text = input.trim();
  if (!text) return null;

  const lower = text.toLowerCase();

  for (const { type, words } of KEYWORDS) {
    for (const w of words) {
      const idx = lower.indexOf(w);
      if (idx === -1) continue;
      // Eşleşen anahtar kelimeyi (ve hemen ardındaki ayracı) gövdeden soy.
      const before = text.slice(0, idx);
      const after = text.slice(idx + w.length);
      const body = (before + " " + after).replace(/\s+/g, " ").trim();
      const title = cleanTitle(body) || cleanTitle(text);
      return { type, title, body: body || text };
    }
  }

  return { type: "note", title: cleanTitle(text), body: text };
}

/** "design, build, ship" / çok satır → liste öğeleri. */
function splitItems(body: string): string[] {
  return body
    .split(/[,\n;]+/)
    .map((s) => s.replace(/^[\s:–—\-•]+/, "").trim())
    .filter(Boolean);
}

/** Eşleşmeden tipe özgü içerik string'i üretir. */
function buildContent(match: PromptMatch): string {
  switch (match.type) {
    case "checklist": {
      const items = splitItems(match.body);
      if (items.length === 0) return "- [ ] ";
      return items.map((it) => `- [ ] ${it}`).join("\n");
    }
    case "table": {
      // En azından başlık + ayraç satırı şablonu.
      return "Sütun A | Sütun B\n--- | ---\n | ";
    }
    case "metric": {
      const numMatch = match.body.match(/[\d][\d.,]*%?/);
      const value = numMatch ? numMatch[0] : "0";
      // Sayı dışındaki kalan metni etiket olarak kullan.
      const label = match.body
        .replace(numMatch?.[0] ?? "", "")
        .replace(/\s+/g, " ")
        .trim();
      return label ? `${value}\n${label}` : `${value}`;
    }
    case "summary":
    case "action":
    case "note":
    default:
      // Serbest metin: başlık zaten gövdeyi taşıyor; içerik boş başlar.
      return "";
  }
}

/** Eşleşmeyi bir create-request'e dönüştürür. */
export function buildBlock(match: PromptMatch): BuiltBlock {
  return {
    type: match.type,
    title: match.title,
    content: buildContent(match),
  };
}
