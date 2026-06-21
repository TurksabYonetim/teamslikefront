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
import { meetingStore, useMeeting } from "../meetings.store";
import { IconButton, Button, useToast } from "@/components/ui";
import { MeetParityPanel } from "./MeetParityPanel";
import { MeetGmPanel } from "./MeetGmPanel";
import { FacilitatorPanel } from "./FacilitatorPanel";
import { MeetingToggleRow } from "./MeetingToggleRow";

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
      className="flex w-full sm:w-80 xl:w-96 shrink-0 flex-col border-l border-line bg-surface"
    >
      <header className="flex items-center justify-between border-b border-line p-3">
        <span className="text-sm font-semibold text-ink">{t("hostControls")}</span>
        <IconButton label={t("closePanel")} onClick={() => act().setSidePanel("none")}>
          <HiOutlineXMark className="h-5 w-5" aria-hidden />
        </IconButton>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3">
        <section>
          <h3 className="mb-2 text-sm font-semibold text-ink">{t("meetingSettings")}</h3>
          <div className="space-y-2">
            <MeetingToggleRow
              label={t("lockMeeting")}
              on={locked}
              onToggle={() => act().toggleLock()}
              icon={locked ? <HiOutlineLockClosed className="h-5 w-5" aria-hidden /> : <HiOutlineLockOpen className="h-5 w-5" aria-hidden />}
            />
            <MeetingToggleRow
              label={t("waitingRoom")}
              on={waitingRoom}
              onToggle={() => act().toggleWaitingRoom()}
              icon={<HiOutlineUsers className="h-5 w-5" aria-hidden />}
            />
            <MeetingToggleRow
              label={t("allowShare")}
              on={allowAttendeeShare}
              onToggle={() => act().toggleAttendeeShare()}
              icon={<HiOutlineComputerDesktop className="h-5 w-5" aria-hidden />}
            />
            <MeetingToggleRow
              label={t("allowChat")}
              on={allowAttendeeChat}
              onToggle={() => act().toggleAttendeeChat()}
              icon={<HiOutlineChatBubbleOvalLeft className="h-5 w-5" aria-hidden />}
            />
          </div>
        </section>

        <MeetParityPanel />
        <MeetGmPanel />
        <FacilitatorPanel />

        <section>
          <h3 className="mb-2 text-sm font-semibold text-ink">{t("bulkActions")}</h3>
          <div className="space-y-2">
            <Button variant="secondary" className="w-full" leftIcon={<MdMicOff className="h-5 w-5" aria-hidden />} onClick={() => { act().muteAll(); toast?.show({ message: t("mutedAll") }); }}>{t("muteAll")}</Button>
            <Button variant="secondary" className="w-full" leftIcon={<HiOutlineHandRaised className="h-5 w-5" aria-hidden />} onClick={() => act().lowerAllHands()}>{t("lowerAllHands")}</Button>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-danger">{t("dangerZone")}</h3>
          <Button variant="danger" className="w-full" leftIcon={<HiOutlinePhoneXMark className="h-5 w-5" aria-hidden />} onClick={() => { act().endForAll(); toast?.show({ message: t("endedForAll") }); }}>{t("endForAll")}</Button>
        </section>
      </div>
    </aside>
  );
}
