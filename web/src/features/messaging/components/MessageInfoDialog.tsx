import { useTranslation } from "react-i18next";
import { Modal, Avatar } from "@/components/ui";
import { MEMBERS, colorFor } from "../members";
import { DeliveryTicks } from "./DeliveryTicks";
import type { Message } from "../types";

/** Basit göreceli zaman: <60 → "{n}dk", aksi → "{n}sa". */
function relMinutes(t: (k: string) => string, minutes: number): string {
  if (minutes <= 0) return t("now");
  if (minutes < 60) return `${minutes}dk`;
  return `${Math.round(minutes / 60)}sa`;
}

/** WhatsApp tarzı "Mesaj bilgisi" — alıcı başına teslim/okundu durumu (mock). */
export function MessageInfoDialog({
  open,
  onClose,
  message,
}: {
  open: boolean;
  onClose: () => void;
  message: Message;
}) {
  const { t } = useTranslation("messaging");
  const recipients = MEMBERS.filter((m) => m.id !== message.authorId).slice(0, 4);

  return (
    <Modal open={open} onClose={onClose} title={t("messageInfoTitle")}>
      <div className="space-y-3">
        <div className="rounded-md border-s-2 border-brand bg-surface-2 px-3 py-2 text-sm text-ink dark:text-white">
          {message.body || t("voiceMessage")}
        </div>
        <ul className="space-y-2">
          {recipients.map((r, i) => {
            const read = i !== recipients.length - 1; // sonuncu sadece "iletildi"
            return (
              <li key={r.id} className="flex items-center gap-3">
                <Avatar name={r.name} color={colorFor(r.id)} size="sm" />
                <span className="flex-1 truncate text-sm text-ink dark:text-white">{r.name}</span>
                <span className="inline-flex items-center gap-1 text-sm text-muted">
                  <DeliveryTicks status={read ? "read" : "delivered"} />
                  <span>{read ? t("readBy") : t("deliveredTo")}</span>
                  <span>· {relMinutes(t, (i + 1) * 3)}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}
