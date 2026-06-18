import ReactEChartsCore from "echarts-for-react/lib/core";
import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, PieChart, LineChart } from "echarts/charts";
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
  GraphicComponent,
  MarkAreaComponent,
  MarkLineComponent,
  VisualMapComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";

// Yalnızca kullanılan ECharts modüllerini kaydet (tree-shaking → küçük bundle).
echarts.use([
  BarChart,
  PieChart,
  LineChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  GraphicComponent,
  MarkAreaComponent,
  MarkLineComponent,
  VisualMapComponent,
  SVGRenderer,
]);

export function EChart({
  option,
  height = 240,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  option: Record<string, any>;
  height?: number;
}) {
  const ref = useRef<ReactEChartsCore>(null);

  // Konteyner boyutu değişince (kolon genişliği, display:none → görünür) grafiği
  // yeniden boyutlandır. echarts-for-react yalnızca window resize'ı dinler; layout
  // kaynaklı değişimleri yakalamak için ResizeObserver gerekli.
  useEffect(() => {
    const inst = ref.current?.getEchartsInstance();
    if (!inst || typeof ResizeObserver === "undefined") return;
    const dom = inst.getDom();
    if (!dom) return;
    const ro = new ResizeObserver(() => inst.resize());
    ro.observe(dom);
    return () => ro.disconnect();
  }, []);

  return (
    <ReactEChartsCore
      ref={ref}
      echarts={echarts}
      option={option}
      style={{ height }}
      opts={{ renderer: "svg" }}
      notMerge
    />
  );
}
