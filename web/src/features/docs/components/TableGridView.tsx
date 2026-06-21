import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Button, Select } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { workspaceStore } from "../workspace.store";
import { MEMBER_NAMES } from "../workspace.data";
import { columnTotal, computeCell } from "../workspace.tables";
import { CalendarView } from "./CalendarView";
import { GanttView } from "./GanttView";
import { HillView } from "./HillView";
import type { ColumnType, DataTable, TableColumn, TableRow } from "../workspace.types";

const NEW_COL_TYPES: ColumnType[] = ["text", "number", "date", "person"];
const MEMBERS = Object.entries(MEMBER_NAMES); // [id, name]
type View = "grid" | "calendar" | "gantt" | "hill";
const VIEWS: { id: View; icon: string }[] = [
  { id: "grid", icon: "grid" },
  { id: "calendar", icon: "calendar" },
  { id: "gantt", icon: "chartBar" },
  { id: "hill", icon: "chartBar" },
];

/** Sayısal/formül sütunlarının sütun-içi maksimumu (hücre-içi büyüklük çubuğu için). */
function numericMaxByColumn(table: DataTable): Record<string, number> {
  const max: Record<string, number> = {};
  for (const c of table.columns) {
    if (c.type !== "number" && c.type !== "formula") continue;
    max[c.id] = table.rows.reduce((m, r) => {
      const raw = c.type === "formula" ? computeCell(table, r, c) : r.cells[c.id] ?? "";
      const n = Number(raw);
      return Number.isFinite(n) && n > m ? n : m;
    }, 0);
  }
  return max;
}

/**
 * İlişkisel tablo — canlı düzenlenebilir hücreler + eval'siz formül motoru ve
 * dört görünüm (Grid / Takvim / Gantt / Hill). Düzenlemeler store'a akar;
 * toplamlar ve formül sütunları anında yeniden hesaplanır.
 *
 * Veri görseli: formül (Total) hücrelerinde, değerin sütun maksimumuna oranını
 * gösteren sönük bir büyüklük çubuğu metnin arkasında durur; toplam satırı
 * mavi üst çizgiyle vurgulanır. Çubuk yalnızca dekoratiftir (aria-hidden) ve
 * metin kontrastını AAA eşiğinin üstünde bırakır.
 */
