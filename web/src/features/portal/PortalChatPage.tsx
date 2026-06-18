import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonText } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { apiErrorMessage } from "@/lib/api";
import { PortalTopbar } from "./PortalPage";
import {
  usePortalToken,
  useThreads,
  useMessages,
  useSendMessage,
  useStartThread,
  useSellers,
} from "./portal.hooks";
import { colorFor, fmtTime, initialsOf } from "./portal.ui";
import type { PortalMessage, PortalThread } from "./portal.types";

function threadLabel(t: PortalThread, fallback: string) {
  return t.seller_name ?? t.seller_user_id ?? `${fallback} #${t.conversation_id}`;
}

/** Mesaj müşteriye mi (mine) ait? api.ts normalizeMessage'ta hesaplanır. */
function isMine(m: PortalMessage) {
  return m.mine === true;
}

export function PortalChatPage() {
  const { t } = useTranslation("portal");
  const toast = useToast();
  const { hasToken } = usePortalToken();
  const [searchParams] = useSearchParams();
  const presetSeller = searchParams.get("seller");

  const threads = useThreads();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  /** Mobilde liste↔sohbet geçişi (md altı tek panel gösterilir). */
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // İlk thread'i otomatik seç.
  useEffect(() => {
    if (activeId == null && threads.data && threads.data.length > 0) {
      setActiveId(threads.data[0].conversation_id);
    }
  }, [threads.data, activeId]);

  // URL'de seller param'ı varsa yeni sohbet modalını aç.
  useEffect(() => {
    if (presetSeller) setNewOpen(true);
  }, [presetSeller]);

  const active = useMemo(
    () => threads.data?.find((t) => t.conversation_id === activeId) ?? null,
    [threads.data, activeId],
  );
  const messages = useMessages(activeId);
  const send = useSendMessage(activeId);

  // Yeni mesajda/aktif sohbet değişiminde en alta kaydır.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.data, activeId]);

  const onSend = () => {
    const value = text.trim();
    if (!value || activeId == null) return;
    setText("");
    send.mutate(value, {
      onError: () => {
        setText(value);
        toast.show({ message: t("chat.sendError"), variant: "error" });
      },
    });
  };

  const selectThread = (id: number) => {
    setActiveId(id);
    setMobileView("chat");
  };

  if (!hasToken) {
    return (
      <div className="h-screen flex flex-col bg-surface-2 dark:bg-gray-950">
        <PortalTopbar onWhoami={() => {}} />
        <div className="flex-1 grid place-items-center p-6">
          <div className="card p-8 max-w-sm dark:bg-gray-900 dark:border-gray-800">
            <EmptyState
              title={t("chat.gateTitle")}
              description={t("chat.gateDesc")}
              icon={<Icon name="key" className="w-6 h-6" />}
              action={
                <Link to="/portal" className="btn btn-primary">
                  {t("chat.goToPortal")}
                </Link>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-surface-2 dark:bg-gray-950">
      <PortalTopbar onWhoami={() => {}} />
      <div className="flex flex-1 overflow-hidden">
        {/* thread listesi — mobilde yalnız "list" görünümünde */}
        <aside
          className={
            "w-full md:w-72 shrink-0 bg-white dark:bg-gray-900 border-r border-line dark:border-gray-800 flex-col " +
            (mobileView === "list" ? "flex" : "hidden md:flex")
          }
        >
          <div className="flex items-center justify-between px-4 h-14 border-b border-line-2 dark:border-gray-800">
            <h2 className="text-base font-semibold text-ink dark:text-white">
              {t("chat.myChats")}
            </h2>
            <button
              type="button"
              className="p-1.5 rounded-lg text-muted hover:bg-surface-3 dark:hover:bg-gray-800 transition-[transform,background-color] duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97]"
              onClick={() => setNewOpen(true)}
              aria-label={t("chat.newChat")}
              title={t("chat.newChat")}
            >
              <Icon name="plus" className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {threads.isLoading && (
              <div className="p-2 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-3 dark:bg-gray-800 animate-pulse shrink-0" />
                    <div className="flex-1">
                      <SkeletonText lines={2} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {threads.isError && (
              <EmptyState
                className="py-8"
                title={t("chat.threadsErrorTitle")}
                description={apiErrorMessage(threads.error)}
                icon={<Icon name="info" className="w-6 h-6" />}
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => threads.refetch()}
                  >
                    {t("chat.retry")}
                  </Button>
                }
              />
            )}

            {threads.data && threads.data.length === 0 && (
              <EmptyState
                className="py-8"
                title={t("chat.threadsEmptyTitle")}
                description={t("chat.threadsEmptyDesc")}
                icon={<Icon name="chat" className="w-6 h-6" />}
                action={
                  <Button size="sm" onClick={() => setNewOpen(true)}>
                    {t("chat.startNew")}
                  </Button>
                }
              />
            )}

            {threads.data?.map((th) => {
              const label = threadLabel(th, t("chat.agent"));
              const activeRow = th.conversation_id === activeId;
              return (
                <button
                  key={th.conversation_id}
                  type="button"
                  onClick={() => selectThread(th.conversation_id)}
                  aria-current={activeRow ? "true" : undefined}
                  className={
                    "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-[transform,background-color] duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.99] " +
                    (activeRow
                      ? "bg-brand-softer dark:bg-blue-500/15"
                      : "hover:bg-surface-2 dark:hover:bg-gray-800")
                  }
                >
                  <Avatar
                    initials={initialsOf(label)}
                    color={colorFor(label)}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-sm text-ink dark:text-white truncate flex-1">
                        {label}
                      </span>
                      <span className="text-xs text-muted shrink-0">
                        {fmtTime(th.last_message_at)}
                      </span>
                    </div>
                    <div className="text-xs text-muted truncate">
                      {th.last_message ?? ""}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <Link
            to="/portal"
            className="text-sm text-brand hover:underline p-4 border-t border-line-2 dark:border-gray-800 inline-flex items-center gap-1"
          >
            <Icon name="chevronLeft" className="w-4 h-4" /> {t("chat.backToPortal")}
          </Link>
        </aside>

        {/* sohbet — mobilde yalnız "chat" görünümünde */}
        <main
          className={
            "flex-1 flex-col bg-white dark:bg-gray-900 min-w-0 " +
            (mobileView === "chat" ? "flex" : "hidden md:flex")
          }
        >
          {active ? (
            <>
              <header className="flex items-center gap-3 px-4 md:px-5 h-14 border-b border-line dark:border-gray-800">
                <button
                  type="button"
                  className="md:hidden -ml-1 p-1.5 rounded-lg text-muted hover:bg-surface-3 dark:hover:bg-gray-800 transition-[transform,background-color] duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97]"
                  onClick={() => setMobileView("list")}
                  aria-label={t("chat.backToList")}
                >
                  <Icon name="chevronLeft" className="w-5 h-5" />
                </button>
                <Avatar
                  initials={initialsOf(threadLabel(active, t("chat.agent")))}
                  color={colorFor(threadLabel(active, t("chat.agent")))}
                  size="sm"
                />
                <div className="min-w-0">
                  <div className="text-base font-semibold text-ink dark:text-white truncate">
                    {threadLabel(active, t("chat.agent"))}
                  </div>
                  <div className="text-xs text-muted">{t("chat.agent")}</div>
                </div>
              </header>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-5 scroll-smooth motion-reduce:scroll-auto"
              >
                {messages.isLoading && (
                  <div className="space-y-4">
                    <div className="max-w-[60%]">
                      <SkeletonText lines={2} />
                    </div>
                    <div className="max-w-[55%] ml-auto">
                      <SkeletonText lines={2} />
                    </div>
                    <div className="max-w-[65%]">
                      <SkeletonText lines={1} />
                    </div>
                  </div>
                )}

                {messages.isError && (
                  <EmptyState
                    title={t("chat.messagesErrorTitle")}
                    description={apiErrorMessage(messages.error)}
                    icon={<Icon name="info" className="w-6 h-6" />}
                    action={
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => messages.refetch()}
                      >
                        {t("chat.retry")}
                      </Button>
                    }
                  />
                )}

                {messages.data && messages.data.length === 0 && (
                  <EmptyState
                    title={t("chat.messagesEmptyTitle")}
                    description={t("chat.messagesEmptyDesc")}
                    icon={<Icon name="chat" className="w-6 h-6" />}
                  />
                )}

                {messages.data && messages.data.length > 0 && (
                  <ul className="flex flex-col gap-3">
                    {messages.data.map((m, i) => {
                      const mine = isMine(m);
                      const label = threadLabel(active, t("chat.agent"));
                      return (
                        <li
                          key={m.id ?? i}
                          className={
                            "flex gap-2 max-w-[85%] sm:max-w-[78%] " +
                            (mine ? "ml-auto flex-row-reverse" : "")
                          }
                        >
                          <Avatar
                            initials={mine ? t("chat.you") : initialsOf(label)}
                            color={mine ? "var(--color-brand)" : colorFor(label)}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <div
                              className={
                                "px-3 py-2 text-sm rounded-2xl break-words " +
                                (mine
                                  ? "bg-brand text-white rounded-tr-sm"
                                  : "bg-surface-3 dark:bg-gray-800 text-ink dark:text-gray-100 rounded-tl-sm")
                              }
                            >
                              {m.content}
                            </div>
                            <div
                              className={
                                "text-xs text-muted mt-0.5 " +
                                (mine ? "text-right" : "")
                              }
                            >
                              {fmtTime(m.created_at)}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="border-t border-line dark:border-gray-800 p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSend();
                  }}
                  className="flex items-center gap-2 rounded-lg border border-line dark:border-gray-700 bg-white dark:bg-gray-800 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand px-3 py-1.5 transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)]"
                >
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t("chat.messagePlaceholder")}
                    aria-label={t("chat.messagePlaceholder")}
                    className="flex-1 bg-transparent outline-none text-sm py-1 text-ink dark:text-white placeholder:text-gray-400"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!text.trim() || send.isPending}
                    aria-label={t("chat.send")}
                  >
                    {send.isPending ? (
                      <Spinner className="w-4 h-4 border-white/40 border-t-white" />
                    ) : (
                      <Icon name="send" className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 grid place-items-center p-6">
              <EmptyState
                title={t("chat.noActiveTitle")}
                description={t("chat.noActiveDesc")}
                icon={<Icon name="chat" className="w-6 h-6" />}
                action={
                  <Button size="sm" onClick={() => setNewOpen(true)}>
                    {t("chat.startNew")}
                  </Button>
                }
              />
            </div>
          )}
        </main>
      </div>

      <NewThreadModal
        open={newOpen}
        presetSeller={presetSeller}
        onClose={() => setNewOpen(false)}
        onStarted={(th) => {
          setNewOpen(false);
          if (th?.conversation_id != null) {
            setActiveId(th.conversation_id);
            setMobileView("chat");
          }
        }}
      />
    </div>
  );
}

function NewThreadModal({
  open,
  presetSeller,
  onClose,
  onStarted,
}: {
  open: boolean;
  presetSeller: string | null;
  onClose: () => void;
  onStarted: (t: PortalThread | undefined) => void;
}) {
  const { t } = useTranslation("portal");
  const toast = useToast();
  const sellers = useSellers();
  const start = useStartThread();
  const [sellerId, setSellerId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      setSellerId(presetSeller ?? sellers.data?.[0]?.user_id ?? "");
      setMessage(t("newThread.defaultMessage"));
    }
  }, [open, presetSeller, sellers.data, t]);

  const submit = () => {
    if (!sellerId) return;
    start.mutate(
      { seller_user_id: sellerId, initial_message: message.trim() || null },
      {
        onSuccess: (th) => onStarted(th),
        onError: () =>
          toast.show({ message: t("newThread.error"), variant: "error" }),
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("newThread.title")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("newThread.cancel")}
          </Button>
          <Button
            onClick={submit}
            loading={start.isPending}
            disabled={!sellerId || start.isPending}
          >
            {start.isPending ? t("newThread.starting") : t("newThread.start")}
          </Button>
        </>
      }
    >
      {sellers.isLoading ? (
        <>
          <label className="label" htmlFor="new-thread-seller">
            {t("newThread.selectSeller")}
          </label>
          <div className="mb-4">
            <SkeletonText lines={1} />
          </div>
        </>
      ) : sellers.data && sellers.data.length === 0 ? (
        <>
          <label className="label" htmlFor="new-thread-seller">
            {t("newThread.selectSeller")}
          </label>
          <p className="text-sm text-muted mb-4">{t("newThread.noSellers")}</p>
        </>
      ) : (
        <div className="mb-4">
          <Select
            id="new-thread-seller"
            label={t("newThread.selectSeller")}
            value={sellerId}
            onChange={setSellerId}
            options={(sellers.data ?? []).map((s) => ({
              value: s.user_id,
              label: `${s.full_name} — ${s.role}`,
            }))}
          />
        </div>
      )}
      <label className="label" htmlFor="new-thread-message">
        {t("newThread.firstMessage")}
      </label>
      <textarea
        id="new-thread-message"
        className="input"
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {start.isError && (
        <p className="text-xs text-danger mt-2" role="alert">
          {t("newThread.error")}
        </p>
      )}
    </Modal>
  );
}
