import * as React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlinePlus } from "react-icons/hi2";
import clsx from "clsx";
import { storiesStore, useStories } from "../storiesStore";
import { ME_ID, memberName, colorFor } from "../members";
import { Avatar, Button, Modal } from "@/components/ui";

/** WhatsApp Status / Telegram Stories — geçici durum şeridi. */
export function StoriesBar() {
  const { t } = useTranslation("messaging");
  const stories = useStories((s) => s.stories);
  const { addStory, markSeen } = storiesStore.getState();
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [viewing, setViewing] = React.useState<string | null>(null);
  const current = stories.find((s) => s.id === viewing) ?? null;

  const submit = () => {
    if (!draft.trim()) return;
    addStory(ME_ID, draft.trim());
    setDraft("");
    setAdding(false);
  };

  return (
    <div className="border-b border-line bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="flex shrink-0 flex-col items-center gap-1"
          aria-expanded={adding}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-line text-muted dark:border-gray-600">
            <HiOutlinePlus className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-xs text-muted">{t("stories.add")}</span>
        </button>

        {stories.map((st) => {
          const seen = st.seenBy.includes(ME_ID);
          const name = memberName(st.authorId);
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => {
                markSeen(st.id, ME_ID);
                setViewing(st.id);
              }}
              className="flex shrink-0 flex-col items-center gap-1"
            >
              <span className={clsx("rounded-full p-0.5 ring-2", seen ? "ring-line dark:ring-gray-600" : "ring-brand")}>
                <Avatar name={name} color={colorFor(st.authorId)} size="lg" />
              </span>
              <span className="max-w-[4rem] truncate text-xs text-ink dark:text-white">{name}</span>
            </button>
          );
        })}
      </div>

      {adding ? (
        <div className="mt-2 flex items-end gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            aria-label={t("stories.add")}
            className="block h-10 flex-1 rounded-lg border border-gray-300 bg-surface-2 px-2.5 text-sm text-ink placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <Button onClick={submit} disabled={!draft.trim()}>
            {t("stories.add")}
          </Button>
        </div>
      ) : null}

      <Modal open={!!current} onClose={() => setViewing(null)} title={current ? memberName(current.authorId) : t("stories.viewer")}>
        {current ? <div className="text-sm text-ink dark:text-white">{current.text}</div> : null}
      </Modal>
    </div>
  );
}
