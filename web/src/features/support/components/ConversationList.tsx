// web/src/features/support/components/ConversationList.tsx
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { Avatar, Badge } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { conversationStore } from "../conversation.store";
import { inboxStore } from "../inbox.store";
import { slaState } from "../support.dom";
import { INBOXES, ME_ID } from "../support.data";
import { CHANNEL_ICON, contactName } from "../shared";

const STATUS_CHIP: Record<string, string> = {
  open: "sp-chip-open",
  pending: "sp-chip-wait",
  snoozed: "sp-chip-snooze",
  resolved: "sp-chip-res",
};

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
          className="input"
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
                  className={clsx("sp-conv", activeId === c.id && "sp-conv--on")}
                >
                  <div className="sp-conv-top">
                    <Avatar name={contactName(c.contactId)} size="xs" />
                    <span className="sp-name">{contactName(c.contactId)}</span>
                    <Icon name={channelIcon} className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
                    {c.unread > 0 ? <Badge tone="accent">{c.unread}</Badge> : null}
                  </div>
                  {last ? <p className="sp-prev">{last.body}</p> : null}
                  <div className="sp-meta">
                    <span className={clsx("sp-prio", `sp-prio-${c.priority}`)} title={t(`priority.${c.priority}`)} aria-label={t(`priority.${c.priority}`)} />
                    <span className={clsx("sp-chip", STATUS_CHIP[c.status] ?? "sp-chip-snooze")}>{t(`status.${c.status}`)}</span>
                    {sla === "breached" ? (
                      <span className="sp-chip sp-chip-sla"><Icon name="alert" className="h-3 w-3" /> {t("sla.breached")}</span>
                    ) : sla === "due_soon" ? (
                      <span className="sp-chip sp-chip-wait"><Icon name="clock" className="h-3 w-3" /> {t("sla.due_soon")}</span>
                    ) : null}
                    {c.labels.map((l) => (
                      <span key={l} className="sp-chip sp-chip-tag">{l}</span>
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
