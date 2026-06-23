// web/src/features/support/wfo.store.ts
/**
 * İşgücü Etkileşim Yönetimi (WFO/WEM) mock store — bağımlılıksız `createStore`.
 * Tahmin/vardiya/uyum/kalite durumu localStorage'da kalıcıdır; backend yoktur.
 * Gereken-temsilci hesabı `wfo.dom.ts` saf motorunda yapılır.
 */
import { createStore, useStore } from "@/lib/createStore";
import { saveJson } from "@/lib/persist";
import {
  ADHERENCE, QA_EVALUATIONS, SCORECARD, SHIFTS, STAFFING, WFO_AHT_SEC, WFO_INTERVAL_SEC, WFO_OCCUPANCY,
} from "./support.data";
import { requiredAgents } from "./wfo.dom";
import type { AdherenceRow, QaEvaluation, ScorecardCriterion, Shift, StaffingInterval } from "./support.types";

const STORAGE_KEY = "tl.support.wfo.v1";

let evalSeq = 0;

const recompute = (i: StaffingInterval): StaffingInterval => ({
  ...i,
  required: requiredAgents(i.forecastVolume, WFO_AHT_SEC, WFO_INTERVAL_SEC, WFO_OCCUPANCY),
});

interface PersistShape {
  intervals: StaffingInterval[];
  shifts: Shift[];
  adherence: AdherenceRow[];
  criteria: ScorecardCriterion[];
  evaluations: QaEvaluation[];
}

function defaults(): PersistShape {
  return {
    intervals: STAFFING.map((i) => recompute({ ...i })),
    shifts: SHIFTS.map((s) => ({ ...s })),
    adherence: ADHERENCE.map((a) => ({ ...a })),
    criteria: SCORECARD.map((c) => ({ ...c })),
    evaluations: QA_EVALUATIONS.map((e) => ({ ...e, scores: { ...e.scores } })),
  };
}

function load(): PersistShape {
  if (typeof window === "undefined") return defaults();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    const p = JSON.parse(raw) as Partial<PersistShape>;
    const d = defaults();
    return {
      intervals: Array.isArray(p.intervals) ? p.intervals.map(recompute) : d.intervals,
      shifts: Array.isArray(p.shifts) ? p.shifts : d.shifts,
      adherence: Array.isArray(p.adherence) ? p.adherence : d.adherence,
      criteria: Array.isArray(p.criteria) ? p.criteria : d.criteria,
      evaluations: Array.isArray(p.evaluations) ? p.evaluations : d.evaluations,
    };
  } catch {
    return defaults();
  }
}

function persist(s: PersistShape): void {
  saveJson(STORAGE_KEY, { intervals: s.intervals, shifts: s.shifts, adherence: s.adherence, criteria: s.criteria, evaluations: s.evaluations });
}

export interface WfoState extends PersistShape {
  /** Mevcut hacimden her aralığın gereken-temsilcisini yeniden hesapla. */
  regenerateForecast: () => void;
  setVolume: (id: string, volume: number) => void;
  /** Gün-içi kendini-iyileştirme: açık aralığa bir temsilci ekle. */
  bumpScheduled: (id: string) => void;
  addEvaluation: (agentId: string, conversationId: string, scores: Record<string, number>) => void;
  reset: () => void;
}

export const wfoStore = createStore<WfoState>((set, get) => {
  const initial = load();
  const commit = (partial: Partial<PersistShape>) =>
    set((s) => {
      const next = { ...s, ...partial };
      persist(next);
      return partial;
    });

  return {
    ...initial,

    regenerateForecast: () => commit({ intervals: get().intervals.map(recompute) }),
    setVolume: (id, volume) =>
      commit({ intervals: get().intervals.map((i) => (i.id === id ? recompute({ ...i, forecastVolume: Math.max(0, volume) }) : i)) }),
    bumpScheduled: (id) =>
      commit({ intervals: get().intervals.map((i) => (i.id === id ? { ...i, scheduled: i.scheduled + 1 } : i)) }),
    addEvaluation: (agentId, conversationId, scores) =>
      commit({ evaluations: [...get().evaluations, { id: `qa_new_${++evalSeq}`, agentId, conversationId, scores: { ...scores } }] }),
    reset: () => commit(defaults()),
  };
});

/** React bağlama. */
export function useWfoStore<U>(selector: (s: WfoState) => U): U {
  return useStore(wfoStore, selector);
}
