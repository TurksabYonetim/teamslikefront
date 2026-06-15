// web/src/features/messaging/store.ts
import { createStore, useStore } from "@/lib/createStore";
import { CHANNELS, MESSAGES, TOPICS } from "./data";
import { memberName } from "./members";
import type {
  Channel, ChannelKind, ChatFolder, ConvPriority, ConversationStatus,
  DisappearTimer, FileAttachment, Message, MessagePriority, Poll, Topic,
} from "./types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const firstTopicOf = (topics: Topic[], channelId: string) =>
  topics.find((t) => t.channelId === channelId)?.id ?? "";

export interface MessagingState {
  channels: Channel[];
  topics: Topic[];
  messages: Message[];
  activeChannelId: string;
  activeTopicId: string;
  threadRootId: string | null;
  detailsOpen: boolean;
  paletteOpen: boolean;
  search: string;
  savedOnly: boolean;
  folder: ChatFolder;
  replyTargetId: string | null;
  draftsByTopic: Record<string, string>;

  // navigasyon
  setChannel: (id: string) => void;
  setTopic: (id: string) => void;
  openThread: (id: string) => void;
  closeThread: () => void;
  setSearch: (q: string) => void;
  toggleSavedOnly: () => void;
  setFolder: (f: ChatFolder) => void;
  setReplyTarget: (id: string | null) => void;
  setDraft: (topicId: string, text: string) => void;
  toggleDetails: () => void;
  togglePalette: (open?: boolean) => void;

  // gönderim
  send: (text: string, authorId: string, replyToId?: string | null, silent?: boolean) => void;
  reply: (parentId: string, text: string, authorId: string) => void;
  sendNote: (text: string, authorId: string) => void;
  sendVoice: (seconds: number, authorId: string) => void;
  sendFile: (file: FileAttachment, authorId: string) => void;
  sendSticker: (sticker: string, authorId: string) => void;
  scheduleMessage: (text: string, authorId: string) => void;
  sendScheduledNow: (id: string) => void;
  deleteScheduled: (id: string) => void;
  postCall: (args: { kind: "call"; meetingId: string }) => void;

  // mesaj işlemleri
  editMessage: (id: string, text: string) => void;
  deleteForEveryone: (id: string) => void;
  deleteForMe: (id: string) => void;
  restoreForMe: (id: string) => void;
  togglePin: (id: string) => void;
  toggleSave: (id: string) => void;
  toggleImportant: (id: string) => void;
  setMessagePriority: (id: string, priority: MessagePriority) => void;
  forward: (id: string, toChannelId: string) => void;
  toggleReaction: (messageId: string, emoji: string, userId: string) => void;

  // sohbet işlemleri
  togglePinChat: (id: string) => void;
  toggleMuteChat: (id: string) => void;
  toggleMarkUnread: (id: string) => void;
  setStatus: (channelId: string, status: ConversationStatus) => void;
  setPriority: (channelId: string, priority: ConvPriority) => void;
  setDisappearing: (channelId: string, mode: DisappearTimer) => void;
  archiveChannel: (id: string) => void;
  createChannel: (name: string, kind: ChannelKind) => void;
  createDm: (memberIds: string[]) => void;

  // anket
  createPoll: (question: string, options: string[], opts: { multi?: boolean; anonymous?: boolean; quiz?: boolean; correctIndex?: number }, authorId: string) => void;
  vote: (messageId: string, optionId: string, userId: string) => void;
  closePoll: (messageId: string) => void;

  // çeviri & CSAT
  translate: (messageId: string) => void;
  submitCsat: (channelId: string, rating: number) => void;

  // harici entegrasyon
  postExternal: (channelId: string, topicId: string, text: string, authorId: string) => void;

  // test izolasyonu
  resetStore: () => void;
}

const DEFAULT_CHANNEL = CHANNELS[0].id;
const seed = () => ({
  channels: CHANNELS.map((c) => ({ ...c })),
  topics: TOPICS.map((t) => ({ ...t })),
  messages: MESSAGES.map((m) => ({ ...m })),
  activeChannelId: DEFAULT_CHANNEL,
  activeTopicId: firstTopicOf(TOPICS, DEFAULT_CHANNEL),
  threadRootId: null as string | null,
  detailsOpen: false,
  paletteOpen: false,
  search: "",
  savedOnly: false,
  folder: "all" as ChatFolder,
  replyTargetId: null as string | null,
  draftsByTopic: {} as Record<string, string>,
});

