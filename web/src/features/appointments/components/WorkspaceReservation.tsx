// web/src/features/appointments/components/WorkspaceReservation.tsx
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { Badge, Button, DateField, IconButton } from "@/components/ui";
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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="min-w-0 space-y-4 lg:col-span-2">
        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-1 text-base font-semibold text-ink">
              <Icon name="desk" className="h-[18px] w-[18px]" /> {t("workspace.desks")}
            </h3>
            <Badge tone={occ >= 80 ? "danger" : occ >= 50 ? "warning" : "positive"}>{t("workspace.occupancy")} %{occ}</Badge>
          </div>

          <div className="mb-3 space-y-3">
            {/* Tarih: mobilde etiket üstte + input tam genişlik; sm+ yan yana. */}
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink sm:flex-row sm:items-center sm:gap-2">
              <span className="shrink-0">{t("workspace.date")}</span>
              <DateField
                value={dateISO}
                onChange={(v) => act().setDate(v)}
                aria-label={t("workspace.date")}
                className="w-full sm:w-44"
              />
            </label>
            {/* Slot seçici: tam genişlik 3 eşit hücre — dar ekranda taşmaz, simetrik. */}
            <div className="grid grid-cols-3 overflow-hidden rounded-md border border-line" role="group" aria-label={t("workspace.slot")}>
              {SLOTS.map((k) => (
                <button
                  key={k}
                  aria-pressed={slot === k}
                  onClick={() => act().setSlot(k)}
                  className={clsx(
                    "inline-flex min-h-10 items-center justify-center border-l border-line px-2 py-1.5 text-center text-xs leading-tight transition-colors duration-150 ease-[var(--ease-out)] first:border-l-0 sm:text-sm",
                    slot === k ? "bg-brand text-white" : "bg-surface text-ink hover:bg-surface-2",
                  )}
                >
                  {t(SLOT_KEY[k])}
                </button>
              ))}
            </div>
          </div>

          <ul className="divide-y divide-line">
            {avail.map((d) => (
              <li key={d.id} className={clsx("flex items-center gap-3 py-2.5", !d.free && "opacity-90")}>
                {/* Durum ikon-çipi: boş = marka tonu (davetkâr), dolu = nötr gri. */}
                <span
                  className={clsx(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                    d.free ? "bg-brand/10 text-brand" : "bg-surface-3 text-muted",
                  )}
                  aria-hidden
                >
                  <Icon name={d.kind === "room" ? "room" : "desk"} className="h-[18px] w-[18px]" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-ink">{d.label}</span>
                    {d.kind === "room" ? (
                      <span className="shrink-0 rounded-full bg-surface-3 px-1.5 py-0.5 text-[11px] font-medium text-ink-2">
                        {t("workspace.capacity", { n: d.capacity })}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                    <Icon name="pin" className="h-3 w-3 shrink-0" />
                    <span className="truncate">{d.zone}</span>
                  </div>
                  {d.amenities.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {d.amenities.slice(0, 2).map((a) => (
                        <span key={a} className="rounded-md bg-surface-3 px-1.5 py-0.5 text-[11px] text-ink-2">{a}</span>
                      ))}
                      {d.amenities.length > 2 ? (
                        <span className="rounded-md bg-surface-3 px-1.5 py-0.5 text-[11px] text-muted">+{d.amenities.length - 2}</span>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="shrink-0">
                  {d.free ? (
                    <Button variant="secondary" size="sm" onClick={() => act().reserve(d.id)}>{t("workspace.reserve")}</Button>
                  ) : (
                    <Badge tone="neutral">
                      {t("workspace.taken")}<span className="hidden sm:inline">: {name(d.takenBy!.userId)}</span>
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="min-w-0 lg:col-span-1">
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
