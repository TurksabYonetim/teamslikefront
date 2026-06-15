import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge, Button, EmptyState } from "@/components/ui";
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

  const menu = menus[0];
  const hours = businessHours[0];
  const open = hours ? isWithinHours(hours) : false;

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
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-6 overflow-y-auto p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("ivr.title")}</h2>
        <Badge>{open ? t("ivr.openNow") : t("ivr.closedNow")}</Badge>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{t("ivr.greeting")}</p>
        <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">{menu.greeting}</p>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{t("ivr.options")}</p>
        <ul className="mb-4 divide-y divide-gray-100 dark:divide-gray-700">
          {menu.options.map((o) => (
            <li key={o.key} className="flex items-center justify-between py-2 text-sm">
              <span className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 font-semibold dark:bg-gray-700">{o.key}</span>
                <span className="text-gray-900 dark:text-white">{o.label}</span>
                <span className="text-gray-400">→ {t(`enums.ivrAction.${o.action}`)}{o.target ? ` (${o.target})` : ""}</span>
              </span>
              <button
                type="button"
                onClick={() => pbxStore.getState().removeIvrOption(menu.id, o.key)}
                aria-label={`${t("ivr.remove")} ${o.key}`}
                className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
              >
                {t("ivr.remove")}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col text-xs text-gray-500">
            {t("ivr.key")}
            <input value={key} onChange={(e) => setKey(e.target.value)} aria-label={t("ivr.key")} className="input w-16" maxLength={1} />
          </label>
          <label className="flex flex-col text-xs text-gray-500">
            {t("ivr.label")}
            <input value={label} onChange={(e) => setLabel(e.target.value)} aria-label={t("ivr.label")} className="input w-28" />
          </label>
          <label className="flex flex-col text-xs text-gray-500">
            {t("ivr.action")}
            <select value={action} onChange={(e) => setAction(e.target.value as IVROptionAction)} aria-label={t("ivr.action")} className="input">
              {ACTIONS.map((a) => <option key={a} value={a}>{t(`enums.ivrAction.${a}`)}</option>)}
            </select>
          </label>
          <label className="flex flex-col text-xs text-gray-500">
            {t("ivr.target")}
            <input value={target} onChange={(e) => setTarget(e.target.value)} aria-label={t("ivr.target")} className="input w-32" />
          </label>
          <Button size="sm" onClick={addOption} disabled={!key.trim()}>{t("ivr.addOption")}</Button>
        </div>
      </div>

      {hours && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{t("ivr.hours")}</p>
          <ul className="grid grid-cols-2 gap-1 text-sm text-gray-700 dark:text-gray-300 sm:grid-cols-3">
            {hours.weekly.map((w) => (
              <li key={w.day}>{t(`enums.day.${w.day}`)}: {hhmm(w.openMin)}–{hhmm(w.closeMin)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
