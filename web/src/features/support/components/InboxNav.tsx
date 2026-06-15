// web/src/features/support/components/InboxNav.tsx
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { useStore } from "@/lib/createStore";
import { inboxStore, type AssigneeFilter, type StatusFilter } from "../inbox.store";
import { CHANNEL_ICON } from "../shared";

const STATUSES: StatusFilter[] = ["all", "open", "pending", "snoozed", "resolved"];
const ASSIGNEES: AssigneeFilter[] = ["all", "mine", "unassigned"];

const chip = (active: boolean) =>
  clsx("rounded-md border px-2 py-0.5 text-base", active ? "border-brand text-brand" : "border-line text-muted hover:bg-surface-2");

export function InboxNav() {
  const { t } = useTranslation("support");
  const inboxes = useStore(inboxStore, (s) => s.inboxes);
  const activeInboxId = useStore(inboxStore, (s) => s.activeInboxId);
  const filterStatus = useStore(inboxStore, (s) => s.filterStatus);
  const assignee = useStore(inboxStore, (s) => s.assignee);
  const act = inboxStore.getState;

  const inboxBtn = (active: boolean) =>
    clsx("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-base", active ? "bg-surface-2 text-ink" : "text-muted hover:bg-surface-2");

  return (
    <div className="flex flex-col gap-3 overflow-y-auto rounded-xl border border-line bg-surface p-3">
      <div>
        <h3 className="mb-1 text-base font-semibold text-muted">{t("inboxesHeader")}</h3>
        <ul className="space-y-0.5">
          <li>
            <button onClick={() => act().setInbox(null)} aria-current={activeInboxId === null ? "page" : undefined} className={inboxBtn(activeInboxId === null)}>
              <Icon name="inbox" className="h-4 w-4" /> {t("allInboxes")}
            </button>
          </li>
          {inboxes.map((ib) => (
            <li key={ib.id}>
              <button onClick={() => act().setInbox(ib.id)} aria-current={activeInboxId === ib.id ? "page" : undefined} className={inboxBtn(activeInboxId === ib.id)}>
                <Icon name={CHANNEL_ICON[ib.channelType]} className="h-4 w-4" /> <span className="truncate">{ib.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-1 text-base font-semibold text-muted">{t("filterHeader")}</h3>
        <div className="flex flex-wrap gap-1">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => act().setFilter(s)} aria-pressed={filterStatus === s} className={chip(filterStatus === s)}>
              {s === "all" ? t("filters.all") : t(`status.${s}`)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-base font-semibold text-muted">{t("assigneeHeader")}</h3>
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
