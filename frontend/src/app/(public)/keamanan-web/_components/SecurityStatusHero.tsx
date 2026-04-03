"use client";

import { useEffect, useState } from "react";
import { Chip, Skeleton } from "@heroui/react";
import { FiShield, FiCheckCircle, FiAlertTriangle, FiAlertCircle, FiClock, FiGlobe, FiZap } from "react-icons/fi";
import { publicService, MonitoringStatus } from "@/lib/services/webmon/publicService";

const statusConfig = {
    aman: {
        label: "AMAN",
        color: "success" as const,
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        icon: <FiCheckCircle className="w-8 h-8 text-emerald-500" />,
        desc: "Tidak ada ancaman aktif yang terdeteksi pada subdomain Unila saat ini.",
    },
    waspada: {
        label: "WASPADA",
        color: "warning" as const,
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: <FiAlertTriangle className="w-8 h-8 text-amber-500" />,
        desc: "Terdapat beberapa potensi ancaman yang sedang dalam proses investigasi.",
    },
    bahaya: {
        label: "BAHAYA",
        color: "danger" as const,
        bg: "bg-red-50",
        border: "border-red-200",
        icon: <FiAlertCircle className="w-8 h-8 text-red-500" />,
        desc: "Terdeteksi konten ilegal aktif pada subdomain Unila. Tim sedang menangani.",
    },
};

function formatLastScan(ts?: string): string {
    if (!ts) return "-";
    try {
        return new Date(ts).toLocaleString("id-ID", {
            day: "2-digit", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    } catch {
        return ts;
    }
}

export default function SecurityStatusHero() {
    const [status, setStatus] = useState<MonitoringStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        publicService.getStatus()
            .then(setStatus)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    const cfg = statusConfig[(status?.status as keyof typeof statusConfig) ?? "aman"];

    return (
        <section className="relative -mt-6 z-10 pb-6">
            <div className="container mx-auto px-4">
                <div className={`max-w-4xl mx-auto rounded-2xl border-2 shadow-lg p-6 sm:p-8 ${error ? "bg-gray-50 border-gray-200" : cfg.bg + " " + cfg.border}`}>
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-32 rounded-lg" />
                            <Skeleton className="h-5 w-3/4 rounded-lg" />
                            <div className="flex gap-4 mt-4">
                                <Skeleton className="h-16 w-40 rounded-xl" />
                                <Skeleton className="h-16 w-40 rounded-xl" />
                                <Skeleton className="h-16 w-40 rounded-xl" />
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-3 text-gray-500">
                            <FiShield className="w-6 h-6" />
                            <p className="text-sm">Data monitoring tidak tersedia saat ini. Coba lagi nanti.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                                <div className="flex-shrink-0">{cfg.icon}</div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h2 className="text-xl font-bold text-gray-900">Status Keamanan Web</h2>
                                        <Chip color={cfg.color} variant="flat" size="sm" className="font-bold">
                                            {cfg.label}
                                        </Chip>
                                    </div>
                                    <p className="text-sm text-gray-600">{cfg.desc}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white/70 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <FiGlobe className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{status?.sites_monitored ?? "-"}</p>
                                        <p className="text-xs text-gray-500">Situs Dipantau</p>
                                    </div>
                                </div>
                                <div className="bg-white/70 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <FiCheckCircle className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{status?.sites_online ?? "-"}</p>
                                        <p className="text-xs text-gray-500">Situs Online</p>
                                    </div>
                                </div>
                                <div className="bg-white/70 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <FiZap className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{status?.active_threats ?? "-"}</p>
                                        <p className="text-xs text-gray-500">Ancaman Aktif</p>
                                    </div>
                                </div>
                            </div>

                            {status?.updated_at && (
                                <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
                                    <FiClock className="w-3.5 h-3.5" />
                                    <span>Diperbarui: {formatLastScan(status.updated_at)}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
