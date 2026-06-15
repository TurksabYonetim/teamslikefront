// web/src/features/webinar/webinar.store.ts
import { createStore } from "@/lib/createStore";
import { ATTENDEE_BASE, EVENTS, REGISTRATIONS } from "./webinar.data";
import { admitFromWaitlist, nextApproval } from "./webinar.dom";
import type { AppEvent, EventType, Registration } from "./webinar.types";

let seq = 0;
const newId = () => `rg_${Date.now()}_${seq++}`;

interface WebinarState {
  events: AppEvent[];
  activeEventId: string;
  mode: EventType;
  phase: "console" | "live";
  registrations: Registration[];
  attendees: number;

  setEvent: (id: string) => void;
  setMode: (mode: EventType) => void;
  goLive: () => void;
  exitLive: () => void;
  register: (values: Record<string, string>) => void;
  approveRegistration: (id: string) => void;
  rejectRegistration: (id: string) => void;
  admitNext: () => void;
  reset: () => void;
}

const DEFAULT = EVENTS[0];

export const webinarStore = createStore<WebinarState>((set, get) => ({
  events: EVENTS,
  activeEventId: DEFAULT.id,
  mode: DEFAULT.type,
  phase: "console",
  registrations: [...REGISTRATIONS],
  attendees: ATTENDEE_BASE,

  setEvent: (id) => set({ activeEventId: id, mode: EVENTS.find((e) => e.id === id)?.type ?? "live" }),
  setMode: (mode) => set({ mode }),
  goLive: () => set({ phase: "live" }),
  exitLive: () => set({ phase: "console" }),

  register: (values) => {
    const s = get();
    const event = s.events.find((e) => e.id === s.activeEventId);
    const approval = event ? nextApproval(event, s.registrations) : "approved";
    set({
      registrations: [...s.registrations, { id: newId(), eventId: s.activeEventId, values, status: "registered", approval }],
    });
  },

  approveRegistration: (id) =>
    set((s) => ({ registrations: s.registrations.map((r) => (r.id === id ? { ...r, approval: "approved" } : r)) })),
  rejectRegistration: (id) =>
    set((s) => ({ registrations: s.registrations.map((r) => (r.id === id ? { ...r, approval: "rejected" } : r)) })),
  admitNext: () => {
    const s = get();
    const forEvent = s.registrations.filter((r) => r.eventId === s.activeEventId);
    const next = admitFromWaitlist(forEvent);
    if (!next) return;
    set({ registrations: s.registrations.map((r) => (r.id === next.id ? { ...r, approval: "approved" } : r)) });
  },

  reset: () =>
    set({
      activeEventId: DEFAULT.id,
      mode: DEFAULT.type,
      phase: "console",
      registrations: [...REGISTRATIONS],
      attendees: ATTENDEE_BASE,
    }),
}));
