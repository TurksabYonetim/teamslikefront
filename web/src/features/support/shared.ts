// web/src/features/support/shared.ts
import { AGENTS, CONTACTS } from "./support.data";
import type { BotNodeKind, ChannelConnection, ChannelType, Priority } from "./support.types";

export const contactName = (id: string): string => CONTACTS.find((c) => c.id === id)?.name ?? id;

/** Opsiyonel agent ID → ad; ID yoksa undefined, eşleşme yoksa ham ID. */
export const agentName = (id?: string): string | undefined =>
  id ? (AGENTS.find((a) => a.id === id)?.name ?? id) : undefined;

/** Kanal → Icon registry adı (Heroicons'ta marka glifi yok; semantik eşleme). */
export const CHANNEL_ICON: Record<ChannelType, string> = {
  livechat: "chat",
  email: "envelope",
  whatsapp: "phone",
  instagram: "photo",
  facebook: "globe",
  telegram: "send",
  sms: "message",
};

export type SupportBadgeTone = "neutral" | "accent" | "positive" | "warning" | "danger";

/** Öncelik → Badge tonu. */
export const PRIORITY_TONE: Record<Priority, SupportBadgeTone> = {
  urgent: "danger",
  high: "warning",
  medium: "accent",
  low: "neutral",
  none: "neutral",
};

/** Kanal bağlantı durumu → Badge tonu (onboarding adımı renklendirme). */
export const CONNECTION_TONE: Record<ChannelConnection, SupportBadgeTone> = {
  connected: "positive",
  coexistence: "accent",
  pending: "warning",
  disconnected: "neutral",
};

/** Bot düğüm türü → Icon registry adı. */
export const NODE_ICON: Record<BotNodeKind, string> = {
  message: "chat",
  question: "question",
  collect: "clipboard",
  condition: "sliders",
  handoff: "userPlus",
  end: "flag",
};
