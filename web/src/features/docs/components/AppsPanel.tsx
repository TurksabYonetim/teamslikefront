import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { workhubStore, WORKHUB_SELF_ID } from "../workhub.store";
import { approvalSummary, hasShiftConflict, openShifts, tallyResponses, weeklyHours } from "../workspace.workhub";

const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const APPROVE_BTN =
  "inline-flex h-8 w-8 items-center justify-center rounded-md bg-green-50 text-green-900 ring-1 ring-green-200 transition-colors hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.97] motion-reduce:transition-none";
const REJECT_BTN =
  "inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-900 ring-1 ring-red-200 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.97] motion-reduce:transition-none";

/**
 * Apps — birleşik iş uygulamaları hub'ı: Onaylar · Vardiyalar · Formlar.
 * Aksiyon netliği: onayla/reddet etiketli renkli butonlar (yeşil/kırmızı),
 * açık vardiya dolu "Üstlen" butonu, anket seçenekleri yüzde + oyla. Renk tek
 * bilgi taşıyıcısı değildir; tonlu zeminde metin (*-900) AAA eşiğinin üstündedir.
 */
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
      <div className="card min-w-0 p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Icon name="clipboard" className="h-4 w-4" /> {t("apps.approvals")}
        </h3>
        <div className="mb-2 flex flex-wrap gap-2 text-sm">
          <Badge tone="warning">{t("apps.pending", { n: sum.pending })}</Badge>
          <Badge tone="positive">
            <Icon name="checkCircle" className="h-3.5 w-3.5 shrink-0" /> {sum.approved}
          </Badge>
          <Badge tone="danger">
            <Icon name="close" className="h-3.5 w-3.5 shrink-0" /> {sum.rejected}
          </Badge>
        </div>
        <div className="mb-2 flex h-9 items-center gap-1 rounded-lg border border-gray-300 bg-gray-50 pr-1 transition-[border-color,box-shadow] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 motion-reduce:transition-none">
          <input
            value={reqTitle}
            onChange={(e) => setReqTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitRequest();
            }}
            placeholder={t("apps.requestPh")}
            aria-label={t("apps.request")}
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-base text-gray-900 outline-none placeholder:text-gray-500 md:text-sm"
          />
          <button
            type="button"
            onClick={submitRequest}
            disabled={!reqTitle.trim()}
            aria-label={t("apps.request")}
            className="grid aspect-square h-7 shrink-0 place-items-center rounded-md bg-blue-700 text-white transition-[background-color,transform] duration-[140ms] ease-[var(--ease-out)] hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-50 motion-safe:active:scale-95 motion-reduce:transition-none"
          >
            <Icon name="plus" className="h-4 w-4" />
          </button>
        </div>
        <ul className="space-y-1.5">
          {approvals.map((a) => (
            <li key={a.id} className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm">
              <span className="min-w-0 flex-1 truncate text-ink">{a.title}</span>
              {a.status === "pending" ? (
                <div className="flex flex-none items-center gap-1.5">
                  <button
                    type="button"
                    className={APPROVE_BTN}
                    onClick={() => decideApproval(a.id, "approved")}
                    aria-label={t("apps.approve")}
                    title={t("apps.approve")}
                  >
                    <Icon name="checkCircle" className="h-4 w-4 shrink-0" />
                  </button>
                  <button
                    type="button"
                    className={REJECT_BTN}
                    onClick={() => decideApproval(a.id, "rejected")}
                    aria-label={t("apps.reject")}
                    title={t("apps.reject")}
                  >
                    <Icon name="close" className="h-4 w-4 shrink-0" />
                  </button>
                </div>
              ) : (
                <Badge tone={a.status === "approved" ? "positive" : "danger"} className="shrink-0">
                  {t(`apps.status.${a.status}`)}
                </Badge>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Shifts */}
      <div className="card min-w-0 p-4">
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
              <span className="w-8 flex-none text-muted">{days[sh.day]}</span>
              <span className="min-w-0 flex-1 truncate text-ink">
                <span className="tabular-nums">
                  {hhmm(sh.startMin)}–{hhmm(sh.endMin)}
                </span>{" "}
                · {sh.role}
              </span>
              {sh.open || sh.userId === "" ? (
                <button
                  type="button"
                  onClick={() => claimShift(sh.id)}
                  className="inline-flex h-8 flex-none items-center gap-1.5 rounded-lg bg-blue-800 px-3 text-xs font-medium text-white transition-transform motion-safe:active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none"
                >
                  <Icon name="handRaised" className="h-4 w-4 shrink-0" /> {t("apps.claim")}
                </button>
              ) : (
                <span className="flex-none text-muted">{sh.userName}</span>
              )}
            </li>
          ))}
        </ul>
        {open.length === 0 ? <p className="mt-1 text-sm text-muted">{t("apps.noOpenShifts")}</p> : null}
      </div>

      {/* Forms */}
      <div className="card min-w-0 p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Icon name="chartBar" className="h-4 w-4" /> {t("apps.forms")}
        </h3>
        {forms.map((f) => {
          const counts = tallyResponses(f, responses);
          const total = Object.values(counts).reduce((n, c) => n + c, 0) || 1;
          const top = Math.max(...f.options.map((o) => counts[o.id] ?? 0));
          return (
            <div key={f.id} className="space-y-1">
              <div className="text-sm text-ink">{f.question}</div>
              {f.options.map((o) => {
                const n = counts[o.id] ?? 0;
                const pct = Math.round((n / total) * 100);
                const lead = n > 0 && n === top;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => respondForm(f.id, o.id)}
                    className={
                      "block w-full rounded-md border px-3 py-1.5 text-left text-sm text-ink transition-colors motion-safe:active:scale-[0.99] motion-reduce:transition-none " +
                      (lead ? "border-blue-200 bg-blue-50 hover:bg-blue-100" : "border-line hover:bg-surface-2")
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span className={"flex-1 " + (lead ? "font-medium" : "")}>{o.text}</span>
                      <span className="tabular-nums text-muted">%{pct}</span>
                      <span className={"tabular-nums font-medium " + (lead ? "text-blue-900" : "text-ink")}>{n}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-surface-3" aria-hidden>
                      <div
                        className={"h-1.5 rounded-full transition-[width] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none " + (lead ? "bg-blue-700" : "bg-gray-400")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
