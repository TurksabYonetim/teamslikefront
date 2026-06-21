import { useTranslation } from "react-i18next";
import { HiOutlineViewfinderCircle } from "react-icons/hi2";
import { useIntel } from "../intel.store";
import { INTENTS } from "../intel.data";

const SEGMENTS = 12;

/** Detected intents with confidence (Demio intent analytics / Dialpad), shown
 *  as a segmented signal meter — filled segments animate in on render. */
export function IntentList() {
  const { t } = useTranslation("intelligence");
  const id = useIntel((s) => s.activeSourceId);
  const intents = INTENTS[id] ?? [];

  return (
    <div className="rounded-card border border-line bg-white p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 flex items-center gap-1.5 text-base font-semibold text-ink dark:text-white">
        <HiOutlineViewfinderCircle size={16} className="shrink-0 text-brand dark:text-blue-400" aria-hidden /> {t("intents")}
      </h3>
      {intents.length === 0 ? (
        <p className="text-sm text-muted dark:text-gray-400">{t("none")}</p>
      ) : (
        <ul className="space-y-2">
          {intents.map((i) => {
            const pct = Math.round(i.confidence * 100);
            const on = Math.round(i.confidence * SEGMENTS);
            return (
              <li key={i.id}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate text-ink dark:text-white">{i.label}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-ink dark:text-white">{pct}%</span>
                </div>
                <div
                  className="mt-1.5 flex gap-1"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={i.label}
                >
                  {Array.from({ length: SEGMENTS }).map((_, s) => (
                    <span
                      key={s}
                      className={"h-3.5 flex-1 rounded-sm " + (s < on ? "il-seg-on bg-brand" : "bg-line dark:bg-gray-700")}
                      style={s < on ? { animationDelay: `${s * 28}ms` } : undefined}
                      aria-hidden
                    />
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
