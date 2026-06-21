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
import { Button, Select } from "@/components/ui";
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
          ? "border border-line bg-surface-2 text-ink-2 hover:bg-surface-3 hover:text-ink"
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
    <div className="flex h-full items-center justify-center bg-surface-2 p-6">
      <div className="w-full max-w-3xl">
        <h1 className="mb-1 text-xl font-semibold text-ink">{title}</h1>
        <p className="mb-4 text-sm text-muted">{t("prejoinSubtitle")}</p>

        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-line bg-surface-2">
          <div
            className={clsx(
              "absolute inset-0 bg-gradient-to-br from-brand/10 to-surface-3 transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)]",
              camOn ? "opacity-100" : "opacity-0",
            )}
            aria-hidden
          />
          <Avatar name={name} size="lg" className="relative z-10 !h-26 !w-26 text-2xl" />
          {!camOn ? (
            <div className="absolute bottom-3 left-3 z-10 rounded-md bg-surface/90 px-3 py-1 text-xs text-ink ring-1 ring-line">
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
          <Select
            value="FaceTime HD Camera"
            onChange={() => {}}
            label={t("camera")}
            options={[{ value: "FaceTime HD Camera", label: "FaceTime HD Camera" }]}
          />
          <Select
            value="MacBook Pro Microphone"
            onChange={() => {}}
            label={t("microphone")}
            options={[{ value: "MacBook Pro Microphone", label: "MacBook Pro Microphone" }]}
          />
        </div>

        <button
          type="button"
          onClick={() => meetingStore.getState().toggleAiCompanion()}
          aria-pressed={aiCompanion}
          className={clsx(
            "mt-3 flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm font-medium transition-[transform,background-color,border-color,color] duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97]",
            aiCompanion
              ? "border-brand bg-primary-50 text-ink"
              : "border-line bg-surface-2 text-ink-2",
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
