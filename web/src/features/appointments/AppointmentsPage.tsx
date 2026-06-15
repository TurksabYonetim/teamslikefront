// web/src/features/appointments/AppointmentsPage.tsx
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import type { IconName } from "@/components/Icon";
import { Forbidden } from "@/components/ui";
import { useCan } from "@/lib/authStore";
import { useStore } from "@/lib/createStore";
import { appointmentsStore } from "./appointments.store";
import { EventTypeList } from "./components/EventTypeList";
import { EventTypeEditor } from "./components/EventTypeEditor";
import { AvailabilityEditor } from "./components/AvailabilityEditor";
import { BookingsCalendar } from "./components/BookingsCalendar";
import { WorkspaceReservation } from "./components/WorkspaceReservation";
import { PublicBookingPreview } from "./components/PublicBookingPreview";

/** Üst seviye görünüm: konsol / herkese açık sayfa önizlemesi / çalışma alanı. */
type Surface = "console" | "public" | "workspace";
const SURFACES: { id: Surface; icon: IconName }[] = [
  { id: "console", icon: "sliders" },
  { id: "public", icon: "globe" },
  { id: "workspace", icon: "desk" },
];

/** Konsol içi alt sekmeler (etkinlik türü / müsaitlik / takvim). */
type ConsoleTab = "eventTypes" | "availability" | "calendar";
const CONSOLE_TABS: { id: ConsoleTab; icon: IconName }[] = [
  { id: "eventTypes", icon: "clock" },
  { id: "availability", icon: "calendar" },
  { id: "calendar", icon: "calendar" },
];

export function AppointmentsPage() {
  const { t } = useTranslation("appointments");
  const canView = useCan("scheduling.view");

  const [surface, setSurface] = useState<Surface>("console");
  const [tab, setTab] = useState<ConsoleTab>("eventTypes");
  const surfaceRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Deep-link the active event type (?type=) — shareable + reload-safe.
  const activeEventTypeId = useStore(appointmentsStore, (s) => s.activeEventTypeId);
  const eventTypes = useStore(appointmentsStore, (s) => s.eventTypes);
  const [params, setParams] = useSearchParams();
  useEffect(() => {
    const urlId = params.get("type");
    if (urlId && urlId !== activeEventTypeId && eventTypes.some((e) => e.id === urlId)) {
      appointmentsStore.getState().setActiveEventType(urlId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (params.get("type") !== activeEventTypeId) {
      const next = new URLSearchParams(params);
      next.set("type", activeEventTypeId);
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEventTypeId]);

  if (!canView) return <Forbidden />;

  const onSurfaceKey = (e: KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % SURFACES.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + SURFACES.length) % SURFACES.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = SURFACES.length - 1;
    else return;
    e.preventDefault();
    const id = SURFACES[next].id;
    setSurface(id);
    surfaceRefs.current[id]?.focus();
  };

  const onTabKey = (e: KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % CONSOLE_TABS.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + CONSOLE_TABS.length) % CONSOLE_TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = CONSOLE_TABS.length - 1;
    else return;
    e.preventDefault();
    const id = CONSOLE_TABS[next].id;
    setTab(id);
    tabRefs.current[id]?.focus();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">{t("nav")}</h1>
        <p className="mt-1 text-base text-muted">{t("subtitle")}</p>
      </div>

      {/* Üst seviye yüzey seçici (konsol / genel sayfa / çalışma alanı). */}
      <div role="tablist" aria-label={t("surfaces.label")} className="inline-flex gap-1 rounded-lg border border-line bg-surface-2 p-1">
        {SURFACES.map(({ id, icon }, i) => (
          <button
            key={id}
            role="tab"
            ref={(el) => (surfaceRefs.current[id] = el)}
            aria-selected={surface === id}
            tabIndex={surface === id ? 0 : -1}
            onClick={() => setSurface(id)}
            onKeyDown={(e) => onSurfaceKey(e, i)}
            className={clsx(
              "inline-flex h-9 items-center gap-2 rounded-md px-3 text-base transition-[background-color,color,transform] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.98]",
              surface === id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            <Icon name={icon} className="h-[18px] w-[18px]" /> {t(`surfaces.${id}`)}
          </button>
        ))}
      </div>

      {surface === "console" ? (
        <>
          <div role="tablist" aria-label={t("nav")} className="flex flex-wrap gap-1 border-b border-line">
            {CONSOLE_TABS.map(({ id, icon }, i) => (
              <button
                key={id}
                role="tab"
                ref={(el) => (tabRefs.current[id] = el)}
                aria-selected={tab === id}
                tabIndex={tab === id ? 0 : -1}
                onClick={() => setTab(id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={clsx(
                  "inline-flex h-11 items-center gap-2 rounded-t-md border-b-2 px-3 text-base transition-[color,border-color] duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.98]",
                  tab === id ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink",
                )}
              >
                <Icon name={icon} className="h-[18px] w-[18px]" /> {t(`tabs.${id}`)}
              </button>
            ))}
          </div>

          <div key={tab} className="tl-fade">
            {tab === "eventTypes" ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <EventTypeList />
                <EventTypeEditor />
              </div>
            ) : tab === "availability" ? (
              <AvailabilityEditor />
            ) : (
              <BookingsCalendar />
            )}
          </div>
        </>
      ) : surface === "public" ? (
        <PublicBookingPreview />
      ) : (
        <WorkspaceReservation />
      )}
    </div>
  );
}
