// web/src/features/support/SupportPage.tsx
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { useStore } from "@/lib/createStore";
import { useIsMobile } from "@/lib/useIsMobile";
import { conversationStore } from "./conversation.store";
import { InboxNav } from "./components/InboxNav";
import { ConversationList } from "./components/ConversationList";
import { ConversationView } from "./components/ConversationView";
import { ContactPanel } from "./components/ContactPanel";
import { AutomationView } from "./components/AutomationView";
import { WorkforceView } from "./components/WorkforceView";
import { StudioView } from "./components/StudioView";

type View = "inbox" | "automation" | "workforce" | "studio";

const VIEWS: { id: View; icon: string }[] = [
  { id: "inbox", icon: "inbox" },
  { id: "automation", icon: "bolt" },
  { id: "workforce", icon: "chartBar" },
  { id: "studio", icon: "sparkles" },
];

const isView = (v: string | null): v is View => VIEWS.some((x) => x.id === v);

export function SupportPage() {
  const { t } = useTranslation("support");
  const activeId = useStore(conversationStore, (s) => s.activeConversationId);
  const conversations = useStore(conversationStore, (s) => s.conversations);
  const [params, setParams] = useSearchParams();
  const isMobile = useIsMobile();
  // Mobil tek-pano: "list" ↔ "ticket".
  const [mobilePane, setMobilePane] = useState<"list" | "ticket">("list");
  const firstSelect = useRef(true);

  // Üst seviye görünüm: ?view= ile deep-link, varsayılan inbox.
  const urlView = params.get("view");
  const [view, setViewState] = useState<View>(isView(urlView) ? urlView : "inbox");

  const setView = (next: View) => {
    setViewState(next);
    const p = new URLSearchParams(params);
    if (next === "inbox") p.delete("view");
    else p.set("view", next);
    setParams(p, { replace: true });
  };

  // ?view= dışarıdan değişirse (geri/ileri) senkronla.
  useEffect(() => {
    const v = params.get("view");
    setViewState(isView(v) ? v : "inbox");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlView]);

  // Görünüm sekmelerinde klavye gezinme (sol/sağ ok, Home/End).
  const onTabKey = (e: React.KeyboardEvent) => {
    const idx = VIEWS.findIndex((v) => v.id === view);
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % VIEWS.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + VIEWS.length) % VIEWS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = VIEWS.length - 1;
    else return;
    e.preventDefault();
    setView(VIEWS[next].id);
    const el = document.getElementById(`support-tab-${VIEWS[next].id}`);
    el?.focus();
  };

  // Deep-link açık konuşma (?conv=) — paylaşılabilir + yenileme-güvenli.
  useEffect(() => {
    const urlId = params.get("conv");
    if (urlId && urlId !== activeId && conversations.some((c) => c.id === urlId)) {
      conversationStore.getState().setActive(urlId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (activeId && params.get("conv") !== activeId) {
      const next = new URLSearchParams(params);
      next.set("conv", activeId);
      setParams(next, { replace: true });
    }
    // İlk render hariç, konuşma seçilince mobil ticket panosuna kay.
    if (firstSelect.current) {
      firstSelect.current = false;
    } else if (activeId) {
      setMobilePane("ticket");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const Switcher = (
    <div
      role="tablist"
      aria-label={t("views.switcher")}
      className="flex items-center gap-1 overflow-x-auto"
    >
      {VIEWS.map((v) => {
        const active = view === v.id;
        return (
          <button
            key={v.id}
            id={`support-tab-${v.id}`}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => setView(v.id)}
            onKeyDown={onTabKey}
            className={clsx(
              "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium outline-none transition-[background-color,transform] duration-150 ease-[var(--ease-out,ease-out)] focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
              active ? "bg-brand text-white" : "text-muted hover:bg-surface-2 hover:text-ink",
            )}
          >
            <Icon name={v.icon} className="h-4 w-4" /> {t(`views.${v.id}`)}
          </button>
        );
      })}
    </div>
  );

  // ── Inbox görünümü (mevcut, bozulmadan) ──
  const InboxBody = isMobile ? (
    mobilePane === "list" ? (
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <ConversationList />
      </div>
    ) : (
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <button
          onClick={() => setMobilePane("list")}
          className="inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-base text-muted transition-colors hover:bg-surface-2 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          <Icon name="chevronLeft" className="h-4 w-4" aria-hidden /> {t("back")}
        </button>
        <div className="min-h-0 flex-1">
          <ConversationView />
        </div>
      </div>
    )
  ) : (
    <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[200px_320px_1fr] xl:grid-cols-[200px_320px_1fr_280px]">
      <InboxNav />
      <ConversationList />
      <ConversationView />
      <ContactPanel />
    </div>
  );

  return (
    <div className={clsx("flex h-[calc(100vh-3.5rem)] min-h-0 flex-col", isMobile ? "p-3" : "p-4")}>
      <div className="mb-3 flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
          <p className="text-base text-muted">{t("subtitle")}</p>
        </div>
        {Switcher}
      </div>

      {/* Görünüm gövdesi — değişimde yumuşak fade (key ile yeniden tetiklenir). */}
      <div key={view} className="tl-fade-in flex min-h-0 flex-1 flex-col">
        {view === "inbox" ? (
          InboxBody
        ) : view === "automation" ? (
          <AutomationView />
        ) : view === "workforce" ? (
          <WorkforceView />
        ) : (
          <StudioView />
        )}
      </div>
    </div>
  );
}
