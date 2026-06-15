import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
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
    <div className="card p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          value={doc.id}
          onChange={(e) => setActiveDoc(e.target.value)}
          aria-label={t("canvas.selectDoc")}
          className="h-9 rounded-lg border border-line bg-surface px-2 text-lg font-bold text-ink"
        >
          {docs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
        {prog.total > 0 ? (
          <span className="ml-auto inline-flex items-center gap-2 text-sm text-muted">
            {t("canvas.progress", { done: prog.done, total: prog.total })}
            <span className="h-2 w-24 overflow-hidden rounded-full bg-surface-3">
              <span
                className="block h-full rounded-full bg-ok transition-[width] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none"
                style={{ width: `${prog.pct}%` }}
                aria-hidden
              />
            </span>
            {prog.pct}%
          </span>
        ) : null}
      </div>

      <div className="space-y-1.5">
        {doc.blocks.map((b) => {
          if (b.type === "heading")
            return (
              <input
                key={b.id}
                value={b.content}
                onChange={(e) => editBlock(doc.id, b.id, e.target.value)}
                aria-label={t("canvas.editBlock")}
                className="w-full rounded-md bg-transparent px-1 text-lg font-semibold text-ink outline-none focus:bg-surface-2"
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
                className="flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left text-sm transition-colors hover:bg-surface-2 motion-reduce:transition-none"
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
              className="w-full rounded-md bg-transparent px-1 text-sm text-ink outline-none focus:bg-surface-2"
            />
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-line pt-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as BlockType)}
          aria-label={t("canvas.blockTypeLabel")}
          className="h-10 rounded-lg border border-line bg-surface px-2 text-sm text-ink"
        >
          {TYPES.map((ty) => (
            <option key={ty} value={ty}>
              {t(`canvas.blockType.${ty}`)}
            </option>
          ))}
        </select>
        {type !== "divider" ? (
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder={t("canvas.blockPh")}
            aria-label={t("canvas.blockPh")}
            className="input h-10 flex-1"
          />
        ) : null}
        <button
          type="button"
          onClick={add}
          className="btn btn-primary btn-sm h-10 transition-transform duration-[140ms] ease-[var(--ease-out)] active:scale-[0.97] motion-reduce:transition-none"
        >
          <Icon name="plus" className="h-4 w-4" /> {t("canvas.addBlock")}
        </button>
      </div>
    </div>
  );
}
