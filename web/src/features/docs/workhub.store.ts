import { createStore } from "@/lib/createStore";
import { APPROVALS, FORMS, FORM_RESPONSES, SELF_ID, SHIFTS } from "./workspace.data";
import type { ApprovalRequest, FormDef, FormResponse, Shift } from "./workspace.types";

let seq = 0;
const uid = (p: string) => `${p}_${Date.now()}_${seq++}`;

const clone = <T,>(rows: T[]): T[] => rows.map((r) => ({ ...r }));

export interface WorkhubState {
  approvals: ApprovalRequest[];
  shifts: Shift[];
  forms: FormDef[];
  responses: FormResponse[];

  requestApproval: (title: string) => void;
  decideApproval: (id: string, status: "approved" | "rejected") => void;
  claimShift: (id: string) => void;
  respondForm: (formId: string, optionId: string) => void;
  reset: () => void;
}

export const workhubStore = createStore<WorkhubState>((set) => ({
  approvals: clone(APPROVALS),
  shifts: clone(SHIFTS),
  forms: clone(FORMS),
  responses: clone(FORM_RESPONSES),

  requestApproval: (title) =>
    set((s) => ({
      approvals: [
        { id: uid("ap"), title, requesterId: SELF_ID, approverId: "usr_2", status: "pending", createdMin: 0 },
        ...s.approvals,
      ],
    })),

  decideApproval: (id, status) => set((s) => ({ approvals: s.approvals.map((a) => (a.id === id ? { ...a, status } : a)) })),

  claimShift: (id) =>
    set((s) => ({
      shifts: s.shifts.map((sh) => (sh.id === id ? { ...sh, userId: SELF_ID, userName: "You", open: false } : sh)),
    })),

  respondForm: (formId, optionId) =>
    set((s) => ({ responses: [...s.responses, { id: uid("fr"), formId, optionId, responderId: SELF_ID }] })),

  reset: () =>
    set({ approvals: clone(APPROVALS), shifts: clone(SHIFTS), forms: clone(FORMS), responses: clone(FORM_RESPONSES) }),
}));

export const WORKHUB_SELF_ID = SELF_ID;
