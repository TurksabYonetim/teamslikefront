// web/src/features/webinar/components/EventLive.tsx
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { webinarStore } from "../webinar.store";
import { StageView } from "./StageView";
import { CaptionsLayer } from "./CaptionsLayer";
import { PollOverlay } from "./PollOverlay";
import { QnaBoard } from "./QnaBoard";
import { CtaBanner } from "./CtaBanner";

/** Attendee deneyimi — açık tema, yüksek kontrast yayın sahnesi. */
export function EventLive() {
  const { t } = useTranslation("webinar");
  const event = useStore(webinarStore, (s) => s.events.find((e) => e.id === s.activeEventId)!);
  const exitLive = () => webinarStore.getState().exitLive();

  return (
    <div className="space-y-3 overflow-x-hidden rounded-xl border border-line bg-surface p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <h1 className="min-w-0 truncate text-lg font-semibold text-ink sm:text-xl">{event.title}</h1>
        <Button variant="secondary" className="ml-auto shrink-0" onClick={exitLive} leftIcon={<Icon name="signOut" className="h-[18px] w-[18px]" />}>
          {t("exitLive")}
        </Button>
      </div>

      <CtaBanner />

      <div className="live-enter grid gap-3 sm:gap-4 lg:grid-cols-3">
        <div className="min-w-0 space-y-3 lg:col-span-2">
          <div className="min-h-[16rem] sm:min-h-[20rem] lg:h-[58dvh]">
            <StageView />
          </div>
          <CaptionsLayer />
        </div>
        <div className="min-w-0 space-y-3">
          <PollOverlay />
          <QnaBoard />
        </div>
      </div>
    </div>
  );
}
