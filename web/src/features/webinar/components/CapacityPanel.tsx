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

  // Doluluk halkası — etkileşimli koltukların doluluğu (gauge salt dekoratif,
  // gerçek sayılar lejantta metin olarak verilir; r≈15.915 → çevre ≈ 100).
  const used = cap.interactive.used;
  const limit = cap.interactive.limit;
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const free = Math.max(0, limit - used);

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="flex-1 text-base font-semibold text-ink">{t("cap.title")}</h3>
        {event.type === "townhall" ? <Badge tone="accent">{t("modeLabel.townhall")}</Badge> : null}
        {cap.interactive.full ? <Badge tone="warning">{t("cap.full")}</Badge> : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <svg viewBox="0 0 36 36" className="h-16 w-16 flex-none -rotate-90" role="img" aria-label={`${t("cap.interactive")}: ${used}/${limit}`}>
          <circle cx="18" cy="18" r="15.915" fill="none" className="stroke-surface-3" strokeWidth="4" />
          <circle cx="18" cy="18" r="15.915" fill="none" className="stroke-blue-700" strokeWidth="4" strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
        </svg>
        <dl className="space-y-0.5 text-sm">
          <div className="flex items-center gap-2">
            <dt className="inline-flex items-center gap-1.5 text-muted">
              <span className="h-2 w-2 rounded-full bg-blue-700" aria-hidden /> {t("cap.interactive")}
            </dt>
            <dd className="tabular-nums text-ink">
              {used.toLocaleString()} / {limit.toLocaleString()}
            </dd>
          </div>
          {cap.viewOnly ? (
            <div className="flex items-center gap-2">
              <dt className="inline-flex items-center gap-1.5 text-muted">
                <Icon name="tv" className="h-4 w-4" /> {t("cap.viewOnly")}
              </dt>
              <dd className="tabular-nums text-ink">
                {cap.viewOnly.used.toLocaleString()} / {cap.viewOnly.limit.toLocaleString()}
              </dd>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <dt className="inline-flex items-center gap-1.5 text-muted">
                <span className="h-2 w-2 rounded-full bg-surface-3" aria-hidden /> {t("cap.free")}
              </dt>
              <dd className="tabular-nums text-ink">{free.toLocaleString()}</dd>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <dt className="text-muted">{t("cap.waitlist")}</dt>
            <dd className="tabular-nums text-ink">{cap.waitlisted}</dd>
            {cap.waitlisted > 0 ? (
              <Button variant="ghost" size="sm" onClick={admitNext} leftIcon={<Icon name="arrowUp" className="h-4 w-4" />}>
                {t("cap.admitNext")}
              </Button>
            ) : null}
          </div>
        </dl>
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
