
"use client";

import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { FiActivity, FiClock, FiCheckCircle } from "react-icons/fi";
import { GaugeChart } from "./charts";

export default function ResponseTimeChart() {
    const efficiencyScore = 85;
    const avgResponseTime = "2.5 Jam";

    return (
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-shadow duration-300 h-full">
            <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <FiActivity className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                            Efisiensi Penanganan
                        </h2>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                            Kecepatan respon dan penyelesaian insiden
                        </p>
                    </div>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="flex flex-col items-center justify-center px-3 sm:px-4 py-4 sm:py-6">
                <GaugeChart
                    value={efficiencyScore}
                    title="Skor Efisiensi"
                    color="#10b981"
                    height={200}
                />
                <div className="flex w-full justify-around mt-3 sm:mt-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-500 text-[9px] sm:text-[10px] uppercase font-bold mb-1">
                            <FiClock className="w-3 h-3" /> Rata-rata Respon
                        </div>
                        <div className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">{avgResponseTime}</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-500 text-[9px] sm:text-[10px] uppercase font-bold mb-1">
                            <FiCheckCircle className="w-3 h-3" /> Tingkat Selesai
                        </div>
                        <div className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">92%</div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
