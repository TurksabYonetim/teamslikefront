import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineDevicePhoneMobile,
  HiOutlineClock,
  HiOutlineUsers,
  HiOutlineSparkles,
  HiOutlineSun,
  HiOutlineSpeakerWave,
  HiOutlineTv,
  HiOutlineShieldCheck,
  HiOutlineMagnifyingGlass,
  HiOutlineDocumentText,
  HiOutlineMicrophone,
  HiOutlineViewfinderCircle,
  HiOutlineFaceSmile,
  HiOutlineShieldExclamation,
  HiOutlineMapPin,
  HiOutlineHandRaised,
  HiOutlineSquares2X2,
  HiOutlineMusicalNote,
  HiOutlineVideoCamera,
  HiOutlineIdentification,
} from "react-icons/hi2";
import { MdGraphicEq } from "react-icons/md";
import clsx from "clsx";
import { meetingStore, useMeeting } from "../meetings.store";
import {
  attendanceReport,
  breakoutCountdown,
  watermarkLabel,
  searchArchive,
  MEETING_ARCHIVE,
} from "../meetParity";
import { Button } from "@/components/ui";

const FX: { key: string; icon: React.ReactNode }[] = [
  { key: "portraitTouchUp", icon: <HiOutlineSparkles className="h-[18px] w-[18px]" aria-hidden /> },
  { key: "studioLook", icon: <HiOutlineSun className="h-[18px] w-[18px]" aria-hidden /> },
  { key: "adaptiveAudio", icon: <HiOutlineSpeakerWave className="h-[18px] w-[18px]" aria-hidden /> },
  { key: "liveSharing", icon: <HiOutlineTv className="h-[18px] w-[18px]" aria-hidden /> },
  { key: "watermark", icon: <HiOutlineShieldCheck className="h-[18px] w-[18px]" aria-hidden /> },
  { key: "focusMode", icon: <HiOutlineViewfinderCircle className="h-[18px] w-[18px]" aria-hidden /> },
  { key: "avatars", icon: <HiOutlineFaceSmile className="h-[18px] w-[18px]" aria-hidden /> },
  { key: "deepfakeDetection", icon: <HiOutlineShieldExclamation className="h-[18px] w-[18px]" aria-hidden /> },
  { key: "pushToTalk", icon: <HiOutlineMapPin className="h-[18px] w-[18px]" aria-hidden /> },
  { key: "gestureRecognition", icon: <HiOutlineHandRaised className="h-[18px] w-[18px]" aria-hidden /> },
  { key: "immersiveShare", icon: <HiOutlineSquares2X2 className="h-[18px] w-[18px]" aria-hidden /> },
  { key: "musicMode", icon: <HiOutlineMusicalNote className="h-[18px] w-[18px]" aria-hidden /> },
  { key: "aiFraming", icon: <HiOutlineVideoCamera className="h-[18px] w-[18px]" aria-hidden /> },
  { key: "nameLabels", icon: <HiOutlineIdentification className="h-[18px] w-[18px]" aria-hidden /> },
];

function Toggle({
  label,
  on,
  onToggle,
  icon,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
}) {
  const { t } = useTranslation("meetings");
  return (
    <button
      onClick={onToggle}
      aria-pressed={on}
      className="flex h-11 w-full items-center gap-2 rounded-md border border-border px-3 text-base text-fg hover:bg-raised"
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <span className={clsx("text-base", on ? "text-accent" : "text-muted")}>{on ? t("on") : t("off")}</span>
    </button>
  );
}

