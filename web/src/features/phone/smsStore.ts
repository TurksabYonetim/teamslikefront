import { createStore, useStore } from "@/lib/createStore";
import { LINES, SMS_TEMPLATES, SMS_THREADS } from "./data";
import type { SmsMedia, SmsMessage, SmsTemplate, SmsThread, ScheduledSms } from "./phone.types";

/** Birincil hat — giden SMS'lerin "from"u (mock). */
const PRIMARY_LINE = LINES[0];

import { uid } from "@/lib/uid";

export interface SmsState {
  threads: SmsThread[];
  templates: SmsTemplate[];
  scheduled: ScheduledSms[];
  activeThreadId: string | null;

  selectThread: (id: string) => void;
  markThreadRead: (id: string) => void;
  sendMessage: (threadId: string, body: string, media?: SmsMedia[]) => void;
  scheduleSms: (threadId: string, body: string, at: number) => void;
  flushDue: (now: number) => void;
  resetStore: () => void;
}

const seed = () => ({
  threads: SMS_THREADS.map((t) => ({ ...t, messages: t.messages.map((m) => ({ ...m })) })),
  templates: SMS_TEMPLATES.map((t) => ({ ...t })),
  scheduled: [] as ScheduledSms[],
  activeThreadId: null as string | null,
});

export const smsStore = createStore<SmsState>((set, get) => {
  /** Bir thread'e giden mesaj ekleyen ortak yardımcı (immutable). */
  const appendOutbound = (threadId: string, body: string, media: SmsMedia[] | undefined) =>
    set((s) => ({
      threads: s.threads.map((th) =>
        th.id === threadId
          ? {
              ...th,
              messages: [
                ...th.messages,
                {
                  id: uid(),
                  threadId,
                  from: PRIMARY_LINE.e164,
                  to: th.e164,
                  body,
                  sentAt: Date.now(),
                  outbound: true,
                  ...(media && media.length ? { media } : {}),
                } satisfies SmsMessage,
              ],
            }
          : th,
      ),
    }));

  return {
    ...seed(),

    selectThread: (id) =>
      set((s) => ({
        activeThreadId: id,
        threads: s.threads.map((th) => (th.id === id ? { ...th, unread: 0 } : th)),
      })),

    markThreadRead: (id) =>
      set((s) => ({
        threads: s.threads.map((th) => (th.id === id ? { ...th, unread: 0 } : th)),
      })),

    sendMessage: (threadId, body, media) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      appendOutbound(threadId, trimmed, media);
    },

    scheduleSms: (threadId, body, at) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      set((s) => ({ scheduled: [...s.scheduled, { id: uid(), threadId, body: trimmed, at }] }));
    },

    flushDue: (now) => {
      const due = get().scheduled.filter((x) => x.at <= now);
      if (due.length === 0) return;
      for (const item of due) appendOutbound(item.threadId, item.body, undefined);
      set((s) => ({ scheduled: s.scheduled.filter((x) => x.at > now) }));
    },

    resetStore: () => set(seed()),
  };
});

/** React bağlama: sms store diliminden seçim. */
export const useSms = <U,>(selector: (s: SmsState) => U): U => useStore(smsStore, selector);
