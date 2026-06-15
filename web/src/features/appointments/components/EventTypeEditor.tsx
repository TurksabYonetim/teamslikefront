// web/src/features/appointments/components/EventTypeEditor.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge, Button, useToast } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { appointmentsStore } from "../appointments.store";
import { HOST_NAMES } from "../appointments.data";
import { Card } from "./Card";
import type { AssignmentMode, MeetingLocation } from "../appointments.types";

const ASSIGNMENTS: AssignmentMode[] = ["solo", "roundrobin", "collective"];
const LOCATIONS: MeetingLocation[] = ["aura_meet", "phone", "in_person"];

interface Draft {
  title: string;
  durationMin: number;
  bufferBefore: number;
  bufferAfter: number;
  minNoticeMin: number;
  location: MeetingLocation;
  assignment: AssignmentMode;
}

type NumField = "durationMin" | "bufferBefore" | "bufferAfter" | "minNoticeMin";

const fieldCls =
  "h-11 rounded-md border border-line bg-surface px-2 text-base text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand";

export function EventTypeEditor() {
  const { t } = useTranslation("appointments");
  const et = useStore(appointmentsStore, (s) => s.eventTypes.find((e) => e.id === s.activeEventTypeId) ?? null);
  const toast = useToast();

  const [draft, setDraft] = useState<Draft | null>(null);
  useEffect(() => {
    if (!et) {
      setDraft(null);
      return;
    }
    setDraft({
      title: et.title,
      durationMin: et.durationMin,
      bufferBefore: et.bufferBefore,
      bufferAfter: et.bufferAfter,
      minNoticeMin: et.minNoticeMin,
      location: et.location,
      assignment: et.assignment,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [et?.id]);

  if (!et || !draft) return null;

  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const num = (label: string, key: NumField) => (
    <label className="flex flex-col gap-1 text-base text-muted">
      {label}
      <input
        type="number"
        min={0}
        value={draft[key]}
        onChange={(e) => setField(key, Number(e.target.value))}
        className={`w-24 ${fieldCls}`}
      />
    </label>
  );

  const save = () => {
    appointmentsStore.getState().updateEventType(et.id, { ...draft, title: draft.title.trim() || et.title });
    toast.show({ message: t("saved"), variant: "success" });
  };

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="flex-1 text-base font-semibold text-ink">{et.title}</h3>
        <Badge tone="accent">{t(`assignment.${draft.assignment}`)}</Badge>
      </div>

      <div className="space-y-3">
        <label className="flex flex-col gap-1 text-base text-muted">
          {t("titlePh")}
          <input value={draft.title} onChange={(e) => setField("title", e.target.value)} className={fieldCls} />
        </label>

        <div className="flex flex-wrap gap-3">
          {num(t("duration"), "durationMin")}
          {num(t("bufferBefore"), "bufferBefore")}
          {num(t("bufferAfter"), "bufferAfter")}
          {num(t("minNotice"), "minNoticeMin")}
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-1 text-base text-muted">
            {t("locationLabel")}
            <select
              value={draft.location}
              onChange={(e) => setField("location", e.target.value as MeetingLocation)}
              className={fieldCls}
            >
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{t(`location.${l}`)}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-base text-muted">
            {t("assignmentLabel")}
            <select
              value={draft.assignment}
              onChange={(e) => setField("assignment", e.target.value as AssignmentMode)}
              className={fieldCls}
            >
              {ASSIGNMENTS.map((a) => (
                <option key={a} value={a}>{t(`assignment.${a}`)}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="text-base text-muted">
          {t("hosts")}: {et.hostIds.map((h) => HOST_NAMES[h] ?? h).join(", ")}
        </div>

        <Button onClick={save} leftIcon={<Icon name="check" className="h-4 w-4" />}>{t("save")}</Button>
      </div>
    </Card>
  );
}
