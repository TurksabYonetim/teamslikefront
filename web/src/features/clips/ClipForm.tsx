import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import type { Clip, CreateClipRequest } from "./clips.types";
import { isValidVideoUrl } from "./clips.utils";

export interface ClipFormState {
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_s: string;
}

export const EMPTY_CLIP_FORM: ClipFormState = {
  title: "",
  description: "",
  video_url: "",
  thumbnail_url: "",
  duration_s: "",
};

export function clipToForm(c: Clip): ClipFormState {
  return {
    title: c.title,
    description: c.description,
    video_url: c.video_url,
    thumbnail_url: c.thumbnail_url ?? "",
    duration_s: c.duration_s != null ? String(c.duration_s) : "",
  };
}

/**
 * Form girdisini API gövdesine çevirir. Doğrulama hatası varsa null döner ve
 * `onError(messageKey)` ile i18n anahtarı bildirir.
 */
export function buildClipPayload(
  form: ClipFormState,
  onError: (messageKey: string) => void,
): CreateClipRequest | null {
  const title = form.title.trim();
  const video_url = form.video_url.trim();
  if (!title) {
    onError("form.requiredTitle");
    return null;
  }
  if (!video_url) {
    onError("form.requiredVideoUrl");
    return null;
  }
  if (!isValidVideoUrl(video_url)) {
    onError("form.invalidVideoUrl");
    return null;
  }
  const thumb = form.thumbnail_url.trim();
  const durRaw = form.duration_s.trim();
  const duration_s = durRaw === "" ? null : Number(durRaw);
  return {
    title,
    description: form.description.trim(),
    video_url,
    thumbnail_url: thumb === "" ? null : thumb,
    duration_s: Number.isFinite(duration_s as number) ? duration_s : null,
  };
}

interface ClipFormProps {
  form: ClipFormState;
  onChange: (form: ClipFormState) => void;
}

/** Metadata formu — thumbnail önizleme + video_url satır-içi doğrulama. */
export function ClipForm({ form, onChange }: ClipFormProps) {
  const { t } = useTranslation("clips");
  const [thumbBroken, setThumbBroken] = useState(false);

  const set = <K extends keyof ClipFormState>(key: K, value: string) =>
    onChange({ ...form, [key]: value });

  const videoTouched = form.video_url.trim().length > 0;
  const videoInvalid = videoTouched && !isValidVideoUrl(form.video_url);

  const thumb = form.thumbnail_url.trim();

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">{t("form.title")}</span>
        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder={t("form.titlePlaceholder")}
          className="input"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">{t("form.videoUrl")}</span>
        <input
          value={form.video_url}
          onChange={(e) => set("video_url", e.target.value)}
          placeholder={t("form.videoUrlPlaceholder")}
          aria-invalid={videoInvalid}
          aria-describedby={videoInvalid ? "videoUrlError" : undefined}
          className={`input ${videoInvalid ? "border-red-500 focus:ring-red-500" : ""}`}
        />
        {videoInvalid && (
          <span id="videoUrlError" role="alert" className="text-xs text-red-600 inline-flex items-center gap-1 motion-safe:animate-[tl-fade-in_var(--dur-press)_var(--ease-out)]">
            <Icon name="info" className="w-3.5 h-3.5" />
            {t("form.invalidVideoUrl")}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">
          {t("form.thumbnailUrl")}
        </span>
        <input
          value={form.thumbnail_url}
          onChange={(e) => {
            setThumbBroken(false);
            set("thumbnail_url", e.target.value);
          }}
          placeholder={t("form.thumbnailUrlPlaceholder")}
          className="input"
        />
        {/* Kapak önizleme */}
        {thumb !== "" && (
          <div className="mt-1 w-40 aspect-video rounded-md overflow-hidden border border-gray-200 bg-gray-100 grid place-items-center motion-safe:animate-[tl-pop-in_var(--dur-pop)_var(--ease-out)] origin-top-left">
            {thumbBroken ? (
              <span className="text-xs text-muted inline-flex flex-col items-center gap-1">
                <Icon name="photo" className="w-5 h-5" />
                {t("form.thumbnailBroken")}
              </span>
            ) : (
              <img
                src={thumb}
                alt={t("form.thumbnailPreview")}
                onError={() => setThumbBroken(true)}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">{t("form.durationS")}</span>
        <input
          type="number"
          min={0}
          value={form.duration_s}
          onChange={(e) => set("duration_s", e.target.value)}
          placeholder={t("form.durationPlaceholder")}
          className="input"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-ink">
          {t("form.description")}
        </span>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder={t("form.descriptionPlaceholder")}
          rows={3}
          className="input resize-none"
        />
      </label>
    </div>
  );
}
