import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import {
  Backdrop,
  Button,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  Tabs,
  TimeField,
  useToast,
} from "@/components/ui";
import { apiErrorMessage } from "@/lib/api";
import {
  useAvailability,
  useBookings,
  useCreateEventType,
  useDeleteEventType,
  useEventTypes,
  usePutAvailability,
  useUpdateEventType,
} from "./booking.hooks";
import type {
  AvailabilityRule,
  CreateEventTypeRequest,
  EventType,
} from "./booking.types";

/**
 * Booking yönetim ekranı — gerçek CRUD (React Query) ile.
 * Sekmeler: görüşme türleri (EventType CRUD), müsaitlik (haftalık PUT),
 * rezervasyonlar (salt okunur liste).
 */

interface EventTypeForm {
  name: string;
  slug: string;
  duration_min: number;
  description: string;
  active: boolean;
}

const EMPTY_FORM: EventTypeForm = {
  name: "",
  slug: "",
  duration_min: 30,
  description: "",
  active: true,
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ---- Event types tab ------------------------------------------------

function EventTypesTab() {
  const { t } = useTranslation("booking");
  const toast = useToast();
  const { data, isLoading, isError } = useEventTypes();
  const createM = useCreateEventType();
  const updateM = useUpdateEventType();
  const deleteM = useDeleteEventType();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<EventTypeForm>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const items = data ?? [];

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setDrawerOpen(true);
  }

  function openEdit(et: EventType) {
    setEditId(et.id);
    setForm({
      name: et.name,
      slug: et.slug,
      duration_min: et.duration_min,
      description: et.description,
      active: et.active,
    });
    setSlugTouched(true);
    setDrawerOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body: CreateEventTypeRequest = {
      name: form.name.trim(),
      slug: (form.slug || slugify(form.name)).trim(),
      duration_min: Number(form.duration_min) || 30,
      description: form.description,
      active: form.active,
    };
    if (!body.name || !body.slug) return;
    try {
      if (editId) {
        await updateM.mutateAsync({ id: editId, body });
        toast.show({ message: t("et.toast.updated"), variant: "success" });
      } else {
        await createM.mutateAsync(body);
        toast.show({ message: t("et.toast.created"), variant: "success" });
      }
      setDrawerOpen(false);
    } catch (err) {
      toast.show({ message: apiErrorMessage(err), variant: "error" });
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const removed = items.find((e) => e.id === deleteId);
    const id = deleteId;
    setDeleteId(null);
    try {
      await deleteM.mutateAsync(id);
      toast.show({
        message: t("et.toast.deleted"),
        variant: "success",
        action: removed
          ? {
              label: t("et.toast.undo"),
              // Undo: aynı tür yeniden oluşturulur (yeni id ile).
              onClick: () => {
                createM
                  .mutateAsync({
                    name: removed.name,
                    slug: removed.slug,
                    duration_min: removed.duration_min,
                    description: removed.description,
                    active: removed.active,
                  })
                  .catch((err) =>
                    toast.show({
                      message: apiErrorMessage(err),
                      variant: "error",
                    }),
                  );
              },
            }
          : undefined,
      });
    } catch (err) {
      toast.show({ message: apiErrorMessage(err), variant: "error" });
    }
  }

  return (
    <div className="pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-base font-semibold text-ink">
          {t("et.list.title")}{" "}
          <span className="text-gray-500 font-normal">
            {t("et.list.count", { count: items.length })}
          </span>
        </h2>
        <Button className="shrink-0" leftIcon={<Icon name="plus" className="w-4 h-4" />} onClick={openCreate}>
          {t("et.list.new")}
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <EmptyState title={t("et.toast.error")} />
      )}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          icon={<Icon name="calendar" className="w-6 h-6" />}
          title={t("et.empty.title")}
          description={t("et.empty.description")}
          action={
            <Button leftIcon={<Icon name="plus" className="w-4 h-4" />} onClick={openCreate}>
              {t("et.list.new")}
            </Button>
          }
        />
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm text-ink-2">
            <thead className="bg-gray-50 text-xs font-semibold text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("et.table.name")}</th>
                <th className="px-4 py-3 font-semibold">{t("et.table.slug")}</th>
                <th className="px-4 py-3 font-semibold">{t("et.table.duration")}</th>
                <th className="px-4 py-3 font-semibold">{t("et.table.status")}</th>
                <th className="px-4 py-3 font-semibold text-right">
                  {t("et.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((et) => (
                <tr key={et.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {et.name}
                    {et.description && (
                      <p className="text-xs font-normal text-gray-500 mt-0.5 max-w-xs truncate">
                        {et.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-gray-600">/{et.slug}</code>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {t("et.minutes", { count: et.duration_min })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                        (et.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700")
                      }
                    >
                      {et.active ? t("et.status.active") : t("et.status.hidden")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(et)}
                        className="p-1.5 rounded-lg text-gray-500 transition-transform motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900"
                        aria-label={t("drawerActions.edit")}
                      >
                        <Icon name="pencil" className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(et.id)}
                        className="p-1.5 rounded-lg text-red-600 transition-transform motion-safe:active:scale-[0.97] hover:bg-red-50"
                        aria-label={t("drawerActions.delete")}
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / edit drawer */}
      {drawerOpen && (
        <>
          <Backdrop level="drawer" onClick={() => setDrawerOpen(false)} />
          <div className="fixed right-0 top-0 z-40 h-[100dvh] w-full max-w-sm overflow-y-auto bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] motion-safe:[animation:tl-drawer-in-end_var(--dur-modal)_var(--ease-drawer)_both]">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-ink">
                {editId ? t("et.form.update") : t("et.form.create")}
              </h4>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 transition-transform motion-safe:active:scale-[0.97] hover:bg-gray-100"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900">
                  {t("et.form.name")}
                </label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({
                      ...f,
                      name,
                      slug: slugTouched ? f.slug : slugify(name),
                    }));
                  }}
                  placeholder={t("et.form.namePlaceholder")}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900">
                  {t("et.form.slug")}
                </label>
                <input
                  className="input"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
                  }}
                  placeholder={t("et.form.slugPlaceholder")}
                  pattern="[a-z0-9-]+"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">{t("et.form.slugHint")}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900">
                  {t("et.form.duration")}
                </label>
                <input
                  type="number"
                  min={1}
                  className="input"
                  value={form.duration_min}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration_min: Number(e.target.value) }))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-900">
                  {t("et.form.description")}
                </label>
                <textarea
                  rows={3}
                  className="input"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder={t("et.form.descriptionPlaceholder")}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-900">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, active: e.target.checked }))
                  }
                />
                {t("et.form.active")}
              </label>
              <div className="flex gap-2 pt-2">
                <Button type="submit" loading={createM.isPending || updateM.isPending}>
                  {t("et.form.save")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setDrawerOpen(false)}
                >
                  {t("et.form.cancel")}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title={t("et.deleteModal.title")}
        message={t("et.deleteModal.message")}
        confirmLabel={t("et.deleteModal.confirm")}
        cancelLabel={t("et.deleteModal.cancel")}
        loading={deleteM.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}

