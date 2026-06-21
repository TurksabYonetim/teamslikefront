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
      <div
        role="tablist"
        aria-label={t("console")}
        className="flex gap-1 overflow-x-auto no-scrollbar rounded-xl bg-surface-2 p-1"
      >
        {TABS.map(({ id, icon }, i) => {
          const selected = tab === id;
          return (
            <button
              key={id}
              role="tab"
              ref={(el) => (refs.current[id] = el)}
              aria-selected={selected}
              aria-label={t(`tabs.${id}`)}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(id)}
              onKeyDown={(e) => onKey(e, i)}
              className={clsx(
                "inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-[color,background-color,box-shadow] duration-[var(--dur-pop)] ease-[var(--ease-out)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                selected
                  ? "bg-surface text-brand shadow-sm"
                  : "text-muted hover:text-ink",
              )}
            >
              <Icon name={icon} className="h-4 w-4 shrink-0" />
              <span className={clsx(selected ? "inline" : "hidden sm:inline")}>
                {t(`tabs.${id}`)}
              </span>
            </button>
          );
        })}
      </div>

      {tab === "builder" ? <EventBuilder /> : null}
      {tab === "registration" ? <RegistrationBuilder /> : null}
      {tab === "events" ? <EventManager /> : null}
      {tab === "backstage" ? <Backstage /> : null}
      {tab === "analytics" ? <AnalyticsTab /> : null}
    </div>
  );
}
