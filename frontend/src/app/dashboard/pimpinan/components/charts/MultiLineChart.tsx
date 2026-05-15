"use client";

import { useMemo } from "react";
import BaseChart from "./BaseChart";

export interface MultiLineSeries {
  name: string;
  data: number[];
  color: string;
}

export interface MultiLineChartProps {
  categories: string[];           // x-axis labels (e.g., years)
  series: MultiLineSeries[];      // each line
  height?: number;
  showArea?: boolean;
  smooth?: boolean;
  logScale?: boolean;
  valueFormatter?: (value: number) => string;
}

/**
 * Multi-line chart untuk Trend Y-over-Y.
 * Render N seri pada satu canvas dgn legend interaktif + tooltip per X.
 */
export default function MultiLineChart({
  categories,
  series,
  height = 320,
  showArea = false,
  smooth = true,
  logScale = false,
  valueFormatter = (v) => v.toLocaleString("id-ID"),
}: MultiLineChartProps) {
  const option = useMemo(() => {
    const seriesOption = series.map((s) => ({
      name: s.name,
      type: "line" as const,
      data: s.data,
      smooth: smooth ? 0.4 : false,
      symbol: "circle",
      symbolSize: 8,
      lineStyle: {
        width: 2.5,
        color: s.color,
      },
      itemStyle: {
        color: s.color,
        borderWidth: 2,
        borderColor: "#fff",
      },
      areaStyle: showArea
        ? {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${s.color}33` },
                { offset: 1, color: `${s.color}05` },
              ],
            },
          }
        : undefined,
      emphasis: {
        focus: "series",
        scale: true,
      },
    }));

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross", crossStyle: { color: "#9ca3af" } },
        formatter: (params: Array<{ seriesName: string; value: number; color: string; axisValue: string }>) => {
          if (!params || params.length === 0) return "";
          let html = `<div style="padding:6px 4px;">
            <div style="font-weight:600;margin-bottom:6px;font-size:12px;">${params[0].axisValue}</div>`;
          params.forEach((p) => {
            html += `<div style="display:flex;align-items:center;gap:6px;font-size:12px;margin:2px 0;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};"></span>
              <span style="color:#6b7280;">${p.seriesName}:</span>
              <span style="font-weight:600;color:#111827;">${valueFormatter(p.value)}</span>
            </div>`;
          });
          html += "</div>";
          return html;
        },
      },
      legend: {
        data: series.map((s) => s.name),
        top: 0,
        textStyle: { color: "#6b7280", fontSize: 12 },
        icon: "circle",
        itemWidth: 10,
        itemHeight: 10,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "8%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: categories,
        boundaryGap: false,
        axisLine: { lineStyle: { color: "#e5e7eb" } },
        axisLabel: { color: "#6b7280" },
      },
      yAxis: {
        type: logScale ? ("log" as const) : ("value" as const),
        axisLabel: {
          formatter: (value: number) => valueFormatter(value),
          color: "#6b7280",
        },
        splitLine: { lineStyle: { color: "#f3f4f6" } },
      },
      series: seriesOption,
      animationDuration: 1200,
      animationEasing: "cubicInOut",
    };
  }, [categories, series, showArea, smooth, logScale, valueFormatter]);

  return <BaseChart option={option} height={height} />;
}
