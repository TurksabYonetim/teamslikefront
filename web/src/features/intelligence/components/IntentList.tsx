import { useTranslation } from "react-i18next";
import { HiOutlineViewfinderCircle } from "react-icons/hi2";
import { useIntel } from "../intel.store";
import { INTENTS } from "../intel.data";

/** Detected intents with confidence (Demio intent analytics / Dialpad). */
export function IntentList() {
  const { t } = useTranslation("intelligence");
  const id = useIntel((s) => s.activeSourceId);
  const intents = INTENTS[id] ?? [];

  return (
    <div className="rounded-card border border-line bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 flex items-center gap-1 text-base font-semibold text-fg">
        <HiOutlineViewfinderCircle size={16} aria-hidden /> {t("intents")}
      </h3>
      {intents.length === 0 ? (
        <p className="text-base text-muted">{t("none")}</p>
      ) : (
        <ul className="space-y-2">
          {intents.map((i) => (
            <li key={i.id}>
              <div className="flex items-center justify-between text-base">
                <span className="text-fg">{i.label}</span>
                <span className="text-muted">{Math.round(i.confidence * 100)}%</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(i.confidence * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
