// web/src/features/support/components/KbPanel.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { searchKb } from "../support.dom";
import { KB_ARTICLES } from "../support.data";
import { Card } from "./Card";

/** Bilgi bankası — ajanların makale arayıp okuyabildiği akordeon panel. */
export function KbPanel() {
  const { t } = useTranslation("support");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const results = searchKb(KB_ARTICLES, q);

  return (
    <Card className="p-3">
      <h3 className="mb-2 flex items-center gap-1.5 text-base font-semibold text-ink">
        <Icon name="clipboard" className="h-4 w-4" aria-hidden /> {t("kb.title")}
      </h3>
      <div className="relative mb-2">
        <Icon name="search" className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("kb.search")}
          aria-label={t("kb.search")}
          className="h-10 w-full rounded-md border border-line bg-surface pl-7 pr-2 text-base text-ink outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>
      {results.length === 0 ? (
        <p className="px-1 py-2 text-base text-muted">{t("kb.empty")}</p>
      ) : (
        <ul className="space-y-0.5">
          {results.map((a) => {
            const isOpen = open === a.id;
            return (
              <li key={a.id}>
                <button
                  onClick={() => setOpen((o) => (o === a.id ? null : a.id))}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-1 rounded-md px-2 py-1 text-left text-base text-ink transition-colors hover:bg-surface-2 motion-safe:transition-transform motion-safe:active:scale-[0.97]"
                >
                  <Icon
                    name="chevronRight"
                    className={
                      "h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-150 ease-out motion-reduce:transition-none " +
                      (isOpen ? "rotate-90" : "")
                    }
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{a.title}</span>
                </button>
                {isOpen ? (
                  <p className="px-2 pb-1.5 pl-7 text-base text-muted animate-[tl-fade-in_180ms_var(--ease-out)]">{a.body}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
