// web/src/features/support/support.api.ts
import { CONVERSATIONS, KB_ARTICLES } from "./support.data";
import { searchKb } from "./support.dom";
import type { KbArticle } from "./support.types";

/**
 * Chatwoot-ACL FastAPI sözleşmesinin frontend-only mock'u. Gerçek transport'a
 * (httpClient/WebSocket) geçişte UI/store'lar değişmeden kalır; canlı güncellemeler
 * `conversation.*` WS olaylarıyla gelir (bkz. SupportEvent).
 */

/** Herhangi bir değeri simüle edilmiş ağ gecikmesiyle (varsayılan 150ms) çözer. */
export const delay = <T>(value: T, ms = 150): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/** GET /kb?q= — sorguya göre bilgi bankası makaleleri. */
export function searchKbRemote(q: string): Promise<KbArticle[]> {
  return delay(searchKb(KB_ARTICLES, q));
}

/**
 * POST /ai/suggest — Captain-tarzı taslak yanıt (insan onayından önce).
 * Son gelen (in) mesajın niyetine göre üç deterministik öneri üretir.
 */
export function aiSuggest(conversationId: string): Promise<string> {
  const conv = CONVERSATIONS.find((c) => c.id === conversationId);
  const lastIn = conv?.messages.filter((m) => m.direction === "in").at(-1);
  const text = lastIn?.body ?? "";
  const suggestion = /fatura|iade|ödeme|invoice|refund|billing|charge/i.test(text)
    ? "Faturanı inceledim ve şu an bir düzeltme uyguluyorum — kısa süre içinde e-posta ile onay alacaksın."
    : /hata|bozuk|500|error|broken|bug|crash|çöktü/i.test(text)
      ? "Bildirdiğin için teşekkürler — sorunu yeniden ürettim ve mühendislik ekibine ilettim. Düzeltilir düzeltilmez seni bilgilendireceğim."
      : "Bize ulaştığın için teşekkürler — yardımcı olmaktan memnuniyet duyarım. Sorunu hızlıca çözebilmem için biraz daha ayrıntı paylaşır mısın?";
  return delay(suggestion);
}
