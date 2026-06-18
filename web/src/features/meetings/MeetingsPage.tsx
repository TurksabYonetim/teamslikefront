import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Topbar } from "@/components/layout/Topbar";
import { Icon } from "@/components/Icon";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Forbidden } from "@/components/ui";
import { useCan } from "@/lib/authStore";
import { apiErrorMessage } from "@/lib/api";
import { meetingShareUrl } from "@/lib/meetingLink";
import { useMeetings, useCreateMeeting, useGuestToken } from "./meetings.hooks";
import type { ApiMeeting } from "./meetings.types";

/** Backend status'ünü "yaklaşan / bitti" UI ayrımına çevirir. */
function isUpcoming(m: ApiMeeting): boolean {
  if (m.status === "ended") return false;
  if (!m.scheduled_at) return m.status !== "ended";
  const end =
    new Date(m.scheduled_at).getTime() + (m.duration_minutes || 0) * 60_000;
  return end >= Date.now();
}

/** scheduled_at → "5 Haz · 17:00" gibi okunabilir biçim. */
function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}

function MeetingCard({ m }: { m: ApiMeeting }) {
  const { t } = useTranslation("meetings");
  const upcoming = isUpcoming(m);
  const navigate = useNavigate();
  return (
    <div className="rounded-card border border-line bg-surface p-5 transition-shadow duration-200 ease-[var(--ease-out)] hover:shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={
            "grid h-11 w-11 shrink-0 place-items-center rounded-lg " +
            (upcoming
              ? "bg-brand/10 text-brand"
              : "bg-surface-3 text-muted")
          }
        >
          <Icon name="video" className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-ink">{m.title}</h3>
          <p className="text-sm text-muted">
            {formatWhen(m.scheduled_at)} · {m.duration_minutes} {t("list.minutesShort")}
          </p>
        </div>
        <span
          className={
            "inline-flex shrink-0 items-center rounded-md px-2.5 py-0.5 text-xs font-medium " +
            (upcoming
              ? "bg-ok/15 text-ok"
              : "bg-surface-3 text-muted")
          }
        >
          {upcoming ? t("list.upcomingBadge") : t("list.endedBadge")}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted">
        <span className="truncate font-mono">{m.room_name}</span>
        <span className="capitalize">· {m.status}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {upcoming ? (
          <>
            <Button
              size="sm"
              leftIcon={<Icon name="video" className="h-4 w-4" />}
              onClick={() =>
                m.join_url
                  ? navigate("/room", {
                      state: {
                        joinUrl: m.join_url,
                        displayName: m.title,
                        meetingId: m.id,
                        isModerator: true,
                      },
                    })
                  : navigate(`/lobby?meetingId=${m.id}`)
              }
            >
              {t("list.join")}
            </Button>
            <GuestTokenButton meeting={m} />
          </>
        ) : (
          <Button size="sm" variant="secondary" disabled>
            {t("list.noRecording")}
          </Button>
        )}
      </div>
    </div>
  );
}

