import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HiOutlineVideoCamera,
  HiOutlinePlus,
  HiOutlineUsers,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlineTrash,
  HiOutlineLink,
  HiOutlineClipboard,
} from "react-icons/hi2";
import {
  Avatar,
  Badge,
  Button,
  IconButton,
  ConfirmDialog,
} from "@/components/ui";
import { memberName } from "@/features/messaging/members";
import { meetingStore, useMeeting } from "../meetings.store";
import { MEETINGS } from "../meetings.data";
import { CreateRoomDialog } from "./CreateRoomDialog";

/** Persistent personal-room URL for the signed-in host (Webex Personal Room parity). */
const PERSONAL_ROOM_URL = "https://aura.dev/meet/ismail-k";

const cardClass =
  "rounded-card border border-line bg-white p-4 dark:border-gray-700 dark:bg-gray-800";

export function MeetingsLanding() {
  const { t } = useTranslation("meetings");
  const rooms = useMeeting((s) => s.rooms);
  const [roomDialog, setRoomDialog] = useState(false);
  const [confirmRoomId, setConfirmRoomId] = useState<string | null>(null);
  const confirmRoom = rooms.find((r) => r.id === confirmRoomId) ?? null;

  const startInstant = () => meetingStore.getState().startInstant();
  const openPrejoin = (id: string, title: string) =>
    meetingStore.getState().openPrejoin(id, title);
  const joinRoom = (id: string) => meetingStore.getState().joinRoom(id);
  const deleteRoom = (id: string) => meetingStore.getState().deleteRoom(id);

  return (
    <div className="mx-auto max-w-5xl p-6 xl:max-w-6xl xl:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink dark:text-white">
            {t("landing.title")}
          </h1>
          <p className="mt-1 text-sm text-muted dark:text-gray-400">
            {t("landingSubtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            leftIcon={
              <HiOutlineUsers className="h-[18px] w-[18px]" aria-hidden />
            }
            onClick={() => openPrejoin(MEETINGS[0].id, MEETINGS[0].title)}
          >
            {t("join")}
          </Button>
          <Button
            leftIcon={
              <HiOutlinePlus className="h-[18px] w-[18px]" aria-hidden />
            }
            onClick={startInstant}
          >
            {t("newMeeting")}
          </Button>
        </div>
      </div>

      {/* Personal room — persistent meeting URL per host (Webex parity) */}
      <div className={`${cardClass} mt-6 flex flex-wrap items-center gap-3`}>
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-surface-2 text-brand dark:bg-gray-700">
          <HiOutlineLink className="h-[22px] w-[22px]" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-ink dark:text-white">
            {t("personalRoom")}
          </div>
          <div className="truncate text-sm text-muted dark:text-gray-400">
            {PERSONAL_ROOM_URL}
          </div>
        </div>
        <IconButton
          label={t("copyLink")}
          onClick={() => void navigator.clipboard?.writeText(PERSONAL_ROOM_URL)}
        >
          <HiOutlineClipboard className="h-[18px] w-[18px]" aria-hidden />
        </IconButton>
        <Button onClick={startInstant}>{t("startRoom")}</Button>
      </div>

      {/* Upcoming / live meetings */}
      <h2 className="mt-6 text-base font-semibold text-ink dark:text-white">
        {t("upcoming")}
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MEETINGS.map((m) => (
          <div key={m.id} className={`${cardClass} flex flex-col`}>
            <div className="flex items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-surface-2 text-brand dark:bg-gray-700">
                <HiOutlineVideoCamera className="h-6 w-6" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink dark:text-white">
                  {m.title}
                </div>
                <div className="truncate text-sm text-muted dark:text-gray-400">
                  {memberName(m.host)}
                </div>
              </div>
              {m.live ? (
                <Badge tone="danger">{t("live")}</Badge>
              ) : (
                <Badge tone="neutral">{t("inMin", { n: m.startsInMin })}</Badge>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div
                className="flex -space-x-2"
                aria-label={t("participantCount", {
                  n: m.participantIds.length,
                })}
              >
                {m.participantIds.slice(0, 4).map((id) => (
                  <span
                    key={id}
                    className="rounded-full ring-2 ring-white dark:ring-gray-800"
                  >
                    <Avatar name={memberName(id)} size="sm" />
                  </span>
                ))}
                {m.participantIds.length > 4 ? (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-xs text-muted ring-2 ring-white dark:bg-gray-700 dark:text-gray-400 dark:ring-gray-800">
                    +{m.participantIds.length - 4}
                  </span>
                ) : null}
              </div>
              <Button onClick={() => openPrejoin(m.id, m.title)}>
                {t("joinShort")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Persistent video rooms (moderator-created, Jitsi-style) */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink dark:text-white">
          {t("rooms")}
        </h2>
        <Button
          variant="secondary"
          leftIcon={<HiOutlinePlus className="h-[18px] w-[18px]" aria-hidden />}
          onClick={() => setRoomDialog(true)}
        >
          {t("createRoom")}
        </Button>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => (
          <div key={r.id} className={`${cardClass} flex items-center gap-3`}>
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-surface-2 text-brand dark:bg-gray-700">
              {r.locked ? (
                <HiOutlineLockClosed
                  className="h-[22px] w-[22px]"
                  aria-hidden
                />
              ) : (
                <HiOutlineLockOpen className="h-[22px] w-[22px]" aria-hidden />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink dark:text-white">
                {r.name}
              </div>
              <div className="truncate text-sm text-muted dark:text-gray-400">
                {t("participantCount", { n: r.participants ?? 0 })}
                {r.waitingRoom ? ` · ${t("waitingRoom")}` : ""}
              </div>
            </div>
            <Button onClick={() => joinRoom(r.id)}>{t("joinShort")}</Button>
            <IconButton
              label={t("deleteRoom")}
              onClick={() => setConfirmRoomId(r.id)}
            >
              <HiOutlineTrash className="h-[18px] w-[18px]" aria-hidden />
            </IconButton>
          </div>
        ))}
      </div>

      <CreateRoomDialog
        open={roomDialog}
        onClose={() => setRoomDialog(false)}
      />
      <ConfirmDialog
        open={confirmRoom !== null}
        title={t("deleteRoom")}
        message={
          confirmRoom ? t("deleteRoomConfirm", { name: confirmRoom.name }) : ""
        }
        confirmLabel={t("deleteAction")}
        onConfirm={() => {
          if (confirmRoomId) deleteRoom(confirmRoomId);
          setConfirmRoomId(null);
        }}
        onClose={() => setConfirmRoomId(null)}
      />
    </div>
  );
}
