import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge, Button, Select } from "@/components/ui";
import { workspaceStore } from "../workspace.store";
import { memberName, SELF_ID } from "../workspace.data";
import { clipToDoc, clipToMessage, clipToWorkItem, completionRate, isLinkExpired } from "../workspace.clips";
import type { Clip, ClipPrivacy } from "../workspace.types";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const PRIVACIES: ClipPrivacy[] = ["link", "workspace", "people"];
const EMOJIS = ["👍", "🔥", "🎉", "👏"];

/** Klip detayı — oynatıcı, AI üretimi, düzenleme, yorumlar, paylaşım, CTA. */
export function ClipDetail({ clip }: { clip: Clip }) {
  const { t } = useTranslation("docs");
  const {
    generateAiClip: generateAi,
    setClipPrivacy: setPrivacy,
    setClipPassword: setPassword,
    setClipExpiry: setExpiry,
    addClipComment: addComment,
    toggleClipReaction: toggleReaction,
    setClipCta: setCta,
    removeFiller,
    removeSilence,
    archiveClip,
    createVariables,
    clickCta,
  } = workspaceStore.getState();

  const [comment, setComment] = useState("");
  const [pwd, setPwd] = useState(clip.password ?? "");
  const [ctaLabel, setCtaLabel] = useState(clip.ctaLabel ?? "");
  const [ctaUrl, setCtaUrl] = useState(clip.ctaUrl ?? "");
  const [output, setOutput] = useState("");
  const [copies, setCopies] = useState(10);

  const pct = Math.round(completionRate(clip) * 100);
  const expired = isLinkExpired(clip);

  return (
    <article className="card space-y-4 p-4">
      {/* Header + player placeholder */}
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-ink">{clip.title}</h3>
          <Badge tone="accent">{t(`clip.recordMode.${clip.recordMode ?? "screen_cam"}`)}</Badge>
          <Badge tone={clip.privacy === "link" ? "warning" : "neutral"}>{t(`clip.privacy.${clip.privacy ?? "workspace"}`)}</Badge>
          {clip.archived ? <Badge tone="neutral">{t("clip.archived")}</Badge> : null}
          <span className="ml-auto inline-flex items-center gap-1 text-sm text-muted">
            <Icon name="info" className="h-4 w-4" /> {t("clip.views", { n: clip.views })}
          </span>
        </div>
        <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-surface-3 text-muted">
          <Icon name="video" className="h-12 w-12" />
        </div>
        {/* Engagement */}
        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted">{t("clip.completion")}</span>
            <span className="font-medium text-ink">{pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-brand transition-[width] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Editing */}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => removeFiller(clip.id)} disabled={clip.fillerRemoved}>
          <Icon name="pencil" className="h-4 w-4" /> {clip.fillerRemoved ? t("clip.fillerDone") : t("clip.removeFiller")}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => removeSilence(clip.id)} disabled={clip.silenceRemoved}>
          <Icon name="volumeOff" className="h-4 w-4" /> {clip.silenceRemoved ? t("clip.silenceDone") : t("clip.removeSilence")}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => archiveClip(clip.id)}>
          {clip.archived ? t("clip.unarchive") : t("clip.archive")}
        </Button>
      </div>

      {/* AI */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <Icon name="sparkles" className="h-4 w-4 text-brand" />
          <h4 className="text-sm font-semibold text-ink">{t("clip.ai")}</h4>
          <Button className="ml-auto" size="sm" onClick={() => generateAi(clip.id)}>
            {t("clip.generateAi")}
          </Button>
        </div>
        {clip.summary ? <p className="mb-2 text-sm text-ink">{clip.summary}</p> : null}
        {clip.chapters && clip.chapters.length > 0 ? (
          <ul className="mb-2 space-y-1">
            {clip.chapters.map((ch, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-ink">
                <span className="tabular-nums text-muted">{fmt(ch.atSec)}</span> {ch.title}
              </li>
            ))}
          </ul>
        ) : null}
        {clip.tasks && clip.tasks.length > 0 ? (
          <ul className="mb-2 list-disc space-y-0.5 pl-5">
            {clip.tasks.map((task, i) => (
              <li key={i} className="text-sm text-ink">
                {task}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setOutput(clipToDoc(clip))}>
            <Icon name="clipboard" className="h-4 w-4" /> {t("clip.toDoc")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const w = clipToWorkItem(clip);
              setOutput(`${w.title}\n\n${w.body}`);
            }}
          >
            <Icon name="grid" className="h-4 w-4" /> {t("clip.toTicket")}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setOutput(clipToMessage(clip))}>
            <Icon name="send" className="h-4 w-4" /> {t("clip.toMessage")}
          </Button>
        </div>
        {output ? (
          <label className="mt-2 block">
            <span className="sr-only">{t("clip.output")}</span>
            <textarea readOnly value={output} rows={5} className="input" />
          </label>
        ) : null}
      </section>

      {/* Transcript */}
      <section>
        <h4 className="mb-1 text-sm font-semibold text-ink">{t("clip.transcript")}</h4>
        <p className="text-sm text-muted">{clip.transcript || "—"}</p>
      </section>

      {/* Comments + reactions */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <Icon name="comment" className="h-4 w-4 text-brand" />
          <h4 className="text-sm font-semibold text-ink">{t("clip.comments")}</h4>
          <div className="ml-auto flex gap-1">
            {EMOJIS.map((e) => {
              const hit = clip.reactions?.find((r) => r.emoji === e);
              return (
                <button
                  key={e}
                  type="button"
                  onClick={() => toggleReaction(clip.id, e)}
                  aria-pressed={!!hit}
                  className={
                    "rounded-full border px-2 py-0.5 text-sm transition-[transform,background-color,border-color,color] duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none " +
                    (hit ? "border-brand bg-brand-softer text-ink" : "border-line text-muted hover:bg-surface-2")
                  }
                >
                  {e} {hit ? hit.count : ""}
                </button>
              );
            })}
          </div>
        </div>
        <ul className="mb-2 space-y-1">
          {(clip.comments ?? []).map((c) => (
            <li key={c.id} className="rounded-md border border-line px-3 py-1.5 text-sm">
              <span className="font-medium text-ink">{memberName(c.authorId)}</span>
              <span className="text-muted"> · {fmt(c.atSec)}</span>
              <div className="text-ink">{c.body}</div>
            </li>
          ))}
        </ul>
        <div className="flex items-end gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("clip.commentPh")}
            aria-label={t("clip.commentPh")}
            className="input h-10 flex-1"
          />
          <Button
            onClick={() => {
              if (!comment.trim()) return;
              addComment(clip.id, SELF_ID, 0, comment.trim());
              setComment("");
            }}
          >
            {t("clip.addComment")}
          </Button>
        </div>
      </section>

      {/* Sharing & privacy */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon name="link" className="h-4 w-4 text-brand" />
          <h4 className="text-sm font-semibold text-ink">{t("clip.sharing")}</h4>
          {expired ? (
            <Badge tone="danger" className="ml-auto">
              {t("clip.expired")}
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-sm text-muted">
            <Icon name="usersThree" className="h-4 w-4" /> {t("clip.privacyLabel")}
          </span>
          <Select<ClipPrivacy>
            value={clip.privacy ?? "workspace"}
            onChange={(v) => setPrivacy(clip.id, v)}
            aria-label={t("clip.privacyLabel")}
            options={PRIVACIES.map((p) => ({
              value: p,
              label: t(`clip.privacy.${p}`),
            }))}
            size="sm"
            className="w-44"
          />
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex-1">
            <span className="mb-1 flex items-center gap-1 text-sm text-muted">
              <Icon name="key" className="h-4 w-4" /> {t("clip.password")}
            </span>
            <input
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder={t("clip.passwordPh")}
              aria-label={t("clip.password")}
              className="input h-10"
            />
          </label>
          <Button variant="secondary" onClick={() => setPassword(clip.id, pwd)}>
            {t("clip.setPassword")}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-sm text-muted">
            <Icon name="clock" className="h-4 w-4" /> {t("clip.expiry")}
          </span>
          <Button variant="secondary" size="sm" onClick={() => setExpiry(clip.id, Date.now() + 7 * 86_400_000)}>
            {t("clip.expire7d")}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setExpiry(clip.id, null)}>
            {t("clip.noExpiry")}
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon name="bolt" className="h-4 w-4 text-brand" />
          <h4 className="text-sm font-semibold text-ink">{t("clip.cta")}</h4>
          <Badge tone="neutral" className="ml-auto">
            {t("clip.ctaClicks", { n: clip.ctaClicks ?? 0 })}
          </Badge>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <input
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            placeholder={t("clip.ctaLabelPh")}
            aria-label={t("clip.ctaLabelPh")}
            className="input h-10 flex-1"
          />
          <input
            value={ctaUrl}
            onChange={(e) => setCtaUrl(e.target.value)}
            placeholder={t("clip.ctaUrlPh")}
            aria-label={t("clip.ctaUrlPh")}
            className="input h-10 flex-1"
          />
          <Button variant="secondary" onClick={() => setCta(clip.id, ctaLabel, ctaUrl)}>
            {t("clip.setCta")}
          </Button>
        </div>
        {clip.ctaLabel ? <Button onClick={() => clickCta(clip.id)}>{clip.ctaLabel}</Button> : null}
      </section>

      {/* Variables */}
      <section className="flex flex-wrap items-end gap-2">
        <label>
          <span className="mb-1 block text-sm font-medium text-ink">{t("clip.variables")}</span>
          <input
            type="number"
            min={1}
            max={100}
            value={copies}
            onChange={(e) => setCopies(Number(e.target.value))}
            aria-label={t("clip.variables")}
            className="input h-10 w-24"
          />
        </label>
        <Button variant="secondary" onClick={() => createVariables(clip.id, copies)}>
          {t("clip.createVariables")}
        </Button>
        {clip.variablesCopies ? <Badge tone="positive">{t("clip.copies", { n: clip.variablesCopies })}</Badge> : null}
      </section>
    </article>
  );
}