export const messagingStore = createStore<MessagingState>((set, get) => {
  const patch = (id: string, fn: (m: Message) => Message) =>
    set((s) => ({ messages: s.messages.map((m) => (m.id === id ? fn(m) : m)) }));

  const progressDelivery = (id: string) => {
    setTimeout(() => patch(id, (m) => ({ ...m, status: "sent" })), 600);
    setTimeout(() => patch(id, (m) => ({ ...m, status: "delivered" })), 1300);
    setTimeout(() => patch(id, (m) => ({ ...m, status: "read" })), 2600);
  };

  return {
    ...seed(),

    setChannel: (id) =>
      set((s) => ({
        activeChannelId: id,
        activeTopicId: firstTopicOf(s.topics, id),
        threadRootId: null,
        search: "",
        replyTargetId: null,
        channels: s.channels.map((c) => (c.id === id ? { ...c, unread: 0, unreadManual: false } : c)),
      })),
    setTopic: (id) => set({ activeTopicId: id, threadRootId: null, replyTargetId: null }),
    openThread: (id) => set({ threadRootId: id }),
    closeThread: () => set({ threadRootId: null }),
    setSearch: (q) => set({ search: q }),
    toggleSavedOnly: () => set((s) => ({ savedOnly: !s.savedOnly })),
    setFolder: (folder) => set({ folder }),
    setReplyTarget: (id) => set({ replyTargetId: id }),
    setDraft: (topicId, text) => set((s) => ({ draftsByTopic: { ...s.draftsByTopic, [topicId]: text } })),
    toggleDetails: () => set((s) => ({ detailsOpen: !s.detailsOpen })),
    togglePalette: (open) =>
      set((s) => ({ paletteOpen: typeof open === "boolean" ? open : !s.paletteOpen })),

    send: (text, authorId, replyToId = null, silent = false) => {
      const { activeChannelId, activeTopicId } = get();
      const ch = get().channels.find((c) => c.id === activeChannelId);
      const ephemeral = !!ch?.disappearing && ch.disappearing !== "off";
      const id = uid();
      const msg: Message = {
        id, channelId: activeChannelId, topicId: activeTopicId, parentId: null,
        authorId, body: text, tMinutes: 0, reactions: [], status: "sending",
        replyToId: replyToId ?? null, silent: silent || undefined, ephemeral: ephemeral || undefined,
      };
      set((s) => ({
        messages: [...s.messages, msg],
        replyTargetId: null,
        draftsByTopic: { ...s.draftsByTopic, [activeTopicId]: "" },
      }));
      progressDelivery(id);
    },

    sendNote: (text, authorId) => {
      const { activeChannelId, activeTopicId } = get();
      set((s) => ({ messages: [...s.messages, { id: uid(), channelId: activeChannelId, topicId: activeTopicId, parentId: null, authorId, body: text, tMinutes: 0, reactions: [], kind: "note" }] }));
    },
    sendVoice: (seconds, authorId) => {
      const { activeChannelId, activeTopicId } = get();
      const id = uid();
      set((s) => ({ messages: [...s.messages, { id, channelId: activeChannelId, topicId: activeTopicId, parentId: null, authorId, body: "", tMinutes: 0, reactions: [], kind: "voice", voiceSec: seconds, status: "sending" }] }));
      progressDelivery(id);
    },
    sendFile: (file, authorId) => {
      const { activeChannelId, activeTopicId } = get();
      const id = uid();
      set((s) => ({ messages: [...s.messages, { id, channelId: activeChannelId, topicId: activeTopicId, parentId: null, authorId, body: file.name, tMinutes: 0, reactions: [], kind: "file", file, status: "sending" }] }));
      progressDelivery(id);
    },
    sendSticker: (sticker, authorId) => {
      const { activeChannelId, activeTopicId } = get();
      const id = uid();
      set((s) => ({ messages: [...s.messages, { id, channelId: activeChannelId, topicId: activeTopicId, parentId: null, authorId, body: "", tMinutes: 0, reactions: [], kind: "sticker", sticker, status: "sending" }] }));
      progressDelivery(id);
    },
    scheduleMessage: (text, authorId) => {
      const { activeChannelId, activeTopicId } = get();
      set((s) => ({ messages: [...s.messages, { id: uid(), channelId: activeChannelId, topicId: activeTopicId, parentId: null, authorId, body: text, tMinutes: 0, reactions: [], scheduled: true }] }));
    },
    sendScheduledNow: (id) => {
      patch(id, (m) => ({ ...m, scheduled: false, status: "sending", tMinutes: 0 }));
      progressDelivery(id);
    },
    deleteScheduled: (id) => set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),

    postCall: ({ meetingId }) => {
      const { activeChannelId, activeTopicId } = get();
      set((s) => ({
        messages: [
          ...s.messages,
          {
            id: uid(), channelId: activeChannelId, topicId: activeTopicId, parentId: null,
            authorId: "usr_1", body: "", tMinutes: 0, reactions: [], kind: "call", callMeetingId: meetingId,
          },
        ],
      }));
    },

    reply: (parentId, text, authorId) => {
      const root = get().messages.find((m) => m.id === parentId);
      if (!root) return;
      const id = uid();
      set((s) => ({
        messages: [...s.messages, { id, channelId: root.channelId, topicId: root.topicId, parentId, authorId, body: text, tMinutes: 0, reactions: [], status: "sending" }],
      }));
      progressDelivery(id);
    },

    editMessage: (id, text) => patch(id, (m) => ({ ...m, body: text, edited: true })),
    deleteForEveryone: (id) => patch(id, (m) => ({ ...m, deleted: true, body: "", reactions: [] })),
    deleteForMe: (id) => patch(id, (m) => ({ ...m, hiddenForMe: true })),
    restoreForMe: (id) => patch(id, (m) => ({ ...m, hiddenForMe: false })),
    togglePin: (id) => patch(id, (m) => ({ ...m, pinned: !m.pinned })),
    toggleSave: (id) => patch(id, (m) => ({ ...m, saved: !m.saved })),
    toggleImportant: (id) => patch(id, (m) => ({ ...m, important: !m.important })),
    setMessagePriority: (id, priority) => patch(id, (m) => ({ ...m, priority })),

    forward: (id, toChannelId) => {
      const src = get().messages.find((m) => m.id === id);
      if (!src) return;
      const srcCh = get().channels.find((c) => c.id === src.channelId);
      const from = srcCh?.kind === "dm" ? srcCh.name : `#${srcCh?.name ?? ""}`;
      const newId = uid();
      set((s) => ({
        messages: [...s.messages, { id: newId, channelId: toChannelId, topicId: firstTopicOf(get().topics, toChannelId), parentId: null, authorId: "usr_1", body: src.body, bodyAlt: src.bodyAlt, tMinutes: 0, reactions: [], status: "sending", forwardedFrom: from }],
      }));
      progressDelivery(newId);
    },

    toggleReaction: (messageId, emoji, userId) =>
      set((s) => ({
        messages: s.messages.map((m) => {
          if (m.id !== messageId) return m;
          const existing = m.reactions.find((r) => r.emoji === emoji);
          let reactions = m.reactions;
          if (!existing) reactions = [...m.reactions, { emoji, userIds: [userId] }];
          else if (existing.userIds.includes(userId))
            reactions = m.reactions
              .map((r) => (r.emoji === emoji ? { ...r, userIds: r.userIds.filter((u) => u !== userId) } : r))
              .filter((r) => r.userIds.length > 0);
          else reactions = m.reactions.map((r) => (r.emoji === emoji ? { ...r, userIds: [...r.userIds, userId] } : r));
          return { ...m, reactions };
        }),
      })),

    togglePinChat: (id) => set((s) => ({ channels: s.channels.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)) })),
    toggleMuteChat: (id) => set((s) => ({ channels: s.channels.map((c) => (c.id === id ? { ...c, muted: !c.muted } : c)) })),
    toggleMarkUnread: (id) =>
      set((s) => ({
        channels: s.channels.map((c) =>
          c.id === id ? { ...c, unreadManual: !c.unreadManual, unread: !c.unreadManual ? c.unread || 1 : 0 } : c,
        ),
      })),
    setStatus: (channelId, status) => set((s) => ({ channels: s.channels.map((c) => (c.id === channelId ? { ...c, status } : c)) })),
    setPriority: (channelId, priority) => set((s) => ({ channels: s.channels.map((c) => (c.id === channelId ? { ...c, priority } : c)) })),
    setDisappearing: (channelId, mode) => set((s) => ({ channels: s.channels.map((c) => (c.id === channelId ? { ...c, disappearing: mode } : c)) })),
    archiveChannel: (id) => set((s) => ({ channels: s.channels.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c)) })),

    createChannel: (name, kind) => {
      const id = `ch_${uid()}`;
      const topicId = `tp_${id}`;
      set((s) => ({
        channels: [...s.channels, { id, kind, name }],
        topics: [...s.topics, { id: topicId, channelId: id, title: "general" }],
        activeChannelId: id, activeTopicId: topicId, threadRootId: null, search: "", replyTargetId: null, folder: "all",
      }));
    },

    createDm: (memberIds) => {
      const id = `dm_${uid()}`;
      const topicId = `tp_${id}`;
      const names = memberIds.map(memberName);
      const name =
        memberIds.length === 1
          ? names[0]
          : `${names.slice(0, 2).join(", ")}${memberIds.length > 2 ? ` +${memberIds.length - 2}` : ""}`;
      set((s) => ({
        channels: [
          ...s.channels,
          { id, kind: "dm", name, dmUserId: memberIds.length === 1 ? memberIds[0] : undefined, memberIds, e2ee: true },
        ],
        topics: [...s.topics, { id: topicId, channelId: id, title: "main" }],
        activeChannelId: id,
        activeTopicId: topicId,
        threadRootId: null,
        search: "",
        replyTargetId: null,
        folder: "all",
      }));
    },

    createPoll: (question, options, opts, authorId) => {
      const { activeChannelId, activeTopicId } = get();
      const poll: Poll = {
        id: uid(),
        question,
        options: options.filter((o) => o.trim()).map((text, i) => ({ id: `o${i}`, text, votes: [] })),
        multi: opts.multi, anonymous: opts.anonymous, quiz: opts.quiz,
        correctOptionId: opts.quiz && opts.correctIndex != null ? `o${opts.correctIndex}` : undefined,
      };
      set((s) => ({
        messages: [...s.messages, { id: uid(), channelId: activeChannelId, topicId: activeTopicId, parentId: null, authorId, body: "", tMinutes: 0, reactions: [], kind: "poll", poll }],
      }));
    },
    vote: (messageId, optionId, userId) =>
      set((s) => ({
        messages: s.messages.map((m) => {
          if (m.id !== messageId || !m.poll || m.poll.closed) return m;
          const multi = m.poll.multi;
          const optionsArr = m.poll.options.map((o) => {
            if (o.id === optionId) {
              const has = o.votes.includes(userId);
              return { ...o, votes: has ? o.votes.filter((u) => u !== userId) : [...o.votes, userId] };
            }
            if (!multi) return { ...o, votes: o.votes.filter((u) => u !== userId) };
            return o;
          });
          return { ...m, poll: { ...m.poll, options: optionsArr } };
        }),
      })),
    closePoll: (messageId) =>
      set((s) => ({ messages: s.messages.map((m) => (m.id === messageId && m.poll ? { ...m, poll: { ...m.poll, closed: true } } : m)) })),

    translate: (messageId) => {
      patch(messageId, (m) => ({ ...m, translating: true }));
      setTimeout(
        () =>
          patch(messageId, (m) => ({
            ...m,
            translating: false,
            translated: true,
            bodyAlt: m.bodyAlt ?? `(translated) ${m.body}`,
          })),
        450,
      );
    },
    submitCsat: (channelId, rating) =>
      set((s) => ({ channels: s.channels.map((c) => (c.id === channelId ? { ...c, csat: rating, status: "resolved" } : c)) })),

    postExternal: (channelId, topicId, text, authorId) => {
      if (!text.trim()) return;
      const id = uid();
      set((s) => ({ messages: [...s.messages, { id, channelId, topicId, parentId: null, authorId, body: text, tMinutes: 0, reactions: [], status: "sending" }] }));
      progressDelivery(id);
    },

    resetStore: () => set(() => seed()),
  };
});

/** React bağlama kısayolu. */
export const useMessaging = <U,>(selector: (s: MessagingState) => U): U => useStore(messagingStore, selector);
