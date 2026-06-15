import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import type { Clip } from "./clips.types";
import { formatDuration } from "./clips.utils";

interface ClipPlayerModalProps {
  clip: Clip | null;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  /** Paylaşım linki üretici; kopyalandığında çağrılır (toast için). */
  onShared: () => void;
}

const SPEEDS = [0.5, 1, 1.5, 2] as const;

/**
 * Geniş klip oynatıcı overlay'i. Paylaşılan Modal (max-w-md) yerine kendi
 * backdrop'unu kullanır — video için geniş alan gerekir.
 * Klavye: Space = oynat/duraklat, ←/→ = 5sn atla (Shift ile önceki/sonraki klip),
 * Esc = kapat. emil: backdrop fade + panel modal-in, transform-only.
 */
export function ClipPlayerModal({
  clip,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
  onShared,
}: ClipPlayerModalProps) {
  const { t } = useTranslation("clips");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [speed, setSpeed] = useState<number>(1);

  // Klip değişince hızı uygula.
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.playbackRate = speed;
  }, [speed, clip?.id]);

  const open = clip !== null;

  const handleCopyShare = useCallback(async () => {
    if (!clip) return;
    const link = `${window.location.origin}${window.location.pathname}?clip=${encodeURIComponent(clip.id)}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // clipboard yoksa geçici input ile fallback
      const ta = document.createElement("textarea");
      ta.value = link;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* yoksay */
      }
      document.body.removeChild(ta);
    }
    onShared();
  }, [clip, onShared]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current;
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case " ":
        case "k":
          e.preventDefault();
          if (v) {
            if (v.paused) void v.play().catch(() => {});
            else v.pause();
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (e.shiftKey) {
            if (hasNext) onNext();
          } else if (v) {
            v.currentTime = Math.min(v.duration || Infinity, v.currentTime + 5);
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (e.shiftKey) {
            if (hasPrev) onPrev();
          } else if (v) {
            v.currentTime = Math.max(0, v.currentTime - 5);
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, hasPrev, hasNext, onPrev, onNext, onClose]);

  if (!clip) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 motion-safe:[animation:tl-fade_var(--dur-modal)_var(--ease-out)]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={clip.title}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden origin-center motion-safe:[animation:tl-modal-in_var(--dur-modal)_var(--ease-out)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başlık çubuğu */}
        <div className="flex items-center justify-between gap-3 p-3 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {clip.title}
          </h3>
          <button
            onClick={onClose}
            title={t("player.close")}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 shrink-0 motion-safe:active:scale-[0.97] duration-[var(--dur-press)] ease-[var(--ease-out)] [transition-property:color,background-color,transform]"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Video + yan navigasyon */}
        <div className="relative bg-black">
          <video
            key={clip.id}
            ref={videoRef}
            src={clip.video_url}
            poster={clip.thumbnail_url ?? undefined}
            controls
            autoPlay
            className="w-full aspect-video bg-black"
          />
          {hasPrev && (
            <button
              type="button"
              onClick={onPrev}
              title={t("player.prev")}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-full bg-black/50 text-white hover:bg-black/70 motion-safe:active:scale-[0.97] duration-[var(--dur-press)] ease-[var(--ease-out)] [transition-property:color,background-color,transform]"
            >
              <Icon name="chevronLeft" className="w-5 h-5" />
            </button>
          )}
          {hasNext && (
            <button
              type="button"
              onClick={onNext}
              title={t("player.next")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-full bg-black/50 text-white hover:bg-black/70 motion-safe:active:scale-[0.97] duration-[var(--dur-press)] ease-[var(--ease-out)] [transition-property:color,background-color,transform]"
            >
              <Icon name="chevronRight" className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Alt kontrol çubuğu */}
        <div className="flex flex-wrap items-center gap-3 p-3 border-t border-gray-200 bg-gray-50">
          {clip.duration_s != null && (
            <span className="text-xs text-gray-500 tabular-nums inline-flex items-center gap-1">
              <Icon name="clock" className="w-4 h-4" />
              {formatDuration(clip.duration_s)}
            </span>
          )}

          {/* Oynatma hızı */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-gray-500">{t("player.speed")}</span>
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={[
                  "px-2 py-1 rounded text-xs font-medium tabular-nums",
                  "motion-safe:active:scale-[0.97] duration-[var(--dur-press)] ease-[var(--ease-out)] [transition-property:color,background-color,transform]",
                  speed === s
                    ? "bg-brand text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100",
                ].join(" ")}
              >
                {s}×
              </button>
            ))}
          </div>

          {/* Paylaş linki kopyala */}
          <button
            type="button"
            onClick={handleCopyShare}
            title={t("player.copyShare")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 motion-safe:active:scale-[0.97] duration-[var(--dur-press)] ease-[var(--ease-out)] [transition-property:color,background-color,transform]"
          >
            <Icon name="link" className="w-4 h-4" />
            {t("player.copyShare")}
          </button>
        </div>
      </div>
    </div>
  );
}
