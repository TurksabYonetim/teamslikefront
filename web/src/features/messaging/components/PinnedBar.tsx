import { useTranslation } from "react-i18next";
import { HiOutlineMapPin, HiOutlineXMark } from "react-icons/hi2";
import { messagingStore, useMessaging } from "../store";

/** Sabitlenen mesaj çubuğu (Slack/Telegram). */
export function PinnedBar() {
  const { t } = useTranslation("messaging");
  const messages = useMessaging((s) => s.messages);
  const activeTopicId = useMessaging((s) => s.activeTopicId);
  const togglePin = messagingStore.getState().togglePin;

  const pinned = messages.filter((m) => m.topicId === activeTopicId && m.pinned && !m.deleted);
  if (pinned.length === 0) return null;
  const first = pinned[0];

  return (
    <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2 dark:border-gray-700">
      <HiOutlineMapPin className="h-4 w-4 shrink-0 text-brand" aria-hidden />
      <div className="min-w-0 flex-1 text-sm">
        <span className="font-semibold text-ink dark:text-white">
          {t("pinnedMessage")} ({pinned.length})
        </span>
        <span className="ml-2 inline-block max-w-full truncate align-bottom text-muted">{first.body}</span>
      </div>
      <button
        type="button"
        onClick={() => togglePin(first.id)}
        aria-label={t("unpin")}
        className="rounded-md p-1.5 text-muted hover:bg-surface-3 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none dark:hover:bg-gray-700"
      >
        <HiOutlineXMark className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
