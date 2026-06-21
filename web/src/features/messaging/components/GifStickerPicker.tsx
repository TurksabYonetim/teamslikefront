import { useTranslation } from "react-i18next";
import { HiOutlineGif } from "react-icons/hi2";
import { Dropdown } from "@/components/ui";

const STICKERS = ["🎉", "🔥", "😂", "❤️", "👍", "🚀", "🥳", "😎", "🙌", "💯", "👀", "✨"];

/** GIF/sticker seçici (Teams/Telegram/WhatsApp). Sticker'lar büyük emoji olarak taklit edilir. */
export function GifStickerPicker({ onSend }: { onSend: (sticker: string) => void }) {
  const { t } = useTranslation("messaging");
  return (
    <Dropdown
      label={t("sticker")}
      align="start"
      side="top"
      menuWidth="w-auto"
      triggerClassName="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 dark:text-gray-400 dark:hover:bg-gray-700"
      trigger={<HiOutlineGif className="h-[18px] w-[18px]" aria-hidden />}
    >
      <div className="grid max-w-[calc(100vw-2rem)] grid-cols-6 gap-1">
        {STICKERS.map((s) => (
          <button
            key={s}
            type="button"
            aria-label={s}
            onClick={() => onSend(s)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-2xl leading-none transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-surface-2 motion-safe:active:scale-[0.92] dark:hover:bg-gray-700"
          >
            <span aria-hidden>{s}</span>
          </button>
        ))}
      </div>
    </Dropdown>
  );
}
