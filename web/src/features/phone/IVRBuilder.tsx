import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineTrash, HiOutlinePlus } from "react-icons/hi2";
import { Badge, Button, CollapsibleSection, EmptyState, Input, Select } from "@/components/ui";
import { usePbx, pbxStore } from "./pbxStore";
import { isWithinHours } from "./pbx";
import type { IVROptionAction } from "./phone.types";

const ACTIONS: IVROptionAction[] = ["menu", "queue", "voicemail", "forward", "extension"];

function hhmm(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

/** IVR menü ağacı + mesai saatleri. Seçenek ekle/kaldır; isWithinHours ile
 *  şu anki açık/kapalı durumu gösterir. */
export function IVRBuilder() {
  const { t } = useTranslation("phone");
  const menus = usePbx((s) => s.ivrMenus);
  const businessHours = usePbx((s) => s.businessHours);
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [action, setAction] = useState<IVROptionAction>("extension");
  const [target, setTarget] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const menu = menus[0];
  const hours = businessHours[0];
  const open = hours ? isWithinHours(hours) : false;
  const todayDow = new Date().getDay(); // 0=Paz … 6=Cmt — HoursWindow.day ile aynı

  if (!menu) {
    return (
      <div className="flex h-full items-center justify-center py-16">
        <EmptyState title={t("ivr.title")} description="" />
      </div>
    );
  }

  const addOption = () => {
    const k = key.trim();
    if (!k) return;
    pbxStore.getState().addIvrOption(menu.id, { key: k, label: label.trim() || k, action, target: target.trim() || undefined });
    setKey("");
    setLabel("");
    setTarget("");
  };

  return (
    <div className="ivr-builder mx-auto flex h-full w-full max-w-3xl flex-col gap-6 overflow-y-auto p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-lg font-semibold text-ink sm:text-xl">{t("ivr.title")}</h2>
        <Badge>{open ? t("ivr.openNow") : t("ivr.closedNow")}</Badge>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <p className="mb-1 text-xs font-semibold text-muted">{t("ivr.greeting")}</p>
        <p className="mb-4 text-sm text-ink-2">{menu.greeting}</p>

        <p className="mb-2 text-xs font-semibold text-muted">{t("ivr.options")}</p>
        <ul className="mb-4 divide-y divide-gray-100 dark:divide-gray-700">
          {menu.options.map((o) => (
            <li key={o.key} className="ivr-option flex items-start gap-2.5 py-2">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-ink tabular-nums dark:bg-gray-700 dark:text-white">{o.key}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="truncate text-sm font-medium text-gray-900 dark:text-white">{o.label}</span>
                  <button
                    type="button"
                    onClick={() => pbxStore.getState().removeIvrOption(menu.id, o.key)}
                    aria-label={`${t("ivr.remove")} ${o.key}`}
                    className="-me-1 -mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 motion-safe:active:scale-[0.94] dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  >
                    <HiOutlineTrash size={15} aria-hidden />
                  </button>
                </div>
                <span className="block truncate text-xs text-muted">
                  → {t(`enums.ivrAction.${o.action}`)}{o.target ? ` · ${o.target}` : ""}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Yeni seçenek — açılır kapanır inset kart (impeccable accordion) */}
        <div className="rounded-lg border border-line bg-surface-2 p-3 sm:p-4">
          <CollapsibleSection
            open={formOpen}
            onToggle={() => setFormOpen((o) => !o)}
            id="ivr-new-option"
            title={
              <span className="flex items-center gap-1.5">
                <HiOutlinePlus size={16} aria-hidden /> {t("ivr.newOption")}
              </span>
            }
          >
              <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink-2">{t("ivr.key")}</span>
              <Input value={key} onChange={(e) => setKey(e.target.value)} aria-label={t("ivr.key")} maxLength={1} className="text-center font-mono" />
              <span className="text-xs text-muted">{t("ivr.keyHint")}</span>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink-2">{t("ivr.label")}</span>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} aria-label={t("ivr.label")} />
              <span className="text-xs text-muted">{t("ivr.labelHint")}</span>
            </label>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink-2">{t("ivr.action")}</span>
              <Select<IVROptionAction>
                value={action}
                onChange={setAction}
                options={ACTIONS.map((a) => ({ value: a, label: t(`enums.ivrAction.${a}`) }))}
                aria-label={t("ivr.action")}
                size="md"
                className="w-full"
              />
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink-2">{t("ivr.target")}</span>
              <Input value={target} onChange={(e) => setTarget(e.target.value)} aria-label={t("ivr.target")} />
              <span className="text-xs text-muted">{t("ivr.targetHint")}</span>
            </label>
              </div>
              <Button size="sm" onClick={addOption} disabled={!key.trim()} className="mt-3 w-full">{t("ivr.addOption")}</Button>
          </CollapsibleSection>
        </div>
      </div>

      {hours && (
        <div className="rounded-lg border border-line bg-surface p-4">
          <p className="mb-2 text-xs font-semibold text-muted">{t("ivr.hours")}</p>
          <ul className="flex flex-col">
            {hours.weekly.map((w) => {
              const isToday = w.day === todayDow;
              return (
                <li
                  key={w.day}
                  aria-current={isToday ? "date" : undefined}
                  className={"ivr-hours-row flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm " + (isToday ? "bg-primary-50 dark:bg-gray-700" : "")}
                >
                  <span className={isToday ? "flex min-w-0 items-center gap-1.5 font-medium text-ink" : "min-w-0 truncate text-ink-2"}>
                    {isToday && <span className={"h-1.5 w-1.5 rounded-full " + (open ? "bg-green-700 dark:bg-green-300" : "bg-gray-400")} aria-hidden="true" />}
                    {t(`enums.day.${w.day}`)}
                    {isToday && <span className="text-xs font-normal text-muted">· {t("ivr.today")}</span>}
                  </span>
                  <span className={"shrink-0 tabular-nums text-ink" + (isToday ? " font-medium" : "")}>{hhmm(w.openMin)}–{hhmm(w.closeMin)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
