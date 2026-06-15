import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Topbar } from "@/components/layout/Topbar";
import { Icon } from "@/components/Icon";
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Forbidden,
  Modal,
  Skeleton,
  useToast,
} from "@/components/ui";
import { apiErrorMessage } from "@/lib/api";
import { useCan } from "@/lib/authStore";
import { BlockCard } from "./BlockCard";
import { PromptBar } from "./PromptBar";
import { useDragReorder } from "./useDragReorder";
import { useCanvasOverlay } from "./canvas.overlay";
import { buildBlock, matchPrompt } from "./canvas.prompt";
import { TYPE_ICONS, TYPE_STYLES_SOLID } from "./canvas.style";
import {
  useCanvasBlocks,
  useCreateCanvasBlock,
  useDeleteCanvasBlock,
  useReorderCanvasBlocks,
  useUpdateCanvasBlock,
} from "./canvas.hooks";
import { BLOCK_TYPES, type BlockType, type CanvasBlock } from "./canvas.types";

/** Demo presence — collaborator avatarları (frontend-only, backend yok). */
const COLLABORATORS = [
  { id: "c1", name: "Ada Lovelace", color: "#5b5fc7" },
  { id: "c2", name: "Grace Hopper", color: "#0f9d58" },
  { id: "c3", name: "Alan Turing", color: "#db4437" },
];

/** Yeni blok için tipe özgü içerik şablonu (içerik düzenleyiciye ön doldurulur). */
const TYPE_TEMPLATES: Record<BlockType, string> = {
  summary: "",
  action: "",
  note: "",
  checklist: "- [ ] \n- [ ] ",
  table: "Sütun A | Sütun B\n--- | ---\n | ",
  metric: "0\nEtiket",
};

