import { useTranslation } from "react-i18next";
import { HiOutlineBookmark } from "react-icons/hi2";
import { Modal, EmptyState } from "@/components/ui";
import { messagingStore, useMessaging } from "../store";
import { memberName } from "../members";

/** Tüm sohbetlerdeki kaydedilen mesajlar (Slack/Telegram kaydedilenler). */
export function SavedDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation("messaging");
  const messages = useMessaging((s) => s.messages);
  const channels = useMessaging((s) => s.channels);
  const topics = useMessaging((s) => s.topics);
  const saved = messages.filter((m) => m.saved && !m.deleted);

  const goto = (channelId: string, topicId: string) => {
    const s = messagingStore.getState();
    s.setChannel(channelId);
    s.setTopic(topicId);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t("savedTitle")}>
      {saved.length === 0 ? (
        <EmptyState
          icon={<HiOutlineBookmark className="h-6 w-6" aria-hidden />}
          title={t("savedEmpty")}
        />
      ) : (
        <ul className="space-y-2">
          {saved.map((m) => {
            const ch = channels.find((c) => c.id === m.channelId);
            const tp = topics.find((x) => x.id === m.topicId);
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => goto(m.channelId, m.topicId)}
                  className="flex w-full items-start gap-2 rounded-md border border-line bg-surface-2 p-3 text-start hover:border-brand dark:border-gray-700"
                >
                  <HiOutlineBookmark className="mt-0.5 h-[1.125rem] w-[1.125rem] text-brand" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink dark:text-white">
                      {memberName(m.authorId)} ·{" "}
                      <span className="text-muted">
                        {ch?.kind === "dm" ? ch.name : `#${ch?.name ?? ""}`}
                        {tp && tp.title !== "main" ? ` / ${tp.title}` : ""}
                      </span>
                    </span>
                    <span className="block truncate text-sm text-ink dark:text-white">
                      {m.body || t("voiceMessage")}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
