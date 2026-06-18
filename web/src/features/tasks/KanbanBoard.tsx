import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Sortable from "sortablejs";
import { useInitFlowbite } from "@/lib/flowbite";
import { Modal, Skeleton, EmptyState, useToast } from "@/components/ui";
import { apiErrorMessage } from "@/lib/api";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useReorderTasks,
  useDeleteTask,
} from "./tasks.hooks";
import type { Task, TaskStatus } from "./tasks.types";

/**
 * Flowbite "kanban.html" sayfasından çevrildi; üst araç çubuğu birebir korundu.
 * Kolonlar ve kartlar artık gerçek backend'den (/v1/tasks) React Query ile
 * gelir → tam CRUD (create / update / patch / delete) çalışır.
 *
 * - Kolonlar sabit üç durum: todo | in_progress | done
 * - Yeni görev modalı → POST /v1/tasks
 * - Kart düzenle modalı → PATCH /v1/tasks/{id} (+ sil → DELETE, undo toast)
 * - SortableJS onEnd → taşınan kartın status + tüm etkilenen position'ları
 *   PATCH ile PERSIST edilir (optimistic, hata → rollback)
 */

const COLUMNS: { status: TaskStatus; titleKey: string }[] = [
  { status: "todo", titleKey: "columns.toDo" },
  { status: "in_progress", titleKey: "columns.inProgress" },
  { status: "done", titleKey: "columns.done" },
];

