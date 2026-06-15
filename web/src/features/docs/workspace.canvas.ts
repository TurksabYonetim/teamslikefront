import type { Block, Card, StepResult, Workflow } from "./workspace.types";

/** Saf Canvas/Board/Workflow domain yardımcıları — framework'siz, test edilebilir. */

/** Bir todo bloğunun checked durumunu değiştir. */
export function toggleBlock(blocks: Block[], id: string): Block[] {
  return blocks.map((b) => (b.id === id && b.type === "todo" ? { ...b, checked: !b.checked } : b));
}

/** Kartı başka kolona taşı (drag-drop ve klavyenin ortak saf çekirdeği). */
export function moveCard(cards: Card[], cardId: string, toColumnId: string): Card[] {
  return cards.map((c) => (c.id === cardId ? { ...c, columnId: toColumnId } : c));
}

/** Bir iş akışının adımlarını çalıştırmayı simüle eder; adım başına sonuç günlüğü. */
export function runWorkflow(workflow: Workflow): StepResult[] {
  return workflow.steps.map((s) => ({ id: s.id, label: `${s.kind}: ${s.value}`, status: "done" as const }));
}

export interface DocProgress {
  done: number;
  total: number;
  pct: number; // 0..100
}

/** Dokümandaki todo blokları arasında tamamlanma ilerlemesi. */
export function docProgress(blocks: Block[]): DocProgress {
  const todos = blocks.filter((b) => b.type === "todo");
  const done = todos.filter((b) => b.checked).length;
  const total = todos.length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}
