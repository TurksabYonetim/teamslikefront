// web/src/features/appointments/components/WorkspaceReservation.tsx
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { Badge, Button, IconButton } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { workspaceStore } from "../workspace.store";
import { deskAvailability, occupancyRate } from "../appointments.workspace";
import { HOST_NAMES, ME_ID } from "../appointments.data";
import { Card } from "./Card";
import type { DeskSlot } from "../appointments.types";

const SLOTS: DeskSlot[] = ["am", "pm", "full"];
const SLOT_KEY: Record<DeskSlot, string> = {
  am: "workspace.slotAm",
  pm: "workspace.slotPm",
  full: "workspace.slotFull",
};
const name = (id: string) => HOST_NAMES[id] ?? id;

const inputCls = "input h-10";

export function WorkspaceReservation() {
  const { t } = useTranslation("appointments");
  const desks = useStore(workspaceStore, (s) => s.desks);
  const reservations = useStore(workspaceStore, (s) => s.reservations);
  const dateISO = useStore(workspaceStore, (s) => s.dateISO);
  const slot = useStore(workspaceStore, (s) => s.slot);
  const act = workspaceStore.getState;

  const avail = deskAvailability(desks, reservations, dateISO, slot);
  const occ = Math.round(occupancyRate(desks, reservations, dateISO) * 100);
  // "Rezervasyonlarım" = yalnız benimkiler; başkalarınınki sol ızgarada "Dolu: isim" olarak görünür.
  const mine = reservations.filter((r) => r.dateISO === dateISO && r.userId === ME_ID).slice().sort((a, b) => a.deskId.localeCompare(b.deskId));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-1 text-base font-semibold text-ink">
              <Icon name="desk" className="h-[18px] w-[18px]" /> {t("workspace.desks")}
            </h3>
            <Badge tone={occ >= 80 ? "danger" : occ >= 50 ? "warning" : "positive"}>{t("workspace.occupancy")} %{occ}</Badge>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              {t("workspace.date")}
              <input type="date" value={dateISO} onChange={(e) => act().setDate(e.target.value)} aria-label={t("workspace.date")} className={inputCls} />
            </label>
            <div className="inline-flex overflow-hidden rounded-md border border-line" role="group" aria-label={t("workspace.slot")}>
              {SLOTS.map((k) => (
                <button
                  key={k}
                  aria-pressed={slot === k}
                  onClick={() => act().setSlot(k)}
                  className={clsx("inline-flex h-10 items-center px-3 text-sm", slot === k ? "bg-brand text-white" : "bg-surface text-ink")}
                >
                  {t(SLOT_KEY[k])}
                </button>
              ))}
            </div>
          </div>

          <ul className="divide-y divide-line">
            {avail.map((d) => (
              <li key={d.id} className="flex items-center gap-2 py-2">
                <Icon name={d.kind === "room" ? "room" : "desk"} className="h-[18px] w-[18px] text-muted" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-ink-2">
                    {d.label}{d.kind === "room" ? ` · ${t("workspace.capacity", { n: d.capacity })}` : ""}
                  </div>
                  <div className="flex items-center gap-1 truncate text-sm text-muted">
                    <Icon name="pin" className="h-3.5 w-3.5" /> {d.zone}{d.amenities.length ? ` · ${d.amenities.join(", ")}` : ""}
                  </div>
                </div>
                {d.free ? (
                  <Button variant="secondary" size="sm" onClick={() => act().reserve(d.id)}>{t("workspace.reserve")}</Button>
                ) : (
                  <Badge tone="neutral">{t("workspace.taken")}: {name(d.takenBy!.userId)}</Badge>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="lg:col-span-1">
        <h3 className="mb-2 text-base font-semibold text-ink">{t("workspace.mine")}</h3>
        {mine.length === 0 ? (
          <p className="text-sm text-ink-2">{t("workspace.mineEmpty")}</p>
        ) : (
          <ul className="divide-y divide-line">
            {mine.map((r) => {
              const desk = desks.find((d) => d.id === r.deskId);
              return (
                <li key={r.id} className="flex items-center gap-2 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-ink-2">{desk?.label ?? r.deskId}</div>
                    <div className="truncate text-sm text-muted">{name(r.userId)} · {t(SLOT_KEY[r.slot])}</div>
                  </div>
                  {r.checkedIn ? (
                    <Badge tone="positive">{t("workspace.checkedIn")}</Badge>
                  ) : (
                    <IconButton label={t("workspace.checkIn")} onClick={() => act().checkIn(r.id)}>
                      <Icon name="checkCircle" className="h-4 w-4" />
                    </IconButton>
                  )}
                  <IconButton label={t("workspace.release")} onClick={() => act().cancel(r.id)}>
                    <Icon name="close" className="h-4 w-4" />
                  </IconButton>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
