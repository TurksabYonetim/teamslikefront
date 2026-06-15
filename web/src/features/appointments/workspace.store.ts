// web/src/features/appointments/workspace.store.ts
import { createStore } from "@/lib/createStore";
import { DESKS, ME_ID, RESERVATIONS } from "./appointments.data";
import { isDeskFree } from "./appointments.workspace";
import type { Desk, DeskSlot, Reservation } from "./appointments.types";

let seq = 0;
const rid = () => `rsv_${Date.now()}_${seq++}`;
const cloneReservations = (): Reservation[] => RESERVATIONS.map((r) => ({ ...r }));
// desks'i de derin kopyala (amenities array'i seed sabitine sızmasın).
const cloneDesks = (): Desk[] => DESKS.map((d) => ({ ...d, amenities: [...d.amenities] }));
const todayISO = () => new Date().toISOString().slice(0, 10);

interface WorkspaceState {
  desks: Desk[];
  reservations: Reservation[];
  dateISO: string;
  slot: DeskSlot;

  setDate: (dateISO: string) => void;
  setSlot: (slot: DeskSlot) => void;
  reserve: (deskId: string) => void;
  cancel: (reservationId: string) => void;
  checkIn: (reservationId: string) => void;
  reset: () => void;
}

export const workspaceStore = createStore<WorkspaceState>((set, get) => ({
  desks: cloneDesks(),
  reservations: cloneReservations(),
  dateISO: todayISO(),
  slot: "full",

  setDate: (dateISO) => set({ dateISO }),
  setSlot: (slot) => set({ slot }),

  reserve: (deskId) => {
    const { reservations, dateISO, slot } = get();
    if (!isDeskFree(reservations, deskId, dateISO, slot)) return;
    set({ reservations: [...reservations, { id: rid(), deskId, userId: ME_ID, dateISO, slot, checkedIn: false }] });
  },
  cancel: (reservationId) => set((s) => ({ reservations: s.reservations.filter((r) => r.id !== reservationId) })),
  checkIn: (reservationId) =>
    set((s) => ({ reservations: s.reservations.map((r) => (r.id === reservationId ? { ...r, checkedIn: true } : r)) })),

  reset: () => set({ desks: cloneDesks(), reservations: cloneReservations(), dateISO: todayISO(), slot: "full" }),
}));
