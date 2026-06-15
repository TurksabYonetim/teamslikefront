import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui";
import { useAdminStore } from "../governance.store";
import { ConfirmAction } from "./ConfirmAction";
import { PolicyTester } from "./PolicyTester";
import type { PolicyKind } from "../governance.types";

/** Politika türü → mevcut Icon adı eşlemesi (yerel set ile). */
const ICON: Record<PolicyKind, string> = {
  residency: "pin",
  retention: "trash",
  e2ee: "key",
  dlp: "key",
  sensitivity: "tag",
  legalHold: "flag",
  infoBarrier: "users",
  commCompliance: "search",
  conditionalAccess: "identification",
};

const CONFIG_INPUT =
  "h-9 w-32 rounded-md border border-line bg-surface-2 px-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand";

export function SecurityPolicies() {
  const { t } = useTranslation("admin");
  const policies = useAdminStore((s) => s.policies);
  const togglePolicy = useAdminStore((s) => s.togglePolicy);
  const setPolicyConfig = useAdminStore((s) => s.setPolicyConfig);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-line bg-surface p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink">{t("security")}</h3>
        <ul className="tl-stagger space-y-2">
          {policies.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-line p-3"
            >
              <Icon name={ICON[p.kind]} className="h-[18px] w-[18px] text-muted" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-ink">{t(`policy.${p.kind}`)}</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {Object.entries(p.config).map(([k, v]) => (
                    <label
                      key={k}
                      className="inline-flex items-center gap-1 text-sm text-muted"
                    >
                      {k}:
                      <input
                        value={v}
                        onChange={(e) => setPolicyConfig(p.id, k, e.target.value)}
                        aria-label={`${t(`policy.${p.kind}`)} · ${k}`}
                        className={CONFIG_INPUT}
                      />
                    </label>
                  ))}
                </div>
              </div>
              <Badge tone={p.enabled ? "positive" : "neutral"}>
                {p.enabled ? t("enabled") : t("disabled")}
              </Badge>
              <ConfirmAction
                label={p.enabled ? t("disable") : t("enable")}
                verifyWord={p.kind.toUpperCase()}
                variant={p.enabled ? "danger" : "primary"}
                onConfirm={() => togglePolicy(p.id)}
              />
            </li>
          ))}
        </ul>
      </div>
      <PolicyTester />
    </div>
  );
}
