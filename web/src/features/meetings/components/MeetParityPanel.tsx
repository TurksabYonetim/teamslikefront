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
  { key: "portraitTouchUp", icon: <HiOutlineSparkles className="h-4 w-4" aria-hidden /> },
  { key: "studioLook", icon: <HiOutlineSun className="h-4 w-4" aria-hidden /> },
  { key: "adaptiveAudio", icon: <HiOutlineSpeakerWave className="h-4 w-4" aria-hidden /> },
  { key: "liveSharing", icon: <HiOutlineTv className="h-4 w-4" aria-hidden /> },
  { key: "watermark", icon: <HiOutlineShieldCheck className="h-4 w-4" aria-hidden /> },
  { key: "focusMode", icon: <HiOutlineViewfinderCircle className="h-4 w-4" aria-hidden /> },
  { key: "avatars", icon: <HiOutlineFaceSmile className="h-4 w-4" aria-hidden /> },
  { key: "deepfakeDetection", icon: <HiOutlineShieldExclamation className="h-4 w-4" aria-hidden /> },
  { key: "pushToTalk", icon: <HiOutlineMapPin className="h-4 w-4" aria-hidden /> },
  { key: "gestureRecognition", icon: <HiOutlineHandRaised className="h-4 w-4" aria-hidden /> },
  { key: "immersiveShare", icon: <HiOutlineSquares2X2 className="h-4 w-4" aria-hidden /> },
  { key: "musicMode", icon: <HiOutlineMusicalNote className="h-4 w-4" aria-hidden /> },
  { key: "aiFraming", icon: <HiOutlineVideoCamera className="h-4 w-4" aria-hidden /> },
  { key: "nameLabels", icon: <HiOutlineIdentification className="h-4 w-4" aria-hidden /> },
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
      className="flex h-11 w-full items-center gap-2 rounded-md border border-border px-3 text-sm text-fg hover:bg-raised"
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <span className={clsx("text-sm font-medium", on ? "text-accent" : "text-muted")}>{on ? t("on") : t("off")}</span>
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
      <h3 className="text-sm font-semibold text-fg">{t("meetParity")}</h3>

      <Toggle
        label={t("companion")}
        on={companionMode}
        onToggle={() => meetingStore.getState().toggleCompanion()}
        icon={<HiOutlineDevicePhoneMobile className="h-4 w-4" aria-hidden />}
      />
      <Toggle
        label={t("noiseCancellation")}
        on={noiseCancellation}
        onToggle={() => meetingStore.getState().toggleNoiseCancellation()}
        icon={<MdGraphicEq className="h-4 w-4" aria-hidden />}
      />

      <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
        <HiOutlineClock className="h-4 w-4 text-muted" aria-hidden />
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

      <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
        <HiOutlineUsers className="h-4 w-4 text-muted" aria-hidden />
        <span className="flex-1 text-fg">{t("attendance")}</span>
        <span className="text-xs text-muted">
          {t("attendanceStat", { present: att.present, invited: att.invited })} · {Math.round(att.rate * 100)}%
        </span>
      </div>

      {/* Capture & quality effects (Google Meet parity) */}
      <h3 className="pt-1 text-sm font-semibold text-fg">{t("captureFx")}</h3>
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
        <p className="rounded-md border border-border px-3 py-1.5 text-xs text-muted" aria-live="polite">
          {t("watermarkLabel")}: {watermarkLabel(t("you"), activeMeetingId ?? "mtg", recordSec)}
        </p>
      ) : null}

      {/* Searchable meeting archive (linked recap + transcript + recording) */}
      <h3 className="pt-1 text-sm font-semibold text-fg">{t("archive")}</h3>
      <div className="relative">
        <HiOutlineMagnifyingGlass
          className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          value={qa}
          onChange={(e) => setQa(e.target.value)}
          placeholder={t("archiveSearch")}
          aria-label={t("archiveSearch")}
          className="block h-10 w-full rounded-lg border border-border bg-raised pl-7 pr-2.5 text-sm text-fg placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>
      <ul className="space-y-1">
        {archive.map((a) => (
          <li key={a.id} className="rounded-md border border-border px-3 py-1.5">
            <div className="flex items-center gap-2 text-sm text-fg">
              <span className="flex-1 truncate">{a.title}</span>
              {a.hasRecording ? (
                <span title={t("hasRecording")}>
                  <HiOutlineMicrophone className="h-3.5 w-3.5 text-muted" aria-hidden />
                  <span className="sr-only">{t("hasRecording")}</span>
                </span>
              ) : null}
              {a.hasTranscript ? (
                <span title={t("hasTranscript")}>
                  <HiOutlineDocumentText className="h-3.5 w-3.5 text-muted" aria-hidden />
                  <span className="sr-only">{t("hasTranscript")}</span>
                </span>
              ) : null}
            </div>
            <div className="truncate text-xs text-muted">{a.summary}</div>
          </li>
        ))}
        {archive.length === 0 ? <li className="text-xs text-muted">{t("archiveEmpty")}</li> : null}
      </ul>
    </section>
  );
}