// ---- Availability tab -----------------------------------------------

interface DayRow {
  weekday: number;
  open: boolean;
  start: string;
  end: string;
}

const DEFAULT_DAY = (weekday: number): DayRow => ({
  weekday,
  open: weekday < 5,
  start: "09:00",
  end: "18:00",
});

function toHHMM(v: string | null): string {
  if (!v) return "";
  return v.slice(0, 5);
}

function AvailabilityTab() {
  const { t } = useTranslation("booking");
  const toast = useToast();
  const { data, isLoading } = useAvailability();
  const putM = usePutAvailability();
  const weekdays = t("et.availability.weekdays", { returnObjects: true }) as string[];

  const [rows, setRows] = useState<DayRow[]>(
    Array.from({ length: 7 }, (_, i) => DEFAULT_DAY(i)),
  );
  const [tz, setTz] = useState("Europe/Istanbul");

  useEffect(() => {
    if (!data) return;
    const byDay = new Map(data.map((r) => [r.weekday, r]));
    setRows(
      Array.from({ length: 7 }, (_, i) => {
        const r = byDay.get(i);
        if (r && r.start_time && r.end_time) {
          return {
            weekday: i,
            open: true,
            start: toHHMM(r.start_time),
            end: toHHMM(r.end_time),
          };
        }
        return { ...DEFAULT_DAY(i), open: r ? false : DEFAULT_DAY(i).open };
      }),
    );
    if (data[0]?.timezone) setTz(data[0].timezone);
  }, [data]);

  async function save() {
    const rules: AvailabilityRule[] = rows
      .filter((r) => r.open)
      .map((r) => ({
        weekday: r.weekday,
        start_time: `${r.start}:00`,
        end_time: `${r.end}:00`,
        timezone: tz,
      }));
    try {
      await putM.mutateAsync(rules);
      toast.show({ message: t("et.availability.saved"), variant: "success" });
    } catch (err) {
      toast.show({ message: apiErrorMessage(err), variant: "error" });
    }
  }

  return (
    <div className="pt-4 max-w-2xl">
      <h2 className="text-base font-semibold text-ink">{t("et.availability.title")}</h2>
      <p className="text-sm text-muted mb-4">{t("et.availability.description")}</p>

      {isLoading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {rows.map((r, idx) => (
            <div
              key={r.weekday}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-gray-200 px-3 py-2"
            >
              <label className="flex w-full cursor-pointer items-center gap-2.5 text-sm font-medium text-gray-900 sm:w-44">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={r.open}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((x, i) => (i === idx ? { ...x, open: e.target.checked } : x)),
                    )
                  }
                />
                <span
                  aria-hidden="true"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-gray-300 bg-white text-sm font-semibold text-ink-3 motion-safe:transition-colors motion-safe:duration-150 motion-safe:ease-[var(--ease-out)] peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-blue-300"
                >
                  {weekdays[r.weekday].slice(0, 1)}
                </span>
                <span className="text-ink-3 peer-checked:text-ink">{weekdays[r.weekday]}</span>
              </label>
              <div className="flex items-center gap-1.5">
                <TimeField
                  disabled={!r.open}
                  aria-label={`${weekdays[r.weekday]} ${t("et.availability.start", { defaultValue: "başlangıç" })}`}
                  value={r.start}
                  onChange={(v) =>
                    setRows((prev) => prev.map((x, i) => (i === idx ? { ...x, start: v } : x)))
                  }
                />
                <span className="text-muted">–</span>
                <TimeField
                  disabled={!r.open}
                  aria-label={`${weekdays[r.weekday]} ${t("et.availability.end", { defaultValue: "bitiş" })}`}
                  value={r.end}
                  onChange={(v) =>
                    setRows((prev) => prev.map((x, i) => (i === idx ? { ...x, end: v } : x)))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label htmlFor="tz" className="text-sm font-medium text-ink">
          {t("et.availability.timezone")}
        </label>
        <input id="tz" className="input" value={tz} onChange={(e) => setTz(e.target.value)} />
      </div>

      <div className="mt-4">
        <Button loading={putM.isPending} onClick={save}>
          {t("et.availability.save")}
        </Button>
      </div>
    </div>
  );
}

// ---- Bookings tab ---------------------------------------------------

function BookingsTab() {
  const { t } = useTranslation("booking");
  const { data, isLoading } = useBookings();
  const { data: types } = useEventTypes();
  const items = data ?? [];
  const typeName = (id: string) =>
    types?.find((x) => x.id === id)?.name ?? "—";

  return (
    <div className="pt-4">
      <h2 className="text-base font-semibold text-ink mb-4">
        {t("et.bookings.title")}
      </h2>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Icon name="calendar" className="w-6 h-6" />}
          title={t("et.bookings.empty")}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm text-ink-2">
            <thead className="bg-gray-50 text-xs font-semibold text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("et.bookings.invitee")}</th>
                <th className="px-4 py-3 font-semibold">{t("et.bookings.type")}</th>
                <th className="px-4 py-3 font-semibold">{t("et.bookings.when")}</th>
                <th className="px-4 py-3 font-semibold">{t("et.bookings.status")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-t border-gray-200">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {b.invitee_name}
                    <p className="text-xs font-normal text-gray-500">
                      {b.invitee_email}
                    </p>
                  </td>
                  <td className="px-4 py-3">{typeName(b.event_type_id)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(b.start_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function BookingPage() {
  const { t } = useTranslation("booking");
  return (
    <div className="flex-1 overflow-y-auto bg-white px-4 pt-4 pb-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
      <Tabs
        items={[
          {
            id: "event-types",
            label: t("et.tabs.eventTypes"),
            content: <EventTypesTab />,
          },
          {
            id: "availability",
            label: t("et.tabs.availability"),
            content: <AvailabilityTab />,
          },
          {
            id: "bookings",
            label: t("et.tabs.bookings"),
            content: <BookingsTab />,
          },
        ]}
      />
      </div>
    </div>
  );
}
