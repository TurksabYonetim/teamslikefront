import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { workspaceStore } from "../workspace.store";
import { MEMBER_NAMES } from "../workspace.data";
import { columnTotal, computeCell } from "../workspace.tables";
import { CalendarView } from "./CalendarView";
import { GanttView } from "./GanttView";
import { HillView } from "./HillView";
import type { ColumnType, TableColumn, TableRow } from "../workspace.types";

const NEW_COL_TYPES: ColumnType[] = ["text", "number", "date", "person"];
const MEMBERS = Object.entries(MEMBER_NAMES); // [id, name]
type View = "grid" | "calendar" | "gantt" | "hill";
const VIEWS: { id: View; icon: string }[] = [
  { id: "grid", icon: "grid" },
  { id: "calendar", icon: "calendar" },
  { id: "gantt", icon: "chartBar" },
  { id: "hill", icon: "chartBar" },
];

/**
 * İlişkisel tablo — canlı düzenlenebilir hücreler + eval'siz formül motoru ve
 * dört görünüm (Grid / Takvim / Gantt / Hill). Düzenlemeler store'a akar;
 * toplamlar ve formül sütunları anında yeniden hesaplanır.
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

  const inputBase =
    "h-9 w-full min-w-[6rem] rounded-md border border-line bg-surface px-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand";

  const cell = (row: TableRow, col: TableColumn) => {
    const v = row.cells[col.id] ?? "";
    const onChange = (val: string) => editCell(table.id, row.id, col.id, val);
    if (col.type === "formula") {
      return <span className="block px-2 text-sm text-muted">{computeCell(table, row, col)}</span>;
    }
    if (col.type === "select") {
      return (
        <select aria-label={col.name} value={v} onChange={(e) => onChange(e.target.value)} className={inputBase}>
          <option value="">—</option>
          {(col.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    }
    if (col.type === "person") {
      return (
        <select aria-label={col.name} value={v} onChange={(e) => onChange(e.target.value)} className={inputBase}>
          <option value="">—</option>
          {MEMBERS.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
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
    <div className="card p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-ink">{table.title}</h3>
        <div className="ml-auto inline-flex overflow-hidden rounded-lg border border-line" role="group" aria-label={t("table.view")}>
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              aria-pressed={view === v.id}
              className={
                "inline-flex h-9 items-center gap-1 px-3 text-sm transition-colors motion-reduce:transition-none " +
                (view === v.id ? "bg-brand text-white" : "bg-surface text-muted hover:bg-surface-2")
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
                        className="rounded text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
                      className="rounded p-1 text-muted transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none"
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                {table.columns.map((c) => (
                  <td key={c.id} className="px-2 pt-1 text-sm font-semibold text-ink">
                    {c.type === "number" || c.type === "formula" ? `Σ ${Math.round(columnTotal(table, c) * 100) / 100}` : ""}
                  </td>
                ))}
                <td aria-hidden />
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
          <select
            value={newColType}
            onChange={(e) => setNewColType(e.target.value as ColumnType)}
            aria-label={t("table.addColumn")}
            className="h-9 rounded-lg border border-line bg-surface px-2 text-sm text-ink"
          >
            {NEW_COL_TYPES.map((ty) => (
              <option key={ty} value={ty}>
                {ty}
              </option>
            ))}
          </select>
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
