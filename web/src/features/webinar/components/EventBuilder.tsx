// web/src/features/webinar/components/EventBuilder.tsx
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { useStore } from "@/lib/createStore";
import { webinarStore } from "../webinar.store";
import { eventStatus } from "../webinar.dom";
import { Card } from "./Card";
import type { EventType } from "../webinar.types";

const MODES: EventType[] = ["live", "simulive", "evergreen", "ondemand", "townhall"];

/** Durum → AAA pill tonu (canlı yeşil, yaklaşan mavi, biten nötr). */
const STATUS_PILL: Record<string, string> = {
  live: "bg-green-100 text-green-900",
  upcoming: "bg-blue-100 text-blue-900",
};

export function EventBuilder() {
  const { t } = useTranslation("webinar");
  const event = useStore(webinarStore, (s) => s.events.find((e) => e.id === s.activeEventId)!);
  const mode = useStore(webinarStore, (s) => s.mode);
  const setMode = (m: EventType) => webinarStore.getState().setMode(m);

  const st = eventStatus(event.startsAt, event.durationSec);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="mb-3 text-base font-semibold text-ink">{t("details")}</h3>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-muted">{t("title")}</dt>
            <dd className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
              {event.title}
              <span className={clsx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", STATUS_PILL[st] ?? "bg-surface-3 text-ink-2")}>
                {st === "live" ? <span className="h-1.5 w-1.5 rounded-full bg-green-600 motion-safe:animate-pulse" aria-hidden /> : null}
                {t(`status.${st}`)}
              </span>
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-muted">{t("mode")}</dt>
            <dd className="inline-flex flex-wrap overflow-hidden rounded-lg border border-line" role="group" aria-label={t("mode")}>
              {MODES.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                  className={clsx(
                    "h-9 px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none",
                    i > 0 && "border-l border-line",
                    mode === m ? "bg-blue-800 text-white" : "bg-surface text-ink-2 hover:bg-surface-2",
                  )}
                >
                  {t(`modeLabel.${m}`)}
                </button>
              ))}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted">{t("capacity")}</dt>
            <dd className="text-base font-semibold tabular-nums text-ink">{event.capacity.toLocaleString()}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted">{t("brand")}</dt>
            <dd className="inline-flex items-center gap-2">
              <span className="inline-block h-6 w-6 rounded-md border border-line" style={{ background: event.branding.accent }} aria-hidden />
              <span className="font-mono text-sm text-ink">{event.branding.accent}</span>
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h3 className="mb-2 text-base font-semibold text-ink">{t("sessions")}</h3>
        {event.sessions.length > 0 ? (
          <>
            <div className="mb-2 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-surface text-blue-800 ring-1 ring-blue-200">
                <Icon name="calendar" className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">{event.sessions[0].title}</span>
                <span className="text-xs text-blue-900">
                  {t("upNext")} · {new Date(event.sessions[0].startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </span>
            </div>
            <ul className="space-y-1">
              {event.sessions.slice(1).map((s) => (
                <li key={s.id} className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm">
                  <Icon name="calendar" className="h-4 w-4 text-muted" />
                  <span className="flex-1 text-ink">{s.title}</span>
                  <span className="tabular-nums text-muted">
                    {new Date(s.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </Card>
    </div>
  );
}
