// web/src/features/support/messagingCost.dom.ts
/**
 * WhatsApp / iş-mesajlaşma maliyet motoru (Chatwoot-sınıfı omnichannel parite).
 * Konuşma-penceresi + kategori-başına rate card modelleyerek UI'nin öngörülebilir
 * bir fatura göstermesini sağlar — çözüm-başına AI fiyatlandırmasına karşı fark.
 * Framework'süz → birim test edilebilir; backend aynısını hesaplar.
 *
 * Oranlar Meta TR rate card (2026-04-01, USD) örneğidir; BSP markup'ı backend'de
 * üstüne eklenir. Buradaki sayılar açıklayıcı seed veridir.
 */
import type { MessageCategory } from "./support.types";
export type { MessageCategory } from "./support.types";

/** Müşteri-hizmet penceresi: 24s, her gelen müşteri mesajıyla yeniden açılır. */
export const CSW_MIN = 24 * 60;
/** Ücretsiz giriş-noktası penceresi (click-to-WhatsApp reklam / FB): 72s. */
export const FREE_ENTRY_MIN = 72 * 60;

export interface WindowState {
  open: boolean;
  remainingMin: number;
}

/** 24s hizmet penceresi hâlâ açık mı, ne kadar kaldı? */
export function windowState(lastInboundMin: number, nowMin: number, windowMin = CSW_MIN): WindowState {
  const elapsed = Math.max(0, nowMin - lastInboundMin);
  const remainingMin = Math.max(0, windowMin - elapsed);
  return { open: remainingMin > 0, remainingMin };
}

export interface BillingContext {
  category: MessageCategory;
  withinWindow: boolean; // 24s CSW içinde mi
  freeEntryPoint?: boolean; // 72s ücretsiz giriş penceresi içinde mi
}

/**
 * Giden mesaj faturalandırılabilir mi?
 * - ücretsiz giriş noktası → her zaman ücretsiz
 * - service (serbest biçim) → yalnızca pencere içinde geçerli, orada ücretsiz
 * - utility → pencere içinde ücretsiz (TR Nis-2026 kuralı), dışında faturalı
 * - marketing / authentication → her zaman faturalı
 */
export function messageBillable(ctx: BillingContext): boolean {
  if (ctx.freeEntryPoint) return false;
  switch (ctx.category) {
    case "service":
      return false;
    case "utility":
      return !ctx.withinWindow;
    case "marketing":
    case "authentication":
      return true;
  }
}

/** Bölgeye göre mesaj-kategori oranları (USD). */
export const RATE_CARD: Record<string, Record<MessageCategory, number>> = {
  TR: { marketing: 0.0109, utility: 0.0009, authentication: 0.0009, service: 0 },
  US: { marketing: 0.025, utility: 0.004, authentication: 0.0135, service: 0 },
  DE: { marketing: 0.0768, utility: 0.04, authentication: 0.0768, service: 0 },
  default: { marketing: 0.02, utility: 0.003, authentication: 0.01, service: 0 },
};

export type VolumeTier = "standard" | "growth" | "scale";

/** Hacim-kademesi indirim çarpanı (daha çok hacim → mesaj başına daha ucuz). */
export function volumeTier(monthlyVolume: number): { tier: VolumeTier; multiplier: number } {
  if (monthlyVolume >= 1_000_000) return { tier: "scale", multiplier: 0.8 };
  if (monthlyVolume >= 250_000) return { tier: "growth", multiplier: 0.9 };
  return { tier: "standard", multiplier: 1 };
}

const rateFor = (region: string, category: MessageCategory): number =>
  (RATE_CARD[region] ?? RATE_CARD.default)[category];

/** Bir mesajın maliyeti (USD, 4 ondalık); faturalı değilse 0. */
export function messageCost(ctx: BillingContext, region = "TR", monthlyVolume = 0): number {
  if (!messageBillable(ctx)) return 0;
  const base = rateFor(region, ctx.category);
  const { multiplier } = volumeTier(monthlyVolume);
  return Math.round(base * multiplier * 10_000) / 10_000;
}

/** Bir aylık harcama tahmini; hacim kademesi mesaj sayısından türetilir. */
export function monthlyEstimate(messages: BillingContext[], region = "TR"): number {
  const volume = messages.length;
  const total = messages.reduce((sum, m) => sum + messageCost(m, region, volume), 0);
  return Math.round(total * 100) / 100;
}

/** Kategori bazlı harcama dökümü (USD, 2 ondalık). */
export function categoryBreakdown(messages: BillingContext[], region = "TR"): Record<MessageCategory, number> {
  const volume = messages.length;
  const out: Record<MessageCategory, number> = { marketing: 0, utility: 0, authentication: 0, service: 0 };
  for (const m of messages) out[m.category] += messageCost(m, region, volume);
  for (const k of Object.keys(out) as MessageCategory[]) out[k] = Math.round(out[k] * 100) / 100;
  return out;
}