/** Durum renk tonu (sayı pili + kart çipi); AAA: 800 metin / 100 zemin. */
const STATUS_TONE: Record<TaskStatus, string> = {
  todo: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  in_progress: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

interface TaskDraft {
  title: string;
  description: string;
  dueDate: string;
}

const EMPTY_DRAFT: TaskDraft = {
  title: "",
  description: "",
  dueDate: "",
};

/** ISO datetime → <input type="date"> değeri (YYYY-MM-DD). */
function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

/** <input type="date"> değeri → ISO datetime (gün başı UTC) veya null. */
function fromDateInput(v: string): string | null {
  const trimmed = v.trim();
  if (!trimmed) return null;
  return new Date(`${trimmed}T00:00:00Z`).toISOString();
}

export function KanbanBoard() {
  useInitFlowbite();
  const { t } = useTranslation("tasks");
  const toast = useToast();

  const { data: tasks = [], isLoading, isError } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const reorderTasks = useReorderTasks();
  const deleteTask = useDeleteTask();

  const [search, setSearch] = useState("");

  const [targetStatus, setTargetStatus] = useState<TaskStatus | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [newDraft, setNewDraft] = useState<TaskDraft>(EMPTY_DRAFT);
  const [editDraft, setEditDraft] = useState<TaskDraft>(EMPTY_DRAFT);

  // SortableJS: sürükle-bırak sonrası kolon/sıra DOM'dan okunup PATCH ile persist edilir
  const persistFromDom = useCallback(() => {
    const updates: { id: string; body: { status: TaskStatus; position: number } }[] = [];
    document.querySelectorAll<HTMLElement>('[id^="kanban-list-"]').forEach((col) => {
      const status = col.dataset.status as TaskStatus | undefined;
      if (!status) return;
      col.querySelectorAll<HTMLElement>("[data-task-id]").forEach((cardEl, index) => {
        const id = cardEl.dataset.taskId!;
        const found = tasks.find((tk) => tk.id === id);
        if (!found) return;
        if (found.status !== status || found.position !== index) {
          updates.push({ id, body: { status, position: index } });
        }
      });
    });
    if (updates.length > 0) {
      reorderTasks.mutate(updates, {
        onError: (err) =>
          toast.show({ message: apiErrorMessage(err), variant: "error" }),
      });
    }
  }, [tasks, reorderTasks, toast]);

  useEffect(() => {
    if (isLoading || isError) return;
    const cols = document.querySelectorAll<HTMLElement>('[id^="kanban-list-"]');
    const instances: Sortable[] = [];
    cols.forEach((col) => {
      instances.push(
        Sortable.create(col, {
          group: "kanban",
          animation: 100,
          forceFallback: true,
          dragClass: "drag-card",
          ghostClass: "ghost-card",
          easing: "cubic-bezier(0.23, 1, 0.32, 1)", // matches --ease-out
          onStart: () => {
            document.body.style.userSelect = "none";
          },
          onEnd: () => {
            document.body.style.userSelect = "auto";
            persistFromDom();
          },
        }),
      );
    });
    return () => instances.forEach((s) => s.destroy());
  }, [persistFromDom, isLoading, isError]);

  const openNewTask = (status: TaskStatus) => {
    setTargetStatus(status);
    setNewDraft(EMPTY_DRAFT);
    setNewOpen(true);
  };

  const submitNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStatus || !newDraft.title.trim()) return;
    createTask.mutate(
      {
        title: newDraft.title.trim(),
        description: newDraft.description.trim(),
        status: targetStatus,
        due_date: fromDateInput(newDraft.dueDate),
      },
      {
        onSuccess: () => {
          setNewOpen(false);
          toast.show({ message: t("toast.created"), variant: "success" });
        },
        onError: (err) =>
          toast.show({ message: apiErrorMessage(err), variant: "error" }),
      },
    );
  };

  const openEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditDraft({
      title: task.title,
      description: task.description,
      dueDate: toDateInput(task.due_date),
    });
    setEditOpen(true);
  };

  const submitEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId || !editDraft.title.trim()) return;
    updateTask.mutate(
      {
        id: editingTaskId,
        body: {
          title: editDraft.title.trim(),
          description: editDraft.description.trim(),
          due_date: fromDateInput(editDraft.dueDate),
        },
      },
      {
        onSuccess: () => {
          setEditOpen(false);
          toast.show({ message: t("toast.updated"), variant: "success" });
        },
        onError: (err) =>
          toast.show({ message: apiErrorMessage(err), variant: "error" }),
      },
    );
  };

  const deleteEditTask = () => {
    if (!editingTaskId) return;
    const task = tasks.find((tk) => tk.id === editingTaskId);
    deleteTask.mutate(editingTaskId, {
      onSuccess: () => {
        setEditOpen(false);
        toast.show({
          message: t("toast.deleted"),
          variant: "success",
          action: task
            ? {
                label: t("toast.undo"),
                onClick: () =>
                  createTask.mutate({
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    assignee_user_id: task.assignee_user_id,
                    due_date: task.due_date,
                    position: task.position,
                  }),
              }
            : undefined,
        });
      },
      onError: (err) =>
        toast.show({ message: apiErrorMessage(err), variant: "error" }),
    });
  };

  const q = search.trim().toLowerCase();
  const visibleTasks = (status: TaskStatus) =>
    tasks
      .filter((tk) => tk.status === status)
      .filter(
        (tk) =>
          !q ||
          tk.title.toLowerCase().includes(q) ||
          tk.description.toLowerCase().includes(q),
      )
      .sort((a, b) => a.position - b.position);

  const formatDue = (iso: string | null): string | null => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return null;
    }
  };

  return (
    <>

      <div className="grid grid-cols-12 gap-4 border-b border-gray-200 bg-white pb-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="col-span-full mx-4 mt-4 ">
          <nav className="mb-4 flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
              <li className="inline-flex items-center">
                <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-700 dark:text-gray-400 dark:hover:text-white">
                  <svg className="me-2.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M11.3 3.3a1 1 0 0 1 1.4 0l6 6 2 2a1 1 0 0 1-1.4 1.4l-.3-.3V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3c0 .6-.4 1-1 1H7a2 2 0 0 1-2-2v-6.6l-.3.3a1 1 0 0 1-1.4-1.4l2-2 6-6Z" clipRule="evenodd" />
                  </svg>
                  {t("breadcrumb.home")}
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="mx-1 h-4 w-4 text-gray-400 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7" />
                  </svg>
                  <a href="#" className="ms-1 text-sm font-medium text-gray-700 hover:text-primary-700 dark:text-gray-400 dark:hover:text-white md:ms-2">{t("breadcrumb.projectManagement")}</a>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="mx-1 h-4 w-4 text-gray-400 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7" />
                  </svg>
                  <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">{t("breadcrumb.tasks")}</span>
                </div>
              </li>
            </ol>
          </nav>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-96">
              <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3"><svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" /></svg></span>
              <input type="text" aria-label="Ara" placeholder="Ara" className="h-10 w-full rounded-lg border border-gray-300 bg-surface ps-9 pe-3 text-sm text-ink transition-[border-color,box-shadow] duration-[var(--dur-pop)] ease-[var(--ease-out)] hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600" defaultValue="" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.5 3A3.5 3.5 0 0 0 14 7L8.1 9.8A3.5 3.5 0 0 0 2 12a3.5 3.5 0 0 0 6.1 2.3l6 2.7-.1.5a3.5 3.5 0 1 0 1-2.3l-6-2.7a3.5 3.5 0 0 0 0-1L15 9a3.5 3.5 0 0 0 6-2.4c0-2-1.6-3.5-3.5-3.5Z" /></svg>Paylaş</button>
              <button type="button" className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M15 4H9v16h6V4Zm2 16h3a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3v16ZM4 4h3v16H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" clipRule="evenodd" /></svg>Grupla</button>
              <button type="button" className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3a2 2 0 0 0-1.5 3.3l5.4 6v5c0 .4.3.9.6 1.1l3.1 2.3c1 .7 2.5 0 2.5-1.2v-7.1l5.4-6C21.6 5 20.7 3 19 3H5Z" /></svg>Filtrele</button>
              <button type="button" className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M9.586 2.586A2 2 0 0 1 11 2h2a2 2 0 0 1 2 2v.089l.473.196.063-.063a2.002 2.002 0 0 1 2.828 0l1.414 1.414a2 2 0 0 1 0 2.827l-.063.064.196.473H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-.089l-.196.473.063.063a2.002 2.002 0 0 1 0 2.828l-1.414 1.414a2 2 0 0 1-2.828 0l-.063-.063-.473.196V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.089l-.473-.196-.063.063a2.002 2.002 0 0 1-2.828 0l-1.414-1.414a2 2 0 0 1 0-2.827l.063-.064L4.089 15H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h.09l.195-.473-.063-.063a2 2 0 0 1 0-2.828l1.414-1.414a2 2 0 0 1 2.827 0l.064.063L9 4.089V4a2 2 0 0 1 .586-1.414ZM8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" /></svg>Özelleştir</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow-sm">
              {isError ? (
                <div className="px-4 py-6">
                  <EmptyState title={t("state.errorTitle")} description={t("state.errorDescription")} />
                </div>
              ) : (
                <div className="mb-6 flex items-start justify-start gap-4 overflow-x-auto px-4 relative">
                  {COLUMNS.map((column, colIndex) => {
                    const cards = visibleTasks(column.status);
                    return (
                      <div key={column.status} className="w-full min-w-0 shrink-0 sm:w-80 sm:min-w-[20rem]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 py-4 text-base font-semibold text-gray-900 dark:text-gray-300">
                            {t(column.titleKey)}
                            <span className={"rounded-full px-2 py-0.5 text-xs font-semibold " + STATUS_TONE[column.status]}>{cards.length}</span>
                          </div>
                        </div>

                        <div id={`kanban-list-${colIndex + 1}`} data-status={column.status} className="mb-4 space-y-4">
                          {isLoading
                            ? Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                                  <Skeleton className="mb-3 h-5 w-1/2" />
                                  <Skeleton className="h-3.5 w-full" />
                                  <Skeleton className="mt-2 h-3.5 w-2/3" />
                                </div>
                              ))
                            : cards.length === 0
                              ? (
                                <EmptyState className="py-8" title={t("state.emptyColumnTitle")} description={t("state.emptyColumnDescription")} />
                              )
                              : cards.map((task) => {
                                  const due = formatDue(task.due_date);
                                  return (
                                    <div key={task.id} data-task-id={task.id} className="tl-stagger flex max-w-md cursor-move flex-col rounded-lg bg-white p-4 shadow-sm transition-shadow duration-[var(--dur-pop)] ease-[var(--ease-out)] hover:shadow-md dark:bg-gray-800">
                                      <div className="mb-2">
                                        <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.625rem] font-medium " + STATUS_TONE[column.status]}>
                                          {column.status === "done" && (
                                            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" /></svg>
                                          )}
                                          {t(column.titleKey)}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between pb-4">
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{task.title}</div>
                                        <button type="button" onClick={() => openEditTask(task)} className="rounded-lg p-1.5 text-sm text-gray-500 transition-transform motion-safe:active:scale-[0.97] hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700">
                                          <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M11.3 6.2H5a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h11c1.1 0 2-1 2-2.1V11l-4 4.2c-.3.3-.7.6-1.2.7l-2.7.6c-1.7.3-3.3-1.3-3-3.1l.6-2.9c.1-.5.4-1 .7-1.3l3-3.1Z" clipRule="evenodd" />
                                            <path fillRule="evenodd" d="M19.8 4.3a2.1 2.1 0 0 0-1-1.1 2 2 0 0 0-2.2.4l-.6.6 2.9 3 .5-.6a2.1 2.1 0 0 0 .6-1.5c0-.2 0-.5-.2-.8Zm-2.4 4.4-2.8-3-4.8 5-.1.3-.7 3c0 .3.3.7.6.6l2.7-.6.3-.1 4.7-5Z" clipRule="evenodd" />
                                          </svg>
                                        </button>
                                      </div>

                                      <div className="flex flex-col">
                                        {task.description && (
                                          <div className="pb-4 text-sm font-normal text-gray-500 dark:text-gray-400">{task.description}</div>
                                        )}
                                        {due && (
                                          <div className="flex justify-end">
                                            <div className="flex items-center justify-center rounded-lg bg-gray-100 px-3 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                              <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                              </svg>
                                              {due}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                        </div>

                        <button type="button" onClick={() => openNewTask(column.status)} className="flex w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-100 py-2 font-medium text-gray-500 transition-transform motion-safe:active:scale-[0.97] hover:border-primary-700 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white">
                          <svg className="-ms-0.5 me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5" />
                          </svg>
                          {t("card.addNewTask")}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Yeni görev modalı — ortak Modal (Overlay: backdrop + ESC + scroll-lock) */}
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title={t("taskModal.addNewTask")}>
        <form onSubmit={submitNewTask} className="space-y-4">
          <div>
            <label htmlFor="new-title" className="label">{t("taskModal.title")}</label>
            <input type="text" id="new-title" value={newDraft.title} onChange={(e) => setNewDraft({ ...newDraft, title: e.target.value })} className="input" placeholder={t("taskModal.titlePlaceholder")} required />
          </div>
          <div>
            <label htmlFor="new-description" className="label">{t("taskModal.description")}</label>
            <textarea id="new-description" rows={6} value={newDraft.description} onChange={(e) => setNewDraft({ ...newDraft, description: e.target.value })} className="input" placeholder={t("taskModal.descriptionPlaceholder")}></textarea>
          </div>
          <div>
            <label htmlFor="new-dueDate" className="label">{t("taskModal.dueDate")}</label>
            <input type="date" id="new-dueDate" value={newDraft.dueDate} onChange={(e) => setNewDraft({ ...newDraft, dueDate: e.target.value })} className="input" />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={createTask.isPending} className="btn-primary inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60">
              <svg className="-ms-0.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5" />
              </svg>
              {t("taskModal.create")}
              <span className="sr-only">{t("sr.addEvent")}</span>
            </button>
            <button type="button" onClick={() => setNewOpen(false)} className="btn">
              {t("taskModal.cancel")}
            </button>
          </div>
        </form>
      </Modal>

      {/* Görev düzenle modalı — ortak Modal; sil aksiyonu footer'da danger buton */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={t("taskModal.editTask")}>
        <form onSubmit={submitEditTask} className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="label">{t("taskModal.title")}</label>
            <input type="text" id="edit-title" value={editDraft.title} onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })} className="input" placeholder={t("taskModal.titlePlaceholder")} required />
          </div>
          <div>
            <label htmlFor="edit-description" className="label">{t("taskModal.description")}</label>
            <textarea id="edit-description" rows={6} value={editDraft.description} onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })} className="input" placeholder={t("taskModal.descriptionPlaceholderThoughts")}></textarea>
          </div>
          <div>
            <label htmlFor="edit-dueDate" className="label">{t("taskModal.dueDate")}</label>
            <input type="date" id="edit-dueDate" value={editDraft.dueDate} onChange={(e) => setEditDraft({ ...editDraft, dueDate: e.target.value })} className="input" />
          </div>
          <div className="flex items-center justify-between gap-3 pt-1">
            <button type="button" onClick={deleteEditTask} disabled={deleteTask.isPending} className="btn-danger inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60">
              <svg className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clipRule="evenodd" />
              </svg>
              {t("rowMenu.delete")}
            </button>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setEditOpen(false)} className="btn">
                {t("taskModal.cancel")}
              </button>
              <button type="submit" disabled={updateTask.isPending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                {t("taskModal.editTask")}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
