import { api } from "@/lib/api";
import type {
  CallLog,
  Contact,
  CreateCallLogRequest,
  CreateContactRequest,
  UpdateContactRequest,
} from "./phone.types";

export const phoneApi = {
  // --- Call logs ---
  listCallLogs: () => api.get<CallLog[]>("/v1/call-logs").then((r) => r.data),

  createCallLog: (body: CreateCallLogRequest) =>
    api.post<CallLog>("/v1/call-logs", body).then((r) => r.data),

  // --- Contacts ---
  listContacts: () => api.get<Contact[]>("/v1/contacts").then((r) => r.data),

  createContact: (body: CreateContactRequest) =>
    api.post<Contact>("/v1/contacts", body).then((r) => r.data),

  updateContact: (id: string, body: UpdateContactRequest) =>
    api.patch<Contact>(`/v1/contacts/${id}`, body).then((r) => r.data),

  removeContact: (id: string) =>
    api.delete<void>(`/v1/contacts/${id}`).then((r) => r.data),
};
