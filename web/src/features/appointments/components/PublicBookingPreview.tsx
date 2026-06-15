// web/src/features/appointments/components/PublicBookingPreview.tsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { useStore } from "@/lib/createStore";
import { inActiveWorkspace, useWorkspaceId } from "@/lib/tenantStore";
import { appointmentsStore } from "../appointments.store";
import { generateSlots } from "../slots";
import { Card } from "./Card";
import type { EventType } from "../appointments.types";

/**
 * Konsol içi "Genel Sayfa" önizlemesi: davetlinin göreceği herkese açık rezervasyon
 * akışının salt-okunur bir simülasyonu. Gerçek ağ yok — aktif çalışma alanına göre
 * süzülmüş etkinlik türleri + saf `generateSlots` ile beslenir.
 */
function fmtTime(ms: number): string {
  return new Date(ms).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function PublicBookingPreview() {
  const { t } = useTranslation("appointments");
  const allEventTypes = useStore(appointmentsStore, (s) => s.eventTypes);
  const schedules = useStore(appointmentsStore, (s) => s.schedules);
  const workspaceId = useWorkspaceId();

  const eventTypes = useMemo(
    () => allEventTypes.filter((e) => inActiveWorkspace(e.workspaceId, workspaceId)),
    [allEventTypes, workspaceId],
  );

  const [selected, setSelected] = useState<EventType | null>(null);

  // Önizleme için ilk müsait haftaiçi günü (yarından itibaren 14 gün tara).
  const previewDateISO = useMemo(() => {
    const sched = schedules[0];
    const open = new Set(sched?.rules.map((r) => r.weekday) ?? []);
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (open.has(d.getDay())) return d.toISOString().slice(0, 10);
    }
    return new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  }, [schedules]);

  const slots = useMemo(() => {
    if (!selected) return [];
    const sched = schedules.find((s) => s.ownerId === selected.ownerId) ?? schedules[0];
    if (!sched) return [];
    return generateSlots(sched, selected, previewDateISO).slice(0, 8);
  }, [selected, schedules, previewDateISO]);

  const dateLabel = new Date(`${previewDateISO}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Card className="overflow-hidden p-0">
      {/* Tarayıcı-kromu benzeri başlık: bunun bir genel sayfa olduğunu ima eder. */}
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
        </span>
        <span className="ml-2 inline-flex items-center gap-1.5 rounded-md bg-surface px-2 py-1 text-sm text-muted">
          <Icon name="globe" className="h-3.5 w-3.5" /> aura.dev/{selected?.slug ?? "you"}
        </span>
        <span className="ml-auto text-xs font-medium uppercase tracking-wide text-muted">{t("public.previewBadge")}</span>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2">
        {/* Sol: etkinlik türü seçimi */}
        <div>
          <h3 className="text-base font-semibold text-ink">{t("public.pickTitle")}</h3>
          <p className="mt-0.5 text-sm text-muted">{t("public.pickSubtitle")}</p>
          <ul className="mt-3 space-y-2">
            {eventTypes.map((et) => (
              <li key={et.id}>
                <button
                  onClick={() => setSelected(et)}
                  aria-pressed={selected?.id === et.id}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-[background-color,border-color,transform] duration-150 ease-[var(--ease-out)] motion-safe:active:scale-[0.99]",
                    selected?.id === et.id ? "border-brand bg-surface-2" : "border-line hover:bg-surface-2",
                  )}
                >
                  <span className="h-8 w-1 rounded-full bg-brand" aria-hidden />
                  <span className="flex-1">
                    <span className="block text-base font-medium text-ink">{et.title}</span>
                    <span className="mt-0.5 flex items-center gap-1 text-sm text-muted">
                      <Icon name="clock" className="h-3.5 w-3.5" /> {t("minutes", { n: et.durationMin })}
                    </span>
                  </span>
                  <Icon name="chevronRight" className="h-4 w-4 text-muted" />
                </button>
              </li>
            ))}
            {eventTypes.length === 0 && <li className="text-sm text-muted">{t("public.noTypes")}</li>}
          </ul>
        </div>

        {/* Sağ: seçilen tür için slot önizlemesi */}
        <div className="rounded-lg border border-line bg-surface-2 p-4">
          {selected ? (
            <>
              <div className="text-base font-semibold text-ink">{selected.title}</div>
              <div className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
                <Icon name="calendar" className="h-3.5 w-3.5" /> {dateLabel}
              </div>
              {slots.length > 0 ? (
                <div className="tl-stagger mt-3 grid grid-cols-3 gap-2">
                  {slots.map((s) => (
                    <span
                      key={s.startMs}
                      className="grid h-9 place-items-center rounded-md border border-brand/40 bg-surface text-sm font-medium text-brand"
                    >
                      {fmtTime(s.startMs)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted">{t("noSlots")}</p>
              )}
            </>
          ) : (
            <div className="grid h-full min-h-32 place-items-center text-center text-sm text-muted">
              <span>
                <Icon name="calendar" className="mx-auto mb-2 h-5 w-5" />
                {t("public.selectHint")}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
