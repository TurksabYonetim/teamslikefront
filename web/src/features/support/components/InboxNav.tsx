// web/src/features/support/components/InboxNav.tsx
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { useStore } from "@/lib/createStore";
import { inboxStore, type AssigneeFilter, type StatusFilter } from "../inbox.store";
import { conversationStore } from "../conversation.store";
import { CHANNEL_ICON } from "../shared";

const STATUSES: StatusFilter[] = ["all", "open", "pending", "snoozed", "resolved"];
const ASSIGNEES: AssigneeFilter[] = ["all", "mine", "unassigned"];

const chip = (active: boolean) =>
  clsx(
    "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] motion-safe:transition-[transform,background-color,color]",
    active ? "border-brand-soft bg-brand-softer text-brand" : "border-line text-ink-3 hover:bg-surface-2 hover:text-ink",
  );

export function InboxNav() {
  const { t } = useTranslation("support");
  const inboxes = useStore(inboxStore, (s) => s.inboxes);
  const activeInboxId = useStore(inboxStore, (s) => s.activeInboxId);
  const filterStatus = useStore(inboxStore, (s) => s.filterStatus);
  const assignee = useStore(inboxStore, (s) => s.assignee);
  const conversations = useStore(conversationStore, (s) => s.conversations);
  const act = inboxStore.getState;

  const countFor = (inboxId: string | null) =>
    inboxId === null ? conversations.length : conversations.filter((c) => c.inboxId === inboxId).length;

  const inboxBtn = (active: boolean) =>
    clsx(
      "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.98] motion-safe:transition-[transform,background-color,color]",
      active ? "bg-brand-softer font-medium text-brand" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
    );

  const count = (n: number, active: boolean) =>
    n > 0 ? (
      <span
        className={clsx(
          "ml-auto rounded-full px-1.5 text-xs font-semibold tabular-nums",
          active ? "bg-surface text-brand-600" : "bg-surface-3 text-muted",
        )}
      >
        {n}
      </span>
    ) : null;

  return (
    <div className="flex flex-col gap-3 overflow-y-auto rounded-xl border border-line bg-surface p-3">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-muted">{t("inboxesHeader")}</h3>
        <ul className="space-y-0.5">
          <li>
            <button onClick={() => act().setInbox(null)} aria-current={activeInboxId === null ? "page" : undefined} className={inboxBtn(activeInboxId === null)}>
              <Icon name="inbox" className="h-4 w-4 shrink-0" /> <span className="truncate">{t("allInboxes")}</span>
              {count(countFor(null), activeInboxId === null)}
            </button>
          </li>
          {inboxes.map((ib) => {
            const active = activeInboxId === ib.id;
            return (
              <li key={ib.id}>
                <button onClick={() => act().setInbox(ib.id)} aria-current={active ? "page" : undefined} className={inboxBtn(active)}>
                  <Icon name={CHANNEL_ICON[ib.channelType]} className="h-4 w-4 shrink-0" /> <span className="truncate">{ib.name}</span>
                  {count(countFor(ib.id), active)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="mb-1.5 text-sm font-semibold text-muted">{t("filterHeader")}</h3>
        <div className="flex flex-wrap gap-1">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => act().setFilter(s)} aria-pressed={filterStatus === s} className={chip(filterStatus === s)}>
              {s === "all" ? t("filters.all") : t(`status.${s}`)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-1.5 text-sm font-semibold text-muted">{t("assigneeHeader")}</h3>
        <div className="flex flex-wrap gap-1">
          {ASSIGNEES.map((a) => (
            <button key={a} onClick={() => act().setAssignee(a)} aria-pressed={assignee === a} className={chip(assignee === a)}>
              {t(`filters.${a}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
