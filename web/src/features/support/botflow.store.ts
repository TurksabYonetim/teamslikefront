// web/src/features/support/botflow.store.ts
/**
 * No-code bot akışı tasarımcısı için mock store — bağımlılıksız `createStore`.
 * Akışlar localStorage'da kalıcıdır; backend yoktur. Düğüm ekle/sil + kenar
 * temizleme tamamen UI akışıdır. Yürütme simülasyonu `botflow.dom.ts`'tedir.
 */
import { createStore, useStore } from "@/lib/createStore";
import { loadJson, saveJson } from "@/lib/persist";
import { SEED_FLOWS } from "./support.data";
import type { BotFlow, BotNodeKind } from "./support.types";

const STORAGE_KEY = "tl.support.botflow.v1";

let seq = 0;
const nid = () => `n_${Date.now()}_${seq++}`;

const DEFAULT_TEXT: Record<BotNodeKind, string> = {
  message: "Yeni mesaj",
  question: "Yeni soru",
  collect: "Bilgi topla",
  condition: "Yeni koşul",
  handoff: "Temsilciye devret",
  end: "Bitir",
};

const cloneFlow = (f: BotFlow): BotFlow => ({
  ...f,
  nodes: f.nodes.map((n) => ({ ...n, options: n.options?.map((o) => ({ ...o })), fields: n.fields?.map((x) => ({ ...x })) })),
});
const cloneFlows = (): BotFlow[] => SEED_FLOWS.map(cloneFlow);

interface PersistShape {
  flows: BotFlow[];
  activeFlowId: string;
}

function defaults(): PersistShape {
  return { flows: cloneFlows(), activeFlowId: SEED_FLOWS[0].id };
}

function load(): PersistShape {
  const parsed = loadJson<Partial<PersistShape> | null>(STORAGE_KEY, null);
  const d = defaults();
  if (!parsed) return d;
  const flows = Array.isArray(parsed.flows) && parsed.flows.length > 0 ? parsed.flows : d.flows;
  const activeFlowId = flows.some((f) => f.id === parsed.activeFlowId) ? parsed.activeFlowId! : flows[0].id;
  return { flows, activeFlowId };
}

function persist(s: PersistShape): void {
  saveJson(STORAGE_KEY, { flows: s.flows, activeFlowId: s.activeFlowId });
}

export interface BotflowState extends PersistShape {
  setActiveFlow: (id: string) => void;
  addNode: (kind: BotNodeKind) => void;
  removeNode: (id: string) => void;
  reset: () => void;
}

export const botflowStore = createStore<BotflowState>((set, get) => {
  const initial = load();

  const commit = (partial: Partial<PersistShape>) =>
    set((s) => {
      const next = { ...s, ...partial };
      persist(next);
      return partial;
    });

  const patchActive = (fn: (f: BotFlow) => BotFlow) => {
    const s = get();
    commit({ flows: s.flows.map((f) => (f.id === s.activeFlowId ? fn(f) : f)) });
  };

  return {
    ...initial,

    setActiveFlow: (id) => commit({ activeFlowId: id }),

    addNode: (kind) =>
      patchActive((f) => ({ ...f, nodes: [...f.nodes, { id: nid(), kind, text: DEFAULT_TEXT[kind] }] })),

    removeNode: (id) =>
      patchActive((f) => ({
        ...f,
        nodes: f.nodes
          .filter((n) => n.id !== id)
          .map((n) => ({
            ...n,
            next: n.next === id ? undefined : n.next,
            yes: n.yes === id ? undefined : n.yes,
            no: n.no === id ? undefined : n.no,
            options: n.options?.filter((o) => o.next !== id),
          })),
      })),

    reset: () => commit(defaults()),
  };
});

/** Aktif akışı seçen yardımcı (selector). */
export const activeFlow = (s: BotflowState): BotFlow => s.flows.find((f) => f.id === s.activeFlowId) ?? s.flows[0];

/** React bağlama. */
export function useBotflowStore<U>(selector: (s: BotflowState) => U): U {
  return useStore(botflowStore, selector);
}
