// web/src/features/support/components/ConversationList.tsx
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { conversationStore } from "../conversation.store";
import { inboxStore } from "../inbox.store";
import { slaState } from "../support.dom";
import { INBOXES, ME_ID } from "../support.data";
import { CHANNEL_ICON, PRIORITY_TONE, contactName } from "../shared";

export function ConversationList() {
  const { t } = useTranslation("support");
  const conversations = useStore(conversationStore, (s) => s.conversations);
  const activeId = useStore(conversationStore, (s) => s.activeConversationId);
  const activeInboxId = useStore(inboxStore, (s) => s.activeInboxId);
  const filterStatus = useStore(inboxStore, (s) => s.filterStatus);
  const assignee = useStore(inboxStore, (s) => s.assignee);
  const query = useStore(inboxStore, (s) => s.query);

  const q = query.trim().toLowerCase();
  const list = conversations
    .filter((c) => !activeInboxId || c.inboxId === activeInboxId)
    .filter((c) => filterStatus === "all" || c.status === filterStatus)
    .filter((c) => assignee === "all" || (assignee === "mine" ? c.assigneeId === ME_ID : !c.assigneeId))
    .filter((c) => !q || contactName(c.contactId).toLowerCase().includes(q) || c.messages.some((m) => m.body.toLowerCase().includes(q)));

  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-line bg-surface">
      <div className="border-b border-line p-2">
        <input
          value={query}
          onChange={(e) => inboxStore.getState().setQuery(e.target.value)}
          placeholder={t("list.search")}
          aria-label={t("list.search")}
          className="block w-full rounded-lg border border-gray-300 bg-surface-2 p-2.5 text-sm text-ink placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>
      {list.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted">{t("list.empty")}</div>
      ) : (
        <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto" aria-label={t("contact.conversations")}>
          {list.map((c) => {
            const inbox = INBOXES.find((i) => i.id === c.inboxId);
            const channelIcon = CHANNEL_ICON[inbox?.channelType ?? "livechat"];
            const sla = slaState(c.slaDueAt);
            const last = c.messages.at(-1);
            return (
              <li key={c.id}>
                <button
                  onClick={() => conversationStore.getState().setActive(c.id)}
                  aria-current={activeId === c.id ? "true" : undefined}
                  className={clsx("flex w-full flex-col gap-1 px-3 py-2 text-left", activeId === c.id ? "bg-surface-2" : "hover:bg-surface-2")}
                >
                  <div className="flex items-center gap-2">
                    <Icon name={channelIcon} className="h-4 w-4 text-muted" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{contactName(c.contactId)}</span>
                    {c.unread > 0 ? <Badge tone="accent">{c.unread}</Badge> : null}
                  </div>
                  {last ? <div className="truncate text-sm text-muted">{last.body}</div> : null}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <Badge tone={PRIORITY_TONE[c.priority]}>{t(`priority.${c.priority}`)}</Badge>
                    <Badge tone="neutral">{t(`status.${c.status}`)}</Badge>
                    {sla === "breached" ? (
                      <Badge tone="danger"><Icon name="alert" className="h-3 w-3" /> {t("sla.breached")}</Badge>
                    ) : sla === "due_soon" ? (
                      <Badge tone="warning"><Icon name="clock" className="h-3 w-3" /> {t("sla.due_soon")}</Badge>
                    ) : null}
                    {c.labels.map((l) => (
                      <span key={l} className="rounded-sm border border-line px-1.5 text-muted">{l}</span>
                    ))}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
