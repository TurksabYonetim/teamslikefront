import * as React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineCheck } from "react-icons/hi2";
import clsx from "clsx";
import { Modal, Button, Avatar, PresenceDot } from "@/components/ui";
import { messagingStore } from "../store";
import { MEMBERS, ME_ID } from "../members";

export function NewDmDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation("messaging");
  const createDm = messagingStore.getState().createDm;
  const [sel, setSel] = React.useState<string[]>([]);
  const candidates = MEMBERS.filter((m) => m.id !== ME_ID);

  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = () => {
    if (sel.length === 0) return;
    createDm(sel);
    setSel([]);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t("newDmTitle")}>
      <div className="space-y-3">
        <ul className="max-h-[40dvh] space-y-1 overflow-y-auto">
          {candidates.map((m) => {
            const on = sel.includes(m.id);
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => toggle(m.id)}
                  aria-pressed={on}
                  className={clsx(
                    "flex w-full items-center gap-2 rounded-md border px-2 py-2 text-start text-sm",
                    on
                      ? "border-brand bg-surface-2"
                      : "border-transparent hover:bg-surface-2",
                  )}
                >
                  <span className="relative inline-block shrink-0">
                    <Avatar name={m.name} size="sm" />
                    <PresenceDot presence={m.presence} className="absolute -bottom-0.5 -right-0.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink">{m.name}</span>
                  {on ? <HiOutlineCheck className="h-4 w-4 shrink-0 text-brand" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button onClick={submit} disabled={sel.length === 0}>
            {sel.length > 1 ? t("startGroupDm") : t("startDm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
