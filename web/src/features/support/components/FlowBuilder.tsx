// web/src/features/support/components/FlowBuilder.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Select } from "@/components/ui/Select";
import { botflowStore, activeFlow, useBotflowStore } from "../botflow.store";
import { traverse, nodeById, flowStats, danglingTargets, unreachableNodes } from "../botflow.dom";
import { NODE_ICON } from "../shared";
import { Card } from "./Card";
import { PanelHint } from "./PanelHint";
import type { BotNodeKind } from "../support.types";

const ADDABLE: BotNodeKind[] = ["message", "question", "collect", "condition", "handoff", "end"];

/** No-code chatbot akış tasarımcısı + WhatsApp Flows (collect düğümleri). */
export function FlowBuilder() {
  const { t } = useTranslation("support");
  const flow = useBotflowStore(activeFlow);
  const flows = useBotflowStore((s) => s.flows);
  const act = botflowStore.getState;
  const [path, setPath] = useState<string[]>([]);

  const stats = flowStats(flow);
  const dangling = danglingTargets(flow);
  const unreachable = unreachableNodes(flow);

  // Varsayılan cevaplar: her question düğümünde ilk seçeneği al.
  const simulate = () => {
    const answers: Record<string, string> = {};
    for (const n of flow.nodes) if (n.kind === "question" && n.options?.[0]) answers[n.id] = n.options[0].label;
    setPath(traverse(flow, answers));
  };

  return (
    <Card>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-1.5 text-base font-semibold text-ink">
          <Icon name="sliders" className="h-5 w-5" aria-hidden /> {t("flow.title")}
        </h3>
        <Select
          value={flow.id}
          onChange={(v) => {
            act().setActiveFlow(v);
            setPath([]);
          }}
          aria-label={t("flow.title")}
          options={flows.map((f) => ({
            value: f.id,
            label: f.name,
          }))}
          size="sm"
          className="w-full sm:w-48"
        />
        <span className="ml-auto text-xs text-muted">
          {Object.entries(stats)
            .filter(([, n]) => n > 0)
            .map(([k, n]) => `${t(`flow.kind.${k}`)} ${n}`)
            .join(" · ")}
        </span>
      </div>
      <PanelHint>{t("flow.subtitle")}</PanelHint>

      {dangling.length > 0 ? (
        <p className="mb-2 flex items-center gap-1 rounded-md border border-danger px-3 py-1.5 text-sm text-danger" aria-live="polite">
          <Icon name="warning" className="h-4 w-4" aria-hidden /> {t("flow.dangling", { n: dangling.length })}
        </p>
      ) : null}
      {unreachable.length > 0 ? (
        <p className="mb-2 flex items-center gap-1 rounded-md border border-warning px-3 py-1.5 text-sm text-warning" aria-live="polite">
          <Icon name="info" className="h-4 w-4" aria-hidden /> {t("flow.unreachable", { n: unreachable.length })}
        </p>
      ) : null}

      <ul className="space-y-1">
        {flow.nodes.map((n) => (
          <li key={n.id} className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm">
            <Icon name={NODE_ICON[n.kind]} className="h-4 w-4 text-muted" aria-hidden />
            <Badge tone="neutral">{t(`flow.kind.${n.kind}`)}</Badge>
            <span className="min-w-0 flex-1 truncate text-ink">{n.text}</span>
            {n.id === flow.startId ? <Badge tone="info">{t("flow.start")}</Badge> : null}
            {n.kind === "collect" ? <Badge tone="neutral">{t("flow.waFlow")}</Badge> : null}
            <IconButton label={t("flow.remove")} onClick={() => act().removeNode(n.id)}>
              <Icon name="trash" className="h-4 w-4" aria-hidden />
            </IconButton>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
        {ADDABLE.map((k) => (
          <Button key={k} size="sm" variant="secondary" onClick={() => act().addNode(k)}>
            <Icon name="plus" className="h-3.5 w-3.5" aria-hidden /> {t(`flow.kind.${k}`)}
          </Button>
        ))}
        <Button size="sm" className="ml-auto" onClick={simulate}>
          <Icon name="play" className="h-4 w-4" aria-hidden /> {t("flow.simulate")}
        </Button>
      </div>

      <p className="mt-2 text-sm text-muted" aria-live="polite">
        {path.length > 0
          ? `${t("flow.path")}: ${path.map((id) => nodeById(flow, id)?.text ?? id).join(" → ")}`
          : t("flow.noPath")}
      </p>
    </Card>
  );
}
