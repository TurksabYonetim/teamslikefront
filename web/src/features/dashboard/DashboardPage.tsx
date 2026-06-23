import { useMemo, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Topbar } from "@/components/layout/Topbar";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/Icon";
import { useMe } from "@/features/auth/auth.hooks";
import {
  StatCard,
  StatCardSkeleton,
  ChartSkeleton,
  WeeklyBars,
  Donut,
  PresenceDot,
} from "./widgets";
import { useDashboardData } from "./dashboard.hooks";
import {
  deriveStats,
  deriveUpcomingMeetings,
  deriveTeam,
  deriveBookings,
  deriveActivity,
} from "./dashboard.derive";
import { weekly, taskProgress, type BookingStatus } from "./dashboard.mock";

const STATUS_BADGE: Record<BookingStatus, string> = {
  onaylı: "badge badge-green",
  bekliyor: "badge badge-yellow",
  iptal: "badge badge-red",
};
const ROLE_BADGE: Record<string, string> = {
  Sahip: "badge",
  Yönetici: "badge badge-gray",
  Üye: "badge badge-gray",
};

function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card dark:bg-surface dark:border-line ${className ?? ""}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-line dark:border-line">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

/** Bölüm içi zarif hata gösterimi. */
function SectionError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation("dashboard");
  return (
    <EmptyState
      icon={<Icon name="info" className="w-6 h-6" />}
      title={t("error.title")}
      description={t("error.desc")}
      action={
        <Button size="sm" variant="secondary" onClick={onRetry}>
          {t("error.retry")}
        </Button>
      }
    />
  );
}

