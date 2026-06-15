import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import type { Clip } from "./clips.types";
import { formatDuration } from "./clips.utils";

interface ClipCardProps {
  clip: Clip;
  onPlay: (clip: Clip) => void;
  onEdit: (clip: Clip) => void;
  onDelete: (clip: Clip) => void;
}

/**
 * Klip kartı. Kapak üzerinde hover'da sessiz <video> önizlemesi başlatır
 * (emil: opacity geçişi, transform yok, reduced-motion CSS ile yumuşatılır).
 */
export function ClipCard({ clip, onPlay, onEdit, onDelete }: ClipCardProps) {
  const { t } = useTranslation("clips");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  function startPreview() {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => {
      /* tarayıcı engellerse sessizce yoksay */
    });
  }

  function stopPreview() {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    setPreviewReady(false);
  }

  const showThumb = clip.thumbnail_url && !thumbError;

  return (
    <div
      className="card overflow-hidden group"
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
    >
      <button
        type="button"
        onClick={() => onPlay(clip)}
        title={t("card.play")}
        className="w-full aspect-video grid place-items-center relative cursor-pointer bg-gray-900 overflow-hidden motion-safe:active:scale-[0.98] motion-safe:transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)]"
      >
        {showThumb ? (
          <img
            src={clip.thumbnail_url ?? undefined}
            alt={clip.title}
            loading="lazy"
            onError={() => setThumbError(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <span className="absolute right-2 top-2 text-xs text-white/70">
            {t("card.noThumbnail")}
          </span>
        )}

        {/* Hover önizleme: sessiz, döngüsüz; yüklenince opacity ile belirir. */}
        <video
          ref={videoRef}
          src={clip.video_url}
          muted
          playsInline
          preload="none"
          poster={clip.thumbnail_url ?? undefined}
          onPlaying={() => setPreviewReady(true)}
          className={[
            "absolute inset-0 w-full h-full object-cover",
            "duration-[var(--dur-pop)] ease-[var(--ease-out)] [transition-property:opacity]",
            previewReady ? "opacity-100" : "opacity-0",
          ].join(" ")}
          aria-hidden="true"
        />

        <span className="relative w-12 h-12 rounded-full bg-white/90 grid place-items-center shadow duration-[var(--dur-press)] ease-[var(--ease-out)] [transition-property:opacity] group-hover:opacity-0">
          <Icon name="play" className="w-6 h-6 text-gray-900" />
        </span>

        {clip.duration_s != null && (
          <span className="absolute right-2 bottom-2 bg-black/70 text-white text-xs font-medium px-1.5 py-0.5 rounded tabular-nums">
            {formatDuration(clip.duration_s)}
          </span>
        )}
      </button>

      <div className="p-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-ink text-sm truncate">
              {clip.title}
            </div>
            {clip.description && (
              <div className="text-xs text-muted mt-0.5 line-clamp-2">
                {clip.description}
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label={t("card.edit")}
            className="p-1.5 min-w-[44px] min-h-[44px] grid place-items-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 duration-[var(--dur-press)] ease-[var(--ease-out)] [transition-property:color,background-color,transform] motion-safe:active:scale-[0.97]"
            title={t("card.edit")}
            onClick={() => onEdit(clip)}
          >
            <Icon name="pencil" className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={t("card.delete")}
            className="p-1.5 min-w-[44px] min-h-[44px] grid place-items-center rounded hover:bg-gray-100 text-gray-400 hover:text-red-600 duration-[var(--dur-press)] ease-[var(--ease-out)] [transition-property:color,background-color,transform] motion-safe:active:scale-[0.97]"
            title={t("card.delete")}
            onClick={() => onDelete(clip)}
          >
            <Icon name="trash" className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
