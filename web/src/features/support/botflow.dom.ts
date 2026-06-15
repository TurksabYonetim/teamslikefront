// web/src/features/support/botflow.dom.ts
/**
 * No-code görsel bot akışı motoru — saf gezinme + doğrulama. Bir akış, tipli
 * düğümlerden oluşan bir graftır. `collect` düğümü WhatsApp Flow (sohbet-içi
 * form) modeller. Framework'süz → birim test edilebilir; backend ile UI aynı
 * sözleşmeyi paylaşır.
 */
import type { BotFlow, BotNode, BotNodeKind } from "./support.types";

export const nodeById = (flow: BotFlow, id: string): BotNode | undefined =>
  flow.nodes.find((n) => n.id === id);

export interface StepInput {
  answer?: string; // question için seçilen seçenek etiketi
  vars?: Record<string, string>; // condition için değişkenler
}

/** Bir düğümden sonraki düğüm id'sini çöz; terminal/çıkmazda null. */
export function nextNodeId(node: BotNode, input: StepInput = {}): string | null {
  switch (node.kind) {
    case "message":
    case "collect":
      return node.next ?? null;
    case "question": {
      const opt = node.options?.find((o) => o.label === input.answer);
      return opt?.next ?? null;
    }
    case "condition": {
      const hit = (input.vars ?? {})[node.variable ?? ""] === node.equals;
      return (hit ? node.yes : node.no) ?? null;
    }
    case "handoff":
    case "end":
      return null;
  }
}

/**
 * Akışı `startId`'den, question düğümlerinde düğüm-id'sine göre anahtarlanmış
 * `answers` ve condition'lar için `vars` tüketerek dolaş. Ziyaret edilen düğüm
 * id'lerini döndürür (döngü-güvenli).
 */
export function traverse(flow: BotFlow, answers: Record<string, string> = {}, vars: Record<string, string> = {}): string[] {
  const path: string[] = [];
  const seen = new Set<string>();
  let current: string | null = flow.startId;
  while (current && !seen.has(current)) {
    const node = nodeById(flow, current);
    if (!node) break;
    path.push(current);
    seen.add(current);
    current = nextNodeId(node, { answer: answers[current], vars });
  }
  return path;
}

/** Var olmayan bir düğüme işaret eden kenar hedefleri (builder doğrulama). */
export function danglingTargets(flow: BotFlow): string[] {
  const ids = new Set(flow.nodes.map((n) => n.id));
  const targets: string[] = [];
  for (const n of flow.nodes) {
    const edges = [n.next, n.yes, n.no, ...(n.options?.map((o) => o.next) ?? [])];
    for (const e of edges) if (e && !ids.has(e)) targets.push(e);
  }
  return targets;
}

/** Hiçbir kenarın işaret etmediği düğümler (start hariç) — ulaşılamaz. */
export function unreachableNodes(flow: BotFlow): string[] {
  const referenced = new Set<string>([flow.startId]);
  for (const n of flow.nodes) {
    for (const e of [n.next, n.yes, n.no, ...(n.options?.map((o) => o.next) ?? [])]) {
      if (e) referenced.add(e);
    }
  }
  return flow.nodes.filter((n) => !referenced.has(n.id)).map((n) => n.id);
}

/** Türe göre düğüm sayısı (builder genel bakış). */
export function flowStats(flow: BotFlow): Record<BotNodeKind, number> {
  const stats: Record<BotNodeKind, number> = { message: 0, question: 0, collect: 0, condition: 0, handoff: 0, end: 0 };
  for (const n of flow.nodes) stats[n.kind]++;
  return stats;
}