export function TableGridView() {
  const { t } = useTranslation("docs");
  const tables = useStore(workspaceStore, (s) => s.tables);
  const activeTableId = useStore(workspaceStore, (s) => s.activeTableId);
  const { editCell, addTableRow, addTableColumn, deleteTableRow, deleteTableColumn } = workspaceStore.getState();
  const [view, setView] = useState<View>("grid");
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState<ColumnType>("text");

  const table = tables.find((tb) => tb.id === activeTableId) ?? tables[0];
  if (!table) return null;

  const inputBase = "input h-9 min-w-[6rem]";
  const colMax = numericMaxByColumn(table);

  const cell = (row: TableRow, col: TableColumn) => {
    const v = row.cells[col.id] ?? "";
    const onChange = (val: string) => editCell(table.id, row.id, col.id, val);
    if (col.type === "formula") {
      const out = computeCell(table, row, col);
      const num = Number(out);
      const max = colMax[col.id] ?? 0;
      const pct = max > 0 && Number.isFinite(num) ? Math.max(0, Math.min(100, (num / max) * 100)) : 0;
      return (
        <span className="relative block px-2 text-right text-sm tabular-nums text-ink">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-1 right-2 rounded bg-blue-100/60"
            style={{ width: `${pct}%` }}
          />
          <span className="relative">{out}</span>
        </span>
      );
    }
    if (col.type === "select") {
      return (
        <Select
          aria-label={col.name}
          value={v}
          onChange={onChange}
          options={[
            { value: "", label: "—" },
            ...(col.options ?? []).map((o) => ({ value: o, label: o })),
          ]}
          size="sm"
          className="min-w-[6rem]"
        />
      );
    }
    if (col.type === "person") {
      return (
        <Select
          aria-label={col.name}
          value={v}
          onChange={onChange}
          options={[
            { value: "", label: "—" },
            ...MEMBERS.map(([id, name]) => ({ value: id, label: name })),
          ]}
          size="sm"
          className="min-w-[6rem]"
        />
      );
    }
    return (
      <input
        aria-label={col.name}
        type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
        value={v}
        onChange={(e) => onChange(e.target.value)}
        className={inputBase}
      />
    );
  };

  return (
    <div className="card min-w-0 p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="min-w-0 break-words text-sm font-semibold text-ink">{table.title}</h3>
        <div className="ml-auto inline-flex max-w-full overflow-x-auto rounded-lg border border-line [scrollbar-width:none]" role="group" aria-label={t("table.view")}>
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              aria-pressed={view === v.id}
              className={
                "inline-flex h-9 flex-none items-center gap-1 whitespace-nowrap px-3 text-sm transition-colors motion-safe:active:scale-[0.97] motion-reduce:transition-none " +
                (view === v.id ? "bg-blue-800 text-white" : "bg-surface text-muted hover:bg-surface-2")
              }
            >
              <Icon name={v.icon} className="h-4 w-4" /> {t(`table.${v.id}`)}
            </button>
          ))}
        </div>
      </div>

      {view === "calendar" ? (
        <CalendarView table={table} />
      ) : view === "gantt" ? (
        <GanttView table={table} />
      ) : view === "hill" ? (
        <HillView table={table} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                {table.columns.map((c) => (
                  <th key={c.id} scope="col" className="border-b border-line px-2 pb-1 text-sm font-semibold text-muted">
                    <span className="inline-flex items-center gap-1">
                      {c.name}
                      {c.type === "formula" ? (
                        <span className="text-brand" aria-hidden>
                          ƒ
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => deleteTableColumn(table.id, c.id)}
                        aria-label={t("table.deleteColumn")}
                        className="rounded text-muted transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.97] motion-reduce:transition-none"
                      >
                        <Icon name="close" className="h-3 w-3" />
                      </button>
                    </span>
                  </th>
                ))}
                <th aria-hidden className="border-b border-line" />
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r) => (
                <tr key={r.id}>
                  {table.columns.map((c) => (
                    <td key={c.id} className="border-b border-line px-1 py-1 align-middle">
                      {cell(r, c)}
                    </td>
                  ))}
                  <td className="border-b border-line px-1">
                    <button
                      type="button"
                      onClick={() => deleteTableRow(table.id, r.id)}
                      aria-label={t("table.deleteRow")}
                      className="rounded p-1 text-muted transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-safe:active:scale-[0.97] motion-reduce:transition-none"
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                {table.columns.map((c) => {
                  const isNum = c.type === "number" || c.type === "formula";
                  return (
                    <td
                      key={c.id}
                      className={
                        "border-t-2 border-blue-700 px-2 pt-1.5 text-sm font-semibold text-ink " +
                        (isNum ? "text-right tabular-nums" : "")
                      }
                    >
                      {isNum ? `Σ ${Math.round(columnTotal(table, c) * 100) / 100}` : ""}
                    </td>
                  );
                })}
                <td aria-hidden className="border-t-2 border-blue-700" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => addTableRow(table.id)}>
          <Icon name="plus" className="h-4 w-4" /> {t("table.addRow")}
        </Button>
        <span className="inline-flex items-center gap-1">
          <input
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            placeholder={t("table.newColumn")}
            aria-label={t("table.newColumn")}
            className="input h-9 w-32"
          />
          <Select<ColumnType>
            value={newColType}
            onChange={setNewColType}
            aria-label={t("table.addColumn")}
            options={NEW_COL_TYPES.map((ty) => ({
              value: ty,
              label: ty,
            }))}
            size="sm"
            className="w-32"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              addTableColumn(table.id, newColName.trim() || t("table.newColumn"), newColType);
              setNewColName("");
            }}
          >
            <Icon name="plus" className="h-4 w-4" /> {t("table.addColumn")}
          </Button>
        </span>
      </div>
    </div>
  );
}
