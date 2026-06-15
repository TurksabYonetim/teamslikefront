// web/src/features/webinar/components/CaptionsLayer.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";

const LINES = [
  "Welcome everyone to the AURA launch.",
  "Today we unveil the 2030 roadmap.",
  "First: real-time translation in 70+ languages.",
  "Then: the new conversation-intelligence layer.",
];

export function CaptionsLayer() {
  const { t } = useTranslation("webinar");
  const [on, setOn] = useState(true);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setI((x) => (x + 1) % LINES.length), 3000);
    return () => clearInterval(id);
  }, [on]);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
      <button
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        className={clsx(
          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand",
          on ? "border-brand text-brand" : "border-slate-600 text-slate-400",
        )}
      >
        <Icon name="captions" className="h-4 w-4" /> {t("captions")}
      </button>
      {on ? (
        <span className="flex-1 truncate text-sm text-white" aria-live="polite">{LINES[i]}</span>
      ) : null}
    </div>
  );
}
