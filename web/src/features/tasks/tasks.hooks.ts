import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "./tasks.api";
import type { CreateTaskRequest, Task, UpdateTaskRequest } from "./tasks.types";

const LIST_KEY = ["tasks", "list"] as const;

/** Tüm görevleri (tenant) getirir. */
export function useTasks() {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: () => tasksApi.list(),
    staleTime: 30_000,
  });
}

/** Yeni görev oluşturur; başarıda listeyi tazeler. */
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTaskRequest) => tasksApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

/**
 * Görevi günceller (içerik / durum / pozisyon / atanan).
 * Optimistic: sürükle-bırak ve inline güncellemeler anında yansır; hata
 * durumunda önceki liste geri yüklenir.
 */
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; body: UpdateTaskRequest }) =>
      tasksApi.update(args.id, args.body),
    onMutate: async (args) => {
      await qc.cancelQueries({ queryKey: LIST_KEY });
      const prev = qc.getQueryData<Task[]>(LIST_KEY);
      if (prev) {
        qc.setQueryData<Task[]>(
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
 * Çoklu görev güncellemesini optimistic uygular ve tek seferde persist eder.
 * Sürükle-bırak sonrası kolon içi yeniden sıralamada (birden çok kartın
 * position'ı değişebilir) kullanılır.
 */
export function useReorderTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { id: string; body: UpdateTaskRequest }[]) => {
      await Promise.all(updates.map((u) => tasksApi.update(u.id, u.body)));
    },
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: LIST_KEY });
      const prev = qc.getQueryData<Task[]>(LIST_KEY);
      if (prev) {
        const patch = new Map(updates.map((u) => [u.id, u.body]));
        qc.setQueryData<Task[]>(
          LIST_KEY,
          prev.map((t) => (patch.has(t.id) ? { ...t, ...patch.get(t.id)! } : t)),
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

/** Görev siler; başarıda listeyi tazeler. */
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}