function GuestTokenButton({ meeting }: { meeting: ApiMeeting }) {
  const { t } = useTranslation("meetings");
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(t("list.guestModal.defaultName"));
  const [ready, setReady] = useState(false);
  const guestToken = useGuestToken();
  const shareUrl = meetingShareUrl(meeting.id);

  const generate = () => {
    setReady(false);
    // Misafir token'ı sunucuda üretilir/doğrulanır; UI yalnızca public linki paylaşır.
    guestToken.mutate(
      { meetingId: meeting.id, body: { guest_name: name || t("list.guestModal.defaultName") } },
      { onSuccess: () => setReady(true) },
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard?.writeText(shareUrl);
      toast.show({ message: t("list.guestModal.copied"), variant: "success" });
    } catch {
      /* pano erişimi yoksa sessizce geç */
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        leftIcon={<Icon name="key" className="h-4 w-4" />}
        onClick={() => {
          setReady(false);
          setOpen(true);
        }}
      >
        {t("list.guest")}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("list.guestModal.title")}
        footer={
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t("list.guestModal.close")}
          </Button>
        }
      >
        <label htmlFor="guest-name" className="label">
          {t("list.guestModal.name")}
        </label>
        <input
          id="guest-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          className="mt-4 w-full"
          loading={guestToken.isPending}
          onClick={generate}
        >
          {guestToken.isPending
            ? t("list.guestModal.generating")
            : t("list.guestModal.generate")}
        </Button>
        {guestToken.isError && (
          <p className="mt-3 text-sm text-danger" role="alert">
            {apiErrorMessage(guestToken.error)}
          </p>
        )}
        {ready && (
          <div className="mt-4 motion-safe:[animation:tl-fade-in_var(--dur-pop)_var(--ease-out)]">
            <label htmlFor="guest-link" className="label">
              {t("list.guestModal.link")}
            </label>
            <div className="flex gap-2">
              <input
                id="guest-link"
                className="input min-w-0 flex-1 font-mono text-xs"
                value={shareUrl}
                readOnly
              />
              <Button
                variant="secondary"
                className="shrink-0"
                aria-label={t("list.guestModal.copy")}
                onClick={copyLink}
              >
                <Icon name="copy" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function CreateMeetingModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation("meetings");
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("2026-06-05T15:00");
  const [duration, setDuration] = useState(45);
  const createMeeting = useCreateMeeting();
  const navigate = useNavigate();

  const submit = () => {
    const finalTitle = title.trim() || t("list.newMeeting");
    createMeeting.mutate(
      {
        title: finalTitle,
        // datetime-local → ISO 8601 (UTC)
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: Number(duration) || 30,
      },
      {
        onSuccess: (created) => {
          toast.show({ message: t("list.createMeeting.created"), variant: "success" });
          onClose();
          // Moderator join_url döndüyse doğrudan görüşmeye gir.
          if (created.join_url) {
            navigate("/room", {
              state: {
                joinUrl: created.join_url,
                displayName: finalTitle,
                meetingId: created.id,
                isModerator: true,
              },
            });
          }
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("list.createMeeting.title")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("list.createMeeting.cancel")}
          </Button>
          <Button loading={createMeeting.isPending} onClick={submit}>
            {createMeeting.isPending
              ? t("list.createMeeting.creating")
              : t("list.createMeeting.create")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="meeting-title" className="label">
            {t("list.createMeeting.name")}
          </label>
          <input
            id="meeting-title"
            className="input"
            placeholder={t("list.createMeeting.namePlaceholder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="meeting-when" className="label">
              {t("list.createMeeting.when")}
            </label>
            <input
              id="meeting-when"
              className="input"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="meeting-duration" className="label">
              {t("list.createMeeting.duration")}
            </label>
            <input
              id="meeting-duration"
              className="input"
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-2">
          <input
            type="checkbox"
            defaultChecked
            className="checkbox"
          />
          {t("list.createMeeting.moderatorJwt")}
        </label>
        {createMeeting.isError && (
          <p className="text-sm text-danger" role="alert">
            {apiErrorMessage(createMeeting.error)}
          </p>
        )}
      </div>
    </Modal>
  );
}

/** Yüklenirken gösterilen iskelet kart (oda kartı düzenini taklit eder). */
function MeetingCardSkeleton() {
  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="h-11 w-11 rounded-lg" />
        <div className="min-w-0 flex-1">
          <SkeletonText lines={2} />
        </div>
      </div>
      <Skeleton className="mt-4 h-8 w-28 rounded-lg" />
    </div>
  );
}

export function MeetingsPage() {
  const { t } = useTranslation("meetings");
  const canView = useCan("meetings.view");
  const [open, setOpen] = useState(false);
  const { data: list = [], isLoading, isError, error, refetch } = useMeetings();

  if (!canView) return <Forbidden />;

  const upcoming = list.filter(isUpcoming);
  const ended = list.filter((m) => !isUpcoming(m));

  return (
    <>
      <Topbar
        title={t("list.title")}
        subtitle={t("list.subtitle")}
        actions={
          <Button
            leftIcon={<Icon name="plus" className="h-4 w-4" />}
            onClick={() => setOpen(true)}
          >
            {t("list.newMeeting")}
          </Button>
        }
      />

      <div className="flex-1 space-y-8 overflow-y-auto bg-surface-2 p-4 md:p-6">
        {isLoading && (
          <section>
            <Skeleton className="mb-3 h-4 w-24" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <MeetingCardSkeleton key={i} />
              ))}
            </div>
          </section>
        )}

        {!isLoading && isError && (
          <div
            className="rounded-card border border-danger/30 bg-danger/5 p-6 text-center"
            role="alert"
          >
            <p className="text-sm text-danger">
              {apiErrorMessage(error) || t("list.loadError")}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => refetch()}
            >
              {t("list.retry")}
            </Button>
          </div>
        )}

        {!isLoading && !isError && list.length === 0 && (
          <EmptyState
            icon={<Icon name="video" className="h-6 w-6" />}
            title={t("list.emptyTitle")}
            description={t("list.emptyDescription")}
            action={
              <Button
                leftIcon={<Icon name="plus" className="h-4 w-4" />}
                onClick={() => setOpen(true)}
              >
                {t("list.newMeeting")}
              </Button>
            }
          />
        )}

        {!isLoading && !isError && upcoming.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-semibold text-ink-2">
              {t("list.upcoming")}
            </h3>
            <div className="tl-stagger grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {upcoming.map((m) => (
                <MeetingCard key={m.id} m={m} />
              ))}
            </div>
          </section>
        )}
        {!isLoading && !isError && ended.length > 0 && (
          <section>
            <h3 className="mb-3 text-sm font-semibold text-ink-2">
              {t("list.past")}
            </h3>
            <div className="tl-stagger grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ended.map((m) => (
                <MeetingCard key={m.id} m={m} />
              ))}
            </div>
          </section>
        )}
      </div>

      <CreateMeetingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