/** Google-Meet parity: companion mode, noise cancellation, breakout timer, attendance. */
export function MeetParityPanel() {
  const { t } = useTranslation("meetings");
  const companionMode = useMeeting((s) => s.companionMode);
  const noiseCancellation = useMeeting((s) => s.noiseCancellation);
  const breakoutEndsAt = useMeeting((s) => s.breakoutEndsAt);
  const meetFx = useMeeting((s) => s.meetFx);
  const participants = useMeeting((s) => s.participants);
  const lobbyQueue = useMeeting((s) => s.lobbyQueue);
  const activeMeetingId = useMeeting((s) => s.activeMeetingId);
  const recordSec = useMeeting((s) => s.recordSec);

  const [now, setNow] = React.useState(Date.now());
  const [qa, setQa] = React.useState("");
  const archive = searchArchive(MEETING_ARCHIVE, qa);

  React.useEffect(() => {
    if (!breakoutEndsAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [breakoutEndsAt]);

  const invitedIds = [...participants.map((p) => p.id), ...lobbyQueue.map((l) => l.id)];
  const att = attendanceReport(invitedIds, participants.map((p) => p.id));
  const cd = breakoutEndsAt ? breakoutCountdown(breakoutEndsAt, now) : null;

  return (
    <section className="space-y-2">
      <h3 className="text-base font-semibold text-muted">{t("meetParity")}</h3>

      <Toggle
        label={t("companion")}
        on={companionMode}
        onToggle={() => meetingStore.getState().toggleCompanion()}
        icon={<HiOutlineDevicePhoneMobile className="h-[18px] w-[18px]" aria-hidden />}
      />
      <Toggle
        label={t("noiseCancellation")}
        on={noiseCancellation}
        onToggle={() => meetingStore.getState().toggleNoiseCancellation()}
        icon={<MdGraphicEq className="h-[18px] w-[18px]" aria-hidden />}
      />

      <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-base">
        <HiOutlineClock className="h-[18px] w-[18px] text-muted" aria-hidden />
        <span className="flex-1 text-fg">{t("breakoutTimer")}</span>
        {cd ? (
          <>
            <span className="tabular-nums text-accent" aria-live="polite">
              {cd.expired ? t("timerDone") : t("timerRemaining", { s: cd.remainingSec })}
            </span>
            <Button variant="ghost" onClick={() => meetingStore.getState().clearBreakoutTimer()}>
              {t("clearTimer")}
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={() => meetingStore.getState().startBreakoutTimer(5)}>
            {t("startTimer")}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-base">
        <HiOutlineUsers className="h-[18px] w-[18px] text-muted" aria-hidden />
        <span className="flex-1 text-fg">{t("attendance")}</span>
        <span className="text-muted">
          {t("attendanceStat", { present: att.present, invited: att.invited })} · {Math.round(att.rate * 100)}%
        </span>
      </div>

      {/* Capture & quality effects (Google Meet parity) */}
      <h3 className="pt-1 text-base font-semibold text-muted">{t("captureFx")}</h3>
      {FX.map(({ key, icon }) => (
        <Toggle
          key={key}
          label={t(`fx.${key}`)}
          on={meetFx[key] ?? false}
          onToggle={() => meetingStore.getState().toggleMeetFx(key)}
          icon={icon}
        />
      ))}
      {meetFx.watermark ? (
        <p className="rounded-md border border-border px-3 py-1.5 text-base text-muted" aria-live="polite">
          {t("watermarkLabel")}: {watermarkLabel(t("you"), activeMeetingId ?? "mtg", recordSec)}
        </p>
      ) : null}

      {/* Searchable meeting archive (linked recap + transcript + recording) */}
      <h3 className="pt-1 text-base font-semibold text-muted">{t("archive")}</h3>
      <div className="relative">
        <HiOutlineMagnifyingGlass
          className="absolute left-2 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          value={qa}
          onChange={(e) => setQa(e.target.value)}
          placeholder={t("archiveSearch")}
          aria-label={t("archiveSearch")}
          className="h-10 w-full rounded-md border border-border bg-bg pl-7 pr-2 text-base text-fg outline-none placeholder:text-muted"
        />
      </div>
      <ul className="space-y-1">
        {archive.map((a) => (
          <li key={a.id} className="rounded-md border border-border px-3 py-1.5">
            <div className="flex items-center gap-2 text-base text-fg">
              <span className="flex-1 truncate">{a.title}</span>
              {a.hasRecording ? <HiOutlineMicrophone className="h-[13px] w-[13px] text-muted" aria-hidden /> : null}
              {a.hasTranscript ? <HiOutlineDocumentText className="h-[13px] w-[13px] text-muted" aria-hidden /> : null}
            </div>
            <div className="truncate text-base text-muted">{a.summary}</div>
          </li>
        ))}
        {archive.length === 0 ? <li className="text-base text-muted">{t("archiveEmpty")}</li> : null}
      </ul>
    </section>
  );
}
