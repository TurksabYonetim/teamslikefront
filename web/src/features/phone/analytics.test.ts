import { describe, it, expect } from "vitest";
import { computeCallStats, volumeByHour, callLogsToCalls } from "./analytics";
import type { Call, CallLog } from "./phone.types";

const at = (h: number) => new Date(2026, 5, 9, h, 0, 0).getTime();

const calls: Call[] = [
  { id: "c1", lineId: "l1", direction: "inbound", from: "+1", to: "+2", state: "ended", startedAt: at(9), durationSec: 120, endReason: "completed", recordingId: "r1" },
  { id: "c2", lineId: "l1", direction: "outbound", from: "+2", to: "+1", state: "ended", startedAt: at(9), durationSec: 60, endReason: "completed" },
  { id: "c3", lineId: "l1", direction: "inbound", from: "+3", to: "+2", state: "ended", startedAt: at(14), durationSec: 0, endReason: "missed" },
];

describe("computeCallStats", () => {
  it("aggregates direction, missed rate and average handle time", () => {
    const s = computeCallStats(calls);
    expect(s.total).toBe(3);
    expect(s.inbound).toBe(2);
    expect(s.outbound).toBe(1);
    expect(s.missed).toBe(1);
    expect(s.missedRate).toBeCloseTo(1 / 3, 5);
    expect(s.avgHandleSec).toBe(90); // (120+60)/2 handled
    expect(s.recorded).toBe(1);
  });
  it("returns zeros for an empty set", () => {
    expect(computeCallStats([])).toMatchObject({ total: 0, missedRate: 0, avgHandleSec: 0 });
  });
});

describe("volumeByHour", () => {
  it("buckets calls into 24 hourly slots", () => {
    const v = volumeByHour(calls);
    expect(v).toHaveLength(24);
    expect(v[9].count).toBe(2);
    expect(v[14].count).toBe(1);
    expect(v[0].count).toBe(0);
  });
  it("counts a late-night call in the hour-23 bucket", () => {
    const late = volumeByHour([
      { id: "cn", lineId: "l1", direction: "inbound", from: "+1", to: "+2", state: "ended", startedAt: at(23), durationSec: 30, endReason: "completed" },
    ]);
    expect(late[23].count).toBe(1);
    expect(late[22].count).toBe(0);
  });
});

describe("callLogsToCalls (hibrit adaptör)", () => {
  const logs: CallLog[] = [
    { id: "l1", direction: "inbound", peer_number: "+14155551111", peer_name: null, duration_s: 60, started_at: "2026-06-01T09:30:00Z", created_at: "2026-06-01T09:30:00Z" },
    { id: "l2", direction: "outbound", peer_number: "+14155552222", peer_name: "Ada", duration_s: 120, started_at: "2026-06-01T10:00:00Z", created_at: "2026-06-01T10:00:00Z" },
    { id: "l3", direction: "missed", peer_number: "+14155553333", peer_name: null, duration_s: 0, started_at: "2026-06-01T11:00:00Z", created_at: "2026-06-01T11:00:00Z" },
  ];

  it("CallLog yönünü Call dom'ına map'ler (missed → inbound + endReason missed)", () => {
    const calls = callLogsToCalls(logs);
    expect(calls[0].direction).toBe("inbound");
    expect(calls[1].direction).toBe("outbound");
    expect(calls[2].direction).toBe("inbound");
    expect(calls[2].endReason).toBe("missed");
    expect(calls[0].endReason).toBe("completed");
  });

  it("startedAt'i epoch ms'e çevirir, durationSec'i taşır", () => {
    const calls = callLogsToCalls(logs);
    expect(typeof calls[0].startedAt).toBe("number");
    expect(calls[1].durationSec).toBe(120);
  });

  it("computeCallStats ile uçtan uca tutarlı", () => {
    const stats = computeCallStats(callLogsToCalls(logs));
    expect(stats.total).toBe(3);
    expect(stats.inbound).toBe(2);
    expect(stats.outbound).toBe(1);
    expect(stats.missed).toBe(1);
  });
});
