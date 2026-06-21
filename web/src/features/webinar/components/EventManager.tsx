// web/src/features/webinar/components/EventManager.tsx
import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import type { IconName } from "@/components/Icon";
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

/** Katlanabilir bölüm kartı — başlıktan göster/gizle (mobilde uzun sayfayı düzenler). */
function Section({
  icon,
  title,
  headerExtra,
  className,
  open,
  onToggle,
  children,
}: {
  icon: IconName;
  title: string;
  headerExtra?: ReactNode;
  className?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <Card className={className}>
      <div className={clsx(open && "mb-3")}>
        <div className="flex items-center gap-2">
          <Icon name={icon} className="h-5 w-5 shrink-0 text-brand" />
          <h2 className="min-w-0 flex-1 text-base font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-label={title}
            className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none"
          >
            <Icon
              name="chevronDown"
              className={clsx(
                "h-5 w-5 transition-transform duration-[var(--dur-pop)] ease-[var(--ease-out)] motion-reduce:transition-none",
                open && "rotate-180",
              )}
            />
          </button>
        </div>
        {headerExtra ? (
          <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">{headerExtra}</div>
        ) : null}
      </div>
      {open ? children : null}
    </Card>
  );
}

export function EventManager() {
  const { t } = useTranslation(["webinar", "common"]);
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

  // Bölüm göster/gizle (varsayılan açık).
  const [open, setOpen] = useState({ tickets: true, agenda: true, badges: true });
  const toggle = (k: keyof typeof open) => setOpen((s) => ({ ...s, [k]: !s[k] }));
  // Ekleme formları varsayılan kapalı — liste derli toplu kalsın, ikondan açılır.
  const [tFormOpen, setTFormOpen] = useState(false);
  const [aFormOpen, setAFormOpen] = useState(false);

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
    <div className="grid gap-4 pb-8 lg:grid-cols-2 lg:items-start">
      {/* Biletleme */}
      <Section
        icon="ticket"
        title={t("events.tickets")}
        className="min-w-0 lg:col-span-2"
        open={open.tickets}
        onToggle={() => toggle("tickets")}
        headerExtra={Object.entries(revenue).map(([cur, amt]) => (
          <span key={cur} className="inline-flex shrink-0 items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium tabular-nums text-green-900">
            {formatPrice(amt, cur)}
          </span>
        ))}
      >
        {/* Mobil: kart listesi — dar ekranda tablo hücreleri harf harf kırılıyordu. */}
        <ul className="space-y-2 sm:hidden">
          {tiers.map((tier) => {
            const out = isSoldOut(tier);
            const pct = tier.quantity > 0 ? Math.min(100, Math.round((tier.sold / tier.quantity) * 100)) : 0;
            return (
              <li key={tier.id} className="rounded-lg border border-line p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-ink">{tier.name}</div>
                    <div className="mt-0.5 text-sm tabular-nums text-ink-2">
                      {tier.price === 0 ? t("events.free") : formatPrice(tier.price, tier.currency)}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="secondary" size="sm" onClick={() => a.sellTicket(tier.id)} disabled={out}>
                      {t("events.sell")}
                    </Button>
                    <IconButton label={t("removeField")} variant="ghost" onClick={() => a.removeTier(tier.id)}>
                      <Icon name="trash" className="h-[18px] w-[18px]" />
                    </IconButton>
                  </div>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-muted">{t("events.sold")}</div>
                    <div className="tabular-nums text-sm text-ink">{tier.sold}/{tier.quantity}</div>
                    <span className="mt-1 block h-1 overflow-hidden rounded-full bg-surface-3" aria-hidden>
                      <span className={"block h-1 rounded-full " + (out ? "bg-red-600" : "bg-blue-700")} style={{ width: `${pct}%` }} />
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-muted">{t("events.remaining")}</div>
                    <div className="mt-0.5">
                      {out ? <Badge tone="danger">{t("events.soldOut")}</Badge> : <span className="tabular-nums text-sm text-ink">{ticketsRemaining(tier)}</span>}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* sm+ : klasik tablo (yeterli genişlik var; başlık/sayılar nowrap). */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="whitespace-nowrap border-b border-line px-2 py-1 font-semibold">{t("events.tier")}</th>
                <th className="whitespace-nowrap border-b border-line px-2 py-1 font-semibold">{t("events.price")}</th>
                <th className="whitespace-nowrap border-b border-line px-2 py-1 font-semibold">{t("events.sold")}</th>
                <th className="whitespace-nowrap border-b border-line px-2 py-1 font-semibold">{t("events.remaining")}</th>
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
                    <td className="whitespace-nowrap border-b border-line px-2 py-1.5 tabular-nums text-ink">
                      {tier.price === 0 ? t("events.free") : formatPrice(tier.price, tier.currency)}
                    </td>
                    <td className="whitespace-nowrap border-b border-line px-2 py-1.5 text-ink">
                      <span className="tabular-nums">{tier.sold}/{tier.quantity}</span>
                      <span className="mt-1 block h-1 overflow-hidden rounded-full bg-surface-3" aria-hidden>
                        <span className={"block h-1 rounded-full " + (out ? "bg-red-600" : "bg-blue-700")} style={{ width: `${pct}%` }} />
                      </span>
                    </td>
                    <td className="whitespace-nowrap border-b border-line px-2 py-1.5">
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

        {/* Ekleme formu — ikon-buton toggle ile açılır (varsayılan kapalı). */}
        <div className="mt-3 border-t border-line pt-3">
          <button
            type="button"
            onClick={() => setTFormOpen((o) => !o)}
            aria-expanded={tFormOpen}
            className="flex w-full items-center gap-2 rounded-lg text-sm font-medium text-ink transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-softer text-brand">
              <Icon name="plus" className="h-4 w-4" />
            </span>
            {t("events.addTier")}
            <Icon
              name="chevronDown"
              className={clsx(
                "ml-auto h-4 w-4 text-ink-3 transition-transform duration-[var(--dur-pop)] ease-[var(--ease-out)] motion-reduce:transition-none",
                tFormOpen && "rotate-180",
              )}
            />
          </button>
          {tFormOpen ? (
            <div className="mt-3 grid grid-cols-2 items-end gap-x-2 gap-y-2.5 sm:grid-cols-[1fr_7rem_6rem_6rem_auto]">
              <label className="col-span-2 flex flex-col gap-1 text-xs font-medium text-ink-2 sm:col-span-1">
                {t("events.tier")}
                <input value={tName} onChange={(e) => setTName(e.target.value)} placeholder={t("events.tierNamePh")} className={inputCls} />
              </label>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-ink-2">{t("events.currency")}</span>
                <Select
                  value={tCurrency}
                  onChange={setTCurrency}
                  aria-label={t("events.currency")}
                  options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                  className="w-full"
                />
              </div>
              <label className="flex flex-col gap-1 text-xs font-medium text-ink-2">
                {t("events.price")}
                <input type="number" min={0} value={tPrice} onChange={(e) => setTPrice(Number(e.target.value))} className={inputCls} />
              </label>
              <label className="col-span-2 flex flex-col gap-1 text-xs font-medium text-ink-2 sm:col-span-1">
                {t("events.quantity")}
                <input type="number" min={1} value={tQty} onChange={(e) => setTQty(Number(e.target.value))} className={inputCls} />
              </label>
              <Button
                className="col-span-2 sm:col-span-1"
                onClick={() => {
                  if (!tName.trim()) return;
                  a.addTier({ name: tName.trim(), currency: tCurrency, price: tPrice, quantity: tQty });
                  setTName("");
                }}
              >
                {t("common:save")}
              </Button>
            </div>
          ) : null}
        </div>
      </Section>

      {/* Ajanda — sahne ışığı düzeni */}
      <Section
        icon="calendar"
        title={t("events.agenda")}
        className="min-w-0"
        open={open.agenda}
        onToggle={() => toggle("agenda")}
        headerExtra={
          conflicts.length > 0 ? (
            <Badge tone="warning">
              <Icon name="warning" className="h-3.5 w-3.5" /> {t("events.conflicts", { n: conflicts.length })}
            </Badge>
          ) : null
        }
      >
        <div className="scroll-brand -mr-1.5 max-h-[15rem] overflow-y-auto pr-1.5">
          {days.map((d) => (
            <div key={d.day} className="mb-3.5 last:mb-0">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.04em] text-ink-3">{d.day}</h3>
              <ul className="flex flex-col gap-2">
                {d.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 rounded-[0.625rem] px-3 py-2.5 transition-[transform,background-color] ease-[var(--ease-out)] hover:bg-surface-2 motion-safe:hover:translate-x-[3px]"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex rounded-lg bg-brand px-2 py-1 text-xs font-bold tabular-nums text-white">
                        {item.start}–{item.end}
                      </span>
                      <div className="mt-1.5 text-sm font-semibold text-ink sm:text-[0.9375rem]">{item.title}</div>
                      <div className="mt-0.5 flex flex-wrap gap-1.5 text-xs text-muted">
                        <span>{item.track}</span>
                        {item.speaker ? <span className="before:mr-1.5 before:text-line before:content-['·']">{item.speaker}</span> : null}
                      </div>
                    </div>
                    <IconButton label={t("removeField")} variant="ghost" className="-mr-1 flex-none" onClick={() => a.removeAgendaItem(item.id)}>
                      <Icon name="trash" className="h-[18px] w-[18px]" />
                    </IconButton>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Ekleme formu — ikon-buton toggle ile açılır (varsayılan kapalı). */}
        <div className="mt-3.5 border-t border-line pt-3.5">
          <button
            type="button"
            onClick={() => setAFormOpen((o) => !o)}
            aria-expanded={aFormOpen}
            className="flex w-full items-center gap-2 rounded-lg text-sm font-medium text-ink transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-softer text-brand">
              <Icon name="plus" className="h-4 w-4" />
            </span>
            {t("events.addSession")}
            <Icon
              name="chevronDown"
              className={clsx(
                "ml-auto h-4 w-4 text-ink-3 transition-transform duration-[var(--dur-pop)] ease-[var(--ease-out)] motion-reduce:transition-none",
                aFormOpen && "rotate-180",
              )}
            />
          </button>
          {aFormOpen ? (
            <div className="mt-3 grid grid-cols-2 items-end gap-2 sm:grid-cols-[5rem_8rem_5rem_5rem_1fr_auto]">
              <input value={aDay} onChange={(e) => setADay(e.target.value)} aria-label={t("events.day")} className={inputCls} />
              <input value={aTrack} onChange={(e) => setATrack(e.target.value)} aria-label={t("events.track")} className={inputCls} />
              <input value={aStart} onChange={(e) => setAStart(e.target.value)} aria-label={t("events.start")} className={inputCls} />
              <input value={aEnd} onChange={(e) => setAEnd(e.target.value)} aria-label={t("events.end")} className={inputCls} />
              <input value={aTitle} onChange={(e) => setATitle(e.target.value)} placeholder={t("events.sessionPh")} aria-label={t("events.sessionPh")} className={`col-span-2 ${inputCls} sm:col-span-1`} />
              <Button
                className="col-span-2 sm:col-span-1"
                onClick={() => {
                  if (!aTitle.trim()) return;
                  a.addAgendaItem({ day: aDay, track: aTrack, start: aStart, end: aEnd, title: aTitle.trim() });
                  setATitle("");
                }}
              >
                {t("common:save")}
              </Button>
            </div>
          ) : null}
        </div>
      </Section>

      {/* Yaka kartları — fiziksel konferans rozeti önizlemesi (bkz. index.css .lanyard) */}
      <Section
        icon="identification"
        title={t("events.badges")}
        className="min-w-0 lanyard-card"
        open={open.badges}
        onToggle={() => toggle("badges")}
      >
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
      </Section>
    </div>
  );
}
