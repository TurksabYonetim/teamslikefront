// web/src/features/webinar/components/CapacityPanel.tsx
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge, Button, IconButton } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { webinarStore } from "../webinar.store";
import { registrationCapacity } from "../webinar.dom";
import { Card } from "./Card";

export function CapacityPanel() {
  const { t } = useTranslation("webinar");
  const event = useStore(webinarStore, (s) => s.events.find((e) => e.id === s.activeEventId)!);
  const registrations = useStore(webinarStore, (s) => s.registrations);
  const approve = (id: string) => webinarStore.getState().approveRegistration(id);
  const reject = (id: string) => webinarStore.getState().rejectRegistration(id);
  const admitNext = () => webinarStore.getState().admitNext();

  const cap = registrationCapacity(event, registrations);
  const pending = registrations.filter((r) => r.eventId === event.id && r.approval === "pending");

  return (
    <Card>
      <div className="mb-2 flex items-center gap-2">
        <h3 className="flex-1 text-base font-semibold text-ink">{t("cap.title")}</h3>
        {event.type === "townhall" ? <Badge tone="accent">{t("modeLabel.townhall")}</Badge> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm text-ink">
          <Icon name="usersThree" className="h-[18px] w-[18px] text-muted" />
          {t("cap.interactive")}: {cap.interactive.used}/{cap.interactive.limit}
          {cap.interactive.full ? <Badge tone="warning">{t("cap.full")}</Badge> : null}
        </div>
        {cap.viewOnly ? (
          <div className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm text-ink">
            <Icon name="tv" className="h-[18px] w-[18px] text-muted" />
            {t("cap.viewOnly")}: {cap.viewOnly.used}/{cap.viewOnly.limit}
          </div>
        ) : null}
        <div className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm text-ink">
          {t("cap.waitlist")}: {cap.waitlisted}
          {cap.waitlisted > 0 ? (
            <Button variant="ghost" size="sm" onClick={admitNext} leftIcon={<Icon name="arrowUp" className="h-4 w-4" />}>
              {t("cap.admitNext")}
            </Button>
          ) : null}
        </div>
      </div>

      {pending.length > 0 ? (
        <div className="mt-3 border-t border-line pt-3">
          <h4 className="mb-1.5 text-sm font-semibold text-muted">{t("cap.pending", { n: pending.length })}</h4>
          <ul className="space-y-1">
            {pending.map((r) => (
              <li key={r.id} className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm">
                <span className="min-w-0 flex-1 truncate text-ink">{r.values.name ?? r.id}</span>
                <IconButton label={t("cap.approve")} onClick={() => approve(r.id)}>
                  <Icon name="check" className="h-4 w-4" />
                </IconButton>
                <IconButton label={t("cap.reject")} onClick={() => reject(r.id)}>
                  <Icon name="close" className="h-4 w-4" />
                </IconButton>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
