import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge, Button, EmptyState } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { workspaceStore } from "../workspace.store";
import { memberName, SELF_ID } from "../workspace.data";
import { ClipDetail } from "./ClipDetail";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/** Clips — async video mesajlaşma (Loom paritesi). Liste + seçili klip detayı. */
export function ClipsList() {
  const { t } = useTranslation("docs");
  const clips = useStore(workspaceStore, (s) => s.clips);
  const { addClip } = workspaceStore.getState();
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  return (
    <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
      <div className="card p-4">
        <div className="mb-2 flex items-center gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Icon name="video" className="h-4 w-4" /> {t("tabs.clips")}
          </h3>
          <Button className="ml-auto" size="sm" onClick={() => addClip(t("clip.newClip"), SELF_ID)}>
            <Icon name="video" className="h-4 w-4" /> {t("clip.record")}
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
        <label className="mb-2 inline-flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={showArchived} onChange={() => setShowArchived((v) => !v)} className="h-4 w-4 accent-brand" />
          {t("clip.showArchived")}
        </label>

        {list.length === 0 ? (
          <EmptyState title={t("clip.empty")} />
        ) : (
          <ul className="space-y-2">
            {list.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  aria-current={selected?.id === c.id ? "true" : undefined}
                  className={
                    "flex w-full items-center gap-2 rounded-lg border p-2 text-left transition-colors duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none " +
                    (selected?.id === c.id ? "border-brand bg-brand-softer" : "border-line hover:bg-surface-2")
                  }
                >
                  <span className="flex h-9 w-12 items-center justify-center rounded bg-surface-3 text-muted">
                    <Icon name="video" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">{c.title}</span>
                    <span className="block truncate text-xs text-muted">
                      {memberName(c.authorId)} · {fmt(c.durationSec)}
                    </span>
                  </span>
                  {c.summary ? <Icon name="sparkles" className="h-4 w-4 text-brand" /> : null}
                  {c.privacy === "link" ? <Badge tone="warning">{t("clip.privacy.link")}</Badge> : null}
                  <span className="inline-flex items-center gap-1 text-xs text-muted">
                    <Icon name="info" className="h-3.5 w-3.5" /> {c.views}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected ? (
        <ClipDetail clip={selected} />
      ) : (
        <div className="card p-4">
          <EmptyState title={t("clip.selectClip")} />
        </div>
      )}
    </div>
  );
}
