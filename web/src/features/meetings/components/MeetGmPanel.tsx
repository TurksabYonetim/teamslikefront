import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineShieldCheck,
  HiOutlineMapPin,
  HiOutlineEye,
  HiOutlineUserMinus,
  HiOutlinePencil,
  HiOutlineCursorArrowRays,
  HiOutlineSparkles,
  HiOutlineLanguage,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import { MdMicOff, MdVideocamOff } from "react-icons/md";
import clsx from "clsx";
import { meetingStore, useMeeting } from "../meetings.store";
import { Badge, Button, Select } from "@/components/ui";
import type {
  AccessTier,
  BandwidthPolicy,
  NotesRecipients,
  ResolutionLevel,
} from "../meetings.store.types";

const TIERS: AccessTier[] = ["open", "trusted", "restricted"];
const RES: ResolutionLevel[] = ["auto", "fhd", "hd", "sd", "audio"];
const BW: BandwidthPolicy[] = ["auto", "limited", "audio"];
const RECIPIENTS: NotesRecipients[] = ["all", "inorg", "hosts"];
const LANGS = ["en", "tr", "es", "fr", "de", "pt", "it"];
const SECTIONS = ["summary", "decisions", "nextSteps"] as const;

function Toggle({
  label,
  on,
  onToggle,
  icon,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  icon: ReactNode;
}) {
  const { t } = useTranslation("meetings");
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className="flex h-11 w-full items-center gap-2 rounded-md border border-line px-3 text-sm text-ink hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <span className={clsx("text-sm", on ? "text-brand" : "text-ink-2")}>
        {on ? t("gm.on", { defaultValue: t("on") }) : t("gm.off", { defaultValue: t("off") })}
      </span>
    </button>
  );
}

