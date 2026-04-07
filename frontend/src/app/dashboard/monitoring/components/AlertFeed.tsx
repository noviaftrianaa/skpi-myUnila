
"use client";

import { Card, CardBody, CardHeader, Divider, Chip, Button } from "@heroui/react";
import { FiAlertTriangle, FiAlertOctagon, FiInfo, FiCheckCircle, FiBell } from "react-icons/fi";
import { useState, useMemo } from "react";

interface AlertItem {
    id: string;
    timestamp: string;
    title: string;
    description: string;
    severity: "critical" | "high" | "medium" | "low";
    unit: string;
    url: string;
    isRead: boolean;
}

const dummyAlerts: AlertItem[] = [
    {
        id: "1", timestamp: "2026-02-18 13:45",
        title: "Injeksi link judi terdeteksi",
        description: "Ditemukan 3 link tersembunyi ke situs slot gacor pada halaman utama",
        severity: "critical", unit: "Fakultas Teknik", url: "ft.unila.ac.id", isRead: false,
    },
    {
        id: "2", timestamp: "2026-02-18 12:30",
        title: "Iframe mencurigakan terdeteksi",
        description: "Iframe tersembunyi mengarah ke domain togel online",
        severity: "high", unit: "FKIP", url: "fkip.unila.ac.id/berita", isRead: false,
    },
    {
        id: "3", timestamp: "2026-02-18 10:15",
        title: "Keyword blacklist terdeteksi",
        description: 'Kata kunci "slot gacor" ditemukan di meta description',
        severity: "medium", unit: "FEB", url: "feb.unila.ac.id/info", isRead: true,
    },
    {
        id: "4", timestamp: "2026-02-18 09:00",
        title: "SSL Certificate warning",
        description: "Sertifikat SSL akan kedaluwarsa dalam 7 hari",
        severity: "medium", unit: "FISIP", url: "fisip.unila.ac.id", isRead: true,
    },
    {
        id: "5", timestamp: "2026-02-17 22:00",
        title: "Scan selesai — aman",
        description: "Scan rutin selesai, tidak ada temuan baru",
        severity: "low", unit: "FMIPA", url: "fmipa.unila.ac.id", isRead: true,
    },
    {
        id: "6", timestamp: "2026-02-17 18:30",
        title: "Redirect mencurigakan",
        description: "Auto-redirect ke domain judi terdeteksi dari halaman alumni",
        severity: "critical", unit: "Fakultas Teknik", url: "ft.unila.ac.id/alumni", isRead: true,
    },
];

const severityConfig = {
    critical: {
        color: "danger" as const,
        icon: <FiAlertOctagon className="w-4 h-4" />,
        label: "Kritis",
        bg: "bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500",
    },
    high: {
        color: "warning" as const,
        icon: <FiAlertTriangle className="w-4 h-4" />,
        label: "Tinggi",
        bg: "bg-orange-50 dark:bg-orange-950/30 border-l-4 border-orange-500",
    },
    medium: {
        color: "primary" as const,
        icon: <FiInfo className="w-4 h-4" />,
        label: "Sedang",
        bg: "bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500",
    },
    low: {
        color: "success" as const,
        icon: <FiCheckCircle className="w-4 h-4" />,
        label: "Rendah",
        bg: "bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500",
    },
};

export default function AlertFeed() {
    const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");

    const filteredAlerts = useMemo(() => {
        if (filter === "all") return dummyAlerts;
        return dummyAlerts.filter((a) => a.severity === filter);
    }, [filter]);

    const unreadCount = dummyAlerts.filter((a) => !a.isRead).length;

    return (
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-shadow duration-300 h-full">
            <CardHeader className="flex flex-col gap-2 sm:gap-3 px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <FiBell className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                                Early Warning
                            </h2>
                            {unreadCount > 0 && (
                                <span className="text-[10px] sm:text-xs text-red-500 font-medium">{unreadCount} belum dibaca</span>
                            )}
                        </div>
                    </div>
                    <Button size="sm" variant="light" color="primary" className="text-[10px] sm:text-xs">
                        Lihat Semua
                    </Button>
                </div>
                <div className="flex gap-1 flex-wrap w-full">
                    {(["all", "critical", "high", "medium", "low"] as const).map((level) => (
                        <Chip
                            key={level}
                            size="sm"
                            variant={filter === level ? "solid" : "flat"}
                            color={level === "all" ? "default" : severityConfig[level].color}
                            className="cursor-pointer text-[10px] sm:text-xs"
                            onClick={() => setFilter(level)}
                        >
                            {level === "all" ? "Semua" : severityConfig[level].label}
                        </Chip>
                    ))}
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-0 max-h-[360px] sm:max-h-[420px] lg:max-h-[480px] overflow-y-auto">
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredAlerts.length === 0 ? (
                        <div className="p-6 sm:p-8 text-center text-gray-400 text-xs sm:text-sm">
                            Tidak ada alert untuk filter ini
                        </div>
                    ) : (
                        filteredAlerts.map((alert) => {
                            const config = severityConfig[alert.severity];
                            return (
                                <div
                                    key={alert.id}
                                    className={`p-3 sm:p-4 ${config.bg} hover:opacity-90 transition-all cursor-pointer ${!alert.isRead ? "font-medium" : "opacity-80"
                                        }`}
                                >
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className="mt-0.5 flex-shrink-0">{config.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start sm:items-center justify-between gap-1 sm:gap-2 flex-col sm:flex-row">
                                                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                                                    {alert.title}
                                                </h4>
                                                <Chip size="sm" variant="flat" color={config.color} className="flex-shrink-0 text-[10px]">
                                                    {config.label}
                                                </Chip>
                                            </div>
                                            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                {alert.description}
                                            </p>
                                            <div className="flex items-center gap-1 sm:gap-2 mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] text-gray-500 flex-wrap">
                                                <span className="font-medium">{alert.unit}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="font-mono hidden sm:inline">{alert.url}</span>
                                                <span>•</span>
                                                <span>{alert.timestamp}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
