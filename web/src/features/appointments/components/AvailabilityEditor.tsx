// web/src/features/appointments/components/AvailabilityEditor.tsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@/lib/createStore";
import { appointmentsStore } from "../appointments.store";
import { generateSlots } from "../slots";
import { TimezonePicker } from "./TimezonePicker";
import { Card } from "./Card";
import type { HoursRule } from "../appointments.types";

// Pzt→Paz sırası (görsel); 0=Paz JS ile uyumlu kalır.
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0];
const DEFAULT_START = 540; // 09:00
const DEFAULT_END = 1020; // 17:00

const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const timeCls = "input h-10";

export function AvailabilityEditor() {
  const { t } = useTranslation("appointments");
  const schedule = useStore(appointmentsStore, (s) => s.schedules[0]);
  const eventType = useStore(appointmentsStore, (s) => s.eventTypes.find((e) => e.id === s.activeEventTypeId) ?? s.eventTypes[0] ?? null);
  const [previewDate, setPreviewDate] = useState(() => new Date().toISOString().slice(0, 10));

  const slots = useMemo(
    () => (schedule && eventType ? generateSlots(schedule, eventType, previewDate) : []),
    [schedule, eventType, previewDate],
  );

  if (!schedule) return null;

  const setRules = (rules: HoursRule[]) => appointmentsStore.getState().updateSchedule(schedule.id, { rules });
  const setTz = (timezone: string) => appointmentsStore.getState().updateSchedule(schedule.id, { timezone });
  const toggleDay = (wd: number) => {
    const exists = schedule.rules.some((r) => r.weekday === wd);
    setRules(
      exists
        ? schedule.rules.filter((r) => r.weekday !== wd)
        : [...schedule.rules, { weekday: wd, startMin: DEFAULT_START, endMin: DEFAULT_END }],
    );
  };
  const setTime = (wd: number, field: "startMin" | "endMin", hhmm: string) =>
    setRules(schedule.rules.map((r) => (r.weekday === wd ? { ...r, [field]: toMin(hhmm) } : r)));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-ink">{t("tabs.availability")}</h3>
          <TimezonePicker value={schedule.timezone} onChange={setTz} />
        </div>
        <ul className="space-y-1.5">
          {WEEKDAYS.map((wd) => {
            const rule = schedule.rules.find((r) => r.weekday === wd);
            const dayName = t(`weekday.${wd}`);
            return (
              <li key={wd} className="flex items-center gap-2 text-sm">
                <label className="flex w-28 items-center gap-2">
                  <input type="checkbox" checked={!!rule} onChange={() => toggleDay(wd)} className="checkbox" />
                  <span className={rule ? "text-ink" : "text-muted"}>{dayName}</span>
                </label>
                {rule ? (
                  <span className="flex items-center gap-1.5">
                    <input type="time" value={toHHMM(rule.startMin)} onChange={(e) => setTime(wd, "startMin", e.target.value)} aria-label={`${dayName} ${t("startTime")}`} className={timeCls} />
                    <span className="text-muted">–</span>
                    <input type="time" value={toHHMM(rule.endMin)} onChange={(e) => setTime(wd, "endMin", e.target.value)} aria-label={`${dayName} ${t("endTime")}`} className={timeCls} />
                  </span>
                ) : (
                  <span className="text-muted">{t("closed")}</span>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-ink">{t("slotsPreview")}</h3>
          <label className="flex items-center gap-2 text-sm text-muted">
            {t("pickDate")}
            <input type="date" value={previewDate} onChange={(e) => setPreviewDate(e.target.value)} className={timeCls} />
          </label>
        </div>
        {eventType ? (
          <div className="mb-2 text-sm text-muted">{eventType.title} · {t("minutes", { n: eventType.durationMin })}</div>
        ) : null}
        {slots.length === 0 ? (
          <p className="text-sm text-muted">{t("noSlots")}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {slots.map((s) => (
              <span key={s.startMs} className="rounded-md border border-line bg-surface-2 px-2 py-1 text-xs text-ink">
                {new Date(s.startMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
