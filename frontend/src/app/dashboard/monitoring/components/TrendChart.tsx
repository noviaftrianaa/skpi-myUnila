
"use client";

import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { FiTrendingUp } from "react-icons/fi";
import { LineChart } from "./charts";

export default function TrendChart() {
    const trendData = [
        { name: "Jan", value: 12 },
        { name: "Feb", value: 8 },
        { name: "Mar", value: 15 },
        { name: "Apr", value: 10 },
        { name: "Mei", value: 5 },
        { name: "Jun", value: 8 },
    ];

    return (
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-shadow duration-300 h-full">
            <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                            Trend Temuan Ancaman
                        </h2>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                            Jumlah deteksi konten ilegal per bulan (6 bulan terakhir)
                        </p>
                    </div>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="px-2 sm:px-4 py-3 sm:py-4">
                <LineChart
                    data={trendData}
                    height={280}
                    color="#3b82f6"
                    showArea={true}
                    smooth={true}
                />
            </CardBody>
        </Card>
    );
}
