import * as React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineHashtag, HiOutlineLockClosed, HiOutlineUsers } from "react-icons/hi2";
import clsx from "clsx";
import { Modal, Button } from "@/components/ui";
import { messagingStore } from "../store";
import type { ChannelKind } from "../types";

type Kind = Extract<ChannelKind, "channel" | "private" | "shared">;

const KINDS: { kind: Kind; labelKey: string; Icon: typeof HiOutlineHashtag }[] = [
  { kind: "channel", labelKey: "channelKindPublic", Icon: HiOutlineHashtag },
  { kind: "private", labelKey: "channelKindPrivate", Icon: HiOutlineLockClosed },
  { kind: "shared", labelKey: "channelKindShared", Icon: HiOutlineUsers },
];

export function CreateChannelDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation("messaging");
  const createChannel = messagingStore.getState().createChannel;

  const [name, setName] = React.useState("");
  const [kind, setKind] = React.useState<Kind>("channel");

  const submit = () => {
    if (!name.trim()) return;
    createChannel(name.trim().replace(/\s+/g, "-").toLowerCase(), kind);
    setName("");
    setKind("channel");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t("createChannelTitle")}>
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm text-muted">{t("channelName")}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </label>

        <div className="flex gap-2">
          {KINDS.map(({ kind: k, labelKey, Icon }) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
              className={clsx(
                "flex h-11 flex-1 items-center justify-center gap-2 rounded-md border text-sm",
                kind === k
                  ? "border-brand bg-surface-2 text-brand"
                  : "border-line text-muted hover:bg-surface-2 dark:border-gray-700 dark:hover:bg-gray-700",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden /> {t(labelKey)}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={submit} disabled={!name.trim()}>
            {t("create")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
