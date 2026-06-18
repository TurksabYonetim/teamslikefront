import { useTranslation } from "react-i18next";
import { HiOutlineMagnifyingGlass, HiOutlineFlag, HiOutlineTag } from "react-icons/hi2";
import type { IconType } from "react-icons";
import { useIntel } from "../intel.store";
import { TRACKERS } from "../intel.data";
import { Badge } from "@/components/ui";
import type { Tracker } from "../intel.types";

const KIND: Record<Tracker["kind"], IconType> = {
  keyword: HiOutlineMagnifyingGlass,
  competitor: HiOutlineFlag,
  topic: HiOutlineTag,
};

/** Custom Moments / trackers — keyword, competitor and topic mentions (Dialpad). */
export function TrackersCard() {
  const { t } = useTranslation("intelligence");
  const id = useIntel((s) => s.activeSourceId);
  const trackers = TRACKERS[id] ?? [];
  if (trackers.length === 0) return null;

  return (
    <div className="rounded-card border border-line bg-surface p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 text-sm font-semibold text-ink">{t("trackers")}</h3>
      <ul className="flex flex-col gap-1">
        {trackers.map((tr) => {
          const Icon = KIND[tr.kind];
          return (
            <li key={tr.id} className="trackers-row flex items-center gap-2 px-2 py-1.5 text-sm">
              <span className={`trackers-ic trackers-ic--${tr.kind} shrink-0 text-muted`}>
                <Icon size={16} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 truncate text-ink">{tr.label}</span>
              <Badge tone={tr.kind === "competitor" ? "danger" : "neutral"}>
                {t("hits", { n: tr.hits })}
              </Badge>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
