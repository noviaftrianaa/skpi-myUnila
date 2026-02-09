"use client";

import React, { useMemo } from "react";
import BaseChart from "./BaseChart";

export interface HeatmapChartProps {
    data: {
        x: string;
        y: string;
        value: number;
    }[];
    height?: number | string;
    minColor?: string;
    maxColor?: string;
    title?: string;
}

export default function HeatmapChart({
    data,
    height = 300,
    minColor = "#f0f9ff",
    maxColor = "#0369a1",
    title,
}: HeatmapChartProps) {
    const option = useMemo(() => {
        // Unique X and Y categories
        const xData = Array.from(new Set(data.map((d) => d.x)));
        const yData = Array.from(new Set(data.map((d) => d.y)));

        // Map data to [xIndex, yIndex, value] format
        const seriesData = data.map((d) => {
            const xIndex = xData.indexOf(d.x);
            const yIndex = yData.indexOf(d.y);
            return [xIndex, yIndex, d.value];
        });

        const maxValue = Math.max(...data.map(d => d.value));

        return {
            title: {
                text: title,
                left: 'center'
            },
            tooltip: {
                position: "top",
                formatter: (params: any) => {
                    return `${yData[params.value[1]]} - ${xData[params.value[0]]}: <b>${params.value[2]}</b>`;
                }
            },
            grid: {
                height: "70%",
                top: "10%",
                bottom: "15%",
            },
            xAxis: {
                type: "category",
                data: xData,
                splitArea: {
                    show: true,
                },
                axisLabel: {
                    rotate: 45,
                    interval: 0
                }
            },
            yAxis: {
                type: "category",
                data: yData,
                splitArea: {
                    show: true,
                },
            },
            visualMap: {
                min: 0,
                max: maxValue,
                calculable: true,
                orient: "horizontal",
                left: "center",
                bottom: "0%",
                inRange: {
                    color: [minColor, maxColor],
                },
            },
            series: [
                {
                    name: "Heatmap",
                    type: "heatmap",
                    data: seriesData,
                    label: {
                        show: true,
                    },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: "rgba(0, 0, 0, 0.5)",
                        },
                    },
                },
            ],
        };
    }, [data, height, minColor, maxColor, title]);

    return <BaseChart option={option} height={height} />;
}
