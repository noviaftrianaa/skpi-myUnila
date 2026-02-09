"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@heroui/react";

// Dynamic import ECharts to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px]">
      <Spinner size="lg" />
    </div>
  ),
});

export interface BaseChartProps {
  option: object;
  height?: string | number;
  onEvents?: Record<string, (params: unknown) => void>;
  className?: string;
}

export default function BaseChart({
  option,
  height = 300,
  onEvents,
  className = "",
}: BaseChartProps) {
  return (
    <ReactECharts
      option={option}
      style={{ height, width: "100%" }}
      onEvents={onEvents}
      className={className}
      opts={{ renderer: "canvas" }}
    />
  );
}
