"use client";

import React, { useMemo } from "react";
import BaseChart from "./BaseChart";

export interface PyramidChartProps {
    data: {
        ageGroup: string;
        male: number;
        female: number;
    }[];
    height?: number | string;
    colors?: [string, string]; // [Male Color, Female Color]
}

export default function PyramidChart({
    data,
    height = 400,
    colors = ["#3b82f6", "#ec4899"],
}: PyramidChartProps) {
    const option = useMemo(() => {
        return {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow",
                },
                formatter: (params: any) => {
                    let tooltip = `<div>${params[0].name}</div>`;
                    params.forEach((param: any) => {
                        const value = Math.abs(param.value);
                        tooltip += `
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="width:10px; height:10px; border-radius:50%; background-color:${param.color};"></span>
                <span>${param.seriesName}: <b>${value}</b></span>
              </div>
            `;
                    });
                    return tooltip;
                },
            },
            legend: {
                data: ["Laki-laki", "Perempuan"],
                bottom: 0,
            },
            grid: {
                left: "3%",
                right: "4%",
                bottom: "10%",
                containLabel: true,
            },
            xAxis: {
                type: "value",
                axisLabel: {
                    formatter: (value: number) => Math.abs(value),
                },
            },
            yAxis: {
                type: "category",
                axisTick: { show: false },
                data: data.map((d) => d.ageGroup),
            },
            series: [
                {
                    name: "Laki-laki",
                    type: "bar",
                    stack: "total",
                    label: {
                        show: false,
                    },
                    emphasis: {
                        focus: "series",
                    },
                    data: data.map((d) => -d.male), // Negative values for left side
                    itemStyle: {
                        color: colors[0],
                        borderRadius: [4, 0, 0, 4],
                    },
                },
                {
                    name: "Perempuan",
                    type: "bar",
                    stack: "total",
                    label: {
                        show: false,
                    },
                    emphasis: {
                        focus: "series",
                    },
                    data: data.map((d) => d.female),
                    itemStyle: {
                        color: colors[1],
                        borderRadius: [0, 4, 4, 0],
                    },
                },
            ],
        };
    }, [data, colors]);

    return <BaseChart option={option} height={height} />;
}
