// web/src/features/appointments/components/EventTypeList.tsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { Badge, Button, IconButton } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { inActiveWorkspace, useWorkspaceId } from "@/lib/tenantStore";
import { appointmentsStore } from "../appointments.store";
import { Card } from "./Card";

export function EventTypeList() {
  const { t } = useTranslation("appointments");
  const allEventTypes = useStore(appointmentsStore, (s) => s.eventTypes);
  const activeId = useStore(appointmentsStore, (s) => s.activeEventTypeId);
  const workspaceId = useWorkspaceId();
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);

  // Aktif çalışma alanına göre süz (null = tüm alanlar). Global (workspaceId yok)
  // türler her alanda görünür.
  const eventTypes = useMemo(
    () => allEventTypes.filter((e) => inActiveWorkspace(e.workspaceId, workspaceId)),
    [allEventTypes, workspaceId],
  );

  // Çalışma alanı değişince aktif seçim kapsam dışı kaldıysa otomatik yeniden seç.
  useEffect(() => {
    if (eventTypes.length === 0) return;
    if (!eventTypes.some((e) => e.id === activeId)) {
      appointmentsStore.getState().setActiveEventType(eventTypes[0].id);
    }
  }, [eventTypes, activeId]);

  const setActive = (id: string) => appointmentsStore.getState().setActiveEventType(id);
  const remove = (id: string) => appointmentsStore.getState().removeEventType(id);
  const add = () => {
    if (!title.trim()) return;
    appointmentsStore.getState().addEventType({ title: title.trim(), durationMin: duration });
    setTitle("");
  };

  return (
    <Card>
      <h3 className="mb-2 text-base font-semibold text-ink">{t("eventTypes")}</h3>
      <ul className="space-y-1.5">
        {eventTypes.map((et) => (
          <li key={et.id} className="flex items-stretch gap-1.5">
            <button
              onClick={() => setActive(et.id)}
              aria-current={activeId === et.id}
              className={clsx(
                "flex flex-1 flex-col gap-1 rounded-md border px-3 py-2 text-left",
                activeId === et.id ? "border-brand bg-surface-2" : "border-line hover:bg-surface-2",
              )}
            >
              <span className="text-sm font-semibold text-ink">{et.title}</span>
              <span className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <Icon name="clock" className="h-3.5 w-3.5" /> {t("minutes", { n: et.durationMin })}
                <Badge tone="neutral">
                  <Icon name={et.assignment === "roundrobin" ? "users" : "userCircle"} className="h-3 w-3" />
                  {t(`assignment.${et.assignment}`)}
                </Badge>
              </span>
              <span className="truncate text-xs text-muted">aura.dev/{et.slug}</span>
            </button>
            <IconButton
              label={t("removeEventType")}
              variant="ghost"
              disabled={eventTypes.length <= 1}
              onClick={() => remove(et.id)}
            >
              <Icon name="trash" className="h-4 w-4" />
            </IconButton>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-line pt-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePh")}
          aria-label={t("titlePh")}
          className="input h-11 flex-1"
        />
        <input
          type="number"
          min={5}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          aria-label={t("duration")}
          className="input h-11 w-20"
        />
        <Button onClick={add} leftIcon={<Icon name="plus" className="h-4 w-4" />}>{t("addEventType")}</Button>
      </div>
    </Card>
  );
}
