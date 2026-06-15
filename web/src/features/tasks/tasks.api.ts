import { createMockStore, mockId, nowIso } from "@/lib/mockStore";
import type { CreateTaskRequest, Task, UpdateTaskRequest } from "./tasks.types";

/**
 * Frontend-only: görevler localStorage'da tutulur (backend'de /v1/tasks yok).
 * list/create/update/remove imzası gerçek API ile birebir aynı → hook'lar ve
 * KanbanBoard değişmeden çalışır.
 */
const seed = (): Task[] => {
  const base = nowIso();
  const rows: Omit<Task, "id" | "created_at">[] = [
    { title: "Tasarım sistemini gözden geçir", description: "Renk ve tipografi tokenlarını netleştir.", status: "todo", assignee_user_id: null, position: 0, due_date: null },
    { title: "Kanban sürükle-bırak", description: "Kolonlar arası taşımada pozisyon persist edilsin.", status: "todo", assignee_user_id: null, position: 1, due_date: null },
    { title: "Komut paleti", description: "Cmd/Ctrl+K ile modüller arası gezinme.", status: "in_progress", assignee_user_id: null, position: 0, due_date: null },
    { title: "Birim testleri", description: "Saf util fonksiyonları için testler.", status: "done", assignee_user_id: null, position: 0, due_date: null },
  ];
  return rows.map((r) => ({ ...r, id: mockId(), created_at: base }));
};

const store = createMockStore<Task, CreateTaskRequest, UpdateTaskRequest>({
  key: "tasks",
  seed,
  build: (body, existing) => ({
    id: mockId(),
    title: body.title,
    description: body.description ?? "",
    status: body.status ?? "todo",
    assignee_user_id: body.assignee_user_id ?? null,
    position:
      body.position ??
      existing.filter((t) => t.status === (body.status ?? "todo")).length,
    due_date: body.due_date ?? null,
    created_at: nowIso(),
  }),
  merge: (current, body) => ({ ...current, ...body }),
});

export const tasksApi = {
  list: () => store.list(),
  create: (body: CreateTaskRequest) => store.create(body),
  update: (id: string, body: UpdateTaskRequest) => store.update(id, body),
  remove: (id: string) => store.remove(id),
};
