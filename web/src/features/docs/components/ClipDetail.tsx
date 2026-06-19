import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge, Button } from "@/components/ui";
import { workspaceStore } from "../workspace.store";
import { memberName, SELF_ID } from "../workspace.data";
import { clipToDoc, clipToMessage, clipToWorkItem, completionRate, isLinkExpired } from "../workspace.clips";
import type { Clip, ClipPrivacy } from "../workspace.types";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const PRIVACIES: ClipPrivacy[] = ["link", "workspace", "people"];
const EMOJIS = ["👍", "🔥", "🎉", "👏"];

/** Ad → en çok iki harfli baş harf (yorum avatarı). */
const initials = (name: string) =>
  name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
/** Avatar tonları — sırayla döner; durum değil kimlik vurgusu (dekoratif). */
const AVATAR_TONES = ["bg-blue-100 text-blue-900", "bg-amber-100 text-amber-900", "bg-green-100 text-green-900"];

/** Gizlilik türü ikonu (dekoratif; anlam metin etiketiyle taşınır). */
function PrivacyIcon({ p }: { p: ClipPrivacy }) {
  const c = { className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  if (p === "link")
    return (
      <svg {...c}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    );
  if (p === "people")
    return (
      <svg {...c}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    );
  return (
    <svg {...c}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  );
}

/**
 * Klip detayı — oynatıcı, AI üretimi, düzenleme, yorumlar, paylaşım, CTA.
 * AI bölümü tonlu bir kart; yorumlar avatar + sohbet baloncuğu; gizlilik
 * açıklamalı radyo kartlarıyla seçilir. Durum renk + metin taşır (renk tek
 * taşıyıcı değil); tonlu zeminde metin (blue-900/ink) AAA eşiğinin üstündedir.
 */
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
  const privacy = clip.privacy ?? "workspace";

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

      {/* AI — tonlu öne çıkan kart */}
      <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="sparkles" className="h-4 w-4 text-brand" />
          <h4 className="text-sm font-semibold text-blue-900">{t("clip.ai")}</h4>
          <Button className="ml-auto" size="sm" onClick={() => generateAi(clip.id)}>
            {t("clip.generateAi")}
          </Button>
        </div>
        {clip.summary ? <p className="mb-3 text-sm text-ink">{clip.summary}</p> : null}
        {clip.chapters && clip.chapters.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {clip.chapters.map((ch, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs text-blue-900 ring-1 ring-blue-200">
                <span className="tabular-nums">{fmt(ch.atSec)}</span> {ch.title}
              </span>
            ))}
          </div>
        ) : null}
        {clip.tasks && clip.tasks.length > 0 ? (
          <ul className="mb-3 flex flex-col gap-1.5">
            {clip.tasks.map((task, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink">
                <svg className="mt-0.5 h-4 w-4 flex-none text-green-700" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
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

      {/* Comments + reactions — avatar + sohbet baloncukları */}
      <section>
        <div className="mb-3 flex items-center gap-2">
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
        <ul className="mb-3 flex flex-col gap-2.5">
          {(clip.comments ?? []).map((c, i) => (
            <li key={c.id} className="flex gap-2">
              <span
                aria-hidden
                className={"inline-flex h-7 w-7 flex-none items-center justify-center rounded-full text-[0.625rem] font-semibold " + AVATAR_TONES[i % AVATAR_TONES.length]}
              >
                {initials(memberName(c.authorId))}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-surface-2 px-3 py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-ink">{memberName(c.authorId)}</span>
                  <span className="text-xs tabular-nums text-muted">{fmt(c.atSec)}</span>
                </div>
                <p className="mt-0.5 text-sm text-ink">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <span aria-hidden className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-900">
            {initials(memberName(SELF_ID))}
          </span>
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

      {/* Sharing & privacy — gizlilik açıklamalı radyo kartları */}
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
        <div role="radiogroup" aria-label={t("clip.privacyLabel")} className="flex flex-col gap-1.5">
          {PRIVACIES.map((p) => {
            const sel = privacy === p;
            return (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={sel}
                onClick={() => setPrivacy(clip.id, p)}
                className={
                  "flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-[background-color,border-color] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none " +
                  (sel ? "border-brand bg-brand-softer" : "border-line hover:bg-surface-2")
                }
              >
                <span className={"inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg " + (sel ? "bg-blue-100 text-blue-900" : "bg-surface-3 text-ink-2")}>
                  <PrivacyIcon p={p} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">{t(`clip.privacy.${p}`)}</span>
                  <span className="block text-xs text-muted">{t(`clip.privacyDesc.${p}`)}</span>
                </span>
                {sel ? (
                  <svg className="h-5 w-5 flex-none text-blue-800" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                ) : null}
              </button>
            );
          })}
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

      {/* CTA — etiketli form kartı */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon name="bolt" className="h-4 w-4 text-brand" />
          <h4 className="text-sm font-semibold text-ink">{t("clip.cta")}</h4>
          <Badge tone="neutral" className="ml-auto">
            {t("clip.ctaClicks", { n: clip.ctaClicks ?? 0 })}
          </Badge>
        </div>
        <div className="space-y-2.5 rounded-xl border border-line bg-surface-2 p-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">{t("clip.ctaLabelPh")}</span>
            <input
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder={t("clip.ctaLabelPh")}
              aria-label={t("clip.ctaLabelPh")}
              className="input h-10 w-full"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">{t("clip.ctaUrlLabel")}</span>
            <input
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder={t("clip.ctaUrlPh")}
              aria-label={t("clip.ctaUrlLabel")}
              className="input h-10 w-full"
            />
          </label>
          <div className="flex items-center justify-between gap-2 pt-0.5">
            {clip.ctaLabel ? (
              <Button onClick={() => clickCta(clip.id)}>{clip.ctaLabel}</Button>
            ) : (
              <span className="text-xs text-muted">{t("clip.ctaLabelPh")}</span>
            )}
            <Button variant="secondary" onClick={() => setCta(clip.id, ctaLabel, ctaUrl)}>
              {t("clip.setCta")}
            </Button>
          </div>
        </div>
      </section>

      {/* Variables — açıklamalı kart */}
      <section>
        <div className="space-y-2 rounded-xl border border-line bg-surface-2 p-3">
          <div>
            <span className="block text-sm font-medium text-ink">{t("clip.variables")}</span>
            <p className="mt-0.5 text-xs text-muted">{t("clip.variablesHelp")}</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <input
              type="number"
              min={1}
              max={100}
              value={copies}
              onChange={(e) => setCopies(Number(e.target.value))}
              aria-label={t("clip.variables")}
              className="input h-10 w-24"
            />
            <Button onClick={() => createVariables(clip.id, copies)}>
              <Icon name="sparkles" className="h-4 w-4" /> {t("clip.createVariables")}
            </Button>
            {clip.variablesCopies ? <Badge tone="positive">{t("clip.copies", { n: clip.variablesCopies })}</Badge> : null}
          </div>
        </div>
      </section>
    </article>
  );
}
