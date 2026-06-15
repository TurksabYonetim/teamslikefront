/** Admin genel bakış grafikleri (Apache ECharts) — tümü client-side türevden. */
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { EChart } from "@/components/EChart";
import { EmptyState } from "@/components/ui";
import { Icon } from "@/components/Icon";
import type { AuditLog } from "./admin.types";
import { countByAction, countByDay, shortDayLabel } from "./admin.utils";

/* Dashboard widget'larıyla aynı palet (tutarlı görünüm). */
const PALETTE = ["#2563eb", "#7c3aed", "#0891b2", "#16a34a", "#d97706", "#dc2626"];
const AXIS = "#9ca3af";
const SPLIT = "#f3f4f6";

/** Aksiyona göre denetim kaydı dağılımı — yatay bar. */
export function ActionBarChart({ logs }: { logs: AuditLog[] }) {
  const { t } = useTranslation("admin");
  const data = useMemo(() => countByAction(logs).slice(0, 8), [logs]);

  if (data.length === 0) {
    return (
      <EmptyState
        title={t("audit.emptyTitle")}
        icon={<Icon name="info" className="w-6 h-6" />}
        className="py-6"
      />
    );
  }

  // ECharts category ekseni alttan üste çizer; en büyük üstte olsun diye ters.
  const ordered = [...data].reverse();
  const option = {
    grid: { left: 8, right: 16, top: 8, bottom: 8, containLabel: true },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: {
      type: "value",
      splitLine: { lineStyle: { color: SPLIT } },
      axisLabel: { color: AXIS, fontSize: 12 },
    },
    yAxis: {
      type: "category",
      data: ordered.map((d) => d.action),
      axisLine: { lineStyle: { color: "#e5e7eb" } },
      axisLabel: { color: "#6b7280", fontSize: 12 },
    },
    series: [
      {
        type: "bar",
        data: ordered.map((d) => d.count),
        itemStyle: { color: "#2563eb", borderRadius: [0, 4, 4, 0] },
        barWidth: "60%",
      },
    ],
  };

  return <EChart option={option} height={Math.max(200, ordered.length * 34)} />;
}

/** Aksiyona göre pay — pie/donut. */
export function ActionPieChart({ logs }: { logs: AuditLog[] }) {
  const { t } = useTranslation("admin");
  const data = useMemo(() => {
    const all = countByAction(logs);
    const top = all.slice(0, 5);
    const rest = all.slice(5).reduce((s, d) => s + d.count, 0);
    const items = top.map((d) => ({ name: d.action, value: d.count }));
    if (rest > 0) items.push({ name: t("overview.otherActions"), value: rest });
    return items;
  }, [logs, t]);

  if (data.length === 0) {
    return (
      <EmptyState
        title={t("audit.emptyTitle")}
        icon={<Icon name="info" className="w-6 h-6" />}
        className="py-6"
      />
    );
  }

  const option = {
    color: PALETTE,
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: {
      orient: "vertical",
      right: 0,
      top: "center",
      textStyle: { color: "#6b7280", fontSize: 12 },
      icon: "circle",
    },
    series: [
      {
        type: "pie",
        radius: ["48%", "72%"],
        center: ["32%", "50%"],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        data,
      },
    ],
  };

  return <EChart option={option} height={220} />;
}

/** Son 14 günde olay sayısı — çizgi/alan. */
export function EventsOverTimeChart({ logs }: { logs: AuditLog[] }) {
  const { t } = useTranslation("admin");
  const data = useMemo(() => countByDay(logs, 14), [logs]);
  const hasAny = data.some((d) => d.count > 0);

  if (!hasAny) {
    return (
      <EmptyState
        title={t("overview.noTimeline")}
        icon={<Icon name="clock" className="w-6 h-6" />}
        className="py-6"
      />
    );
  }

  const option = {
    grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data.map((d) => shortDayLabel(d.date)),
      axisLine: { lineStyle: { color: "#e5e7eb" } },
      axisLabel: { color: AXIS, fontSize: 12 },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      splitLine: { lineStyle: { color: SPLIT } },
      axisLabel: { color: AXIS, fontSize: 12 },
    },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        data: data.map((d) => d.count),
        lineStyle: { color: "#2563eb", width: 2 },
        itemStyle: { color: "#2563eb" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(37,99,235,0.18)" },
              { offset: 1, color: "rgba(37,99,235,0)" },
            ],
          },
        },
      },
    ],
  };

  return <EChart option={option} height={240} />;
}
