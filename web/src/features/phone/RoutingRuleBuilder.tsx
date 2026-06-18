import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, EmptyState, Select } from "@/components/ui";
import { usePbx, pbxStore } from "./pbxStore";
import { evaluateRouting } from "./routing";
import { LINES } from "./data";
import type { RoutingActionKind, RoutingCondition } from "./phone.types";

const CONDITIONS: RoutingCondition[] = ["always", "afterHours", "busy", "noAnswer"];
const ACTION_KINDS: RoutingActionKind[] = ["forward", "voicemail", "ivr"];

const FIELD =
  "h-11 w-full rounded-lg border border-gray-300 bg-surface px-3 text-sm text-ink transition-[border-color,box-shadow] duration-[var(--dur-pop)] ease-[var(--ease-out)] hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:hover:border-gray-500";

/** Koşula göre renk-kodlu çip (AAA: 800 metin / 100 zemin). */
function conditionChip(c: RoutingCondition): string {
  const base = "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ";
  switch (c) {
    case "always":
      return base + "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "afterHours":
      return base + "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
    case "busy":
      return base + "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    case "noAnswer":
      return base + "bg-surface-2 text-ink-2 dark:bg-gray-700 dark:text-gray-300";
  }
}

/** Find-me/follow-me yönlendirme kuralları + canlı evaluateRouting önizlemesi.
 *  Önizleme bağlamı (afterHours/busy/noAnswer) toggle-pill'lerle değişir; kazanan
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
      <h2 className="text-xl font-semibold text-ink">{t("routing.title")}</h2>

      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-2 text-xs font-semibold text-muted">
          {t("routing.rules")} <span className="font-normal">· {t("routing.priorityOrder")}</span>
        </p>
        {rules.length === 0 ? (
          <EmptyState title={t("routing.title")} description="" />
        ) : (
          <ol className="mb-4 flex flex-col gap-1.5">
            {rules.map((r, i) => (
              <li key={r.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-sm">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-ink-2 dark:bg-gray-700" aria-hidden="true">{i + 1}</span>
                <span className={conditionChip(r.condition)}>{t(`enums.condition.${r.condition}`)}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4 shrink-0 text-ink-3" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h12m0 0-4-4m4 4-4 4" /></svg>
                <span className="min-w-0 flex-1 truncate text-ink">{t(`enums.routingAction.${r.action}`)}{r.target ? ` (${r.target})` : ""}</span>
                <button
                  type="button"
                  onClick={() => pbxStore.getState().removeRoutingRule(r.id)}
                  aria-label={`${t("routing.remove")} ${t(`enums.condition.${r.condition}`)}`}
                  className="shrink-0 text-xs font-medium text-red-600 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] hover:underline motion-safe:active:scale-[0.94] dark:text-red-400"
                >
                  {t("routing.remove")}
                </button>
              </li>
            ))}
          </ol>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink-2">{t("routing.condition")}</span>
            <Select<RoutingCondition>
              value={condition}
              onChange={setCondition}
              options={CONDITIONS.map((c) => ({ value: c, label: t(`enums.condition.${c}`) }))}
              aria-label={t("routing.condition")}
              size="md"
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink-2">{t("routing.action")}</span>
            <Select<RoutingActionKind>
              value={action}
              onChange={setAction}
              options={ACTION_KINDS.map((a) => ({ value: a, label: t(`enums.routingAction.${a}`) }))}
              aria-label={t("routing.action")}
              size="md"
              className="w-full"
            />
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-ink-2">{t("routing.target")}</span>
            <input value={target} onChange={(e) => setTarget(e.target.value)} aria-label={t("routing.target")} className={FIELD} />
          </label>
          <Button onClick={addRule} className="h-11 w-full motion-safe:hover:-translate-y-px sm:col-span-3">{t("routing.addRule")}</Button>
        </div>
      </div>

      {/* Canlı önizleme — bağlam toggle-pill'leri (dokunsal) + kazanan kural sonuç kartı */}
      <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
        <p className="mb-3 text-sm font-semibold text-ink">{t("routing.previewTitle")}</p>
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label={t("routing.previewTitle")}>
          {(["afterHours", "busy", "noAnswer"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => toggle(k)}
              aria-pressed={ctx[k]}
              className={
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.95] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 " +
                (ctx[k]
                  ? "border-primary-600 bg-blue-100 text-blue-800 dark:border-primary-400 dark:bg-blue-900 dark:text-blue-200"
                  : "border-line bg-surface text-ink-2 hover:border-gray-400")
              }
            >
              {t(`enums.condition.${k}`)}
            </button>
          ))}
        </div>
        {winner ? (
          <div className="flex items-center gap-2 rounded-lg border border-primary-200 bg-surface px-3 py-2.5 transition-[transform,box-shadow] duration-[var(--dur-pop)] ease-[var(--ease-out)] motion-safe:hover:-translate-y-0.5 hover:shadow-md dark:border-primary-800 dark:bg-gray-800">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600 motion-safe:[animation:rr-preview-dot_1.8s_ease-in-out_infinite]" aria-hidden="true" />
            <span className="shrink-0 text-xs font-medium text-muted">{t("routing.winningRule")}</span>
            <span className={conditionChip(winner.condition)}>{t(`enums.condition.${winner.condition}`)}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4 shrink-0 text-ink-3" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h12m0 0-4-4m4 4-4 4" /></svg>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{t(`enums.routingAction.${winner.action}`)}{winner.target ? ` (${winner.target})` : ""}</span>
          </div>
        ) : (
          <p className="text-sm text-muted">{t("routing.noMatch")}</p>
        )}
      </div>
    </div>
  );
}
