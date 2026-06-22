// web/src/features/appointments/components/AvailabilityEditor.tsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateField, TimeField } from "@/components/ui";
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

  const availBody = (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">{t("tabs.availability")}</h3>
        <TimezonePicker value={schedule.timezone} onChange={setTz} />
      </div>
      <ul className="tl-stagger space-y-1.5">
        {WEEKDAYS.map((wd) => {
          const rule = schedule.rules.find((r) => r.weekday === wd);
          const dayName = t(`weekday.${wd}`);
          return (
            <li key={wd} className="flex flex-wrap items-center gap-2 text-sm">
              <label className="flex w-full items-center gap-2 sm:w-28">
                <input type="checkbox" checked={!!rule} onChange={() => toggleDay(wd)} className="checkbox" />
                <span className={rule ? "text-ink" : "text-muted"}>{dayName}</span>
              </label>
              {rule ? (
                <span className="flex min-w-0 flex-1 items-center gap-1.5">
                  <TimeField value={toHHMM(rule.startMin)} onChange={(v) => setTime(wd, "startMin", v)} aria-label={`${dayName} ${t("startTime")}`} />
                  <span className="text-muted">–</span>
                  <TimeField value={toHHMM(rule.endMin)} onChange={(v) => setTime(wd, "endMin", v)} aria-label={`${dayName} ${t("endTime")}`} />
                </span>
              ) : (
                <span className="text-muted">{t("closed")}</span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );

  const fmtTime = (ms: number) => new Date(ms).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const morningSlots = slots.filter((s) => new Date(s.startMs).getHours() < 12);
  const afternoonSlots = slots.filter((s) => new Date(s.startMs).getHours() >= 12);
  const stepDay = (delta: number) => {
    const [y, mo, d] = previewDate.split("-").map(Number);
    const dt = new Date(y, mo - 1, d + delta);
    setPreviewDate(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`);
  };
  const prettyDate = (() => {
    const [y, mo, d] = previewDate.split("-").map(Number);
    return new Date(y, mo - 1, d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "short" });
  })();
  const navBtn =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-2 transition-[transform,border-color,background-color] duration-[var(--dur-press)] ease-[var(--ease-out)] hover:border-gray-400 hover:bg-surface-2 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>{availBody}</Card>

      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-ink">{t("slotsPreview")}</h3>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => stepDay(-1)} aria-label={t("prevDay", { defaultValue: "Önceki gün" })} className={navBtn}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <DateField value={previewDate} onChange={setPreviewDate} aria-label={t("pickDate")} className="w-36" />
            <button type="button" onClick={() => stepDay(1)} aria-label={t("nextDay", { defaultValue: "Sonraki gün" })} className={navBtn}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {eventType ? <span className="text-muted">{eventType.title} · {t("minutes", { n: eventType.durationMin })}</span> : null}
          <span className="font-medium text-ink-2">{prettyDate}</span>
          {slots.length > 0 ? (
            <span className="inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-800 tabular-nums">
              {t("availableCount", { n: slots.length, defaultValue: "{{n}} uygun" })}
            </span>
          ) : null}
        </div>

        {slots.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2 text-ink-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" /></svg>
            </span>
            <p className="text-sm text-muted">{t("noSlots")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {morningSlots.length > 0 ? (
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-muted" aria-hidden="true"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" strokeLinecap="round" /></svg>
                  {t("morning", { defaultValue: "Sabah" })}
                </div>
                <div className="tl-stagger flex flex-wrap gap-1.5">
                  {morningSlots.map((s) => (
                    <span key={s.startMs} className="inline-flex min-h-9 items-center rounded-lg border border-line bg-blue-50/60 px-3 py-1.5 text-sm font-medium text-ink tabular-nums">
                      {fmtTime(s.startMs)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {afternoonSlots.length > 0 ? (
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-muted" aria-hidden="true"><path d="M3 18h18M5 18a7 7 0 0 1 14 0M12 4v3M5 8L4 7M19 8l1-1" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {t("afternoon", { defaultValue: "Öğleden sonra" })}
                </div>
                <div className="tl-stagger flex flex-wrap gap-1.5">
                  {afternoonSlots.map((s) => (
                    <span key={s.startMs} className="inline-flex min-h-9 items-center rounded-lg border border-line bg-blue-50/60 px-3 py-1.5 text-sm font-medium text-ink tabular-nums">
                      {fmtTime(s.startMs)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
}
