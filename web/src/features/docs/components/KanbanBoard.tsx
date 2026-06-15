import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { IconButton } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { workspaceStore } from "../workspace.store";
import { memberName } from "../workspace.data";

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
        return (
          <div key={col.id} className="card p-3">
            <h3 className="mb-2 flex items-center justify-between text-sm font-semibold text-ink">
              {col.title}
              <span className="text-xs text-muted">{cards.length}</span>
            </h3>
            <ul className="space-y-2">
              {cards.map((cd) => (
                <li
                  key={cd.id}
                  className="rounded-lg border border-line bg-surface-2 p-2 transition-shadow duration-150 ease-[var(--ease-out)] hover:shadow-sm motion-reduce:transition-none"
                >
                  <div className="text-sm text-ink">{cd.title}</div>
                  <div className="mt-1 flex items-center gap-2">
                    {cd.assigneeId ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        <Icon name="userCircle" className="h-3.5 w-3.5" /> {memberName(cd.assigneeId)}
                      </span>
                    ) : null}
                    <span className="ml-auto flex items-center gap-1">
                      <IconButton
                        label={t("board.moveLeft")}
                        disabled={idx === 0}
                        className="h-7 w-7 disabled:opacity-40"
                        onClick={() => moveCard(cd.id, board.columns[idx - 1].id)}
                      >
                        <Icon name="chevronLeft" className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        label={t("board.moveRight")}
                        disabled={idx === board.columns.length - 1}
                        className="h-7 w-7 disabled:opacity-40"
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
        );
      })}
    </div>
  );
}
