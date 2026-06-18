import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useInitFlowbite } from "@/lib/flowbite";
import {
  SkeletonText,
  EmptyState,
  ConfirmDialog,
  Modal,
  Dropdown,
  DropdownItem,
  useToast,
} from "@/components/ui";
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
  useRenameConversation,
  useMessages,
  useSendMessage,
} from "./copilot.hooks";
import { MessageContent } from "./MessageContent";
import {
  filterConversations,
  groupConversationsByDate,
} from "./copilot.utils";
import type { CopilotConversation, CopilotMessage } from "./copilot.types";

/**
 * Flowbite "ai-chat.html" sayfasından çevrildi; gerçek CRUD'a bağlandı.
 *
 * Oturumlar ve mesajlar /v1/copilot uçları üzerinden kalıcıdır. Gerçek bir LLM
 * henüz bağlı değildir: kullanıcı mesajı kaydedilir ve sunucu yer tutucu (echo)
 * bir asistan yanıtı üretip kaydeder (bkz. copilot_service.py TODO).
 */

export function CopilotPage() {
  useInitFlowbite();
  const { t } = useTranslation("copilot");
  const toast = useToast();

  const conversationsQuery = useConversations();
  const sessions = useMemo<CopilotConversation[]>(
    () => conversationsQuery.data ?? [],
    [conversationsQuery.data],
  );

  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();
  const renameConversation = useRenameConversation();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  // Sohbet ayarları modalı (ortak Modal/Overlay primitifi üzerinden — tüm
  // popup'larla aynı backdrop). Sekmeler ve içerideki açılır menüler React
  // state ile yönetilir; Flowbite data-attr'larına bağlı değildir.
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<
    "general" | "data" | "applications" | "security"
  >("general");
  const [themePref, setThemePref] = useState<"system" | "light" | "dark">(
    "system",
  );
  const [chatLang, setChatLang] = useState("en-us");
  const [improveModel, setImproveModel] = useState(true);

  // Geçmiş arama + yeniden adlandırma + silme onayı durumları.
  const [search, setSearch] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [pendingDelete, setPendingDelete] =
    useState<CopilotConversation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const copiedTimer = useRef<number | null>(null);

  // Tarih gruplama + arama filtresi (yalnızca geçmiş çekmecesi için).
  const groupedSessions = useMemo(
    () => groupConversationsByDate(filterConversations(sessions, search)),
    [sessions, search],
  );
  const hasSearchResults = groupedSessions.length > 0;

  const messagesQuery = useMessages(activeId);
  const messages = useMemo<CopilotMessage[]>(
    () => messagesQuery.data ?? [],
    [messagesQuery.data],
  );
  const sendMessage = useSendMessage(activeId);

  // Aktif oturumu seç: liste hazır olunca ilk oturumu seç. Hiç oturum yoksa
  // burada otomatik oluşturmayız; kullanıcı "Yeni sohbet" ile başlatır.
  useEffect(() => {
    if (activeId && sessions.some((s) => s.id === activeId)) return;
    if (sessions.length > 0) {
      setActiveId(sessions[0].id);
    } else if (activeId !== null) {
      setActiveId(null);
    }
  }, [sessions, activeId]);

  // Konuşma yükleme hatası → toast.
  useEffect(() => {
    if (conversationsQuery.isError) {
      toast.show({
        message: t("state.loadConversationsError"),
        variant: "error",
      });
    }
  }, [conversationsQuery.isError, toast, t]);

  // Mesaj yükleme hatası → toast.
  useEffect(() => {
    if (messagesQuery.isError) {
      toast.show({ message: t("state.loadMessagesError"), variant: "error" });
    }
  }, [messagesQuery.isError, toast, t]);

  // Her yeni mesajda en alta kaydır.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, activeId]);

  const messagesLoading =
    !!activeId && messagesQuery.isLoading && messages.length === 0;

  function handleNewChat() {
    createConversation.mutate(
      {},
      {
        onSuccess: (created) => {
          setActiveId(created.id);
          setDraft("");
        },
        onError: () => {
          toast.show({ message: t("state.createError"), variant: "error" });
        },
      },
    );
  }

  function handleSelectSession(id: string) {
    setActiveId(id);
  }

  // Silme: ConfirmDialog ile onaylanır; başarıda "Geri al" eylemli Toast.
  function confirmDeleteSession() {
    const target = pendingDelete;
    if (!target) return;
    setPendingDelete(null);
    deleteConversation.mutate(target.id, {
      onSuccess: () => {
        if (target.id === activeId) setActiveId(null);
        toast.show({
          message: t("state.deleted"),
          variant: "success",
          action: {
            label: t("state.undo"),
            onClick: () => {
              // Silinen oturumu yeniden oluştur (backend'de gerçek restore
              // ucu yok; yeni bir oturum açıp aynı başlığı taşırız).
              createConversation.mutate(
                { title: target.title || undefined },
                {
                  onSuccess: (created) => {
                    if (target.title) {
                      renameConversation.rename(created.id, target.title);
                    }
                    setActiveId(created.id);
                    toast.show({
                      message: t("state.deleteUndone"),
                      variant: "success",
                    });
                  },
                  onError: () => {
                    toast.show({
                      message: t("state.createError"),
                      variant: "error",
                    });
                  },
                },
              );
            },
          },
        });
      },
      onError: () => {
        toast.show({ message: t("state.deleteError"), variant: "error" });
      },
    });
  }

  // Yeniden adlandırma: client-side optimistic (backend PATCH yok).
  function startRename(s: CopilotConversation) {
    setRenamingId(s.id);
    setRenameValue(s.title || "");
  }

  function commitRename() {
    if (!renamingId) return;
    const title = renameValue.trim();
    if (title) {
      renameConversation.rename(renamingId, title);
      toast.show({ message: t("state.renamed"), variant: "success" });
    }
    setRenamingId(null);
    setRenameValue("");
  }

  function cancelRename() {
    setRenamingId(null);
    setRenameValue("");
  }

  // Boş oturumda örnek prompt'a tıklayınca doğrudan gönder.
  function handleSamplePrompt(text: string) {
    if (!activeId || sendMessage.isPending) return;
    sendMessage.mutate(text, {
      onError: () => {
        toast.show({ message: t("state.sendError"), variant: "error" });
      },
    });
  }

  function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || !activeId || sendMessage.isPending) return;
    setDraft("");
    sendMessage.mutate(text, {
      onError: () => {
        setDraft(text);
        toast.show({ message: t("state.sendError"), variant: "error" });
      },
    });
  }

  async function handleCopy(text: string, id?: string) {
    try {
      await navigator.clipboard.writeText(text);
      if (id) {
        setCopiedId(id);
        if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
        copiedTimer.current = window.setTimeout(
          () => setCopiedId(null),
          1500,
        );
      }
      toast.show({ message: t("state.copied"), variant: "success" });
    } catch {
      /* clipboard erişimi yoksa sessizce geç */
    }
  }

  // Bileşen sökülürken "kopyalandı" zamanlayıcısını temizle.
  useEffect(
    () => () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    },
    [],
  );

  const samplePrompts = useMemo(
    () =>
      [
        t("prompts.items.summarize"),
        t("prompts.items.email"),
        t("prompts.items.ideas"),
        t("prompts.items.explain"),
      ] as const,
    [t],
  );

  // Paylaşılan sohbet akışı içeriği — delight varyantları (impeccable live)
  // aynı dinamik render'ı paylaşır; yalnızca sarmalayan kabuğun scoped CSS'i
  // (data-role hedefli) görünümü farklılaştırır.
  const copilotThread = (
    <div className="copilot-thread mx-auto max-w-4xl space-y-6 px-4 py-4 lg:px-6 lg:py-6">
      {messagesLoading && (
        <div className="p-6 bg-white dark:bg-gray-800 shadow-xs rounded-lg">
          <SkeletonText lines={3} />
        </div>
      )}

      {!messagesLoading && !activeId && (
        <EmptyState title={t("state.emptyTitle")} description={t("state.emptyDescription")} />
      )}

      {!messagesLoading && activeId && messages.length === 0 && (
        <>
          <div data-role="assistant" className="msg-card p-6 bg-white dark:bg-gray-800 shadow-xs rounded-lg flex items-start gap-6 motion-safe:[animation:tl-fade-in_240ms_var(--ease-out)]">
            <img className="msg-avatar h-6 w-6 rounded-full" src="/images/logo.svg" alt="logo" />
            <div className="format dark:format-invert format-blue">
              <p>{t("simulated.empty")}</p>
            </div>
          </div>
          <div className="motion-safe:[animation:tl-fade-in_300ms_var(--ease-out)]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("prompts.title")}</h3>
            <p className="mb-3 text-sm text-muted dark:text-gray-400">{t("prompts.subtitle")}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {samplePrompts.map((p, i) => (
                <button key={i} type="button" onClick={() => handleSamplePrompt(p)} disabled={sendMessage.isPending} className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-700 transition-[transform,colors] duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary-500 dark:hover:bg-gray-700 dark:hover:text-white">
                  {p}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {messages.map((m) =>
        m.role === "user" ? (
          <div key={m.id} data-role="user" className="msg-card p-6 bg-white dark:bg-gray-800 shadow-xs rounded-lg flex items-start gap-6 group relative pe-14 motion-safe:[animation:tl-fade-in_240ms_var(--ease-out)]">
            <img className="msg-avatar h-6 w-6 rounded-full" src="/images/users/bonnie-green.png" alt="user" />
            <div className="msg-body format dark:format-invert format-blue min-w-0">
              <MessageContent content={m.content} copyLabel={t("message.copyCode")} copiedLabel={t("message.copied")} onCopyCode={(code) => handleCopy(code)} />
            </div>
            <button type="button" onClick={() => handleCopy(m.content, m.id)} className="msg-copy absolute end-4 top-6 inline-flex cursor-pointer justify-center rounded-lg p-1.5 text-gray-400 opacity-0 transition-opacity duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-gray-100 hover:text-gray-900 focus:opacity-100 group-hover:opacity-100 dark:hover:bg-gray-600 dark:hover:text-white">
              {copiedId === m.id ? (
                <svg className="w-5 h-5 text-green-600 dark:text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5" />
                </svg>
              ) : (
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M8 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1h2a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2Zm6 1h-4v2H9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2h-1V4Zm-6 8a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm1 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Z" clipRule="evenodd" />
                </svg>
              )}
              <span className="sr-only">{t("message.copyText")}</span>
            </button>
          </div>
        ) : (
          <div key={m.id} data-role="assistant" className="msg-card p-6 bg-white dark:bg-gray-800 shadow-xs rounded-lg flex items-start gap-6 group relative pe-14 motion-safe:[animation:tl-fade-in_240ms_var(--ease-out)]">
            <img className="msg-avatar h-6 w-6 rounded-full" src="/images/logo.svg" alt="assistant" />
            <div className="msg-body format dark:format-invert format-blue min-w-0">
              <MessageContent content={m.content} copyLabel={t("message.copyCode")} copiedLabel={t("message.copied")} onCopyCode={(code) => handleCopy(code)} />
              <div className="msg-actions space-x-2 flex items-center">
                <button type="button" onClick={() => handleCopy(m.content, m.id)} className="inline-flex cursor-pointer justify-center rounded-lg p-1.5 text-gray-500 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                  {copiedId === m.id ? (
                    <svg className="w-5 h-5 text-green-600 dark:text-green-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M8 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1h2a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2Zm6 1h-4v2H9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2h-1V4Zm-6 8a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Zm1 3a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="sr-only">{t("message.copyText")}</span>
                </button>
                <button type="button" className="inline-flex cursor-pointer justify-center rounded-lg p-1.5 text-gray-500 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M15.03 9.684h3.965c.322 0 .64.08.925.232.286.153.532.374.717.645a2.109 2.109 0 0 1 .242 1.883l-2.36 7.201c-.288.814-.48 1.355-1.884 1.355-2.072 0-4.276-.677-6.157-1.256-.472-.145-.924-.284-1.348-.404h-.115V9.478a25.485 25.485 0 0 0 4.238-5.514 1.8 1.8 0 0 1 .901-.83 1.74 1.74 0 0 1 1.21-.048c.396.13.736.397.96.757.225.36.32.788.269 1.211l-1.562 4.63ZM4.177 10H7v8a2 2 0 1 1-4 0v-6.823C3 10.527 3.527 10 4.176 10Z" clipRule="evenodd" />
                  </svg>
                  <span className="sr-only">{t("message.likeResponse")}</span>
                </button>
                <button type="button" className="inline-flex cursor-pointer justify-center rounded-lg p-1.5 text-gray-500 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-[0.97] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white">
                  <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M8.97 14.316H5.004c-.322 0-.64-.08-.925-.232a2.022 2.022 0 0 1-.717-.645 2.108 2.108 0 0 1-.242-1.883l2.36-7.201C5.769 3.54 5.96 3 7.365 3c2.072 0 4.276.678 6.156 1.256.473.145.925.284 1.35.404h.114v9.862a25.485 25.485 0 0 0-4.238 5.514c-.197.376-.516.67-.901.83a1.74 1.74 0 0 1-1.21.048 1.79 1.79 0 0 1-.96-.757 1.867 1.867 0 0 1-.269-1.211l1.562-4.63ZM19.822 14H17V6a2 2 0 1 1 4 0v6.823c0 .65-.527 1.177-1.177 1.177Z" clipRule="evenodd" />
                  </svg>
                  <span className="sr-only">{t("message.unlikeResponse")}</span>
                </button>
              </div>
            </div>
          </div>
        ),
      )}

      {sendMessage.isPending && (
        <div data-role="assistant" className="msg-card p-6 bg-white dark:bg-gray-800 shadow-xs rounded-lg flex items-start gap-6 motion-safe:[animation:tl-fade-in_240ms_var(--ease-out)]" aria-live="polite">
          <img className="msg-avatar h-6 w-6 rounded-full" src="/images/logo.svg" alt="assistant" />
          <div className="flex items-center gap-2 text-sm text-muted dark:text-gray-400">
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 motion-safe:animate-bounce [animation-delay:-0.3s] dark:bg-gray-500" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 motion-safe:animate-bounce [animation-delay:-0.15s] dark:bg-gray-500" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400 motion-safe:animate-bounce dark:bg-gray-500" />
            </span>
            {t("message.typing")}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="flex h-full w-full flex-col">
        <div className="border-b border-gray-200 bg-white px-4 py-2.5 pb-4 sm:pb-2.5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex w-full items-center justify-between mb-2.5 sm:mb-0">
            <div>
              <button data-tooltip-target="tooltip-chat-settings" type="button" onClick={() => setSettingsOpen(true)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-gray-300 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-600">
                <span className="sr-only">{t("header.chatSettings")}</span>

                <svg className="h-6 w-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z" />
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                </svg>
              </button>

              <div id="tooltip-chat-settings" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                {t("header.chatSettings")}
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>

              <button data-tooltip-target="tooltip-chat-share" type="button" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-gray-300 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-600">
                <span className="sr-only">{t("header.shareConversation")}</span>

                <svg className="h-6 w-6 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2M12 4v12m0-12 4 4m-4-4L8 8" />
                </svg>
              </button>

              <div id="tooltip-chat-share" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                {t("header.shareConversation")}
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
            </div>
            <div className="flex items-center">
              <button type="button" onClick={handleNewChat} className="sm:flex w-full me-4 hidden items-center justify-center rounded-lg bg-primary-700 px-6 py-2 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 sm:w-auto">
                <svg className="me-2 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M17.44 3a1 1 0 0 1 .707.293l2.56 2.56a1 1 0 0 1 0 1.414L18.194 9.78 14.22 5.806l2.513-2.513A1 1 0 0 1 17.44 3Zm-4.634 4.22-9.513 9.513a1 1 0 0 0 0 1.414l2.56 2.56a1 1 0 0 0 1.414 0l9.513-9.513-3.974-3.974ZM6 6a1 1 0 0 1 1 1v1h1a1 1 0 0 1 0 2H7v1a1 1 0 1 1-2 0v-1H4a1 1 0 0 1 0-2h1V7a1 1 0 0 1 1-1Zm9 9a1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 1 1 0-2h1v-1a1 1 0 0 1 1-1Z" clipRule="evenodd" />
                  <path d="M19 13h-2v2h2v-2ZM13 3h-2v2h2V3Zm-2 2H9v2h2V5ZM9 3H7v2h2V3Zm12 8h-2v2h2v-2Zm0 4h-2v2h2v-2Z" />
                </svg>

                {t("header.newChat")}
              </button>
              <button id="dropdownAlgorithmButton" data-dropdown-toggle="dropdownAlgorithm" className="flex items-center rounded-full p-1.5 me-2 text-sm font-medium text-gray-900 hover:text-primary-600 focus:ring-4 focus:ring-gray-100 dark:text-white dark:hover:text-primary-500 dark:focus:ring-gray-700" type="button">
                <span className="sr-only">{t("header.openUserMenu")}</span>
                Default (GPT-3.5)
                <svg className="mx-1.5 h-2.5 w-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                </svg>
              </button>
              {/* Dropdown menu */}
              <div id="dropdownAlgorithm" className="z-10 hidden w-44 divide-y divide-gray-100 rounded-lg bg-white shadow-sm dark:divide-gray-600 dark:bg-gray-700">
                <ul className="p-2 text-sm font-medium text-gray-500 dark:text-gray-400" role="none">
                  <li>
                    <a href="#" className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem"> GPT-4o mini </a>
                  </li>
                  <li>
                    <a href="#" className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem"> GPT-4o mini </a>
                  </li>
                  <li>
                    <a href="#" className="inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem"> GPT-4o </a>
                  </li>
                </ul>
              </div>

              <button data-tooltip-target="tooltip-chat-history" type="button" data-drawer-target="drawer-chat-history" data-drawer-show="drawer-chat-history" data-drawer-placement="right" aria-controls="drawer-chat-history" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-gray-300 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-600">
                <span className="sr-only">{t("header.viewHistory")}</span>

                <svg className="h-6 w-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 9h6m-6 3h6m-6 3h6M6.996 9h.01m-.01 3h.01m-.01 3h.01M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
                </svg>
              </button>

              <div id="tooltip-chat-history" role="tooltip" className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-xs transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)] dark:bg-gray-700">
                {t("header.viewChatHistory")}
                <div className="tooltip-arrow" data-popper-arrow></div>
              </div>
            </div>
          </div>
          <div>
            <button type="button" onClick={handleNewChat} className="flex sm:hidden w-full items-center justify-center rounded-lg bg-primary-700 px-6 py-2 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 sm:w-auto">
              <svg className="me-2 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M17.44 3a1 1 0 0 1 .707.293l2.56 2.56a1 1 0 0 1 0 1.414L18.194 9.78 14.22 5.806l2.513-2.513A1 1 0 0 1 17.44 3Zm-4.634 4.22-9.513 9.513a1 1 0 0 0 0 1.414l2.56 2.56a1 1 0 0 0 1.414 0l9.513-9.513-3.974-3.974ZM6 6a1 1 0 0 1 1 1v1h1a1 1 0 0 1 0 2H7v1a1 1 0 1 1-2 0v-1H4a1 1 0 0 1 0-2h1V7a1 1 0 0 1 1-1Zm9 9a1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 1 1 0-2h1v-1a1 1 0 0 1 1-1Z" clipRule="evenodd" />
                <path d="M19 13h-2v2h2v-2ZM13 3h-2v2h2V3Zm-2 2H9v2h2V5ZM9 3H7v2h2V3Zm12 8h-2v2h2v-2Zm0 4h-2v2h2v-2Z" />
              </svg>

              {t("header.newChat")}
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">{copilotThread}</div>

        <div className="w-full shrink-0">
          <div className="w-full border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-700">
            <form onSubmit={handleSend} className="copilot-composer flex items-center gap-2 px-4 py-2.5 sm:gap-3">
              <span className="copilot-spark inline-flex h-6 w-6 shrink-0 items-center justify-center text-blue-700" aria-hidden="true">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l1.6 4.9a4 4 0 0 0 2.5 2.5l4.9 1.6-4.9 1.6a4 4 0 0 0-2.5 2.5L12 20.5l-1.6-4.9a4 4 0 0 0-2.5-2.5L3 11.5l4.9-1.6a4 4 0 0 0 2.5-2.5L12 2.5z" /></svg>
              </span>
              <label htmlFor="ai-chat-input" className="sr-only">{t("input.writeMessage")}</label>
              <input
                type="text"
                placeholder={t("input.writeAPrompt")}
                autoFocus
                id="ai-chat-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={!activeId || sendMessage.isPending}
                className="min-h-[44px] min-w-0 flex-1 border-0 bg-transparent px-1 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 disabled:opacity-50"
              />
              <button type="submit" disabled={!activeId || sendMessage.isPending || !draft.trim()} aria-label={t("input.sendMessage")} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-blue-700 transition-transform duration-[var(--dur-press)] ease-[var(--ease-out)] motion-safe:active:scale-95 hover:bg-blue-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50">
                <svg className="h-5 w-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20"><path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" /></svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* drawer component */}
      <div id="drawer-chat-history" className="fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform duration-[var(--dur-modal)] ease-[var(--ease-drawer)] translate-x-full bg-white w-80 dark:bg-gray-800" tabIndex={-1} aria-labelledby="drawer-right-label">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <h5 id="drawer-right-label" className="inline-flex items-center mb-4 text-base font-semibold text-gray-900 dark:text-white">{t("history.title")}</h5>
          <button type="button" data-drawer-hide="drawer-chat-history" aria-controls="drawer-chat-history" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white">
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
            <span className="sr-only">{t("history.closeMenu")}</span>
          </button>
        </div>

        {/* Arama kutusu */}
        <div className="my-4">
          <label htmlFor="chat-history-search" className="sr-only">{t("history.searchPlaceholder")}</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
              <svg className="h-4 w-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="search"
              id="chat-history-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("history.searchPlaceholder")}
              className="input ps-9"
            />
          </div>
        </div>

        <div className="my-5 space-y-5 h-[calc(100vh-19rem)] overflow-y-scroll">
          {conversationsQuery.isLoading && sessions.length === 0 && (
            <div className="px-1.5">
              <SkeletonText lines={4} />
            </div>
          )}

          {!conversationsQuery.isLoading && sessions.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 px-1.5">{t("history.empty")}</p>
          )}

          {!conversationsQuery.isLoading && sessions.length > 0 && !hasSearchResults && (
            <p className="text-sm text-gray-400 dark:text-gray-500 px-1.5">{t("history.searchNoResults")}</p>
          )}

          {groupedSessions.map((group) => (
            <div key={group.key}>
              <h6 className="inline-flex items-center mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400">{t(`history.${group.key}`)}</h6>
              <ul className="space-y-2">
                {group.items.map((s) => (
                  <li key={s.id} className={`flex items-center justify-between p-1.5 rounded-lg transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] hover:bg-gray-100 dark:hover:bg-gray-700 ${s.id === activeId ? "bg-gray-100 dark:bg-gray-700" : ""}`}>
                    {renamingId === s.id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          commitRename();
                        }}
                        className="flex min-w-0 flex-1 items-center gap-1"
                      >
                        <input
                          type="text"
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") cancelRename();
                          }}
                          onBlur={commitRename}
                          className="input min-w-0 flex-1"
                        />
                        <button type="submit" className="shrink-0 rounded-md p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-500" aria-label={t("history.renameSave")}>
                          <svg className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.917 9.724 16.5 19 7.5" />
                          </svg>
                        </button>
                      </form>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSelectSession(s.id)}
                          data-drawer-hide="drawer-chat-history"
                          aria-controls="drawer-chat-history"
                          className="flex items-center min-w-0 flex-1 text-left"
                        >
                          <svg className="w-5 h-5 me-2 shrink-0 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 10.5h.01m-4.01 0h.01M8 10.5h.01M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-6.6a1 1 0 0 0-.69.275l-2.866 2.723A.5.5 0 0 1 8 18.635V17a1 1 0 0 0-1-1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
                          </svg>
                          <span className="dark:text-white text-sm font-medium text-gray-900 truncate">{s.title || t("history.newConversation")}</span>
                        </button>
                        <div className="flex shrink-0 items-center">
                          <button
                            type="button"
                            onClick={() => startRename(s)}
                            className="ms-1 rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                            aria-label={t("history.renameChat")}
                          >
                            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(s)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-red-600 dark:hover:bg-gray-600 dark:hover:text-red-500"
                            aria-label={t("history.deleteChat")}
                          >
                            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <ul className="space-y-2 mb-4">
            <li>
              <a href="#" className="flex items-center p-1.5 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700">
                <svg className="w-5 h-5 me-2 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M9.586 2.586A2 2 0 0 1 11 2h2a2 2 0 0 1 2 2v.089l.473.196.063-.063a2.002 2.002 0 0 1 2.828 0l1.414 1.414a2 2 0 0 1 0 2.827l-.063.064.196.473H20a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-.089l-.196.473.063.063a2.002 2.002 0 0 1 0 2.828l-1.414 1.414a2 2 0 0 1-2.828 0l-.063-.063-.473.196V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-.089l-.473-.196-.063.063a2.002 2.002 0 0 1-2.828 0l-1.414-1.414a2 2 0 0 1 0-2.827l.063-.064L4.089 15H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h.09l.195-.473-.063-.063a2 2 0 0 1 0-2.828l1.414-1.414a2 2 0 0 1 2.827 0l.064.063L9 4.089V4a2 2 0 0 1 .586-1.414ZM8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
                </svg>
                <span className="dark:text-white text-base font-medium text-gray-900">{t("history.userSettings")}</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center p-1.5 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700">
                <svg className="w-5 h-5 me-2 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="m7.4 3.736 3.43 3.429A5.046 5.046 0 0 1 12.133 7c.356.01.71.06 1.056.147l3.41-3.412a2.32 2.32 0 0 1 .451-.344A9.89 9.89 0 0 0 12.268 2a10.022 10.022 0 0 0-5.322 1.392c.165.095.318.211.454.344Zm11.451 1.54-.127-.127a.5.5 0 0 0-.706 0l-2.932 2.932c.03.023.05.054.078.077.237.194.454.41.651.645.033.038.077.067.11.107l2.926-2.927a.5.5 0 0 0 0-.707Zm-2.931 9.81c-.025.03-.058.052-.082.082a4.97 4.97 0 0 1-.633.639c-.04.036-.072.083-.115.117l2.927 2.927a.5.5 0 0 0 .707 0l.127-.127a.5.5 0 0 0 0-.707l-2.932-2.931Zm-1.443-4.763a3.037 3.037 0 0 0-1.383-1.1l-.012-.007a2.956 2.956 0 0 0-1-.213H12a2.964 2.964 0 0 0-2.122.893c-.285.29-.509.634-.657 1.013l-.009.016a2.96 2.96 0 0 0-.21 1 2.99 2.99 0 0 0 .488 1.716l.032.04a3.04 3.04 0 0 0 1.384 1.1l.012.007c.319.129.657.2 1 .213.393.015.784-.05 1.15-.192.012-.005.021-.013.033-.018a3.01 3.01 0 0 0 1.676-1.7v-.007a2.89 2.89 0 0 0 0-2.207 2.868 2.868 0 0 0-.27-.515c-.007-.012-.02-.025-.03-.039Zm6.137-3.373a2.53 2.53 0 0 1-.349.447l-3.426 3.426c.112.428.166.869.161 1.311a4.954 4.954 0 0 1-.148 1.054l3.413 3.412c.133.134.249.283.347.444A9.88 9.88 0 0 0 22 12.269a9.913 9.913 0 0 0-1.386-5.319ZM16.6 20.264l-3.42-3.421c-.386.1-.782.152-1.18.157h-.135c-.356-.01-.71-.06-1.056-.147L7.4 20.265a2.503 2.503 0 0 1-.444.347A9.884 9.884 0 0 0 11.732 22H12a9.9 9.9 0 0 0 5.044-1.388 2.515 2.515 0 0 1-.444-.348ZM3.735 16.6l3.426-3.426a4.608 4.608 0 0 1-.013-2.367L3.735 7.4a2.508 2.508 0 0 1-.349-.447 9.889 9.889 0 0 0 0 10.1 2.48 2.48 0 0 1 .35-.453Zm5.101-.758a4.959 4.959 0 0 1-.65-.645c-.034-.038-.078-.067-.11-.107L5.15 18.017a.5.5 0 0 0 0 .707l.127.127a.5.5 0 0 0 .706 0l2.932-2.933c-.029-.018-.049-.053-.078-.076Zm-.755-6.928c.03-.037.07-.063.1-.1.183-.22.383-.423.6-.609.046-.04.081-.092.128-.13L5.983 5.149a.5.5 0 0 0-.707 0l-.127.127a.5.5 0 0 0 0 .707l2.932 2.931Z" />
                </svg>
                <span className="dark:text-white text-base font-medium text-gray-900">{t("history.helpGettingStarted")}</span>
              </a>
            </li>
          </ul>
          <a href="#" className="py-2.5 px-5 inline-flex items-center justify-center w-full text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"><svg className="w-5 h-5 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M20.337 3.664c.213.212.354.486.404.782.294 1.711.657 5.195-.906 6.76-1.77 1.768-8.485 5.517-10.611 6.683a.987.987 0 0 1-1.176-.173l-.882-.88-.877-.884a.988.988 0 0 1-.173-1.177c1.165-2.126 4.913-8.841 6.682-10.611 1.562-1.563 5.046-1.198 6.757-.904.296.05.57.191.782.404ZM5.407 7.576l4-.341-2.69 4.48-2.857-.334a.996.996 0 0 1-.565-1.694l2.112-2.111Zm11.357 7.02-.34 4-2.111 2.113a.996.996 0 0 1-1.69-.565l-.422-2.807 4.563-2.74Zm.84-6.21a1.99 1.99 0 1 1-3.98 0 1.99 1.99 0 0 1 3.98 0Z" clipRule="evenodd" />
          </svg>
          {t("history.upgradeToPro")}</a>
        </div>
      </div>

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title={t("settings.title")}
        size="xl"
        footer={
          <>
            <button type="button" onClick={() => setSettingsOpen(false)} className="rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">{t("settings.save")}</button>
            <button type="button" onClick={() => setSettingsOpen(false)} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">{t("settings.close")}</button>
          </>
        }
      >
                  <div className="border-b pb-5 border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-sm font-medium md:grid-cols-4" role="tablist">
                      {(
                        [
                          {
                            key: "general",
                            label: t("settings.tabGeneral"),
                            icon: (
                              <>
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13v-2a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L14 4.757V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L4.929 6.343a1 1 0 0 0 0 1.414l.536.536L4.757 10H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535 1.707.707V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H20a1 1 0 0 0 1-1Z" />
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                              </>
                            ),
                          },
                          {
                            key: "data",
                            label: t("settings.tabData"),
                            icon: (
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v14m6-8h-6m6 4h-6m-9-3h1.99093M4 19h16c.5523 0 1-.4477 1-1V6c0-.55228-.4477-1-1-1H4c-.55228 0-1 .44772-1 1v12c0 .5523.44772 1 1 1Zm8-7c0 1.1046-.8954 2-2 2-1.10457 0-2-.8954-2-2s.89543-2 2-2c1.1046 0 2 .8954 2 2Z" />
                            ),
                          },
                          {
                            key: "applications",
                            label: t("settings.tabApplications"),
                            icon: (
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.143 4H4.857A.857.857 0 0 0 4 4.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 10 9.143V4.857A.857.857 0 0 0 9.143 4Zm10 0h-4.286a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 20 9.143V4.857A.857.857 0 0 0 19.143 4Zm-10 10H4.857a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286a.857.857 0 0 0 .857-.857v-4.286A.857.857 0 0 0 9.143 14Zm10 0h-4.286a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286a.857.857 0 0 0 .857-.857v-4.286a.857.857 0 0 0-.857-.857Z" />
                            ),
                          },
                          {
                            key: "security",
                            label: t("settings.tabSecurity"),
                            icon: (
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a28.076 28.076 0 0 1-1.091 9M7.231 4.37a8.994 8.994 0 0 1 12.88 3.73M2.958 15S3 14.577 3 12a8.949 8.949 0 0 1 1.735-5.307m12.84 3.088A5.98 5.98 0 0 1 18 12a30 30 0 0 1-.464 6.232M6 12a6 6 0 0 1 9.352-4.974M4 21a5.964 5.964 0 0 1 1.01-3.328 5.15 5.15 0 0 0 .786-1.926m8.66 2.486a13.96 13.96 0 0 1-.962 2.683M7.5 19.336C9 17.092 9 14.845 9 12a3 3 0 1 1 6 0c0 .749 0 1.521-.031 2.311M12 12c0 3 0 6-2 9" />
                            ),
                          },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          role="tab"
                          aria-selected={settingsTab === tab.key}
                          onClick={() => setSettingsTab(tab.key)}
                          className={`w-full inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)] ${
                            settingsTab === tab.key
                              ? "bg-primary-700 text-white dark:bg-primary-600"
                              : "bg-gray-50 text-gray-900 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
                          }`}
                        >
                          <svg className="w-5 h-5 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            {tab.icon}
                          </svg>
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="min-h-[20rem]">
                    {settingsTab === "general" && (
                    <div role="tabpanel">
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 justify-between">
                          <div>
                            <h6 className="text-gray-900 dark:text-white text-base font-medium mb-1">{t("settings.theme")}</h6>
                            <p className="text-gray-500 text-sm font-normal dark:text-gray-400">{t("settings.themeDescription")}</p>
                          </div>
                          <div className="shrink-0">
                            <Dropdown
                              side="bottom"
                              align="end"
                              menuWidth="w-44"
                              label={t("settings.theme")}
                              triggerClassName="flex items-center rounded-full p-1.5 me-2 text-sm font-medium text-gray-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-500"
                              trigger={
                                <>
                                  {themePref === "system"
                                    ? t("settings.system")
                                    : themePref === "light"
                                      ? t("settings.lightMode")
                                      : t("settings.darkMode")}
                                  <svg className="mx-1.5 h-2.5 w-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                  </svg>
                                </>
                              }
                            >
                              <DropdownItem onSelect={() => setThemePref("system")}>{t("settings.systemSettings")}</DropdownItem>
                              <DropdownItem onSelect={() => setThemePref("light")}>{t("settings.lightMode")}</DropdownItem>
                              <DropdownItem onSelect={() => setThemePref("dark")}>{t("settings.darkMode")}</DropdownItem>
                            </Dropdown>
                          </div>
                      </div>
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 justify-between">
                          <div>
                            <h6 className="text-gray-900 dark:text-white text-base font-medium mb-1">{t("settings.showCode")}</h6>
                            <p className="text-gray-500 text-sm font-normal dark:text-gray-400">{t("settings.showCodeDescription")}</p>
                          </div>
                          <div className="shrink-0">
                            <label className="inline-flex items-center cursor-pointer">
                              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 motion-safe:after:transition-transform after:duration-[var(--dur-press)] after:ease-[var(--ease-out)] dark:border-gray-600 peer-checked:bg-primary-600"></div>
                            </label>
                          </div>
                      </div>
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 justify-between">
                        <div>
                          <h6 className="text-gray-900 dark:text-white text-base font-medium mb-1">{t("settings.language")}</h6>
                          <p className="text-gray-500 text-sm font-normal dark:text-gray-400">{t("settings.languageDescription")}</p>
                        </div>
                        <div className="shrink-0">
                          <Dropdown
                            side="bottom"
                            align="end"
                            menuWidth="w-40"
                            label={t("settings.language")}
                            triggerClassName="flex items-center rounded-full p-1.5 me-2 text-sm font-medium text-gray-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-500"
                            trigger={
                              <>
                                {chatLang === "de"
                                  ? t("settings.german")
                                  : chatLang === "es"
                                    ? t("settings.spanish")
                                    : chatLang === "fr"
                                      ? t("settings.french")
                                      : chatLang === "zh"
                                        ? t("settings.chinese")
                                        : t("settings.languageEnglishUs")}
                                <svg className="mx-1.5 h-2.5 w-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                </svg>
                              </>
                            }
                          >
                            <DropdownItem onSelect={() => setChatLang("de")}>{t("settings.german")}</DropdownItem>
                            <DropdownItem onSelect={() => setChatLang("es")}>{t("settings.spanish")}</DropdownItem>
                            <DropdownItem onSelect={() => setChatLang("fr")}>{t("settings.french")}</DropdownItem>
                            <DropdownItem onSelect={() => setChatLang("en-us")}>{t("settings.english")}</DropdownItem>
                            <DropdownItem onSelect={() => setChatLang("zh")}>{t("settings.chinese")}</DropdownItem>
                          </Dropdown>
                        </div>
                      </div>
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 justify-between">
                          <div>
                            <h6 className="text-gray-900 dark:text-white text-base font-medium mb-1">{t("settings.archiveAllChats")}</h6>
                            <p className="text-gray-500 text-sm font-normal dark:text-gray-400">{t("settings.archiveAllChatsDescription")}</p>
                          </div>
                          <div className="shrink-0">
                            <label className="inline-flex items-center cursor-pointer">
                              <input type="checkbox" value="" className="sr-only peer" />
                              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 motion-safe:after:transition-transform after:duration-[var(--dur-press)] after:ease-[var(--ease-out)] dark:border-gray-600 peer-checked:bg-primary-600"></div>
                            </label>
                          </div>
                      </div>
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 justify-between">
                          <div>
                            <h6 className="text-gray-900 dark:text-white text-base font-medium mb-1">{t("settings.deleteChats")}</h6>
                            <p className="text-gray-500 text-sm font-normal dark:text-gray-400">{t("settings.deleteChatsDescription")}</p>
                          </div>
                          <div className="shrink-0">
                            <button type="button" className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800">
                              {t("settings.delete")}
                            </button>
                          </div>
                      </div>
                    </div>
                    )}
                    {settingsTab === "data" && (
                    <div role="tabpanel">
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 justify-between">
                        <div>
                          <h6 className="text-gray-900 dark:text-white text-base font-medium mb-1">{t("settings.improveModel")}</h6>
                          <p className="text-gray-500 text-sm font-normal dark:text-gray-400 max-w-md">{t("settings.improveModelDescription")}</p>
                        </div>
                        <div className="shrink-0">
                          <Dropdown
                            side="bottom"
                            align="end"
                            menuWidth="w-40"
                            label={t("settings.improveModel")}
                            triggerClassName="flex items-center rounded-full p-1.5 me-2 text-sm font-medium text-gray-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-500"
                            trigger={
                              <>
                                {improveModel ? t("settings.on") : t("settings.turnOff")}
                                <svg className="mx-1.5 h-2.5 w-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                </svg>
                              </>
                            }
                          >
                            <DropdownItem onSelect={() => setImproveModel(false)}>{t("settings.turnOff")}</DropdownItem>
                            <DropdownItem onSelect={() => setImproveModel(true)}>{t("settings.turnOn")}</DropdownItem>
                          </Dropdown>
                        </div>
                      </div>
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 justify-between">
                        <div>
                          <h6 className="text-gray-900 dark:text-white text-base font-medium mb-1">{t("settings.sharedLinks")}</h6>
                          <p className="text-gray-500 text-sm font-normal dark:text-gray-400">{t("settings.sharedLinksDescription")}</p>
                        </div>
                        <div className="shrink-0">
                          <button type="button" className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-auto">
                            {t("settings.manage")}
                          </button>
                        </div>
                      </div>
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 justify-between">
                        <div>
                          <h6 className="text-gray-900 dark:text-white text-base font-medium mb-1">{t("settings.exportData")}</h6>
                          <p className="text-gray-500 text-sm font-normal dark:text-gray-400">{t("settings.exportDataDescription")}</p>
                        </div>
                        <div className="shrink-0">
                          <button type="button" className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-auto">
                            <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 10V4a1 1 0 0 0-1-1H9.914a1 1 0 0 0-.707.293L5.293 7.207A1 1 0 0 0 5 7.914V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2M10 3v4a1 1 0 0 1-1 1H5m5 6h9m0 0-2-2m2 2-2 2" />
                            </svg>
                            {t("settings.export")}
                          </button>
                        </div>
                      </div>
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 justify-between">
                          <div>
                            <h6 className="text-gray-900 dark:text-white text-base font-medium mb-1">{t("settings.deleteAccount")}</h6>
                            <p className="text-gray-500 text-sm font-normal dark:text-gray-400">{t("settings.deleteAccountDescription")}</p>
                          </div>
                          <div className="shrink-0">
                            <button type="button" className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800">
                              {t("settings.delete")}
                            </button>
                          </div>
                      </div>
                    </div>
                    )}
                    {settingsTab === "applications" && (
                    <div role="tabpanel">
                      <h6 className="text-sm text-gray-900 dark:text-white font-medium py-5 border-b border-gray-200 dark:border-gray-700">{t("settings.connectApps")}</h6>
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 justify-between">
                        <div>
                          <h6 className="text-gray-900 dark:text-white text-base font-medium mb-3 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="me-2 h-6" viewBox="0 0 1443.061 1249.993">
                            <path fill="#3777e3" d="M240.525 1249.993l240.492-416.664h962.044l-240.514 416.664z"></path>
                            <path fill="#ffcf63" d="M962.055 833.329h481.006L962.055 0H481.017z"></path>
                            <path fill="#11a861" d="M0 833.329l240.525 416.664 481.006-833.328L481.017 0z"></path>
                          </svg>Google Drive</h6>
                          <p className="text-gray-500 text-sm font-normal dark:text-gray-400 max-w-md">{t("settings.googleDriveDescription")}</p>
                        </div>
                        <div className="shrink-0">
                          <button type="button" className="flex items-center justify-center rounded-lg border border-primary-700 bg-white px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-700 hover:text-white focus:z-10 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:border-primary-500 dark:bg-gray-800 dark:text-primary-500 dark:hover:bg-primary-600 dark:hover:border-primary-600 dark:hover:text-white dark:focus:ring-primary-700">
                            {t("settings.connect")}
                          </button>
                        </div>
                      </div>
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 justify-between">
                        <div>
                          <h6 className="text-gray-900 dark:text-white text-base font-medium mb-3 flex items-center">Mailchimp</h6>
                          <p className="text-gray-500 text-sm font-normal dark:text-gray-400 max-w-md">{t("settings.mailchimpDescription")}</p>
                        </div>
                        <div className="shrink-0">
                          <button type="button" className="flex items-center justify-center rounded-lg border border-primary-700 bg-white px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-700 hover:text-white focus:z-10 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:border-primary-500 dark:bg-gray-800 dark:text-primary-500 dark:hover:bg-primary-600 dark:hover:border-primary-600 dark:hover:text-white dark:focus:ring-primary-700">
                            {t("settings.connect")}
                          </button>
                        </div>
                      </div>
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 justify-between">
                        <div>
                          <h6 className="text-gray-900 dark:text-white text-base font-medium mb-3 flex items-center">Flowbite</h6>
                          <p className="text-gray-500 text-sm font-normal dark:text-gray-400 max-w-md">{t("settings.flowbiteDescription")}</p>
                        </div>
                        <div className="shrink-0">
                          <button type="button" className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-auto">
                            {t("settings.remove")}
                          </button>
                        </div>
                      </div>
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 justify-between">
                        <div>
                          <h6 className="text-gray-900 dark:text-white text-base font-medium mb-3 flex items-center">Figma</h6>
                          <p className="text-gray-500 text-sm font-normal dark:text-gray-400 max-w-md">{t("settings.figmaDescription")}</p>
                        </div>
                        <div className="shrink-0">
                          <button type="button" className="flex items-center justify-center rounded-lg border border-primary-700 bg-white px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-700 hover:text-white focus:z-10 focus:outline-none focus:ring-4 focus:ring-primary-100 dark:border-primary-500 dark:bg-gray-800 dark:text-primary-500 dark:hover:bg-primary-600 dark:hover:border-primary-600 dark:hover:text-white dark:focus:ring-primary-700">
                            {t("settings.connect")}
                          </button>
                        </div>
                      </div>
                    </div>
                    )}
                    {settingsTab === "security" && (
                    <div role="tabpanel">
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 justify-between">
                        <div>
                          <h6 className="text-gray-900 dark:text-white text-base font-medium mb-1">{t("settings.multiFactorAuth")}</h6>
                          <p className="text-gray-500 text-sm font-normal dark:text-gray-400 max-w-md">{t("settings.multiFactorAuthDescription")}</p>
                        </div>
                        <div className="shrink-0">
                          <button type="button" className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-auto">
                            {t("settings.enable")}
                          </button>
                        </div>
                      </div>
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 justify-between">
                        <div>
                          <h6 className="text-gray-900 dark:text-white text-base font-medium mb-1">{t("settings.logOutAllDevices")}</h6>
                          <p className="text-gray-500 text-sm font-normal dark:text-gray-400 max-w-md">{t("settings.logOutAllDevicesDescription")}</p>
                        </div>
                        <div className="shrink-0">
                          <button type="button" className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-auto">
                            {t("settings.signOutAll")}
                          </button>
                        </div>
                      </div>
                      <div className="py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 justify-between">
                        <div>
                          <h6 className="text-gray-900 dark:text-white text-base font-medium mb-1">{t("settings.logOutThisDevice")}</h6>
                          <p className="text-gray-500 text-sm font-normal dark:text-gray-400 max-w-md">{t("settings.logOutThisDeviceDescription")}</p>
                        </div>
                        <div className="shrink-0">
                          <button type="button" className="flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-auto">
                            {t("settings.logOut")}
                          </button>
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        title={t("history.confirmDeleteTitle")}
        message={t("history.confirmDeleteMessage")}
        confirmLabel={t("history.confirmDeleteConfirm")}
        cancelLabel={t("history.renameCancel")}
        loading={deleteConversation.isPending}
        onConfirm={confirmDeleteSession}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
