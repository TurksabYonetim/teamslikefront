// web/src/features/webinar/components/AnalyticsTab.tsx
import { useTranslation } from "react-i18next";
import { useStore } from "@/lib/createStore";
import { webinarStore } from "../webinar.store";
import { pollsStore } from "../polls.store";
import { segmentAttendees } from "../webinar.dom";
import { Card, StatCard } from "./Card";

export function AnalyticsTab() {
  const { t } = useTranslation("webinar");
  const activeEventId = useStore(webinarStore, (s) => s.activeEventId);
  const allRegs = useStore(webinarStore, (s) => s.registrations);
  const attendees = useStore(webinarStore, (s) => s.attendees);
  const polls = useStore(pollsStore, (s) => s.polls);

  const registrations = allRegs.filter((r) => r.eventId === activeEventId);
  const seg = segmentAttendees(registrations);

  const bySource = registrations.reduce<Record<string, number>>((acc, r) => {
    const src = r.utm?.source ?? "direct";
    acc[src] = (acc[src] ?? 0) + 1;
    return acc;
  }, {});
  const pollVotes = polls.reduce((n, p) => n + p.options.reduce((m, o) => m + o.votes.length, 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t("analytics.registered")} value={String(seg.registered)} />
        <StatCard label={t("analytics.attended")} value={String(seg.attended)} />
        <StatCard label={t("analytics.noShow")} value={String(seg.noShow)} />
        <StatCard label={t("analytics.showRate")} value={`${Math.round(seg.showRate * 100)}%`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2 text-base font-semibold text-ink">{t("analytics.sources")}</h3>
          <ul className="space-y-1">
            {Object.entries(bySource).map(([src, n]) => (
              <li key={src} className="flex items-center gap-2 text-sm">
                <span className="flex-1 text-ink">{src}</span>
                <span className="text-muted">{n}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="mb-2 text-base font-semibold text-ink">{t("analytics.engagement")}</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-muted">{t("analytics.liveAttendees")}</dt><dd className="text-ink">{attendees.toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">{t("analytics.pollVotes")}</dt><dd className="text-ink">{pollVotes}</dd></div>
          </dl>
          <p className="mt-2 text-sm text-muted">{t("analytics.intentNote")}</p>
        </Card>
      </div>
    </div>
  );
}
