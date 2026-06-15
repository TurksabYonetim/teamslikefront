// web/src/features/support/inbox.store.ts
import { createStore } from "@/lib/createStore";
import { INBOXES } from "./support.data";
import type { ConversationStatus, Inbox } from "./support.types";

export type StatusFilter = "all" | ConversationStatus;
export type AssigneeFilter = "all" | "mine" | "unassigned";

interface InboxState {
  inboxes: Inbox[];
  activeInboxId: string | null; // null = tüm kutular
  filterStatus: StatusFilter;
  assignee: AssigneeFilter;
  query: string;
  setInbox: (id: string | null) => void;
  setFilter: (status: StatusFilter) => void;
  setAssignee: (a: AssigneeFilter) => void;
  setQuery: (q: string) => void;
  reset: () => void;
}

export const inboxStore = createStore<InboxState>((set) => ({
  inboxes: INBOXES,
  activeInboxId: null,
  filterStatus: "all",
  assignee: "all",
  query: "",
  setInbox: (id) => set({ activeInboxId: id }),
  setFilter: (status) => set({ filterStatus: status }),
  setAssignee: (a) => set({ assignee: a }),
  setQuery: (q) => set({ query: q }),
  reset: () => set({ activeInboxId: null, filterStatus: "all", assignee: "all", query: "" }),
}));