export function CanvasPage() {
  const { t } = useTranslation("canvas");
  const toast = useToast();
  const canView = useCan("canvas.view");

  const { data: blocks, isLoading, isError } = useCanvasBlocks();
  const createM = useCreateCanvasBlock();
  const updateM = useUpdateCanvasBlock();
  const deleteM = useDeleteCanvasBlock();
  const reorderM = useReorderCanvasBlocks();

  const { docTitle, setDocTitle, isPinned, togglePin, pinnedSet } =
    useCanvasOverlay();

  // Önce pozisyona göre sırala; ardından sabitlenenleri (pin) öne taşı.
  const list = useMemo(() => {
    const byPos = [...(blocks ?? [])].sort((a, b) => a.position - b.position);
    return [
      ...byPos.filter((b) => pinnedSet.has(b.id)),
      ...byPos.filter((b) => !pinnedSet.has(b.id)),
    ];
  }, [blocks, pinnedSet]);

  // Pano başlığı: overlay'de yeniden adlandırılmadıysa varsayılan i18n başlık.
  const boardTitle = docTitle?.trim() || t("title");

  // Başlık yeniden adlandırma modalı
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameDraft, setRenameDraft] = useState("");

  function openRename() {
    setRenameDraft(docTitle ?? "");
    setRenameOpen(true);
  }

  function handleRename() {
    setDocTitle(renameDraft.trim());
    setRenameOpen(false);
    toast.show({ message: t("toast.renamed"), variant: "success" });
  }

  // Prompt çubuğundan blok üretimi (saf istemci motoru).
  async function handlePrompt(prompt: string) {
    const match = matchPrompt(prompt);
    if (!match) return;
    try {
      await createM.mutateAsync(buildBlock(match));
      toast.show({ message: t("toast.generated"), variant: "success" });
    } catch (err) {
      toast.show({ message: apiErrorMessage(err), variant: "error" });
    }
  }

  function handleTogglePin(block: CanvasBlock) {
    togglePin(block.id);
  }

  // Ekleme modalı
  const [addOpen, setAddOpen] = useState(false);
  const [newType, setNewType] = useState<BlockType>("summary");
  const [newTitle, setNewTitle] = useState("");

  // Düzenleme modalı
  const [editing, setEditing] = useState<CanvasBlock | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  function openAdd() {
    setNewType("summary");
    setNewTitle("");
    setAddOpen(true);
  }

  async function handleCreate() {
    try {
      await createM.mutateAsync({
        type: newType,
        title: newTitle.trim(),
        content: TYPE_TEMPLATES[newType],
      });
      setAddOpen(false);
      toast.show({ message: t("toast.created"), variant: "success" });
    } catch (err) {
      toast.show({ message: apiErrorMessage(err), variant: "error" });
    }
  }

  function openEdit(block: CanvasBlock) {
    setEditing(block);
    setDraftTitle(block.title);
    setDraftContent(block.content);
  }

  async function handleSave() {
    if (!editing) return;
    try {
      await updateM.mutateAsync({
        id: editing.id,
        body: { title: draftTitle.trim(), content: draftContent },
      });
      setEditing(null);
      toast.show({ message: t("toast.saved"), variant: "success" });
    } catch (err) {
      toast.show({ message: apiErrorMessage(err), variant: "error" });
    }
  }

  async function handleDelete(block: CanvasBlock) {
    try {
      await deleteM.mutateAsync(block.id);
      toast.show({
        message: t("toast.deleted"),
        variant: "success",
        action: {
          label: t("toast.undo"),
          onClick: () => {
            createM
              .mutateAsync({
                type: block.type,
                title: block.title,
                content: block.content,
                position: block.position,
              })
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

  /** Checklist toggle: serileştirilmiş içeriği optimistic PATCH ile kaydet. */
  function handleChecklistToggle(block: CanvasBlock, nextContent: string) {
    updateM
      .mutateAsync({ id: block.id, body: { content: nextContent } })
      .catch((err) =>
        toast.show({ message: apiErrorMessage(err), variant: "error" }),
      );
  }

  /**
   * from→to taşımayı tüm aradaki blokların position'ını yeniden numaralandırarak
   * uygular. Mevcut optimistic reorder hook'u kullanılır.
   */
  const commitReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      const next = [...list];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      // Slotlardaki orijinal position değerleri sabit kalır; bloklar bu
      // slotlara yeniden atanır. Yalnızca position'ı değişen blokları yolla.
      const slotPositions = list.map((b) => b.position);
      const updates = next
        .map((b, i) => ({ id: b.id, body: { position: slotPositions[i] } }))
        .filter((u) => {
          const orig = list.find((b) => b.id === u.id);
          return orig && orig.position !== u.body.position;
        });
      if (updates.length === 0) return;
      reorderM.mutateAsync(updates).catch((err) =>
        toast.show({ message: apiErrorMessage(err), variant: "error" }),
      );
    },
    [list, reorderM, toast, t],
  );

  // Yukarı/aşağı buton: from→from±1 taşıma
  function move(index: number, dir: -1 | 1) {
    commitReorder(index, index + dir);
  }

  const { drag, start, shiftFor, containerRef } = useDragReorder({
    count: list.length,
    onCommit: commitReorder,
  });

  // İzin koruması: canvas.view yoksa içerik yerine Forbidden göster.
  if (!canView) {
    return (
      <>
        <Topbar title={t("title")} subtitle={t("subtitle")} />
        <div className="flex-1 overflow-y-auto bg-surface-2 p-4 md:p-6">
          <Forbidden />
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button onClick={openAdd} disabled={createM.isPending}>
            <Icon name="plus" className="w-4 h-4" /> {t("add")}
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto bg-surface-2 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Pano başlığı + blok rozeti + collaborator presence + rename */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="truncate text-base font-semibold text-ink">
                {boardTitle}
              </h2>
              <button
                type="button"
                title={t("actions.rename")}
                aria-label={t("actions.rename")}
                onClick={openRename}
                className="shrink-0 rounded p-1 text-muted hover:bg-surface-3 hover:text-ink active:scale-[0.95] motion-reduce:active:scale-100"
                style={{ transition: "color 160ms var(--ease-out), transform 120ms var(--ease-out)" }}
              >
                <Icon name="pencil" className="h-3.5 w-3.5" />
              </button>
              <Badge tone="neutral">
                {t("blocks", { count: list.length })}
              </Badge>
            </div>

            <div className="flex-1" />

            {/* Collaborator presence avatarları (üst üste binen) */}
            <div
              className="flex items-center -space-x-2"
              role="group"
              aria-label={t("collaborators", { count: COLLABORATORS.length })}
            >
              {COLLABORATORS.map((c) => (
                <Avatar
                  key={c.id}
                  name={c.name}
                  color={c.color}
                  size="xs"
                  className="ring-2 ring-surface-2"
                />
              ))}
            </div>
          </div>

          {/* Doğal-dil prompt çubuğu + öneri çipleri */}
          <div className="mb-4">
            <PromptBar onRun={handlePrompt} disabled={createM.isPending} />
          </div>

          {/* Yükleniyor */}
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28" />
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
              icon={<Icon name="grid" className="w-6 h-6" />}
              title={t("state.emptyTitle")}
              description={t("state.emptyDescription")}
              action={
                <Button onClick={openAdd} disabled={createM.isPending}>
                  <Icon name="plus" className="w-4 h-4" /> {t("add")}
                </Button>
              }
            />
          )}

          {/* Blok panosu */}
          {!isLoading && !isError && list.length > 0 && (
            <div ref={containerRef} className="space-y-4">
              {list.map((b, i) => {
                const isDragging = drag?.fromIndex === i;
                return (
                  <div
                    key={b.id}
                    style={
                      isDragging
                        ? {
                            transform: `translateY(${drag!.offsetY}px)`,
                            position: "relative",
                            zIndex: 20,
                          }
                        : undefined
                    }
                  >
                    <BlockCard
                      block={b}
                      index={i}
                      count={list.length}
                      dragging={isDragging}
                      shift={shiftFor(i)}
                      reorderDisabled={reorderM.isPending && !drag}
                      pinned={isPinned(b.id)}
                      onPointerDownHandle={start}
                      onMove={move}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onTogglePin={handleTogglePin}
                      onChecklistToggle={handleChecklistToggle}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ekleme modalı */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={t("addModal.title")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              {t("actions.cancel")}
            </Button>
            <Button onClick={handleCreate} loading={createM.isPending}>
              {t("addModal.confirm")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              {t("addModal.typeLabel")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BLOCK_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewType(type)}
                  className={
                    "flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium " +
                    (newType === type
                      ? "border-brand bg-brand/5 text-brand"
                      : "border-line text-muted hover:bg-surface-2")
                  }
                  style={{ transition: "background-color 160ms var(--ease-out), border-color 160ms var(--ease-out)" }}
                >
                  <Icon name={TYPE_ICONS[type]} className="w-4 h-4" />
                  {t(`types.${type}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Tip önizleme */}
          <div className="rounded-lg border border-line bg-surface-2 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium " +
                  TYPE_STYLES_SOLID[newType]
                }
              >
                <Icon name={TYPE_ICONS[newType]} className="w-3 h-3" />
                {t(`types.${newType}`)}
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {t(`typeHints.${newType}`)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              {t("addModal.titleLabel")}
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t("addModal.titlePlaceholder")}
              className="input w-full"
              autoFocus
            />
          </div>
        </div>
      </Modal>

      {/* Düzenleme modalı */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={t("editModal.title")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              {t("actions.cancel")}
            </Button>
            <Button onClick={handleSave} loading={updateM.isPending}>
              {t("actions.save")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              {t("addModal.titleLabel")}
            </label>
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder={t("addModal.titlePlaceholder")}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              {t("editModal.contentLabel")}
            </label>
            {editing && (
              <p className="text-xs text-muted mb-1.5">
                {t(`contentHints.${editing.type}`)}
              </p>
            )}
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              placeholder={t("editModal.contentPlaceholder")}
              rows={8}
              className="input w-full resize-y font-mono text-[13px]"
            />
          </div>
        </div>
      </Modal>

      {/* Pano başlığını yeniden adlandırma modalı */}
      <Modal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title={t("renameModal.title")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRenameOpen(false)}>
              {t("actions.cancel")}
            </Button>
            <Button onClick={handleRename}>{t("actions.save")}</Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {t("renameModal.label")}
          </label>
          <input
            type="text"
            value={renameDraft}
            onChange={(e) => setRenameDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleRename();
              }
            }}
            placeholder={t("renameModal.placeholder")}
            className="input w-full"
            autoFocus
          />
        </div>
      </Modal>
    </>
  );
}
