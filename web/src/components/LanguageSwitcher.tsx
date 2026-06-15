import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { SUPPORTED_LANGS, type Lang } from "@/i18n/i18n";

/** TR/EN dil değiştirici. Seçim localStorage'da saklanır (i18n.ts). */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const current = (SUPPORTED_LANGS.includes(i18n.language as Lang) ? i18n.language : "tr") as Lang;

  return (
    <div
      className={clsx("inline-flex rounded-lg border border-gray-200 bg-white p-0.5", className)}
      role="group"
      aria-label={t("lang.label")}
    >
      {SUPPORTED_LANGS.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          aria-pressed={current === lng}
          className={clsx(
            "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
            current === lng
              ? "bg-primary-700 text-white"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
          )}
        >
          {t(`lang.short_${lng}`)}
        </button>
      ))}
    </div>
  );
}
