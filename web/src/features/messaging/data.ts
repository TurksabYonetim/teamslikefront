// web/src/features/messaging/data.ts
import type { Channel, Message, Topic } from "./types";

/** Mock seed — Slack/Teams/WhatsApp/Telegram/Chatwoot benzeri native sohbetler. */
export const CHANNELS: Channel[] = [
  { id: "ch_product", kind: "channel", name: "product", unread: 3, pinned: true, workspaceId: "ws_core", ongoingMeetingId: "mtg_product" },
  { id: "ch_eng", kind: "channel", name: "engineering", unread: 1, workspaceId: "ws_core" },
  { id: "ch_design", kind: "private", name: "design-private", workspaceId: "ws_core" },
  { id: "ch_announce", kind: "broadcast", name: "announcements", subscribers: 1240, muted: true, workspaceId: "ws_growth" },
  { id: "ch_growth", kind: "channel", name: "growth", workspaceId: "ws_growth" },
  { id: "dm_defne", kind: "dm", name: "Defne Yıldız", dmUserId: "usr_2", unread: 1, e2ee: true },
  { id: "dm_marco", kind: "dm", name: "Marco Rossi", dmUserId: "usr_3", e2ee: true },
  { id: "dm_priya", kind: "dm", name: "Priya N.", dmUserId: "usr_4", e2ee: true },
  {
    id: "dm_jordan", kind: "dm", name: "Jordan Blake", dmUserId: "usr_5",
    isCustomer: true, status: "open", label: "billing", assigneeId: "usr_1",
    priority: "high", unread: 2,
  },
];

export const TOPICS: Topic[] = [
  { id: "tp_product", channelId: "ch_product", title: "general" },
  { id: "tp_eng", channelId: "ch_eng", title: "general" },
  { id: "tp_design", channelId: "ch_design", title: "general" },
  { id: "tp_announce", channelId: "ch_announce", title: "general" },
  { id: "tp_growth", channelId: "ch_growth", title: "general" },
  { id: "tp_defne", channelId: "dm_defne", title: "main" },
  { id: "tp_marco", channelId: "dm_marco", title: "main" },
  { id: "tp_priya", channelId: "dm_priya", title: "main" },
  { id: "tp_jordan", channelId: "dm_jordan", title: "main" },
];

/** Hazır yanıtlar — composer'daki şimşek menüsü için (i18n anahtarlarına bağlı). */
export interface CannedResponse {
  id: string;
  titleKey: string;
  bodyKey: string;
}
export const CANNED: CannedResponse[] = [
  { id: "greeting", titleKey: "canned.greeting.title", bodyKey: "canned.greeting.body" },
  { id: "ack", titleKey: "canned.ack.title", bodyKey: "canned.ack.body" },
  { id: "resolved", titleKey: "canned.resolved.title", bodyKey: "canned.resolved.body" },
  { id: "followUp", titleKey: "canned.followUp.title", bodyKey: "canned.followUp.body" },
];

const r = () => [] as Message["reactions"];
export const MESSAGES: Message[] = [
  { id: "m1", channelId: "ch_product", topicId: "tp_product", parentId: null, authorId: "usr_2", body: "Sprint planını **bugün** kapatalım mı?", tMinutes: 120, reactions: [{ emoji: "👍", userIds: ["usr_1", "usr_3"] }] },
  { id: "m2", channelId: "ch_product", topicId: "tp_product", parentId: null, authorId: "usr_1", body: "Evet, 15:00'te toparlarım. `release-notes` taslağı hazır.", tMinutes: 116, reactions: r(), status: "read" },
  { id: "m3", channelId: "ch_product", topicId: "tp_product", parentId: null, authorId: "usr_3", body: "Bir bağlantı: https://teamslike.dev/changelog", tMinutes: 40, reactions: r() },
  { id: "m4", channelId: "dm_defne", topicId: "tp_defne", parentId: null, authorId: "usr_2", body: "Görüşmeye 5 dk geç kalacağım 🙏", tMinutes: 12, reactions: r() },
  { id: "m5", channelId: "dm_defne", topicId: "tp_defne", parentId: null, authorId: "usr_1", body: "Sorun değil!", tMinutes: 10, reactions: r(), status: "delivered" },
  { id: "m6", channelId: "dm_jordan", topicId: "tp_jordan", parentId: null, authorId: "usr_5", body: "Faturada bir hata görüyorum, yardımcı olur musunuz?", tMinutes: 30, reactions: r() },
];
