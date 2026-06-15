import { useTranslation } from "react-i18next";
import { HiOutlineLink } from "react-icons/hi2";

/** Bir metindeki ilk URL (yoksa null). */
export function firstUrl(text: string): string | null {
  const m = text.match(/https?:\/\/[^\s)]+/);
  return m ? m[0] : null;
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Sahte bağlantı önizleme kartı (Slack/Teams/Telegram). */
export function LinkPreview({ url }: { url: string }) {
  const { t } = useTranslation("messaging");
  const domain = domainOf(url);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 block max-w-xs overflow-hidden rounded-lg border border-line hover:border-brand"
    >
      <div className="h-16 bg-brand/10" aria-hidden />
      <div className="p-2">
        <div className="flex items-center gap-1 truncate text-sm font-medium text-ink">
          <HiOutlineLink className="h-3.5 w-3.5 shrink-0" aria-hidden /> {domain}
        </div>
        <div className="truncate text-xs text-muted">{t("linkPreview")}</div>
      </div>
    </a>
  );
}
