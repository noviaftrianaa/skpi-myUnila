"use client";

import { useEffect, useMemo, useState } from "react";
import BaseChart from "./BaseChart";

export interface PieChartData {
  name: string;
  value: number;
}

export interface PieChartProps {
  data: PieChartData[];
  title?: string;
  height?: number;
  donut?: boolean;
  showLegend?: boolean;
  colors?: string[];
  valueFormatter?: (value: number) => string;
}

const DEFAULT_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#6366f1",
  "#84cc16",
  "#f97316",
];

export default function PieChart({
  data,
  title,
  height = 300,
  donut = false,
  showLegend = true,
  colors = DEFAULT_COLORS,
  valueFormatter = (v) => v.toLocaleString("id-ID"),
}: PieChartProps) {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  // Responsive legend position: di bawah pie kalau viewport sempit (<768px),
  // di kanan kalau lebar. Hindari numpuk di mobile/tablet.
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 900px)");
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const option = useMemo(() => {
    const legendBottom = showLegend && isNarrow;
    return {
      tooltip: {
        trigger: "item",
        formatter: (params: { name: string; value: number; percent: number }) => {
          return `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
              <div style="font-size: 18px; font-weight: 700; color: #1f2937;">
                ${valueFormatter(params.value)}
              </div>
              <div style="font-size: 12px; color: #6b7280;">
                ${params.percent.toFixed(1)}% dari total
              </div>
            </div>
          `;
        },
      },
      legend: showLegend
        ? legendBottom
          ? {
              type: "scroll",
              orient: "horizontal",
              bottom: 0,
              left: "center",
              itemGap: 8,
              itemWidth: 10,
              itemHeight: 10,
              textStyle: { fontSize: 11, color: "#374151" },
              formatter: (name: string) => {
                const item = data.find((d) => d.name === name);
                if (item) {
                  const percent = ((item.value / total) * 100).toFixed(1);
                  return `${name} ${percent}%`;
                }
                return name;
              },
            }
          : {
              type: "scroll",
              orient: "vertical",
              right: "2%",
              top: "middle",
              itemGap: 10,
              itemWidth: 12,
              itemHeight: 12,
              textStyle: { fontSize: 12, color: "#374151" },
              formatter: (name: string) => {
                const item = data.find((d) => d.name === name);
                if (item) {
                  const percent = ((item.value / total) * 100).toFixed(1);
                  return `${name} (${percent}%)`;
                }
                return name;
              },
            }
        : undefined,
      series: [
        {
          name: title || "Data",
          type: "pie",
          radius: donut ? ["45%", "70%"] : ["0%", "70%"],
          center: showLegend
            ? legendBottom
              ? ["50%", "42%"]
              : ["38%", "50%"]
            : ["50%", "50%"],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: !showLegend,
            formatter: "{b}: {d}%",
            fontSize: 11,
          },
          labelLine: {
            show: !showLegend,
            length: 10,
            length2: 10,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.3)",
            },
          },
          data: data.map((d, index) => ({
            ...d,
            itemStyle: {
              color: colors[index % colors.length],
            },
          })),
        },
      ],
      animationDuration: 1000,
      animationEasing: "cubicOut",
    };
  }, [data, title, donut, showLegend, colors, total, valueFormatter, isNarrow]);

  return <BaseChart option={option} height={height} />;
}
