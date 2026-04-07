
"use client";

import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { FiPieChart, FiShield } from "react-icons/fi";
import { PieChart } from "./charts";

export default function MonitoringCharts() {
    const threatCategories = [
        { name: "Slot Gacor", value: 45 },
        { name: "Togel Online", value: 30 },
        { name: "Poker/Casino", value: 15 },
        { name: "Judi Bola", value: 10 },
    ];

    const siteStatus = [
        { name: "Aman", value: 38 },
        { name: "Waspada", value: 5 },
        { name: "Bahaya", value: 2 },
    ];

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-shadow duration-300">
                <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <FiPieChart className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                                Kategori Ancaman
                            </h2>
                            <p className="text-[10px] sm:text-xs text-gray-500">Distribusi jenis konten ilegal yang terdeteksi</p>
                        </div>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="px-2 sm:px-4 py-3 sm:py-4">
                    <PieChart
                        data={threatCategories}
                        donut
                        height={280}
                        colors={["#ef4444", "#f97316", "#eab308", "#3b82f6"]}
                    />
                </CardBody>
            </Card>

            <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-shadow duration-300">
                <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <FiShield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                                Status Keamanan Situs
                            </h2>
                            <p className="text-[10px] sm:text-xs text-gray-500">Proporsi status keamanan seluruh situs</p>
                        </div>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="px-2 sm:px-4 py-3 sm:py-4">
                    <PieChart
                        data={siteStatus}
                        height={280}
                        colors={["#10b981", "#f59e0b", "#ef4444"]}
                    />
                </CardBody>
            </Card>
        </div>
    );
}
