import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";
import { Button, EmptyState, Skeleton } from "@/components/ui";
import { apiErrorMessage } from "@/lib/api";
import {
  useCreatePublicBooking,
  usePublicEventTypes,
} from "./booking.hooks";
import type { AvailabilityRule, EventType } from "./booking.types";

type Step = "pick" | "slots" | "form" | "done";
const DOWS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

/** JS getDay() (0=Sun..6=Sat) → bizim weekday (0=Mon..6=Sun). */
function jsToWeekday(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function toHHMM(v: string | null): string {
  return v ? v.slice(0, 5) : "";
}

/** availability + süreye göre o gün için slot listesi üretir. */
function buildSlots(rule: AvailabilityRule | undefined, durationMin: number): string[] {
  if (!rule || !rule.start_time || !rule.end_time) return [];
  const [sh, sm] = toHHMM(rule.start_time).split(":").map(Number);
  const [eh, em] = toHHMM(rule.end_time).split(":").map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  const out: string[] = [];
  for (let m = start; m + durationMin <= end; m += durationMin) {
    const h = Math.floor(m / 60);
    const mi = m % 60;
    out.push(`${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`);
  }
  return out;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Seçilen gün+saat → ISO (yerel) start. */
function buildStartIso(year: number, month: number, day: number, time: string): string {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(year, month, day, h, m, 0, 0);
  return d.toISOString();
}

function buildIcs(title: string, startIso: string, durationMin: number): string {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + durationMin * 60_000);
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
      d.getUTCHours(),
    )}${pad(d.getUTCMinutes())}00Z`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function PublicBookingPage() {
  const { t } = useTranslation("booking");
  const params = useParams<{ slug?: string }>();
  const [search] = useSearchParams();
  const slug =
    params.slug || search.get("tenant") || search.get("t") || undefined;

  const { data, isLoading, isError } = usePublicEventTypes(slug);
  const createM = useCreatePublicBooking();

  const [step, setStep] = useState<Step>("pick");
  const [et, setEt] = useState<EventType | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Görüntülenen ay (rezervasyon her zaman geleceğe).
  const now = new Date();
  const [viewYear] = useState(now.getFullYear());
  const [viewMonth] = useState(now.getMonth());
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const availabilityByWeekday = useMemo(() => {
    const m = new Map<number, AvailabilityRule>();
    (data?.availability ?? []).forEach((r) => m.set(r.weekday, r));
    return m;
  }, [data]);

  const openWeekdays = useMemo(
    () => new Set(Array.from(availabilityByWeekday.keys())),
    [availabilityByWeekday],
  );

  const slotsForDay = useMemo(() => {
    if (!et || day == null) return [];
    const wd = jsToWeekday(new Date(viewYear, viewMonth, day).getDay());
    return buildSlots(availabilityByWeekday.get(wd), et.duration_min);
  }, [et, day, viewYear, viewMonth, availabilityByWeekday]);

  function resetFlow() {
    setStep("pick");
    setEt(null);
    setDay(null);
    setTime(null);
    setName("");
    setEmail("");
    setError(null);
  }

  async function confirmReservation() {
    if (!et || !slug || day == null || !time) return;
    setError(null);
    const startIso = buildStartIso(viewYear, viewMonth, day, time);
    try {
      await createM.mutateAsync({
        tenantSlug: slug,
        body: {
          event_type_slug: et.slug,
          invitee_name: name.trim(),
          invitee_email: email.trim(),
          start_at: startIso,
        },
      });
      setStep("done");
    } catch (err) {
      setError(apiErrorMessage(err) || t("pub.error"));
    }
  }

  function downloadIcs() {
    if (!et || day == null || !time) return;
    const startIso = buildStartIso(viewYear, viewMonth, day, time);
    const blob = new Blob([buildIcs(et.name, startIso, et.duration_min)], {
      type: "text/calendar",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${et.slug}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const tenantName = data?.tenant_name ?? "";
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <header className="min-h-15 flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6 sm:py-4 bg-white border-b border-gray-200">
        <Logo className="h-8 shrink-0" />
        <span className="badge">{t("pub.badge")}</span>
        <div className="flex-1" />
        {data?.availability?.[0]?.timezone && (
          <span className="badge badge-gray">
            <Icon name="globe" className="w-3 h-3" /> {data.availability[0].timezone}
          </span>
        )}
      </header>

      <div className="max-w-4xl xl:max-w-5xl mx-auto p-4 md:p-8 lg:p-10">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        )}

        {!isLoading && (isError || !slug) && (
          <EmptyState
            icon={<Icon name="calendar" className="w-6 h-6" />}
            title={t("pub.loadError")}
          />
        )}

        {/* 1 — etkinlik seç */}
        {!isLoading && !isError && data && step === "pick" && (
          <>
            <h1 className="text-xl font-semibold text-ink mb-1">
              {t("pub.pickTitle")}
            </h1>
            <p className="text-gray-500 mb-6">
              {t("pub.pickSubtitle", { name: tenantName })}
            </p>
            {data.event_types.length === 0 ? (
              <EmptyState
                icon={<Icon name="calendar" className="w-6 h-6" />}
                title={t("pub.noTypes")}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 tl-stagger">
                {data.event_types.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      setEt(e);
                      setStep("slots");
                    }}
                    className="card p-5 text-left flex items-start gap-4 hover:shadow-md motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.99] transition-[transform,box-shadow,colors] duration-[var(--dur-press)] ease-[var(--ease-out)]"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{e.name}</h3>
                      {e.description && (
                        <p className="text-sm text-gray-500 mt-1">{e.description}</p>
                      )}
                      <div className="flex gap-3 mt-2 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="clock" className="w-3.5 h-3.5" />{" "}
                          {t("pub.minutes", { count: e.duration_min })}
                        </span>
                      </div>
                    </div>
                    <Icon name="chevronRight" className="w-5 h-5 text-gray-300" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* 2 — takvim + slotlar */}
        {step === "slots" && et && (
          <div className="card grid grid-cols-1 md:grid-cols-[260px_1fr_220px] xl:grid-cols-[280px_1fr_260px] overflow-hidden">
            <div className="p-4 sm:p-6 border-b md:border-b-0 md:border-r border-gray-100">
              <button
                onClick={() => setStep("pick")}
                className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 mb-4 transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97]"
              >
                <Icon name="chevronLeft" className="w-4 h-4" /> {t("pub.back")}
              </button>
              <span className="w-12 h-12 rounded-lg grid place-items-center text-white text-xl font-bold bg-blue-600">
                {(tenantName || "A").charAt(0).toUpperCase()}
              </span>
              <p className="text-sm text-gray-500 mt-3">{tenantName}</p>
              <h2 className="text-base font-semibold text-ink">{et.name}</h2>
              <div className="space-y-2 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Icon name="clock" className="w-4 h-4 text-gray-400" />{" "}
                  {t("pub.minutes", { count: et.duration_min })}
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <b className="text-gray-900">{monthLabel}</b>
              </div>
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-1.5">
                {DOWS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-semibold text-muted pb-1"
                  >
                    {d}
                  </div>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                  const wd = jsToWeekday(new Date(viewYear, viewMonth, d).getDay());
                  const isPast =
                    new Date(viewYear, viewMonth, d) <
                    new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  const has = openWeekdays.has(wd) && !isPast;
                  return (
                    <button
                      key={d}
                      disabled={!has}
                      onClick={() => {
                        setDay(d);
                        setTime(null);
                      }}
                      className={
                        "aspect-square rounded-lg text-sm font-semibold grid place-items-center transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:enabled:active:scale-[0.97] " +
                        (day === d
                          ? "bg-blue-600 text-white"
                          : has
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            : "text-gray-300")
                      }
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-4 sm:p-6 flex flex-col">
              <b className="text-gray-900 mb-3">
                {day ? `${day}` : t("pub.pickDate")}
              </b>
              <div className="flex-1 overflow-y-auto space-y-2 max-h-80">
                {day ? (
                  slotsForDay.length > 0 ? (
                    slotsForDay.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setTime(s);
                          setStep("form");
                        }}
                        className="w-full h-10 rounded-lg border border-blue-600 text-blue-700 font-semibold text-sm hover:bg-blue-600 hover:text-white transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97]"
                      >
                        {s}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">{t("pub.pickSlot")}</p>
                  )
                ) : (
                  <p className="text-sm text-gray-400">{t("pub.pickDate")}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3 — form */}
        {step === "form" && et && (
          <div className="max-w-lg mx-auto card p-4 sm:p-6">
            <button
              onClick={() => setStep("slots")}
              className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 mb-4"
            >
              <Icon name="chevronLeft" className="w-4 h-4" /> {t("pub.back")}
            </button>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge">
                <Icon name="calCheck" className="w-3 h-3" /> {et.name}
              </span>
              <span className="badge badge-gray">
                <Icon name="calendar" className="w-3 h-3" /> {day} · {time}
              </span>
              <span className="badge badge-gray">
                <Icon name="clock" className="w-3 h-3" />{" "}
                {t("pub.minutes", { count: et.duration_min })}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">{t("pub.nameLabel")}</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">{t("pub.emailLabel")}</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button
                className="w-full"
                loading={createM.isPending}
                disabled={!name.trim() || !email.trim()}
                onClick={confirmReservation}
              >
                {createM.isPending ? t("pub.confirming") : t("pub.confirm")}
              </Button>
            </div>
          </div>
        )}

        {/* 4 — onay */}
        {step === "done" && et && (
          <div className="max-w-md mx-auto card p-6 sm:p-8 text-center mt-6">
            <span className="w-16 h-16 rounded-2xl bg-green-100 text-green-700 grid place-items-center mx-auto mb-4">
              <Icon name="check" className="w-8 h-8" />
            </span>
            <h2 className="text-xl font-semibold text-ink">{t("pub.doneTitle")}</h2>
            <p className="text-gray-500 mt-2">{t("pub.doneSubtitle")}</p>
            <div className="card p-4 mt-5 text-left">
              <div className="text-sm font-semibold text-gray-900">{et.name}</div>
              <div className="text-sm text-gray-600 mt-1">
                {day} {monthLabel} · {time} (
                {t("pub.minutes", { count: et.duration_min })})
              </div>
            </div>
            <Button variant="secondary" className="w-full mt-4" onClick={downloadIcs}>
              {t("pub.addToCalendar")}
            </Button>
            <Button variant="ghost" className="w-full mt-2" onClick={resetFlow}>
              {t("pub.another")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
