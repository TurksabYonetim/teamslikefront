// web/src/features/support/support.dom.ts
import type { Agent, Conversation, ConversationStatus, KbArticle, Macro, Priority } from "./support.types";

/** Saf Omnichannel-Support helper'ları — framework'süz, birim test edilebilir. */

/** Round-robin agent ataması, uygun olmayanı atlar (sarar). */
export function pickAgent(agents: Agent[], lastIndex = -1): Agent | null {
  if (agents.length === 0) return null;
  for (let i = 1; i <= agents.length; i++) {
    const idx = (lastIndex + i) % agents.length;
    if (agents[idx].available) return agents[idx];
  }
  return null;
}

export type SlaState = "ok" | "due_soon" | "breached";

/** SLA durumu: süresi geçtiyse breached, 5dk içinde due_soon, değilse ok. */
export function slaState(slaDueAt: number, now: number = Date.now()): SlaState {
  if (now >= slaDueAt) return "breached";
  if (slaDueAt - now <= 5 * 60_000) return "due_soon";
  return "ok";
}

export interface MacroPatch {
  reply?: string;
  status?: ConversationStatus;
  priority?: Priority;
  labels?: string[];
  assigneeId?: string;
}

/** Bir makronun aksiyonlarını tek konuşma patch'ine indirger (+opsiyonel reply). */
export function expandMacro(macro: Macro): MacroPatch {
  const patch: MacroPatch = {};
  for (const a of macro.actions) {
    if (a.type === "reply") patch.reply = a.value;
    else if (a.type === "status") patch.status = a.value as ConversationStatus;
    else if (a.type === "priority") patch.priority = a.value as Priority;
    else if (a.type === "assign") patch.assigneeId = a.value;
    else if (a.type === "label") patch.labels = [...(patch.labels ?? []), a.value];
  }
  return patch;
}

/** Hazır yanıttaki {{değişken}} placeholder'larını ikame eder (bilinmeyen korunur). */
export function renderCanned(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in vars ? vars[key] : m));
}

/** Puanlı konuşmaların ortalama CSAT'ı (yoksa 0). */
export function csatAverage(convs: Conversation[]): number {
  const rated = convs.filter((c) => typeof c.csat === "number");
  if (rated.length === 0) return 0;
  return Math.round((rated.reduce((n, c) => n + (c.csat ?? 0), 0) / rated.length) * 100) / 100;
}

/** Bilgi bankası araması: başlık + gövde üzerinde harf duyarsız alt-dize. */
export function searchKb(articles: KbArticle[], q: string): KbArticle[] {
  const s = q.trim().toLowerCase();
  if (!s) return articles;
  return articles.filter((a) => a.title.toLowerCase().includes(s) || a.body.toLowerCase().includes(s));
}
