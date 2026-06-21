import { useTranslation } from "react-i18next";
import { HiCheckCircle, HiXCircle } from "react-icons/hi2";
import { useIntel } from "../intel.store";
import { RUBRICS } from "../intel.data";
import { Badge } from "@/components/ui";

/** Custom AI scorecard rubric — auto pass/fail per criterion (Dialpad). */
export function RubricCard() {
  const { t } = useTranslation("intelligence");
  const id = useIntel((s) => s.activeSourceId);
  const rubric = RUBRICS[id] ?? [];
  if (rubric.length === 0) return null;
  const passed = rubric.filter((r) => r.pass).length;

  return (
    <div className="rounded-card border border-line bg-white p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-sm font-semibold text-ink dark:text-white">{t("rubric")}</h3>
        <Badge tone={passed === rubric.length ? "positive" : "warning"}>
          {passed}/{rubric.length}
        </Badge>
      </div>
      <ul className="space-y-1.5">
        {rubric.map((r) => (
          <li key={r.id} className="flex items-start gap-2 text-sm">
            {r.pass ? (
              <HiCheckCircle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-green-600 dark:text-green-400" aria-label={t("pass")} />
            ) : (
              <HiXCircle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-danger dark:text-red-400" aria-label={t("fail")} />
            )}
            <span className={"min-w-0 break-words " + (r.pass ? "text-ink dark:text-white" : "text-muted dark:text-gray-400")}>{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
