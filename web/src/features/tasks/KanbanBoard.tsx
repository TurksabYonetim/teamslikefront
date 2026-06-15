import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Sortable from "sortablejs";
import { Modal } from "flowbite";
import { useInitFlowbite } from "@/lib/flowbite";
import { Skeleton, EmptyState, useToast } from "@/components/ui";
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

  const newModalRef = useRef<Modal | null>(null);
  const editModalRef = useRef<Modal | null>(null);

  const [targetStatus, setTargetStatus] = useState<TaskStatus | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [newDraft, setNewDraft] = useState<TaskDraft>(EMPTY_DRAFT);
  const [editDraft, setEditDraft] = useState<TaskDraft>(EMPTY_DRAFT);

  useEffect(() => {
    const opts = { backdrop: "dynamic" as const, closable: true };
    const init = (id: string) => {
      const el = document.getElementById(id);
      return el ? new Modal(el, opts) : null;
    };
    newModalRef.current = init("newTaskModal");
    editModalRef.current = init("editTaskModal");
    return () => {
      newModalRef.current?.hide();
      editModalRef.current?.hide();
    };
  }, []);

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
          easing: "cubic-bezier(0, 0.55, 0.45, 1)",
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
    newModalRef.current?.show();
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
          newModalRef.current?.hide();
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
    editModalRef.current?.show();
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
          editModalRef.current?.hide();
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
        editModalRef.current?.hide();
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
          <div className="justify-between xl:flex">
            <div className="mb-3 border-b border-gray-200 pb-4 dark:border-gray-700 xl:mb-0 xl:border-b-0 xl:pb-0">
              <label htmlFor="simple-search" className="sr-only">{t("search.label")}</label>
              <div className="relative w-full">
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                  <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                  </svg>
                </div>
                <input type="text" id="simple-search" value={search} onChange={(e) => setSearch(e.target.value)} className="block w-96 rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-9 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder={t("search.placeholder")} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 xl:gap-4">
              <button id="dropdownShare" data-dropdown-toggle="dropdown-share" type="button" className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
                <svg className="me-2 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.5 3A3.5 3.5 0 0 0 14 7L8.1 9.8A3.5 3.5 0 0 0 2 12a3.5 3.5 0 0 0 6.1 2.3l6 2.7-.1.5a3.5 3.5 0 1 0 1-2.3l-6-2.7a3.5 3.5 0 0 0 0-1L15 9a3.5 3.5 0 0 0 6-2.4c0-2-1.6-3.5-3.5-3.5Z" />
                </svg>
                {t("share.button")}
              </button>
              {/* Share dropdown menu */}
              <div action="#" method="get" id="dropdown-share" className="z-10 hidden max-w-xs rounded-lg bg-white p-3 shadow-sm dark:bg-gray-700" aria-labelledby="dropdownShare">
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white">{t("share.title")}</h5>
                <div className="my-4">
                  <label htmlFor="names" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{t("share.namesLabel")}</label>
                  <input type="text" id="names" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder={t("share.namesPlaceholder")} required />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t("share.namesHint")}</p>
                </div>
                <div className="mb-4">
                  <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{t("share.messageLabel")}</label>
                  <textarea id="message" rows={4} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder={t("share.messagePlaceholder")}></textarea>
                </div>
                <div className="inline-flex items-center space-x-4">
                  <button type="button" className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-center text-xs font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
                    <svg className="-ms-0.5 me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.2 9.8a3.4 3.4 0 0 0-4.8 0L5 13.2A3.4 3.4 0 0 0 9.8 18l.3-.3m-.3-4.5a3.4 3.4 0 0 0 4.8 0L18 9.8A3.4 3.4 0 0 0 13.2 5l-1 1" />
                    </svg>
                    {t("share.copyLink")}
                  </button>
                  <button type="button" className="inline-flex items-center rounded-lg bg-primary-700 px-3 py-2 text-center text-xs font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                    <svg className="-ms-0.5 me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.5 3A3.5 3.5 0 0 0 14 7L8.1 9.8A3.5 3.5 0 0 0 2 12a3.5 3.5 0 0 0 6.1 2.3l6 2.7-.1.5a3.5 3.5 0 1 0 1-2.3l-6-2.7a3.5 3.5 0 0 0 0-1L15 9a3.5 3.5 0 0 0 6-2.4c0-2-1.6-3.5-3.5-3.5Z" />
                    </svg>
                    {t("share.share")}
                  </button>
                </div>
              </div>
              <button id="dropdownGroup" data-dropdown-toggle="dropdown-group" type="button" className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
                <svg className="me-2 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M15 4H9v16h6V4Zm2 16h3a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3v16ZM4 4h3v16H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" clipRule="evenodd" />
                </svg>
                {t("group.button")}
              </button>
              {/* Dropdown menu */}
              <div id="dropdown-group" className="z-10 hidden w-56 rounded-lg bg-white p-3 shadow-sm dark:bg-gray-700">
                <h5 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{t("group.title")}</h5>
                <ul className="space-y-3 text-sm" aria-labelledby="dropdownGroup">
                  <li className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input id="status" type="checkbox" value="" className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                      <svg className="me-1 ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M8 3c0-.6.4-1 1-1h6c.6 0 1 .4 1 1h2a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h2Zm6 1h-4v2H9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2h-1V4Zm-6 8c0-.6.4-1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm1 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Z" clipRule="evenodd" />
                      </svg>
                      <label htmlFor="status" className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"> {t("group.status")} </label>
                    </div>
                    <div className="text-gray-400">244</div>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input id="priority" type="checkbox" value="" className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                      <svg className="me-1 ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z" clipRule="evenodd" />
                      </svg>
                      <label htmlFor="priority" className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"> {t("group.priority")} </label>
                    </div>
                    <div className="text-gray-400">123</div>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input id="assignee" type="checkbox" value="" className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                      <svg className="me-1 ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 8a4 4 0 0 0-4 4c0 1.1.9 2 2 2h7a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-3Zm6.8-3.1a5.5 5.5 0 0 0-2.8-6.3c.6-.4 1.3-.6 2-.6a3.5 3.5 0 0 1 .8 6.9Zm2.2 7.1h.5a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-1.1l-.5.8c1.9 1 3.1 3 3.1 5.2ZM4 7.5a3.5 3.5 0 0 1 5.5-2.9A5.5 5.5 0 0 0 6.7 11 3.5 3.5 0 0 1 4 7.5ZM7.1 12H6a4 4 0 0 0-4 4c0 1.1.9 2 2 2h.5a6 6 0 0 1 3-5.2l-.4-.8Z" clipRule="evenodd" />
                      </svg>
                      <label htmlFor="assignee" className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"> {t("group.assignee")} </label>
                    </div>
                    <div className="text-gray-400">22</div>
                  </li>
                  <li className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input id="category" type="checkbox" value="" className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                      <svg className="me-1 ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M6 5c0-1.1.9-2 2-2h4.2a2 2 0 0 1 1.6.9L15.2 6H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2v-5a3 3 0 0 0-3-3h-3.2l-1.2-1.7A3 3 0 0 0 9.2 6H6V5Z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M3 9c0-1.1.9-2 2-2h4.2a2 2 0 0 1 1.6.9l1.4 2.1H3V9Zm0 3v7c0 1.1.9 2 2 2h11a2 2 0 0 0 2-2v-7H3Z" clipRule="evenodd" />
                      </svg>
                      <label htmlFor="category" className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"> {t("group.category")} </label>
                    </div>
                    <div className="text-gray-400">22</div>
                  </li>
                </ul>
              </div>
              <button id="dropdownFilter" data-dropdown-toggle="dropdown-filter" type="button" className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
                <svg className="me-2 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 3a2 2 0 0 0-1.5 3.3l5.4 6v5c0 .4.3.9.6 1.1l3.1 2.3c1 .7 2.5 0 2.5-1.2v-7.1l5.4-6C21.6 5 20.7 3 19 3H5Z" />
                </svg>
                {t("filter.button")}
              </button>
              {/* Filter dropdown menu */}
              <div action="#" method="get" id="dropdown-filter" className="z-10 hidden w-64 rounded-lg bg-white p-3 shadow-sm dark:bg-gray-700" aria-labelledby="dropdownFilter">
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white">{t("filter.title")}</h5>
                <div className="my-4">
                  <h6 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{t("filter.assignee")}</h6>
                  <div className="flex flex-wrap gap-1.5">
                    <a href="#" data-tooltip-target="user-1" className="shrink-0"><img className="h-6 w-6 rounded-full" src="/images/users/bonnie-green.png" alt="Bonnie avatar" /></a>
                    <div id="user-1" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-300 dark:bg-gray-600">
                      Bonnie Green
                      <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                    <a href="#" data-tooltip-target="user-2" className="shrink-0"><img className="h-6 w-6 rounded-full" src="/images/users/helene-engels.png" alt="Helene avatar" /></a>
                    <div id="user-2" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-300 dark:bg-gray-600">
                      Helene Engels
                      <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                    <a href="#" data-tooltip-target="user-3" className="shrink-0"><img className="h-6 w-6 rounded-full" src="/images/users/jese-leos.png" alt="Jese avatar" /></a>
                    <div id="user-3" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-300 dark:bg-gray-600">
                      Jese Leos
                      <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                    <a href="#" data-tooltip-target="user-4" className="shrink-0"><img className="h-6 w-6 rounded-full" src="/images/users/joseph-mcfall.png" alt="Joseph avatar" /></a>
                    <div id="user-4" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-300 dark:bg-gray-600">
                      Joseph McFall
                      <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                    <a href="#" data-tooltip-target="user-5" className="shrink-0"><img className="h-6 w-6 rounded-full" src="/images/users/sofia-mcguire.png" alt="Sofia avatar" /></a>
                    <div id="user-5" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-300 dark:bg-gray-600">
                      Sofia Mcguire
                      <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                    <a href="#" data-tooltip-target="user-6" className="shrink-0"><img className="h-6 w-6 rounded-full" src="/images/users/thomas-lean.png" alt="Thomas avatar" /></a>
                    <div id="user-6" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-300 dark:bg-gray-600">
                      Thomas Lean
                      <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                    <a href="#" data-tooltip-target="user-7" className="shrink-0"><img className="h-6 w-6 rounded-full" src="/images/users/michael-gough.png" alt="Micheal avatar" /></a>
                    <div id="user-7" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-300 dark:bg-gray-600">
                      Micheal Gough
                      <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                    <a href="#" data-tooltip-target="user-8" className="shrink-0"><img className="h-6 w-6 rounded-full" src="/images/users/neil-sims.png" alt="Neil avatar" /></a>
                    <div id="user-8" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-300 dark:bg-gray-600">
                      Neil Sims
                      <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                    <a href="#" data-tooltip-target="user-9" className="shrink-0"><img className="h-6 w-6 rounded-full" src="/images/users/roberta-casas.png" alt="Roberta avatar" /></a>
                    <div id="user-9" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-300 dark:bg-gray-600">
                      Roberta Casas
                      <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                    <a href="#" data-tooltip-target="user-10" className="shrink-0"><img className="h-6 w-6 rounded-full" src="/images/users/karen-nelson.png" alt="Karen avatar" /></a>
                    <div id="user-10" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-300 dark:bg-gray-600">
                      Karen Nelson
                      <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                    <a href="#" data-tooltip-target="user-11" className="shrink-0"><img className="h-6 w-6 rounded-full" src="/images/users/thomas-lean.png" alt="Thomas avatar" /></a>
                    <div id="user-11" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-300 dark:bg-gray-600">
                      Thomas
                      <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                    <a href="#" data-tooltip-target="user-12" className="shrink-0"><img className="h-6 w-6 rounded-full" src="/images/users/neil-sims.png" alt="Neil avatar" /></a>
                    <div id="user-12" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-300 dark:bg-gray-600">
                      Neil Sims
                      <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                    <a href="#" data-tooltip-target="user-13" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400 dark:hover:bg-gray-500 dark:hover:text-white">
                      <svg className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5" />
                      </svg>
                      <span className="sr-only">{t("filter.addNewUser")}</span>
                    </a>
                    <div id="user-13" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-300 dark:bg-gray-600">
                      {t("filter.addNewUser")}
                      <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white"> {t("filter.category")} </label>
                  <ul className="mt-2 grid w-full grid-cols-2 gap-3">
                    <li>
                      <input type="checkbox" id="completed" name="category" value="" className="peer hidden" />
                      <label htmlFor="completed" className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-gray-100 p-2 text-center text-sm font-medium text-gray-500 hover:border-primary-700 hover:bg-primary-700 hover:text-white peer-checked:border-primary-700 peer-checked:bg-primary-700 peer-checked:text-white dark:border-gray-500 dark:bg-gray-600 dark:text-gray-100 dark:hover:border-primary-600 dark:hover:bg-primary-600 dark:hover:text-white dark:peer-checked:bg-primary-600">
                        {t("filter.completed")}
                      </label>
                    </li>
                    <li>
                      <input type="checkbox" id="progress" name="category" value="" className="peer hidden" />
                      <label htmlFor="progress" className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-gray-100 p-2 text-center text-sm font-medium text-gray-500 hover:border-primary-700 hover:bg-primary-700 hover:text-white peer-checked:border-primary-700 peer-checked:bg-primary-700 peer-checked:text-white dark:border-gray-500 dark:bg-gray-600 dark:text-gray-100 dark:hover:border-primary-600 dark:hover:bg-primary-600 dark:hover:text-white dark:peer-checked:bg-primary-600">
                        {t("filter.inProgress")}
                      </label>
                    </li>
                    <li>
                      <input type="checkbox" id="todo" name="category" value="" className="peer hidden" defaultChecked />
                      <label htmlFor="todo" className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-gray-100 p-2 text-center text-sm font-medium text-gray-500 hover:border-primary-700 hover:bg-primary-700 hover:text-white peer-checked:border-primary-700 peer-checked:bg-primary-700 peer-checked:text-white dark:border-gray-500 dark:bg-gray-600 dark:text-gray-100 dark:hover:border-primary-600 dark:hover:bg-primary-600 dark:hover:text-white dark:peer-checked:bg-primary-600">
                        {t("filter.toDo")}
                      </label>
                    </li>

                    <li>
                      <input type="checkbox" id="canceled" name="category" value="" className="peer hidden" />
                      <label htmlFor="canceled" className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-gray-100 p-2 text-center text-sm font-medium text-gray-500 hover:border-primary-700 hover:bg-primary-700 hover:text-white peer-checked:border-primary-700 peer-checked:bg-primary-700 peer-checked:text-white dark:border-gray-500 dark:bg-gray-600 dark:text-gray-100 dark:hover:border-primary-600 dark:hover:bg-primary-600 dark:hover:text-white dark:peer-checked:bg-primary-600">
                        {t("filter.canceled")}
                      </label>
                    </li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h6 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{t("filter.type")}</h6>
                  <ul className="space-y-2 text-sm" aria-labelledby="dropdownFilter">
                    <li>
                      <label className="flex w-full items-center rounded-md px-1.5 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                        <input type="checkbox" value="" className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                        {t("filter.all")}
                      </label>
                    </li>

                    <li>
                      <label className="flex w-full items-center rounded-md px-1.5 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                        <input type="checkbox" value="" className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                        {t("filter.issue")}
                      </label>
                    </li>

                    <li>
                      <label className="flex w-full items-center rounded-md px-1.5 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                        <input type="checkbox" value="" className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                        {t("filter.feature")}
                      </label>
                    </li>

                    <li>
                      <label className="flex w-full items-center rounded-md px-1.5 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                        <input type="checkbox" value="" className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                        {t("filter.planned")}
                      </label>
                    </li>

                    <li>
                      <label className="flex w-full items-center rounded-md px-1.5 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                        <input type="checkbox" value="" defaultChecked className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                        {t("filter.sprint")}
                      </label>
                    </li>

                    <li>
                      <label className="flex w-full items-center rounded-md px-1.5 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                        <input type="checkbox" value="" className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                        {t("filter.milestone")}
                      </label>
                    </li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h6 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{t("filter.labels")}</h6>
                  <div className="flex-wrap gap-1.5">
                    <a href="#" className="rounded-sm bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Design</a>
                    <a href="#" className="rounded-sm bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">React</a>
                    <a href="#" className="rounded-sm bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">SEO</a>
                    <a href="#" className="rounded-sm bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Marketing</a>
                    <a href="#" className="rounded-sm bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Branding</a>
                  </div>
                </div>
                <div className="mb-4">
                  <h6 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{t("filter.priority")}</h6>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <label className="flex w-full items-center rounded-md px-1.5 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                        <input type="checkbox" value="" className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                        {t("filter.high")}
                      </label>
                    </li>

                    <li>
                      <label className="flex w-full items-center rounded-md px-1.5 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                        <input type="checkbox" value="" className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                        {t("filter.medium")}
                      </label>
                    </li>

                    <li>
                      <label className="flex w-full items-center rounded-md px-1.5 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                        <input type="checkbox" value="" className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                        {t("filter.low")}
                      </label>
                    </li>

                    <li>
                      <label className="flex w-full items-center rounded-md px-1.5 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                        <input type="checkbox" value="" className="mr-2 h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                        {t("filter.lowest")}
                      </label>
                    </li>
                  </ul>
                </div>
                <div className="mb-4">
                  <h6 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{t("filter.assignedTo")}</h6>
                  <ul className="space-y-2 text-sm" aria-labelledby="dropdownFilter">
                    <li>
                      <label htmlFor="default-radio-1" className="flex w-full items-center rounded-md px-1.5 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                        <input id="default-radio-1" type="radio" value="" name="assigned-radio" className="me-2 h-4 w-4 border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                        {t("filter.assignedToMe")}
                      </label>
                    </li>

                    <li>
                      <label htmlFor="default-radio-2" className="flex w-full items-center rounded-md px-1.5 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600">
                        <input id="default-radio-2" type="radio" value="" name="assigned-radio" className="me-2 h-4 w-4 border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                        {t("filter.allTeam")}
                      </label>
                    </li>
                  </ul>
                </div>
                <button type="button" className="inline-flex w-full items-center justify-center rounded-lg bg-primary-700 px-3 py-2 text-center text-xs font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                  {t("filter.apply")}
                </button>
              </div>
              <button id="dropdownCustomize" data-dropdown-toggle="dropdown-customize" type="button" className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
                <svg className="me-2 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M9.586 2.586A2 2 0 0 1 11 2h2a2 2 0 0 1 2 2v.089l.473.196.063-.063a2.002 2.002 0 0 1 2.828 0l1.414 1.414a2 2 0 0 1 0 2.827l-.063.064.196.473H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-.089l-.196.473.063.063a2.002 2.002 0 0 1 0 2.828l-1.414 1.414a2 2 0 0 1-2.828 0l-.063-.063-.473.196V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.089l-.473-.196-.063.063a2.002 2.002 0 0 1-2.828 0l-1.414-1.414a2 2 0 0 1 0-2.827l.063-.064L4.089 15H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h.09l.195-.473-.063-.063a2 2 0 0 1 0-2.828l1.414-1.414a2 2 0 0 1 2.827 0l.064.063L9 4.089V4a2 2 0 0 1 .586-1.414ZM8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
                </svg>
                {t("customize.button")}
              </button>
              {/* Dropdown menu */}
              <div id="dropdown-customize" className="z-10 hidden w-48 rounded-lg bg-white p-3 shadow-sm dark:bg-gray-700">
                <h5 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{t("customize.title")}</h5>
                <ul className="space-y-3 text-sm" aria-labelledby="dropdownCustomize">
                  <li className="flex items-center">
                    <input id="status-2" type="checkbox" value="" className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                    <svg className="me-1 ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M8 3c0-.6.4-1 1-1h6c.6 0 1 .4 1 1h2a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h2Zm6 1h-4v2H9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2h-1V4Zm-6 8c0-.6.4-1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm1 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Z" clipRule="evenodd" />
                    </svg>
                    <label htmlFor="status-2" className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"> {t("group.status")} </label>
                  </li>
                  <li className="flex items-center">
                    <input id="key" type="checkbox" value="" className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                    <svg className="me-1 ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 5a2 2 0 0 0-2 2v2.5c0 .6.4 1 1 1a1.5 1.5 0 1 1 0 3 1 1 0 0 0-1 1V17a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2.5a1 1 0 0 0-1-1 1.5 1.5 0 1 1 0-3 1 1 0 0 0 1-1V7a2 2 0 0 0-2-2H4Z" />
                    </svg>
                    <label htmlFor="key" className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"> {t("customize.key")} </label>
                  </li>
                  <li className="flex items-center">
                    <input id="type" type="checkbox" value="" className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                    <svg className="me-1 ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M9.6 2.6A2 2 0 0 1 11 2h2a2 2 0 0 1 2 2l.5.3a2 2 0 0 1 2.9 0l1.4 1.3a2 2 0 0 1 0 2.9l.1.5h.1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2l-.3.5a2 2 0 0 1 0 2.9l-1.3 1.4a2 2 0 0 1-2.9 0l-.5.1v.1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2l-.5-.3a2 2 0 0 1-2.9 0l-1.4-1.3a2 2 0 0 1 0-2.9l-.1-.5H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2l.3-.5a2 2 0 0 1 0-2.9l1.3-1.4a2 2 0 0 1 2.9 0l.5-.1V4c0-.5.2-1 .6-1.4ZM8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
                    </svg>
                    <label htmlFor="type" className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"> {t("customize.type")} </label>
                  </li>
                  <li className="flex items-center">
                    <input id="assignee-2" type="checkbox" value="" className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                    <svg className="me-1 ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 8a4 4 0 0 0-4 4c0 1.1.9 2 2 2h7a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-3Zm6.8-3.1a5.5 5.5 0 0 0-2.8-6.3c.6-.4 1.3-.6 2-.6a3.5 3.5 0 0 1 .8 6.9Zm2.2 7.1h.5a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-1.1l-.5.8c1.9 1 3.1 3 3.1 5.2ZM4 7.5a3.5 3.5 0 0 1 5.5-2.9A5.5 5.5 0 0 0 6.7 11 3.5 3.5 0 0 1 4 7.5ZM7.1 12H6a4 4 0 0 0-4 4c0 1.1.9 2 2 2h.5a6 6 0 0 1 3-5.2l-.4-.8Z" clipRule="evenodd" />
                    </svg>
                    <label htmlFor="assignee-2" className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"> {t("group.assignee")} </label>
                  </li>
                  <li className="flex items-center">
                    <input id="due_date" type="checkbox" value="" className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                    <svg className="me-1 ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M5 5c.6 0 1-.4 1-1a1 1 0 1 1 2 0c0 .6.4 1 1 1h1c.6 0 1-.4 1-1a1 1 0 1 1 2 0c0 .6.4 1 1 1h1c.6 0 1-.4 1-1a1 1 0 1 1 2 0c0 .6.4 1 1 1a2 2 0 0 1 2 2v1c0 .6-.4 1-1 1H4a1 1 0 0 1-1-1V7c0-1.1.9-2 2-2ZM3 19v-7c0-.6.4-1 1-1h16c.6 0 1 .4 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6-6c0-.6-.4-1-1-1a1 1 0 1 0 0 2c.6 0 1-.4 1-1Zm2 0a1 1 0 1 1 2 0c0 .6-.4 1-1 1a1 1 0 0 1-1-1Zm6 0c0-.6-.4-1-1-1a1 1 0 1 0 0 2c.6 0 1-.4 1-1ZM7 17a1 1 0 1 1 2 0c0 .6-.4 1-1 1a1 1 0 0 1-1-1Zm6 0c0-.6-.4-1-1-1a1 1 0 1 0 0 2c.6 0 1-.4 1-1Zm2 0a1 1 0 1 1 2 0c0 .6-.4 1-1 1a1 1 0 0 1-1-1Z" clipRule="evenodd" />
                    </svg>
                    <label htmlFor="due_date" className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"> {t("customize.dueDate")} </label>
                  </li>
                  <li className="flex items-center">
                    <input id="subtasks" type="checkbox" value="" className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                    <svg className="me-1 ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M9 2a1 1 0 0 0-1 1H6a2 2 0 0 0-2 2v15c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2c0-.6-.4-1-1-1H9Zm1 2h4v2h1a1 1 0 1 1 0 2H9a1 1 0 0 1 0-2h1V4Zm5.7 8.7a1 1 0 0 0-1.4-1.4L11 14.6l-1.3-1.3a1 1 0 0 0-1.4 1.4l2 2c.4.4 1 .4 1.4 0l4-4Z" clipRule="evenodd" />
                    </svg>
                    <label htmlFor="subtasks" className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"> {t("customize.subtasks")} </label>
                  </li>
                  <li className="flex items-center">
                    <input id="priority-2" type="checkbox" value="" className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                    <svg className="me-1 ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2 1 1 0 1 0 0-2Z" clipRule="evenodd" />
                    </svg>
                    <label htmlFor="priority-2" className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"> {t("group.priority")} </label>
                  </li>
                  <li className="flex items-center">
                    <input id="category-2" type="checkbox" value="" className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                    <svg className="me-1 ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M6 5c0-1.1.9-2 2-2h4.2a2 2 0 0 1 1.6.9L15.2 6H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2v-5a3 3 0 0 0-3-3h-3.2l-1.2-1.7A3 3 0 0 0 9.2 6H6V5Z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M3 9c0-1.1.9-2 2-2h4.2a2 2 0 0 1 1.6.9l1.4 2.1H3V9Zm0 3v7c0 1.1.9 2 2 2h11a2 2 0 0 0 2-2v-7H3Z" clipRule="evenodd" />
                    </svg>
                    <label htmlFor="category-2" className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"> {t("group.category")} </label>
                  </li>
                  <li className="flex items-center">
                    <input id="created" type="checkbox" value="" className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                    <svg className="me-1 ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M6 5V4a1 1 0 1 1 2 0v1h3V4a1 1 0 1 1 2 0v1h3V4a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v2H3V7c0-1.1.9-2 2-2h1ZM3 19v-8h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm5-6a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H8Z" clipRule="evenodd" />
                    </svg>
                    <label htmlFor="created" className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"> {t("customize.created")} </label>
                  </li>
                  <li className="flex items-center">
                    <input id="department" type="checkbox" value="" className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                    <svg className="me-1 ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M4 4c0-.6.4-1 1-1h14a1 1 0 1 1 0 2v14a1 1 0 1 1 0 2H5a1 1 0 1 1 0-2V5a1 1 0 0 1-1-1Zm5 2a1 1 0 0 0-1 1v1c0 .6.4 1 1 1h1c.6 0 1-.4 1-1V7c0-.6-.4-1-1-1H9Zm5 0a1 1 0 0 0-1 1v1c0 .6.4 1 1 1h1c.6 0 1-.4 1-1V7c0-.6-.4-1-1-1h-1Zm-5 4a1 1 0 0 0-1 1v1c0 .6.4 1 1 1h1c.6 0 1-.4 1-1v-1c0-.6-.4-1-1-1H9Zm5 0a1 1 0 0 0-1 1v1c0 .6.4 1 1 1h1c.6 0 1-.4 1-1v-1c0-.6-.4-1-1-1h-1Zm-3 4a2 2 0 0 0-2 2v3h2v-3h2v3h2v-3a2 2 0 0 0-2-2h-2Z" clipRule="evenodd" />
                    </svg>
                    <label htmlFor="department" className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"> {t("customize.department")} </label>
                  </li>
                  <li className="flex items-center">
                    <input id="updated" type="checkbox" value="" className="h-4 w-4 rounded-sm border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-primary-600" />
                    <svg className="me-1 ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm11-4a1 1 0 1 0-2 0v4c0 .3.1.5.3.7l3 3a1 1 0 0 0 1.4-1.4L13 11.6V8Z" clipRule="evenodd" />
                    </svg>
                    <label htmlFor="updated" className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"> {t("customize.updated")} </label>
                  </li>
                </ul>
              </div>
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
                <div className="mb-6 flex items-start justify-start space-x-4 px-4 relative">
                  {COLUMNS.map((column, colIndex) => {
                    const cards = visibleTasks(column.status);
                    return (
                      <div key={column.status} className="min-w-[28rem]">
                        <div className="flex items-center justify-between">
                          <div className="py-4 text-base font-semibold text-gray-900 dark:text-gray-300">
                            {t(column.titleKey)}
                            <span className="ml-2 text-sm font-normal text-gray-400">{cards.length}</span>
                          </div>
                        </div>

                        <div id={`kanban-list-${colIndex + 1}`} data-status={column.status} className="mb-4 min-w-[28rem] space-y-4">
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
                                    <div key={task.id} data-task-id={task.id} className="flex max-w-md cursor-move flex-col rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                                      <div className="flex items-center justify-between pb-4">
                                        <div className="text-base font-semibold text-gray-900 dark:text-white">{task.title}</div>
                                        <button type="button" onClick={() => openEditTask(task)} className="rounded-lg p-1.5 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700">
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

                        <button type="button" onClick={() => openNewTask(column.status)} className="flex w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-100 py-2 font-medium text-gray-500 hover:border-primary-700 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white">
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

      {/* New Task Modal */}
      <div id="newTaskModal" tabIndex={-1} aria-hidden="true" className="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0">
        <div className="relative max-h-full w-full max-w-md p-4">
          <div className="relative rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-5">
            <div className="mb-4 flex items-center justify-between dark:border-gray-600 sm:mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("taskModal.addNewTask")}</h3>
              <button type="button" onClick={() => newModalRef.current?.hide()} className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                </svg>
                <span className="sr-only">{t("sr.closeModal")}</span>
              </button>
            </div>
            <form onSubmit={submitNewTask}>
              <div className="mb-4 space-y-4">
                <div>
                  <label htmlFor="new-title" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{t("taskModal.title")}</label>
                  <input type="text" id="new-title" value={newDraft.title} onChange={(e) => setNewDraft({ ...newDraft, title: e.target.value })} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder={t("taskModal.titlePlaceholder")} required />
                </div>
                <div>
                  <label htmlFor="new-description" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{t("taskModal.description")}</label>
                  <textarea id="new-description" rows={6} value={newDraft.description} onChange={(e) => setNewDraft({ ...newDraft, description: e.target.value })} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder={t("taskModal.descriptionPlaceholder")}></textarea>
                </div>
                <div>
                  <label htmlFor="new-dueDate" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{t("taskModal.dueDate")}</label>
                  <input type="date" id="new-dueDate" value={newDraft.dueDate} onChange={(e) => setNewDraft({ ...newDraft, dueDate: e.target.value })} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                  <svg className="-ms-0.5 me-1.5 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5" />
                  </svg>
                  {t("taskModal.create")}
                  <span className="sr-only">{t("sr.addEvent")}</span>
                </button>
                <button type="button" onClick={() => newModalRef.current?.hide()} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
                  {t("taskModal.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      <div id="editTaskModal" tabIndex={-1} aria-hidden="true" className="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0">
        <div className="relative max-h-full w-full max-w-md p-4">
          <div className="relative rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-5">
            <div className="mb-4 flex items-center justify-between dark:border-gray-600 sm:mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("taskModal.editTask")}</h3>
              <div>
                <button type="button" onClick={deleteEditTask} className="inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700 dark:text-red-500 dark:hover:bg-gray-600">
                  <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clipRule="evenodd" />
                  </svg>
                  <span className="sr-only">{t("rowMenu.delete")}</span>
                </button>
                <button type="button" onClick={() => editModalRef.current?.hide()} className="inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                  </svg>
                  <span className="sr-only">{t("sr.closeModal")}</span>
                </button>
              </div>
            </div>
            <form onSubmit={submitEditTask}>
              <div className="mb-4 space-y-4">
                <div>
                  <label htmlFor="edit-title" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{t("taskModal.title")}</label>
                  <input type="text" id="edit-title" value={editDraft.title} onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder={t("taskModal.titlePlaceholder")} required />
                </div>
                <div>
                  <label htmlFor="edit-description" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{t("taskModal.description")}</label>
                  <textarea id="edit-description" rows={6} value={editDraft.description} onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" placeholder={t("taskModal.descriptionPlaceholderThoughts")}></textarea>
                </div>
                <div>
                  <label htmlFor="edit-dueDate" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">{t("taskModal.dueDate")}</label>
                  <input type="date" id="edit-dueDate" value={editDraft.dueDate} onChange={(e) => setEditDraft({ ...editDraft, dueDate: e.target.value })} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                  {t("taskModal.editTask")}
                </button>
                <button type="button" onClick={() => editModalRef.current?.hide()} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">
                  {t("taskModal.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
