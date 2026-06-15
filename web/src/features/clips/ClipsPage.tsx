import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Topbar } from "@/components/layout/Topbar";
import { Icon } from "@/components/Icon";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  Modal,
  Skeleton,
  useToast,
} from "@/components/ui";
import { apiErrorMessage } from "@/lib/api";
import {
  useClips,
  useCreateClip,
  useDeleteClip,
  useUpdateClip,
} from "./clips.hooks";
import type { Clip } from "./clips.types";
import { CLIP_SORTS, filterAndSortClips, type ClipSort } from "./clips.utils";
import { ClipCard } from "./ClipCard";
import { ClipPlayerModal } from "./ClipPlayerModal";
import {
  ClipForm,
  EMPTY_CLIP_FORM,
  buildClipPayload,
  clipToForm,
  type ClipFormState,
} from "./ClipForm";

export function ClipsPage() {
  const { t } = useTranslation("clips");
  const toast = useToast();

  const { data: clips, isLoading, isError } = useClips();
  const createClip = useCreateClip();
  const updateClip = useUpdateClip();
  const deleteClip = useDeleteClip();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ClipSort>("newest");

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Clip | null>(null);
  const [form, setForm] = useState<ClipFormState>(EMPTY_CLIP_FORM);
  const [confirmDelete, setConfirmDelete] = useState<Clip | null>(null);

  useEffect(() => {
    if (isError) toast.show({ message: t("toast.loadError"), variant: "error" });
  }, [isError, toast, t]);

  const visibleClips = useMemo(
    () => (clips ? filterAndSortClips(clips, query, sort) : []),
    [clips, query, sort],
  );

  // Oynatıcı için sıralı listede prev/next.
  const playingIndex = playingId
    ? visibleClips.findIndex((c) => c.id === playingId)
    : -1;
  const playingClip = playingIndex >= 0 ? visibleClips[playingIndex] : null;

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_CLIP_FORM);
    setFormOpen(true);
  }

  function openEdit(c: Clip) {
    setEditing(c);
    setForm(clipToForm(c));
    setFormOpen(true);
  }

  async function handleSubmit() {
    const payload = buildClipPayload(form, (key) =>
      toast.show({ message: t(key), variant: "error" }),
    );
    if (!payload) return;
    try {
      if (editing) {
        await updateClip.mutateAsync({ id: editing.id, body: payload });
        toast.show({ message: t("toast.updated"), variant: "success" });
      } else {
        await createClip.mutateAsync(payload);
        toast.show({ message: t("toast.created"), variant: "success" });
      }
      setFormOpen(false);
    } catch (err) {
      toast.show({
        message:
          apiErrorMessage(err) ||
          t(editing ? "toast.updateError" : "toast.createError"),
        variant: "error",
      });
    }
  }

  async function handleDelete(clip: Clip) {
    setConfirmDelete(null);
    if (playingId === clip.id) setPlayingId(null);
    try {
      await deleteClip.mutateAsync(clip.id);
      toast.show({
        message: t("toast.deleted"),
        variant: "success",
        action: {
          label: t("toast.undo"),
          onClick: () => {
            createClip.mutate(
              {
                title: clip.title,
                description: clip.description,
                video_url: clip.video_url,
                thumbnail_url: clip.thumbnail_url,
                duration_s: clip.duration_s,
              },
              {
                onSuccess: () =>
                  toast.show({
                    message: t("toast.restored"),
                    variant: "success",
                  }),
                onError: (e) =>
                  toast.show({ message: apiErrorMessage(e), variant: "error" }),
              },
            );
          },
        },
      });
    } catch (err) {
      toast.show({
        message: apiErrorMessage(err) || t("toast.deleteError"),
        variant: "error",
      });
    }
  }

  const submitting = createClip.isPending || updateClip.isPending;
  const hasClips = !!clips && clips.length > 0;
  const noResults = hasClips && visibleClips.length === 0;

  return (
    <>
      <Topbar
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button
            leftIcon={<Icon name="plus" className="w-4 h-4" />}
            onClick={openCreate}
          >
            {t("newClip")}
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
        {/* Araç çubuğu: arama + sıralama (yalnızca klip varken) */}
        {hasClips && (
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon name="search" className="w-4 h-4" />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("toolbar.searchPlaceholder")}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <span className="text-gray-500">{t("toolbar.sortLabel")}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ClipSort)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CLIP_SORTS.map((s) => (
                  <option key={s} value={s}>
                    {t(`toolbar.sort.${s}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <Skeleton className="w-full aspect-video rounded-none" />
                <div className="p-3 flex flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !hasClips ? (
          <EmptyState
            icon={<Icon name="video" className="w-6 h-6" />}
            title={t("empty.title")}
            description={t("empty.description")}
            action={
              <Button
                leftIcon={<Icon name="plus" className="w-4 h-4" />}
                onClick={openCreate}
              >
                {t("empty.action")}
              </Button>
            }
          />
        ) : noResults ? (
          <EmptyState
            icon={<Icon name="search" className="w-6 h-6" />}
            title={t("noResults.title")}
            description={t("noResults.description")}
            action={
              <Button variant="secondary" onClick={() => setQuery("")}>
                {t("noResults.clear")}
              </Button>
            }
          />
        ) : (
          <div
            key={`${query}|${sort}`}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 tl-stagger"
          >
            {visibleClips.map((c) => (
              <ClipCard
                key={c.id}
                clip={c}
                onPlay={(clip) => setPlayingId(clip.id)}
                onEdit={openEdit}
                onDelete={setConfirmDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Oynatıcı */}
      <ClipPlayerModal
        clip={playingClip}
        hasPrev={playingIndex > 0}
        hasNext={playingIndex >= 0 && playingIndex < visibleClips.length - 1}
        onPrev={() => {
          if (playingIndex > 0) setPlayingId(visibleClips[playingIndex - 1].id);
        }}
        onNext={() => {
          if (playingIndex >= 0 && playingIndex < visibleClips.length - 1)
            setPlayingId(visibleClips[playingIndex + 1].id);
        }}
        onClose={() => setPlayingId(null)}
        onShared={() =>
          toast.show({ message: t("toast.linkCopied"), variant: "success" })
        }
      />

      {/* Metadata formu */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? t("form.editTitle") : t("form.createTitle")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              {t("form.cancel")}
            </Button>
            <Button loading={submitting} onClick={handleSubmit}>
              {editing ? t("form.save") : t("form.create")}
            </Button>
          </>
        }
      >
        <ClipForm form={form} onChange={setForm} />
      </Modal>

      <ConfirmDialog
        open={confirmDelete !== null}
        title={t("confirmDelete.title")}
        message={t("confirmDelete.message")}
        confirmLabel={t("confirmDelete.confirm")}
        cancelLabel={t("confirmDelete.cancel")}
        loading={deleteClip.isPending}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
