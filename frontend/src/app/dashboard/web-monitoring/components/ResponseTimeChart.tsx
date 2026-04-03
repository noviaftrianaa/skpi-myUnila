
"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Divider, Skeleton } from "@heroui/react";
import { FiActivity, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { GaugeChart } from "./charts";
import { threatService, ThreatStats } from "@/lib/services/webmon/threatService";

export default function ResponseTimeChart() {
    const [stats, setStats] = useState<ThreatStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        threatService.getStats()
            .then((s) => setStats(s))
            .catch(() => setStats(null))
            .finally(() => setLoading(false));
    }, []);

    const total = stats?.total || 0;
    const resolved = stats?.resolved || 0;
    const confirmed = stats?.confirmed || 0;
    const falsePositive = stats?.false_positive || 0;
    const pending = stats?.pending || 0;

    // Handled = resolved + confirmed + false_positive
    const handled = resolved + confirmed + falsePositive;
    const handlingRate = total > 0 ? Math.round((handled / total) * 100) : 0;

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
                            Rasio penanganan ancaman yang terdeteksi
                        </p>
                    </div>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="flex flex-col items-center justify-center px-3 sm:px-4 py-4 sm:py-6">
                {loading ? (
                    <Skeleton className="h-[200px] w-full rounded-lg" />
                ) : total === 0 ? (
                    <div className="flex items-center justify-center h-[200px] text-sm text-gray-400">
                        Belum ada data ancaman
                    </div>
                ) : (
                    <>
                        <GaugeChart
                            value={handlingRate}
                            title="Tingkat Penanganan"
                            color="#10b981"
                            height={200}
                        />
                        <div className="flex w-full justify-around mt-3 sm:mt-4">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-gray-500 text-[9px] sm:text-[10px] uppercase font-bold mb-1">
                                    <FiCheckCircle className="w-3 h-3" /> Tertangani
                                </div>
                                <div className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">
                                    {handled}/{total}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 text-gray-500 text-[9px] sm:text-[10px] uppercase font-bold mb-1">
                                    <FiAlertCircle className="w-3 h-3" /> Pending
                                </div>
                                <div className="text-base sm:text-xl font-bold text-orange-500">
                                    {pending}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </CardBody>
        </Card>
    );
}
