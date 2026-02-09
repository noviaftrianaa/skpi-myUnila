"use client";

import { useMemo } from "react";
import BaseChart from "./BaseChart";

export interface LineChartData {
  name: string;
  value: number;
}

export interface LineChartProps {
  data: LineChartData[];
  title?: string;
  color?: string;
  height?: number;
  showArea?: boolean;
  smooth?: boolean;
  valueFormatter?: (value: number) => string;
}

export default function LineChart({
  data,
  title,
  color = "#3b82f6",
  height = 300,
  showArea = true,
  smooth = true,
  valueFormatter = (v) => v.toLocaleString("id-ID"),
}: LineChartProps) {
  const option = useMemo(() => {
    const names = data.map((d) => d.name);
    const values = data.map((d) => d.value);

    return {
      tooltip: {
        trigger: "axis",
        formatter: (params: Array<{ name: string; value: number; dataIndex: number }>) => {
          const item = params[0];
          const prevValue = item.dataIndex > 0 ? values[item.dataIndex - 1] : null;
          const change = prevValue ? ((item.value - prevValue) / prevValue) * 100 : null;

          return `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
              <div style="color: ${color}; font-size: 20px; font-weight: 700;">
                ${valueFormatter(item.value)}
              </div>
              ${
                change !== null
                  ? `<div style="font-size: 12px; color: ${change >= 0 ? '#10b981' : '#ef4444'}; margin-top: 4px;">
                      ${change >= 0 ? '↑' : '↓'} ${Math.abs(change).toFixed(1)}% dari periode sebelumnya
                    </div>`
                  : ''
              }
            </div>
          `;
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "10%",
        top: title ? "15%" : "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: names,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: "#e5e7eb",
          },
        },
        axisLabel: {
          color: "#6b7280",
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (value: number) => valueFormatter(value),
          color: "#6b7280",
        },
        splitLine: {
          lineStyle: {
            color: "#f3f4f6",
          },
        },
      },
      series: [
        {
          name: title || "Data",
          type: "line",
          data: values,
          smooth: smooth ? 0.4 : false,
          symbol: "circle",
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: color,
            shadowColor: `${color}40`,
            shadowBlur: 10,
            shadowOffsetY: 5,
          },
          itemStyle: {
            color: color,
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
                    { offset: 0, color: `${color}40` },
                    { offset: 1, color: `${color}05` },
                  ],
                },
              }
            : undefined,
          emphasis: {
            scale: true,
            itemStyle: {
              shadowBlur: 10,
              shadowColor: `${color}60`,
            },
          },
          label: {
            show: true,
            position: "top",
            formatter: (params: { value: number }) => valueFormatter(params.value),
            fontSize: 10,
            color: "#374151",
          },
        },
      ],
      animationDuration: 1500,
      animationEasing: "cubicInOut",
    };
  }, [data, title, color, showArea, smooth, valueFormatter]);

  return <BaseChart option={option} height={height} />;
}
