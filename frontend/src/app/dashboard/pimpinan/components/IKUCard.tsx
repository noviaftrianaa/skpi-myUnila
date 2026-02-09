"use client";

import React from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { FiArrowRight, FiMoreHorizontal } from "react-icons/fi";
import { GaugeChart } from "./charts";

export interface IKUCardProps {
    id: number;
    code: string;
    title: string;
    value: number;
    target: number;
    color: string;
    unit?: string;
    onDetailClick?: () => void;
}

export default function IKUCard({
    code,
    title,
    value,
    target,
    color,
    unit = "%",
    onDetailClick,
}: IKUCardProps) {
    const isAchieved = value >= target;
    const gap = target - value;

    return (
        <Card className="w-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
            <CardBody className="p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="px-2 py-0.5 rounded text-xs font-bold text-white bg-gray-900 dark:bg-gray-700"
                                style={{ backgroundColor: color }}
                            >
                                {code}
                            </span>
                            {isAchieved ? (
                                <Chip size="sm" color="success" variant="flat" className="h-5 text-[10px] px-1">Terlampaui</Chip>
                            ) : (
                                <Chip size="sm" color="danger" variant="flat" className="h-5 text-[10px] px-1">{gap > 0 ? "-" : "+"}{Math.abs(gap).toFixed(1)}{unit}</Chip>
                            )}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 h-10 leading-tight" title={title}>
                            {title}
                        </h3>
                    </div>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-gray-400 min-w-8 w-8 h-8"
                    >
                        <FiMoreHorizontal />
                    </Button>
                </div>

                {/* Gauge Center */}
                <div className="flex flex-col items-center justify-center my-2">
                    <GaugeChart
                        value={value}
                        target={target}
                        title=""
                        color={color}
                        height={160}
                    />
                    <div className="text-center -mt-6">
                        <p className="text-xs text-gray-500">Target: <span className="font-medium">{target}{unit}</span></p>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <Button
                        size="sm"
                        variant="light"
                        color="primary"
                        className="font-medium"
                        endContent={<FiArrowRight />}
                        onPress={onDetailClick}
                        style={{ color: color }}
                    >
                        Lihat Detail
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}
