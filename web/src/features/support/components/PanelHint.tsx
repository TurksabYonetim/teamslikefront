// web/src/features/support/components/PanelHint.tsx
import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";

/**
 * Panel açıklama metni: varsayılan 2 satır (line-clamp-2). Metin taşıyorsa
 * "Daha fazla / Daha az" toggle'ı çıkar; kısaysa hiç çıkmaz. Tooltip yerine
 * inline genişletme — mobilde (dokunmatik) ve klavyeyle erişilebilir.
 */
export function PanelHint({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation("support");
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      if (!expanded) setOverflowing(el.scrollHeight - el.clientHeight > 1);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded, children]);

  return (
    <div className="mb-3">
      <p ref={ref} className={clsx("text-sm text-muted", !expanded && "line-clamp-2")}>
        {children}
      </p>
      {overflowing || expanded ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-1 inline-flex items-center gap-0.5 rounded text-xs font-medium text-blue-800 outline-none transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-brand dark:text-blue-300"
        >
          {expanded ? t("common.readLess") : t("common.readMore")}
          <Icon
            name="chevronDown"
            className={clsx("h-3.5 w-3.5 transition-transform duration-150 motion-reduce:transition-none", expanded && "rotate-180")}
            aria-hidden
          />
        </button>
      ) : null}
    </div>
  );
}
