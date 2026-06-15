import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlinePaperClip, HiOutlinePaperAirplane, HiOutlineClock, HiOutlineDocumentText } from "react-icons/hi2";
import { Button, Dropdown, DropdownItem, EmptyState, Modal } from "@/components/ui";
import { useSms, smsStore } from "./smsStore";
import { formatNumber } from "./routing";
import type { SmsMedia } from "./phone.types";

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

  const active = useMemo(
    () => threads.find((th) => th.id === activeThreadId) ?? null,
    [threads, activeThreadId],
  );

  const timeFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { hour: "2-digit", minute: "2-digit" }),
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

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl gap-4 p-4">
      <aside className="flex w-full max-w-xs shrink-0 flex-col">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{t("messages.threads")}</h2>
        {threads.length === 0 ? (
          <EmptyState title={t("messages.empty")} description={t("messages.emptyDescription")} />
        ) : (
          <ul className="flex flex-col gap-1 overflow-y-auto">
            {threads.map((th) => {
              const selected = th.id === activeThreadId;
              return (
                <li key={th.id}>
                  <button
                    type="button"
                    onClick={() => smsStore.getState().selectThread(th.id)}
                    aria-current={selected ? "true" : undefined}
                    className={
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 " +
                      (selected ? "bg-primary-50 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800")
                    }
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{th.contact}</p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">{lastPreview(th.id)}</p>
                    </div>
                    {th.unread > 0 && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-semibold text-white">
                        {th.unread}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <section className="flex min-w-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {!active ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {t("messages.selectThread")}
          </div>
        ) : (
          <>
            <header className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">{active.contact}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatNumber(active.e164)}</p>
            </header>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
              {active.messages.map((m) => (
                <div key={m.id} className={"flex " + (m.outbound ? "justify-end" : "justify-start")}>
                  <div
                    className={
                      "max-w-[75%] rounded-2xl px-3 py-2 text-sm " +
                      (m.outbound
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100")
                    }
                  >
                    {m.media?.map((md) => (
                      <span key={md.name} className="mb-1 flex items-center gap-1 text-xs opacity-90">
                        <HiOutlinePaperClip size={14} aria-hidden /> {md.name}
                      </span>
                    ))}
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p className={"mt-0.5 text-[10px] " + (m.outbound ? "text-primary-100" : "text-gray-400")}>
                      {timeFmt.format(new Date(m.sentAt))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-3 dark:border-gray-700">
              {pendingMedia.length > 0 && (
                <div className="mb-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400" role="status">
                  <HiOutlinePaperClip size={14} aria-hidden /> {t("messages.attached")}
                </div>
              )}
              <div className="flex items-end gap-2">
                <Dropdown
                  label={t("messages.template")}
                  triggerClassName="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 dark:text-gray-400 dark:hover:bg-gray-700"
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <HiOutlinePaperClip size={20} aria-hidden />
                </button>

                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t("messages.composerPlaceholder")}
                  aria-label={t("messages.composerPlaceholder")}
                  rows={1}
                  className="input min-h-[2.5rem] flex-1 resize-none"
                />

                <button
                  type="button"
                  aria-label={t("messages.schedule")}
                  onClick={() => setScheduleOpen(true)}
                  disabled={!draft.trim()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <HiOutlineClock size={20} aria-hidden />
                </button>

                <Button onClick={send} disabled={!draft.trim()}>
                  <HiOutlinePaperAirplane size={16} aria-hidden /> <span className="ml-1">{t("messages.send")}</span>
                </Button>
              </div>

              {scheduled.length > 0 && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {t("messages.scheduledCount", { count: scheduled.length })}
                </p>
              )}
            </div>
          </>
        )}
      </section>

      <Modal open={scheduleOpen} onClose={() => setScheduleOpen(false)} title={t("messages.scheduleTitle")}>
        <div className="flex flex-col gap-3">
          <label htmlFor="sms-schedule-at" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("messages.scheduleAt")}
          </label>
          <input
            id="sms-schedule-at"
            type="datetime-local"
            aria-label={t("messages.scheduleAt")}
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
            className="input w-full"
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
