// web/src/features/appointments/components/BookingsCalendar.tsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar } from "@fullcalendar/core";
import type { EventInput } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import trLocale from "@fullcalendar/core/locales/tr";
import i18n from "@/i18n/i18n";
import { Icon } from "@/components/Icon";
import { Badge, Button, ConfirmDialog, Modal, TimeField, useToast } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { appointmentsStore } from "../appointments.store";
import { HOST_NAMES } from "../appointments.data";
import { reminderTimes } from "../reminders";
import { buildIcs } from "../ics";
import { Card } from "./Card";
import type { Booking, BookingStatus } from "../appointments.types";

const PALETTE = ["indigo", "primary", "teal", "yellow", "pink"];
const STATUS_TONE: Record<BookingStatus, "positive" | "warning" | "danger" | "accent"> = {
  confirmed: "positive",
  pending: "warning",
  cancelled: "danger",
  rescheduled: "accent",
};
const REMINDER_OFFSETS = [60, 30]; // 1 saat + 30 dk önce

const cancelledStyle = `.tl-appt-calendar .fc-event-cancelled{background:#9ca3af;border-color:#9ca3af;opacity:.7;text-decoration:line-through}`;

function toEvent(b: Booking, idx: number): EventInput {
  return {
    id: b.id,
    title: b.inviteeName,
    start: new Date(b.startMs).toISOString(),
    end: new Date(b.endMs).toISOString(),
    className: b.status === "cancelled" ? "fc-event-cancelled" : `fc-event-${PALETTE[idx % PALETTE.length]}`,
  };
}

