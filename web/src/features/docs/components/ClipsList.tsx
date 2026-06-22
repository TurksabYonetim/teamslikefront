import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge, Button, EmptyState } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { workspaceStore } from "../workspace.store";
import { memberName, SELF_ID } from "../workspace.data";
import { ClipDetail } from "./ClipDetail";
import type { Clip } from "../workspace.types";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * Clips — async video mesajlaşma (Loom paritesi). Liste + seçili klip detayı.
 * Liste, AI özeti olan klipleri ayrı bir "AI özetli" grubunda toplar; gerisi
 * "Diğer" altında listelenir. Gruplama yalnızca AI ile zenginleştirilmiş
 * içeriği öne çıkarmak içindir; tek grup varsa başlık yine de bağlamı taşır.
 */
export function ClipsList() {
  const { t } = useTranslation("docs");
  const clips = useStore(workspaceStore, (s) => s.clips);
  const { addClip } = workspaceStore.getState();
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Mobilde master-detail: aynı anda ya liste ya detay görünür (lg+'da yan yana).
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const q = query.trim().toLowerCase();
  const list = clips
    .filter((c) => (showArchived ? true : !c.archived))
    .filter(
      (c) =>
        q === "" ||
        c.title.toLowerCase().includes(q) ||
        c.transcript.toLowerCase().includes(q) ||
        (c.hashtags ?? []).some((h) => h.toLowerCase().includes(q)),
    );

  const selected = clips.find((c) => c.id === selectedId) ?? list[0] ?? null;

  const withAi = list.filter((c) => c.summary);
  const without = list.filter((c) => !c.summary);
  const groups: { key: string; label: string; ai?: boolean; items: Clip[] }[] = [
    { key: "ai", label: t("clip.group.ai"), ai: true, items: withAi },
    { key: "other", label: t("clip.group.other"), items: without },
  ].filter((g) => g.items.length > 0);

  const renderClip = (c: Clip) => (
    <li key={c.id}>
      <button
        type="button"
        onClick={() => {
          setSelectedId(c.id);
          setMobileView("detail");
        }}
        aria-current={selected?.id === c.id ? "true" : undefined}
        className={
          "flex w-full items-center gap-2 rounded-lg border p-2 text-left transition-[transform,background-color,border-color] duration-150 ease-[var(--ease-out)] motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none " +
          (selected?.id === c.id ? "border-brand bg-brand-softer" : "border-line hover:bg-surface-2")
        }
      >
        <span className="flex h-9 w-12 flex-none items-center justify-center rounded bg-surface-3 text-muted">
          <Icon name="video" className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-ink">{c.title}</span>
          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted">
            <span className="truncate">
              {memberName(c.authorId)} · {fmt(c.durationSec)}
            </span>
            {c.privacy === "link" ? (
              <Badge tone="warning" className="shrink-0">
                {t("clip.privacy.link")}
              </Badge>
            ) : null}
          </span>
        </span>
        {c.summary ? <Icon name="sparkles" className="h-4 w-4 shrink-0 text-brand" /> : null}
        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted">
          <Icon name="info" className="h-3.5 w-3.5" /> {c.views}
        </span>
      </button>
    </li>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
      <div className={"card min-w-0 p-4 " + (mobileView === "detail" ? "hidden lg:block" : "")}>
        <div className="mb-2 flex items-center gap-2">
          <h3 className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-ink">
            <Icon name="video" className="h-4 w-4 shrink-0" /> <span className="truncate">{t("tabs.clips")}</span>
          </h3>
          <Button className="ml-auto shrink-0" size="sm" onClick={() => addClip(t("clip.newClip"), SELF_ID)}>
            <Icon name="video" className="h-4 w-4 shrink-0" /> {t("clip.record")}
          </Button>
        </div>

        <div className="relative mb-2">
          <Icon name="search" className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("clip.searchPh")}
            aria-label={t("clip.searchPh")}
            className="input h-10 pl-8"
          />
        </div>
        <label className="mb-3 inline-flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={showArchived} onChange={() => setShowArchived((v) => !v)} className="checkbox" />
          {t("clip.showArchived")}
        </label>

        {list.length === 0 ? (
          <EmptyState title={t("clip.empty")} />
        ) : (
          <div className="tl-stagger flex flex-col gap-3">
            {groups.map((g) => (
              <div key={g.key}>
                <p className="mb-1 flex items-center gap-1 text-[0.6875rem] font-semibold text-muted">
                  {g.ai ? <Icon name="sparkles" className="h-3 w-3 text-brand" /> : null}
                  {g.label}
                </p>
                <ul className="flex flex-col gap-1.5">{g.items.map(renderClip)}</ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected ? (
        <div className={"min-w-0 " + (mobileView === "list" ? "hidden lg:block" : "")}>
          <button
            type="button"
            onClick={() => setMobileView("list")}
            className="mb-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.97] motion-reduce:transition-none lg:hidden"
          >
            <Icon name="chevronLeft" className="h-4 w-4" /> {t("clip.backToList")}
          </button>
          <ClipDetail clip={selected} />
        </div>
      ) : (
        <div className={"card p-4 " + (mobileView === "list" ? "hidden lg:block" : "")}>
          <EmptyState title={t("clip.selectClip")} />
        </div>
      )}
    </div>
  );
}
