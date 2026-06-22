import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Select } from "@/components/ui";
import { CONTROL_HEIGHT } from "@/components/ui/controlSize";
import { useStore } from "@/lib/createStore";
import { workspaceStore } from "../workspace.store";
import { docProgress } from "../workspace.canvas";
import type { BlockType } from "../workspace.types";

const TYPES: BlockType[] = ["text", "heading", "todo", "divider"];

/**
 * Canvas — blok tabanlı belge düzenleme (Notion/Coda tarzı). Doküman seçici,
 * to-do ilerlemesi ve tip-duyarlı blok düzenleyiciler. Düzenlemeler doğrudan
 * workspace store'a akar.
 */
export function CanvasEditor() {
  const { t } = useTranslation("docs");
  const docs = useStore(workspaceStore, (s) => s.docs);
  const activeDocId = useStore(workspaceStore, (s) => s.activeDocId);
  const { toggleBlock, addBlock, editBlock, setActiveDoc } = workspaceStore.getState();
  const [content, setContent] = useState("");
  const [type, setType] = useState<BlockType>("text");

  const doc = docs.find((d) => d.id === activeDocId) ?? docs[0];
  if (!doc) return null;

  const prog = docProgress(doc.blocks);
  const add = () => {
    if (type !== "divider" && !content.trim()) return;
    addBlock(doc.id, type, content.trim());
    setContent("");
  };

  return (
    <div className="card min-w-0 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-3 border-b border-line pb-3 sm:mb-4 sm:pb-4">
        <Select
          value={doc.id}
          onChange={setActiveDoc}
          aria-label={t("canvas.selectDoc")}
          options={docs.map((d) => ({
            value: d.id,
            label: d.title,
          }))}
          className="w-full sm:w-64"
        />
        {prog.total > 0 ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-xs text-muted sm:ml-auto">
            {t("canvas.progress", { done: prog.done, total: prog.total })}
            <span
              className="inline-flex h-8 w-8"
              role="progressbar"
              aria-valuenow={prog.pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90" aria-hidden>
                <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={94.25}
                  strokeDashoffset={94.25 * (1 - prog.pct / 100)}
                  className="transition-[stroke-dashoffset] duration-500 ease-[var(--ease-out)] motion-reduce:transition-none"
                />
              </svg>
            </span>
            <span className="font-medium tabular-nums text-ink-2">{prog.pct}%</span>
          </span>
        ) : null}
      </div>

      <div className="space-y-1 sm:space-y-2">
        {doc.blocks.map((b) => {
          if (b.type === "heading")
            return (
              <input
                key={b.id}
                value={b.content}
                onChange={(e) => editBlock(doc.id, b.id, e.target.value)}
                aria-label={t("canvas.editBlock")}
                className="w-full rounded-md bg-transparent px-1 text-base font-semibold tracking-[-0.01em] text-ink outline-none transition-colors duration-[140ms] ease-[var(--ease-out)] focus:bg-surface-2 motion-reduce:transition-none sm:text-lg"
              />
            );
          if (b.type === "divider") return <hr key={b.id} className="border-line" />;
          if (b.type === "todo")
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => toggleBlock(doc.id, b.id)}
                aria-pressed={b.checked}
                className="flex min-h-9 w-full items-center gap-2 rounded-md px-1 py-1 text-left text-sm transition-colors hover:bg-surface-2 motion-reduce:transition-none sm:min-h-11 sm:py-1.5"
              >
                {b.checked ? (
                  <Icon name="checkCircle" className="h-5 w-5 shrink-0 text-ok" />
                ) : (
                  <span className="h-[18px] w-[18px] shrink-0 rounded-[5px] border-2 border-muted" aria-hidden />
                )}
                <span className={b.checked ? "text-muted line-through" : "text-ink"}>{b.content}</span>
              </button>
            );
          return (
            <input
              key={b.id}
              value={b.content}
              onChange={(e) => editBlock(doc.id, b.id, e.target.value)}
              aria-label={t("canvas.editBlock")}
              className="w-full rounded-md bg-transparent px-1 text-sm text-ink outline-none transition-colors duration-[140ms] ease-[var(--ease-out)] focus:bg-surface-2 motion-reduce:transition-none"
            />
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3 sm:mt-4 sm:flex-row sm:items-center sm:pt-4">
        <div className="w-full sm:w-44 sm:shrink-0">
          <Select<BlockType>
            value={type}
            onChange={setType}
            aria-label={t("canvas.blockTypeLabel")}
            options={TYPES.map((ty) => ({
              value: ty,
              label: t(`canvas.blockType.${ty}`),
            }))}
            className="w-full"
          />
        </div>
        {type !== "divider" ? (
          <div
            className={
              "flex min-w-0 items-center gap-1 rounded-lg border border-gray-300 bg-gray-50 pr-1 transition-[border-color,box-shadow] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 motion-reduce:transition-none sm:flex-1 " +
              CONTROL_HEIGHT
            }
          >
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder={t("canvas.blockPh")}
              aria-label={t("canvas.blockPh")}
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-base text-gray-900 outline-none placeholder:text-gray-500 md:text-sm"
            />
            <button
              type="button"
              onClick={add}
              disabled={!content.trim()}
              aria-label={t("canvas.addBlock")}
              className="grid aspect-square h-8 shrink-0 place-items-center rounded-md bg-blue-700 text-white transition-[background-color,transform] duration-[140ms] ease-[var(--ease-out)] hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-50 motion-safe:active:scale-95 motion-reduce:transition-none"
            >
              <Icon name="plus" className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={add}
            className={
              "btn btn-primary w-full transition-transform duration-[140ms] ease-[var(--ease-out)] active:scale-[0.97] motion-reduce:transition-none sm:w-auto sm:shrink-0 " +
              CONTROL_HEIGHT
            }
          >
            <Icon name="plus" className="h-4 w-4" /> {t("canvas.addBlock")}
          </button>
        )}
      </div>
    </div>
  );
}
