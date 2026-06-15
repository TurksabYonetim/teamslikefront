// web/src/features/support/components/CostPanel.tsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/Badge";
import {
  RATE_CARD, windowState, monthlyEstimate, categoryBreakdown,
} from "../messagingCost.dom";
import type { BillingContext, MessageCategory } from "../messagingCost.dom";
import { Card } from "./Card";

const CATEGORIES: MessageCategory[] = ["marketing", "utility", "authentication", "service"];

/** Öngörülebilir-fatura tahmini için örnek aylık trafik karışımı. */
const SAMPLE: BillingContext[] = [
  ...Array.from({ length: 1200 }, () => ({ category: "marketing" as const, withinWindow: false })),
  ...Array.from({ length: 3000 }, () => ({ category: "utility" as const, withinWindow: false })),
  ...Array.from({ length: 800 }, () => ({ category: "authentication" as const, withinWindow: false })),
  ...Array.from({ length: 5000 }, () => ({ category: "service" as const, withinWindow: true })),
];

/** WhatsApp maliyet motoru: rate card + 24s pencere + öngörülebilir aylık tahmin. */
export function CostPanel() {
  const { t } = useTranslation("support");
  const [region, setRegion] = useState("TR");
  const [sinceMin, setSinceMin] = useState(120);

  const ws = windowState(0, sinceMin);
  const estimate = useMemo(() => monthlyEstimate(SAMPLE, region), [region]);
  const breakdown = useMemo(() => categoryBreakdown(SAMPLE, region), [region]);
  const card = RATE_CARD[region] ?? RATE_CARD.default;

  return (
    <Card>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-1.5 text-base font-semibold text-ink">
          <Icon name="money" className="h-5 w-5" aria-hidden /> {t("cost.title")}
        </h3>
        <label className="ml-auto flex items-center gap-2 text-sm text-muted">
          {t("cost.region")}
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="h-9 rounded-lg border border-line bg-surface-2 px-2.5 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {Object.keys(RATE_CARD).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mb-3 text-sm text-muted">{t("cost.subtitle")}</p>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-muted">
            <th className="py-1 text-left text-sm font-medium">{t("cost.category")}</th>
            <th className="py-1 text-right text-sm font-medium">{t("cost.rate")}</th>
            <th className="py-1 text-right text-sm font-medium">{t("cost.breakdown")}</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((c) => (
            <tr key={c} className="border-t border-line">
              <td className="py-1 text-ink">{t(`cost.cat.${c}`)}</td>
              <td className="py-1 text-right tabular-nums text-ink">
                {card[c] === 0 ? t("cost.free") : `$${card[c].toFixed(4)}`}
              </td>
              <td className="py-1 text-right tabular-nums text-muted">
                {breakdown[c] === 0 ? "—" : `$${breakdown[c].toFixed(2)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-sm">
        <Icon name="clock" className="h-4 w-4 text-muted" aria-hidden />
        <span className="text-ink">{t("cost.window")}</span>
        <input
          type="range"
          min={0}
          max={1500}
          value={sinceMin}
          onChange={(e) => setSinceMin(Number(e.target.value))}
          aria-label={t("cost.window")}
          className="flex-1 accent-brand"
        />
        <Badge tone={ws.open ? "positive" : "danger"}>
          {ws.open ? t("cost.windowOpen", { n: Math.max(1, Math.round(ws.remainingMin / 60)) }) : t("cost.windowClosed")}
        </Badge>
      </div>

      <p className="mt-2 text-sm text-muted">{t("cost.estimate", { total: estimate.toFixed(2), n: SAMPLE.length })}</p>
    </Card>
  );
}
