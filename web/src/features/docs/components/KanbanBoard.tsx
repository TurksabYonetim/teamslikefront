import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { workspaceStore } from "../workspace.store";
import { memberName } from "../workspace.data";

/**
 * Sütun başına sakin renk kimliği: To do = mavi, In progress = amber, Done = yeşil.
 * Ton yalnızca başlık şeridi + sayaç + avatar + hover kenarında; kart gövdesi nötr kalır.
 * AAA: tonlu zemin (*-50/*-100) üstünde metin *-900 (≥7:1); *-800 bu zeminlerde 7:1 altına düşer.
 */
const COLUMN_TONE: Record<
  string,
  { head: string; count: string; cardHover: string; ava: string }
> = {
  col_todo: {
    head: "border-blue-100 bg-blue-50 text-blue-900",
    count: "text-blue-900 ring-blue-200",
    cardHover: "hover:border-blue-300",
    ava: "bg-blue-100 text-blue-900",
  },
  col_doing: {
    head: "border-amber-100 bg-amber-50 text-amber-900",
    count: "text-amber-900 ring-amber-200",
    cardHover: "hover:border-amber-300",
    ava: "bg-amber-100 text-amber-900",
  },
  col_done: {
    head: "border-green-100 bg-green-50 text-green-900",
    count: "text-green-900 ring-green-200",
    cardHover: "hover:border-green-300",
    ava: "bg-green-100 text-green-900",
  },
};

const FALLBACK_TONE = {
  head: "border-line bg-surface-2 text-ink",
  count: "text-ink-2 ring-line",
  cardHover: "hover:border-gray-300",
  ava: "bg-primary-100 text-primary-800",
};

/** Ad → en çok iki harfli baş harf (avatar rozeti). */
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** Board — Kanban panosu. Klavye erişilebilir kart taşıma (drag-drop alternatifi). */
export function KanbanBoard() {
  const { t } = useTranslation("docs");
  const board = useStore(workspaceStore, (s) => s.board);
  const { moveCard, addCard } = workspaceStore.getState();
  const [draft, setDraft] = useState<Record<string, string>>({});

  const colIndex = (id: string) => board.columns.findIndex((c) => c.id === id);
  const submitCard = (columnId: string) => {
    const title = (draft[columnId] ?? "").trim();
    if (!title) return;
    addCard(title, columnId);
    setDraft((d) => ({ ...d, [columnId]: "" }));
  };

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {board.columns.map((col) => {
        const cards = board.cards.filter((c) => c.columnId === col.id);
        const idx = colIndex(col.id);
        const tone = COLUMN_TONE[col.id] ?? FALLBACK_TONE;
        return (
          <section
            key={col.id}
            aria-label={col.title}
            className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-sm"
          >
            <h3
              className={
                "flex items-center justify-between border-b px-3.5 py-2.5 text-sm font-semibold " +
                tone.head
              }
            >
              {col.title}
              <span
                className={
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-surface px-1.5 text-xs font-semibold tabular-nums ring-1 " +
                  tone.count
                }
              >
                {cards.length}
              </span>
            </h3>

            <div className="flex flex-col p-3">
              <ul className="tl-stagger space-y-2">
                {cards.map((cd) => (
                  <li
                    key={cd.id}
                    className={
                      "rounded-lg border border-line bg-surface-2 p-2 transition-[border-color,box-shadow] duration-150 ease-[var(--ease-out)] hover:shadow-md motion-reduce:transition-none " +
                      tone.cardHover
                    }
                  >
                    <div className="break-words text-sm text-ink">{cd.title}</div>
                    <div className="mt-1 flex items-center gap-2">
                      {cd.assigneeId ? (
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted">
                          <span
                            aria-hidden="true"
                            className={
                              "inline-flex h-5 w-5 flex-none items-center justify-center rounded-full text-[0.625rem] font-semibold " +
                              tone.ava
                            }
                          >
                            {initials(memberName(cd.assigneeId))}
                          </span>
                          <span className="truncate">{memberName(cd.assigneeId)}</span>
                        </span>
                      ) : null}
                      <span className="ml-auto flex flex-none items-center gap-1">
                        <IconButton
                          label={t("board.moveLeft")}
                          disabled={idx === 0}
                          className="h-7 w-7 transition-transform motion-safe:active:scale-[0.97] disabled:opacity-40 motion-reduce:transform-none"
                          onClick={() => moveCard(cd.id, board.columns[idx - 1].id)}
                        >
                          <Icon name="chevronLeft" className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          label={t("board.moveRight")}
                          disabled={idx === board.columns.length - 1}
                          className="h-7 w-7 transition-transform motion-safe:active:scale-[0.97] disabled:opacity-40 motion-reduce:transform-none"
                          onClick={() => moveCard(cd.id, board.columns[idx + 1].id)}
                        >
                          <Icon name="chevronRight" className="h-4 w-4" />
                        </IconButton>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex items-center gap-1">
                <input
                  value={draft[col.id] ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [col.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitCard(col.id);
                  }}
                  placeholder={t("board.addCard")}
                  aria-label={t("board.addCard")}
                  className="input h-9 flex-1"
                />
                <IconButton label={t("board.addCard")} onClick={() => submitCard(col.id)}>
                  <Icon name="plus" className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
