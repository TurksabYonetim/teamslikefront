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

// Her an türü: ikon + AAA renk çifti (tinted pill). İkon, pill'in metin rengini miras alır.
const KIND: Record<Highlight["kind"], { Icon: IconType; pill: string }> = {
  decision: { Icon: HiOutlineCheckBadge, pill: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200" },
  action: { Icon: HiOutlineClipboardDocumentCheck, pill: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200" },
  objection: { Icon: HiOutlineExclamationTriangle, pill: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200" },
  question: { Icon: HiOutlineQuestionMarkCircle, pill: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200" },
};

/** Key moments → jump to the transcript segment. Editorial cards: a typed tag
 *  leads, the moment text reads as the line, the jump link reveals on hover. */
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
            const { Icon, pill } = KIND[h.kind];
            return (
              <li key={h.id}>
                <button
                  onClick={() => jump(h.segmentId)}
                  className="hl-card flex w-full flex-col items-start gap-1.5 rounded-md border border-line p-2.5 text-left dark:border-gray-700"
                >
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${pill}`}>
                    <Icon size={13} aria-hidden /> {t(`kind.${h.kind}`)}
                  </span>
                  <span className="text-sm text-ink dark:text-white">{h.text}</span>
                  <span className="hl-jump inline-flex items-center gap-1 text-xs font-medium text-blue-800 dark:text-blue-400">
                    {t("jumpToTranscript")} <HiOutlineArrowRight size={13} aria-hidden />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
