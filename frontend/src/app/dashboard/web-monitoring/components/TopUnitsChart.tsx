
"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Divider, Skeleton } from "@heroui/react";
import { FiMapPin } from "react-icons/fi";
import { DrilldownBarChart } from "./charts";
import type { DrilldownData } from "./charts/DrilldownBarChart";
import { threatService, ThreatStats } from "@/lib/services/webmon/threatService";

export default function TopUnitsChart() {
    const [unitData, setUnitData] = useState<DrilldownData[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasTopFakultas, setHasTopFakultas] = useState(false);

    useEffect(() => {
        threatService.getStats()
            .then((stats: ThreatStats) => {
                if (stats.top_fakultas && stats.top_fakultas.length > 0) {
                    setHasTopFakultas(true);
                    setUnitData(
                        stats.top_fakultas
                            .filter((f) => f.count > 0)
                            .map((f) => ({
                                id: f.fakultas_id,
                                name: f.fakultas_name || f.fakultas_id,
                                value: f.count,
                            }))
                    );
                } else if (stats.top_sites && stats.top_sites.length > 0) {
                    setHasTopFakultas(false);
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

    const handleDrilldown = useCallback(async (item: DrilldownData, level: number): Promise<DrilldownData[] | undefined> => {
        // Only fetch children for fakultas level (level 0 -> 1)
        if (level !== 1 || !hasTopFakultas) return undefined;
        try {
            const children = await threatService.getStatsByFakultas(item.id);
            return children
                .filter((c) => c.count > 0)
                .map((c) => ({
                    id: c.id,
                    name: c.name,
                    value: c.count,
                }));
        } catch {
            return undefined;
        }
    }, [hasTopFakultas]);

    return (
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-shadow duration-300 h-full">
            <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                            {hasTopFakultas ? "Top Fakultas Terdampak" : "Top Situs Terdampak"}
                        </h2>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                            {hasTopFakultas
                                ? "Fakultas dengan jumlah ancaman terbanyak (klik untuk detail prodi)"
                                : "Situs dengan jumlah ancaman terbanyak"}
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
                        {hasTopFakultas
                            ? "Belum ada data ancaman per fakultas"
                            : "Belum ada data ancaman per situs"}
                    </div>
                ) : (
                    <DrilldownBarChart
                        data={unitData}
                        title={hasTopFakultas ? "Ancaman per Fakultas" : "Ancaman per Situs"}
                        color="#ef4444"
                        height={300}
                        maxHeight={500}
                        horizontal={true}
                        onDrilldownAsync={handleDrilldown}
                    />
                )}
            </CardBody>
        </Card>
    );
}
