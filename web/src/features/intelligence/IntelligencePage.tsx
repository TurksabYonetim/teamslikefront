import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Topbar } from "@/components/layout/Topbar";
import { Icon } from "@/components/Icon";
import { Button, EmptyState, Forbidden, Skeleton, Tabs, useToast } from "@/components/ui";
import { apiErrorMessage } from "@/lib/api";
import { useCan } from "@/lib/authStore";
import {
  useCreateTranscript,
  useDeleteTranscript,
  useTranscripts,
  useUpdateTranscript,
} from "./intelligence.hooks";
import { countMatches } from "./intelligence.analysis";
import { TranscriptViewer } from "./TranscriptViewer";
import { TranscriptAnalyticsPanel } from "./TranscriptAnalyticsPanel";
import type { Transcript } from "./intelligence.types";

export function IntelligencePage() {
  const { t } = useTranslation("intelligence");
  const toast = useToast();
  const canView = useCan("intelligence.view");

  const { data: transcripts, isLoading, isError } = useTranscripts();
  const createM = useCreateTranscript();
  const updateM = useUpdateTranscript();
  const deleteM = useDeleteTranscript();

  const [query, setQuery] = useState("");
  const [docQuery, setDocQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  // Görüntüleyici yerel taslak state'i (kaydedilene kadar)
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  const list = useMemo(() => transcripts ?? [], [transcripts]);

  // İlk yükte / liste değişince geçerli seçim koru
  useEffect(() => {
    if (list.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !list.some((tr) => tr.id === selectedId)) {
      setSelectedId(list[0].id);
    }
  }, [list, selectedId]);

  const selected = useMemo(
    () => list.find((tr) => tr.id === selectedId) ?? null,
    [list, selectedId],
  );

  // Seçili transkript değişince taslağı senkronla ve okuma moduna dön
  useEffect(() => {
    setDraftTitle(selected?.title ?? "");
    setDraftContent(selected?.content ?? "");
    setEditing(false);
    setDocQuery("");
  }, [selected?.id, selected?.title, selected?.content]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (tr) =>
        tr.title.toLowerCase().includes(q) ||
        tr.content.toLowerCase().includes(q),
    );
  }, [list, query]);

  const docMatches = useMemo(
    () => countMatches(draftContent, docQuery),
    [draftContent, docQuery],
  );

  const isDirty =
    !!selected &&
    (draftTitle !== selected.title || draftContent !== selected.content);

  async function handleCreate() {
    try {
      const tr = await createM.mutateAsync({
        title: t("untitled"),
        content: "",
        language: "tr",
      });
      setSelectedId(tr.id);
      setQuery("");
      setEditing(true);
      toast.show({ message: t("toast.created"), variant: "success" });
    } catch (err) {
      toast.show({ message: apiErrorMessage(err), variant: "error" });
    }
  }

  async function handleSave() {
    if (!selected || !isDirty) return;
    try {
      await updateM.mutateAsync({
        id: selected.id,
        body: { title: draftTitle.trim() || t("untitled"), content: draftContent },
      });
      setEditing(false);
      toast.show({ message: t("toast.saved"), variant: "success" });
    } catch (err) {
      toast.show({ message: apiErrorMessage(err), variant: "error" });
    }
  }

  async function handleDelete(tr: Transcript) {
    try {
      await deleteM.mutateAsync(tr.id);
      toast.show({
        message: t("toast.deleted"),
        variant: "success",
        action: {
          label: t("toast.undo"),
          // Geri al: aynı içerik yeniden oluşturulur (yeni id ile).
          onClick: () => {
            createM
              .mutateAsync({
                title: tr.title,
                content: tr.content,
                language: tr.language,
                meeting_id: tr.meeting_id,
              })
              .then((created) => setSelectedId(created.id))
              .catch((err) =>
                toast.show({ message: apiErrorMessage(err), variant: "error" }),
              );
          },
        },
      });
    } catch (err) {
      toast.show({ message: apiErrorMessage(err), variant: "error" });
    }
  }

  async function handleCopy() {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(draftContent);
      toast.show({ message: t("toast.copied"), variant: "success" });
    } catch {
      toast.show({ message: t("toast.copyError"), variant: "error" });
    }
  }

  function handleDownload() {
    if (!selected) return;
    const name = (draftTitle.trim() || t("untitled"))
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();
    const blob = new Blob([draftContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name || "transcript"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.show({ message: t("toast.downloaded"), variant: "success" });
  }

  const viewTab = {
    id: "view",
    label: t("tabs.view"),
    content: (
      <div className="space-y-4">
        {/* Belge içi arama (yalnızca okuma modunda) */}
        {!editing && (
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Icon
                name="search"
                className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                value={docQuery}
                onChange={(e) => setDocQuery(e.target.value)}
                placeholder={t("search.inDocument")}
                className="input w-full pl-9"
              />
            </div>
            {docQuery.trim() && (
              <span className="text-xs text-muted tabular-nums shrink-0">
                {docMatches > 0
                  ? t("search.matches", { count: docMatches })
                  : t("search.noMatches")}
              </span>
            )}
          </div>
        )}

        {editing ? (
          <textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            placeholder={t("viewer.contentPlaceholder")}
            rows={18}
            className="text-sm text-ink leading-relaxed w-full bg-transparent border border-line rounded-lg p-3 focus:outline-none focus:border-brand/40 resize-y"
          />
        ) : (
          <TranscriptViewer content={draftContent} query={docQuery} />
        )}
      </div>
    ),
  };

  const analyticsTab = {
    id: "analytics",
    label: t("tabs.analytics"),
    content: <TranscriptAnalyticsPanel content={draftContent} />,
  };

  // Permission guard: no intelligence.view → forbidden screen.
  if (!canView) return <Forbidden />;

  return (
    <>
      <Topbar
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button onClick={handleCreate} disabled={createM.isPending}>
            <Icon name="plus" className="w-4 h-4" /> {t("new")}
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto bg-surface-2 p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Liste araması */}
          <div className="relative">
            <Icon
              name="search"
              className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="input w-full pl-9"
            />
          </div>

          {/* Yükleniyor */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          )}

          {/* Hata */}
          {isError && !isLoading && (
            <EmptyState
              title={t("state.errorTitle")}
              description={t("state.errorDescription")}
            />
          )}

          {/* Boş */}
          {!isLoading && !isError && list.length === 0 && (
            <EmptyState
              title={t("state.emptyTitle")}
              description={t("state.emptyDescription")}
              action={
                <Button onClick={handleCreate} disabled={createM.isPending}>
                  <Icon name="plus" className="w-4 h-4" /> {t("new")}
                </Button>
              }
            />
          )}

          {/* Transkript listesi */}
          {!isLoading && !isError && list.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 tl-stagger">
              {filtered.map((tr) => (
                <div
                  key={tr.id}
                  className={
                    "card p-4 text-left hover:shadow-md flex items-start gap-3 group relative cursor-pointer " +
                    (tr.id === selectedId ? "ring-1 ring-brand/40" : "")
                  }
                  onClick={() => setSelectedId(tr.id)}
                >
                  <span className="text-2xl">🧠</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-ink text-sm truncate">
                      {tr.title || t("untitled")}
                    </div>
                    <div className="text-xs text-muted">
                      {new Date(tr.created_at).toLocaleDateString()} ·{" "}
                      {tr.language.toUpperCase()}
                    </div>
                  </div>
                  <button
                    type="button"
                    title={t("viewer.delete")}
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(tr);
                    }}
                  >
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-sm text-muted py-6 text-center">
                  {t("search.noResults")}
                </div>
              )}
            </div>
          )}

          {/* Seçili transkript: başlık + aksiyonlar + sekmeler */}
          {!isLoading && !isError && selected && (
            <div className="space-y-4">
              {/* Başlık satırı + aksiyon araç çubuğu */}
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {editing ? (
                    <input
                      type="text"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      placeholder={t("viewer.titlePlaceholder")}
                      className="text-2xl font-bold text-ink w-full bg-transparent border-0 border-b border-line focus:border-brand/40 focus:outline-none px-0"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-ink truncate">
                      {draftTitle || t("untitled")}
                    </h2>
                  )}
                  <div className="text-xs text-muted mt-1">
                    {t("meta.created")}:{" "}
                    {new Date(selected.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    title={t("viewer.copy")}
                  >
                    <Icon name="copy" className="w-4 h-4" />
                    <span className="hidden sm:inline">{t("viewer.copy")}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDownload}
                    title={t("viewer.download")}
                  >
                    <Icon name="inbox" className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {t("viewer.download")}
                    </span>
                  </Button>
                  {editing ? (
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={!isDirty || updateM.isPending}
                    >
                      {updateM.isPending ? t("viewer.saving") : t("viewer.save")}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditing(true)}
                    >
                      <Icon name="pencil" className="w-4 h-4" />
                      <span className="hidden sm:inline">{t("viewer.edit")}</span>
                    </Button>
                  )}
                </div>
              </div>

              <Tabs items={[viewTab, analyticsTab]} />
            </div>
          )}

          {!isLoading && !isError && list.length > 0 && !selected && (
            <div className="text-sm text-muted py-12 text-center">
              {t("state.selectPrompt")}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
