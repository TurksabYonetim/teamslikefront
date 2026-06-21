import * as React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineMagnifyingGlass, HiOutlineHashtag, HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { Modal } from "@/components/ui";
import { messagingStore, useMessaging } from "../store";
import { memberName } from "../members";
import { highlightHit } from "../chat";

type Item =
  | { kind: "conv"; channelId: string; label: string; dm: boolean }
  | { kind: "msg"; id: string; channelId: string; topicId: string; label: string; meta: string };

/** Hızlı geçiş paleti: konuşmalara atla + konuşmalar arası mesaj araması. */
export function GlobalSearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation("messaging");
  const messages = useMessaging((s) => s.messages);
  const channels = useMessaging((s) => s.channels);
  const topics = useMessaging((s) => s.topics);
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);

  const query = q.trim().toLowerCase();

  const convItems: Item[] =
    query.length >= 1
      ? channels
          .filter((c) => c.name.toLowerCase().includes(query))
          .slice(0, 8)
          .map((c) => ({ kind: "conv", channelId: c.id, label: c.name, dm: c.kind === "dm" }))
      : [];

  const msgItems: Item[] =
    query.length >= 2
      ? messages
          .filter((m) => !m.deleted && !m.hiddenForMe && highlightHit(m.body, query))
          .slice(0, 30)
          .map((m) => {
            const ch = channels.find((c) => c.id === m.channelId);
            const tp = topics.find((x) => x.id === m.topicId);
            const meta = `${memberName(m.authorId)} · ${ch?.kind === "dm" ? ch.name : `#${ch?.name ?? ""}`}${
              tp && tp.title !== "main" ? ` / ${tp.title}` : ""
            }`;
            return { kind: "msg", id: m.id, channelId: m.channelId, topicId: m.topicId, label: m.body || t("voiceMessage"), meta };
          })
      : [];

  const items = [...convItems, ...msgItems];

  React.useEffect(() => setActive(0), [q]);

  const activate = (item: Item) => {
    const s = messagingStore.getState();
    s.setChannel(item.channelId);
    if (item.kind === "msg") s.setTopic(item.topicId);
    s.setSearch("");
    setQ("");
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (items.length === 0 ? 0 : Math.min(i + 1, items.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[active];
      if (item) activate(item);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t("palette.title")}>
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-md border border-line px-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:border-gray-700">
          <HiOutlineMagnifyingGlass className="h-5 w-5 text-muted" aria-hidden />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("palette.placeholder")}
            aria-label={t("palette.title")}
            role="combobox"
            aria-expanded={items.length > 0}
            aria-controls="palette-list"
            aria-activedescendant={items.length > 0 ? `palette-option-${active}` : undefined}
            className="h-12 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted md:text-sm dark:text-white"
          />
        </div>

        <ul id="palette-list" role="listbox" className="max-h-[55dvh] overflow-y-auto">
          {query.length < 1 ? (
            <li className="px-3 py-6 text-center text-sm text-muted">{t("palette.hint")}</li>
          ) : items.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted">{t("palette.noResults")}</li>
          ) : (
            items.map((item, idx) => {
              const selected = idx === active;
              const Icon = item.kind === "conv" ? (item.dm ? HiOutlineChatBubbleOvalLeft : HiOutlineHashtag) : null;
              return (
                <li key={item.kind === "conv" ? `conv-${item.channelId}` : `msg-${item.id}`} id={`palette-option-${idx}`} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => activate(item)}
                    className={
                      "flex w-full flex-col gap-0.5 rounded-md px-3 py-2 text-start " +
                      (selected ? "bg-surface-2 dark:bg-gray-700" : "hover:bg-surface-2 dark:hover:bg-gray-700")
                    }
                  >
                    {item.kind === "conv" ? (
                      <span className="flex items-center gap-2 text-sm font-medium text-ink dark:text-white">
                        {Icon && <Icon className="h-4 w-4 shrink-0 text-muted" aria-hidden />}
                        <span className="truncate">{item.label}</span>
                        <span className="shrink-0 text-xs text-muted">· {t("palette.conversations")}</span>
                      </span>
                    ) : (
                      <>
                        <span className="truncate text-sm font-medium text-ink dark:text-white">{item.label}</span>
                        <span className="truncate text-xs text-muted">{item.meta}</span>
                      </>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </Modal>
  );
}