export function MeetGmPanel() {
  const { t } = useTranslation("meetings");
  const participants = useMeeting((s) => s.participants);
  const audioLock = useMeeting((s) => s.audioLock);
  const videoLock = useMeeting((s) => s.videoLock);
  const requireConsent = useMeeting((s) => s.requireConsent);
  const accessTier = useMeeting((s) => s.accessTier);
  const pinnedIds = useMeeting((s) => s.pinnedIds);
  const annotateOn = useMeeting((s) => s.annotateOn);
  const remoteControl = useMeeting((s) => s.remoteControl);
  const meetingNotes = useMeeting((s) => s.meetingNotes);
  const noteSections = useMeeting((s) => s.noteSections);
  const notesRecipients = useMeeting((s) => s.notesRecipients);
  const speechTranslation = useMeeting((s) => s.speechTranslation);
  const speechFrom = useMeeting((s) => s.speechFrom);
  const speechTo = useMeeting((s) => s.speechTo);
  const sendResolution = useMeeting((s) => s.sendResolution);
  const receiveResolution = useMeeting((s) => s.receiveResolution);
  const bandwidthPolicy = useMeeting((s) => s.bandwidthPolicy);
  const dataSaver = useMeeting((s) => s.dataSaver);

  const act = () => meetingStore.getState();
  const self = participants.find((p) => p.isSelf);
  const others = participants.filter((p) => !p.isSelf);

  return (
    <div className="space-y-4">
      {/* Granular moderation */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-ink">{t("gm.title")}</h3>
        <Toggle
          label={t("gm.audioLock")}
          on={audioLock}
          onToggle={() => act().toggleAudioLock()}
          icon={<MdMicOff className="h-[18px] w-[18px]" aria-hidden />}
        />
        <Toggle
          label={t("gm.videoLock")}
          on={videoLock}
          onToggle={() => act().toggleVideoLock()}
          icon={<MdVideocamOff className="h-[18px] w-[18px]" aria-hidden />}
        />
        <Toggle
          label={t("gm.requireConsent")}
          on={requireConsent}
          onToggle={() => act().toggleRequireConsent()}
          icon={<HiOutlineShieldCheck className="h-[18px] w-[18px]" aria-hidden />}
        />
        <div className="flex items-center gap-2 text-sm text-ink">
          <span className="flex-1">{t("gm.accessTier")}</span>
          <Select<AccessTier>
            value={accessTier}
            onChange={(v) => act().setAccessTier(v)}
            aria-label={t("gm.accessTier")}
            size="sm"
            className="w-44"
            options={TIERS.map((tier) => ({
              value: tier,
              label: t(`gm.tier.${tier}`),
            }))}
          />
        </div>
      </section>

      {/* Per-participant: pin / viewer / waiting */}
      {others.length > 0 ? (
        <section className="space-y-1">
          <h3 className="text-sm font-semibold text-ink">{t("gm.participants")}</h3>
          {others.map((p) => {
            const pinned = pinnedIds.includes(p.id);
            return (
              <div
                key={p.id}
                className="flex items-center gap-1 rounded-md border border-line px-2 py-1 text-sm"
              >
                <span className="min-w-0 flex-1 truncate text-ink">{p.name}</span>
                {p.role === "viewer" ? <Badge tone="neutral">{t("gm.viewer")}</Badge> : null}
                <button
                  type="button"
                  onClick={() => act().togglePin(p.id)}
                  aria-pressed={pinned}
                  aria-label={t("gm.pin")}
                  className={clsx(
                    "rounded-md p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                    pinned ? "text-brand" : "text-ink-2 hover:bg-surface-2",
                  )}
                >
                  <HiOutlineMapPin className="h-[18px] w-[18px]" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => act().makeViewer(p.id)}
                  aria-label={t("gm.makeViewer")}
                  className="rounded-md p-1.5 text-ink-2 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <HiOutlineEye className="h-[18px] w-[18px]" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => act().sendToWaitingRoom(p.id)}
                  aria-label={t("gm.toWaiting")}
                  className="rounded-md p-1.5 text-ink-2 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <HiOutlineUserMinus className="h-[18px] w-[18px]" aria-hidden />
                </button>
              </div>
            );
          })}
          <p className="text-sm text-ink-2">{t("gm.pinned", { n: pinnedIds.length })}</p>
        </section>
      ) : null}

      {/* Annotation + remote control */}
      <section className="space-y-2">
        <Toggle
          label={t("gm.annotate")}
          on={annotateOn}
          onToggle={() => act().toggleAnnotate()}
          icon={<HiOutlinePencil className="h-[18px] w-[18px]" aria-hidden />}
        />
        <div className="rounded-md border border-line p-2">
          <div className="mb-1 flex items-center gap-2 text-sm text-ink">
            <HiOutlineCursorArrowRays className="h-[18px] w-[18px]" aria-hidden />
            <span className="flex-1">{t("gm.remoteControl")}</span>
            {remoteControl?.controllerId ? (
              <Badge tone="positive">{t("gm.controlActive")}</Badge>
            ) : null}
          </div>
          {!remoteControl ? (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => act().requestRemoteControl(self?.id ?? "self")}
            >
              {t("gm.requestControl")}
            </Button>
          ) : remoteControl.controllerId ? (
            <Button variant="ghost" className="w-full" onClick={() => act().stopRemoteControl()}>
              {t("gm.stopControl")}
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={() => act().grantRemoteControl(others[0]?.id ?? "self")}
            >
              {t("gm.grantControl")}
            </Button>
          )}
        </div>
      </section>

      {/* Take Notes for Me */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <HiOutlineSparkles className="h-[18px] w-[18px] text-brand" aria-hidden />
          <h3 className="flex-1 text-sm font-semibold text-ink">{t("gm.notes")}</h3>
          <Button variant="secondary" size="sm" onClick={() => act().generateNotes()}>
            {t("gm.generate")}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map((k) => (
            <label key={k} className="inline-flex items-center gap-1 text-sm text-ink">
              <input
                type="checkbox"
                checked={!!noteSections[k]}
                onChange={() => act().toggleNoteSection(k)}
                className="checkbox"
              />
              {t(`gm.section.${k}`)}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-ink">
          <span className="flex-1">{t("gm.recipients")}</span>
          <Select<NotesRecipients>
            value={notesRecipients}
            onChange={(v) => act().setNotesRecipients(v)}
            aria-label={t("gm.recipients")}
            size="sm"
            className="w-44"
            options={RECIPIENTS.map((r) => ({
              value: r,
              label: t(`gm.recipient.${r}`),
            }))}
          />
        </div>
        {meetingNotes ? (
          <div className="rounded-md border border-line p-2 text-sm">
            {noteSections.summary && meetingNotes.summary ? (
              <p className="text-ink">
                <span className="font-medium">{t("gm.section.summary")}: </span>
                {meetingNotes.summary}
              </p>
            ) : null}
            {noteSections.decisions && meetingNotes.decisions.length > 0 ? (
              <p className="mt-1 text-ink">
                <span className="font-medium">{t("gm.section.decisions")}: </span>
                {meetingNotes.decisions.join("; ")}
              </p>
            ) : null}
            {noteSections.nextSteps && meetingNotes.nextSteps.length > 0 ? (
              <p className="mt-1 text-ink">
                <span className="font-medium">{t("gm.section.nextSteps")}: </span>
                {meetingNotes.nextSteps.join("; ")}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* Speech translation */}
      <section className="space-y-2">
        <Toggle
          label={t("gm.speech")}
          on={speechTranslation}
          onToggle={() => act().toggleSpeechTranslation()}
          icon={<HiOutlineLanguage className="h-[18px] w-[18px]" aria-hidden />}
        />
        {speechTranslation ? (
          <div className="flex items-center gap-2 text-sm text-ink">
            <Select
              value={speechFrom}
              onChange={(v) => act().setSpeechPair(v, speechTo)}
              aria-label={t("gm.speechFrom")}
              size="sm"
              className="flex-1"
              options={LANGS.map((l) => ({
                value: l,
                label: l.toUpperCase(),
              }))}
            />
            <span aria-hidden>→</span>
            <Select
              value={speechTo}
              onChange={(v) => act().setSpeechPair(speechFrom, v)}
              aria-label={t("gm.speechTo")}
              size="sm"
              className="flex-1"
              options={LANGS.map((l) => ({
                value: l,
                label: l.toUpperCase(),
              }))}
            />
          </div>
        ) : null}
      </section>

      {/* Quality / bandwidth */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <HiOutlineCog6Tooth className="h-[18px] w-[18px] text-ink-2" aria-hidden />
          <h3 className="text-sm font-semibold text-ink">{t("gm.quality")}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-ink">
          <span className="flex-1">{t("gm.sendRes")}</span>
          <Select<ResolutionLevel>
            value={sendResolution}
            onChange={(v) => act().setSendResolution(v)}
            aria-label={t("gm.sendRes")}
            size="sm"
            className="w-44"
            options={RES.map((r) => ({
              value: r,
              label: t(`gm.res.${r}`),
            }))}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-ink">
          <span className="flex-1">{t("gm.recvRes")}</span>
          <Select<ResolutionLevel>
            value={receiveResolution}
            onChange={(v) => act().setReceiveResolution(v)}
            aria-label={t("gm.recvRes")}
            size="sm"
            className="w-44"
            options={RES.map((r) => ({
              value: r,
              label: t(`gm.res.${r}`),
            }))}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-ink">
          <span className="flex-1">{t("gm.bandwidth")}</span>
          <Select<BandwidthPolicy>
            value={bandwidthPolicy}
            onChange={(v) => act().setBandwidthPolicy(v)}
            aria-label={t("gm.bandwidth")}
            size="sm"
            className="w-44"
            options={BW.map((b) => ({
              value: b,
              label: t(`gm.bw.${b}`),
            }))}
          />
        </div>
        <Toggle
          label={t("gm.dataSaver")}
          on={dataSaver}
          onToggle={() => act().toggleDataSaver()}
          icon={<HiOutlineCog6Tooth className="h-[18px] w-[18px]" aria-hidden />}
        />
      </section>
    </div>
  );
}
