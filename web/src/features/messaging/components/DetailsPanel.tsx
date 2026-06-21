import { useTranslation } from "react-i18next";
import {
  HiOutlineXMark,
  HiOutlineStar,
  HiOutlineDocument,
  HiOutlineLink,
  HiOutlinePhoto,
  HiOutlineClock,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import clsx from "clsx";
import { messagingStore, useMessaging } from "../store";
import { memberById, presenceOf } from "../members";
import { Avatar, Badge, IconButton, PresenceDot, Backdrop } from "@/components/ui";
import type { ConvPriority, DisappearTimer } from "../types";

const PRIORITIES: ConvPriority[] = ["urgent", "high", "medium", "low"];
const TIMERS: DisappearTimer[] = ["off", "24h", "7d"];

export function DetailsPanel() {
  const { t } = useTranslation("messaging");
  const channels = useMessaging((s) => s.channels);
  const activeChannelId = useMessaging((s) => s.activeChannelId);
  const { toggleDetails, setPriority, setDisappearing, submitCsat } = messagingStore.getState();

  const channel = channels.find((c) => c.id === activeChannelId);
  if (!channel) return null;

  const isDm = channel.kind === "dm";
  const contact = channel.dmUserId ? memberById(channel.dmUserId) : undefined;
  const members = (channel.memberIds ?? [])
    .map((id) => memberById(id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m))
    .slice(0, 4);

  return (
    <>
      <Backdrop level="drawer" onClick={toggleDetails} className="lg:hidden" />
      <aside
        aria-label={t("detailsPanel.title")}
        className="fixed inset-y-0 end-0 z-40 flex w-full max-w-[calc(100vw-2rem)] flex-col border-s border-line bg-white shadow-2xl max-lg:motion-safe:[animation:tl-drawer-in-end_var(--dur-modal)_var(--ease-drawer)] sm:max-w-sm lg:static lg:z-auto lg:w-72 lg:max-w-none lg:shadow-none xl:w-80 dark:border-gray-700 dark:bg-gray-800"
      >
        <header className="flex items-center justify-between border-b border-line p-3 dark:border-gray-700">
          <span className="text-sm font-semibold text-ink dark:text-white">{t("detailsPanel.title")}</span>
          <IconButton label={t("cancel")} onClick={toggleDetails}>
            <HiOutlineXMark className="h-5 w-5" aria-hidden />
          </IconButton>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <div className="flex flex-col items-center text-center">
            <span className="relative inline-block">
              <Avatar name={channel.name} size="lg" />
              {contact ? <PresenceDot presence={contact.presence} className="absolute bottom-0.5 end-0.5" /> : null}
            </span>
            <div className="mt-2 text-base font-semibold text-ink dark:text-white">{channel.name}</div>
            <div className="flex flex-wrap items-center justify-center gap-1 text-sm text-muted">
              {isDm ? t("directMessage") : t("channels")}
              {channel.e2ee ? (
                <Badge tone="positive">
                  <HiOutlineLockClosed className="h-3 w-3" aria-hidden /> {t("e2ee")}
                </Badge>
              ) : null}
              {channel.label ? <Badge tone="neutral">{channel.label}</Badge> : null}
            </div>
          </div>

          {!isDm ? (
            <section>
              <h3 className="mb-1 text-sm font-semibold text-muted">{t("detailsPanel.members")}</h3>
              <ul className="space-y-1">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center gap-2">
                    <span className="relative inline-block">
                      <Avatar name={m.name} size="sm" />
                      <PresenceDot presence={presenceOf(m.id)} className="absolute -bottom-0.5 -end-0.5" />
                    </span>
                    <span className="flex-1 truncate text-sm text-ink dark:text-white">{m.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {channel.isCustomer ? (
            <section>
              <h3 className="mb-1 text-sm font-semibold text-muted">{t("detailsPanel.priority")}</h3>
              <div className="flex flex-wrap gap-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(channel.id, p)}
                    aria-pressed={channel.priority === p}
                    className={clsx(
                      "h-9 rounded-md border px-2 text-sm transition-[transform,background-color,color] duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97]",
                      channel.priority === p
                        ? "border-brand bg-surface-2 text-brand"
                        : "border-line text-muted hover:bg-surface-2 dark:border-gray-700",
                    )}
                  >
                    {t(`priority.${p}`)}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h3 className="mb-1 flex items-center gap-1 text-sm font-semibold text-muted">
              <HiOutlineClock className="h-3.5 w-3.5" aria-hidden /> {t("detailsPanel.disappearing")}
            </h3>
            <div className="flex gap-1">
              {TIMERS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDisappearing(channel.id, d)}
                  aria-pressed={(channel.disappearing ?? "off") === d}
                  className={clsx(
                    "h-9 flex-1 rounded-md border text-sm transition-[transform,background-color,color] duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97]",
                    (channel.disappearing ?? "off") === d
                      ? "border-brand bg-surface-2 text-brand"
                      : "border-line text-muted hover:bg-surface-2 dark:border-gray-700",
                  )}
                >
                  {t(`timer.${d}`)}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-1 text-sm font-semibold text-muted">{t("detailsPanel.sharedMedia")}</h3>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-md border border-line p-2 dark:border-gray-700">
                <HiOutlinePhoto className="mx-auto h-4 w-4 text-muted" aria-hidden />
                <div className="mt-1 text-ink dark:text-white">3</div>
                <div className="text-xs text-muted">{t("detailsPanel.images")}</div>
              </div>
              <div className="rounded-md border border-line p-2 dark:border-gray-700">
                <HiOutlineDocument className="mx-auto h-4 w-4 text-muted" aria-hidden />
                <div className="mt-1 text-ink dark:text-white">12</div>
                <div className="text-xs text-muted">{t("detailsPanel.files")}</div>
              </div>
              <div className="rounded-md border border-line p-2 dark:border-gray-700">
                <HiOutlineLink className="mx-auto h-4 w-4 text-muted" aria-hidden />
                <div className="mt-1 text-ink dark:text-white">4</div>
                <div className="text-xs text-muted">{t("detailsPanel.links")}</div>
              </div>
            </div>
          </section>

          {channel.isCustomer ? (
            <section>
              <h3 className="mb-1 text-sm font-semibold text-muted">{t("detailsPanel.csat")}</h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => submitCsat(channel.id, n)}
                    aria-label={t("detailsPanel.csat")}
                    aria-pressed={(channel.csat ?? 0) >= n}
                    className="rounded-md p-1 transition-[transform,background-color] duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-surface-2 motion-safe:active:scale-[0.97] dark:hover:bg-gray-700"
                  >
                    <HiOutlineStar
                      className={clsx("h-5 w-5", (channel.csat ?? 0) >= n ? "text-amber-400" : "text-muted")}
                      aria-hidden
                    />
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </aside>
    </>
  );
}
