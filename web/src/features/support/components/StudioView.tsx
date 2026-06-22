// web/src/features/support/components/StudioView.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { studioStore, useStudioStore } from "../studio.store";
import { agentReady, resolutionRate } from "../studio.dom";
import { Card } from "./Card";
import type { AgentChannel, StudioAgentStatus } from "../support.types";

const CHANNELS: AgentChannel[] = ["webchat", "whatsapp", "voice", "email"];
const STATUS_TONE: Record<StudioAgentStatus, "neutral" | "warning" | "positive"> = {
  draft: "neutral",
  testing: "warning",
  published: "positive",
};

/** AI Agent Studio: agent CRUD, intent yönetimi, sandbox test alanı. */
export function StudioView() {
  const { t } = useTranslation("support");
  const agents = useStudioStore((s) => s.agents);
  const activeId = useStudioStore((s) => s.activeAgentId);
  const testLog = useStudioStore((s) => s.testLog);
  const act = studioStore.getState;

  const agent = agents.find((a) => a.id === activeId) ?? agents[0];
  const ready = agentReady(agent);
  const rate = Math.round(resolutionRate(agent) * 100);

  const [newName, setNewName] = useState("");
  const [intentLabel, setIntentLabel] = useState("");
  const [intentPhrases, setIntentPhrases] = useState("");
  const [intentReply, setIntentReply] = useState("");
  const [utterance, setUtterance] = useState("");

  const submitIntent = () => {
    const phrases = intentPhrases.split(",").map((p) => p.trim()).filter(Boolean);
    if (!intentLabel.trim() || phrases.length === 0 || !intentReply.trim()) return;
    act().addIntent({ label: intentLabel.trim(), phrases, reply: intentReply.trim() });
    setIntentLabel("");
    setIntentPhrases("");
    setIntentReply("");
  };

  const send = () => {
    if (!utterance.trim()) return;
    act().runTest(utterance.trim());
    setUtterance("");
  };

  return (
    <div className="tl-stagger flex flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden pb-4 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-[15rem_minmax(0,1fr)_19rem] xl:grid-cols-[16rem_minmax(0,1fr)_20rem]">
      {/* Agent listesi */}
      <Card className="min-w-0 md:col-span-2 lg:col-span-1">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="sparkles" className="h-5 w-5 text-brand" aria-hidden />
          <h2 className="text-base font-semibold text-ink">{t("studio.agents")}</h2>
        </div>
        <ul className="mb-3 space-y-1">
          {agents.map((a) => (
            <li key={a.id}>
              <button
                onClick={() => act().selectAgent(a.id)}
                aria-current={a.id === activeId ? "true" : undefined}
                className={clsx(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-[transform,background-color] ease-[var(--ease-out)] motion-safe:active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand",
                  a.id === activeId ? "bg-brand text-white" : "text-ink hover:bg-surface-2",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{a.name}</span>
                <Badge tone={STATUS_TONE[a.status]}>{t(`studio.status.${a.status}`)}</Badge>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("studio.newAgentPh")}
            aria-label={t("studio.newAgentPh")}
            className="input min-w-0 flex-1"
          />
          <IconButton
            label={t("studio.create")}
            variant="primary"
            onClick={() => {
              act().createAgent(newName);
              setNewName("");
            }}
          >
            <Icon name="plus" className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
      </Card>

      {/* Tasarım */}
      <Card className="min-w-0">
        <label className="mb-1 block text-sm font-medium text-ink" htmlFor="ag-name">
          {t("studio.name")}
        </label>
        <input
          id="ag-name"
          value={agent.name}
          onChange={(e) => act().setName(e.target.value)}
          className="input mb-3"
        />

        <label className="mb-1 block text-sm font-medium text-ink" htmlFor="ag-goal">
          {t("studio.goal")}
        </label>
        <textarea
          id="ag-goal"
          rows={2}
          value={agent.goal}
          onChange={(e) => act().setGoal(e.target.value)}
          placeholder={t("studio.goalPh")}
          className="input mb-3"
        />

        <fieldset className="mb-3">
          <legend className="mb-1 text-sm font-medium text-ink">{t("studio.channels")}</legend>
          <div className="flex flex-wrap gap-3">
            {CHANNELS.map((c) => (
              <label key={c} className="inline-flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={agent.channels.includes(c)} onChange={() => act().toggleChannel(c)} className="checkbox" />
                {t(`studio.channel.${c}`)}
              </label>
            ))}
          </div>
        </fieldset>

        {agent.tools.length > 0 ? (
          <fieldset className="mb-3">
            <legend className="mb-1 text-sm font-medium text-ink">{t("studio.tools")}</legend>
            <div className="flex flex-wrap gap-3">
              {agent.tools.map((tool) => (
                <label key={tool.id} className="inline-flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" checked={tool.enabled} onChange={() => act().toggleTool(tool.id)} className="checkbox" />
                  {tool.label}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <h3 className="mb-2 text-sm font-semibold text-ink">{t("studio.intents")}</h3>
        <ul className="mb-2 space-y-1">
          {agent.intents.map((intent) => (
            <li key={intent.id} className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm">
              <span className="font-medium text-ink">{intent.label}</span>
              <span className="min-w-0 flex-1 truncate text-muted">{intent.phrases.join(", ")}</span>
              <IconButton label={t("common.delete")} className="ml-auto" onClick={() => act().removeIntent(intent.id)}>
                <Icon name="trash" className="h-4 w-4" aria-hidden />
              </IconButton>
            </li>
          ))}
        </ul>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <input
              value={intentLabel}
              onChange={(e) => setIntentLabel(e.target.value)}
              placeholder={t("studio.intentLabelPh")}
              aria-label={t("studio.intentLabelPh")}
              className="input min-w-0 flex-1"
            />
            <input
              value={intentPhrases}
              onChange={(e) => setIntentPhrases(e.target.value)}
              placeholder={t("studio.intentPhrasesPh")}
              aria-label={t("studio.intentPhrasesPh")}
              className="input min-w-0 flex-1"
            />
          </div>
          <div className="flex gap-2">
            <input
              value={intentReply}
              onChange={(e) => setIntentReply(e.target.value)}
              placeholder={t("studio.intentReplyPh")}
              aria-label={t("studio.intentReplyPh")}
              className="input min-w-0 flex-1"
            />
            <Button size="sm" onClick={submitIntent}>
              <Icon name="plus" className="h-4 w-4" aria-hidden /> {t("studio.addIntent")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Test + yayın */}
      <Card className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-base font-semibold text-ink">{t("studio.sandbox")}</h2>
          <Badge tone="accent" className="ml-auto">
            {t("studio.resolution", { n: rate })}
          </Badge>
        </div>
        <p className="mb-3 text-sm text-muted">{t("studio.runs", { n: agent.metrics.runs })}</p>

        {testLog.length === 0 ? (
          <EmptyState icon={<Icon name="sparkles" className="h-6 w-6" aria-hidden />} title={t("studio.sandboxEmpty")} />
        ) : (
          <ul className="mb-3 space-y-2">
            {testLog.map((turn) => (
              <li key={turn.id} className={clsx("flex min-w-0 gap-2", turn.who === "user" ? "flex-row-reverse" : "")}>
                <span className={clsx("mt-0.5 shrink-0", turn.who === "agent" ? "text-brand" : "text-muted")}>
                  <Icon name={turn.who === "agent" ? "sparkles" : "userCircle"} className="h-4 w-4" aria-hidden />
                </span>
                <span className={clsx("max-w-[80%] break-words rounded-lg px-3 py-1.5 text-sm", turn.who === "agent" ? "bg-surface-2 text-ink" : "bg-brand text-white")}>
                  {turn.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mb-3 flex items-end gap-2">
          <label htmlFor="ag-test" className="sr-only">
            {t("studio.sandboxPh")}
          </label>
          <input
            id="ag-test"
            value={utterance}
            onChange={(e) => setUtterance(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
            placeholder={t("studio.sandboxPh")}
            className="input min-w-0 flex-1"
          />
          <IconButton label={t("studio.run")} variant="primary" onClick={send} disabled={!utterance.trim()}>
            <Icon name="send" className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>

        {ready.ok ? (
          <Button onClick={() => act().publish()} disabled={agent.status === "published"} className="w-full">
            <Icon name="checkCircle" className="h-4 w-4" aria-hidden />
            {agent.status === "published" ? t("studio.published") : t("studio.publish")}
          </Button>
        ) : (
          <div className="flex items-start gap-1.5 rounded-md border border-amber-300 bg-amber-50 p-2 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Icon name="warning" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span className="min-w-0 break-words">
              {t("studio.missing")}: {ready.missing.map((m) => t(`studio.req.${m}`)).join(", ")}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}
