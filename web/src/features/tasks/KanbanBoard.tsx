import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Sortable from "sortablejs";
import { useInitFlowbite } from "@/lib/flowbite";
import { Modal, Skeleton, EmptyState, DateField, Dropdown, DropdownItem, useToast } from "@/components/ui";
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

/** Üst araç çubuğu aksiyonları (Flowbite şablonu) — kebab menü + xl satırında ortak. */
const TOOLBAR_ACTIONS: { label: string; icon: React.ReactNode }[] = [
  {
    label: "Paylaş",
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17.5 3A3.5 3.5 0 0 0 14 7L8.1 9.8A3.5 3.5 0 0 0 2 12a3.5 3.5 0 0 0 6.1 2.3l6 2.7-.1.5a3.5 3.5 0 1 0 1-2.3l-6-2.7a3.5 3.5 0 0 0 0-1L15 9a3.5 3.5 0 0 0 6-2.4c0-2-1.6-3.5-3.5-3.5Z" />
      </svg>
    ),
  },
  {
    label: "Grupla",
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M15 4H9v16h6V4Zm2 16h3a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3v16ZM4 4h3v16H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "Filtrele",
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 3a2 2 0 0 0-1.5 3.3l5.4 6v5c0 .4.3.9.6 1.1l3.1 2.3c1 .7 2.5 0 2.5-1.2v-7.1l5.4-6C21.6 5 20.7 3 19 3H5Z" />
      </svg>
    ),
  },
  {
    label: "Özelleştir",
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M9.586 2.586A2 2 0 0 1 11 2h2a2 2 0 0 1 2 2v.089l.473.196.063-.063a2.002 2.002 0 0 1 2.828 0l1.414 1.414a2 2 0 0 1 0 2.827l-.063.064.196.473H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-.089l-.196.473.063.063a2.002 2.002 0 0 1 0 2.828l-1.414 1.414a2 2 0 0 1-2.828 0l-.063-.063-.473.196V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.089l-.473-.196-.063.063a2.002 2.002 0 0 1-2.828 0l-1.414-1.414a2 2 0 0 1 0-2.827l.063-.064L4.089 15H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h.09l.195-.473-.063-.063a2 2 0 0 1 0-2.828l1.414-1.414a2 2 0 0 1 2.827 0l.064.063L9 4.089V4a2 2 0 0 1 .586-1.414ZM8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
      </svg>
    ),
  },
];

