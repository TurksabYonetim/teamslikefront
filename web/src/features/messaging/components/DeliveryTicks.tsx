import { useTranslation } from "react-i18next";
import { HiOutlineClock, HiOutlineCheck } from "react-icons/hi2";
import clsx from "clsx";
import type { DeliveryStatus } from "../types";

/** WhatsApp tarzı teslim göstergesi (ikon + erişilebilir etiket). */
export function DeliveryTicks({ status, className }: { status?: DeliveryStatus; className?: string }) {
  const { t } = useTranslation("messaging");
  if (!status) return null;
  const label = t(`delivery.${status}`);

  if (status === "sending") {
    return <HiOutlineClock aria-label={label} className={clsx("h-3.5 w-3.5 text-muted", className)} />;
  }
  if (status === "sent") {
    return <HiOutlineCheck aria-label={label} className={clsx("h-3.5 w-3.5 text-muted", className)} />;
  }
  const tone = status === "read" ? "text-brand" : "text-muted";
  return (
    <span aria-label={label} className={clsx("relative inline-flex", className)}>
      <HiOutlineCheck className={clsx("h-3.5 w-3.5", tone)} />
      <HiOutlineCheck className={clsx("-ml-2 h-3.5 w-3.5", tone)} />
    </span>
  );
}
