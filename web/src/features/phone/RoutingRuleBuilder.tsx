import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Button, EmptyState } from "@/components/ui";
import { usePbx, pbxStore } from "./pbxStore";
import { evaluateRouting } from "./routing";
import { LINES } from "./data";
import type { RoutingActionKind, RoutingCondition } from "./phone.types";

const CONDITIONS: RoutingCondition[] = ["always", "afterHours", "busy", "noAnswer"];
const ACTION_KINDS: RoutingActionKind[] = ["forward", "voicemail", "ivr"];

/** Find-me/follow-me yönlendirme kuralları + canlı evaluateRouting önizlemesi.
 *  Önizleme bağlamı (afterHours/busy/noAnswer) checkbox'larla değişir; kazanan
 *  kural anında hesaplanır. */
export function RoutingRuleBuilder() {
  const { t } = useTranslation("phone");
  const rules = usePbx((s) => s.routingRules);
  const [ctx, setCtx] = useState({ afterHours: false, busy: false, noAnswer: false });
  const [condition, setCondition] = useState<RoutingCondition>("noAnswer");
  const [action, setAction] = useState<RoutingActionKind>("forward");
  const [target, setTarget] = useState("");

  const winner = evaluateRouting(rules, ctx);

  const addRule = () => {
    pbxStore.getState().addRoutingRule({
      id: `rr_${Math.random().toString(36).slice(2, 8)}`,
      lineId: LINES[0]?.id ?? "line_main",
      condition,
      action,
      target: target.trim() || undefined,
    });
    setTarget("");
  };

  const toggle = (k: keyof typeof ctx) => setCtx((c) => ({ ...c, [k]: !c[k] }));

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-6 overflow-y-auto p-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("routing.title")}</h2>

      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{t("routing.rules")}</p>
        {rules.length === 0 ? (
          <EmptyState title={t("routing.title")} description="" />
        ) : (
          <ul className="mb-4 divide-y divide-gray-100 dark:divide-gray-700">
            {rules.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <span className="flex items-center gap-2">
                  <Badge>{t(`enums.condition.${r.condition}`)}</Badge>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-900 dark:text-white">{t(`enums.routingAction.${r.action}`)}{r.target ? ` (${r.target})` : ""}</span>
                </span>
                <button
                  type="button"
                  onClick={() => pbxStore.getState().removeRoutingRule(r.id)}
                  aria-label={`${t("routing.remove")} ${t(`enums.condition.${r.condition}`)}`}
                  className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                >
                  {t("routing.remove")}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col text-xs text-gray-500">
            {t("routing.condition")}
            <select value={condition} onChange={(e) => setCondition(e.target.value as RoutingCondition)} aria-label={t("routing.condition")} className="input">
              {CONDITIONS.map((c) => <option key={c} value={c}>{t(`enums.condition.${c}`)}</option>)}
            </select>
          </label>
          <label className="flex flex-col text-xs text-gray-500">
            {t("routing.action")}
            <select value={action} onChange={(e) => setAction(e.target.value as RoutingActionKind)} aria-label={t("routing.action")} className="input">
              {ACTION_KINDS.map((a) => <option key={a} value={a}>{t(`enums.routingAction.${a}`)}</option>)}
            </select>
          </label>
          <label className="flex flex-col text-xs text-gray-500">
            {t("routing.target")}
            <input value={target} onChange={(e) => setTarget(e.target.value)} aria-label={t("routing.target")} className="input w-28" />
          </label>
          <Button size="sm" onClick={addRule}>{t("routing.addRule")}</Button>
        </div>
      </div>

      <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
        <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">{t("routing.previewTitle")}</p>
        <div className="mb-3 flex flex-wrap gap-4">
          {(["afterHours", "busy", "noAnswer"] as const).map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={ctx[k]} onChange={() => toggle(k)} aria-label={k} className="h-4 w-4" />
              {t(`enums.condition.${k}`)}
            </label>
          ))}
        </div>
        {winner ? (
          <p className="text-sm text-gray-900 dark:text-white">
            <span className="font-medium">{t("routing.winningRule")}: </span>
            <Badge>{t(`enums.condition.${winner.condition}`)}</Badge> → {t(`enums.routingAction.${winner.action}`)}{winner.target ? ` (${winner.target})` : ""}
          </p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("routing.noMatch")}</p>
        )}
      </div>
    </div>
  );
}
