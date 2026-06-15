import { useTranslation } from "react-i18next";
import {
  HiOutlineCheckBadge,
  HiOutlineClipboardDocumentCheck,
  HiOutlineExclamationTriangle,
  HiOutlineQuestionMarkCircle,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import { useIntel } from "../intel.store";
import type { Highlight } from "../intel.types";

const KIND: Record<Highlight["kind"], { Icon: IconType; tone: string }> = {
  decision: { Icon: HiOutlineCheckBadge, tone: "text-blue-700 dark:text-blue-400" },
  action: { Icon: HiOutlineClipboardDocumentCheck, tone: "text-green-600 dark:text-green-400" },
  objection: { Icon: HiOutlineExclamationTriangle, tone: "text-red-600 dark:text-red-400" },
  question: { Icon: HiOutlineQuestionMarkCircle, tone: "text-amber-600 dark:text-amber-400" },
};

/** Key moments → jump to the transcript segment. */
export function HighlightReel() {
  const { t } = useTranslation("intelligence");
  const highlights = useIntel((s) => s.highlights);

  const jump = (segmentId: string) => {
    const el = document.getElementById(`seg-${segmentId}`);
    if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  return (
    <div className="rounded-card border border-line bg-surface p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 text-sm font-semibold text-ink dark:text-white">{t("highlights")}</h3>
      {highlights.length === 0 ? (
        <p className="text-sm text-muted dark:text-gray-400">{t("none")}</p>
      ) : (
        <ul className="space-y-2">
          {highlights.map((h) => {
            const { Icon, tone } = KIND[h.kind];
            return (
              <li key={h.id}>
                <button
                  onClick={() => jump(h.segmentId)}
                  className="flex w-full items-start gap-2 rounded-md border border-line p-2 text-left hover:border-blue-700 dark:border-gray-700 dark:hover:border-blue-400"
                >
                  <Icon size={18} className={`mt-0.5 ${tone}`} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink dark:text-white">
                      {t(`kind.${h.kind}`)}
                    </span>
                    <span className="block text-sm text-ink-2 dark:text-gray-400">{h.text}</span>
                  </span>
                  <HiOutlineArrowRight size={16} className="mt-0.5 text-gray-500 dark:text-gray-400" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
