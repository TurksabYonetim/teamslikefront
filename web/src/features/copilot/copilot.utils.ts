import type { CopilotConversation } from "./copilot.types";

/** Tarih grupları için anahtarlar. i18n `history.*` ile eşlenir. */
export type DateGroupKey = "today" | "yesterday" | "previous7Days" | "older";

export interface ConversationGroup {
  key: DateGroupKey;
  items: CopilotConversation[];
}

/** Verilen tarihi gün başına (00:00) indirger. */
function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * Bir konuşmayı güncel zamana göre tarih grubuna ayırır.
 * `updated_at` yoksa `created_at` kullanılır; ikisi de yoksa "older".
 */
export function dateGroupFor(
  conversation: CopilotConversation,
  now: Date = new Date(),
): DateGroupKey {
  const raw = conversation.updated_at || conversation.created_at;
  const ts = raw ? Date.parse(raw) : NaN;
  if (Number.isNaN(ts)) return "older";

  const today = startOfDay(now);
  const day = 24 * 60 * 60 * 1000;
  const itemDay = startOfDay(new Date(ts));

  if (itemDay >= today) return "today";
  if (itemDay >= today - day) return "yesterday";
  if (itemDay >= today - 7 * day) return "previous7Days";
  return "older";
}

const GROUP_ORDER: DateGroupKey[] = [
  "today",
  "yesterday",
  "previous7Days",
  "older",
];

/**
 * Konuşmaları en yeni → en eski sıralayıp tarih gruplarına böler.
 * Boş gruplar atlanır; grup içi sıralama da en yeniden eskiye.
 */
export function groupConversationsByDate(
  conversations: CopilotConversation[],
  now: Date = new Date(),
): ConversationGroup[] {
  const sortKey = (c: CopilotConversation) =>
    Date.parse(c.updated_at || c.created_at || "") || 0;

  const sorted = [...conversations].sort((a, b) => sortKey(b) - sortKey(a));

  const buckets = new Map<DateGroupKey, CopilotConversation[]>();
  for (const c of sorted) {
    const key = dateGroupFor(c, now);
    const arr = buckets.get(key);
    if (arr) arr.push(c);
    else buckets.set(key, [c]);
  }

  return GROUP_ORDER.filter((k) => (buckets.get(k)?.length ?? 0) > 0).map(
    (key) => ({ key, items: buckets.get(key)! }),
  );
}

/** Arama: başlığa göre büyük/küçük harf duyarsız filtre. */
export function filterConversations(
  conversations: CopilotConversation[],
  query: string,
): CopilotConversation[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return conversations;
  return conversations.filter((c) =>
    (c.title || "").toLocaleLowerCase().includes(q),
  );
}
