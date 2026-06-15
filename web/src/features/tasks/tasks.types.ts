/** Tasks (Kanban) API tipleri — /v1/tasks sözleşmesine göre. */

export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee_user_id: string | null;
  position: number;
  due_date: string | null;
  created_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  assignee_user_id?: string | null;
  due_date?: string | null;
  position?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignee_user_id?: string | null;
  due_date?: string | null;
  position?: number;
}
