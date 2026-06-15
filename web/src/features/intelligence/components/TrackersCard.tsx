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
    <div className="rounded-card border border-line bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 text-base font-semibold text-fg">{t("trackers")}</h3>
      <ul className="space-y-1.5">
        {trackers.map((tr) => {
          const Icon = KIND[tr.kind];
          return (
            <li key={tr.id} className="flex items-center gap-2 text-base">
              <Icon size={16} className="text-muted" aria-hidden />
              <span className="flex-1 text-fg">{tr.label}</span>
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
