import { describe, it, expect } from "vitest";
import { requiredAgents, staffingGap, adherence, scorecardTotal, understaffed, serviceLevel } from "./wfo.dom";
import type { ScorecardCriterion, StaffingInterval } from "./support.types";

describe("requiredAgents", () => {
  it("hacim/AHT/aralık/dolulukla hesaplar", () => {
    // 30 iletişim × 240sn ÷ (1800sn × 0.85) = 7200/1530 = 4.7 → ceil 5
    expect(requiredAgents(30, 240, 1800, 0.85)).toBe(5);
  });
  it("sıfır/negatif girişte 0", () => {
    expect(requiredAgents(0, 240, 1800)).toBe(0);
    expect(requiredAgents(10, 240, 0)).toBe(0);
  });
});

describe("staffingGap", () => {
  it("vardiyadaki − gereken", () => {
    expect(staffingGap({ id: "i", label: "09", forecastVolume: 0, required: 5, scheduled: 3 })).toBe(-2);
    expect(staffingGap({ id: "i", label: "09", forecastVolume: 0, required: 3, scheduled: 5 })).toBe(2);
  });
});

describe("adherence", () => {
  it("oranı 0..1 verir, üst sınırlar", () => {
    expect(adherence(480, 462)).toBeCloseTo(0.9625, 4);
    expect(adherence(480, 999)).toBe(1);
    expect(adherence(0, 100)).toBe(0);
  });
});

describe("scorecardTotal", () => {
  const criteria: ScorecardCriterion[] = [
    { id: "a", label: "A", weight: 1 },
    { id: "b", label: "B", weight: 3 },
  ];
  it("ağırlıklı toplamı 0..100'e normalize eder", () => {
    // a=5/5*1 + b=4/5*3 = 1 + 2.4 = 3.4 ; /4 = 0.85 → 85
    expect(scorecardTotal({ a: 5, b: 4 }, criteria)).toBe(85);
  });
  it("tam puan 100", () => {
    expect(scorecardTotal({ a: 5, b: 5 }, criteria)).toBe(100);
  });
  it("kriter yoksa 0", () => {
    expect(scorecardTotal({}, [])).toBe(0);
  });
});

const intervals: StaffingInterval[] = [
  { id: "i1", label: "09", forecastVolume: 0, required: 4, scheduled: 3 },
  { id: "i2", label: "10", forecastVolume: 0, required: 2, scheduled: 4 },
  { id: "i3", label: "11", forecastVolume: 0, required: 5, scheduled: 2 },
];

describe("understaffed", () => {
  it("açık olan aralıkları döner", () => {
    expect(understaffed(intervals).map((i) => i.id)).toEqual(["i1", "i3"]);
  });
});

describe("serviceLevel", () => {
  it("ortalama planlı/gereken oranı (üst sınır 1)", () => {
    // 3/4=0.75, min(1,4/2)=1, 2/5=0.4 → (0.75+1+0.4)/3 = 0.7167 → 0.72
    expect(serviceLevel(intervals)).toBe(0.72);
  });
  it("boş listede 0", () => {
    expect(serviceLevel([])).toBe(0);
  });
});
