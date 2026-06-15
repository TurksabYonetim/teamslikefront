import type {
  CaptureField,
  ReceptionistActionKind,
  ReceptionistConfig,
  ReceptionistIntent,
} from "./phone.types";

/**
 * Pür AI-resepsiyon yardımcıları (intent eşleştirme, greeting seçimi, capture).
 * Framework'ten bağımsız → birim test edilebilir.
 */

/** Küçük harf + noktalama temizliği → boş-olmayan token listesi (Unicode-aware). */
function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Çağıran ifadesini en iyi intent'e eşle (phrase token overlap). Bir phrase yalnızca
 * TÜM token'ları ifadede geçerse skorlanır; uzun phrase'ler daha ağır (token sayısı).
 * Beraberlik en erken intent'e çözülür. Hiç örtüşme yoksa null.
 */
export function matchIntent(text: string, intents: ReceptionistIntent[]): ReceptionistIntent | null {
  const utter = new Set(tokens(text));
  let best: ReceptionistIntent | null = null;
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

/** Açık/kapalı durumu için greeting. */
export function receptionistGreeting(config: ReceptionistConfig, withinHours: boolean): string {
  return withinHours ? config.greeting : config.afterHoursGreeting;
}

/** Eşleşen intent'in aksiyonunu çöz; yoksa config fallback'i. */
export function resolveAction(
  config: ReceptionistConfig,
  intent: ReceptionistIntent | null,
): ReceptionistActionKind {
  return intent ? intent.action : config.fallback;
}

/** Tüm zorunlu capture alanları dolu (ve boşluk değil) mu. */
export function captureComplete(
  required: CaptureField[],
  captured: { name?: string; phone?: string; reason?: string },
): boolean {
  return required.every((f) => Boolean(captured[f] && captured[f]!.trim()));
}

/**
 * Tanınan intent/aksiyon için demo yanıt metni. FAQ yanıtları intent'ten gelir;
 * yönlendirme aksiyonları kısa bir onay satırı alır. Mock canlı-oturum transkriptini
 * seed etmek için kullanılır (demo içerik; UI chrome i18n'lidir).
 */
export function receptionistReply(
  intent: ReceptionistIntent | null,
  action: ReceptionistActionKind,
): string {
  if (intent && action === "answer_faq" && intent.answer) return intent.answer;
  switch (action) {
    case "route_queue":
      return "Connecting you to the right team now.";
    case "route_extension":
      return "Transferring you to the extension.";
    case "book":
      return "I can book that — may I take your name and number?";
    case "voicemail":
      return "I'll take a message and the team will call you back.";
    case "human":
      return "Let me bring in a teammate to help.";
    case "answer_faq":
      return "Here's what I can share on that.";
    default:
      return "How can I help you today?";
  }
}
