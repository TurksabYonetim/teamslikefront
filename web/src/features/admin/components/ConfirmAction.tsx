import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";

const INPUT_CLASS =
  "h-11 rounded-lg border border-line bg-surface px-3 text-sm text-ink transition-colors duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand";

/**
 * Tehlikeli aksiyon onay deseni: açığa-çıkar → yazarak-doğrula → onayla.
 * Politika / federasyon / faturalandırma değişikliklerinde kullanılır (governance).
 */
export function ConfirmAction({
  label,
  verifyWord,
  onConfirm,
  variant = "danger",
}: {
  label: string;
  verifyWord: string;
  onConfirm: () => void;
  /** "secondary", local Button'da "secondary" varyantına eşlenir. */
  variant?: "danger" | "primary" | "secondary";
}) {
  const { t } = useTranslation("admin");
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  if (!open) {
    return (
      <Button variant={variant} size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
    );
  }

  const confirm = () => {
    onConfirm();
    setOpen(false);
    setValue("");
  };

  return (
    <div
      className="flex flex-wrap items-end gap-2 rounded-lg border border-danger bg-surface p-2 origin-top-left motion-safe:[animation:tl-pop-in_var(--dur-pop)_var(--ease-out)_both]"
    >
      <Icon name="warning" className="h-5 w-5 text-danger" />
      <label className="flex flex-col gap-1 text-sm text-ink">
        {t("typeToConfirm", { word: verifyWord })}
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={verifyWord}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value === verifyWord) confirm();
            if (e.key === "Escape") {
              setOpen(false);
              setValue("");
            }
          }}
          aria-label={t("typeToConfirm", { word: verifyWord })}
          className={INPUT_CLASS}
        />
      </label>
      <Button variant={variant} size="sm" disabled={value !== verifyWord} onClick={confirm}>
        {t("confirm")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setOpen(false);
          setValue("");
        }}
      >
        {t("cancel")}
      </Button>
    </div>
  );
}
