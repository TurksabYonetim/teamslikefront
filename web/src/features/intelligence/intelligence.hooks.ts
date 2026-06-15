import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { intelligenceApi } from "./intelligence.api";
import type {
  CreateTranscriptRequest,
  Transcript,
  UpdateTranscriptRequest,
} from "./intelligence.types";

const LIST_KEY = ["intelligence", "transcripts"] as const;

/** Tüm transkriptleri (tenant) getirir. */
export function useTranscripts() {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: () => intelligenceApi.list(),
    staleTime: 30_000,
  });
}

/** Yeni transkript oluşturur; başarıda listeyi tazeler. */
export function useCreateTranscript() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTranscriptRequest) => intelligenceApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

/**
 * Transkripti günceller (başlık / içerik / dil).
 * Optimistic: inline düzenlemeler anında yansır; hata durumunda önceki liste
 * geri yüklenir.
 */
export function useUpdateTranscript() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; body: UpdateTranscriptRequest }) =>
      intelligenceApi.update(args.id, args.body),
    onMutate: async (args) => {
      await qc.cancelQueries({ queryKey: LIST_KEY });
      const prev = qc.getQueryData<Transcript[]>(LIST_KEY);
      if (prev) {
        qc.setQueryData<Transcript[]>(
          LIST_KEY,
          prev.map((t) => (t.id === args.id ? { ...t, ...args.body } : t)),
        );
      }
      return { prev };
    },
    onError: (_err, _args, ctx) => {
      if (ctx?.prev) qc.setQueryData(LIST_KEY, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

/**
 * Transkripti siler.
 * Optimistic: silinen kayıt listeden anında kaldırılır; hata durumunda geri
 * yüklenir. Geri al (undo), silinen içeriğin yeniden oluşturulmasıyla sağlanır
 * (sayfa katmanında ele alınır).
 */
export function useDeleteTranscript() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => intelligenceApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: LIST_KEY });
      const prev = qc.getQueryData<Transcript[]>(LIST_KEY);
      if (prev) {
        qc.setQueryData<Transcript[]>(
          LIST_KEY,
          prev.filter((t) => t.id !== id),
        );
      }
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(LIST_KEY, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}