export function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const { data: me } = useMe();
  const navigate = useNavigate();
  const { users, appointments, meetings, conversations, isLoading, isError, refetch } =
    useDashboardData();

  const inputs = useMemo(
    () => ({ users, appointments, meetings, conversations }),
    [users, appointments, meetings, conversations],
  );
  const stats = useMemo(() => deriveStats(inputs), [inputs]);
  const upcomingMeetings = useMemo(() => deriveUpcomingMeetings(meetings), [meetings]);
  const team = useMemo(() => deriveTeam(users), [users]);
  const recentBookings = useMemo(() => deriveBookings(appointments), [appointments]);
  const activity = useMemo(() => deriveActivity(inputs), [inputs]);

  const firstName = me
    ? (me.full_name || me.email || "").split(/[@\s]/)[0]
    : "";

  return (
    <>
      <Topbar
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="calendar" className="w-4 h-4" />}
              onClick={() => navigate("/appointments")}
            >
              {t("actions.report")}
            </Button>
            <Button
              size="sm"
              leftIcon={<Icon name="plus" className="w-4 h-4" />}
              onClick={() => navigate("/create-meeting")}
            >
              {t("actions.newMeeting")}
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto bg-surface-2 dark:bg-surface-2 p-4 md:p-6 space-y-6">
        {/* Selamlama */}
        <div>
          <h2 className="text-xl font-semibold text-ink">
            {firstName
              ? t("greeting.welcomeNamed", { name: firstName })
              : t("greeting.welcome")}{" "}
            <span aria-hidden="true">👋</span>
          </h2>
          <p className="text-sm text-muted">{t("greeting.summary")}</p>
        </div>

        {/* İstatistik kartları */}
        <div className="tl-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))
            : stats.map((s) => <StatCard key={s.label} stat={s} />)}
        </div>

        {/* Grafik + donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SectionCard
            title={t("sections.weeklyActivity")}
            className="lg:col-span-2"
            action={<span className="badge">{t("sections.thisWeek")}</span>}
          >
            <ErrorBoundary fallback={<SectionError onRetry={refetch} />}>
              {isLoading ? (
                <ChartSkeleton height={240} />
              ) : (
                <WeeklyBars
                  data={weekly}
                  labels={{
                    messages: t("chart.messages"),
                    meetings: t("chart.meetings"),
                  }}
                />
              )}
            </ErrorBoundary>
          </SectionCard>

          <SectionCard title={t("sections.taskProgress")}>
            <ErrorBoundary fallback={<SectionError onRetry={refetch} />}>
              {isLoading ? (
                <ChartSkeleton height={200} />
              ) : (
                <>
                  <Donut
                    done={taskProgress.done}
                    total={taskProgress.total}
                    labels={{
                      done: t("task.done"),
                      remaining: t("task.remaining"),
                      unit: t("task.unit", {
                        done: taskProgress.done,
                        total: taskProgress.total,
                      }),
                    }}
                  />
                  <div className="mt-4 flex justify-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-ink tabular-nums">
                        {taskProgress.done}
                      </div>
                      <div className="text-muted text-xs">{t("task.done")}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-ink tabular-nums">
                        {taskProgress.total - taskProgress.done}
                      </div>
                      <div className="text-muted text-xs">
                        {t("task.remaining")}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </ErrorBoundary>
          </SectionCard>
        </div>

        {/* Toplantılar + aktivite */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard
            title={t("sections.upcomingMeetings")}
            action={
              <Link
                to="/meetings"
                className="text-sm font-medium text-brand hover:underline rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {t("links.all")}
              </Link>
            }
          >
            {isError ? (
              <SectionError onRetry={refetch} />
            ) : isLoading ? (
              <ul className="space-y-3" aria-hidden="true">
                {Array.from({ length: 3 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg animate-pulse bg-surface-3 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-3" />
                      <div className="h-3 w-1/3 animate-pulse rounded bg-surface-3" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : upcomingMeetings.length === 0 ? (
              <EmptyState
                icon={<Icon name="video" className="w-6 h-6" />}
                title={t("empty.meetingsTitle")}
                description={t("empty.meetingsDesc")}
              />
            ) : (
              <ul className="tl-stagger space-y-3">
                {upcomingMeetings.map((m) => (
                  <li key={m.id} className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-lg bg-brand-soft text-brand dark:bg-brand/20 dark:text-brand-soft grid place-items-center shrink-0">
                      <Icon name="video" className="w-5 h-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-ink text-sm truncate">
                        {m.title}
                      </div>
                      <div className="text-xs text-muted">
                        {m.time} · {m.duration}
                      </div>
                    </div>
                    {m.joinUrl ? (
                      <a
                        href={m.joinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 inline-flex items-center justify-center rounded-lg font-medium select-none h-8 px-3 text-xs bg-brand text-white hover:bg-brand-600 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        {t("meeting.join")}
                      </a>
                    ) : (
                      <Link
                        to="/meetings"
                        className="shrink-0 inline-flex items-center justify-center rounded-lg font-medium select-none h-8 px-3 text-xs bg-brand text-white hover:bg-brand-600 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        {t("meeting.join")}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title={t("sections.recentActivity")}>
            {isError ? (
              <SectionError onRetry={refetch} />
            ) : isLoading ? (
              <ul className="space-y-4" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full animate-pulse bg-surface-3 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-3/4 animate-pulse rounded bg-surface-3" />
                      <div className="h-3 w-1/4 animate-pulse rounded bg-surface-3" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : activity.length === 0 ? (
              <EmptyState
                icon={<Icon name="bell" className="w-6 h-6" />}
                title={t("empty.activityTitle")}
                description={t("empty.activityDesc")}
              />
            ) : (
              <ul className="tl-stagger space-y-4">
                {activity.map((a, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Avatar initials={a.initials} color={a.color} size="sm" />
                    <div className="min-w-0 flex-1 text-sm">
                      <span className="font-semibold text-ink">{a.who}</span>{" "}
                      <span className="text-ink-3">{a.action}</span>
                      <div className="text-xs text-muted mt-0.5">{a.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        {/* Son rezervasyonlar tablosu */}
        <SectionCard
          title={t("sections.recentBookings")}
          action={
            <Link
              to="/appointments"
              className="text-sm font-medium text-brand hover:underline rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {t("links.all")}
            </Link>
          }
          className="overflow-hidden"
        >
          {isError ? (
            <SectionError onRetry={refetch} />
          ) : isLoading ? (
            <div className="space-y-3" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-9 w-full animate-pulse rounded bg-surface-3" />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <EmptyState
              icon={<Icon name="calendar" className="w-6 h-6" />}
              title={t("empty.bookingsTitle")}
              description={t("empty.bookingsDesc")}
            />
          ) : (
            <div className="-m-5 overflow-x-auto">
              <table className="w-full text-sm text-left text-muted">
                <thead className="text-xs font-semibold text-muted bg-surface-2 dark:bg-surface-3">
                  <tr>
                    <th scope="col" className="px-5 py-3">{t("table.customer")}</th>
                    <th scope="col" className="px-5 py-3">{t("table.type")}</th>
                    <th scope="col" className="px-5 py-3">{t("table.date")}</th>
                    <th scope="col" className="px-5 py-3">{t("table.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b, i) => (
                    <tr
                      key={i}
                      className="bg-surface border-b border-line dark:border-line hover:bg-surface-2 dark:hover:bg-surface-3 transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)]"
                    >
                      <td className="px-5 py-3">
                        <div className="font-medium text-ink">{b.who}</div>
                        <div className="text-xs text-muted">{b.email}</div>
                      </td>
                      <td className="px-5 py-3">{b.type}</td>
                      <td className="px-5 py-3 whitespace-nowrap">{b.date}</td>
                      <td className="px-5 py-3">
                        <span className={STATUS_BADGE[b.status]}>
                          {t(`status.${b.status}`)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* Ekip */}
        <SectionCard
          title={t("sections.team")}
          action={
            <Link
              to="/users"
              className="text-sm font-medium text-brand hover:underline rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {t("links.manage")}
            </Link>
          }
        >
          {isError ? (
            <SectionError onRetry={refetch} />
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 rounded-full animate-pulse bg-surface-3 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-3" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-surface-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : team.length === 0 ? (
            <EmptyState
              icon={<Icon name="users" className="w-6 h-6" />}
              title={t("empty.teamTitle")}
              description={t("empty.teamDesc")}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {team.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 dark:hover:bg-surface-3 transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)]"
                >
                  <div className="relative">
                    <Avatar initials={u.initials} color={u.color} />
                    <span className="absolute -bottom-0.5 -right-0.5">
                      <PresenceDot
                        presence={u.presence}
                        label={t(`presence.${u.presence}`)}
                      />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-ink text-sm truncate">
                      {u.name}
                    </div>
                    <div className="text-xs text-muted">{u.role}</div>
                  </div>
                  <span className={ROLE_BADGE[u.role] ?? "badge badge-gray"}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
