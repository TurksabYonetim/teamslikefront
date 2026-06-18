// web/src/features/appointments/components/TimezonePicker.tsx
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Select } from "@/components/ui";

const ZONES = ["Europe/Istanbul", "Europe/London", "America/New_York", "America/Los_Angeles", "Asia/Tokyo", "UTC"];

export function TimezonePicker({ value, onChange }: { value: string; onChange: (z: string) => void }) {
  const { t } = useTranslation("appointments");
  const zones = ZONES.includes(value) ? ZONES : [value, ...ZONES];
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-ink-2">
      <Icon name="globe" className="h-4 w-4" aria-hidden="true" /> {t("timezone")}
      <Select
        aria-label={t("timezone")}
        value={value}
        onChange={onChange}
        size="sm"
        className="w-48"
        options={zones.map((z) => ({ value: z, label: z }))}
      />
    </div>
  );
}
