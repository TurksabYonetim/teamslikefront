// web/src/features/messaging/MessagingPage.tsx
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import clsx from "clsx";
import { useInitFlowbite } from "@/lib/flowbite";
import { useIsMobile } from "@/lib/useIsMobile";
import { useCan } from "@/lib/authStore";
import { useWorkspaceId, inActiveWorkspace } from "@/lib/tenantStore";
import { ErrorBoundary, Forbidden } from "@/components/ui";
import { MailInbox } from "./MailInbox";
import { CommunitiesBar } from "./components/CommunitiesBar";
import { MessagingSidebar } from "./components/MessagingSidebar";
import { ChannelHeader } from "./components/ChannelHeader";
import { MessageList } from "./components/MessageList";
import { MessageComposer } from "./components/MessageComposer";
import { StoriesBar } from "./components/StoriesBar";
import { PinnedBar } from "./components/PinnedBar";
import { TypingIndicator } from "./components/TypingIndicator";
import { ThreadPanel } from "./components/ThreadPanel";
import { DetailsPanel } from "./components/DetailsPanel";
import { GlobalSearchDialog } from "./components/GlobalSearchDialog";
import { useMessagingHotkeys } from "./components/useMessagingHotkeys";
import { ShortcutsHelpDialog } from "./components/ShortcutsHelpDialog";
import { messagingStore, useMessaging } from "./store";
import type { ChatFolder, Section } from "./types";

const folderForSection = (section: Section): ChatFolder =>
  section === "dm" ? "dms" : section === "channels" ? "channels" : "all";

export function MessagingPage({ section }: { section: Section }) {
  useInitFlowbite();
  const { t } = useTranslation("messaging");
  const canView = useCan("messaging.view");

  if (!canView) return <Forbidden message={t("forbidden")} />;
  if (section === "inbox") {
    return <MailInbox />;
  }
  return <ChatShell section={section} />;
}

function ChatShell({ section }: { section: Exclude<Section, "inbox"> }) {
  const { t } = useTranslation("messaging");
  const isMobile = useIsMobile();
  const workspaceId = useWorkspaceId();
  const [params, setParams] = useSearchParams();

  // Route bölümüne göre başlangıç folder'ını bir kez ayarla.
  React.useEffect(() => {
    messagingStore.getState().setFolder(folderForSection(section));
  }, [section]);

  const threadRootId = useMessaging((s) => s.threadRootId);
  const detailsOpen = useMessaging((s) => s.detailsOpen);
  const paletteOpen = useMessaging((s) => s.paletteOpen);
  const activeChannelId = useMessaging((s) => s.activeChannelId);
  const activeTopicId = useMessaging((s) => s.activeTopicId);
  const channels = useMessaging((s) => s.channels);
  const topics = useMessaging((s) => s.topics);

  const [helpOpen, setHelpOpen] = React.useState(false);
  const openHelp = React.useCallback(() => setHelpOpen(true), []);
  useMessagingHotkeys({ onOpenHelp: openHelp });

  // ── Deep-link okuma (?c= kanal, ?t= konu) — yenileme-güvenli, paylaşılabilir.
  // İlk render'da URL'deki seçimi store'a uygula.
  const appliedUrl = React.useRef(false);
  React.useEffect(() => {
    if (appliedUrl.current) return;
    appliedUrl.current = true;
    const urlChannel = params.get("c");
    const urlTopic = params.get("t");
    const store = messagingStore.getState();
    if (urlChannel && channels.some((c) => c.id === urlChannel) && urlChannel !== activeChannelId) {
      store.setChannel(urlChannel);
    }
    if (urlTopic && topics.some((tp) => tp.id === urlTopic)) {
      store.setTopic(urlTopic);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Workspace otomatik kanal seçimi — alan değişince o alana ait ilk
  // (DM olmayan) kanalı seç. URL deep-link uygulandıktan sonra çalışır.
  const prevWorkspace = React.useRef<string | null | undefined>(undefined);
  React.useEffect(() => {
    // İlk mount'ta (deep-link öncesi) atlama — URL seçimine saygı göster.
    if (prevWorkspace.current === undefined) {
      prevWorkspace.current = workspaceId;
      return;
    }
    if (prevWorkspace.current === workspaceId) return;
    prevWorkspace.current = workspaceId;
    const active = channels.find((c) => c.id === activeChannelId);
    // Aktif kanal yeni alanda görünüyorsa dokunma.
    if (active && active.kind !== "dm" && inActiveWorkspace(active.workspaceId, workspaceId)) return;
    const firstChannel = channels.find(
      (c) => c.kind !== "dm" && inActiveWorkspace(c.workspaceId, workspaceId),
    );
    if (firstChannel && firstChannel.id !== activeChannelId) {
      messagingStore.getState().setChannel(firstChannel.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, channels]);

  // ── Deep-link yazma — aktif seçim değişince URL'yi güncel tut.
  React.useEffect(() => {
    if (!appliedUrl.current) return;
    const next = new URLSearchParams(params);
    let changed = false;
    if (activeChannelId && next.get("c") !== activeChannelId) {
      next.set("c", activeChannelId);
      changed = true;
    }
    if (activeTopicId && next.get("t") !== activeTopicId) {
      next.set("t", activeTopicId);
      changed = true;
    } else if (!activeTopicId && next.has("t")) {
      next.delete("t");
      changed = true;
    }
    if (changed) setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannelId, activeTopicId]);

  // Mobilde tek panel: liste ↔ konuşma. Kanal değişince konuşmaya geç.
  const [mobilePane, setMobilePane] = React.useState<"list" | "conversation">("list");
  React.useEffect(() => {
    if (isMobile) setMobilePane("conversation");
  }, [activeChannelId, isMobile]);

  const showList = !isMobile || mobilePane === "list";
  const showConversation = !isMobile || mobilePane === "conversation";

  return (
    <ErrorBoundary>
      <div
        data-testid="messaging-shell"
        className="flex h-full min-h-0 overflow-hidden bg-white dark:bg-gray-800"
      >
        {showList ? (
          <>
            <CommunitiesBar />
            <MessagingSidebar />
          </>
        ) : null}

        {/* Konuşma alanı */}
        {showConversation ? (
          <div className={clsx("flex min-w-0 flex-col", isMobile ? "w-full" : "flex-1")}>
            {isMobile ? (
              <button
                type="button"
                onClick={() => setMobilePane("list")}
                className="flex items-center gap-2 border-b border-line px-3 py-2 text-sm text-brand dark:border-gray-700"
              >
                <HiOutlineArrowLeft className="h-4 w-4" aria-hidden /> {t("back")}
              </button>
            ) : null}
            <ChannelHeader />
            <StoriesBar />
            <PinnedBar />

            {/* Mesaj listesi — kendi scroll'unu yönetir (flex-1 min-h-0 overflow-y-auto) */}
            <MessageList />

            <TypingIndicator />
            <MessageComposer />
          </div>
        ) : null}

        {threadRootId ? <ThreadPanel /> : null}
        {detailsOpen ? <DetailsPanel /> : null}
        <GlobalSearchDialog
          open={paletteOpen}
          onClose={() => messagingStore.getState().togglePalette(false)}
        />
        <ShortcutsHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </ErrorBoundary>
  );
}
