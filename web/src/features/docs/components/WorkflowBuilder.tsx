import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge, Button } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { workspaceStore } from "../workspace.store";
import type { WorkflowTrigger } from "../workspace.types";

const TRIGGERS: WorkflowTrigger[] = ["message", "schedule", "reaction"];

/** Workflows — otomasyon iş akışı oluşturucu (üç sütun: liste + detay/çalıştırma). */
export function WorkflowBuilder() {
  const { t } = useTranslation("docs");
  const workflows = useStore(workspaceStore, (s) => s.workflows);
  const lastRun = useStore(workspaceStore, (s) => s.lastRun);
  const { runWorkflow, addWorkflow } = workspaceStore.getState();
  const [sel, setSel] = useState(workflows[0]?.id ?? "");
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<WorkflowTrigger>("message");

  const wf = workflows.find((w) => w.id === sel) ?? workflows[0];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="card p-3 lg:col-span-1">
        <h3 className="mb-2 text-sm font-semibold text-ink">{t("tabs.workflows")}</h3>
        <ul className="space-y-1">
          {workflows.map((w) => (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => setSel(w.id)}
                aria-current={wf?.id === w.id ? "true" : undefined}
                className={
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors motion-reduce:transition-none " +
                  (wf?.id === w.id ? "bg-surface-3 text-ink" : "text-muted hover:bg-surface-2")
                }
              >
                <Icon name="bolt" className="h-4 w-4" /> {w.name}
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
          <select
            value={trigger}
            onChange={(e) => setTrigger(e.target.value as WorkflowTrigger)}
            aria-label={t("workflows.triggerLabel")}
            className="h-10 w-full rounded-lg border border-line bg-surface px-2 text-sm text-ink"
          >
            {TRIGGERS.map((tr) => (
              <option key={tr} value={tr}>
                {t(`workflows.trigger.${tr}`)}
              </option>
            ))}
          </select>
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

      <div className="card p-4 lg:col-span-2">
        {wf ? (
          <>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-ink">{wf.name}</h3>
              <Badge tone="accent">{t(`workflows.trigger.${wf.trigger}`)}</Badge>
              <Button className="ml-auto" size="sm" onClick={() => runWorkflow(wf.id)}>
                <Icon name="play" className="h-4 w-4" /> {t("workflows.run")}
              </Button>
            </div>
            <ol className="space-y-1">
              {wf.steps.map((s, i) => (
                <li key={s.id} className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm">
                  <span className="text-muted">{i + 1}.</span>
                  <span className="font-medium text-ink">{t(`workflows.stepKind.${s.kind}`)}</span>
                  <span className="truncate text-muted">{s.value}</span>
                </li>
              ))}
              {wf.steps.length === 0 ? <li className="text-sm text-muted">{t("workflows.noSteps")}</li> : null}
            </ol>

            {lastRun ? (
              <div className="mt-3 rounded-lg border border-ok/40 bg-ok/5 p-2">
                <div className="mb-1 text-sm font-medium text-ok">{t("workflows.runLog")}</div>
                <ul className="space-y-0.5">
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
