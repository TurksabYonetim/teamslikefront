import { useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui";
import { meetingStore } from "../meetings.store";

// Modül seviyesinde: render-içi tanım her seferinde yeni tip üretip remount/focus
// kaybına yol açmasın diye component dışında (saf props).
function Toggle({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => set(!on)}
      aria-pressed={on}
      className={clsx(
        "h-9 rounded-md border px-3 text-sm",
        on
          ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-gray-700 dark:text-primary-400"
          : "border-line bg-surface text-muted dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400",
      )}
    >
      {label}
    </button>
  );
}

/** Moderatör tarafından oluşturulan kalıcı görüntülü oda. */
export function CreateRoomDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation("meetings");
  const [name, setName] = useState("");
  const [locked, setLocked] = useState(false);
  const [waitingRoom, setWaitingRoom] = useState(true);
  const [password, setPassword] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    meetingStore.getState().createRoom(name, {
      locked,
      waitingRoom,
      password: password || undefined,
    });
    setName("");
    setPassword("");
    setLocked(false);
    setWaitingRoom(true);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t("createRoom")}>
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm text-muted dark:text-gray-400">
            {t("roomName")}
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("roomNamePh")}
            className="input h-11"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Toggle on={locked} set={setLocked} label={t("roomLocked")} />
          <Toggle on={waitingRoom} set={setWaitingRoom} label={t("roomWaiting")} />
        </div>
        <label className="block">
          <span className="mb-1 block text-sm text-muted dark:text-gray-400">
            {t("roomPassword")}
          </span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("roomPasswordPh")}
            className="input h-11"
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={submit} disabled={!name.trim()}>
            {t("createRoom")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
