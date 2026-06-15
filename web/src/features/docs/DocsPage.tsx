import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import type { KeyboardEvent } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Icon } from "@/components/Icon";
import { CanvasEditor } from "./components/CanvasEditor";
import { CommentSidebar } from "./components/CommentSidebar";
import { KanbanBoard } from "./components/KanbanBoard";
import { TableGridView } from "./components/TableGridView";
import { WorkflowBuilder } from "./components/WorkflowBuilder";
import { ClipsList } from "./components/ClipsList";
import { AppsPanel } from "./components/AppsPanel";

type Tab = "canvas" | "board" | "table" | "workflows" | "clips" | "apps";
const TABS: { id: Tab; icon: string }[] = [
  { id: "canvas", icon: "clipboard" },
  { id: "board", icon: "grid" },
  { id: "table", icon: "chartBar" },
  { id: "workflows", icon: "bolt" },
  { id: "clips", icon: "video" },
  { id: "apps", icon: "grid" },
];
const IDS = TABS.map((x) => x.id);

/**
 * Docs & WorkHub çalışma alanı kabuğu — Canvas, Board, Table, Workflows, Clips,
 * Apps. WAI-ARIA tab deseni + roving tabindex + `?tab=` derin bağlantı.
 */
export function DocsPage() {
  const { t } = useTranslation("docs");
  const [params, setParams] = useSearchParams();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const urlTab = params.get("tab");
  const tab: Tab = (IDS as string[]).includes(urlTab ?? "") ? (urlTab as Tab) : "canvas";

  const setTab = useCallback(
    (id: Tab) => {
      const next = new URLSearchParams(params);
      next.set("tab", id);
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const onTabKey = (e: KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    const id = TABS[next].id;
    setTab(id);
    tabRefs.current[id]?.focus();
  };

  return (
    <>
      <Topbar title={t("title")} subtitle={t("subtitle")} />

      <div className="flex-1 overflow-y-auto bg-surface-2">
        <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
          <div role="tablist" aria-label={t("title")} className="flex flex-wrap gap-1 border-b border-line">
            {TABS.map(({ id, icon }, i) => (
              <button
                key={id}
                ref={(el) => {
                  tabRefs.current[id] = el;
                }}
                role="tab"
                aria-selected={tab === id}
                tabIndex={tab === id ? 0 : -1}
                onClick={() => setTab(id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={
                  "inline-flex h-11 items-center gap-2 rounded-t-md border-b-2 px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none " +
                  (tab === id ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink")
                }
              >
                <Icon name={icon} className="h-[18px] w-[18px]" /> {t(`tabs.${id}`)}
              </button>
            ))}
          </div>

          <div key={tab} role="tabpanel" className="animate-[tl-fade-in_180ms_var(--ease-out)] motion-reduce:animate-none">
            {tab === "canvas" ? (
              <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
                <CanvasEditor />
                <CommentSidebar />
              </div>
            ) : null}
            {tab === "board" ? <KanbanBoard /> : null}
            {tab === "table" ? <TableGridView /> : null}
            {tab === "workflows" ? <WorkflowBuilder /> : null}
            {tab === "clips" ? <ClipsList /> : null}
            {tab === "apps" ? <AppsPanel /> : null}
          </div>
        </div>
      </div>
    </>
  );
}
