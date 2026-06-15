/**
 * Docs & WorkHub bounded context — Coda "doc-as-app" + Basecamp + Slack
 * collaboration surfaces (Canvas, Board, Table, Workflows, Clips, Apps).
 *
 * Bu modül, çok yüzeyli çalışma alanının tip sözleşmesidir. Tüm yüzeyler ortak
 * bir `createStore` deposu (workspace.store / workhub.store) üzerinden gerçek
 * zamanlı işbirliğini simüle eder. Backend yok; localStorage mock'a hazırdır.
 */

/* ───────────── Canvas — blok tabanlı belge ───────────── */

export type BlockType = "heading" | "text" | "todo" | "divider";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  /** Yalnız "todo" bloklarında anlamlı. */
  checked?: boolean;
}

export interface Doc {
  id: string;
  /** Bu dokümanın ait olduğu workspace; undefined = her yerde görünür. */
  workspaceId?: string;
  title: string;
  blocks: Block[];
}

/* ───────────── Board — Kanban ───────────── */

export interface Column {
  id: string;
  title: string;
}

export interface Card {
  id: string;
  title: string;
  columnId: string;
  assigneeId?: string;
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  cards: Card[];
}

/* ───────────── Workflows — otomasyon ───────────── */

export type WorkflowTrigger = "message" | "schedule" | "reaction";
export type WorkflowStepKind = "send_message" | "assign" | "add_label" | "wait";

export interface WorkflowStep {
  id: string;
  kind: WorkflowStepKind;
  value: string;
}

export interface Workflow {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
}

export interface StepResult {
  id: string;
  label: string;
  status: "done";
}

/* ───────────── Clips — async video (Loom paritesi) ───────────── */

export type ClipPrivacy = "link" | "workspace" | "people";
export type ClipRecordMode = "screen" | "cam" | "bubble" | "screen_cam";

export interface ClipChapter {
  atSec: number;
  title: string;
}

export interface ClipComment {
  id: string;
  authorId: string;
  atSec: number;
  body: string;
}

export interface ClipReaction {
  emoji: string;
  count: number;
}

export interface Clip {
  id: string;
  title: string;
  authorId: string;
  durationSec: number;
  transcript: string;
  views: number;
  recordMode?: ClipRecordMode;
  privacy?: ClipPrivacy;
  password?: string;
  /** Public-link süre sonu (epoch ms); null/undefined = asla. */
  linkExpiresAt?: number | null;
  summary?: string;
  chapters?: ClipChapter[];
  tasks?: string[];
  fillerRemoved?: boolean;
  silenceRemoved?: boolean;
  ctaLabel?: string;
  ctaUrl?: string;
  ctaClicks?: number;
  comments?: ClipComment[];
  reactions?: ClipReaction[];
  /** Ortalama tamamlanma 0..1. */
  completionRate?: number;
  hashtags?: string[];
  archived?: boolean;
  /** Üretilen kişiselleştirilmiş kopya sayısı. */
  variablesCopies?: number;
}

/* ───────────── Collab WS olay sözleşmesi (`doc.*`) ───────────── */

export type DocsEvent =
  | { type: "doc.edited"; docId: string; blockId: string }
  | { type: "card.moved"; cardId: string; columnId: string }
  | { type: "todo.completed"; blockId: string }
  | { type: "workflow.ran"; workflowId: string }
  | { type: "clip.posted"; clip: Clip }
  | { type: "comment.added"; comment: DocComment };

/* ───────────── Apps: Approvals · Shifts · Forms ───────────── */

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalRequest {
  id: string;
  title: string;
  requesterId: string;
  approverId: string;
  status: ApprovalStatus;
  createdMin: number;
}

export interface Shift {
  id: string;
  userId: string; // "" = açık/atanmamış
  userName: string;
  day: number; // 0=Pazar … 6=Cmt
  startMin: number;
  endMin: number;
  role: string;
  open?: boolean;
}

export interface FormOption {
  id: string;
  text: string;
}

export interface FormDef {
  id: string;
  title: string;
  question: string;
  options: FormOption[];
}

export interface FormResponse {
  id: string;
  formId: string;
  optionId: string;
  responderId: string;
}

/* ───────────── İlişkisel tablo (Coda doc-as-app) ───────────── */

export type ColumnType = "text" | "number" | "date" | "select" | "person" | "formula";

export interface TableColumn {
  id: string;
  name: string;
  type: ColumnType;
  options?: string[]; // "select"
  formula?: string; // "formula", örn. "Qty * Price"
}

export interface TableRow {
  id: string;
  cells: Record<string, string>; // colId -> ham string
}

export interface DataTable {
  id: string;
  title: string;
  columns: TableColumn[];
  rows: TableRow[];
}

/* ───────────── Doc yorumları (satır içi işbirliği) ───────────── */

export interface DocComment {
  id: string;
  docId: string;
  blockId: string;
  authorId: string;
  body: string;
  atMin: number;
  resolved?: boolean;
}
