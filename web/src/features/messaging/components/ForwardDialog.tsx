import { useTranslation } from "react-i18next";
import {
  HiOutlineHashtag,
  HiOutlineLockClosed,
  HiOutlineMegaphone,
  HiOutlineChatBubbleOvalLeft,
} from "react-icons/hi2";
import { Modal } from "@/components/ui";
import { messagingStore, useMessaging } from "../store";
import type { ChannelKind } from "../types";

function KindGlyph({ kind }: { kind: ChannelKind }) {
  const Icon =
    kind === "private"
      ? HiOutlineLockClosed
      : kind === "broadcast"
        ? HiOutlineMegaphone
        : kind === "dm"
          ? HiOutlineChatBubbleOvalLeft
          : HiOutlineHashtag;
  return <Icon className="h-[18px] w-[18px]" aria-hidden />;
}

export function ForwardDialog({
  open,
  onClose,
  messageId,
}: {
  open: boolean;
  onClose: () => void;
  messageId: string;
}) {
  const { t } = useTranslation("messaging");
  const channels = useMessaging((s) => s.channels);
  const activeChannelId = useMessaging((s) => s.activeChannelId);
  const forward = messagingStore.getState().forward;

  return (
    <Modal open={open} onClose={onClose} title={t("forwardTitle")}>
      <ul className="max-h-[50vh] overflow-y-auto">
        {channels
          .filter((c) => c.id !== activeChannelId)
          .map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  forward(messageId, c.id);
                  onClose();
                }}
                className="flex h-11 w-full items-center gap-2 rounded-md px-2 text-start text-sm text-ink hover:bg-surface-2 dark:text-white dark:hover:bg-gray-700"
              >
                <KindGlyph kind={c.kind} />
                <span className="truncate">{c.kind === "dm" ? c.name : `#${c.name}`}</span>
              </button>
            </li>
          ))}
      </ul>
    </Modal>
  );
}
