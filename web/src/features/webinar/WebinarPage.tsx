// web/src/features/webinar/WebinarPage.tsx
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { Forbidden } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { useCan } from "@/lib/authStore";
import { webinarStore } from "./webinar.store";
import { useUrlSelection } from "./useUrlSelection";
import { EventConsole } from "./components/EventConsole";
import { EventLive } from "./components/EventLive";

export function WebinarPage() {
  const { t } = useTranslation("webinar");
  const canView = useCan("webinar.view");
  const phase = useStore(webinarStore, (s) => s.phase);
  const event = useStore(webinarStore, (s) => s.events.find((e) => e.id === s.activeEventId)!);
  const activeEventId = useStore(webinarStore, (s) => s.activeEventId);
  const events = useStore(webinarStore, (s) => s.events);

  // Deep-link the active event (?event=) — shareable + reload-safe.
  useUrlSelection({
    param: "event",
    selected: activeEventId,
    isValid: (id) => events.some((e) => e.id === id),
    onSelect: (id) => webinarStore.getState().setEvent(id),
  });

  if (!canView) return <Forbidden />;

  const goLive = () => webinarStore.getState().goLive();
  const exitLive = () => webinarStore.getState().exitLive();

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink">{t("nav")}</h1>
          <p className="mt-1 text-base text-muted">{event.title}</p>
        </div>
        <div className="inline-flex overflow-hidden rounded-md border border-line" role="tablist" aria-label={t("view")}>
          <button
            role="tab"
            aria-selected={phase === "console"}
            onClick={exitLive}
            className={clsx("inline-flex h-11 items-center gap-2 px-3 text-base", phase === "console" ? "bg-brand text-white" : "bg-surface text-ink")}
          >
            <Icon name="monitor" className="h-[18px] w-[18px]" /> {t("console")}
          </button>
          <button
            role="tab"
            aria-selected={phase === "live"}
            onClick={goLive}
            className={clsx("inline-flex h-11 items-center gap-2 px-3 text-base", phase === "live" ? "bg-brand text-white" : "bg-surface text-ink")}
          >
            <Icon name="tv" className="h-[18px] w-[18px]" /> {t("livePreview")}
          </button>
        </div>
      </div>

      {phase === "console" ? <EventConsole /> : <EventLive />}
    </div>
  );
}
