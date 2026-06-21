// web/src/features/webinar/components/EventManager.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge, Button, IconButton, Select } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { webinarEventsStore } from "../webinarEvents.store";
import { agendaByDay, agendaConflicts, formatPrice, isSoldOut, ticketRevenue, ticketsRemaining } from "../webinarEvents";
import { EVENTS, REGISTRATIONS } from "../webinar.data";
import { Card } from "./Card";

const CURRENCIES = ["USD", "EUR", "TRY", "GBP"];
const BADGE_FIELDS = ["name", "email", "company", "role"];

const fieldLabel = (id: string) => EVENTS[0].registrationFields.find((f) => f.id === id)?.label ?? id;

const inputCls = "input";

export function EventManager() {
  const { t } = useTranslation("webinar");
  const tiers = useStore(webinarEventsStore, (s) => s.tiers);
  const agenda = useStore(webinarEventsStore, (s) => s.agenda);
  const badge = useStore(webinarEventsStore, (s) => s.badge);
  const printQueue = useStore(webinarEventsStore, (s) => s.printQueue);
  const a = webinarEventsStore.getState();

  const revenue = ticketRevenue(tiers);
  const days = agendaByDay(agenda);
  const conflicts = agendaConflicts(agenda);
  const sample = REGISTRATIONS.find((r) => r.eventId === "ev_launch")!;
  const confirmedIds = REGISTRATIONS.filter((r) => r.eventId === "ev_launch").map((r) => r.id);

  // Bilet formu
  const [tName, setTName] = useState("");
  const [tCurrency, setTCurrency] = useState("USD");
  const [tPrice, setTPrice] = useState(0);
  const [tQty, setTQty] = useState(100);
  // Ajanda formu
  const [aDay, setADay] = useState("Day 1");
  const [aTrack, setATrack] = useState("Main stage");
  const [aStart, setAStart] = useState("11:00");
  const [aEnd, setAEnd] = useState("11:30");
  const [aTitle, setATitle] = useState("");

  return (
    <div className="grid gap-4 pb-8 lg:grid-cols-2 lg:items-stretch">
      {/* Biletleme */}
      <Card className="min-w-0 lg:col-span-2">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Icon name="ticket" className="h-5 w-5 text-brand" />
          <h2 className="text-base font-semibold text-ink">{t("events.tickets")}</h2>
          <div className="ml-auto flex flex-wrap gap-1">
            {Object.entries(revenue).map(([cur, amt]) => (
              <span key={cur} className="inline-flex shrink-0 items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium tabular-nums text-green-900">
                {formatPrice(amt, cur)}
              </span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="border-b border-line px-2 py-1 font-semibold">{t("events.tier")}</th>
                <th className="border-b border-line px-2 py-1 font-semibold">{t("events.price")}</th>
                <th className="border-b border-line px-2 py-1 font-semibold">{t("events.sold")}</th>
                <th className="border-b border-line px-2 py-1 font-semibold">{t("events.remaining")}</th>
                <th className="border-b border-line px-2 py-1" />
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => {
                const out = isSoldOut(tier);
                const pct = tier.quantity > 0 ? Math.min(100, Math.round((tier.sold / tier.quantity) * 100)) : 0;
                return (
                  <tr key={tier.id}>
                    <td className="border-b border-line px-2 py-1.5 text-ink">{tier.name}</td>
                    <td className="border-b border-line px-2 py-1.5 tabular-nums text-ink">
                      {tier.price === 0 ? t("events.free") : formatPrice(tier.price, tier.currency)}
                    </td>
                    <td className="border-b border-line px-2 py-1.5 text-ink">
                      <span className="tabular-nums">{tier.sold}/{tier.quantity}</span>
                      <span className="mt-1 block h-1 overflow-hidden rounded-full bg-surface-3" aria-hidden>
                        <span className={"block h-1 rounded-full " + (out ? "bg-red-600" : "bg-blue-700")} style={{ width: `${pct}%` }} />
                      </span>
                    </td>
                    <td className="border-b border-line px-2 py-1.5">
                      {out ? <Badge tone="danger">{t("events.soldOut")}</Badge> : <span className="tabular-nums text-ink">{ticketsRemaining(tier)}</span>}
                    </td>
                    <td className="border-b border-line px-2 py-1.5 text-right">
                      <span className="inline-flex gap-1">
                        <Button variant="secondary" size="sm" onClick={() => a.sellTicket(tier.id)} disabled={out}>
                          {t("events.sell")}
                        </Button>
                        <IconButton label={t("removeField")} variant="ghost" onClick={() => a.removeTier(tier.id)}>
                          <Icon name="trash" className="h-[18px] w-[18px]" />
                        </IconButton>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <input value={tName} onChange={(e) => setTName(e.target.value)} placeholder={t("events.tierNamePh")} aria-label={t("events.tierNamePh")} className={`basis-full ${inputCls} sm:basis-0 sm:grow`} />
          <Select
            value={tCurrency}
            onChange={setTCurrency}
            aria-label={t("events.currency")}
            options={CURRENCIES.map((c) => ({ value: c, label: c }))}
            className="basis-full sm:basis-auto sm:w-28"
          />
          <input type="number" min={0} value={tPrice} onChange={(e) => setTPrice(Number(e.target.value))} aria-label={t("events.price")} className={`basis-[calc(50%-0.25rem)] ${inputCls} sm:basis-auto sm:w-24`} />
          <input type="number" min={1} value={tQty} onChange={(e) => setTQty(Number(e.target.value))} aria-label={t("events.quantity")} className={`basis-[calc(50%-0.25rem)] ${inputCls} sm:basis-auto sm:w-24`} />
          <Button
            className="basis-full sm:basis-auto sm:w-auto"
            leftIcon={<Icon name="plus" className="h-[18px] w-[18px]" />}
            onClick={() => {
              if (!tName.trim()) return;
              a.addTier({ name: tName.trim(), currency: tCurrency, price: tPrice, quantity: tQty });
              setTName("");
            }}
          >
            {t("events.addTier")}
          </Button>
        </div>
      </Card>

      {/* Ajanda — sahne ışığı düzeni */}
      <Card className="flex min-w-0 flex-col lg:min-h-0">
        <div className="mb-3 flex shrink-0 items-center gap-2">
          <Icon name="calendar" className="h-5 w-5 text-brand" />
          <h2 className="text-base font-semibold tracking-[-0.01em] text-ink">{t("events.agenda")}</h2>
          {conflicts.length > 0 ? (
            <Badge tone="warning" className="ml-auto">
              <Icon name="warning" className="h-3.5 w-3.5" /> {t("events.conflicts", { n: conflicts.length })}
            </Badge>
          ) : null}
        </div>
        <div className="scroll-brand -mr-1.5 max-h-[13rem] min-h-0 overflow-y-auto pr-1.5 lg:max-h-[6.25rem]">
        {days.map((d) => (
          <div key={d.day} className="mb-3.5 last:mb-0">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.04em] text-ink-3">{d.day}</h3>
            <ul className="flex flex-col gap-2">
              {d.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3.5 rounded-[0.625rem] px-3 py-2.5 transition-[transform,background-color] ease-[var(--ease-out)] hover:bg-surface-2 motion-safe:hover:translate-x-[3px]"
                >
                  <span className="min-w-[5.25rem] flex-none rounded-lg bg-brand px-2 py-1 text-center text-xs font-bold tabular-nums text-white">
                    {item.start}–{item.end}
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold text-ink sm:text-[0.9375rem]">{item.title}</span>
                    <span className="flex flex-wrap gap-1.5 text-xs text-muted">
                      <span>{item.track}</span>
                      {item.speaker ? <span className="before:mr-1.5 before:text-line before:content-['·']">{item.speaker}</span> : null}
                    </span>
                  </span>
                  <IconButton label={t("removeField")} variant="ghost" className="ml-auto flex-none" onClick={() => a.removeAgendaItem(item.id)}>
                    <Icon name="trash" className="h-[18px] w-[18px]" />
                  </IconButton>
                </li>
              ))}
            </ul>
          </div>
        ))}
        </div>
        <div className="mt-3.5 flex shrink-0 flex-wrap items-end gap-2 border-t border-line pt-3.5">
              <input value={aDay} onChange={(e) => setADay(e.target.value)} aria-label={t("events.day")} className={`basis-[calc(50%-0.25rem)] ${inputCls} sm:basis-auto sm:w-24`} />
              <input value={aTrack} onChange={(e) => setATrack(e.target.value)} aria-label={t("events.track")} className={`basis-[calc(50%-0.25rem)] ${inputCls} sm:basis-auto sm:w-32`} />
              <input value={aStart} onChange={(e) => setAStart(e.target.value)} aria-label={t("events.start")} className={`basis-[calc(50%-0.25rem)] ${inputCls} sm:basis-auto sm:w-20`} />
              <input value={aEnd} onChange={(e) => setAEnd(e.target.value)} aria-label={t("events.end")} className={`basis-[calc(50%-0.25rem)] ${inputCls} sm:basis-auto sm:w-20`} />
              <input value={aTitle} onChange={(e) => setATitle(e.target.value)} placeholder={t("events.sessionPh")} aria-label={t("events.sessionPh")} className={`basis-full ${inputCls} sm:basis-0 sm:grow`} />
              <Button
                className="basis-full sm:basis-auto sm:w-auto"
                leftIcon={<Icon name="plus" className="h-[18px] w-[18px]" />}
                onClick={() => {
                  if (!aTitle.trim()) return;
                  a.addAgendaItem({ day: aDay, track: aTrack, start: aStart, end: aEnd, title: aTitle.trim() });
                  setATitle("");
                }}
              >
                {t("events.addSession")}
              </Button>
            </div>
      </Card>

      {/* Yaka kartları — fiziksel konferans rozeti önizlemesi (bkz. index.css .lanyard) */}
      <Card className="min-w-0 lanyard-card">
        <div className="mb-3 flex items-center gap-2">
          <Icon name="identification" className="h-5 w-5 text-brand" />
          <h2 className="text-base font-semibold text-ink">{t("events.badges")}</h2>
        </div>
        <div className="lanyard-stage mb-3">
          <div className="lanyard" tabIndex={0} aria-label={t("events.badgePreview")}>
            <span className="lanyard-accent" aria-hidden="true" />
            <div className="text-xs text-muted">{t("events.badgePreview")}</div>
            {badge.fields.map((f) => (
              <div key={f} className={f === "name" ? "text-xl font-semibold text-ink" : "text-sm text-ink"}>
                {sample.values[f] ?? "—"}
              </div>
            ))}
          </div>
        </div>
        <fieldset className="mb-3">
          <legend className="mb-1 text-sm font-medium text-ink">{t("events.badgeFields")}</legend>
          <div className="flex flex-wrap gap-3">
            {BADGE_FIELDS.map((f) => (
              <label key={f} className="inline-flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={badge.fields.includes(f)} onChange={() => a.toggleBadgeField(f)} className="checkbox" />
                {fieldLabel(f)}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap items-center gap-2">
          <Button leftIcon={<Icon name="printer" className="h-[18px] w-[18px]" />} onClick={() => a.queueBadges(confirmedIds)}>
            {t("events.printConfirmed")}
          </Button>
          <Badge tone="accent">{t("events.queued", { n: printQueue.length })}</Badge>
          {printQueue.length > 0 ? (
            <Button variant="ghost" onClick={() => a.clearQueue()}>{t("events.clearQueue")}</Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
