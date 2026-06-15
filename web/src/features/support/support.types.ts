// web/src/features/support/support.types.ts
/**
 * Omnichannel Support (Chatwoot-style) bounded context — Inbox alt-projesi.
 * Birleşik agent inbox: live-chat / email / WhatsApp / IG / FB / Telegram / SMS.
 * Frontend-only mock; tipler WS sözleşmesini de modeller (`SupportEvent`).
 */

export type ChannelType = "livechat" | "email" | "whatsapp" | "instagram" | "facebook" | "telegram" | "sms";
export type ChannelConnection = "connected" | "coexistence" | "pending" | "disconnected";
export type ChannelProvider = "cloud_api" | "bsp" | "native";

export interface Inbox {
  id: string;
  channelType: ChannelType;
  name: string;
  connection?: ChannelConnection;
  provider?: ChannelProvider;
}

export type ConversationStatus = "open" | "pending" | "snoozed" | "resolved";
export type Priority = "urgent" | "high" | "medium" | "low" | "none";
export type AuthorType = "contact" | "agent" | "bot" | "note";
export type MessageDirection = "in" | "out";

export interface SupportAttachment {
  name: string;
  isImage?: boolean;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  authorType: AuthorType;
  authorId?: string;
  body: string;
  tMinutes: number; // dakika önce
  private?: boolean; // iç not
  attachments?: SupportAttachment[];
}

export interface Contact {
  id: string;
  name: string;
  identifiers: { email?: string; phone?: string; social?: string };
  attributes: Record<string, string>;
}

export interface Conversation {
  id: string;
  workspaceId?: string;
  inboxId: string;
  contactId: string;
  assigneeId?: string;
  status: ConversationStatus;
  priority: Priority;
  slaDueAt: number; // epoch ms
  labels: string[];
  unread: number;
  csat?: number; // 1..5
  messages: MessageItem[];
}

export interface Agent {
  id: string;
  name: string;
  available: boolean;
  skills?: string[];
}

export type MacroActionType = "reply" | "status" | "priority" | "label" | "assign";

export interface MacroAction {
  type: MacroActionType;
  value: string;
}

export interface Macro {
  id: string;
  name: string;
  actions: MacroAction[];
}

/** {{değişken}} placeholder'lı hazır yanıt, shortcode ile tetiklenir. */
export interface CannedResponse {
  id: string;
  shortcode: string; // örn. "/refund"
  body: string;
}

/** Bilgi bankası makalesi — ajanın konuşma içinde arayıp referans aldığı içerik. */
export interface KbArticle {
  id: string;
  title: string;
  body: string;
}

/* ─────────── Bot akışı (no-code görsel tasarımcı) ───────────────────────
 * Akış = tipli düğümlerden oluşan bir graf. `botflow.dom.ts` saf gezinme +
 * doğrulama motoru. `collect` düğümü WhatsApp Flow (sohbet-içi form) modeller.
 */

export type BotNodeKind = "message" | "question" | "collect" | "condition" | "handoff" | "end";

export interface BotOption {
  label: string;
  next: string; // hedef düğüm id
}

export interface BotField {
  id: string;
  label: string;
}

export interface BotNode {
  id: string;
  kind: BotNodeKind;
  text: string; // istem / mesaj / handoff etiketi
  next?: string; // message · collect · condition geçişi
  options?: BotOption[]; // question dalları
  fields?: BotField[]; // collect → WhatsApp Flow form alanları
  // condition: vars[variable] === equals ? yes : no
  variable?: string;
  equals?: string;
  yes?: string;
  no?: string;
}

export interface BotFlow {
  id: string;
  name: string;
  startId: string;
  nodes: BotNode[];
}

/* ─────────── Mesajlaşma maliyeti (rate-card motoru) ─────────────────────── */

export type MessageCategory = "marketing" | "utility" | "authentication" | "service";

/* ─────────── WFO / WEM (İşgücü Etkileşim Yönetimi) ──────────────────────
 * Tahmin → vardiya → uyum + kalite. Pure motor `wfo.dom.ts`.
 */

/** Bir gün-içi aralık: tahmini talep vs. vardiyadaki temsilci. */
export interface StaffingInterval {
  id: string;
  label: string; // "09:00"
  forecastVolume: number; // bu aralıkta beklenen iletişim
  required: number; // gereken temsilci (hesaplanan)
  scheduled: number; // vardiyadaki temsilci
}

export interface Shift {
  id: string;
  agentId: string;
  start: string; // "09:00"
  end: string; // "17:00"
}

/** Bir temsilci için program-uyum örneği. */
export interface AdherenceRow {
  agentId: string;
  scheduledMin: number;
  adherentMin: number; // gerçekten programda geçen dakika
}

/** Ağırlıklı kalite-skorkartı kriteri. */
export interface ScorecardCriterion {
  id: string;
  label: string;
  weight: number;
}

/** Tamamlanmış kalite değerlendirmesi (kriter başına 0..5 puan). */
export interface QaEvaluation {
  id: string;
  agentId: string;
  conversationId: string;
  scores: Record<string, number>;
}

/* ─────────── AI Agent Studio (no-code agent tasarımcı) ──────────────────
 * Tasarla → temellendir → test et → yayınla. Pure motor `studio.dom.ts`.
 */

export type AgentChannel = "webchat" | "whatsapp" | "voice" | "email";
export type StudioAgentStatus = "draft" | "testing" | "published";

export interface AgentKnowledge {
  id: string;
  label: string;
  kind: "kb" | "url" | "file";
}

/** Agent'ın çağırabileceğği backend aksiyonu (mock). */
export interface AgentTool {
  id: string;
  label: string;
  enabled: boolean;
}

export interface AgentIntent {
  id: string;
  label: string;
  phrases: string[];
  reply: string;
}

export interface StudioAgent {
  id: string;
  name: string;
  /** Doğal dil hedef/talimat. */
  goal: string;
  channels: AgentChannel[];
  status: StudioAgentStatus;
  knowledge: AgentKnowledge[];
  tools: AgentTool[];
  intents: AgentIntent[];
  /** Mock gözlemlenebilirlik sayaçları. */
  metrics: { runs: number; resolved: number };
}

/** Studio test kumbarasında tek tur. */
export interface AgentTestTurn {
  id: string;
  who: "user" | "agent";
  text: string;
  intentId?: string;
}

/** Tipli domain olayları = WS sözleşmesi (`conversation.*`) + yan kanallar. */
export type SupportEvent =
  | { type: "conversation.opened"; conversation: Conversation }
  | { type: "conversation.assigned"; conversationId: string; assigneeId: string }
  | { type: "conversation.resolved"; conversationId: string }
  | { type: "message.received"; message: MessageItem }
  | { type: "ai.suggestion"; conversationId: string; text: string }
  | { type: "csat.submitted"; conversationId: string; rating: number };
