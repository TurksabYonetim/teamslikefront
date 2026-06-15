import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui";
import { useAdminStore } from "../governance.store";
import { aiCreditState, creditOverage } from "../admin.governance";
import { ConfirmAction } from "./ConfirmAction";
import type { Plan } from "../governance.types";

const PLANS: Plan[] = ["free", "pro", "business", "enterprise"];
const SELECT_CLASS =
  "h-11 rounded-lg border border-line bg-surface px-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand";

export function BillingPanel() {
  const { t } = useTranslation("admin");
  const billing = useAdminStore((s) => s.billing);
  const invoices = useAdminStore((s) => s.invoices);
  const upgradePlan = useAdminStore((s) => s.upgradePlan);
  const [target, setTarget] = useState<Plan>("enterprise");

  const lvl = aiCreditState(billing.aiCreditsUsed, billing.aiCreditsIncluded);
  const overage = creditOverage(
    billing.aiCreditsUsed,
    billing.aiCreditsIncluded,
    billing.perCreditCost,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-ink">{t("billing")}</h3>
          <Badge tone="accent">{t(`planName.${billing.plan}`)}</Badge>
          <span className="text-sm text-muted">{t("seats", { n: billing.seats })}</span>
        </div>
        <p className="mb-2 text-sm text-muted">{t("paymentNote")}</p>

        <div className="mb-3 rounded-lg border border-line p-3">
          <div className="mb-1 flex items-center gap-2 text-sm">
            <Icon name="sparkles" className="h-4 w-4 text-muted" />
            <span className="flex-1 font-medium text-ink">{t("aiCredits.title")}</span>
            <Badge tone={lvl === "exceeded" ? "danger" : lvl === "warn" ? "warning" : "positive"}>
              {billing.aiCreditsUsed}/{billing.aiCreditsIncluded}
            </Badge>
          </div>
          <p className="text-sm text-muted">
            {t("aiCredits.rate", { cost: billing.perCreditCost.toFixed(2) })}
            {" · "}
            {t("aiCredits.overage", { cost: overage.toFixed(2) })}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm text-muted">
            {t("changePlan")}
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as Plan)}
              className={SELECT_CLASS}
            >
              {PLANS.map((p) => (
                <option key={p} value={p}>
                  {t(`planName.${p}`)}
                </option>
              ))}
            </select>
          </label>
          <ConfirmAction
            label={t("upgrade")}
            verifyWord={target.toUpperCase()}
            variant="primary"
            onConfirm={() => upgradePlan(target)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Icon name="money" className="h-4 w-4" /> {t("invoices")}
        </h3>
        {invoices.map((inv) => (
          <div key={inv.id} className="mb-2 rounded-lg border border-line p-3 last:mb-0">
            <div className="mb-1 text-sm font-medium text-ink">{inv.period}</div>
            <ul className="space-y-0.5">
              {inv.lines.map((l) => (
                <li key={l.label} className="flex justify-between text-sm text-muted">
                  <span>{l.label}</span>
                  <span>${l.amount}</span>
                </li>
              ))}
            </ul>
            <div className="mt-1 flex justify-between border-t border-line pt-1 text-sm font-semibold text-ink">
              <span>{t("total")}</span>
              <span>${inv.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
