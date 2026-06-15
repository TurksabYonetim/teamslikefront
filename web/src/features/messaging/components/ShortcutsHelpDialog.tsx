import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui";

type Row = { keys: string; labelKey: string };

const NAV: Row[] = [
  { keys: "⌘K / Ctrl+K", labelKey: "shortcuts.palette" },
  { keys: "?", labelKey: "shortcuts.help" },
];

const MESSAGE: Row[] = [
  { keys: "r", labelKey: "shortcuts.reply" },
  { keys: "t", labelKey: "shortcuts.thread" },
  { keys: "e", labelKey: "shortcuts.edit" },
  { keys: "p", labelKey: "shortcuts.pin" },
  { keys: "s", labelKey: "shortcuts.save" },
  { keys: "f", labelKey: "shortcuts.forward" },
  { keys: "i", labelKey: "shortcuts.important" },
  { keys: "1–6", labelKey: "shortcuts.react" },
];

export function ShortcutsHelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation("messaging");

  const Group = ({ title, rows }: { title: string; rows: Row[] }) => (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-muted">{title}</h3>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={r.keys} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-ink dark:text-white">{t(r.labelKey)}</span>
            <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-ink dark:border-gray-700 dark:text-white">
              {r.keys}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={t("shortcuts.title")}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Group title={t("shortcuts.navGroup")} rows={NAV} />
        <Group title={t("shortcuts.messageGroup")} rows={MESSAGE} />
      </div>
    </Modal>
  );
}