function downloadIcs(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const pad = (n: number) => String(n).padStart(2, "0");
const fmtRange = (startMs: number, endMs: number) =>
  `${new Date(startMs).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} – ${new Date(endMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
const toDateInput = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const toTimeInput = (ms: number) => {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const inputCls = "input";

export function BookingsCalendar() {
  const { t } = useTranslation("appointments");
  const bookings = useStore(appointmentsStore, (s) => s.bookings);
  const eventTypes = useStore(appointmentsStore, (s) => s.eventTypes);
  const toast = useToast();

  const elRef = useRef<HTMLDivElement | null>(null);
  const calRef = useRef<Calendar | null>(null);
  const bookingsRef = useRef<Booking[]>(bookings);
  bookingsRef.current = bookings;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [rDate, setRDate] = useState("");
  const [rTime, setRTime] = useState("");

  const selected = bookings.find((b) => b.id === selectedId) ?? null;

  // FullCalendar'ı bir kez kur.
  useEffect(() => {
    if (!elRef.current) return;
    const isTr = i18n.language === "tr";
    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    const calendar = new Calendar(elRef.current, {
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
      initialView: isMobile ? "listWeek" : "dayGridMonth",
      height: "auto",
      locale: isTr ? trLocale : "en",
      firstDay: isTr ? 1 : 0,
      headerToolbar: { left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,listWeek" },
      events: bookingsRef.current.map(toEvent),
      eventClick: (info) => {
        const b = bookingsRef.current.find((x) => x.id === info.event.id);
        if (!b) return;
        setSelectedId(b.id);
        setRDate(toDateInput(b.startMs));
        setRTime(toTimeInput(b.startMs));
      },
    });
    calendar.render();
    calRef.current = calendar;
    return () => {
      calendar.destroy();
      calRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // bookings değişince event'leri tazele.
  useEffect(() => {
    const cal = calRef.current;
    if (!cal) return;
    cal.removeAllEvents();
    bookings.map(toEvent).forEach((e) => cal.addEvent(e));
  }, [bookings]);

  const close = () => {
    setSelectedId(null);
    setConfirmCancel(false);
  };

  const doReschedule = () => {
    if (!selected || !rDate) return;
    const [h, m] = (rTime || "00:00").split(":").map(Number);
    const d = new Date(`${rDate}T00:00:00`);
    d.setHours(h || 0, m || 0, 0, 0);
    appointmentsStore.getState().reschedule(selected.id, d.getTime());
    toast.show({ message: t("rescheduledToast"), variant: "success" });
    close();
  };

  const doCancel = () => {
    if (!selected) return;
    appointmentsStore.getState().cancel(selected.id);
    toast.show({ message: t("cancelledToast"), variant: "success" });
    close();
  };

  const exportIcs = () => {
    if (!selected) return;
    const et = eventTypes.find((e) => e.id === selected.eventTypeId);
    const ics = buildIcs({
      start: selected.startMs,
      durationMin: Math.round((selected.endMs - selected.startMs) / 60000),
      title: et?.title ?? selected.inviteeName,
      attendeeEmail: selected.inviteeEmail,
    });
    downloadIcs(`${selected.id}.ics`, ics);
  };

  const reminders = selected ? reminderTimes(selected.startMs, REMINDER_OFFSETS) : [];
  const isCancelled = selected?.status === "cancelled";

  return (
    <Card>
      <style>{cancelledStyle}</style>
      <div ref={elRef} className="tl-appt-calendar" />

      <Modal
        open={!!selected}
        onClose={close}
        title={selected ? selected.inviteeName : ""}
        footer={
          selected ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" leftIcon={<Icon name="download" className="h-4 w-4" />} onClick={exportIcs}>
                {t("exportIcs")}
              </Button>
              <Button variant="secondary" leftIcon={<Icon name="reschedule" className="h-4 w-4" />} onClick={doReschedule} disabled={isCancelled}>
                {t("reschedule")}
              </Button>
              <Button variant="danger" className="ml-auto" onClick={() => setConfirmCancel(true)} disabled={isCancelled}>
                {t("cancel")}
              </Button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-2 text-sm">
            <Badge tone={STATUS_TONE[selected.status]}>{t(`status.${selected.status}`)}</Badge>
            <div><span className="text-muted">{t("eventType")}: </span><span className="text-ink">{eventTypes.find((e) => e.id === selected.eventTypeId)?.title ?? "—"}</span></div>
            <div><span className="text-muted">{t("invitee")}: </span><span className="text-ink">{selected.inviteeName} · {selected.inviteeEmail}</span></div>
            <div><span className="text-muted">{t("host")}: </span><span className="text-ink">{selected.hostId ? HOST_NAMES[selected.hostId] ?? selected.hostId : "—"}</span></div>
            <div><span className="text-muted">{t("when")}: </span><span className="text-ink">{fmtRange(selected.startMs, selected.endMs)}</span></div>
            <div><span className="text-muted">{t("locationLabel")}: </span><span className="text-ink">{t(`location.${selected.location}`)}</span></div>

            <div className="border-t border-line pt-2">
              <div className="mb-1 text-muted">{t("reschedule")}</div>
              <div className="flex flex-wrap items-center gap-2">
                <input type="date" value={rDate} onChange={(e) => setRDate(e.target.value)} aria-label={t("newDate")} className={inputCls} disabled={isCancelled} />
                <TimeField value={rTime} onChange={setRTime} aria-label={t("newTime")} disabled={isCancelled} />
              </div>
            </div>

            {reminders.length > 0 ? (
              <div className="border-t border-line pt-2">
                <div className="mb-1 text-muted">{t("reminders")}</div>
                <div className="flex flex-wrap gap-1.5">
                  {REMINDER_OFFSETS.map((off) => (
                    <Badge key={off} tone="neutral"><Icon name="reminder" className="h-3 w-3" /> {t("reminderBefore", { n: off })}</Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={confirmCancel}
        title={t("confirmCancelTitle")}
        message={t("confirmCancelBody")}
        danger
        confirmLabel={t("cancel")}
        onConfirm={doCancel}
        onClose={() => setConfirmCancel(false)}
      />
    </Card>
  );
}
