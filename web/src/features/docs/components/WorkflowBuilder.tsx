import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Button, Select } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { workspaceStore } from "../workspace.store";
import { memberName } from "../workspace.data";
import type { WorkflowTrigger } from "../workspace.types";

const TRIGGERS: WorkflowTrigger[] = ["message", "schedule", "reaction"];

/** Adım türü → ikon + renk (yatay pipeline çipleri). Bilinmeyen tür nötr kalır. */
const STEP_META: Record<string, { badge: string; chip: string; text: string }> = {
  send_message: { badge: "bg-blue-100 text-blue-900", chip: "border-blue-100 bg-blue-50", text: "text-blue-900" },
  assign: { badge: "bg-amber-100 text-amber-900", chip: "border-amber-100 bg-amber-50", text: "text-amber-900" },
  add_label: { badge: "bg-green-100 text-green-900", chip: "border-green-100 bg-green-50", text: "text-green-900" },
  wait: { badge: "bg-surface-3 text-ink-2", chip: "border-line bg-surface-2", text: "text-ink-2" },
};
const STEP_NEUTRAL = { badge: "bg-surface-3 text-ink-2", chip: "border-line bg-surface-2", text: "text-ink-2" };
const stepMeta = (kind: string) => STEP_META[kind] ?? STEP_NEUTRAL;

/** Adım türü ikonu (stroke, currentColor). */
function StepIcon({ kind }: { kind: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  if (kind === "send_message")
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.019Z" />
      </svg>
    );
  if (kind === "assign")
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    );
  if (kind === "add_label")
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
      </svg>
    );
  if (kind === "wait")
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    );
  return (
    <svg {...common}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  );
}

const ArrowSep = () => (
  <span className="inline-flex items-center text-gray-400" aria-hidden>
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  </span>
);

/**
 * Workflows — otomasyon iş akışı oluşturucu. Sol: iş akışı listesi + ekleme.
 * Sağ: seçili akış yatay bir pipeline olarak — tetikleyici çipinden başlar,
 * her adım tür-renkli ikon çipi olarak oklarla zincirlenir (mobilde sarar).
 * Adım türü hem ikon/renk hem metinle taşınır; tonlu çiplerde metin AAA.
 */
export function WorkflowBuilder() {
  const { t } = useTranslation("docs");
  const workflows = useStore(workspaceStore, (s) => s.workflows);
  const lastRun = useStore(workspaceStore, (s) => s.lastRun);
  const { runWorkflow, addWorkflow } = workspaceStore.getState();
  const [sel, setSel] = useState(workflows[0]?.id ?? "");
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<WorkflowTrigger>("message");

  const wf = workflows.find((w) => w.id === sel) ?? workflows[0];

  /** assign adımının değeri bir kullanıcı kimliğidir → okunur ada çevir. */
  const stepValue = (kind: string, value: string) => (kind === "assign" && value ? memberName(value) : value);

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-3">
      <div className="card min-w-0 p-3 lg:col-span-1">
        <h3 className="mb-2 text-sm font-semibold text-ink">{t("tabs.workflows")}</h3>
        <ul className="space-y-1">
          {workflows.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => setSel(w.id)}
                aria-current={wf?.id === w.id ? "true" : undefined}
                className={
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] motion-reduce:transition-none " +
                  (wf?.id === w.id ? "bg-surface-3 text-ink" : "text-muted hover:bg-surface-2")
                }
              >
                <Icon name="bolt" className="h-4 w-4 flex-none" /> <span className="truncate">{w.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-2 border-t border-line pt-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("workflows.name")}
            aria-label={t("workflows.name")}
            className="input h-10"
          />
          <Select<WorkflowTrigger>
            value={trigger}
            onChange={setTrigger}
            aria-label={t("workflows.triggerLabel")}
            options={TRIGGERS.map((tr) => ({
              value: tr,
              label: t(`workflows.trigger.${tr}`),
            }))}
          />
          <Button
            className="w-full"
            disabled={!name.trim()}
            onClick={() => {
              addWorkflow(name.trim(), trigger);
              setName("");
            }}
          >
            <Icon name="plus" className="h-4 w-4" /> {t("workflows.add")}
          </Button>
        </div>
      </div>

      <div className="card min-w-0 p-3 sm:p-4 lg:col-span-2">
        {wf ? (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h3 className="min-w-0 break-words text-sm font-semibold text-ink">{wf.name}</h3>
              <Button className="ml-auto" size="sm" onClick={() => runWorkflow(wf.id)}>
                <Icon name="play" className="h-4 w-4" /> {t("workflows.run")}
              </Button>
            </div>

            {wf.steps.length === 0 ? (
              <p className="text-sm text-muted">{t("workflows.noSteps")}</p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800 px-2.5 py-1.5 text-xs font-medium text-white">
                  {t("workflows.triggerLabel")} · {t(`workflows.trigger.${wf.trigger}`)}
                </span>
                {wf.steps.map((s) => {
                  const meta = stepMeta(s.kind);
                  const val = stepValue(s.kind, s.value);
                  return (
                    <span key={s.id} className="contents">
                      <ArrowSep />
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ${meta.chip}`}>
                        <span className={`inline-flex h-5 w-5 flex-none items-center justify-center rounded-md ${meta.badge}`} aria-hidden>
                          <span className="h-3.5 w-3.5">
                            <StepIcon kind={s.kind} />
                          </span>
                        </span>
                        <span className={`font-medium ${meta.text}`}>
                          {t(`workflows.stepKind.${s.kind}`)}
                          {val ? <span className="font-normal"> · {val}</span> : null}
                        </span>
                      </span>
                    </span>
                  );
                })}
              </div>
            )}

            {lastRun ? (
              <div className="mt-3 rounded-lg border border-ok/40 bg-ok/5 p-2">
                <div className="mb-1 text-sm font-medium text-ok">{t("workflows.runLog")}</div>
                <ul className="space-y-0.5 tl-stagger">
                  {lastRun.map((r) => (
                    <li key={r.id} className="flex items-center gap-1 text-sm text-ink">
                      <Icon name="check" className="h-3.5 w-3.5 text-ok" /> {r.label}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
