import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineXMark,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlineUsers,
  HiOutlineHandRaised,
  HiOutlineComputerDesktop,
  HiOutlineChatBubbleOvalLeft,
  HiOutlinePhoneXMark,
} from "react-icons/hi2";
import { MdMicOff } from "react-icons/md";
import clsx from "clsx";
import { meetingStore, useMeeting } from "../meetings.store";
import { IconButton, Button, useToast } from "@/components/ui";
import { MeetParityPanel } from "./MeetParityPanel";
import { MeetGmPanel } from "./MeetGmPanel";
import { FacilitatorPanel } from "./FacilitatorPanel";

function SettingRow({
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
      className="flex h-11 w-full items-center gap-2 rounded-md border border-line px-3 text-sm text-ink hover:bg-surface-2"
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <span className={clsx("text-sm", on ? "text-brand" : "text-ink-3")}>
        {on ? t("on") : t("off")}
      </span>
    </button>
  );
}

export function HostPanel() {
  const { t } = useTranslation("meetings");
  let toast: ReturnType<typeof useToast> | undefined;
  try {
    toast = useToast();
  } catch {
    toast = undefined;
  }

  const sidePanel = useMeeting((s) => s.sidePanel);
  const locked = useMeeting((s) => s.locked);
  const waitingRoom = useMeeting((s) => s.waitingRoom);
  const allowAttendeeShare = useMeeting((s) => s.allowAttendeeShare);
  const allowAttendeeChat = useMeeting((s) => s.allowAttendeeChat);

  const act = () => meetingStore.getState();

  if (sidePanel !== "host") return null;

  return (
    <aside
      aria-label={t("hostControls")}
      className="flex w-80 shrink-0 flex-col border-l border-line bg-surface"
    >
      <header className="flex items-center justify-between border-b border-line p-3">
        <span className="text-sm font-semibold text-ink">{t("hostControls")}</span>
        <IconButton label={t("closePanel")} onClick={() => act().setSidePanel("none")}>
          <HiOutlineXMark className="h-5 w-5" aria-hidden />
        </IconButton>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-ink-3">{t("meetingSettings")}</h3>
          <SettingRow
            label={t("lockMeeting")}
            on={locked}
            onToggle={() => act().toggleLock()}
            icon={
              locked ? (
                <HiOutlineLockClosed className="h-5 w-5" aria-hidden />
              ) : (
                <HiOutlineLockOpen className="h-5 w-5" aria-hidden />
              )
            }
          />
          <SettingRow
            label={t("waitingRoom")}
            on={waitingRoom}
            onToggle={() => act().toggleWaitingRoom()}
            icon={<HiOutlineUsers className="h-5 w-5" aria-hidden />}
          />
          <SettingRow
            label={t("allowShare")}
            on={allowAttendeeShare}
            onToggle={() => act().toggleAttendeeShare()}
            icon={<HiOutlineComputerDesktop className="h-5 w-5" aria-hidden />}
          />
          <SettingRow
            label={t("allowChat")}
            on={allowAttendeeChat}
            onToggle={() => act().toggleAttendeeChat()}
            icon={<HiOutlineChatBubbleOvalLeft className="h-5 w-5" aria-hidden />}
          />
        </section>

        <MeetParityPanel />
        <MeetGmPanel />
        <FacilitatorPanel />

        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-ink-3">{t("bulkActions")}</h3>
          <Button
            variant="secondary"
            className="w-full"
            leftIcon={<MdMicOff className="h-5 w-5" aria-hidden />}
            onClick={() => {
              act().muteAll();
              toast?.show({ message: t("mutedAll") });
            }}
          >
            {t("muteAll")}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            leftIcon={<HiOutlineHandRaised className="h-5 w-5" aria-hidden />}
            onClick={() => act().lowerAllHands()}
          >
            {t("lowerAllHands")}
          </Button>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-danger">{t("dangerZone")}</h3>
          <Button
            variant="danger"
            className="w-full"
            leftIcon={<HiOutlinePhoneXMark className="h-5 w-5" aria-hidden />}
            onClick={() => {
              act().endForAll();
              toast?.show({ message: t("endedForAll") });
            }}
          >
            {t("endForAll")}
          </Button>
        </section>
      </div>
    </aside>
  );
}
