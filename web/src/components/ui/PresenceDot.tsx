import clsx from "clsx";
import type { Presence } from "@/features/messaging/members";

const COLORS: Record<Presence, string> = {
  online: "bg-green-500",
  away: "bg-amber-400",
  offline: "bg-gray-400",
};

export function PresenceDot({ presence, className }: { presence: Presence; className?: string }) {
  return <span aria-hidden className={clsx("inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-800", COLORS[presence], className)} />;
}
