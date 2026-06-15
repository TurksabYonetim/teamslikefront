import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import {
  checklistProgress,
  parseChecklist,
  parseMetric,
  parseTable,
  toggleChecklistItem,
} from "./canvas.content";
import type { CanvasBlock } from "./canvas.types";

interface BlockBodyProps {
  block: CanvasBlock;
  /** Checklist öğesi toggle edildiğinde (yeni serileştirilmiş content). */
  onChecklistToggle?: (nextContent: string, itemIndex: number) => void;
  /** Düzenleme için checklist/table toggle dışı tıklamalarda çağrılır. */
  onOpen?: () => void;
}

/** Tipe göre blok gövdesini zengin biçimde render eder. */
export function BlockBody({ block, onChecklistToggle, onOpen }: BlockBodyProps) {
  const { t } = useTranslation("canvas");

  const empty = !block.content.trim();

  if (empty) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="text-left w-full text-sm text-muted italic transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97]"
      >
        {t("emptyContent")}
      </button>
    );
  }

  switch (block.type) {
    case "checklist":
      return (
        <ChecklistBody block={block} onChecklistToggle={onChecklistToggle} />
      );
    case "table":
      return <TableBody block={block} onOpen={onOpen} />;
    case "metric":
      return <MetricBody block={block} onOpen={onOpen} />;
    default:
      return (
        <button
          type="button"
          onClick={onOpen}
          className="text-left w-full text-sm text-muted leading-relaxed whitespace-pre-wrap line-clamp-6 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97]"
        >
          {block.content}
        </button>
      );
  }
}

/* ------------------------------ Checklist ------------------------------ */

function ChecklistBody({
  block,
  onChecklistToggle,
}: Pick<BlockBodyProps, "block" | "onChecklistToggle">) {
  const items = parseChecklist(block.content);
  const { done, total } = checklistProgress(items);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="space-y-2">
      {total > 0 && (
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-surface-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 will-change-[width]"
              style={{
                width: `${pct}%`,
                transition: "width 240ms var(--ease-out)",
              }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted shrink-0">
            {done}/{total}
          </span>
        </div>
      )}
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.index}>
            <button
              type="button"
              onClick={() =>
                onChecklistToggle?.(
                  toggleChecklistItem(block.content, it.index),
                  it.index,
                )
              }
              className="flex items-start gap-2 text-left w-full group/check transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.99]"
            >
              <span
                className={
                  "mt-0.5 grid place-items-center h-4 w-4 shrink-0 rounded border " +
                  (it.checked
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-line text-transparent group-hover/check:border-emerald-400")
                }
                style={{ transition: "background-color 160ms var(--ease-out), border-color 160ms var(--ease-out)" }}
              >
                <Icon name="check" className="w-3 h-3" />
              </span>
              <span
                className={
                  "text-sm leading-snug " +
                  (it.checked ? "text-muted line-through" : "text-ink")
                }
              >
                {it.text}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------- Table -------------------------------- */

function TableBody({ block, onOpen }: Pick<BlockBodyProps, "block" | "onOpen">) {
  const { header, rows } = parseTable(block.content);
  if (!header) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="text-left w-full text-sm text-muted whitespace-pre-wrap line-clamp-4"
      >
        {block.content}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      className="block w-full overflow-x-auto text-left transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.99]"
    >
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {header.map((h, i) => (
              <th
                key={i}
                className="text-left font-medium text-ink border-b border-line px-2 py-1 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-line/60 last:border-0">
              {header.map((_, ci) => (
                <td
                  key={ci}
                  className="px-2 py-1 text-muted align-top whitespace-nowrap"
                >
                  {row[ci] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </button>
  );
}

/* -------------------------------- Metric ------------------------------- */

function MetricBody({
  block,
  onOpen,
}: Pick<BlockBodyProps, "block" | "onOpen">) {
  const { value, label, delta } = parseMetric(block.content);
  const positive = delta ? /^[↑▲+]/.test(delta) : false;
  const negative = delta ? /^[↓▼-]/.test(delta) : false;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left w-full flex flex-col items-start transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97]"
    >
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-ink tabular-nums leading-none">
          {value}
        </span>
        {delta && (
          <span
            className={
              "text-xs font-medium tabular-nums " +
              (positive
                ? "text-emerald-600"
                : negative
                  ? "text-rose-600"
                  : "text-muted")
            }
          >
            {delta}
          </span>
        )}
      </div>
      {label && <span className="mt-1 text-sm text-muted">{label}</span>}
    </button>
  );
}
