// web/src/features/webinar/components/EventManager.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge, Button, IconButton } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { webinarEventsStore } from "../webinarEvents.store";
import { agendaByDay, agendaConflicts, formatPrice, isSoldOut, ticketRevenue, ticketsRemaining } from "../webinarEvents";
import { EVENTS, REGISTRATIONS } from "../webinar.data";
import { Card } from "./Card";

const CURRENCIES = ["USD", "EUR", "TRY", "GBP"];
const BADGE_FIELDS = ["name", "email", "company", "role"];

const fieldLabel = (id: string) => EVENTS[0].registrationFields.find((f) => f.id === id)?.label ?? id;

const inputCls = "h-11 rounded-md border border-line bg-surface px-2 text-base text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand";

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
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Biletleme */}
      <Card className="lg:col-span-2">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Icon name="ticket" className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-semibold text-ink">{t("events.tickets")}</h2>
          <div className="ml-auto flex flex-wrap gap-1">
            {Object.entries(revenue).map(([cur, amt]) => (
              <Badge key={cur} tone="positive">{formatPrice(amt, cur)}</Badge>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full border-collapse text-base">
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
            {tiers.map((tier) => (
              <tr key={tier.id}>
                <td className="border-b border-line px-2 py-1 text-ink">{tier.name}</td>
                <td className="border-b border-line px-2 py-1 text-ink">
                  {tier.price === 0 ? t("events.free") : formatPrice(tier.price, tier.currency)}
                </td>
                <td className="border-b border-line px-2 py-1 text-ink">{tier.sold}/{tier.quantity}</td>
                <td className="border-b border-line px-2 py-1">
                  {isSoldOut(tier) ? <Badge tone="danger">{t("events.soldOut")}</Badge> : <span className="text-ink">{ticketsRemaining(tier)}</span>}
                </td>
                <td className="border-b border-line px-2 py-1 text-right">
                  <span className="inline-flex gap-1">
                    <Button variant="secondary" size="sm" onClick={() => a.sellTicket(tier.id)} disabled={isSoldOut(tier)}>
                      {t("events.sell")}
                    </Button>
                    <IconButton label={t("removeField")} variant="ghost" onClick={() => a.removeTier(tier.id)}>
                      <Icon name="trash" className="h-[18px] w-[18px]" />
                    </IconButton>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <input value={tName} onChange={(e) => setTName(e.target.value)} placeholder={t("events.tierNamePh")} aria-label={t("events.tierNamePh")} className={`flex-1 ${inputCls}`} />
          <select value={tCurrency} onChange={(e) => setTCurrency(e.target.value)} aria-label={t("events.currency")} className={inputCls}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="number" min={0} value={tPrice} onChange={(e) => setTPrice(Number(e.target.value))} aria-label={t("events.price")} className={`w-24 ${inputCls}`} />
          <input type="number" min={1} value={tQty} onChange={(e) => setTQty(Number(e.target.value))} aria-label={t("events.quantity")} className={`w-24 ${inputCls}`} />
          <Button
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

      {/* Ajanda */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Icon name="calendar" className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-semibold text-ink">{t("events.agenda")}</h2>
          {conflicts.length > 0 ? (
            <Badge tone="warning" className="ml-auto">
              <Icon name="warning" className="h-3.5 w-3.5" /> {t("events.conflicts", { n: conflicts.length })}
            </Badge>
          ) : null}
        </div>
        {days.map((d) => (
          <div key={d.day} className="mb-3">
            <h3 className="mb-1 text-base font-semibold text-ink">{d.day}</h3>
            <ul className="space-y-1">
              {d.items.map((item) => (
                <li key={item.id} className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-base">
                  <span className="tabular-nums text-muted">{item.start}–{item.end}</span>
                  <span className="font-medium text-ink">{item.title}</span>
                  <span className="text-muted">· {item.track}{item.speaker ? ` · ${item.speaker}` : ""}</span>
                  <IconButton label={t("removeField")} variant="ghost" className="ml-auto" onClick={() => a.removeAgendaItem(item.id)}>
                    <Icon name="trash" className="h-[18px] w-[18px]" />
                  </IconButton>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="flex flex-wrap items-end gap-2">
          <input value={aDay} onChange={(e) => setADay(e.target.value)} aria-label={t("events.day")} className={`w-24 ${inputCls}`} />
          <input value={aTrack} onChange={(e) => setATrack(e.target.value)} aria-label={t("events.track")} className={`w-32 ${inputCls}`} />
          <input value={aStart} onChange={(e) => setAStart(e.target.value)} aria-label={t("events.start")} className={`w-20 ${inputCls}`} />
          <input value={aEnd} onChange={(e) => setAEnd(e.target.value)} aria-label={t("events.end")} className={`w-20 ${inputCls}`} />
          <input value={aTitle} onChange={(e) => setATitle(e.target.value)} placeholder={t("events.sessionPh")} aria-label={t("events.sessionPh")} className={`flex-1 ${inputCls}`} />
          <Button
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

      {/* Yaka kartları */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Icon name="identification" className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-semibold text-ink">{t("events.badges")}</h2>
        </div>

        <div className="mb-3 rounded-lg border border-l-4 border-line p-3" style={{ borderLeftColor: badge.accent }}>
          <div className="text-base text-muted">{t("events.badgePreview")}</div>
          {badge.fields.map((f) => (
            <div key={f} className={f === "name" ? "text-xl font-bold text-ink" : "text-base text-ink"}>
              {sample.values[f] ?? "—"}
            </div>
          ))}
        </div>

        <fieldset className="mb-3">
          <legend className="mb-1 text-base font-medium text-ink">{t("events.badgeFields")}</legend>
          <div className="flex flex-wrap gap-3">
            {BADGE_FIELDS.map((f) => (
              <label key={f} className="inline-flex items-center gap-2 text-base text-ink">
                <input type="checkbox" checked={badge.fields.includes(f)} onChange={() => a.toggleBadgeField(f)} className="h-4 w-4 accent-[var(--color-brand)]" />
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
