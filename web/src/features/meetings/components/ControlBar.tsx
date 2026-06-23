import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineMicrophone,
  HiOutlineVideoCamera,
  HiOutlineComputerDesktop,
  HiOutlineHandRaised,
  HiOutlineSquares2X2,
  HiOutlineUsers,
  HiOutlineChatBubbleOvalLeft,
  HiOutlinePhoneXMark,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineChartBar,
  HiOutlinePresentationChartLine,
  HiOutlineBolt,
} from "react-icons/hi2";
import {
  MdMicOff,
  MdVideocamOff,
  MdClosedCaption,
  MdFiberManualRecord,
} from "react-icons/md";
import clsx from "clsx";
import { useOptionalToast } from "@/components/ui";
import { useOpenIntelligence } from "@/features/integration";
import { meetingStore, useMeeting } from "../meetings.store";
import { useAskCopilot } from "../meetings.ai";
import { MEETING_REACTIONS } from "../meetings.store.types";

type Tone = "default" | "active" | "danger";

const RoundBtn = React.forwardRef<
  HTMLButtonElement,
  {
    label: string;
    tone?: Tone;
    pressed?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ label, tone = "default", pressed, onClick, children, ...rest }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label={label}
    aria-pressed={pressed}
    title={label}
    onClick={onClick}
    className={clsx(
      "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-[transform,colors] ease-[var(--ease-out)] duration-[var(--dur-press)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:active:scale-[0.97] sm:h-12 sm:w-12",
      tone === "danger"
        ? "bg-red-600 text-white hover:opacity-90"
        : tone === "active"
          ? "bg-brand text-white"
          : "bg-surface-2 text-ink-2 hover:bg-surface-3 hover:text-ink",
    )}
    {...rest}
  >
    {children}
  </button>
));
RoundBtn.displayName = "RoundBtn";

