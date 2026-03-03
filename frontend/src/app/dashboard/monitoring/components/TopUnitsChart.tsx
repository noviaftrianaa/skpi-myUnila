
"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Divider, Skeleton } from "@heroui/react";
import { FiMapPin } from "react-icons/fi";
import { DrilldownBarChart } from "./charts";
import type { DrilldownData } from "./charts/DrilldownBarChart";
import { threatService, ThreatStats } from "@/lib/services/webmon/threatService";

export default function TopUnitsChart() {
    const [unitData, setUnitData] = useState<DrilldownData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        threatService.getStats()
            .then((stats: ThreatStats) => {
                if (stats.top_sites && stats.top_sites.length > 0) {
                    setUnitData(
                        stats.top_sites
                            .filter((s) => s.count > 0)
                            .map((s) => ({
                                id: s.site_id,
                                name: s.site_name || s.site_id,
                                value: s.count,
                            }))
                    );
                }
            })
            .catch(() => setUnitData([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-shadow duration-300 h-full">
            <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                            Top Situs Terdampak
                        </h2>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                            Situs dengan jumlah ancaman terbanyak
                        </p>
                    </div>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="px-2 sm:px-4 py-3 sm:py-4">
                {loading ? (
                    <Skeleton className="h-[300px] w-full rounded-lg" />
                ) : unitData.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-sm text-gray-400">
                        Belum ada data ancaman per situs
                    </div>
                ) : (
                    <DrilldownBarChart
                        data={unitData}
                        title="Ancaman per Situs"
                        color="#ef4444"
                        height={300}
                        horizontal={true}
                    />
                )}
            </CardBody>
        </Card>
    );
}
