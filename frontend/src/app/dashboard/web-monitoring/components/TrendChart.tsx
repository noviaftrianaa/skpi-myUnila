
"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Divider, Skeleton } from "@heroui/react";
import { FiTrendingUp } from "react-icons/fi";
import { LineChart } from "./charts";
import { threatService, Threat } from "@/lib/services/webmon/threatService";

export default function TrendChart() {
    const [data, setData] = useState<{ name: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        threatService.listThreats({ limit: 100 })
            .then((res) => {
                const now = new Date();
                const months: { name: string; value: number }[] = [];
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const label = d.toLocaleString("id-ID", { month: "short" });
                    const count = (res.items || []).filter((t: Threat) => {
                        const det = new Date(t.detected_at);
                        return det.getMonth() === d.getMonth() && det.getFullYear() === d.getFullYear();
                    }).length;
                    months.push({ name: label, value: count });
                }
                setData(months);
            })
            .catch(() => setData([]))
            .finally(() => setLoading(false));
    }, []);

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
                {loading ? (
                    <Skeleton className="h-[280px] w-full rounded-lg" />
                ) : (
                    <LineChart
                        data={data}
                        height={280}
                        color="#3b82f6"
                        showArea={true}
                        smooth={true}
                    />
                )}
            </CardBody>
        </Card>
    );
}
