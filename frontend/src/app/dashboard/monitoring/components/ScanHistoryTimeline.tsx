
"use client";

import { Card, CardBody, CardHeader, Divider, Chip, Button } from "@heroui/react";
import { FiClock, FiCheckCircle, FiAlertTriangle, FiSearch, FiXCircle } from "react-icons/fi";

interface ScanEvent {
    id: string;
    timestamp: string;
    site: string;
    url: string;
    result: "clean" | "warning" | "threat" | "error";
    findings: number;
    duration: string;
    details: string;
}

const dummyScans: ScanEvent[] = [
    {
        id: "1", timestamp: "2026-02-18 13:45", site: "Portal FT",
        url: "ft.unila.ac.id", result: "threat", findings: 3,
        duration: "4.2s", details: "3 link judi terdeteksi pada halaman utama dan /berita",
    },
    {
        id: "2", timestamp: "2026-02-18 13:30", site: "Portal FKIP",
        url: "fkip.unila.ac.id", result: "warning", findings: 1,
        duration: "3.8s", details: "1 iframe mencurigakan pada /berita, belum terverifikasi",
    },
    {
        id: "3", timestamp: "2026-02-18 13:15", site: "Portal FEB",
        url: "feb.unila.ac.id", result: "clean", findings: 0,
        duration: "2.1s", details: "Scan selesai, tidak ada temuan",
    },
    {
        id: "4", timestamp: "2026-02-18 13:00", site: "Portal FISIP",
        url: "fisip.unila.ac.id", result: "clean", findings: 0,
        duration: "1.8s", details: "Scan selesai, tidak ada temuan",
    },
    {
        id: "5", timestamp: "2026-02-18 12:45", site: "Portal FMIPA",
        url: "fmipa.unila.ac.id", result: "clean", findings: 0,
        duration: "2.3s", details: "Scan selesai, tidak ada temuan",
    },
    {
        id: "6", timestamp: "2026-02-18 12:30", site: "Portal FH",
        url: "fh.unila.ac.id", result: "error", findings: 0,
        duration: "10.0s", details: "Timeout saat mengakses halaman — server tidak merespons",
    },
    {
        id: "7", timestamp: "2026-02-18 12:15", site: "Portal FK",
        url: "fk.unila.ac.id", result: "clean", findings: 0,
        duration: "1.5s", details: "Scan selesai, tidak ada temuan",
    },
    {
        id: "8", timestamp: "2026-02-18 12:00", site: "Portal FP",
        url: "fp.unila.ac.id", result: "warning", findings: 1,
        duration: "5.6s", details: "Keyword blacklist terdeteksi pada meta tags",
    },
];

const resultConfig = {
    clean: {
        color: "success" as const,
        icon: <FiCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />,
        label: "Bersih",
        line: "border-green-300 dark:border-green-700",
    },
    warning: {
        color: "warning" as const,
        icon: <FiAlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />,
        label: "Peringatan",
        line: "border-yellow-300 dark:border-yellow-700",
    },
    threat: {
        color: "danger" as const,
        icon: <FiAlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />,
        label: "Ancaman",
        line: "border-red-300 dark:border-red-700",
    },
    error: {
        color: "default" as const,
        icon: <FiXCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />,
        label: "Error",
        line: "border-gray-300 dark:border-gray-700",
    },
};

export default function ScanHistoryTimeline() {
    return (
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-shadow duration-300 h-full">
            <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                            Riwayat Scan
                        </h2>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                            Timeline pemindaian otomatis terbaru
                        </p>
                    </div>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-3 sm:p-4 max-h-[360px] sm:max-h-[420px] lg:max-h-[520px] overflow-y-auto">
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[15px] sm:left-[17px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                    <div className="space-y-0">
                        {dummyScans.map((scan) => {
                            const config = resultConfig[scan.result];
                            return (
                                <div key={scan.id} className="relative flex gap-2 sm:gap-3 pb-4 sm:pb-5 last:pb-0 group">
                                    {/* Dot */}
                                    <div className="relative z-10 flex-shrink-0">
                                        <div
                                            className={`w-[30px] h-[30px] sm:w-[36px] sm:h-[36px] rounded-full flex items-center justify-center bg-white dark:bg-gray-800 border-2 ${config.line} shadow-sm group-hover:scale-110 transition-transform`}
                                        >
                                            {config.icon}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-900/80 transition-colors">
                                        <div className="flex items-start sm:items-center justify-between gap-1 flex-col sm:flex-row">
                                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                                <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">
                                                    {scan.site}
                                                </span>
                                                <Chip size="sm" variant="flat" color={config.color} className="text-[10px]">
                                                    {config.label}
                                                </Chip>
                                                {scan.findings > 0 && (
                                                    <Chip size="sm" variant="solid" color="danger" className="text-[10px]">
                                                        {scan.findings} temuan
                                                    </Chip>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[10px] text-gray-500">
                                                <FiClock className="w-3 h-3 flex-shrink-0" />
                                                <span className="whitespace-nowrap">{scan.timestamp}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="hidden sm:inline">{scan.duration}</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                            {scan.details}
                                        </p>
                                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1 font-mono truncate">
                                            {scan.url}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
