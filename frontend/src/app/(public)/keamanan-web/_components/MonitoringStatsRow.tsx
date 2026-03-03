"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Skeleton } from "@heroui/react";
import { FiGlobe, FiKey, FiAlertOctagon, FiCheckSquare } from "react-icons/fi";
import { publicService, MonitoringStats } from "@/lib/services/webmon/publicService";

interface StatCard {
    label: string;
    key: keyof MonitoringStats;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    suffix?: string;
}

const cards: StatCard[] = [
    {
        label: "Situs Terdaftar",
        key: "total_sites",
        icon: <FiGlobe className="w-5 h-5" />,
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600",
    },
    {
        label: "Kata Kunci Diawasi",
        key: "total_keywords",
        icon: <FiKey className="w-5 h-5" />,
        iconBg: "bg-purple-100 dark:bg-purple-900/30",
        iconColor: "text-purple-600",
    },
    {
        label: "Ancaman Terdeteksi",
        key: "total_threats",
        icon: <FiAlertOctagon className="w-5 h-5" />,
        iconBg: "bg-red-100 dark:bg-red-900/30",
        iconColor: "text-red-600",
    },
    {
        label: "Ancaman Diselesaikan",
        key: "resolved_threats",
        icon: <FiCheckSquare className="w-5 h-5" />,
        iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
        iconColor: "text-emerald-600",
    },
];

export default function MonitoringStatsRow() {
    const [stats, setStats] = useState<MonitoringStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        publicService.getStats()
            .then(setStats)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="py-8 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-lg font-bold text-gray-700 mb-4 text-center uppercase tracking-wide">
                        Statistik Pemantauan
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {cards.map((card) => (
                            <Card key={card.key} className="shadow-sm border border-gray-200 bg-white hover:shadow-md transition-shadow">
                                <CardBody className="p-4 flex flex-col items-center text-center gap-2">
                                    <div className={`w-11 h-11 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center`}>
                                        {card.icon}
                                    </div>
                                    {loading ? (
                                        <Skeleton className="h-8 w-16 rounded-lg" />
                                    ) : (
                                        <p className="text-3xl font-bold text-gray-900">
                                            {stats ? stats[card.key].toLocaleString("id-ID") : "-"}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 leading-tight">{card.label}</p>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
