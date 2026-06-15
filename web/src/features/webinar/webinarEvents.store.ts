// web/src/features/webinar/webinarEvents.store.ts
import { createStore } from "@/lib/createStore";
import { AGENDA, EVENT_BADGE, TICKET_TIERS } from "./webinar.data";
import { ticketsRemaining } from "./webinarEvents";
import type { AgendaItem, EventBadge, TicketTier } from "./webinar.types";

let tierSeq = 0;
let agendaSeq = 0;

interface EventsState {
  tiers: TicketTier[];
  agenda: AgendaItem[];
  badge: EventBadge;
  printQueue: string[];

  addTier: (tier: Omit<TicketTier, "id" | "sold">) => void;
  removeTier: (id: string) => void;
  sellTicket: (id: string) => void;
  addAgendaItem: (item: Omit<AgendaItem, "id">) => void;
  removeAgendaItem: (id: string) => void;
  toggleBadgeField: (field: string) => void;
  queueBadges: (ids: string[]) => void;
  clearQueue: () => void;
}

export const webinarEventsStore = createStore<EventsState>((set) => ({
  tiers: TICKET_TIERS.map((t) => ({ ...t })),
  agenda: AGENDA.map((a) => ({ ...a })),
  badge: { ...EVENT_BADGE, fields: [...EVENT_BADGE.fields] },
  printQueue: [],

  addTier: (tier) => set((s) => ({ tiers: [...s.tiers, { ...tier, id: `tt_new_${++tierSeq}`, sold: 0 }] })),
  removeTier: (id) => set((s) => ({ tiers: s.tiers.filter((t) => t.id !== id) })),
  sellTicket: (id) =>
    set((s) => ({ tiers: s.tiers.map((t) => (t.id === id && ticketsRemaining(t) > 0 ? { ...t, sold: t.sold + 1 } : t)) })),

  addAgendaItem: (item) => set((s) => ({ agenda: [...s.agenda, { ...item, id: `ag_new_${++agendaSeq}` }] })),
  removeAgendaItem: (id) => set((s) => ({ agenda: s.agenda.filter((a) => a.id !== id) })),

  toggleBadgeField: (field) =>
    set((s) => ({
      badge: {
        ...s.badge,
        fields: s.badge.fields.includes(field) ? s.badge.fields.filter((f) => f !== field) : [...s.badge.fields, field],
      },
    })),
  queueBadges: (ids) => set((s) => ({ printQueue: Array.from(new Set([...s.printQueue, ...ids])) })),
  clearQueue: () => set({ printQueue: [] }),
}));
