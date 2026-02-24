
"use client";

import { useMemo } from "react";
import BaseChart from "./BaseChart";

export interface GaugeChartProps {
    value: number;
    target?: number;
    title: string;
    color?: string;
    height?: number;
}

export default function GaugeChart({
    value,
    target = 100,
    title,
    color = "#3b82f6",
    height = 200,
}: GaugeChartProps) {
    const option = useMemo(() => {
        const percentage = (value / target) * 100;

        return {
            series: [
                {
                    type: "gauge",
                    startAngle: 200,
                    endAngle: -20,
                    min: 0,
                    max: 100,
                    splitNumber: 10,
                    itemStyle: {
                        color: color,
                    },
                    progress: {
                        show: true,
                        width: 20,
                        itemStyle: {
                            color: {
                                type: "linear",
                                x: 0,
                                y: 0,
                                x2: 1,
                                y2: 0,
                                colorStops: [
                                    { offset: 0, color: color },
                                    { offset: 1, color: `${color}99` },
                                ],
                            },
                        },
                    },
                    pointer: {
                        show: false,
                    },
                    axisLine: {
                        lineStyle: {
                            width: 20,
                            color: [[1, "#e5e7eb"]],
                        },
                    },
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        show: false,
                    },
                    anchor: {
                        show: false,
                    },
                    title: {
                        show: true,
                        offsetCenter: [0, "70%"],
                        fontSize: 12,
                        color: "#6b7280",
                    },
                    detail: {
                        valueAnimation: true,
                        offsetCenter: [0, "0%"],
                        fontSize: 28,
                        fontWeight: "bold",
                        formatter: `{value}%`,
                        color: "#1f2937",
                    },
                    data: [
                        {
                            value: percentage.toFixed(1),
                            name: title,
                        },
                    ],
                },
            ],
        };
    }, [value, target, title, color]);

    return <BaseChart option={option} height={height} />;
}
