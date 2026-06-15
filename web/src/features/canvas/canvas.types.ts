/** Canvas (AI blok panosu) API tipleri — /v1/canvas sözleşmesine göre. */

export type BlockType =
  | "summary"
  | "action"
  | "table"
  | "checklist"
  | "metric"
  | "note";

export const BLOCK_TYPES: BlockType[] = [
  "summary",
  "action",
  "table",
  "checklist",
  "metric",
  "note",
];

export interface CanvasBlock {
  id: string;
  type: BlockType;
  title: string;
  content: string;
  position: number;
  created_at: string;
}

export interface CreateCanvasBlockRequest {
  type: BlockType;
  title?: string;
  content?: string;
  position?: number;
}

export interface UpdateCanvasBlockRequest {
  type?: BlockType;
  title?: string;
  content?: string;
  position?: number;
}
