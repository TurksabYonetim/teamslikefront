import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { phoneApi } from "./phone.api";
import type {
  Contact,
  CreateCallLogRequest,
  CreateContactRequest,
  UpdateContactRequest,
} from "./phone.types";

const CALL_LOGS_KEY = ["phone", "call-logs"] as const;
const CONTACTS_KEY = ["phone", "contacts"] as const;

// --- Call logs ---

/** Tüm arama kayıtlarını (tenant) getirir. */
export function useCallLogs() {
  return useQuery({
    queryKey: CALL_LOGS_KEY,
    queryFn: () => phoneApi.listCallLogs(),
    staleTime: 30_000,
  });
}

/** Yeni arama kaydı oluşturur; başarıda listeyi tazeler. */
export function useCreateCallLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCallLogRequest) => phoneApi.createCallLog(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CALL_LOGS_KEY });
    },
  });
}

// --- Contacts ---

/** Tüm rehber kayıtlarını (tenant) getirir. */
export function useContacts() {
  return useQuery({
    queryKey: CONTACTS_KEY,
    queryFn: () => phoneApi.listContacts(),
    staleTime: 30_000,
  });
}

/** Yeni rehber kaydı oluşturur; başarıda listeyi tazeler. */
export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateContactRequest) => phoneApi.createContact(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTACTS_KEY });
    },
  });
}

/**
 * Rehber kaydını günceller.
 * Optimistic: düzenlemeler anında yansır; hata durumunda önceki liste geri yüklenir.
 */
export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; body: UpdateContactRequest }) =>
      phoneApi.updateContact(args.id, args.body),
    onMutate: async (args) => {
      await qc.cancelQueries({ queryKey: CONTACTS_KEY });
      const prev = qc.getQueryData<Contact[]>(CONTACTS_KEY);
      if (prev) {
        qc.setQueryData<Contact[]>(
          CONTACTS_KEY,
          prev.map((c) => (c.id === args.id ? { ...c, ...args.body } : c)),
        );
      }
      return { prev };
    },
    onError: (_err, _args, ctx) => {
      if (ctx?.prev) qc.setQueryData(CONTACTS_KEY, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: CONTACTS_KEY });
    },
  });
}

/**
 * Rehber kaydını siler.
 * Optimistic: kayıt anında listeden kalkar; hata durumunda geri yüklenir.
 * Undo, UI tarafında silinen kaydın yeniden create edilmesiyle sağlanır.
 */
export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => phoneApi.removeContact(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: CONTACTS_KEY });
      const prev = qc.getQueryData<Contact[]>(CONTACTS_KEY);
      if (prev) {
        qc.setQueryData<Contact[]>(
          CONTACTS_KEY,
          prev.filter((c) => c.id !== id),
        );
      }
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(CONTACTS_KEY, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: CONTACTS_KEY });
    },
  });
}
