import * as React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineSparkles } from "react-icons/hi2";
import { MdFiberManualRecord } from "react-icons/md";
import { Button } from "@/components/ui";
import { meetingStore, useMeeting } from "../meetings.store";
import { Stage } from "./Stage";
import { ControlBar } from "./ControlBar";
import { SidePanel } from "./SidePanel";
import { HostPanel } from "./HostPanel";
import { EngagePanel } from "./EngagePanel";
import { Whiteboard } from "./Whiteboard";

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function MeetingRoom() {
  const { t } = useTranslation("meetings");

  const activeTitle = useMeeting((s) => s.activeTitle);
  const recording = useMeeting((s) => s.recording);
  const recordSec = useMeeting((s) => s.recordSec);
  const participants = useMeeting((s) => s.participants);
  const aiCompanion = useMeeting((s) => s.aiCompanion);
  const captionsOn = useMeeting((s) => s.captionsOn);
  const reactions = useMeeting((s) => s.reactions);
  const captions = useMeeting((s) => s.captions);
  const lobbyQueue = useMeeting((s) => s.lobbyQueue);
  const whiteboardOpen = useMeeting((s) => s.whiteboardOpen);

  // Active-speaker rotation
  React.useEffect(() => {
    const id = setInterval(() => meetingStore.getState().rotateSpeaker(), 3200);
    return () => clearInterval(id);
  }, []);

  // Live captions stream
  React.useEffect(() => {
    if (!captionsOn) return;
    const id = setInterval(() => meetingStore.getState().pushCaption(), 2600);
    return () => clearInterval(id);
  }, [captionsOn]);

  // Recording timer
  React.useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => meetingStore.getState().tickRecord(), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const lastCaptions = captions.slice(-2);
  const lobby = lobbyQueue[0];

  return (
    <div className="relative flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col bg-surface-2">
        {/* Top bar */}
        <div className="flex items-center gap-2 border-b border-line bg-surface px-3 py-2 sm:gap-3 sm:px-4">
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink sm:text-base">{activeTitle}</span>
          {recording ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-700 px-2 py-0.5 text-xs font-medium text-white">
              <MdFiberManualRecord className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">{t("rec")} </span>{fmt(recordSec)}
            </span>
          ) : null}
          <span className="shrink-0 text-xs text-muted">
            {t("participantCount", { n: participants.length })}
          </span>
          {aiCompanion ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand">
              <HiOutlineSparkles className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">{t("aiCompanionShort")}</span>
            </span>
          ) : null}
        </div>

        {/* Lobby banner */}
        {lobby ? (
          <div className="flex items-center gap-2 border-b border-line bg-primary-50 px-3 py-2 sm:px-4">
            <span className="min-w-0 flex-1 truncate text-sm text-ink">
              {t("lobbyBanner", { name: lobby.name })}
            </span>
            <Button size="sm" className="shrink-0" onClick={() => meetingStore.getState().admit(lobby.id)}>
              {t("admit")}
            </Button>
            <Button size="sm" variant="ghost" className="shrink-0" onClick={() => meetingStore.getState().denyLobby(lobby.id)}>
              {t("deny")}
            </Button>
          </div>
        ) : null}

        {/* Stage + overlays */}
        <div className="relative min-h-0 flex-1">
          <Stage />
          {whiteboardOpen ? <Whiteboard /> : null}

          {reactions.length > 0 ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-2">
              {reactions.map((r) => (
                <span key={r.id} className="text-2xl" aria-hidden>
                  {r.emoji}
                </span>
              ))}
            </div>
          ) : null}

          {captionsOn && lastCaptions.length > 0 ? (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit max-w-[90%] rounded-md bg-black/60 px-3 py-2 text-center text-base text-white"
              aria-live="polite"
            >
              {lastCaptions.map((c) => (
                <div key={c.id}>
                  <span className="font-semibold">{c.speaker}: </span>
                  {c.text}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <ControlBar />
      </div>

      <SidePanel />
      <HostPanel />
      <EngagePanel />
    </div>
  );
}
