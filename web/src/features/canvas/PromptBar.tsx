import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

interface PromptBarProps {
  /** Çalıştırıldığında serbest metni iletir (boş değilse). */
  onRun: (prompt: string) => void;
  disabled?: boolean;
}

/** Önerilen prompt çipleri — i18n anahtarları `suggestions.*`. */
const SUGGESTION_KEYS = [
  "summary",
  "checklist",
  "action",
  "metric",
  "table",
] as const;

/**
 * Doğal-dil prompt çubuğu: serbest metin girişi + Run butonu + Enter kısayolu
 * ile blok üretir. Altında tıklanabilir öneri çipleri (tek tıkla çalıştırır).
 *
 * Tasarım notları (emil-design-eng):
 *  - Çipler nadir değil ama tek satırlık etkileşim; press feedback (scale .97).
 *  - Geçişler yalnızca transform/opacity/renk; 150-200ms ease-out.
 *  - motion-reduce: transform animasyonları kapanır.
 */
export function PromptBar({ onRun, disabled }: PromptBarProps) {
  const { t } = useTranslation("canvas");
  const [value, setValue] = useState("");

  function run(text: string) {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onRun(trimmed);
    setValue("");
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon name="sparkles" className="w-4 h-4 text-brand shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              run(value);
            }
          }}
          placeholder={t("prompt.placeholder")}
          aria-label={t("prompt.aria")}
          disabled={disabled}
          className="input flex-1 border-0 bg-transparent px-0 focus:ring-0"
        />
        <Button
          onClick={() => run(value)}
          disabled={disabled || !value.trim()}
        >
          <Icon name="sparkles" className="w-4 h-4" /> {t("prompt.run")}
        </Button>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {SUGGESTION_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => run(t(`suggestions.${key}`))}
            className="prompt-chip inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted hover:text-ink hover:border-brand/40 hover:bg-brand/5 active:scale-[0.97] motion-reduce:active:scale-100 disabled:opacity-40 disabled:pointer-events-none"
            style={{
              transition:
                "color var(--dur-press) var(--ease-out), background-color var(--dur-press) var(--ease-out), border-color var(--dur-press) var(--ease-out), transform var(--dur-press) var(--ease-out)",
            }}
          >
            <Icon name="plus" className="w-3 h-3" />
            {t(`suggestions.${key}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
