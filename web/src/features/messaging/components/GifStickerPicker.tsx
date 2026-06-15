import { useTranslation } from "react-i18next";
import { HiOutlineSparkles } from "react-icons/hi2";
import { Dropdown } from "@/components/ui";

const STICKERS = ["🎉", "🔥", "😂", "❤️", "👍", "🚀", "🥳", "😎", "🙌", "💯", "👀", "✨"];

/** GIF/sticker seçici (Teams/Telegram/WhatsApp). Sticker'lar büyük emoji olarak taklit edilir. */
export function GifStickerPicker({ onSend }: { onSend: (sticker: string) => void }) {
  const { t } = useTranslation("messaging");
  return (
    <Dropdown
      label={t("sticker")}
      align="start"
      triggerClassName="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 dark:text-gray-400 dark:hover:bg-gray-700"
      trigger={<HiOutlineSparkles className="h-[18px] w-[18px]" aria-hidden />}
    >
      <div className="grid w-60 grid-cols-6 gap-1 p-1">
        {STICKERS.map((s) => (
          <button
            key={s}
            type="button"
            aria-label={s}
            onClick={() => onSend(s)}
            className="flex h-9 items-center justify-center rounded-md text-2xl hover:bg-surface-2 dark:hover:bg-gray-700"
          >
            <span aria-hidden>{s}</span>
          </button>
        ))}
      </div>
    </Dropdown>
  );
}
