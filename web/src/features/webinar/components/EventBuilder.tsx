// web/src/features/webinar/components/EventBuilder.tsx
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { webinarStore } from "../webinar.store";
import { eventStatus } from "../webinar.dom";
import { Card } from "./Card";
import type { EventType } from "../webinar.types";

const MODES: EventType[] = ["live", "simulive", "evergreen", "ondemand", "townhall"];

export function EventBuilder() {
  const { t } = useTranslation("webinar");
  const event = useStore(webinarStore, (s) => s.events.find((e) => e.id === s.activeEventId)!);
  const mode = useStore(webinarStore, (s) => s.mode);
  const setMode = (m: EventType) => webinarStore.getState().setMode(m);

  const st = eventStatus(event.startsAt, event.durationSec);
  const statusTone = st === "live" ? "positive" : st === "upcoming" ? "accent" : "neutral";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="mb-3 text-base font-semibold text-ink">{t("details")}</h3>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-muted">{t("title")}</dt>
            <dd className="flex items-center gap-2 text-sm font-semibold text-ink">
              {event.title}
              <Badge tone={statusTone}>{t(`status.${st}`)}</Badge>
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-muted">{t("mode")}</dt>
            <dd className="flex flex-wrap gap-1.5">
              {MODES.map((m) => (
                <button
                  key={m}
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                  className={clsx(
                    "rounded-md border px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand",
                    mode === m ? "border-brand text-brand" : "border-line text-muted hover:bg-surface-2",
                  )}
                >
                  {t(`modeLabel.${m}`)}
                </button>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-muted">{t("capacity")}</dt>
            <dd className="text-ink">{event.capacity.toLocaleString()}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-muted">{t("brand")}</dt>
            <dd className="inline-flex items-center gap-2">
              <span className="inline-block h-5 w-5 rounded-sm border border-line" style={{ background: event.branding.accent }} aria-hidden />
              <span className="text-ink">{event.branding.accent}</span>
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h3 className="mb-2 text-base font-semibold text-ink">{t("sessions")}</h3>
        <ul className="space-y-1.5">
          {event.sessions.map((s) => (
            <li key={s.id} className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm">
              <Icon name="calendar" className="h-4 w-4 text-muted" />
              <span className="flex-1 text-ink">{s.title}</span>
              <Badge tone="neutral">{new Date(s.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