/** Durum renk tonu (sayı pili + kart çipi); AAA: 800 metin / 100 zemin. */
const STATUS_TONE: Record<TaskStatus, string> = {
  todo: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  in_progress: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

/** Durum dolu nokta rengi (taşı menüsü öğeleri + kolon başlığı). */
const STATUS_DOT: Record<TaskStatus, string> = {
  todo: "bg-blue-600",
  in_progress: "bg-amber-500",
  done: "bg-green-600",
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

  // Mobilde sürükle-bırak zor → kartı dokunarak başka kolona taşı (status + sona ekle).
  const moveTask = (task: Task, target: TaskStatus) => {
    if (task.status === target) return;
    const count = tasks.filter((tk) => tk.status === target).length;
    updateTask.mutate(
      { id: task.id, body: { status: target, position: count } },
      {
        onSuccess: () => {
          const col = COLUMNS.find((c) => c.status === target);
          toast.show({ message: t("toast.moved", { column: col ? t(col.titleKey) : "" }), variant: "success" });
        },
        onError: (err) => toast.show({ message: apiErrorMessage(err), variant: "error" }),
      },
    );
  };

  const q = search.trim().toLowerCase();
  // Tek geçişte status'a göre grupla + q filtrele + position sırala (her kolonda
  // tüm listeyi yeniden filtrelemek yerine). Davranış aynı; tasks/q değişince yeniden.
  const visibleByStatus = useMemo(() => {
    const matches = (tk: Task) =>
      !q || tk.title.toLowerCase().includes(q) || tk.description.toLowerCase().includes(q);
    const buckets = new Map<TaskStatus, Task[]>();
    for (const tk of tasks) {
      if (!matches(tk)) continue;
      const arr = buckets.get(tk.status);
      if (arr) arr.push(tk);
      else buckets.set(tk.status, [tk]);
    }
    for (const arr of buckets.values()) arr.sort((a, b) => a.position - b.position);
    return buckets;
  }, [tasks, q]);
  const visibleTasks = (status: TaskStatus): Task[] => visibleByStatus.get(status) ?? [];

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
      <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 grid grid-cols-12 gap-4 border-b border-gray-200 bg-white pb-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="col-span-full mx-4 mt-3">
          <nav className="mb-2 flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
              <li className="hidden items-center sm:inline-flex">
                <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-700 dark:text-gray-400 dark:hover:text-white">
                  <svg className="me-2.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M11.3 3.3a1 1 0 0 1 1.4 0l6 6 2 2a1 1 0 0 1-1.4 1.4l-.3-.3V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3c0 .6-.4 1-1 1H7a2 2 0 0 1-2-2v-6.6l-.3.3a1 1 0 0 1-1.4-1.4l2-2 6-6Z" clipRule="evenodd" />
                  </svg>
                  {t("breadcrumb.home")}
                </a>
              </li>
              <li className="hidden sm:block">
                <div className="flex items-center">
                  <svg className="mx-1 h-4 w-4 text-gray-400 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7" />
                  </svg>
                  <a href="#" className="ms-1 whitespace-nowrap text-sm font-medium text-gray-700 hover:text-primary-700 dark:text-gray-400 dark:hover:text-white md:ms-2">{t("breadcrumb.projectManagement")}</a>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="mx-1 hidden h-4 w-4 text-gray-400 sm:block rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7" />
                  </svg>
                  <span className="ms-1 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2">{t("breadcrumb.tasks")}</span>
                </div>
              </li>
            </ol>
          </nav>
          <div className="flex items-center gap-2 xl:justify-between">
            <div className="relative flex-1 xl:max-w-96 xl:flex-none">
              <label htmlFor="simple-search" className="sr-only">{t("search.label")}</label>
              <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3"><svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" /></svg></span>
              <input type="text" id="simple-search" value={search} onChange={(e) => setSearch(e.target.value)} aria-label={t("search.label")} placeholder={t("search.placeholder")} className="h-10 w-full rounded-lg border border-gray-300 bg-surface ps-9 pe-3 text-base text-ink transition-[border-color,box-shadow] duration-[var(--dur-pop)] ease-[var(--ease-out)] hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 md:text-sm dark:border-gray-600" />
            </div>

            {/* Mobil/tablet: aksiyonlar 3-nokta (kebab) menüde — yükseklik tasarrufu */}
            <Dropdown
              label={t("group.title")}
              align="end"
              menuWidth="w-44"
              triggerClassName="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 xl:hidden"
              trigger={
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="5" r="1.8" />
                  <circle cx="12" cy="12" r="1.8" />
                  <circle cx="12" cy="19" r="1.8" />
                </svg>
              }
            >
              {TOOLBAR_ACTIONS.map((a) => (
                <DropdownItem key={a.label} onSelect={() => {}}>
                  <span className="text-ink-2">{a.icon}</span> {a.label}
                </DropdownItem>
              ))}
            </Dropdown>

            {/* Masaüstü: aksiyonlar satır içi */}
            <div className="hidden items-center gap-2 xl:flex">
              {TOOLBAR_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                >
                  {a.icon}
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-1 min-h-0 flex-col overflow-y-auto">
        {isError ? (
          <div className="px-4 py-6">
            <EmptyState title={t("state.errorTitle")} description={t("state.errorDescription")} />
          </div>
        ) : (
          <div className="mb-6 flex flex-col gap-4 px-4 lg:flex-row lg:items-start lg:gap-6">
                  {COLUMNS.map((column, colIndex) => {
                    const cards = visibleTasks(column.status);
                    return (
                      <div key={column.status} className="w-full min-w-0 lg:flex-1 lg:max-w-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 py-2.5 text-base font-semibold text-gray-900 dark:text-gray-300">
                            {t(column.titleKey)}
                            <span className={"rounded-full px-2 py-0.5 text-xs font-semibold " + STATUS_TONE[column.status]}>{cards.length}</span>
                          </div>
                        </div>

                        <div id={`kanban-list-${colIndex + 1}`} data-status={column.status} className="mb-3 space-y-2.5">
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
                                    <div key={task.id} data-task-id={task.id} className="flex min-h-[5.25rem] cursor-move flex-col rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm transition-shadow duration-[var(--dur-pop)] ease-[var(--ease-out)] hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                                      <div className="flex items-center justify-between gap-2">
                                        <Dropdown
                                          label={t("card.moveTo")}
                                          align="start"
                                          menuWidth="w-44"
                                          triggerClassName={"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ring-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand " + STATUS_TONE[column.status]}
                                          trigger={
                                            <>
                                              <span className={"h-2 w-2 shrink-0 rounded-full " + STATUS_DOT[column.status]} aria-hidden />
                                              {t(column.titleKey)}
                                              <svg className="h-3.5 w-3.5 shrink-0 opacity-80" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </>
                                          }
                                        >
                                          {COLUMNS.map((c) => (
                                            <DropdownItem key={c.status} onSelect={() => moveTask(task, c.status)}>
                                              <span className={"h-2.5 w-2.5 shrink-0 rounded-full " + STATUS_DOT[c.status]} aria-hidden />
                                              <span className="flex-1">{t(c.titleKey)}</span>
                                              {c.status === column.status ? (
                                                <svg className="h-4 w-4 shrink-0 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" /></svg>
                                              ) : null}
                                            </DropdownItem>
                                          ))}
                                        </Dropdown>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                          {due && (
                                            <span className="inline-flex items-center gap-1 whitespace-nowrap text-[0.6875rem] font-medium tabular-nums text-gray-500 dark:text-gray-400">
                                              <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                              </svg>
                                              {due}
                                            </span>
                                          )}
                                          <button type="button" onClick={() => openEditTask(task)} aria-label={t("taskModal.editTask")} className="-mr-1 rounded-lg p-1 text-gray-400 transition-transform motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand dark:text-gray-400 dark:hover:bg-gray-700">
                                            <svg className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                              <path fillRule="evenodd" d="M11.3 6.2H5a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h11c1.1 0 2-1 2-2.1V11l-4 4.2c-.3.3-.7.6-1.2.7l-2.7.6c-1.7.3-3.3-1.3-3-3.1l.6-2.9c.1-.5.4-1 .7-1.3l3-3.1Z" clipRule="evenodd" />
                                              <path fillRule="evenodd" d="M19.8 4.3a2.1 2.1 0 0 0-1-1.1 2 2 0 0 0-2.2.4l-.6.6 2.9 3 .5-.6a2.1 2.1 0 0 0 .6-1.5c0-.2 0-.5-.2-.8Zm-2.4 4.4-2.8-3-4.8 5-.1.3-.7 3c0 .3.3.7.6.6l2.7-.6.3-.1 4.7-5Z" clipRule="evenodd" />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                      <div className="mt-1.5 truncate text-sm font-semibold text-gray-900 dark:text-white">{task.title}</div>
                                      {task.description && (
                                        <div className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">{task.description}</div>
                                      )}
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
            <DateField id="new-dueDate" value={newDraft.dueDate} onChange={(v) => setNewDraft({ ...newDraft, dueDate: v })} aria-label={t("taskModal.dueDate")} />
          </div>
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center">
            <button type="button" onClick={() => setNewOpen(false)} className="btn w-full justify-center sm:w-auto">
              {t("taskModal.cancel")}
            </button>
            <button type="submit" disabled={createTask.isPending} className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
              <svg className="-ms-0.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5" />
              </svg>
              {t("taskModal.create")}
              <span className="sr-only">{t("sr.addEvent")}</span>
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
            <DateField id="edit-dueDate" value={editDraft.dueDate} onChange={(v) => setEditDraft({ ...editDraft, dueDate: v })} aria-label={t("taskModal.dueDate")} />
          </div>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={deleteEditTask} disabled={deleteTask.isPending} className="btn btn-danger order-last w-full disabled:cursor-not-allowed disabled:opacity-60 sm:order-none sm:w-auto">
              <svg className="h-4 w-4 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clipRule="evenodd" />
              </svg>
              {t("rowMenu.delete")}
            </button>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button type="button" onClick={() => setEditOpen(false)} className="btn w-full justify-center sm:w-auto">
                {t("taskModal.cancel")}
              </button>
              <button type="submit" disabled={updateTask.isPending} className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                {t("taskModal.editTask")}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
