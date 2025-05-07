// react-echarts.d.ts
declare module "react-echarts" {
  import { EChartsOption } from "echarts";
  import React from "react";

  interface ReactEChartsProps {
    option: EChartsOption; // Using EChartsOption from echarts package
    style?: React.CSSProperties;
    className?: string;
    opts?: object;
    // onChartReady?: (echartsInstance: any) => void; // you can refine this further if needed
  }

  const ReactECharts: React.FC<ReactEChartsProps>;

  export default ReactECharts;
}
