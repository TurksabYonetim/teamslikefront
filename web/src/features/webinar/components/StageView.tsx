// web/src/features/webinar/components/StageView.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { webinarStore } from "../webinar.store";
import { simulivePosition } from "../webinar.dom";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function StageView() {
  const { t } = useTranslation("webinar");
  const event = useStore(webinarStore, (s) => s.events.find((e) => e.id === s.activeEventId)!);
  const mode = useStore(webinarStore, (s) => s.mode);
  const attendees = useStore(webinarStore, (s) => s.attendees);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const pos = simulivePosition(event.startsAt, now, event.durationSec);
  const liveBadge = mode === "live";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        {pos.live ? (
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
          </span>
        ) : null}
        <Badge tone={pos.live ? "danger" : "neutral"}>
          <Icon name="broadcast" className="h-3.5 w-3.5" /> {liveBadge ? t("live") : t(`modeLabel.${mode}`)}
        </Badge>
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted" aria-label={t("attendeeCount", { count: attendees })}>
          <Icon name="usersThree" className="h-4 w-4" aria-hidden /> {attendees.toLocaleString()}
        </span>
      </div>

      <div className="group flex flex-1 flex-col items-center justify-center gap-2 bg-surface-2 p-4 text-center sm:gap-3 sm:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white transition-transform duration-[var(--dur-pop)] ease-[var(--ease-out)] motion-safe:group-hover:scale-105 sm:h-16 sm:w-16">
          <Icon name="play" className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <div className="min-w-0 max-w-full truncate text-lg font-semibold text-ink sm:text-xl">{event.title}</div>
        <div className="min-w-0 max-w-full truncate text-sm text-muted">{event.sessions[0]?.title}</div>
      </div>

      <div className="border-t border-line px-3 py-2" aria-label={t("timeline")}>
        <div className="h-2 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full bg-brand" style={{ width: `${pos.pct}%` }} aria-hidden />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>{fmt(pos.elapsedSec)}</span>
          <span>{fmt(event.durationSec)}</span>
        </div>
      </div>
    </div>
  );
}
