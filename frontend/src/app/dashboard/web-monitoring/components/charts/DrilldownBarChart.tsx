
"use client";

import { useMemo, useState } from "react";
import BaseChart from "./BaseChart";
import { Button, Chip, Spinner } from "@heroui/react";
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
    maxHeight?: number;
    onDrilldown?: (item: DrilldownData, level: number) => void;
    onDrilldownAsync?: (item: DrilldownData, level: number) => Promise<DrilldownData[] | undefined>;
    valueFormatter?: (value: number) => string;
    horizontal?: boolean;
}

const BAR_HEIGHT = 40;
const MIN_CHART_HEIGHT = 200;

export default function DrilldownBarChart({
    data,
    title,
    color = "#3b82f6",
    height = 350,
    maxHeight,
    onDrilldown,
    onDrilldownAsync,
    valueFormatter = (v) => v.toLocaleString("id-ID"),
    horizontal = false,
}: DrilldownBarChartProps) {
    const [drillLevel, setDrillLevel] = useState(0);
    const [drillPath, setDrillPath] = useState<DrilldownData[]>([]);
    const [currentData, setCurrentData] = useState<DrilldownData[]>(data);
    const [asyncLoading, setAsyncLoading] = useState(false);

    const handleDrilldown = async (params: unknown) => {
        const p = params as { dataIndex: number };
        const item = currentData[p.dataIndex];

        // If item has preloaded children, use them
        if (item.children && item.children.length > 0) {
            setDrillPath([...drillPath, item]);
            setCurrentData(item.children);
            setDrillLevel(drillLevel + 1);
            onDrilldown?.(item, drillLevel + 1);
            return;
        }

        // If async drilldown handler is provided, fetch children
        if (onDrilldownAsync) {
            setAsyncLoading(true);
            try {
                const children = await onDrilldownAsync(item, drillLevel + 1);
                if (children && children.length > 0) {
                    const enrichedItem = { ...item, children };
                    setDrillPath([...drillPath, enrichedItem]);
                    setCurrentData(children);
                    setDrillLevel(drillLevel + 1);
                }
            } finally {
                setAsyncLoading(false);
            }
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

    // Dynamic height: at least height, grow with items, cap at maxHeight
    const computedHeight = useMemo(() => {
        if (!horizontal) return height;
        const needed = Math.max(MIN_CHART_HEIGHT, currentData.length * BAR_HEIGHT + 60);
        return maxHeight ? Math.min(needed, maxHeight) : needed;
    }, [currentData.length, height, maxHeight, horizontal]);

    const needsScroll = maxHeight != null && horizontal && currentData.length * BAR_HEIGHT + 60 > maxHeight;

    // For scrollable: use full computed height inside a scrollable container
    const chartHeight = needsScroll
        ? Math.max(MIN_CHART_HEIGHT, currentData.length * BAR_HEIGHT + 60)
        : computedHeight;

    const option = useMemo(() => {
        const names = currentData.map((d) => d.name);
        const values = currentData.map((d) => d.value);
        const hasChildren = currentData.some((d) => d.children && d.children.length > 0);
        const isClickable = hasChildren || !!onDrilldownAsync;

        return {
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow",
                },
                formatter: (params: Array<{ name: string; value: number }>) => {
                    const item = params[0];
                    return `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
              <div style="color: ${color}; font-size: 18px; font-weight: 700;">
                ${valueFormatter(item.value)}
              </div>
              ${isClickable && drillLevel < 2 ? '<div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">Klik untuk detail</div>' : ''}
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
                    cursor: isClickable && drillLevel < 2 ? "pointer" : "default",
                },
            ],
            animationDuration: 800,
            animationEasing: "cubicOut",
        };
    }, [currentData, color, valueFormatter, horizontal, onDrilldownAsync, drillLevel]);

    const levelLabels = ["Universitas", "Fakultas", "Program Studi"];

    const chartContent = (
        <BaseChart
            option={option}
            height={chartHeight}
            onEvents={{
                click: handleDrilldown,
            }}
        />
    );

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

            {/* Chart - scrollable when many items */}
            {asyncLoading ? (
                <div className="flex items-center justify-center" style={{ height: computedHeight }}>
                    <Spinner label="Memuat data..." />
                </div>
            ) : needsScroll ? (
                <div className="overflow-y-auto" style={{ maxHeight: maxHeight }}>
                    {chartContent}
                </div>
            ) : (
                chartContent
            )}

            {/* Hint */}
            {drillLevel < 2 && (currentData.some((d) => d.children && d.children.length > 0) || onDrilldownAsync) && (
                <p className="text-xs text-center text-gray-400">
                    Klik bar untuk melihat detail level berikutnya
                </p>
            )}
        </div>
    );
}
