import { createStore, useStore } from "@/lib/createStore";
import { LINES } from "./data";
import type {
  Call,
  CallDirection,
  CallEndReason,
  CallEvent,
  Disposition,
  MonitorMode,
} from "./phone.types";

/** Birincil hat — canlı çağrıların yereli (mock; gerçek hat seçimi Faz 4). */
const PRIMARY_LINE = LINES[0];

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

/** Sonlanmış, henüz /v1/call-logs'a yazılmamış çağrı (ActiveCallBar tüketir). */
export interface PendingLog {
  direction: CallDirection;
  peer_number: string;
  peer_name: string | null;
  duration_s: number;
  started_at: string;
}

/** Yanıtlanan çağrı bitince WrapUpCard'ın doldurması için bekleyen dispozisyon. */
export interface PendingDisposition {
  callId: string;
  peerNumber: string;
}

/** Sıcak (danışmalı) transfer için kurulan ikinci danışma çağrısı. */
export interface ConsultCall {
  peer: string;
  name: string | null;
  startedAt: number;
}

export interface CallStoreState {
  /** Tek canlı çağrı (ringing | active | hold). Boştayken null. */
  activeCall: Call | null;
  /** Park edilmiş çağrılar; pickup() ile geri alınır. */
  parked: Call[];
  /** Aktif çağrının yerel mikrofonu kapalı mı. */
  muted: boolean;
  /** Karşı tarafın görünen adı (caller-ID); persist + UI için. */
  peerName: string | null;
  /** API'ye POST bekleyen sonlanmış çağrı; yazıldıktan sonra null. */
  pendingLog: PendingLog | null;
  /** Engellenen numaralar (E.164). classifyCaller bunu kullanır. */
  blocklist: string[];
  /** Aktif süpervizör izleme modu (mock); yokken null. */
  monitor: MonitorMode | null;
  /** Yanıtlanan çağrı sonrası dispozisyon bekleyen (WrapUpCard tüketir). */
  pendingDisposition: PendingDisposition | null;
  /** Kaydedilen dispozisyonlar (mock log). */
  dispositions: Disposition[];
  /** Sıcak transfer için kurulan danışma çağrısı; yokken null. */
  consult: ConsultCall | null;
  /** Bekletilen çağrı için bekletme müziği çalıyor mu. */
  holdMusic: boolean;

  // --- aksiyonlar ---
  place: (to: string, name?: string) => void;
  simulateInbound: (from: string, name?: string) => void;
  answer: () => void;
  hold: () => void;
  resume: () => void;
  toggleMute: () => void;
  toggleRecording: () => void;
  sendDtmf: (digit: string) => void;
  addToCall: (number: string) => void;
  transfer: (target: string) => void;
  startConsult: (target: string, name?: string) => void;
  completeTransfer: () => void;
  mergeConsult: () => void;
  cancelConsult: () => void;
  toggleHoldMusic: () => void;
  park: () => void;
  pickup: (id: string) => void;
  decline: () => void;
  hangup: () => void;
  tick: () => void;
  applyEvent: (event: CallEvent) => void;
  clearPendingLog: () => void;
  blockNumber: (e164: string) => void;
  unblock: (e164: string) => void;
  setMonitor: (mode: MonitorMode) => void;
  stopMonitor: () => void;
  saveDisposition: (disposition: Disposition) => void;
  dismissWrapUp: () => void;
  resetStore: () => void;
}

const idle = () => ({
  activeCall: null as Call | null,
  parked: [] as Call[],
  muted: false,
  peerName: null as string | null,
  pendingLog: null as PendingLog | null,
  blocklist: [] as string[],
  monitor: null as MonitorMode | null,
  pendingDisposition: null as PendingDisposition | null,
  dispositions: [] as Disposition[],
  consult: null as ConsultCall | null,
  holdMusic: false,
});

