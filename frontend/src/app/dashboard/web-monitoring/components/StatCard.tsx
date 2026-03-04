
"use client";

import { Card, CardBody } from "@heroui/react";
import { ReactNode } from "react";

export interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    description?: string;
    icon: ReactNode;
    color?: "blue" | "green" | "red" | "yellow" | "purple" | "cyan" | "pink" | "indigo";
    trend?: {
        value: number;
        label: string;
    };
}

const colorGradients = {
    blue: "from-blue-500 via-blue-600 to-cyan-600",
    green: "from-green-500 via-green-600 to-teal-600",
    red: "from-red-500 via-red-600 to-pink-600",
    yellow: "from-yellow-500 via-amber-500 to-orange-500",
    purple: "from-purple-500 via-purple-600 to-indigo-600",
    cyan: "from-cyan-500 via-cyan-600 to-blue-600",
    pink: "from-pink-500 via-pink-600 to-rose-600",
    indigo: "from-indigo-500 via-indigo-600 to-purple-600",
};

const colorTexts = {
    blue: "text-blue-100",
    green: "text-green-100",
    red: "text-red-100",
    yellow: "text-yellow-100",
    purple: "text-purple-100",
    cyan: "text-cyan-100",
    pink: "text-pink-100",
    indigo: "text-indigo-100",
};

export default function StatCard({
    title,
    value,
    subtitle,
    description,
    icon,
    color = "blue",
    trend,
}: StatCardProps) {
    return (
        <Card
            className={`bg-gradient-to-br ${colorGradients[color]} border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative`}
        >
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10 md:-mr-12 md:-mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-3 sm:p-4 relative z-10">
                <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0">
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-[10px] sm:text-xs font-medium ${colorTexts[color]}`}>{title}</p>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">
                            {typeof value === "number" ? value.toLocaleString("id-ID") : value}
                        </h3>
                        {subtitle && (
                            <p className="text-[9px] sm:text-[10px] text-white/80 truncate">{subtitle}</p>
                        )}
                        {description && (
                            <p className="text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 text-white/90 leading-tight line-clamp-2">{description}</p>
                        )}
                        {trend && (
                            <p
                                className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${trend.value >= 0 ? "text-green-200" : "text-red-200"
                                    }`}
                            >
                                {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value).toFixed(1)}%{" "}
                                {trend.label}
                            </p>
                        )}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
