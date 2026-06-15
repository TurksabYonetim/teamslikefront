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

/** Attendee deneyimi — koyu yüksek kontrast sahne. */
export function EventLive() {
  const { t } = useTranslation("webinar");
  const event = useStore(webinarStore, (s) => s.events.find((e) => e.id === s.activeEventId)!);
  const exitLive = () => webinarStore.getState().exitLive();

  return (
    <div data-theme="dark" className="space-y-3 rounded-xl bg-surface p-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold text-white">{event.title}</h1>
        <Button variant="secondary" className="ml-auto" onClick={exitLive} leftIcon={<Icon name="signOut" className="h-[18px] w-[18px]" />}>
          {t("exitLive")}
        </Button>
      </div>

      <CtaBanner />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="h-[58vh]">
            <StageView />
          </div>
          <CaptionsLayer />
        </div>
        <div className="space-y-3">
          <PollOverlay />
          <QnaBoard />
        </div>
      </div>
    </div>
  );
}
