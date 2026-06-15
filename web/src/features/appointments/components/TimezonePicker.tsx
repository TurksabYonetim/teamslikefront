// web/src/features/appointments/components/TimezonePicker.tsx
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";

const ZONES = ["Europe/Istanbul", "Europe/London", "America/New_York", "America/Los_Angeles", "Asia/Tokyo", "UTC"];

export function TimezonePicker({ value, onChange }: { value: string; onChange: (z: string) => void }) {
  const { t } = useTranslation("appointments");
  const zones = ZONES.includes(value) ? ZONES : [value, ...ZONES];
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-ink-2">
      <Icon name="globe" className="h-4 w-4" aria-hidden="true" /> {t("timezone")}
      <select
        aria-label={t("timezone")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-lg border border-gray-300 bg-surface-2 px-2.5 text-sm text-ink focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        {zones.map((z) => <option key={z} value={z}>{z}</option>)}
      </select>
    </label>
  );
}
