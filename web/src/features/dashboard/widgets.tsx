import clsx from "clsx";
import { EChart } from "@/components/EChart";
import { Icon } from "@/components/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Stat } from "./dashboard.mock";

const TINT: Record<Stat["tint"], string> = {
  blue: "bg-brand-soft text-brand dark:bg-brand/20 dark:text-brand-soft",
  green: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  yellow:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400",
};

export function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="card p-5 transition-shadow duration-[var(--dur-pop)] ease-[var(--ease-out)] hover:shadow-md dark:bg-surface dark:border-line">
      <div className="flex items-center justify-between">
        <span
          className={clsx(
            "w-11 h-11 rounded-lg grid place-items-center",
            TINT[stat.tint],
          )}
        >
          <Icon name={stat.icon} className="w-6 h-6" />
        </span>
        <span
          className={clsx(
            "inline-flex items-center gap-1 text-xs font-semibold",
            stat.up
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400",
          )}
        >
          {stat.delta}
        </span>
      </div>
      <div className="mt-3 text-3xl font-bold text-ink tracking-tight tabular-nums">
        {stat.value}
      </div>
      <div className="text-sm text-muted">{stat.label}</div>
    </div>
  );
}

/** İstatistik kartı yükleniyor iskeleti. */
export function StatCardSkeleton() {
  return (
    <div className="card p-5 dark:bg-surface dark:border-line">
      <div className="flex items-center justify-between">
        <Skeleton className="w-11 h-11 rounded-lg" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="mt-3 h-8 w-16" />
      <Skeleton className="mt-2 h-4 w-24" />
    </div>
  );
}

/** Grafik alanı için yer tutucu iskelet (verilen yüksekliğe yayılır). */
export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div
      className="flex items-end justify-between gap-2 px-1"
      style={{ height }}
      aria-hidden="true"
    >
      {[60, 80, 45, 95, 70, 35, 25].map((h, i) => (
        <div
          key={i}
          className="flex-1 animate-pulse rounded-t-md bg-surface-3"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

/** Haftalık gruplu bar grafiği (Apache ECharts). */
export function WeeklyBars({
  data,
  labels,
}: {
  data: { day: string; messages: number; meetings: number }[];
  labels: { messages: string; meetings: string };
}) {
  const option = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: {
      data: [labels.messages, labels.meetings],
      bottom: 0,
      icon: "roundRect",
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: "#6b7280", fontSize: 12 },
    },
    grid: { left: 4, right: 8, top: 12, bottom: 32, containLabel: true },
    xAxis: {
      type: "category",
      data: data.map((d) => d.day),
      axisLine: { lineStyle: { color: "#e5e7eb" } },
      axisTick: { show: false },
      axisLabel: { color: "#6b7280", fontSize: 12 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#f3f4f6" } },
      axisLabel: { color: "#9ca3af", fontSize: 11 },
    },
    series: [
      {
        name: labels.messages,
        type: "bar",
        data: data.map((d) => d.messages),
        barWidth: 10,
        itemStyle: { color: "#2563eb", borderRadius: [4, 4, 0, 0] },
      },
      {
        name: labels.meetings,
        type: "bar",
        data: data.map((d) => d.meetings),
        barWidth: 10,
        itemStyle: { color: "#93c5fd", borderRadius: [4, 4, 0, 0] },
      },
    ],
  };
  return <EChart option={option} height={240} />;
}

/** Görev ilerleme donut'u (Apache ECharts). */
export function Donut({
  done,
  total,
  labels,
}: {
  done: number;
  total: number;
  labels: { done: string; remaining: string; unit: string };
}) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const option = {
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["64%", "86%"],
        avoidLabelOverlap: false,
        silent: false,
        label: { show: false },
        labelLine: { show: false },
        data: [
          { value: done, name: labels.done, itemStyle: { color: "#2563eb" } },
          {
            value: total - done,
            name: labels.remaining,
            itemStyle: { color: "#e5e7eb" },
          },
        ],
      },
    ],
    graphic: [
      {
        type: "text",
        left: "center",
        top: "42%",
        style: {
          text: `${pct}%`,
          fontSize: 28,
          fontWeight: 700,
          fill: "#111827",
        },
      },
      {
        type: "text",
        left: "center",
        top: "58%",
        style: { text: labels.unit, fontSize: 12, fill: "#6b7280" },
      },
    ],
  };
  return <EChart option={option} height={200} />;
}

const PRESENCE: Record<string, string> = {
  available: "bg-green-500",
  busy: "bg-red-500",
  away: "bg-yellow-400",
  offline: "bg-gray-400",
};
export function PresenceDot({
  presence,
  label,
}: {
  presence: string;
  label?: string;
}) {
  return (
    <span
      className={clsx(
        "block w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-surface",
        PRESENCE[presence] ?? PRESENCE.offline,
      )}
      role="img"
      aria-label={label ?? presence}
    />
  );
}
