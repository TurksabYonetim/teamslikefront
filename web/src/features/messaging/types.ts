// web/src/features/messaging/types.ts
/** Mesajlaşma bounded context — yerel tipler (mock frontend). */
export type ChannelKind = "channel" | "private" | "shared" | "broadcast" | "dm";
export type MessagePriority = "normal" | "important" | "urgent";
export type ConversationStatus = "open" | "pending" | "resolved";
export type DeliveryStatus = "sending" | "sent" | "delivered" | "read";
export type MessageKind =
  | "text" | "voice" | "note" | "system" | "call" | "poll" | "file" | "sticker";
export type ChatFolder = "all" | "unread" | "dms" | "channels";
export type DisappearTimer = "off" | "24h" | "7d";
export type ConvPriority = "urgent" | "high" | "medium" | "low";

export interface FileAttachment {
  name: string;
  fileType: string;
  sizeKb: number;
  isImage?: boolean;
}

export interface PollOption { id: string; text: string; votes: string[] }
export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  multi?: boolean;
  anonymous?: boolean;
  quiz?: boolean;
  correctOptionId?: string;
  closed?: boolean;
}

export interface Channel {
  id: string;
  kind: ChannelKind;
  name: string;
  workspaceId?: string;
  unread?: number;
  dmUserId?: string;
  e2ee?: boolean;
  subscribers?: number;
  pinned?: boolean;
  muted?: boolean;
  isCustomer?: boolean;
  status?: ConversationStatus;
  label?: string;
  assigneeId?: string;
  priority?: ConvPriority;
  csat?: number;
  unreadManual?: boolean;
  disappearing?: DisappearTimer;
  archived?: boolean;
  memberIds?: string[];
  externalOrgs?: string[];
  /** Bu kanala bağlı devam eden toplantı (header bilgi çubuğu için). */
  ongoingMeetingId?: string;
}

export interface Topic { id: string; channelId: string; title: string }
export interface Reaction { emoji: string; userIds: string[] }

export interface Message {
  id: string;
  channelId: string;
  topicId: string;
  parentId: string | null;
  authorId: string;
  authorName?: string;
  body: string;
  bodyAlt?: string;
  tMinutes: number;
  reactions: Reaction[];
  kind?: MessageKind;
  status?: DeliveryStatus;
  edited?: boolean;
  deleted?: boolean;
  hiddenForMe?: boolean;
  pinned?: boolean;
  important?: boolean;
  priority?: MessagePriority;
  saved?: boolean;
  silent?: boolean;
  scheduled?: boolean;
  replyToId?: string | null;
  forwardedFrom?: string;
  voiceSec?: number;
  systemKey?: "e2ee";
  callMeetingId?: string;
  poll?: Poll;
  viewCount?: number;
  ephemeral?: boolean;
  file?: FileAttachment;
  sticker?: string;
  translating?: boolean;
  translated?: boolean;
}

export interface Story {
  id: string;
  authorId: string;
  kind: "text" | "image";
  text: string;
  mediaName?: string;
  seenBy: string[];
  tMinutes: number;
}
export interface Community { id: string; name: string; channelIds: string[] }

export const QUICK_REACTIONS = ["👍", "✅", "🎉", "❤️", "👀", "🔥"];
export const EMOJI_PALETTE = [
  "😀","😁","😂","🤣","😊","😍","😎","🤔","😉","🙂",
  "👍","👎","👏","🙌","🙏","💪","👀","🔥","✨","🎉",
  "❤️","🧡","💛","💚","💙","💜","✅","❌","⚠️","❓",
  "🚀","🌟","💡","📌","📎","📝","📣","⏰","☕","🍕",
];

/** Router'dan gelen başlangıç bölümü (eski messaging.mock'tan taşındı). */
export type Section = "inbox" | "dm" | "channels";
