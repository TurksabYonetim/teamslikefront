import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Topbar } from "@/components/layout/Topbar";
import { Icon } from "@/components/Icon";
import {
  Button,
  EmptyState,
  Skeleton,
  Tabs,
  useToast,
} from "@/components/ui";
import { apiErrorMessage } from "@/lib/api";
import {
  useAdminOverview,
  useAuditLogs,
  usePolicies,
  useUpsertPolicy,
} from "./admin.hooks";
import type { AuditLog, Policy } from "./admin.types";
import {
  ActionBarChart,
  ActionPieChart,
  EventsOverTimeChart,
} from "./AdminCharts";
import { AuditLogDetail } from "./AuditLogDetail";
import { auditLogsToCsv, downloadCsv, filterByDateRange } from "./admin.utils";
import { GovOverviewDashboard } from "./components/GovOverviewDashboard";
import { GovAuditLogViewer } from "./components/GovAuditLogViewer";
import { SecurityPolicies } from "./components/SecurityPolicies";
import { FederationSettings } from "./components/FederationSettings";
import { BillingPanel } from "./components/BillingPanel";

/* ---- yardımcılar ------------------------------------------------------ */
function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function shortId(id: string | null): string {
  if (!id) return "—";
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

/* Ortak input sınıfı (custom ease-out, transition:all yok). */
const INPUT_CLASS =
  "h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder-muted transition-colors duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand";

/** İndirme (download) inline SVG — Icon setinde yok, dokunmamak için inline. */
function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

/* ---- genel bakış ------------------------------------------------------- */
function OverviewSection() {
  const { t } = useTranslation("admin");
  const overview = useAdminOverview();
  // Grafikler için ham loglar (geniş limit — client-side türev).
  const logsQuery = useAuditLogs({ limit: 500 });

  if (overview.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (overview.isError || !overview.data) {
    return (
      <EmptyState
        title={t("state.errorTitle")}
        description={t("state.errorDescription")}
        icon={<Icon name="info" className="w-6 h-6" />}
      />
    );
  }

  const data = overview.data;
  const cards = [
    {
      label: t("overview.auditLogCount"),
      value: String(data.audit_log_count),
      icon: "key" as const,
    },
    {
      label: t("overview.policyCount"),
      value: String(data.policy_count),
      icon: "settings" as const,
    },
    {
      label: t("overview.lastAudit"),
      value: fmtDate(data.last_audit_at),
      icon: "clock" as const,
    },
  ];

  const logs = logsQuery.data ?? [];
  const chartsLoading = logsQuery.isLoading;

  return (
    <div className="flex flex-col gap-5">
      <GovOverviewDashboard />
      <div className="tl-stagger grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-line bg-surface p-4"
          >
            <div className="flex items-center gap-2 text-xs text-muted">
              <Icon name={c.icon} className="w-4 h-4" />
              {c.label}
            </div>
            <div className="mt-1 text-base font-semibold text-ink">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="tl-stagger grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-2 text-sm font-semibold text-ink">
            {t("overview.byActionTitle")}
          </div>
          {chartsLoading ? (
            <Skeleton className="h-56" />
          ) : (
            <ActionBarChart logs={logs} />
          )}
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-2 text-sm font-semibold text-ink">
            {t("overview.shareTitle")}
          </div>
          {chartsLoading ? (
            <Skeleton className="h-56" />
          ) : (
            <ActionPieChart logs={logs} />
          )}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4 motion-safe:[animation:tl-fade-in_var(--dur-toast)_var(--ease-out)_both]">
        <div className="mb-2 text-sm font-semibold text-ink">
          {t("overview.timelineTitle")}
        </div>
        {chartsLoading ? (
          <Skeleton className="h-60" />
        ) : (
          <EventsOverTimeChart logs={logs} />
        )}
      </div>
    </div>
  );
}

/* ---- denetim günlüğü --------------------------------------------------- */
function AuditLogSection() {
  const { t } = useTranslation("admin");
  const toast = useToast();
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const { data, isLoading, isError } = useAuditLogs({
    action: action.trim() || undefined,
    limit: 500,
  });

  const rows = useMemo<AuditLog[]>(() => {
    let list = data ?? [];
    list = filterByDateRange(list, from, to);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.action.toLowerCase().includes(q) ||
          r.target.toLowerCase().includes(q) ||
          (r.ip ?? "").toLowerCase().includes(q) ||
          (r.actor_user_id ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [data, search, from, to]);

  const hasFilters =
    !!action.trim() || !!search.trim() || !!from || !!to;

  const resetFilters = () => {
    setAction("");
    setSearch("");
    setFrom("");
    setTo("");
  };

  const exportCsv = () => {
    if (rows.length === 0) return;
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`audit-logs-${stamp}.csv`, auditLogsToCsv(rows));
    toast.show({ message: t("audit.exported"), variant: "success" });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">{t("audit.from")}</span>
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => setFrom(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted">{t("audit.to")}</span>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
            className={INPUT_CLASS}
          />
        </label>
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder={t("audit.actionFilter")}
          aria-label={t("audit.actionFilter")}
          className={`${INPUT_CLASS} min-w-[160px]`}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("audit.searchPlaceholder")}
          aria-label={t("audit.searchPlaceholder")}
          className={`${INPUT_CLASS} flex-1 min-w-[180px]`}
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            {t("audit.clearFilters")}
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={exportCsv}
          disabled={isLoading || rows.length === 0}
          leftIcon={<DownloadIcon className="w-4 h-4" />}
        >
          {t("audit.export")}
        </Button>
      </div>

      {!isLoading && !isError && (
        <div className="text-xs text-muted">
          {t("audit.resultCount", { count: rows.length })}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title={t("state.errorTitle")}
          description={t("state.errorDescription")}
          icon={<Icon name="info" className="w-6 h-6" />}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title={t("audit.emptyTitle")}
          description={t("audit.emptyDescription")}
          icon={<Icon name="key" className="w-6 h-6" />}
          action={
            hasFilters ? (
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                {t("audit.clearFilters")}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2 text-left text-xs text-muted">
                <th className="px-3 py-2 font-medium">{t("audit.col.createdAt")}</th>
                <th className="px-3 py-2 font-medium">{t("audit.col.action")}</th>
                <th className="px-3 py-2 font-medium">{t("audit.col.target")}</th>
                <th className="px-3 py-2 font-medium">{t("audit.col.actor")}</th>
                <th className="px-3 py-2 font-medium">{t("audit.col.ip")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  role="button"
                  aria-label={`${r.action} — ${r.target || "—"}`}
                  onClick={() => setSelected(r)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(r);
                    }
                  }}
                  className="cursor-pointer border-b border-line transition-colors duration-150 ease-out last:border-0 hover:bg-surface-2 motion-safe:active:bg-surface-3 focus:outline-none focus-visible:bg-surface-2"
                >
                  <td className="px-3 py-2 whitespace-nowrap text-muted">
                    {fmtDate(r.created_at)}
                  </td>
                  <td className="px-3 py-2 font-medium text-ink">{r.action}</td>
                  <td className="px-3 py-2 text-ink-2">{r.target || "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted">
                    {shortId(r.actor_user_id)}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted">
                    {r.ip || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AuditLogDetail log={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

/* ---- politikalar ------------------------------------------------------- */
function PolicyRow({ policy }: { policy: Policy }) {
  const { t } = useTranslation("admin");
  const toast = useToast();
  const upsert = useUpsertPolicy();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(policy.value);
  const dirty = value !== policy.value;

  const save = () => {
    upsert.mutate(
      { key: policy.key, body: { value } },
      {
        onSuccess: () => {
          toast.show({ message: t("policies.saved"), variant: "success" });
          setEditing(false);
        },
        onError: (err) =>
          toast.show({ message: apiErrorMessage(err), variant: "error" }),
      },
    );
  };

  const cancel = () => {
    setValue(policy.value);
    setEditing(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-3 transition-colors duration-150 ease-out hover:border-ink-3/30">
      <div className="min-w-[160px]">
        <div className="text-xs text-muted">{t("policies.key")}</div>
        <div className="font-mono text-sm font-medium text-ink">{policy.key}</div>
        <div className="mt-0.5 text-xs text-muted">
          {t("policies.updatedAt", { date: fmtDate(policy.updated_at) })}
        </div>
      </div>

      {editing ? (
        <>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && dirty) save();
              if (e.key === "Escape") cancel();
            }}
            className={`${INPUT_CLASS} flex-1 min-w-[180px]`}
          />
          <Button
            size="sm"
            onClick={save}
            loading={upsert.isPending}
            disabled={!dirty}
          >
            {t("policies.save")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={cancel}
            disabled={upsert.isPending}
          >
            {t("policies.cancel")}
          </Button>
        </>
      ) : (
        <>
          <div className="flex-1 min-w-[180px] break-all font-mono text-sm text-ink-2">
            {policy.value || <span className="text-muted">{t("policies.emptyValue")}</span>}
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setEditing(true)}
            leftIcon={<Icon name="pencil" className="w-3.5 h-3.5" />}
          >
            {t("policies.edit")}
          </Button>
        </>
      )}
    </div>
  );
}

function NewPolicyForm() {
  const { t } = useTranslation("admin");
  const toast = useToast();
  const upsert = useUpsertPolicy();
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  const add = () => {
    const k = key.trim();
    if (!k) return;
    upsert.mutate(
      { key: k, body: { value } },
      {
        onSuccess: () => {
          toast.show({ message: t("policies.saved"), variant: "success" });
          setKey("");
          setValue("");
        },
        onError: (err) =>
          toast.show({ message: apiErrorMessage(err), variant: "error" }),
      },
    );
  };

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-line bg-surface-2 p-3">
      <input
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder={t("policies.keyPlaceholder")}
        aria-label={t("policies.keyPlaceholder")}
        className={`${INPUT_CLASS} min-w-[160px]`}
      />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("policies.valuePlaceholder")}
        aria-label={t("policies.valuePlaceholder")}
        onKeyDown={(e) => {
          if (e.key === "Enter" && key.trim()) add();
        }}
        className={`${INPUT_CLASS} flex-1 min-w-[180px]`}
      />
      <Button
        size="sm"
        variant="secondary"
        onClick={add}
        loading={upsert.isPending}
        disabled={!key.trim()}
        leftIcon={<Icon name="plus" className="w-4 h-4" />}
      >
        {t("policies.add")}
      </Button>
    </div>
  );
}

function PolicySection() {
  const { t } = useTranslation("admin");
  const { data, isLoading, isError } = usePolicies();

  return (
    <div className="flex flex-col gap-4">
      <NewPolicyForm />
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title={t("state.errorTitle")}
          description={t("state.errorDescription")}
          icon={<Icon name="info" className="w-6 h-6" />}
        />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title={t("policies.emptyTitle")}
          description={t("policies.emptyDescription")}
          icon={<Icon name="settings" className="w-6 h-6" />}
        />
      ) : (
        <div className="tl-stagger flex flex-col gap-3">
          {(data ?? []).map((p) => (
            <PolicyRow key={p.id} policy={p} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- ana sayfa -------------------------------------------------------- */
export function AdminPage() {
  const { t } = useTranslation("admin");

  return (
    <div className="flex h-full flex-col">
      <Topbar title={t("title")} subtitle={t("subtitle")} />
      <div className="flex-1 overflow-y-auto p-5">
        <Tabs
          items={[
            {
              id: "overview",
              label: t("tabs.overview"),
              content: <OverviewSection />,
            },
            {
              id: "audit",
              label: t("tabs.audit"),
              content: <AuditLogSection />,
            },
            {
              id: "policies",
              label: t("tabs.policies"),
              content: <PolicySection />,
            },
            {
              id: "security",
              label: t("tabs.security"),
              content: <SecurityPolicies />,
            },
            {
              id: "federation",
              label: t("tabs.federation"),
              content: <FederationSettings />,
            },
            {
              id: "billing",
              label: t("tabs.billing"),
              content: <BillingPanel />,
            },
            {
              id: "governance-audit",
              label: t("tabs.governanceAudit"),
              content: <GovAuditLogViewer />,
            },
          ]}
        />
      </div>
    </div>
  );
}
