import { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlinePaperClip, HiOutlinePaperAirplane, HiOutlineClock, HiOutlineDocumentText, HiOutlineCheck, HiOutlineChatBubbleLeftRight, HiOutlineXMark, HiOutlineChevronLeft } from "react-icons/hi2";
import clsx from "clsx";
import { Backdrop, Button, Dropdown, DropdownItem, EmptyState, IconButton, Modal } from "@/components/ui";
import { useSms, smsStore } from "./smsStore";
import { formatNumber } from "./routing";
import type { SmsMedia } from "./phone.types";

/** İki kelimeye kadar baş harflerden monogram üretir (avatar için). */
function initials(name: string, lang: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const chars = parts.slice(0, 2).map((p) => p[0] ?? "");
  return (chars.join("") || name.slice(0, 2)).toLocaleUpperCase(lang);
}

/** İki zaman damgası aynı takvim gününde mi? (gün ayıracı için) */
function sameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/** SMS/MMS sekmesi: thread listesi (sol) + sohbet & composer (sağ). */
export function MessagesPane() {
  const { t, i18n } = useTranslation("phone");
  const threads = useSms((s) => s.threads);
  const templates = useSms((s) => s.templates);
  const scheduled = useSms((s) => s.scheduled);
  const activeThreadId = useSms((s) => s.activeThreadId);

  const [draft, setDraft] = useState("");
  const [pendingMedia, setPendingMedia] = useState<SmsMedia[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  // Mobilde sohbet listesi sağdan açılan drawer'da durur (md+ sabit kolon).
  const [listOpen, setListOpen] = useState(false);

  const pickThread = (id: string) => {
    smsStore.getState().selectThread(id);
    setListOpen(false);
  };

  const active = useMemo(
    () => threads.find((th) => th.id === activeThreadId) ?? null,
    [threads, activeThreadId],
  );

  const timeFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { hour: "2-digit", minute: "2-digit" }),
    [i18n.language],
  );

  const dayFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { day: "numeric", month: "long" }),
    [i18n.language],
  );

  // Zamanı gelen planlı SMS'leri periyodik gönder (mock köprü).
  useEffect(() => {
    const id = window.setInterval(() => smsStore.getState().flushDue(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const send = () => {
    if (!active || !draft.trim()) return;
    smsStore.getState().sendMessage(active.id, draft, pendingMedia.length ? pendingMedia : undefined);
    setDraft("");
    setPendingMedia([]);
  };

  const confirmSchedule = () => {
    if (!active || !draft.trim() || !scheduleAt) return;
    const at = new Date(scheduleAt).getTime();
    if (Number.isNaN(at)) return;
    smsStore.getState().scheduleSms(active.id, draft, at);
    setDraft("");
    setScheduleAt("");
    setPendingMedia([]);
    setScheduleOpen(false);
  };

  const lastPreview = (id: string) => {
    const th = threads.find((x) => x.id === id);
    const last = th?.messages[th.messages.length - 1];
    return last?.body ?? "";
  };

  const threadList = (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-ink">{t("messages.threads")}</h2>
        <IconButton label={t("messages.closeThreads")} onClick={() => setListOpen(false)} className="md:hidden">
          <HiOutlineXMark className="h-5 w-5" aria-hidden />
        </IconButton>
      </div>
      {threads.length === 0 ? (
        <EmptyState title={t("messages.empty")} description={t("messages.emptyDescription")} />
      ) : (
        <ul className="tl-stagger flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {threads.map((th) => {
            const selected = th.id === activeThreadId;
            return (
              <li key={th.id}>
                <button
                  type="button"
                  onClick={() => pickThread(th.id)}
                  aria-current={selected ? "true" : undefined}
                  className={
                    "msg-thread flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors motion-safe:active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 " +
                    (selected ? "bg-primary-50 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800")
                  }
                >
                  <span className="msg-avatar" aria-hidden="true">{initials(th.contact, i18n.language)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{th.contact}</p>
                    <p className="truncate text-xs text-muted">{lastPreview(th.id)}</p>
                  </div>
                  {th.unread > 0 && (
                    <span className="msg-badge inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-semibold text-white">
                      {th.unread}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );

  return (
    <div className="messages-pane mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col p-3 sm:p-4 md:flex-row md:gap-4">
      {listOpen && <Backdrop level="drawer" onClick={() => setListOpen(false)} className="md:hidden" />}
      <aside
        aria-label={t("messages.threads")}
        className={clsx(
          "flex min-h-0 flex-col bg-surface",
          // Mobil: sağdan açılan drawer.
          "fixed inset-y-0 end-0 z-40 w-full max-w-[calc(100vw-3rem)] border-s border-line p-4 shadow-2xl sm:max-w-xs",
          listOpen
            ? "max-md:motion-safe:[animation:tl-drawer-in-end_var(--dur-modal)_var(--ease-drawer)]"
            : "max-md:hidden",
          // md+: statik sol kolon.
          "md:static md:z-auto md:w-full md:max-w-xs md:shrink-0 md:border-s-0 md:p-0 md:shadow-none",
        )}
      >
        {threadList}
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-surface dark:border-gray-700 dark:bg-gray-800">
        {!active ? (
          <div className="msg-empty flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <HiOutlineChatBubbleLeftRight className="msg-empty-illus" size={56} aria-hidden />
            <p className="max-w-xs text-sm text-muted dark:text-gray-400">{t("messages.selectThread")}</p>
            <Button variant="secondary" className="md:hidden" onClick={() => setListOpen(true)}>
              <HiOutlineChatBubbleLeftRight size={18} aria-hidden />
              <span className="ml-1.5">{t("messages.openThreads")}</span>
            </Button>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-2 border-b border-line px-2 py-2.5 sm:px-4 sm:py-3 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setListOpen(true)}
                className="-ms-0.5 inline-flex shrink-0 items-center gap-0.5 rounded-lg py-1.5 pe-2 ps-1 text-sm font-medium text-brand transition-colors hover:bg-brand-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-brand md:hidden"
              >
                <HiOutlineChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
                <span>{t("messages.threads")}</span>
              </button>
              <span className="msg-avatar shrink-0" aria-hidden="true">{initials(active.contact, i18n.language)}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{active.contact}</p>
                <p className="truncate text-xs text-muted">{formatNumber(active.e164)}</p>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-4">
              {active.messages.map((m, i) => {
                const prev = active.messages[i - 1];
                const showDay = !prev || !sameDay(prev.sentAt, m.sentAt);
                const showSender = !m.outbound && (!prev || prev.outbound || showDay);
                return (
                  <Fragment key={m.id}>
                    {showDay && <span className="msg-daysep">{dayFmt.format(new Date(m.sentAt))}</span>}
                    <div className={"msg-row flex flex-col " + (m.outbound ? "items-end" : "items-start")}>
                      {showSender && <p className="msg-sender">{active.contact}</p>}
                      <div
                        className={
                          "max-w-[75%] rounded-2xl px-3 py-2 text-sm " +
                          (m.outbound
                            ? "msg-bubble-out bg-primary-600 text-white"
                            : "msg-bubble-in bg-surface-2 text-ink dark:bg-gray-700 dark:text-gray-100")
                        }
                      >
                        {m.media?.map((md) => (
                          <span key={md.name} className="mb-1 flex items-center gap-1 text-xs opacity-90">
                            <HiOutlinePaperClip size={14} aria-hidden /> {md.name}
                          </span>
                        ))}
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      </div>
                      <span className={"msg-meta " + (m.outbound ? "justify-end" : "")}>
                        <span className="tabular-nums">{timeFmt.format(new Date(m.sentAt))}</span>
                        {m.outbound && <HiOutlineCheck className="msg-check" aria-label={t("messages.delivered")} />}
                      </span>
                    </div>
                  </Fragment>
                );
              })}
            </div>

            <div className="border-t border-line p-3 sm:p-4 dark:border-gray-700">
              {pendingMedia.length > 0 && (
                <div className="mb-2 flex items-center gap-1 text-xs text-muted dark:text-gray-400" role="status">
                  <HiOutlinePaperClip size={14} aria-hidden /> {t("messages.attached")}
                </div>
              )}
              {/* Textarea üstte tam genişlik; araç çubuğu altta (araçlar solda, gönder sağda). */}
              <div className="flex flex-col gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t("messages.composerPlaceholder")}
                  aria-label={t("messages.composerPlaceholder")}
                  rows={1}
                  className="msg-input input min-h-[2.75rem] w-full min-w-0 resize-none"
                />

                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <Dropdown
                      label={t("messages.template")}
                      side="top"
                      triggerClassName="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors motion-safe:active:scale-[0.97] hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 dark:text-gray-400 dark:hover:bg-gray-700"
                      trigger={<HiOutlineDocumentText size={20} aria-hidden />}
                    >
                      {templates.map((tpl) => (
                        <DropdownItem key={tpl.id} onSelect={() => setDraft(tpl.body)}>
                          {tpl.name}
                        </DropdownItem>
                      ))}
                    </Dropdown>

                    <button
                      type="button"
                      aria-label={t("messages.attach")}
                      onClick={() => setPendingMedia([{ kind: "image", name: "image.jpg" }])}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors motion-safe:active:scale-[0.97] hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <HiOutlinePaperClip size={20} aria-hidden />
                    </button>

                    <button
                      type="button"
                      aria-label={t("messages.schedule")}
                      onClick={() => setScheduleOpen(true)}
                      disabled={!draft.trim()}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors motion-safe:active:scale-[0.97] hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <HiOutlineClock size={20} aria-hidden />
                    </button>
                  </div>

                  <Button className="msg-send shrink-0" onClick={send} disabled={!draft.trim()} aria-label={t("messages.send")}>
                    <HiOutlinePaperAirplane size={16} aria-hidden /> <span className="ml-1 hidden sm:inline">{t("messages.send")}</span>
                  </Button>
                </div>
              </div>

              {scheduled.length > 0 && (
                <p className="msg-sched mt-2 text-xs text-muted dark:text-gray-400">
                  <HiOutlineClock size={14} aria-hidden />
                  {t("messages.scheduledCount", { count: scheduled.length })}
                </p>
              )}
            </div>
          </>
        )}
      </section>

      <Modal open={scheduleOpen} onClose={() => setScheduleOpen(false)} title={t("messages.scheduleTitle")}>
        <div className="flex flex-col gap-3">
          <label htmlFor="sms-schedule-at" className="text-sm font-medium text-ink-2 dark:text-gray-300">
            {t("messages.scheduleAt")}
          </label>
          <input
            id="sms-schedule-at"
            type="datetime-local"
            aria-label={t("messages.scheduleAt")}
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
            className="input"
          />
          <div className="flex justify-end gap-2">
            <Button onClick={confirmSchedule} disabled={!scheduleAt}>
              {t("messages.scheduleConfirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
