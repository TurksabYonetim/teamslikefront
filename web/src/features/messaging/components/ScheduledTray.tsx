import { useTranslation } from "react-i18next";
import { HiOutlineClock, HiOutlinePaperAirplane, HiOutlineTrash } from "react-icons/hi2";
import { Modal, Button, EmptyState } from "@/components/ui";
import { messagingStore, useMessaging } from "../store";

/** Zamanlanmış mesajlar tepsisi (Telegram). */
export function ScheduledTray({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation("messaging");
  const messages = useMessaging((s) => s.messages);
  const activeTopicId = useMessaging((s) => s.activeTopicId);
  const scheduled = messages.filter((m) => m.topicId === activeTopicId && m.scheduled);

  const sendScheduledNow = messagingStore.getState().sendScheduledNow;
  const deleteScheduled = messagingStore.getState().deleteScheduled;

  return (
    <Modal open={open} onClose={onClose} title={t("scheduledTitle")}>
      {scheduled.length === 0 ? (
        <EmptyState icon={<HiOutlineClock className="h-6 w-6" aria-hidden />} title={t("scheduledEmpty")} />
      ) : (
        <ul className="space-y-2">
          {scheduled.map((m) => (
            <li key={m.id} className="flex items-center gap-2 rounded-md border border-line bg-surface-2 p-3 dark:border-gray-700">
              <HiOutlineClock className="h-5 w-5 text-muted" aria-hidden />
              <span className="flex-1 truncate text-sm text-ink">{m.body}</span>
              <Button
                size="sm"
                onClick={() => {
                  sendScheduledNow(m.id);
                  onClose();
                }}
                leftIcon={<HiOutlinePaperAirplane className="h-4 w-4" aria-hidden />}
              >
                {t("sendNow")}
              </Button>
              <Button variant="ghost" size="sm" aria-label={t("delete")} onClick={() => deleteScheduled(m.id)}>
                <HiOutlineTrash className="h-4 w-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