export const callStore = createStore<CallStoreState>((set, get) => {
  /** Aktif çağrıyı sonlandırır: pendingLog üretir, canlı state'i temizler. */
  const finalize = (reason: CallEndReason) => {
    const s = get();
    const c = s.activeCall;
    if (!c) return;
    const peer = c.direction === "outbound" ? c.to : c.from;
    const apiDir: CallDirection =
      reason === "missed" || reason === "declined"
        ? "missed"
        : c.direction === "inbound"
          ? "inbound"
          : "outbound";
    set({
      activeCall: null,
      muted: false,
      consult: null,
      holdMusic: false,
      pendingLog: {
        direction: apiDir,
        peer_number: peer,
        peer_name: s.peerName,
        duration_s: apiDir === "missed" ? 0 : c.durationSec,
        started_at: new Date(c.startedAt).toISOString(),
      },
      pendingDisposition:
        reason === "completed" ? { callId: c.id, peerNumber: peer } : null,
    });
  };

  const start = (
    direction: "inbound" | "outbound",
    peer: string,
    name: string | undefined,
  ) => {
    // Tek canlı çağrı modeli: mevcut çağrı varken yenisi başlatılmaz (çağrı kaybını önler).
    if (get().activeCall) return;
    set({
      activeCall: {
        id: uid(),
        lineId: PRIMARY_LINE.id,
        direction,
        from: direction === "outbound" ? PRIMARY_LINE.e164 : peer,
        to: direction === "outbound" ? peer : PRIMARY_LINE.e164,
        state: "ringing",
        startedAt: Date.now(),
        durationSec: 0,
      },
      peerName: name ?? null,
      muted: false,
    });
  };

  return {
    ...idle(),

    place: (to, name) => start("outbound", to, name),
    simulateInbound: (from, name) => start("inbound", from, name),

    answer: () =>
      set((s) =>
        s.activeCall && s.activeCall.state === "ringing"
          ? {
              activeCall: {
                ...s.activeCall,
                state: "active",
                durationSec: 0,
                startedAt: Date.now(),
              },
            }
          : {},
      ),

    hold: () =>
      set((s) =>
        s.activeCall && s.activeCall.state === "active"
          ? { activeCall: { ...s.activeCall, state: "hold" } }
          : {},
      ),

    resume: () =>
      set((s) =>
        s.activeCall && s.activeCall.state === "hold"
          ? { activeCall: { ...s.activeCall, state: "active" } }
          : {},
      ),

    toggleMute: () => set((s) => (s.activeCall ? { muted: !s.muted } : {})),

    toggleRecording: () =>
      set((s) => {
        if (!s.activeCall) return {};
        const on = !s.activeCall.recording;
        return {
          activeCall: {
            ...s.activeCall,
            recording: on,
            recordingId: s.activeCall.recordingId ?? (on ? uid() : undefined),
          },
        };
      }),

    sendDtmf: (digit) =>
      set((s) =>
        s.activeCall
          ? { activeCall: { ...s.activeCall, dtmf: (s.activeCall.dtmf ?? "") + digit } }
          : {},
      ),

    addToCall: (number) =>
      set((s) =>
        s.activeCall
          ? {
              activeCall: {
                ...s.activeCall,
                participants: [...(s.activeCall.participants ?? []), number],
              },
            }
          : {},
      ),

    transfer: () => finalize("completed"),

    // Danışmalı (sıcak) transfer: aktif çağrıyı hold'a alıp ikinci bir danışma
    // çağrısı kurar. Operatör hedefle konuşur, sonra completeTransfer/merge/cancel.
    startConsult: (target, name) =>
      set((s) => {
        if (!s.activeCall || s.activeCall.state !== "active" || s.consult) return {};
        return {
          activeCall: { ...s.activeCall, state: "hold" },
          consult: { peer: target, name: name ?? null, startedAt: Date.now() },
        };
      }),

    // Danışma sonrası çağrıyı hedefe devret: çağrı operatör için sonlanır.
    completeTransfer: () => {
      if (!get().consult) return;
      finalize("completed");
    },

    // Danışmayı üçlü konferansa çevir: danışma katılımcı olur, çağrı active'e döner.
    mergeConsult: () =>
      set((s) => {
        if (!s.activeCall || !s.consult) return {};
        return {
          activeCall: {
            ...s.activeCall,
            state: "active",
            participants: [...(s.activeCall.participants ?? []), s.consult.peer],
          },
          consult: null,
        };
      }),

    // Danışmayı bırak: hedef çağrı kapanır, asıl çağrı active'e döner.
    cancelConsult: () =>
      set((s) =>
        s.consult && s.activeCall
          ? { consult: null, activeCall: { ...s.activeCall, state: "active" } }
          : s.consult
            ? { consult: null }
            : {},
      ),

    toggleHoldMusic: () => set((s) => (s.activeCall ? { holdMusic: !s.holdMusic } : {})),

    park: () =>
      set((s) =>
        s.activeCall
          ? {
              parked: [...s.parked, { ...s.activeCall, state: "hold" }],
              activeCall: null,
              muted: false,
            }
          : {},
      ),

    pickup: (id) =>
      set((s) => {
        if (s.activeCall) return {}; // aktif çağrı varken geri alınamaz
        const found = s.parked.find((c) => c.id === id);
        if (!found) return {};
        return {
          parked: s.parked.filter((c) => c.id !== id),
          activeCall: { ...found, state: "active" },
        };
      }),

    decline: () => finalize("declined"),

    hangup: () => {
      const c = get().activeCall;
      if (!c) return;
      const reason: CallEndReason =
        c.direction === "inbound" && c.state === "ringing" ? "missed" : "completed";
      finalize(reason);
    },

    tick: () =>
      set((s) =>
        s.activeCall && s.activeCall.state === "active"
          ? { activeCall: { ...s.activeCall, durationSec: s.activeCall.durationSec + 1 } }
          : {},
      ),

    applyEvent: (event) => {
      const s = get();
      switch (event.type) {
        case "call.placed":
          // Mevcut çağrı varken yeni çağrı kurulmaz — idempotency (aynı id) + tek-çağrı invariantı (farklı id).
          if (s.activeCall) return;
          set({ activeCall: { ...event.call }, peerName: null, muted: false });
          return;
        case "call.answered":
          if (s.activeCall?.id === event.callId && s.activeCall.state === "ringing")
            set({
              activeCall: {
                ...s.activeCall,
                state: "active",
                durationSec: 0,
                startedAt: Date.now(),
              },
            });
          return;
        case "call.ended":
          if (s.activeCall?.id === event.callId) finalize(event.reason);
          return;
        default:
          // call.routed / voicemail.left / sms.received — diğer store'lar (Faz 3+)
          return;
      }
    },

    clearPendingLog: () => set({ pendingLog: null }),

    blockNumber: (e164) =>
      set((s) => (s.blocklist.includes(e164) ? {} : { blocklist: [...s.blocklist, e164] })),

    unblock: (e164) => set((s) => ({ blocklist: s.blocklist.filter((b) => b !== e164) })),

    setMonitor: (mode) => set({ monitor: mode }),
    stopMonitor: () => set({ monitor: null }),

    saveDisposition: (disposition) =>
      set((s) => ({ dispositions: [...s.dispositions, disposition], pendingDisposition: null })),

    dismissWrapUp: () => set({ pendingDisposition: null }),

    resetStore: () => set(idle()),
  };
});

/** React bağlama: store diliminden seçim yap, değiştiğinde re-render ol. */
export const useCall = <U,>(selector: (s: CallStoreState) => U): U =>
  useStore(callStore, selector);