export function ControlBar() {
  const { t } = useTranslation("meetings");
  const openIntel = useOpenIntelligence();
  const toast = useOptionalToast();
  // AI notları → Copilot stub; toast ile yapılandırılmış not özetini bildirir.
  const askCopilot = useAskCopilot((message) => toast?.show({ message }));

  const micOn = useMeeting((s) => s.micOn);
  const camOn = useMeeting((s) => s.camOn);
  const screenSharing = useMeeting((s) => s.screenSharing);
  const handRaised = useMeeting((s) => s.handRaised);
  const captionsOn = useMeeting((s) => s.captionsOn);
  const recording = useMeeting((s) => s.recording);
  const layout = useMeeting((s) => s.layout);
  const sidePanel = useMeeting((s) => s.sidePanel);
  const whiteboardOpen = useMeeting((s) => s.whiteboardOpen);
  const participants = useMeeting((s) => s.participants);

  const self = participants.find((p) => p.isSelf);
  const isHost = self?.role === "host" || self?.role === "cohost";

  const act = () => meetingStore.getState();

  const leave = () => {
    const aiOn = act().aiCompanion;
    act().leave();
    toast?.show({ message: t("leftToast") });
    if (aiOn) {
      setTimeout(() => toast?.show({ message: t("aiSummaryToast") }), 600);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-line bg-surface px-2 py-2.5 sm:gap-2 sm:px-3 sm:py-3">
      <RoundBtn label={micOn ? t("mute") : t("unmute")} tone={micOn ? "default" : "danger"} onClick={() => act().toggleMic()}>{micOn ? <HiOutlineMicrophone className="h-5 w-5" aria-hidden /> : <MdMicOff className="h-5 w-5" aria-hidden />}</RoundBtn>
      <RoundBtn label={camOn ? t("stopCam") : t("startCam")} tone={camOn ? "default" : "danger"} onClick={() => act().toggleCam()}>{camOn ? <HiOutlineVideoCamera className="h-5 w-5" aria-hidden /> : <MdVideocamOff className="h-5 w-5" aria-hidden />}</RoundBtn>
      <RoundBtn label={screenSharing ? t("stopShare") : t("share")} tone={screenSharing ? "active" : "default"} pressed={screenSharing} onClick={() => act().toggleScreen()}><HiOutlineComputerDesktop className="h-5 w-5" aria-hidden /></RoundBtn>
      <RoundBtn label={handRaised ? t("lowerHand") : t("raiseHand")} tone={handRaised ? "active" : "default"} pressed={handRaised} onClick={() => act().toggleHand()}><HiOutlineHandRaised className="h-5 w-5" aria-hidden /></RoundBtn>

      {/* Reaksiyon şeridi — yalnızca geniş ekranda; mobilde "Daha fazla" menüsünde */}
      <div role="group" aria-label={t("react")} className="hidden flex-wrap items-center justify-center gap-1 rounded-full bg-surface-2 px-1 sm:inline-flex">
        {MEETING_REACTIONS.map((e) => (
          <button
            key={e}
            type="button"
            aria-label={e}
            onClick={() => act().sendReaction(e)}
            className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full px-2 text-xl transition-[transform,colors] ease-[var(--ease-out)] duration-[var(--dur-press)] hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-110 motion-safe:active:scale-[0.97]"
          >
            <span aria-hidden>{e}</span>
          </button>
        ))}
      </div>

      <span className="mx-1 hidden h-8 w-px bg-line sm:block" aria-hidden />

      {/* İkincil araçlar — yukarı açılan etiketli menü (sahne tarafından kırpılmaz) */}
      <details className="relative">
        <summary
          className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full bg-surface-2 text-xl leading-none text-ink-2 transition-[transform,colors] duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-surface-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:active:scale-[0.97] sm:h-12 sm:w-12 [&::-webkit-details-marker]:hidden"
          aria-label={t("more", { defaultValue: "Daha fazla" })}
          title={t("more", { defaultValue: "Daha fazla" })}
        >
          <span aria-hidden>···</span>
        </summary>
        <div role="menu" className="absolute bottom-full right-0 z-50 mb-2 flex max-h-[min(55vh,22rem)] w-60 max-w-[calc(100vw-1.5rem)] origin-bottom-right flex-col gap-1 overflow-x-hidden overflow-y-auto overscroll-contain rounded-xl border border-line bg-surface p-1.5 shadow-lg transition-[opacity,transform,display] duration-200 ease-[var(--ease-out)] [transition-behavior:allow-discrete] starting:opacity-0 motion-safe:starting:translate-y-1 motion-safe:starting:scale-95">
          {/* Mobil: reaksiyonlar (geniş ekranda çubukta görünür) */}
          <div role="group" aria-label={t("react")} className="flex items-center justify-between gap-1 px-1 pb-1 sm:hidden">
            {MEETING_REACTIONS.map((e) => (
              <button
                key={e}
                type="button"
                aria-label={e}
                onClick={(ev) => { act().sendReaction(e); ev.currentTarget.closest("details")?.removeAttribute("open"); }}
                className="inline-flex h-10 min-w-10 flex-1 items-center justify-center rounded-md text-xl transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.97]"
              >
                <span aria-hidden>{e}</span>
              </button>
            ))}
          </div>
          <div className="mx-1 my-0.5 h-px bg-line sm:hidden" aria-hidden />
          <button role="menuitem" type="button" aria-pressed={captionsOn} onClick={(e) => { act().toggleCaptions(); e.currentTarget.closest("details")?.removeAttribute("open"); }} className={clsx("flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", captionsOn ? "bg-brand/5 text-blue-800" : "text-ink hover:bg-surface-2")}>
            <MdClosedCaption className={clsx("h-5 w-5 shrink-0", captionsOn ? "text-brand" : "text-muted")} aria-hidden />
            <span className="flex-1 text-left">{t("captions")}</span>
            {captionsOn ? <span className="text-xs font-medium text-blue-800">{t("on")}</span> : null}
          </button>
          <button role="menuitem" type="button" aria-pressed={recording} onClick={(e) => { act().toggleRecording(); e.currentTarget.closest("details")?.removeAttribute("open"); }} className={clsx("flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", recording ? "bg-red-50 text-red-800" : "text-ink hover:bg-surface-2")}>
            <MdFiberManualRecord className={clsx("h-5 w-5 shrink-0", recording ? "text-red-600" : "text-muted")} aria-hidden />
            <span className="flex-1 text-left">{recording ? t("stopRecording") : t("record")}</span>
            {recording ? <span className="text-xs font-medium text-red-800">{t("rec", { defaultValue: "REC" })}</span> : null}
          </button>
          <button role="menuitem" type="button" onClick={(e) => { act().setLayout(layout === "grid" ? "speaker" : "grid"); e.currentTarget.closest("details")?.removeAttribute("open"); }} className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-ink hover:bg-surface-2 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
            <HiOutlineSquares2X2 className="h-5 w-5 shrink-0 text-muted" aria-hidden />
            <span className="flex-1 text-left">{t("layout")}</span>
          </button>
          <button role="menuitem" type="button" onClick={(e) => { askCopilot("meetings.ai.notes"); e.currentTarget.closest("details")?.removeAttribute("open"); }} className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-ink hover:bg-surface-2 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
            <HiOutlineSparkles className="h-5 w-5 shrink-0 text-muted" aria-hidden />
            <span className="flex-1 text-left">{t("aiNotes")}</span>
          </button>
          <button role="menuitem" type="button" onClick={(e) => { openIntel("src_standup"); e.currentTarget.closest("details")?.removeAttribute("open"); }} className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-ink hover:bg-surface-2 motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
            <HiOutlineBolt className="h-5 w-5 shrink-0 text-muted" aria-hidden />
            <span className="flex-1 text-left">{t("analyze")}</span>
          </button>
          <div className="mx-1 my-0.5 h-px bg-line" aria-hidden />
          <button role="menuitem" type="button" aria-pressed={sidePanel === "engage"} onClick={(e) => { act().setSidePanel("engage"); e.currentTarget.closest("details")?.removeAttribute("open"); }} className={clsx("flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", sidePanel === "engage" ? "bg-brand/5 text-blue-800" : "text-ink hover:bg-surface-2")}>
            <HiOutlineChartBar className={clsx("h-5 w-5 shrink-0", sidePanel === "engage" ? "text-brand" : "text-muted")} aria-hidden />
            <span className="flex-1 text-left">{t("engage")}</span>
          </button>
          <button role="menuitem" type="button" aria-pressed={whiteboardOpen} onClick={(e) => { act().toggleWhiteboard(); e.currentTarget.closest("details")?.removeAttribute("open"); }} className={clsx("flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", whiteboardOpen ? "bg-brand/5 text-blue-800" : "text-ink hover:bg-surface-2")}>
            <HiOutlinePresentationChartLine className={clsx("h-5 w-5 shrink-0", whiteboardOpen ? "text-brand" : "text-muted")} aria-hidden />
            <span className="flex-1 text-left">{t("whiteboard")}</span>
          </button>
          <button role="menuitem" type="button" aria-pressed={sidePanel === "participants"} onClick={(e) => { act().setSidePanel("participants"); e.currentTarget.closest("details")?.removeAttribute("open"); }} className={clsx("flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", sidePanel === "participants" ? "bg-brand/5 text-blue-800" : "text-ink hover:bg-surface-2")}>
            <HiOutlineUsers className={clsx("h-5 w-5 shrink-0", sidePanel === "participants" ? "text-brand" : "text-muted")} aria-hidden />
            <span className="flex-1 text-left">{t("participants")}</span>
          </button>
          <button role="menuitem" type="button" aria-pressed={sidePanel === "chat"} onClick={(e) => { act().setSidePanel("chat"); e.currentTarget.closest("details")?.removeAttribute("open"); }} className={clsx("flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", sidePanel === "chat" ? "bg-brand/5 text-blue-800" : "text-ink hover:bg-surface-2")}>
            <HiOutlineChatBubbleOvalLeft className={clsx("h-5 w-5 shrink-0", sidePanel === "chat" ? "text-brand" : "text-muted")} aria-hidden />
            <span className="flex-1 text-left">{t("chat")}</span>
          </button>
          {isHost ? (
            <button role="menuitem" type="button" aria-pressed={sidePanel === "host"} onClick={(e) => { act().setSidePanel("host"); e.currentTarget.closest("details")?.removeAttribute("open"); }} className={clsx("flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", sidePanel === "host" ? "bg-brand/5 text-blue-800" : "text-ink hover:bg-surface-2")}>
              <HiOutlineShieldCheck className={clsx("h-5 w-5 shrink-0", sidePanel === "host" ? "text-brand" : "text-muted")} aria-hidden />
              <span className="flex-1 text-left">{t("hostControls")}</span>
            </button>
          ) : null}
        </div>
      </details>

      <span className="mx-1 hidden h-8 w-px bg-line sm:block" aria-hidden />
      <RoundBtn label={t("leave")} tone="danger" onClick={leave}><HiOutlinePhoneXMark className="h-5 w-5" aria-hidden /></RoundBtn>
    </div>
  );
}
