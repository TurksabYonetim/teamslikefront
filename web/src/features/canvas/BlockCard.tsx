import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { BlockBody } from "./BlockBody";
import { TYPE_ICONS, TYPE_STYLES } from "./canvas.style";
import type { CanvasBlock } from "./canvas.types";

interface BlockCardProps {
  block: CanvasBlock;
  index: number;
  count: number;
  /** Bu kart şu an sürükleniyor mu (kaldırılmış görünüm). */
  dragging: boolean;
  /** Sürüklenen başka bir kart yüzünden uygulanan dikey kayma (px). */
  shift: number;
  reorderDisabled: boolean;
  /** Blok sabitlenmiş mi (başa taşınır, accent ring ile işaretlenir). */
  pinned: boolean;
  onPointerDownHandle: (e: React.PointerEvent, index: number) => void;
  onMove: (index: number, dir: -1 | 1) => void;
  onEdit: (block: CanvasBlock) => void;
  onDelete: (block: CanvasBlock) => void;
  onTogglePin: (block: CanvasBlock) => void;
  onChecklistToggle: (block: CanvasBlock, nextContent: string) => void;
}

/**
 * Tek bir canvas bloğu kartı.
 * Sürükleme sırasında yalnızca `transform`/`opacity` animasyone edilir
 * (layout tetiklemeyen, GPU-dostu özellikler).
 */
export const BlockCard = forwardRef<HTMLDivElement, BlockCardProps>(
  function BlockCard(
    {
      block,
      index,
      count,
      dragging,
      shift,
      reorderDisabled,
      pinned,
      onPointerDownHandle,
      onMove,
      onEdit,
      onDelete,
      onTogglePin,
      onChecklistToggle,
    },
    ref,
  ) {
    const { t } = useTranslation("canvas");

    return (
      <div
        ref={ref}
        data-block-id={block.id}
        className={
          "card p-4 flex flex-col gap-3 group select-none " +
          (pinned ? "ring-1 ring-brand/40 " : "") +
          (dragging
            ? "shadow-lg z-10 cursor-grabbing"
            : "hover:shadow-md")
        }
        style={{
          // Sürüklenirken transform JS ile yönetilir; diğer kartlar yer açar.
          transform: dragging ? undefined : `translateY(${shift}px)`,
          transition: dragging
            ? "none"
            : "transform 220ms var(--ease-out), box-shadow 180ms var(--ease-out)",
          willChange: dragging || shift !== 0 ? "transform" : undefined,
        }}
      >
        <div className="flex items-center gap-2">
          {/* Sürükleme tutamacı */}
          <button
            type="button"
            aria-label={t("actions.drag")}
            title={t("actions.drag")}
            disabled={reorderDisabled}
            onPointerDown={(e) => onPointerDownHandle(e, index)}
            className="-ml-1 p-1 rounded text-muted/60 hover:text-ink hover:bg-surface-3 cursor-grab active:cursor-grabbing touch-none disabled:opacity-30 disabled:pointer-events-none"
          >
            <Icon name="selector" className="w-4 h-4" />
          </button>

          <span
            className={
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium " +
              TYPE_STYLES[block.type]
            }
          >
            <Icon name={TYPE_ICONS[block.type]} className="w-3 h-3" />
            {t(`types.${block.type}`)}
          </span>

          {/* Pin: sabitlenmişse her zaman görünür (durum göstergesi). */}
          <button
            type="button"
            aria-pressed={pinned}
            title={pinned ? t("actions.unpin") : t("actions.pin")}
            onClick={() => onTogglePin(block)}
            className={
              "p-1 rounded hover:bg-surface-3 active:scale-[0.95] motion-reduce:active:scale-100 " +
              (pinned
                ? "text-brand opacity-100"
                : "text-muted hover:text-ink opacity-0 group-hover:opacity-100 focus-visible:opacity-100")
            }
            style={{ transition: "color 160ms var(--ease-out), opacity 160ms var(--ease-out), transform 120ms var(--ease-out)" }}
          >
            <Icon name="pin" className="w-4 h-4" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              type="button"
              title={t("actions.moveUp")}
              disabled={index === 0 || reorderDisabled}
              className="p-1 rounded text-muted hover:text-ink hover:bg-surface-3 disabled:opacity-30 disabled:pointer-events-none"
              onClick={() => onMove(index, -1)}
            >
              <Icon name="chevronDown" className="w-4 h-4 rotate-180" />
            </button>
            <button
              type="button"
              title={t("actions.moveDown")}
              disabled={index === count - 1 || reorderDisabled}
              className="p-1 rounded text-muted hover:text-ink hover:bg-surface-3 disabled:opacity-30 disabled:pointer-events-none"
              onClick={() => onMove(index, 1)}
            >
              <Icon name="chevronDown" className="w-4 h-4" />
            </button>
            <button
              type="button"
              title={t("actions.edit")}
              className="p-1 rounded text-muted hover:text-ink hover:bg-surface-3"
              onClick={() => onEdit(block)}
            >
              <Icon name="pencil" className="w-4 h-4" />
            </button>
            <button
              type="button"
              title={t("actions.delete")}
              className="p-1 rounded text-muted hover:text-danger hover:bg-surface-3"
              onClick={() => onDelete(block)}
            >
              <Icon name="trash" className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="text-left"
          onClick={() => onEdit(block)}
        >
          <div className="font-medium text-ink text-sm">
            {block.title || t("untitled")}
          </div>
        </button>

        <BlockBody
          block={block}
          onOpen={() => onEdit(block)}
          onChecklistToggle={(next) => onChecklistToggle(block, next)}
        />
      </div>
    );
  },
);
