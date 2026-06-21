import * as React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineChatBubbleLeftRight, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { EmptyState, Skeleton } from "@/components/ui";
import { useMessaging } from "../store";
import { highlightHit } from "../chat";
import type { Message } from "../types";
import { MessageBubble } from "./MessageBubble";

/** İlk yükleme iskeleti — konuşma açılırken 6 satır. */
function MessageListSkeleton() {
  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => {
        const mine = i % 3 === 2;
        return (
          <div
            key={i}
            className={mine ? "flex justify-end" : "flex items-start gap-2"}
            style={{
              animation: "tl-fade-in var(--dur-toast) var(--ease-out) both",
              animationDelay: `${i * 45}ms`,
            }}
          >
            {!mine ? <Skeleton className="h-8 w-8 shrink-0 rounded-full" /> : null}
            <div className={mine ? "flex flex-col items-end gap-1.5" : "flex flex-col gap-1.5"}>
              {!mine ? <Skeleton className="h-2.5 w-20" /> : null}
              <Skeleton className={mine ? "h-9 w-40 rounded-2xl" : "h-9 w-52 rounded-2xl"} />
              {i % 2 === 0 ? <Skeleton className={mine ? "h-9 w-28 rounded-2xl" : "h-9 w-36 rounded-2xl"} /> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MessageList() {
  const { t } = useTranslation("messaging");
  const messages = useMessaging((s) => s.messages);
  const channels = useMessaging((s) => s.channels);
  const activeChannelId = useMessaging((s) => s.activeChannelId);
  const activeTopicId = useMessaging((s) => s.activeTopicId);
  const search = useMessaging((s) => s.search);
  const savedOnly = useMessaging((s) => s.savedOnly);
  const endRef = React.useRef<HTMLDivElement>(null);

  // İlk yükleme iskeleti — konuşma değişince kısa süre göster.
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), 360);
    return () => window.clearTimeout(id);
  }, [activeTopicId]);

  const channel = channels.find((c) => c.id === activeChannelId);
  const q = search.trim();

  const topLevel: Message[] = messages
    .filter((m) => m.topicId === activeTopicId && !m.parentId && !m.hiddenForMe && !m.scheduled)
    .filter((m) => !savedOnly || m.saved)
    .filter((m) => q.length === 0 || highlightHit(m.body, q))
    .slice()
    .sort((a, b) => b.tMinutes - a.tMinutes); // en eski üstte, en yeni altta

  // Okunmamış ayıracı: liste sonundan `unread` kadar önceki mesajdan itibaren.
  const unread = q.length === 0 && !savedOnly ? channel?.unread ?? 0 : 0;
  const unreadFromIndex = unread > 0 && unread < topLevel.length ? topLevel.length - unread : -1;

  React.useEffect(() => {
    const el = endRef.current;
    if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ block: "end" });
  }, [messages, activeTopicId]);

  if (loading && q.length === 0) {
    return <MessageListSkeleton />;
  }

  if (topLevel.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-y-auto">
        {q ? (
          <EmptyState
            icon={<HiOutlineMagnifyingGlass className="h-7 w-7" aria-hidden />}
            title={t("noResults")}
          />
        ) : (
          <EmptyState
            icon={<HiOutlineChatBubbleLeftRight className="h-7 w-7" aria-hidden />}
            title={t("emptyTitle")}
            description={t("emptyHint") !== "emptyHint" ? t("emptyHint") : undefined}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto py-3 tl-stagger">
      <div className="mx-auto w-full max-w-5xl 2xl:max-w-6xl">
      {topLevel.map((m, i) => {
        const prev = topLevel[i - 1];
        const grouped =
          channel?.kind !== "dm" &&
          !!prev &&
          prev.authorId === m.authorId &&
          Math.abs(prev.tMinutes - m.tMinutes) <= 8;
        return (
          <React.Fragment key={m.id}>
            {i === unreadFromIndex ? (
              <div className="my-2 flex items-center gap-2 px-4" role="separator">
                <span className="h-px flex-1 bg-danger" />
                <span className="text-xs font-medium text-danger">{t("newMessages")}</span>
                <span className="h-px flex-1 bg-danger" />
              </div>
            ) : null}
            <MessageBubble message={m} grouped={grouped} />
          </React.Fragment>
        );
      })}
      </div>
      <div ref={endRef} />
    </div>
  );
}
