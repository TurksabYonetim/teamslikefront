import * as React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlinePlus } from "react-icons/hi2";
import clsx from "clsx";
import { storiesStore, useStories } from "../storiesStore";
import { ME_ID, memberName, colorFor } from "../members";
import { Avatar, Button, Modal } from "@/components/ui";

const MAX_FACES = 4;

/**
 * Durum şeridi — kanal başlığına gömülü kompakt facepile.
 * Üst üste binen küçük avatarlar + "durum ekle" düğmesi; durum yazma/görüntüleme
 * sabit yükseklikli başlığı bozmamak için modal ile açılır.
 */
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

  const shown = stories.slice(0, MAX_FACES);
  const extra = stories.length - shown.length;

  return (
    <div className="flex items-center gap-1.5">
      {shown.length > 0 ? (
        <div className="flex items-center -space-x-2">
          {shown.map((st) => {
            const seen = st.seenBy.includes(ME_ID);
            const name = memberName(st.authorId);
            return (
              <button
                key={st.id}
                type="button"
                aria-label={name}
                title={name}
                onClick={() => {
                  markSeen(st.id, ME_ID);
                  setViewing(st.id);
                }}
                className="relative rounded-full outline-none transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] hover:z-10 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-300 motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95"
              >
                <span
                  className={clsx(
                    "block rounded-full ring-2",
                    seen ? "ring-white dark:ring-gray-700" : "ring-brand",
                  )}
                >
                  <Avatar name={name} color={colorFor(st.authorId)} size="sm" />
                </span>
              </button>
            );
          })}
          {extra > 0 ? (
            <span
              aria-label={t("stories.more", { n: extra })}
              className="relative grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-muted ring-2 ring-white dark:bg-gray-600 dark:text-gray-100 dark:ring-gray-700"
            >
              +{extra}
            </span>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setAdding(true)}
        aria-label={t("stories.add")}
        title={t("stories.add")}
        className="grid h-8 w-8 place-items-center rounded-full text-muted ring-1 ring-line transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 motion-safe:active:scale-95 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-600 dark:hover:text-white"
      >
        <HiOutlinePlus className="h-4 w-4" aria-hidden />
      </button>

      {/* Durum ekle — sabit yükseklikli başlığı itmemek için modal */}
      <Modal
        open={adding}
        onClose={() => {
          setAdding(false);
          setDraft("");
        }}
        title={t("stories.add")}
      >
        <div className="flex items-end gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            aria-label={t("stories.add")}
            className="input h-10 flex-1"
          />
          <Button onClick={submit} disabled={!draft.trim()}>
            {t("stories.add")}
          </Button>
        </div>
      </Modal>

      {/* Durum görüntüleyici */}
      <Modal
        open={!!current}
        onClose={() => setViewing(null)}
        title={current ? memberName(current.authorId) : t("stories.viewer")}
      >
        {current ? <div className="text-sm text-ink dark:text-white">{current.text}</div> : null}
      </Modal>
    </div>
  );
}
