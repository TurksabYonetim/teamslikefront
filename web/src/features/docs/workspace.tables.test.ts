import { describe, expect, it } from "vitest";
import { columnTotal, computeCell, evalFormula, ganttBars, hillPoints } from "./workspace.tables";
import type { DataTable } from "./workspace.types";

describe("evalFormula", () => {
  const noRefs = () => 0;

  it("evaluates arithmetic with precedence and parentheses", () => {
    expect(evalFormula("2 + 3 * 4", noRefs)).toBe(14);
    expect(evalFormula("(2 + 3) * 4", noRefs)).toBe(20);
    expect(evalFormula("-5 + 2", noRefs)).toBe(-3);
  });

  it("resolves column-name references", () => {
    expect(evalFormula("Qty * Price", (n) => (n === "Qty" ? 3 : 10))).toBe(30);
  });

  it("throws on malformed input", () => {
    expect(() => evalFormula("2 +", noRefs)).toThrow();
    expect(() => evalFormula("2 2", noRefs)).toThrow();
  });
});

const table: DataTable = {
  id: "t",
  title: "T",
  columns: [
    { id: "c_item", name: "Item", type: "text" },
    { id: "c_qty", name: "Qty", type: "number" },
    { id: "c_price", name: "Price", type: "number" },
    { id: "c_total", name: "Total", type: "formula", formula: "Qty * Price" },
    { id: "c_status", name: "Status", type: "select", options: ["todo", "doing", "done"] },
    { id: "c_due", name: "Due", type: "date" },
  ],
  rows: [
    { id: "r1", cells: { c_item: "A", c_qty: "2", c_price: "5", c_status: "todo", c_due: "2026-06-10" } },
    { id: "r2", cells: { c_item: "B", c_qty: "3", c_price: "10", c_status: "done", c_due: "2026-06-20" } },
  ],
};

describe("computeCell", () => {
  it("computes formula columns", () => {
    expect(computeCell(table, table.rows[0], table.columns[3])).toBe("10");
    expect(computeCell(table, table.rows[1], table.columns[3])).toBe("30");
  });

  it("returns raw value for non-formula columns", () => {
    expect(computeCell(table, table.rows[0], table.columns[1])).toBe("2");
  });

  it("returns #ERR on a bad formula", () => {
    const bad: DataTable = {
      ...table,
      columns: [{ id: "c", name: "X", type: "formula", formula: "1 +" }],
      rows: [{ id: "r", cells: {} }],
    };
    expect(computeCell(bad, bad.rows[0], bad.columns[0])).toBe("#ERR");
  });
});

describe("columnTotal", () => {
  it("sums number and formula columns", () => {
    expect(columnTotal(table, table.columns[1])).toBe(5); // qty 2 + 3
    expect(columnTotal(table, table.columns[3])).toBe(40); // total 10 + 30
  });
});

describe("ganttBars", () => {
  it("positions rows by date fraction", () => {
    const bars = ganttBars(table);
    expect(bars).toHaveLength(2);
    expect(bars[0].startFrac).toBe(0); // earliest
    expect(bars[1].startFrac).toBe(1); // latest
    expect(bars[0].label).toBe("A");
  });

  it("returns empty when there is no date column", () => {
    expect(ganttBars({ ...table, columns: table.columns.filter((c) => c.type !== "date") })).toEqual([]);
  });
});

describe("hillPoints", () => {
  it("maps status to x and sin height", () => {
    const pts = hillPoints(table);
    expect(pts).toHaveLength(2);
    expect(pts[0].x).toBe(0.15); // todo
    expect(pts[1].x).toBe(0.85); // done
    expect(pts[0].y).toBeCloseTo(Math.sin(0.15 * Math.PI));
  });

  it("returns empty without a select column", () => {
    expect(hillPoints({ ...table, columns: table.columns.filter((c) => c.type !== "select") })).toEqual([]);
  });
});
