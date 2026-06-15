import { createStore, useStore } from "@/lib/createStore";
import { RECEPTIONIST_CONFIG } from "./data";
import { matchIntent, receptionistReply, resolveAction } from "./receptionist";
import type { CaptureField, ReceptionistConfig, ReceptionistIntent, ReceptionistSession } from "./phone.types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

export interface ReceptionistState {
  config: ReceptionistConfig;
  session: ReceptionistSession;

  toggleEnabled: () => void;
  addIntent: (intent: ReceptionistIntent) => void;
  removeIntent: (id: string) => void;
  toggleCaptureField: (field: CaptureField) => void;
  ask: (text: string) => void;
  resetSession: () => void;
  resetStore: () => void;
}

const emptySession = (): ReceptionistSession => ({ turns: [], captured: {}, done: false });

const seed = () => ({
  config: clone(RECEPTIONIST_CONFIG) as ReceptionistConfig,
  session: emptySession(),
});

export const receptionistStore = createStore<ReceptionistState>((set) => ({
  ...seed(),

  toggleEnabled: () => set((s) => ({ config: { ...s.config, enabled: !s.config.enabled } })),

  addIntent: (intent) =>
    set((s) =>
      s.config.intents.some((i) => i.id === intent.id)
        ? {}
        : { config: { ...s.config, intents: [...s.config.intents, intent] } },
    ),

  removeIntent: (id) =>
    set((s) => ({ config: { ...s.config, intents: s.config.intents.filter((i) => i.id !== id) } })),

  toggleCaptureField: (field) =>
    set((s) => ({
      config: {
        ...s.config,
        captureFields: s.config.captureFields.includes(field)
          ? s.config.captureFields.filter((f) => f !== field)
          : [...s.config.captureFields, field],
      },
    })),

  ask: (text) =>
    set((s) => {
      const t = text.trim();
      if (!t) return {};
      const intent = matchIntent(t, s.config.intents);
      const action = resolveAction(s.config, intent);
      const reply = receptionistReply(intent, action);
      return {
        session: {
          ...s.session,
          turns: [
            ...s.session.turns,
            { id: uid(), who: "caller", text: t },
            { id: uid(), who: "ai", text: reply },
          ],
          detectedIntentId: intent?.id,
          action,
        },
      };
    }),

  resetSession: () => set({ session: emptySession() }),
  resetStore: () => set(seed()),
}));

export const useReceptionist = <U,>(selector: (s: ReceptionistState) => U): U =>
  useStore(receptionistStore, selector);
