import { KanbanBoard } from "./KanbanBoard";

/**
 * Flowbite "kanban" sayfası. SortableJS bağlama ve sürükle-bırak persist'i
 * KanbanBoard içinde yapılır (orada CRUD state'ine erişimi var), böylece yeni
 * sıralama/kolon localStorage'a yazılır.
 */
export function TasksPage() {
  return <KanbanBoard />;
}
