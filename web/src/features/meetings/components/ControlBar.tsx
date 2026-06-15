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
import { useToast } from "@/components/ui";
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
      "inline-flex h-12 w-12 items-center justify-center rounded-full transition-[transform,colors] ease-[var(--ease-out)] duration-[var(--dur-press)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 motion-safe:active:scale-[0.97]",
      tone === "danger"
        ? "bg-red-600 text-white hover:opacity-90"
        : tone === "active"
          ? "bg-brand text-white"
          : "bg-gray-800 text-white hover:bg-gray-700",
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
  let toast: ReturnType<typeof useToast> | undefined;
  try {
    toast = useToast();
  } catch {
    toast = undefined;
  }
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
    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-gray-800 bg-gray-800 px-3 py-3">
      <RoundBtn
        label={micOn ? t("mute") : t("unmute")}
        tone={micOn ? "default" : "danger"}
        onClick={() => act().toggleMic()}
      >
        {micOn ? (
          <HiOutlineMicrophone className="h-5 w-5" aria-hidden />
        ) : (
          <MdMicOff className="h-5 w-5" aria-hidden />
        )}
      </RoundBtn>

      <RoundBtn
        label={camOn ? t("stopCam") : t("startCam")}
        tone={camOn ? "default" : "danger"}
        onClick={() => act().toggleCam()}
      >
        {camOn ? (
          <HiOutlineVideoCamera className="h-5 w-5" aria-hidden />
        ) : (
          <MdVideocamOff className="h-5 w-5" aria-hidden />
        )}
      </RoundBtn>

      <RoundBtn
        label={screenSharing ? t("stopShare") : t("share")}
        tone={screenSharing ? "active" : "default"}
        pressed={screenSharing}
        onClick={() => act().toggleScreen()}
      >
        <HiOutlineComputerDesktop className="h-5 w-5" aria-hidden />
      </RoundBtn>

      <RoundBtn
        label={handRaised ? t("lowerHand") : t("raiseHand")}
        tone={handRaised ? "active" : "default"}
        pressed={handRaised}
        onClick={() => act().toggleHand()}
      >
        <HiOutlineHandRaised className="h-5 w-5" aria-hidden />
      </RoundBtn>

      {/* Reactions — inline (tek tık) */}
      <div
        role="group"
        aria-label={t("react")}
        className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-1"
      >
        {MEETING_REACTIONS.map((e) => (
          <button
            key={e}
            type="button"
            aria-label={e}
            onClick={() => act().sendReaction(e)}
            className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full px-2 text-xl transition-[transform,colors] ease-[var(--ease-out)] duration-[var(--dur-press)] hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 motion-safe:active:scale-[0.97]"
          >
            <span aria-hidden>{e}</span>
          </button>
        ))}
      </div>

      <span className="mx-1 hidden h-8 w-px bg-gray-800 sm:block" aria-hidden />

      <RoundBtn
        label={t("captions")}
        tone={captionsOn ? "active" : "default"}
        pressed={captionsOn}
        onClick={() => act().toggleCaptions()}
      >
        <MdClosedCaption className="h-5 w-5" aria-hidden />
      </RoundBtn>

      <RoundBtn
        label={recording ? t("stopRecording") : t("record")}
        tone={recording ? "danger" : "default"}
        pressed={recording}
        onClick={() => act().toggleRecording()}
      >
        <MdFiberManualRecord className="h-5 w-5" aria-hidden />
      </RoundBtn>

      <RoundBtn
        label={t("layout")}
        onClick={() => act().setLayout(layout === "grid" ? "speaker" : "grid")}
      >
        <HiOutlineSquares2X2 className="h-5 w-5" aria-hidden />
      </RoundBtn>

      <RoundBtn label={t("aiNotes")} onClick={() => askCopilot("meetings.ai.notes")}>
        <HiOutlineSparkles className="h-5 w-5" aria-hidden />
      </RoundBtn>

      <RoundBtn label={t("analyze")} onClick={() => openIntel("src_standup")}>
        <HiOutlineBolt className="h-5 w-5" aria-hidden />
      </RoundBtn>

      <RoundBtn
        label={t("engage")}
        tone={sidePanel === "engage" ? "active" : "default"}
        pressed={sidePanel === "engage"}
        onClick={() => act().setSidePanel("engage")}
      >
        <HiOutlineChartBar className="h-5 w-5" aria-hidden />
      </RoundBtn>

      <RoundBtn
        label={t("whiteboard")}
        tone={whiteboardOpen ? "active" : "default"}
        pressed={whiteboardOpen}
        onClick={() => act().toggleWhiteboard()}
      >
        <HiOutlinePresentationChartLine className="h-5 w-5" aria-hidden />
      </RoundBtn>

      <RoundBtn
        label={t("participants")}
        tone={sidePanel === "participants" ? "active" : "default"}
        pressed={sidePanel === "participants"}
        onClick={() => act().setSidePanel("participants")}
      >
        <HiOutlineUsers className="h-5 w-5" aria-hidden />
      </RoundBtn>

      <RoundBtn
        label={t("chat")}
        tone={sidePanel === "chat" ? "active" : "default"}
        pressed={sidePanel === "chat"}
        onClick={() => act().setSidePanel("chat")}
      >
        <HiOutlineChatBubbleOvalLeft className="h-5 w-5" aria-hidden />
      </RoundBtn>

      {isHost ? (
        <RoundBtn
          label={t("hostControls")}
          tone={sidePanel === "host" ? "active" : "default"}
          pressed={sidePanel === "host"}
          onClick={() => act().setSidePanel("host")}
        >
          <HiOutlineShieldCheck className="h-5 w-5" aria-hidden />
        </RoundBtn>
      ) : null}

      <span className="mx-1 hidden h-8 w-px bg-gray-800 sm:block" aria-hidden />

      <RoundBtn label={t("leave")} tone="danger" onClick={leave}>
        <HiOutlinePhoneXMark className="h-5 w-5" aria-hidden />
      </RoundBtn>
    </div>
  );
}
