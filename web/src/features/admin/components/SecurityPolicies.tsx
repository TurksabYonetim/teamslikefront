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

const CONFIG_INPUT = "input w-28 min-w-0 sm:w-32";

export function SecurityPolicies() {
  const { t } = useTranslation("admin");
  const policies = useAdminStore((s) => s.policies);
  const togglePolicy = useAdminStore((s) => s.togglePolicy);
  const setPolicyConfig = useAdminStore((s) => s.setPolicyConfig);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-line bg-surface p-3 sm:p-4">
        <h3 className="mb-0.5 text-sm font-semibold text-ink">{t("security")}</h3>
        <ul className="tl-stagger divide-y divide-line">
          {policies.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-2 py-2.5 first:pt-1.5 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
            >
              {/* Başlık + durum + ayarlar */}
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <Icon
                  name={ICON[p.kind]}
                  className="h-4 w-4 shrink-0 text-muted"
                />
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1.5">
                  <span className="text-sm font-medium text-ink">{t(`policy.${p.kind}`)}</span>
                  <Badge tone={p.enabled ? "positive" : "neutral"}>
                    {p.enabled ? t("enabled") : t("disabled")}
                  </Badge>
                  {Object.entries(p.config).map(([k, v]) => (
                    <label
                      key={k}
                      className="flex min-w-0 items-center gap-1.5 text-xs text-muted"
                    >
                      <span className="shrink-0 font-mono">{k}</span>
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
              {/* Aksiyon — kompakt; mobilde sola hizalı, geniş ekranda sağda */}
              <div className="shrink-0 sm:self-center">
                <ConfirmAction
                  label={p.enabled ? t("disable") : t("enable")}
                  verifyWord={p.kind.toUpperCase()}
                  variant={p.enabled ? "danger" : "primary"}
                  onConfirm={() => togglePolicy(p.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <PolicyTester />
    </div>
  );
}
