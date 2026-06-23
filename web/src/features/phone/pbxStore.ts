import { createStore, useStore } from "@/lib/createStore";
import { BUSINESS_HOURS, CALL_QUEUES, HUNT_GROUPS, IVR_MENUS, ROUTING_RULES } from "./data";
import type { BusinessHours, CallQueue, HuntGroup, IVRMenu, IVROption, RoutingRule } from "./phone.types";
import { oldestWaiting, pickAgent } from "./pbx";

export interface PbxState {
  queues: CallQueue[];
  huntGroups: HuntGroup[];
  ivrMenus: IVRMenu[];
  businessHours: BusinessHours[];
  routingRules: RoutingRule[];

  toggleAgentAvailable: (queueId: string, agentId: string) => void;
  assignNext: (queueId: string) => void;
  requestCallback: (queueId: string, callId: string) => void;
  removeWaiting: (queueId: string, callId: string) => void;
  addIvrOption: (menuId: string, option: IVROption) => void;
  removeIvrOption: (menuId: string, key: string) => void;
  addRoutingRule: (rule: RoutingRule) => void;
  updateRoutingRule: (id: string, patch: Partial<RoutingRule>) => void;
  removeRoutingRule: (id: string) => void;
  resetStore: () => void;
}

import { jsonClone as clone } from "@/lib/clone";

const seed = () => ({
  queues: clone(CALL_QUEUES) as CallQueue[],
  huntGroups: clone(HUNT_GROUPS) as HuntGroup[],
  ivrMenus: clone(IVR_MENUS) as IVRMenu[],
  businessHours: clone(BUSINESS_HOURS) as BusinessHours[],
  routingRules: clone(ROUTING_RULES) as RoutingRule[],
});

export const pbxStore = createStore<PbxState>((set, get) => {
  const patchQueue = (queueId: string, fn: (q: CallQueue) => CallQueue) =>
    set((st) => ({ queues: st.queues.map((q) => (q.id === queueId ? fn(q) : q)) }));

  const patchMenu = (menuId: string, fn: (m: IVRMenu) => IVRMenu) =>
    set((st) => ({ ivrMenus: st.ivrMenus.map((m) => (m.id === menuId ? fn(m) : m)) }));

  return {
    ...seed(),

    toggleAgentAvailable: (queueId, agentId) =>
      patchQueue(queueId, (q) => ({
        ...q,
        agents: q.agents.map((a) => (a.id === agentId ? { ...a, available: !a.available } : a)),
      })),

    assignNext: (queueId) => {
      const q = get().queues.find((x) => x.id === queueId);
      if (!q) return;
      const next = oldestWaiting(q);
      const agent = pickAgent(q);
      if (!next || !agent) return;
      patchQueue(queueId, (qq) => ({
        ...qq,
        waiting: qq.waiting.filter((c) => c.id !== next.id),
        agents: qq.agents.map((a) => (a.id === agent.id ? { ...a, idleSec: 0 } : a)),
      }));
    },

    requestCallback: (queueId, callId) =>
      patchQueue(queueId, (q) => ({
        ...q,
        waiting: q.waiting.map((c) => (c.id === callId ? { ...c, callbackRequested: true } : c)),
      })),

    removeWaiting: (queueId, callId) =>
      patchQueue(queueId, (q) => ({ ...q, waiting: q.waiting.filter((c) => c.id !== callId) })),

    addIvrOption: (menuId, option) =>
      patchMenu(menuId, (m) =>
        m.options.some((o) => o.key === option.key) ? m : { ...m, options: [...m.options, option] },
      ),

    removeIvrOption: (menuId, key) =>
      patchMenu(menuId, (m) => ({ ...m, options: m.options.filter((o) => o.key !== key) })),

    addRoutingRule: (rule) => set((st) => ({ routingRules: [...st.routingRules, rule] })),

    updateRoutingRule: (id, patch) =>
      set((st) => ({ routingRules: st.routingRules.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),

    removeRoutingRule: (id) =>
      set((st) => ({ routingRules: st.routingRules.filter((r) => r.id !== id) })),

    resetStore: () => set(seed()),
  };
});

export const usePbx = <U,>(selector: (s: PbxState) => U): U => useStore(pbxStore, selector);
