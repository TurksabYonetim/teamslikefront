import type { Call, CallLog } from "./phone.types";

/** Toplu çağrı-log metrikleri (Call-Quality-Dashboard analoğu). */
export interface CallStats {
  total: number;
  inbound: number;
  outbound: number;
  missed: number;
  missedRate: number; // 0..1
  avgHandleSec: number;
  recorded: number;
}

export function computeCallStats(calls: Call[]): CallStats {
  const total = calls.length;
  const inbound = calls.filter((c) => c.direction === "inbound").length;
  const outbound = calls.filter((c) => c.direction === "outbound").length;
  const missed = calls.filter((c) => c.endReason === "missed").length;
  const handled = calls.filter((c) => c.durationSec > 0);
  const avgHandleSec = handled.length
    ? Math.round(handled.reduce((sum, c) => sum + c.durationSec, 0) / handled.length)
    : 0;
  const recorded = calls.filter((c) => c.recordingId).length;
  return { total, inbound, outbound, missed, missedRate: total ? missed / total : 0, avgHandleSec, recorded };
}

export interface HourBucket {
  hour: number;
  count: number;
}

/** Çağrı hacmini 24 saatlik kovaya böl (yerel saat). */
export function volumeByHour(calls: Call[]): HourBucket[] {
  const buckets: HourBucket[] = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
  for (const c of calls) buckets[new Date(c.startedAt).getHours()].count += 1;
  return buckets;
}

/** Hibrit sınır adaptörü: gerçek /v1/call-logs kayıtlarını domain Call'a map'ler
 *  (analitik saf fonksiyonları Call[] üzerinde çalışır). "missed" bir inbound'dur;
 *  endReason "missed" olur. Call-log'da kayıt bilgisi yok → recordingId atanmaz. */
export function callLogsToCalls(logs: CallLog[]): Call[] {
  return logs.map((log) => {
    const outbound = log.direction === "outbound";
    return {
      id: log.id,
      lineId: "line_main",
      direction: outbound ? "outbound" : "inbound",
      from: outbound ? "" : log.peer_number,
      to: outbound ? log.peer_number : "",
      state: "ended",
      startedAt: new Date(log.started_at).getTime(),
      durationSec: log.duration_s,
      endReason: log.direction === "missed" ? "missed" : "completed",
    };
  });
}
