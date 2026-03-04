
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

    const handleDrilldown = (params: unknown) => {
        const p = params as { dataIndex: number };
        const item = currentData[p.dataIndex];
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

    const option = useMemo(() => {
        const names = currentData.map((d) => d.name);
        const values = currentData.map((d) => d.value);
        const hasChildren = currentData.some((d) => d.children && d.children.length > 0);

        return {
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
                left: horizontal ? "25%" : "3%",
                right: "4%",
                bottom: horizontal ? "3%" : "15%",
                top: "10%",
                containLabel: true,
            },
            xAxis: horizontal
                ? {
                    type: "value",
                    axisLabel: {
                        formatter: (value: number) => valueFormatter(value),
                    },
                }
                : {
                    type: "category",
                    data: names,
                    axisLabel: {
                        rotate: 45,
                        interval: 0,
                        fontSize: 11,
                    },
                },
            yAxis: horizontal
                ? {
                    type: "category",
                    data: names,
                    axisLabel: {
                        fontSize: 11,
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
                            x: horizontal ? 0 : 0,
                            y: horizontal ? 0 : 1,
                            x2: horizontal ? 1 : 0,
                            y2: horizontal ? 0 : 0,
                            colorStops: [
                                { offset: 0, color: `${color}` },
                                { offset: 1, color: `${color}99` },
                            ],
                        },
                        borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: `${color}40`,
                        },
                    },
                    label: {
                        show: true,
                        position: horizontal ? "right" : "top",
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
    }, [currentData, color, valueFormatter, horizontal]);

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
                        {drillPath.map((item) => (
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
                height={height}
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
