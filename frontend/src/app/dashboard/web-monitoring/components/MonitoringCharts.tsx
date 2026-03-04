
"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Divider, Skeleton } from "@heroui/react";
import { FiPieChart, FiShield } from "react-icons/fi";
import { PieChart } from "./charts";
import { threatService, ThreatStats } from "@/lib/services/webmon/threatService";
import { siteService, SiteStats } from "@/lib/services/webmon/siteService";

const CATEGORY_LABELS: Record<string, string> = {
    slot: "Slot Gacor",
    togel: "Togel Online",
    casino: "Casino",
    poker: "Poker",
    porn: "Pornografi",
    scam: "Penipuan",
    phishing: "Phishing",
    other: "Lainnya",
};

export default function MonitoringCharts() {
    const [threatCats, setThreatCats] = useState<{ name: string; value: number }[]>([]);
    const [siteStatus, setSiteStatus] = useState<{ name: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            threatService.getStats().catch(() => null),
            siteService.getStats().catch(() => null),
        ]).then(([ts, ss]) => {
            if (ts?.by_category) {
                setThreatCats(
                    ts.by_category
                        .filter((c) => c.count > 0)
                        .map((c) => ({ name: CATEGORY_LABELS[c.category] || c.category, value: c.count }))
                );
            }
            if (ss) {
                const statuses: { name: string; value: number }[] = [];
                if (ss.active > 0) statuses.push({ name: "Aktif", value: ss.active });
                if (ss.inactive > 0) statuses.push({ name: "Tidak Aktif", value: ss.inactive });
                if (ss.compromised > 0) statuses.push({ name: "Terkompromi", value: ss.compromised });
                if (ss.maintenance > 0) statuses.push({ name: "Maintenance", value: ss.maintenance });
                setSiteStatus(statuses);
            }
        }).finally(() => setLoading(false));
    }, []);

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
                    {loading ? (
                        <Skeleton className="h-[280px] w-full rounded-lg" />
                    ) : threatCats.length === 0 ? (
                        <div className="flex items-center justify-center h-[280px] text-sm text-gray-400">Belum ada data ancaman</div>
                    ) : (
                        <PieChart
                            data={threatCats}
                            donut
                            height={280}
                            colors={["#ef4444", "#f97316", "#eab308", "#3b82f6", "#8b5cf6", "#ec4899"]}
                        />
                    )}
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
                    {loading ? (
                        <Skeleton className="h-[280px] w-full rounded-lg" />
                    ) : siteStatus.length === 0 ? (
                        <div className="flex items-center justify-center h-[280px] text-sm text-gray-400">Belum ada data situs</div>
                    ) : (
                        <PieChart
                            data={siteStatus}
                            height={280}
                            colors={["#10b981", "#f59e0b", "#ef4444", "#6b7280"]}
                        />
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
