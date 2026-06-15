// web/src/features/support/channels.dom.ts
/**
 * Kanal onboarding yardımcıları (Embedded Signup → Coexistence → canlı).
 * Coexistence, bir işletmenin numarayı mevcut WhatsApp Business uygulamasını
 * kaybetmeden Cloud API'ye taşımasını sağlar. Framework'süz → birim test edilebilir.
 */
import type { ChannelConnection, Inbox } from "./support.types";

export type OnboardingStepKey = "connect" | "verifying" | "migrating" | "live";

export interface OnboardingStep {
  /** Mevcut adım için i18n anahtar son eki. */
  step: OnboardingStepKey;
  /** İlerleme çubuğu için 0..1. */
  progress: number;
}

const STEP: Record<ChannelConnection, OnboardingStep> = {
  disconnected: { step: "connect", progress: 0 },
  pending: { step: "verifying", progress: 0.5 },
  coexistence: { step: "migrating", progress: 0.75 },
  connected: { step: "live", progress: 1 },
};

/** Bir bağlantı durumunu onboarding adımına + ilerlemeye eşle. */
export function channelOnboardingState(connection: ChannelConnection = "disconnected"): OnboardingStep {
  return STEP[connection];
}

/** Embedded Signup akışındaki sıralı durum geçişi (sonraki adım). */
export const NEXT_CONNECTION: Record<ChannelConnection, ChannelConnection> = {
  disconnected: "pending",
  pending: "coexistence",
  coexistence: "connected",
  connected: "connected",
};

/** Onboarding sihirbazında bir sonraki bağlantı durumu (canlıda kalır). */
export function advanceConnection(connection: ChannelConnection): ChannelConnection {
  return NEXT_CONNECTION[connection];
}

/**
 * Coexistence yalnızca Cloud API üzerindeki WhatsApp için, numara doğrulandıktan
 * (pending) ya da zaten coexistence/connected modunda çalışırken sunulur.
 */
export function canEnableCoexistence(inbox: Inbox): boolean {
  return (
    inbox.channelType === "whatsapp" &&
    inbox.provider === "cloud_api" &&
    inbox.connection !== "disconnected"
  );
}

/** Canlı olan (connected veya coexistence) inbox sayısı. */
export function connectedCount(inboxes: Inbox[]): number {
  return inboxes.filter((i) => i.connection === "connected" || i.connection === "coexistence").length;
}
