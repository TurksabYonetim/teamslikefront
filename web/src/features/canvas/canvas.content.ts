/**
 * İçerik (content) ayrıştırma/serileştirme yardımcıları.
 *
 * Backend sözleşmesi DEĞİŞMEZ: `content` her zaman düz `string` olarak saklanır.
 * Tipe özgü zengin görünümler bu string'i istemci tarafında parse eder ve
 * (örn. checklist toggle) tekrar aynı string formatına serileştirip PATCH eder.
 */

/* ------------------------------------------------------------------ */
/* Checklist: "- [ ] madde" / "- [x] madde" satır formatı                */
/* ------------------------------------------------------------------ */

export interface ChecklistItem {
  /** Satırın orijinal sıradaki indeksi (serileştirmede kullanılır). */
  index: number;
  checked: boolean;
  text: string;
}

const CHECKLIST_RE = /^\s*[-*]\s*\[( |x|X)\]\s?(.*)$/;

/** Checklist içeriğini satır satır ayrıştırır. Tanınmayan satırlar atlanır. */
export function parseChecklist(content: string): ChecklistItem[] {
  if (!content.trim()) return [];
  const items: ChecklistItem[] = [];
  content.split(/\r?\n/).forEach((line) => {
    const m = CHECKLIST_RE.exec(line);
    if (!m) return;
    items.push({
      index: items.length,
      checked: m[1].toLowerCase() === "x",
      text: m[2].trim(),
    });
  });
  return items;
}

/** Checklist öğelerini "- [ ]/- [x]" formatına geri serileştirir. */
export function serializeChecklist(items: ChecklistItem[]): string {
  return items
    .map((it) => `- [${it.checked ? "x" : " "}] ${it.text}`.trimEnd())
    .join("\n");
}

/** Tek bir öğenin işaretini değiştirip yeni content string'i döndürür. */
export function toggleChecklistItem(content: string, index: number): string {
  const items = parseChecklist(content);
  const next = items.map((it) =>
    it.index === index ? { ...it, checked: !it.checked } : it,
  );
  return serializeChecklist(next);
}

/** İlerleme (tamamlanan / toplam). */
export function checklistProgress(items: ChecklistItem[]): {
  done: number;
  total: number;
} {
  return { done: items.filter((i) => i.checked).length, total: items.length };
}

/* ------------------------------------------------------------------ */
/* Table: basit CSV / boru-ayraçlı satır formatı                         */
/* ------------------------------------------------------------------ */

export interface ParsedTable {
  header: string[] | null;
  rows: string[][];
}

/**
 * Tabloyu ayrıştırır. Hücre ayracı olarak `|` veya `,` desteklenir
 * (satırda `|` varsa öncelikli). İlk satır başlık kabul edilir.
 * Markdown ayraç satırı (`---|---`) atlanır.
 */
export function parseTable(content: string): ParsedTable {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return { header: null, rows: [] };

  const splitRow = (line: string): string[] => {
    const sep = line.includes("|") ? "|" : ",";
    return line
      .replace(/^\||\|$/g, "")
      .split(sep)
      .map((c) => c.trim());
  };

  const isDivider = (line: string) => /^[\s|:-]+$/.test(line) && line.includes("-");

  const dataLines = lines.filter((l) => !isDivider(l));
  if (dataLines.length === 0) return { header: null, rows: [] };

  const [first, ...rest] = dataLines;
  return { header: splitRow(first), rows: rest.map(splitRow) };
}

/* ------------------------------------------------------------------ */
/* Metric: "değer" + opsiyonel "etiket" (ikinci satır)                   */
/* ------------------------------------------------------------------ */

export interface ParsedMetric {
  value: string;
  label: string | null;
  delta: string | null;
}

/**
 * Metrik içeriğini ayrıştırır.
 * 1. satır: büyük değer. 2. satır: etiket.
 * Değer satırında "↑/↓/+/-" ile başlayan bir son parça varsa delta sayılır.
 */
export function parseMetric(content: string): ParsedMetric {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return { value: "", label: null, delta: null };

  let value = lines[0];
  let delta: string | null = null;
  const deltaMatch = /\s+([↑↓▲▼+\-][^\s]*%?)$/.exec(value);
  if (deltaMatch) {
    delta = deltaMatch[1];
    value = value.slice(0, deltaMatch.index).trim();
  }
  return { value, label: lines[1] ?? null, delta };
}
