import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clipsApi } from "./clips.api";
import type { Clip, CreateClipRequest, UpdateClipRequest } from "./clips.types";

const LIST_KEY = ["clips", "list"] as const;

/** Tüm klipleri (tenant) getirir. */
export function useClips() {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: () => clipsApi.list(),
    staleTime: 30_000,
  });
}

/** Yeni klip oluşturur; başarıda listeyi tazeler. */
export function useCreateClip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateClipRequest) => clipsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

/**
 * Klip metadata'sını günceller (başlık / açıklama / url / süre).
 * Optimistic: inline güncellemeler anında yansır; hata durumunda önceki liste
 * geri yüklenir.
 */
export function useUpdateClip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; body: UpdateClipRequest }) =>
      clipsApi.update(args.id, args.body),
    onMutate: async (args) => {
      await qc.cancelQueries({ queryKey: LIST_KEY });
      const prev = qc.getQueryData<Clip[]>(LIST_KEY);
      if (prev) {
        qc.setQueryData<Clip[]>(
          LIST_KEY,
          prev.map((c) => (c.id === args.id ? { ...c, ...args.body } : c)),
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
 * Klip siler; optimistic olarak listeden çıkarır. Hata durumunda önceki liste
 * geri yüklenir. Çağıran taraf "geri al" toast'ı ile silinen klibi yeniden
 * oluşturabilir (create) — undo akışı.
 */
export function useDeleteClip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clipsApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: LIST_KEY });
      const prev = qc.getQueryData<Clip[]>(LIST_KEY);
      if (prev) {
        qc.setQueryData<Clip[]>(
          LIST_KEY,
          prev.filter((c) => c.id !== id),
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
