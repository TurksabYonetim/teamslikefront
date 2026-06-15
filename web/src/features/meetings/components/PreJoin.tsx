import { useTranslation } from "react-i18next";
import {
  HiOutlineMicrophone,
  HiOutlineVideoCamera,
  HiOutlineSparkles,
  HiOutlineSun,
} from "react-icons/hi2";
import { MdMicOff, MdVideocamOff } from "react-icons/md";
import clsx from "clsx";
import { Avatar } from "@/components/ui";
import { Button } from "@/components/ui";
import { ME_ID, memberName } from "@/features/messaging/members";
import { meetingStore, useMeeting } from "../meetings.store";

function Toggle({
  on,
  label,
  onClick,
  children,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      className={clsx(
        "inline-flex h-12 w-12 items-center justify-center rounded-full transition-[transform,background-color,border-color,color] duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97]",
        on
          ? "border border-gray-600 bg-gray-700 text-white hover:bg-gray-600"
          : "bg-danger text-white",
      )}
    >
      {children}
    </button>
  );
}

export function PreJoin() {
  const { t } = useTranslation("meetings");
  const title = useMeeting((s) => s.activeTitle);
  const micOn = useMeeting((s) => s.micOn);
  const camOn = useMeeting((s) => s.camOn);
  const blurOn = useMeeting((s) => s.blurOn);
  const aiCompanion = useMeeting((s) => s.aiCompanion);
  const name = memberName(ME_ID);

  return (
    <div className="flex h-full items-center justify-center bg-gray-900 p-6">
      <div className="w-full max-w-3xl">
        <h1 className="mb-1 text-xl font-semibold text-white">{title}</h1>
        <p className="mb-4 text-sm text-gray-400">{t("prejoinSubtitle")}</p>

        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
          <div
            className={clsx(
              "absolute inset-0 bg-gradient-to-br from-brand/40 to-gray-800 transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)]",
              camOn ? "opacity-100" : "opacity-0",
            )}
            aria-hidden
          />
          <Avatar name={name} size="lg" className="relative z-10 !h-26 !w-26 text-2xl" />
          {!camOn ? (
            <div className="absolute bottom-3 left-3 z-10 rounded-md bg-black/60 px-3 py-1 text-xs text-white">
              {t("cameraOff")}
            </div>
          ) : null}

          <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-3">
            <Toggle
              on={micOn}
              label={micOn ? t("mute") : t("unmute")}
              onClick={() => meetingStore.getState().toggleMic()}
            >
              {micOn ? (
                <HiOutlineMicrophone className="h-6 w-6" aria-hidden />
              ) : (
                <MdMicOff className="h-6 w-6" aria-hidden />
              )}
            </Toggle>
            <Toggle
              on={camOn}
              label={camOn ? t("stopCam") : t("startCam")}
              onClick={() => meetingStore.getState().toggleCam()}
            >
              {camOn ? (
                <HiOutlineVideoCamera className="h-6 w-6" aria-hidden />
              ) : (
                <MdVideocamOff className="h-6 w-6" aria-hidden />
              )}
            </Toggle>
            <Toggle
              on={blurOn}
              label={t("blur")}
              onClick={() => meetingStore.getState().toggleBlur()}
            >
              <HiOutlineSun className="h-6 w-6" aria-hidden />
            </Toggle>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-400">{t("camera")}</span>
            <select
              className="block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              aria-label={t("camera")}
            >
              <option>FaceTime HD Camera</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-400">{t("microphone")}</span>
            <select
              className="block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              aria-label={t("microphone")}
            >
              <option>MacBook Pro Microphone</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={() => meetingStore.getState().toggleAiCompanion()}
          aria-pressed={aiCompanion}
          className={clsx(
            "mt-3 flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm font-medium transition-[transform,background-color,border-color,color] duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97]",
            aiCompanion
              ? "border-brand bg-gray-800 text-white"
              : "border-gray-700 bg-gray-800/60 text-gray-300",
          )}
        >
          <HiOutlineSparkles className="h-5 w-5 text-brand" aria-hidden />
          <span className="flex-1">{t("aiCompanion")}</span>
          <span className="text-sm">{aiCompanion ? t("on") : t("off")}</span>
        </button>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => meetingStore.getState().leave()}>
            {t("cancel")}
          </Button>
          <Button size="lg" onClick={() => meetingStore.getState().join()}>
            {t("joinNow")}
          </Button>
        </div>
      </div>
    </div>
  );
}
