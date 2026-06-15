// web/src/features/support/studio.dom.ts
/**
 * Saf AI Agent Studio yardımcıları (doğrulama, intent eşleme, test, metrik).
 * Framework'süz → birim test edilebilir; gerçek NLU backend aynı şekilleri yansıtır.
 */
import type { AgentIntent, StudioAgent } from "./support.types";

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Token örtüşmesine göre en iyi eşleşen intent (yoksa null). */
export function matchAgentIntent(text: string, intents: AgentIntent[]): AgentIntent | null {
  const utter = new Set(tokens(text));
  let best: AgentIntent | null = null;
  let bestScore = 0;
  for (const intent of intents) {
    let score = 0;
    for (const phrase of intent.phrases) {
      const pt = tokens(phrase);
      if (pt.length > 0 && pt.every((t) => utter.has(t))) score += pt.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return best;
}

/** Yayın öncesi hazırlık kapısı — eksik gereksinim anahtarlarını döner. */
export function agentReady(agent: StudioAgent): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!agent.name.trim()) missing.push("name");
  if (!agent.goal.trim()) missing.push("goal");
  if (agent.channels.length === 0) missing.push("channels");
  if (agent.intents.length === 0) missing.push("intents");
  return { ok: missing.length === 0, missing };
}

/** Agent'ın bir ifadeye verdiği yanıtı simüle et. */
export function runAgentTest(
  agent: StudioAgent,
  utterance: string,
): { intentId?: string; reply: string; resolved: boolean } {
  const intent = matchAgentIntent(utterance, agent.intents);
  if (intent) return { intentId: intent.id, reply: intent.reply, resolved: true };
  // Yönlendirme: eşleşen intent yok → temsilciye devret, çözülmedi.
  return { reply: "Henüz emin değilim — sizi bir ekip arkadaşıma bağlıyorum.", resolved: false };
}

/** Otomatik-çözüm oranı 0..1 (çözülen ÷ çalıştırma). */
export function resolutionRate(agent: StudioAgent): number {
  if (agent.metrics.runs <= 0) return 0;
  return agent.metrics.resolved / agent.metrics.runs;
}
