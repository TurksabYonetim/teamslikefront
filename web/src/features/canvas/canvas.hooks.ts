import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { canvasApi } from "./canvas.api";
import type {
  CanvasBlock,
  CreateCanvasBlockRequest,
  UpdateCanvasBlockRequest,
} from "./canvas.types";

const LIST_KEY = ["canvas", "list"] as const;

/** Tüm blokları (tenant) getirir, position'a göre sıralı. */
export function useCanvasBlocks() {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: () => canvasApi.list(),
    staleTime: 30_000,
  });
}

/** Yeni blok oluşturur; başarıda listeyi tazeler. */
export function useCreateCanvasBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCanvasBlockRequest) => canvasApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

/**
 * Bloğu günceller (içerik / başlık / tip / pozisyon).
 * Optimistic: değişiklik anında yansır; hata durumunda önceki liste geri yüklenir.
 */
export function useUpdateCanvasBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; body: UpdateCanvasBlockRequest }) =>
      canvasApi.update(args.id, args.body),
    onMutate: async (args) => {
      await qc.cancelQueries({ queryKey: LIST_KEY });
      const prev = qc.getQueryData<CanvasBlock[]>(LIST_KEY);
      if (prev) {
        qc.setQueryData<CanvasBlock[]>(
          LIST_KEY,
          prev.map((b) => (b.id === args.id ? { ...b, ...args.body } : b)),
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
 * Çoklu blok güncellemesini optimistic uygular ve tek seferde persist eder.
 * Yukarı/aşağı taşımada iki bloğun position'ı takas edildiğinde kullanılır.
 */
export function useReorderCanvasBlocks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      updates: { id: string; body: UpdateCanvasBlockRequest }[],
    ) => {
      await Promise.all(updates.map((u) => canvasApi.update(u.id, u.body)));
    },
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: LIST_KEY });
      const prev = qc.getQueryData<CanvasBlock[]>(LIST_KEY);
      if (prev) {
        const patch = new Map(updates.map((u) => [u.id, u.body]));
        qc.setQueryData<CanvasBlock[]>(
          LIST_KEY,
          [...prev]
            .map((b) => (patch.has(b.id) ? { ...b, ...patch.get(b.id)! } : b))
            .sort((a, b) => a.position - b.position),
        );
      }
      return { prev };
    },
    onError: (_err, _updates, ctx) => {
      if (ctx?.prev) qc.setQueryData(LIST_KEY, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

/** Blok siler; başarıda listeyi tazeler. */
export function useDeleteCanvasBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => canvasApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}
