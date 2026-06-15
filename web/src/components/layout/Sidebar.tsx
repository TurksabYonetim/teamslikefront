import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Icon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLogout } from "@/features/auth/auth.hooks";
import { listFor, type Section } from "@/features/messaging/messaging.mock";

/* ---- veri (etiketler i18n anahtarı olarak) ---------------------------- */
const unread = (s: Section) => listFor(s).reduce((n, c) => n + (c.unread ?? 0), 0);

interface Item { to: string; labelKey: string; icon: string; badge?: number }
const GROUPS: { labelKey: string; icon: string; items: Item[] }[] = [
  {
    labelKey: "nav.messaging",
    icon: "chat",
    items: [
      { to: "/channels", labelKey: "nav.channels", icon: "hash", badge: unread("channels") },
      { to: "/dm", labelKey: "nav.dm", icon: "chat", badge: unread("dm") },
      { to: "/inbox", labelKey: "nav.inbox", icon: "inbox", badge: unread("inbox") },
    ],
  },
  {
    labelKey: "nav.meetingsAppointments",
    icon: "video",
    items: [
      { to: "/meetings", labelKey: "nav.meetings", icon: "video" },
      { to: "/room", labelKey: "nav.room", icon: "screen" },
      { to: "/appointments", labelKey: "nav.appointments", icon: "calendar" },
      { to: "/booking", labelKey: "nav.booking", icon: "calCheck" },
      { to: "/webinar", labelKey: "nav.webinar", icon: "webinar" },
    ],
  },
  {
    labelKey: "nav.content",
    icon: "doc",
    items: [
      { to: "/clips", labelKey: "nav.clips", icon: "clip" },
      { to: "/docs", labelKey: "nav.docs", icon: "doc" },
      { to: "/tasks", labelKey: "nav.tasks", icon: "board" },
      { to: "/canvas", labelKey: "nav.canvas", icon: "grid" },
    ],
  },
];

/* ---- stiller (Flowbite) ----------------------------------------------- */
const ITEM =
  "flex items-center p-2 text-sm font-medium rounded-lg group transition-[background-color,color,transform] duration-[var(--dur-press)] ease-[var(--ease-out)] active:scale-[0.98]";
const itemCls = (active: boolean, collapsed?: boolean) =>
  clsx(
    ITEM,
    collapsed && "justify-center",
    active ? "bg-primary-50 text-primary-700" : "text-ink hover:bg-gray-100",
  );

function Badge({ n }: { n?: number }) {
  if (!n) return null;
  return (
    <span className="inline-flex justify-center items-center w-5 h-5 text-xs font-semibold rounded-full text-primary-800 bg-primary-100">
      {n}
    </span>
  );
}

const iconCls = (active: boolean) =>
  clsx("w-5 h-5 shrink-0 transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)]", active ? "text-primary-700" : "text-gray-400 group-hover:text-gray-900");

/** Tek satır (ikon + etiket), aktifken ikon+metin mavi. */
function Leaf({ to, icon, labelKey, end, collapsed }: { to: string; icon: string; labelKey: string; end?: boolean; collapsed?: boolean }) {
  const { t } = useTranslation();
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        title={collapsed ? t(labelKey) : undefined}
        className={({ isActive }) => itemCls(isActive, collapsed)}
      >
        {({ isActive }) => (
          <>
            <Icon name={icon} aria-hidden className={iconCls(isActive)} />
            {!collapsed && <span className="flex-1 ml-3 whitespace-nowrap">{t(labelKey)}</span>}
          </>
        )}
      </NavLink>
    </li>
  );
}

