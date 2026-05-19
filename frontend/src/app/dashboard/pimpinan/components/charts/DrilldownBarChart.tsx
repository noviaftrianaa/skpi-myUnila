"use client";

import { useMemo, useState } from "react";
import BaseChart from "./BaseChart";
import { Button, Chip } from "@heroui/react";
import { FiArrowLeft } from "react-icons/fi";

export interface DrilldownData {
  id: string;
  name: string;
  value: number;
  children?: DrilldownData[];
}

export interface DrilldownBarChartProps {
  data: DrilldownData[];
  title: string;
  color?: string;
  height?: number;
  onDrilldown?: (item: DrilldownData, level: number) => void;
  valueFormatter?: (value: number) => string;
  horizontal?: boolean;
}

export default function DrilldownBarChart({
  data,
  title,
  color = "#3b82f6",
  height = 350,
  onDrilldown,
  valueFormatter = (v) => v.toLocaleString("id-ID"),
  horizontal = false,
}: DrilldownBarChartProps) {
  const [drillLevel, setDrillLevel] = useState(0);
  const [drillPath, setDrillPath] = useState<DrilldownData[]>([]);
  const [currentData, setCurrentData] = useState<DrilldownData[]>(data);

  const handleDrilldown = (params: { dataIndex: number }) => {
    const item = currentData[params.dataIndex];
    if (item.children && item.children.length > 0) {
      setDrillPath([...drillPath, item]);
      setCurrentData(item.children);
      setDrillLevel(drillLevel + 1);
      onDrilldown?.(item, drillLevel + 1);
    }
  };

  const handleDrillUp = () => {
    if (drillLevel > 0) {
      const newPath = [...drillPath];
      newPath.pop();
      setDrillPath(newPath);

      if (newPath.length === 0) {
        setCurrentData(data);
      } else {
        setCurrentData(newPath[newPath.length - 1].children || data);
      }
      setDrillLevel(drillLevel - 1);
    }
  };

  // Auto switch ke horizontal kalau label kebanyakan (label panjang vertical numpuk).
  // 12+ kategori atau prodi-level drill → horizontal lebih readable.
  const effectiveHorizontal = horizontal || currentData.length > 12;

  const option = useMemo(() => {
    const names = currentData.map((d) => d.name);
    const values = currentData.map((d) => d.value);
    const hasChildren = currentData.some((d) => d.children && d.children.length > 0);
    const count = names.length;

    // Adaptive label: kalau banyak kategori, kurangi density labels.
    const labelInterval = count <= 8 ? 0 : Math.ceil(count / 10);
    // Adaptive height utk horizontal: setiap row ~28px supaya tidak numpuk.
    const adaptiveHeight = effectiveHorizontal ? Math.max(height, count * 28 + 40) : height;
    // Truncate name jadi 18 char + ellipsis (chart label vertical) supaya tidak overlap.
    const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

    return {
      __computedHeight: adaptiveHeight,
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: (params: Array<{ name: string; value: number }>) => {
          const item = params[0];
          const dataItem = currentData.find((d) => d.name === item.name);
          const hasChild = dataItem?.children && dataItem.children.length > 0;
          return `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
              <div style="color: ${color}; font-size: 18px; font-weight: 700;">
                ${valueFormatter(item.value)}
              </div>
              ${hasChild ? '<div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">Klik untuk detail</div>' : ''}
            </div>
          `;
        },
      },
      grid: {
        left: effectiveHorizontal ? 140 : 50,
        right: 30,
        bottom: effectiveHorizontal ? 24 : 70,
        top: 24,
        containLabel: true,
      },
      xAxis: effectiveHorizontal
        ? {
            type: "value",
            axisLabel: {
              formatter: (value: number) => valueFormatter(value),
              fontSize: 11,
            },
          }
        : {
            type: "category",
            data: names,
            axisLabel: {
              rotate: count > 6 ? 35 : 0,
              interval: labelInterval,
              fontSize: 11,
              formatter: (val: string) => truncate(val, 18),
            },
          },
      yAxis: effectiveHorizontal
        ? {
            type: "category",
            data: names,
            axisLabel: {
              fontSize: 11,
              formatter: (val: string) => truncate(val, 26),
            },
          }
        : {
            type: "value",
            axisLabel: {
              formatter: (value: number) => valueFormatter(value),
            },
          },
      series: [
        {
          type: "bar",
          data: values,
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: effectiveHorizontal ? 0 : 1,
              x2: effectiveHorizontal ? 1 : 0,
              y2: 0,
              colorStops: [
                { offset: 0, color: `${color}` },
                { offset: 1, color: `${color}99` },
              ],
            },
            borderRadius: effectiveHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: `${color}40`,
            },
          },
          label: {
            show: count <= 20,
            position: effectiveHorizontal ? "right" : "top",
            formatter: (params: { value: number }) => valueFormatter(params.value),
            fontSize: 10,
            color: "#374151",
          },
          cursor: hasChildren ? "pointer" : "default",
        },
      ],
      animationDuration: 800,
      animationEasing: "cubicOut",
    };
  }, [currentData, color, valueFormatter, effectiveHorizontal, height]);

  const chartHeight = (option as { __computedHeight?: number }).__computedHeight ?? height;

  const levelLabels = ["Universitas", "Fakultas", "Program Studi"];

  return (
    <div className="space-y-3">
      {/* Breadcrumb & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {drillLevel > 0 && (
            <Button
              size="sm"
              variant="flat"
              color="primary"
              startContent={<FiArrowLeft className="w-4 h-4" />}
              onPress={handleDrillUp}
            >
              Kembali
            </Button>
          )}
          <div className="flex items-center gap-1">
            {drillPath.map((item, index) => (
              <div key={item.id} className="flex items-center">
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
        <Chip size="sm" variant="flat" color="default">
          Level: {levelLabels[drillLevel] || `Level ${drillLevel}`}
        </Chip>
      </div>

      {/* Chart */}
      <BaseChart
        option={option}
        height={chartHeight}
        onEvents={{
          click: handleDrilldown,
        }}
      />

      {/* Hint */}
      {currentData.some((d) => d.children && d.children.length > 0) && (
        <p className="text-xs text-center text-gray-400">
          Klik bar untuk melihat detail level berikutnya
        </p>
      )}
    </div>
  );
}
