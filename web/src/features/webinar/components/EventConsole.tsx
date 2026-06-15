// web/src/features/webinar/components/EventConsole.tsx
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import type { IconName } from "@/components/Icon";
import { EventBuilder } from "./EventBuilder";
import { Backstage } from "./Backstage";
import { RegistrationBuilder } from "./RegistrationBuilder";
import { EventManager } from "./EventManager";
import { AnalyticsTab } from "./AnalyticsTab";

type Tab = "builder" | "registration" | "events" | "backstage" | "analytics";
const TABS: { id: Tab; icon: IconName }[] = [
  { id: "builder", icon: "sliders" },
  { id: "registration", icon: "clipboard" },
  { id: "events", icon: "ticket" },
  { id: "backstage", icon: "film" },
  { id: "analytics", icon: "chartBar" },
];

export function EventConsole() {
  const { t } = useTranslation("webinar");
  const [tab, setTab] = useState<Tab>("builder");
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKey = (e: KeyboardEvent, index: number) => {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    const id = TABS[next].id;
    setTab(id);
    refs.current[id]?.focus();
  };

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label={t("console")} className="flex flex-wrap gap-1 border-b border-line">
        {TABS.map(({ id, icon }, i) => (
          <button
            key={id}
            role="tab"
            ref={(el) => (refs.current[id] = el)}
            aria-selected={tab === id}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            onKeyDown={(e) => onKey(e, i)}
            className={clsx(
              "inline-flex h-11 items-center gap-2 rounded-t-md border-b-2 px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              tab === id ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink",
            )}
          >
            <Icon name={icon} className="h-[18px] w-[18px]" /> {t(`tabs.${id}`)}
          </button>
        ))}
      </div>

      {tab === "builder" ? <EventBuilder /> : null}
      {tab === "registration" ? <RegistrationBuilder /> : null}
      {tab === "events" ? <EventManager /> : null}
      {tab === "backstage" ? <Backstage /> : null}
      {tab === "analytics" ? <AnalyticsTab /> : null}
    </div>
  );
}
