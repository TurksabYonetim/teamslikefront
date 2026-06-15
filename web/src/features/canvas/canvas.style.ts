import type { BlockType } from "./canvas.types";

/** Blok tipi → rozet rengi (Tailwind sınıfları, renk-kodlu). */
export const TYPE_STYLES: Record<BlockType, string> = {
  summary: "bg-blue-50 text-blue-700",
  action: "bg-amber-50 text-amber-700",
  table: "bg-violet-50 text-violet-700",
  checklist: "bg-emerald-50 text-emerald-700",
  metric: "bg-rose-50 text-rose-700",
  note: "bg-gray-100 text-gray-700",
};

/** Tip seçici/önizleme için belirgin (dolu) rozet rengi. */
export const TYPE_STYLES_SOLID: Record<BlockType, string> = {
  summary: "bg-blue-500 text-white",
  action: "bg-amber-500 text-white",
  table: "bg-violet-500 text-white",
  checklist: "bg-emerald-500 text-white",
  metric: "bg-rose-500 text-white",
  note: "bg-gray-500 text-white",
};

export const TYPE_ICONS: Record<BlockType, string> = {
  summary: "inbox",
  action: "check",
  table: "grid",
  checklist: "checkCircle",
  metric: "star",
  note: "pencil",
};
