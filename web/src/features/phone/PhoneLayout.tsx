import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import clsx from "clsx";
import {
  HiOutlineSquares2X2,
  HiOutlineBookOpen,
  HiOutlineMicrophone,
  HiOutlineChatBubbleLeftRight,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlinePhoneArrowUpRight,
  HiOutlineRectangleStack,
  HiOutlineArrowsRightLeft,
  HiOutlineChartBar,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import { Forbidden } from "@/components/ui";
import { useCan } from "@/lib/authStore";
import { KeypadPanel } from "./KeypadPanel";
import { ContactsPanel } from "./ContactsPanel";
import { VoicemailInbox } from "./VoicemailInbox";
import { MessagesPane } from "./MessagesPane";
import { CallQueuePanel } from "./CallQueuePanel";
import { AttendantConsole } from "./AttendantConsole";
import { IVRBuilder } from "./IVRBuilder";
import { RoutingRuleBuilder } from "./RoutingRuleBuilder";
import { ReceptionistBuilder } from "./ReceptionistBuilder";
import { CallAnalytics } from "./CallAnalytics";
import { useCall } from "./callStore";

type TabId =
  | "keypad" | "directory" | "voicemail" | "messages" | "reception"
  | "queues" | "attendant" | "ivr" | "routing" | "analytics";

const TABS: { id: TabId; Icon: IconType }[] = [
  { id: "keypad", Icon: HiOutlineSquares2X2 },
  { id: "directory", Icon: HiOutlineBookOpen },
  { id: "voicemail", Icon: HiOutlineMicrophone },
  { id: "messages", Icon: HiOutlineChatBubbleLeftRight },
  { id: "reception", Icon: HiOutlineSparkles },
  { id: "queues", Icon: HiOutlineUserGroup },
  { id: "attendant", Icon: HiOutlinePhoneArrowUpRight },
  { id: "ivr", Icon: HiOutlineRectangleStack },
  { id: "routing", Icon: HiOutlineArrowsRightLeft },
  { id: "analytics", Icon: HiOutlineChartBar },
];

const TAB_IDS = TABS.map((t) => t.id);
const isTabId = (v: string | null): v is TabId => !!v && (TAB_IDS as string[]).includes(v);

/**
 * Telefon / UCaaS modülü kabuğu: 10 sekmeli, `?tab=` deep-link'li, roving-tabindex
 * tab çubuğu. Panel içerikleri Faz 2–5'te yerleştirilir; şimdilik placeholder.
 */
export function PhoneLayout() {
  const { t } = useTranslation("phone");
  const canView = useCan("telephony.view");
  const [params, setParams] = useSearchParams();
  const rawTab = params.get("tab");
  const active: TabId = isTabId(rawTab) ? rawTab : "keypad";
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const place = useCall((s) => s.place);

  const select = (id: TabId) => {
    const next = new URLSearchParams(params);
    next.set("tab", id);
    setParams(next, { replace: true });
  };

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    const id = TABS[next].id;
    select(id);
    tabRefs.current[id]?.focus();
  };

  // İzin koruması: telephony.view yoksa modülün hiçbir yüzeyi görünmez.
  if (!canView) return <Forbidden />;

  // Paylaşılan sekme çubuğu — delight varyantları (impeccable live) aynı dinamik
  // render'ı ve klavye gezinmesini paylaşır; aktif/pasif görünümü [aria-selected]
  // üzerinden scoped CSS yönetir.
  const renderPhoneTabs = (cls: string) => (
    <div role="tablist" aria-label={t("dialer.title")} className={clsx("phone-tabs flex flex-wrap gap-1 border-b border-line", cls)}>
      {TABS.map(({ id, Icon }, i) => {
        const selected = id === active;
        return (
          <button
            key={id}
            ref={(el) => {
              tabRefs.current[id] = el;
            }}
            role="tab"
            data-tab={id}
            id={`phone-tab-${id}`}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => select(id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="phone-tab inline-flex h-11 items-center gap-2 rounded-t px-3 text-sm font-medium -mb-px transition-[transform,color] motion-safe:active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span className="phone-tab-ic inline-flex shrink-0">
              <Icon size={18} aria-hidden />
            </span>
            <span className="phone-tab-label">{t(`tabs.${id}`)}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">{t("dialer.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>

      {renderPhoneTabs("")}

      <div
        role="tabpanel"
        id={`phone-panel-${active}`}
        aria-labelledby={`phone-tab-${active}`}
        className="min-h-0 flex-1"
      >
        {active === "keypad" ? (
          <KeypadPanel />
        ) : active === "directory" ? (
          <div className="mx-auto h-full max-w-3xl overflow-y-auto p-4">
            <ContactsPanel onCall={place} />
          </div>
        ) : active === "voicemail" ? (
          <VoicemailInbox />
        ) : active === "messages" ? (
          <MessagesPane />
        ) : active === "queues" ? (
          <CallQueuePanel />
        ) : active === "attendant" ? (
          <AttendantConsole />
        ) : active === "ivr" ? (
          <IVRBuilder />
        ) : active === "routing" ? (
          <RoutingRuleBuilder />
        ) : active === "reception" ? (
          <ReceptionistBuilder />
        ) : (
          <CallAnalytics />
        )}
      </div>
    </div>
  );
}
