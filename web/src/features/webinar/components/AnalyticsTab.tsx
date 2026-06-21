// web/src/features/webinar/components/AnalyticsTab.tsx
import { useTranslation } from "react-i18next";
import { useStore } from "@/lib/createStore";
import { webinarStore } from "../webinar.store";
import { pollsStore } from "../polls.store";
import { segmentAttendees } from "../webinar.dom";
import { Card } from "./Card";

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
      <div className="analytics-hero grid items-center gap-4 rounded-xl border border-line bg-surface p-4 sm:grid-cols-[auto_1fr]">
        <div className="ring-gauge" style={{ ["--pct"]: Math.round(seg.showRate * 100) } as React.CSSProperties}>
          <span className="ring-gauge__label tabular-nums">{Math.round(seg.showRate * 100)}%</span>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <div><div className="text-lg font-semibold tabular-nums text-ink">{seg.registered}</div><div className="text-xs text-muted">{t("analytics.registered")}</div></div>
          <div><div className="text-lg font-semibold tabular-nums text-ink">{seg.attended}</div><div className="text-xs text-muted">{t("analytics.attended")}</div></div>
          <div><div className="text-lg font-semibold tabular-nums text-ink">{seg.noShow}</div><div className="text-xs text-muted">{t("analytics.noShow")}</div></div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="mb-2 text-base font-semibold text-ink">{t("analytics.sources")}</h3>
          <ul className="space-y-2">
            {Object.entries(bySource).map(([src, n]) => (
              <li key={src} className="text-sm">
                <div className="mb-1 flex items-center justify-between"><span className="text-ink">{src}</span><span className="tabular-nums text-muted">{n}</span></div>
                <div className="source-bartrack"><div className="source-bar" style={{ ["--w"]: n / Math.max(1, ...Object.values(bySource)) } as React.CSSProperties} /></div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="mb-2 text-base font-semibold text-ink">{t("analytics.engagement")}</h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-muted">{t("analytics.liveAttendees")}</dt><dd className="tabular-nums text-ink">{attendees.toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">{t("analytics.pollVotes")}</dt><dd className="tabular-nums text-ink">{pollVotes}</dd></div>
          </dl>
          <p className="mt-2 text-sm text-muted">{t("analytics.intentNote")}</p>
        </Card>
      </div>
    </div>
  );
}
