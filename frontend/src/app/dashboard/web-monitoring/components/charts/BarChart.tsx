
"use client";

import React, { useMemo } from "react";
import BaseChart from "./BaseChart";

export interface BarChartProps {
    data: {
        name: string;
        value: number | number[];
        category?: string; // For stacked or grouped
    }[];
    title?: string;
    horizontal?: boolean;
    stacked?: boolean;
    colors?: string[];
    height?: number | string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    showLegend?: boolean;
}

export default function BarChart({
    data,
    horizontal = false,
    stacked = false,
    colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
    height = 300,
    showLegend = true,
}: BarChartProps) {
    const option = useMemo(() => {
        // Extract categories (x-axis typically)
        const categories = Array.from(new Set(data.map((d) => d.name)));

        // For stacked/grouped, we might need series names
        const hasSeries = data.some(d => d.category);

        let series: unknown[] = [];
        const legendData: string[] = [];

        if (hasSeries) {
            // Group data by category (series name)
            const seriesMap = new Map<string, number[]>();
            const seriesNames = Array.from(new Set(data.map(d => d.category || 'Total')));

            seriesNames.forEach(seriesName => {
                const seriesData = categories.map(cat => {
                    const item = data.find(d => d.name === cat && d.category === seriesName);
                    return item ? (Array.isArray(item.value) ? item.value[0] : item.value) : 0;
                });
                seriesMap.set(seriesName, seriesData);
                legendData.push(seriesName);
            });

            series = seriesNames.map((name, index) => ({
                name,
                type: "bar",
                stack: stacked ? "total" : undefined,
                data: seriesMap.get(name),
                itemStyle: {
                    color: colors[index % colors.length],
                    borderRadius: stacked ? 0 : [4, 4, 0, 0],
                },
                label: {
                    show: false,
                },
                emphasis: {
                    focus: "series",
                },
            }));
        } else {
            // Single series
            series = [
                {
                    type: "bar",
                    data: categories.map(cat => {
                        const item = data.find(d => d.name === cat);
                        return item ? (Array.isArray(item.value) ? item.value[0] : item.value) : 0;
                    }),
                    itemStyle: {
                        color: colors[0],
                        borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
                    },
                    label: {
                        show: true,
                        position: horizontal ? "right" : "top",
                    },
                },
            ];
        }

        return {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow",
                },
            },
            legend: {
                show: showLegend && hasSeries,
                data: legendData,
                bottom: 0,
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: showLegend && hasSeries ? "10%" : "3%",
                containLabel: true,
            },
            xAxis: horizontal
                ? {
                    type: "value",
                    splitLine: { show: true, lineStyle: { type: "dashed", color: "#eee" } },
                }
                : {
                    type: "category",
                    data: categories,
                    axisTick: { alignWithLabel: true },
                    axisLabel: { interval: 0, rotate: categories.length > 5 ? 30 : 0 },
                },
            yAxis: horizontal
                ? {
                    type: "category",
                    data: categories,
                    axisTick: { alignWithLabel: true },
                }
                : {
                    type: "value",
                    splitLine: { show: true, lineStyle: { type: "dashed", color: "#eee" } },
                },
            series,
        };
    }, [data, horizontal, stacked, colors, showLegend]);

    return <BaseChart option={option} height={height} />;
}
