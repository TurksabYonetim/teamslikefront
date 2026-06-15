import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge, Button, IconButton } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { workhubStore, WORKHUB_SELF_ID } from "../workhub.store";
import { approvalSummary, hasShiftConflict, openShifts, tallyResponses, weeklyHours } from "../workspace.workhub";

const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** Apps — birleşik iş uygulamaları hub'ı: Onaylar · Vardiyalar · Formlar. */
export function AppsPanel() {
  const { t } = useTranslation("docs");
  const approvals = useStore(workhubStore, (s) => s.approvals);
  const shifts = useStore(workhubStore, (s) => s.shifts);
  const forms = useStore(workhubStore, (s) => s.forms);
  const responses = useStore(workhubStore, (s) => s.responses);
  const { requestApproval, decideApproval, claimShift, respondForm } = workhubStore.getState();

  const [reqTitle, setReqTitle] = useState("");
  const submitRequest = () => {
    if (!reqTitle.trim()) return;
    requestApproval(reqTitle.trim());
    setReqTitle("");
  };
  const sum = approvalSummary(approvals);
  const myHours = weeklyHours(shifts, WORKHUB_SELF_ID);
  const conflict = hasShiftConflict(shifts, WORKHUB_SELF_ID);
  const open = openShifts(shifts);
  const days = t("apps.days", { returnObjects: true }) as string[];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Approvals */}
      <div className="card p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Icon name="clipboard" className="h-4 w-4" /> {t("apps.approvals")}
        </h3>
        <div className="mb-2 flex gap-2 text-sm">
          <Badge tone="warning">{t("apps.pending", { n: sum.pending })}</Badge>
          <Badge tone="positive">{sum.approved}</Badge>
          <Badge tone="danger">{sum.rejected}</Badge>
        </div>
        <div className="mb-2 flex items-center gap-1">
          <input
            value={reqTitle}
            onChange={(e) => setReqTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitRequest();
            }}
            placeholder={t("apps.requestPh")}
            aria-label={t("apps.request")}
            className="input h-9 flex-1"
          />
          <IconButton label={t("apps.request")} onClick={submitRequest}>
            <Icon name="plus" className="h-4 w-4" />
          </IconButton>
        </div>
        <ul className="space-y-1">
          {approvals.map((a) => (
            <li key={a.id} className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm">
              <span className="min-w-0 flex-1 truncate text-ink">{a.title}</span>
              {a.status === "pending" ? (
                <>
                  <IconButton label={t("apps.approve")} className="h-9 w-9 text-ok" onClick={() => decideApproval(a.id, "approved")}>
                    <Icon name="checkCircle" className="h-4 w-4" />
                  </IconButton>
                  <IconButton label={t("apps.reject")} className="h-9 w-9 text-danger" onClick={() => decideApproval(a.id, "rejected")}>
                    <Icon name="close" className="h-4 w-4" />
                  </IconButton>
                </>
              ) : (
                <Badge tone={a.status === "approved" ? "positive" : "danger"}>{t(`apps.status.${a.status}`)}</Badge>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Shifts */}
      <div className="card p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Icon name="calendar" className="h-4 w-4" /> {t("apps.shifts")}
        </h3>
        <div className="mb-2 flex items-center gap-2 text-sm">
          <Badge tone="accent">{t("apps.weeklyHours", { n: myHours })}</Badge>
          {conflict ? <Badge tone="danger">{t("apps.conflict")}</Badge> : null}
        </div>
        <ul className="space-y-1">
          {shifts.map((sh) => (
            <li key={sh.id} className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm">
              <span className="text-muted">{days[sh.day]}</span>
              <span className="flex-1 text-ink">
                {hhmm(sh.startMin)}–{hhmm(sh.endMin)} · {sh.role}
              </span>
              {sh.open || sh.userId === "" ? (
                <Button variant="ghost" size="sm" onClick={() => claimShift(sh.id)}>
                  <Icon name="handRaised" className="h-4 w-4" /> {t("apps.claim")}
                </Button>
              ) : (
                <span className="text-muted">{sh.userName}</span>
              )}
            </li>
          ))}
        </ul>
        {open.length === 0 ? <p className="mt-1 text-sm text-muted">{t("apps.noOpenShifts")}</p> : null}
      </div>

      {/* Forms */}
      <div className="card p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Icon name="chartBar" className="h-4 w-4" /> {t("apps.forms")}
        </h3>
        {forms.map((f) => {
          const counts = tallyResponses(f, responses);
          const total = Object.values(counts).reduce((n, c) => n + c, 0) || 1;
          return (
            <div key={f.id} className="space-y-1">
              <div className="text-sm text-ink">{f.question}</div>
              {f.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => respondForm(f.id, o.id)}
                  className="block w-full rounded-md border border-line px-3 py-1.5 text-left text-sm text-ink transition-colors hover:bg-surface-2 motion-safe:active:scale-[0.99] motion-reduce:transition-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex-1">{o.text}</span>
                    <span className="tabular-nums text-muted">{counts[o.id]}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-surface-3" aria-hidden>
                    <div
                      className="h-1.5 rounded-full bg-brand transition-[width] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none"
                      style={{ width: `${Math.round((counts[o.id] / total) * 100)}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
