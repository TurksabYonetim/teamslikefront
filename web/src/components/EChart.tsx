import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { BarChart, PieChart, LineChart } from "echarts/charts";
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
  GraphicComponent,
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
  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height }}
      opts={{ renderer: "svg" }}
      notMerge
    />
  );
}
