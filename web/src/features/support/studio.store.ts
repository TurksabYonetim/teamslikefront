// web/src/features/support/studio.store.ts
/**
 * AI Agent Studio mock store — bağımlılıksız `createStore`. Agent CRUD, intent
 * yönetimi ve sandbox test günlüğü. Agent tanımları localStorage'da kalıcıdır
 * (geçici test günlüğü hariç); backend yoktur. Yanıt simülasyonu `studio.dom.ts`.
 */
import { createStore, useStore } from "@/lib/createStore";
import { STUDIO_AGENTS } from "./support.data";
import { runAgentTest } from "./studio.dom";
import type { AgentChannel, AgentIntent, AgentTestTurn, StudioAgent } from "./support.types";

const STORAGE_KEY = "tl.support.studio.v1";

let turnSeq = 0;
let intentSeq = 0;
let agentSeq = 0;

const cloneAgent = (a: StudioAgent): StudioAgent => ({
  ...a,
  channels: [...a.channels],
  knowledge: a.knowledge.map((k) => ({ ...k })),
  tools: a.tools.map((t) => ({ ...t })),
  intents: a.intents.map((i) => ({ ...i, phrases: [...i.phrases] })),
  metrics: { ...a.metrics },
});

interface PersistShape {
  agents: StudioAgent[];
  activeAgentId: string;
}

function defaults(): PersistShape {
  return { agents: STUDIO_AGENTS.map(cloneAgent), activeAgentId: STUDIO_AGENTS[0].id };
}

function load(): PersistShape {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    const p = JSON.parse(raw) as Partial<PersistShape>;
    const d = defaults();
    const agents = Array.isArray(p.agents) && p.agents.length > 0 ? p.agents : d.agents;
    const activeAgentId = agents.some((a) => a.id === p.activeAgentId) ? p.activeAgentId! : agents[0].id;
    return { agents, activeAgentId };
  } catch {
    return defaults();
  }
}

function persist(s: PersistShape): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ agents: s.agents, activeAgentId: s.activeAgentId }));
  } catch {
    /* yoksay */
  }
}

export interface StudioState extends PersistShape {
  /** Geçici (kalıcı olmayan) sandbox günlüğü. */
  testLog: AgentTestTurn[];

  selectAgent: (id: string) => void;
  createAgent: (name: string) => void;
  setName: (name: string) => void;
  setGoal: (goal: string) => void;
  toggleChannel: (channel: AgentChannel) => void;
  toggleTool: (toolId: string) => void;
  addIntent: (intent: Omit<AgentIntent, "id">) => void;
  removeIntent: (id: string) => void;
  publish: () => void;
  /** Aktif agent'ı bir test ifadesine karşı çalıştır (sandbox + metrik güncelle). */
  runTest: (utterance: string) => void;
  resetTest: () => void;
  reset: () => void;
}

export const studioStore = createStore<StudioState>((set, get) => {
  const initial = load();

  const commit = (partial: Partial<PersistShape>) =>
    set((s) => {
      const persistable: PersistShape = { agents: partial.agents ?? s.agents, activeAgentId: partial.activeAgentId ?? s.activeAgentId };
      persist(persistable);
      return partial;
    });

  const patchActive = (fn: (a: StudioAgent) => StudioAgent) => {
    const s = get();
    commit({ agents: s.agents.map((a) => (a.id === s.activeAgentId ? fn(a) : a)) });
  };

  return {
    ...initial,
    testLog: [],

    selectAgent: (id) => {
      commit({ activeAgentId: id });
      set({ testLog: [] });
    },
    createAgent: (name) => {
      const agent: StudioAgent = {
        id: `ag_new_${++agentSeq}`,
        name: name.trim() || "Yeni agent",
        goal: "",
        channels: [],
        status: "draft",
        knowledge: [],
        tools: [],
        intents: [],
        metrics: { runs: 0, resolved: 0 },
      };
      commit({ agents: [...get().agents, agent], activeAgentId: agent.id });
      set({ testLog: [] });
    },
    setName: (name) => patchActive((a) => ({ ...a, name })),
    setGoal: (goal) => patchActive((a) => ({ ...a, goal })),
    toggleChannel: (channel) =>
      patchActive((a) => ({
        ...a,
        channels: a.channels.includes(channel) ? a.channels.filter((c) => c !== channel) : [...a.channels, channel],
      })),
    toggleTool: (toolId) =>
      patchActive((a) => ({ ...a, tools: a.tools.map((t) => (t.id === toolId ? { ...t, enabled: !t.enabled } : t)) })),
    addIntent: (intent) => patchActive((a) => ({ ...a, intents: [...a.intents, { ...intent, id: `ai_new_${++intentSeq}` }] })),
    removeIntent: (id) => patchActive((a) => ({ ...a, intents: a.intents.filter((i) => i.id !== id) })),
    publish: () => patchActive((a) => ({ ...a, status: "published" })),

    runTest: (utterance) => {
      const s = get();
      const agent = s.agents.find((a) => a.id === s.activeAgentId);
      if (!agent) return;
      const res = runAgentTest(agent, utterance);
      const turns: AgentTestTurn[] = [
        ...s.testLog,
        { id: `tt_${++turnSeq}`, who: "user", text: utterance },
        { id: `tt_${++turnSeq}`, who: "agent", text: res.reply, intentId: res.intentId },
      ];
      const agents = s.agents.map((a) =>
        a.id === s.activeAgentId
          ? { ...a, metrics: { runs: a.metrics.runs + 1, resolved: a.metrics.resolved + (res.resolved ? 1 : 0) } }
          : a,
      );
      persist({ agents, activeAgentId: s.activeAgentId });
      set({ agents, testLog: turns });
    },
    resetTest: () => set({ testLog: [] }),
    reset: () => {
      commit(defaults());
      set({ testLog: [] });
    },
  };
});

/** React bağlama. */
export function useStudioStore<U>(selector: (s: StudioState) => U): U {
  return useStore(studioStore, selector);
}
