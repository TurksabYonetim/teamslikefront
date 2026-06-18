import * as React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineXMark, HiOutlinePaperAirplane } from "react-icons/hi2";
import { messagingStore, useMessaging } from "../store";
import { ME_ID } from "../members";
import { MessageBubble } from "./MessageBubble";
import { IconButton, Backdrop } from "@/components/ui";

export function ThreadPanel() {
  const { t } = useTranslation("messaging");
  const messages = useMessaging((s) => s.messages);
  const threadRootId = useMessaging((s) => s.threadRootId);
  const { closeThread, reply } = messagingStore.getState();
  const [text, setText] = React.useState("");

  const root = messages.find((m) => m.id === threadRootId);
  if (!root) return null;

  const replies = messages
    .filter((m) => m.parentId === root.id)
    .slice()
    .sort((a, b) => b.tMinutes - a.tMinutes);

  const submit = () => {
    if (!text.trim()) return;
    reply(root.id, text, ME_ID);
    setText("");
  };

  return (
    <>
      <Backdrop level="drawer" onClick={closeThread} className="lg:hidden" />
      <aside
        aria-label={t("thread.title")}
        className="fixed inset-y-0 end-0 z-40 flex w-full max-w-md flex-col border-s border-line bg-white shadow-2xl max-lg:motion-safe:[animation:tl-drawer-in-end_var(--dur-modal)_var(--ease-drawer)] lg:static lg:z-auto lg:w-96 lg:max-w-none lg:shadow-none dark:border-gray-700 dark:bg-gray-800"
      >
        <header className="flex items-center justify-between gap-2 border-b border-line p-3 dark:border-gray-700">
          <span className="text-sm font-semibold text-ink dark:text-white">{t("thread.title")}</span>
          <IconButton label={t("cancel")} onClick={closeThread}>
            <HiOutlineXMark className="h-5 w-5" aria-hidden />
          </IconButton>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          <MessageBubble message={root} />
          <div className="my-2 border-t border-line px-4 pt-2 text-sm text-muted dark:border-gray-700">
            {t("thread.replies", { n: replies.length })}
          </div>
          <div className="tl-stagger">
            {replies.map((r) => (
              <MessageBubble key={r.id} message={r} />
            ))}
          </div>
        </div>

        <div className="border-t border-line p-3 dark:border-gray-700">
          <div className="flex items-end gap-2">
            <label htmlFor="thread-reply" className="sr-only">
              {t("thread.reply")}
            </label>
            <textarea
              id="thread-reply"
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={t("thread.reply")}
              className="input min-h-[2.75rem] flex-1 resize-none"
            />
            <IconButton label={t("send")} variant="primary" onClick={submit} disabled={!text.trim()}>
              <HiOutlinePaperAirplane className="h-4 w-4" aria-hidden />
            </IconButton>
          </div>
        </div>
      </aside>
    </>
  );
}