function Group({ labelKey, icon, items, collapsed, onExpand }: { labelKey: string; icon: string; items: Item[]; collapsed?: boolean; onExpand: () => void }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const active = items.some((i) => pathname === i.to);
  const [open, setOpen] = useState(active);

  // daraltılmışken gruba tıklayınca paneli aç ve grubu genişlet
  const handleClick = () => {
    if (collapsed) {
      onExpand();
      setOpen(true);
    } else {
      setOpen((o) => !o);
    }
  };

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        title={collapsed ? t(labelKey) : undefined}
        aria-expanded={!collapsed && open}
        className={clsx(ITEM, "w-full hover:bg-gray-100", collapsed && "justify-center", active ? "text-primary-700" : "text-ink")}
      >
        <Icon name={icon} aria-hidden className={clsx("w-5 h-5 shrink-0 transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)]", active ? "text-primary-700" : "text-gray-400 group-hover:text-gray-900")} />
        {!collapsed && (
          <>
            <span className="flex-1 ml-3 text-left whitespace-nowrap">{t(labelKey)}</span>
            <Icon name="chevronDown" aria-hidden className={clsx("w-5 h-5 text-gray-400 motion-safe:transition-transform duration-[var(--dur-pop)] ease-[var(--ease-out)]", open && "rotate-180")} />
          </>
        )}
      </button>
      {!collapsed && (
        <div
          className={clsx(
            "grid motion-safe:transition-[grid-template-rows] duration-[var(--dur-pop)] ease-[var(--ease-out)]",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          {/* clipper: padding yok ki kapalıyken (0fr) gerçek 0 yükseklik olsun */}
          <div className="overflow-hidden min-h-0">
            <ul
              className={clsx(
                "py-1 space-y-1 transition-opacity duration-[var(--dur-pop)] ease-[var(--ease-out)]",
                open ? "opacity-100" : "opacity-0",
              )}
            >
              {items.map((i) => (
              <li key={i.to}>
                <NavLink to={i.to} className={({ isActive }) => clsx(itemCls(isActive), "pl-9")}>
                  {({ isActive }) => (
                    <>
                      <Icon name={i.icon} aria-hidden className={iconCls(isActive)} />
                      <span className="flex-1 ml-3 whitespace-nowrap">{t(i.labelKey)}</span>
                      <Badge n={i.badge} />
                    </>
                  )}
                </NavLink>
              </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}

/* ---- ana bileşen ------------------------------------------------------ */
export function Sidebar() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const logout = useLogout();
  const expand = () => setCollapsed(false);

  return (
    <div className="relative flex h-full">
      {/* ana panel — daraltılınca ikon çubuğuna (w-16) küçülür */}
      <div
        className={clsx(
          "overflow-y-auto no-scrollbar relative py-5 px-3 h-full bg-surface border-r border-line transition-[width] duration-200 ease-drawer",
          collapsed ? "w-16" : "w-64 max-w-[calc(86vw-4rem)] md:max-w-none",
        )}
      >
        {/* panel başlığı: logo (daraltılmışken yalnız ikon) */}
        <NavLink
          to="/"
          className={clsx("flex items-center mb-5", collapsed ? "justify-center" : "px-1")}
          title="TeamsLike"
        >
          <Logo variant={collapsed ? "icon" : "full"} className={collapsed ? "w-8 h-8" : "h-8"} />
        </NavLink>

        <ul className="space-y-1">
          <Leaf to="/" end icon="home" labelKey="nav.home" collapsed={collapsed} />
          {GROUPS.map((g) => (
            <Group key={g.labelKey} {...g} collapsed={collapsed} onExpand={expand} />
          ))}
          <Leaf to="/phone" icon="phone" labelKey="nav.phone" collapsed={collapsed} />
          <Leaf to="/copilot" icon="sparkles" labelKey="nav.copilot" collapsed={collapsed} />
          <Leaf to="/intelligence" icon="cc" labelKey="nav.intelligence" collapsed={collapsed} />
          <Leaf to="/support" icon="comment" labelKey="nav.support" collapsed={collapsed} />
        </ul>

        <ul className="pt-5 mt-5 space-y-1 border-t border-line">
          <Leaf to="/admin" icon="key" labelKey="nav.admin" collapsed={collapsed} />
          <Leaf to="/users" icon="users" labelKey="nav.team" collapsed={collapsed} />
          <Leaf to="/settings" icon="settings" labelKey="nav.settings" collapsed={collapsed} />
          <li>
            <button
              onClick={logout}
              aria-label={t("nav.logout")}
              title={collapsed ? t("nav.logout") : undefined}
              className={clsx(ITEM, "w-full text-muted hover:bg-gray-100 hover:text-ink", collapsed && "justify-center")}
            >
              <Icon name="logout" aria-hidden className="w-5 h-5 shrink-0 text-gray-400 group-hover:text-gray-900 transition-colors duration-[var(--dur-press)] ease-[var(--ease-out)]" />
              {!collapsed && <span className="flex-1 ml-3 text-left whitespace-nowrap">{t("nav.logout")}</span>}
            </button>
          </li>
        </ul>

        {/* dil değiştirici (yalnız genişken) */}
        {!collapsed && (
          <div className="mt-5 mb-12 px-2">
            <LanguageSwitcher />
          </div>
        )}

        {/* daralt / genişlet (sadece masaüstü) */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? t("panel.show") : t("panel.hide")}
          title={collapsed ? t("panel.show") : t("panel.hide")}
          aria-expanded={!collapsed}
          className={clsx(
            "hidden md:inline-flex absolute bottom-2 p-2 text-muted rounded-full cursor-pointer transition-[background-color,color,transform] duration-150 ease-out hover:text-ink hover:bg-gray-100 active:scale-90",
            collapsed ? "left-1/2 -translate-x-1/2" : "right-2",
          )}
        >
          <Icon name={collapsed ? "chevronRight" : "chevronLeft"} aria-hidden className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
