import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui";
import clsx from "clsx";
import {
  dlpScan,
  flaggedTerms,
  barrierBlocks,
  sensitivityRank,
  type SensitivityLabel,
} from "../admin.governance";

const LABELS: SensitivityLabel[] = ["public", "general", "confidential", "restricted"];
const SUPERVISED = ["insider", "bribe", "leak"];
const BARRIERS: [string, string][] = [["Research", "Sales"]];

const INPUT_CLASS =
  "h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink transition-colors duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand";

/** Governance yardımcılarını canlı deneyen test paneli (DLP / terimler / bariyer / etiket). */
export function PolicyTester() {
  const { t } = useTranslation("admin");
  const [text, setText] = useState("Pay 4111 1111 1111 1111 — don't leak this.");
  const [from, setFrom] = useState("Research");
  const [to, setTo] = useState("Sales");
  const [label, setLabel] = useState<SensitivityLabel>("confidential");

  const dlp = dlpScan(text);
  const flagged = flaggedTerms(text, SUPERVISED);
  const blocked = barrierBlocks(from, to, BARRIERS);

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Icon name="key" className="h-[18px] w-[18px]" /> {t("tester.title")}
      </h3>

      <label className="block">
        <span className="mb-1 block text-sm text-muted">{t("tester.text")}</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-line bg-surface p-2 text-sm text-ink outline-none transition-colors duration-150 ease-[var(--ease-out)] focus-visible:ring-2 focus-visible:ring-brand"
        />
      </label>

      <div className="mt-2 flex flex-wrap gap-2">
        <Badge tone={dlp.length ? "danger" : "positive"}>
          {t("tester.dlp", { n: dlp.length })}
          {dlp.length ? `: ${dlp.map((d) => d.kind).join(", ")}` : ""}
        </Badge>
        <Badge tone={flagged.length ? "warning" : "positive"}>
          {t("tester.flagged", { n: flagged.length })}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-line pt-3">
        <label className="flex flex-col gap-1 text-sm text-muted">
          {t("tester.from")}
          <input value={from} onChange={(e) => setFrom(e.target.value)} className={INPUT_CLASS} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          {t("tester.to")}
          <input value={to} onChange={(e) => setTo(e.target.value)} className={INPUT_CLASS} />
        </label>
        <Badge tone={blocked ? "danger" : "positive"}>
          {blocked ? t("tester.barrierBlocked") : t("tester.barrierOk")}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">{t("tester.label")}</span>
        {LABELS.map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={label === l}
            onClick={() => setLabel(l)}
            className={clsx(
              "rounded-lg border px-2 py-1 text-sm transition-[transform,color,background-color,border-color] duration-150 ease-[var(--ease-out)] motion-safe:active:scale-[0.97]",
              label === l
                ? "border-brand text-brand"
                : "border-line text-muted hover:bg-surface-2",
            )}
          >
            {t(`tester.sens.${l}`)}
          </button>
        ))}
        <Badge tone="neutral">{t("tester.rank", { n: sensitivityRank(label) })}</Badge>
      </div>
    </div>
  );
}
