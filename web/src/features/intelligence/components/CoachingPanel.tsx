import { useTranslation } from "react-i18next";
import {
  HiOutlineLightBulb,
  HiOutlineExclamationTriangle,
  HiOutlineHandThumbUp,
  HiOutlineMicrophone,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import { useCan } from "@/lib/authStore";
import { useIntel } from "../intel.store";
import type { CoachingCue } from "../intel.types";
import { fmtClock } from "./SentimentChip";

const KIND: Record<CoachingCue["kind"], { Icon: IconType; tone: string }> = {
  tip: { Icon: HiOutlineLightBulb, tone: "text-blue-700 dark:text-blue-400" },
  warning: { Icon: HiOutlineExclamationTriangle, tone: "text-red-600 dark:text-red-400" },
  praise: { Icon: HiOutlineHandThumbUp, tone: "text-green-600 dark:text-green-400" },
};

/**
 * Live coaching "whisper".
 * RBAC: only managers (admin.access) see the cues. Without the permission a
 * locked info box is shown instead — the actual tips are hidden.
 */
export function CoachingPanel() {
  const { t } = useTranslation("intelligence");
  const coaching = useIntel((s) => s.coaching);
  const canCoach = useCan("admin.access");

  // RBAC gate: hide the tips behind a locked notice for non-managers.
  if (!canCoach) {
    return (
      <div
        role="note"
        className="flex items-start gap-2 rounded-card border border-line bg-surface-2 p-3 text-sm text-muted dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
      >
        <HiOutlineLockClosed size={18} className="mt-0.5 shrink-0" aria-hidden />
        <div>
          <p className="font-medium text-ink dark:text-gray-200">
            {t("coachingLocked.title")}
          </p>
          <p>{t("coachingLocked.body")}</p>
        </div>
      </div>
    );
  }

  if (coaching.length === 0) return null;

  return (
    <div className="rounded-card border border-line bg-surface p-3 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 flex items-center gap-1 text-sm font-semibold text-ink dark:text-gray-200">
        <HiOutlineMicrophone size={16} aria-hidden /> {t("coaching")}
      </h3>
      <ul className="space-y-1.5" aria-live="polite">
        {coaching.map((c) => {
          const { Icon, tone } = KIND[c.kind];
          return (
            <li key={c.id} className="flex items-start gap-2 text-sm">
              <Icon size={16} className={`mt-0.5 ${tone}`} aria-hidden />
              <span className="flex-1 text-ink dark:text-white">{c.text}</span>
              <span className="text-xs text-muted">{fmtClock(c.tSec)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
