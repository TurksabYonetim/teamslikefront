// web/src/features/appointments/components/TimezonePicker.tsx
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";

const ZONES = ["Europe/Istanbul", "Europe/London", "America/New_York", "America/Los_Angeles", "Asia/Tokyo", "UTC"];

export function TimezonePicker({ value, onChange }: { value: string; onChange: (z: string) => void }) {
  const { t } = useTranslation("appointments");
  const zones = ZONES.includes(value) ? ZONES : [value, ...ZONES];
  return (
    <label className="flex items-center gap-2 text-base text-muted">
      <Icon name="globe" className="h-4 w-4" /> {t("timezone")}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-md border border-line bg-surface px-2 text-base text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {zones.map((z) => <option key={z} value={z}>{z}</option>)}
      </select>
    </label>
  );
}
