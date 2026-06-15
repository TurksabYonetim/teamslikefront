/** Denetim kaydı detay modalı — satıra tıklanınca açılır. */
import { useTranslation } from "react-i18next";
import { Modal, Button, useToast } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { AuditLog } from "./admin.types";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

interface Row {
  label: string;
  value: string;
  mono?: boolean;
  copy?: boolean;
}

export function AuditLogDetail({
  log,
  onClose,
}: {
  log: AuditLog | null;
  onClose: () => void;
}) {
  const { t } = useTranslation("admin");
  const toast = useToast();

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.show({ message: t("audit.copied"), variant: "success" });
    } catch {
      toast.show({ message: t("state.errorTitle"), variant: "error" });
    }
  };

  const rows: Row[] = log
    ? [
        { label: t("audit.col.action"), value: log.action || "—" },
        { label: t("audit.col.target"), value: log.target || "—", copy: !!log.target },
        { label: t("audit.col.createdAt"), value: fmtDate(log.created_at) },
        {
          label: t("audit.col.actor"),
          value: log.actor_user_id || "—",
          mono: true,
          copy: !!log.actor_user_id,
        },
        { label: t("audit.col.ip"), value: log.ip || "—", mono: true },
        { label: t("audit.col.id"), value: log.id, mono: true, copy: true },
      ]
    : [];

  return (
    <Modal
      open={!!log}
      onClose={onClose}
      title={t("audit.detailTitle")}
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          {t("audit.close")}
        </Button>
      }
    >
      <dl className="flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-3">
            <dt className="text-[12.5px] text-gray-500 pt-0.5">{r.label}</dt>
            <dd className="flex items-center gap-1.5 text-right">
              <span
                className={
                  r.mono
                    ? "font-mono text-[12.5px] text-gray-900 break-all"
                    : "text-sm font-medium text-gray-900 break-words"
                }
              >
                {r.value}
              </span>
              {r.copy && r.value !== "—" && (
                <button
                  type="button"
                  onClick={() => copy(r.value)}
                  title={t("audit.copy")}
                  className="shrink-0 rounded p-1 text-gray-400 transition-colors duration-150 ease-out hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <Icon name="copy" className="w-3.5 h-3.5" />
                </button>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
