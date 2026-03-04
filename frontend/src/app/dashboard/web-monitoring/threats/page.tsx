"use client";

import React, { useState, useEffect, useCallback } from "react";
import ThreatStatsCards from "./components/ThreatStatsCards";
import ThreatTable from "./components/ThreatTable";
import ThreatDetailModal from "./components/ThreatDetailModal";
import { Card, CardBody, Button } from "@heroui/react";
import { FiDownload } from "react-icons/fi";
import { threatService, Threat, ThreatStats } from "@/lib/services/webmon/threatService";
import { toast } from "react-hot-toast";

function exportThreatsCSV(threats: Threat[]) {
    const headers = ["ID", "Situs", "URL Halaman", "Kategori", "Skor", "Keyword", "Status", "Terdeteksi"];
    const rows = threats.map((t) => [
        t.id,
        `"${(t.site_name || t.site_id || "").replace(/"/g, '""')}"`,
        `"${(t.page_url || "").replace(/"/g, '""')}"`,
        t.category || "",
        t.threat_score ?? 0,
        `"${(t.matched_keywords || "").replace(/"/g, '""')}"`,
        t.status || "",
        t.detected_at ? new Date(t.detected_at).toLocaleDateString("id-ID") : "-",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-ancaman-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function ThreatsPage() {
    const [threats, setThreats] = useState<Threat[]>([]);
    const [stats, setStats] = useState<ThreatStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedThreatId, setSelectedThreatId] = useState<number | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [threatsRes, statsRes] = await Promise.all([
                threatService.listThreats({ limit: 100 }),
                threatService.getStats(),
            ]);
            setThreats(threatsRes.items || []);
            setStats(statsRes);
        } catch {
            toast.error("Gagal memuat data ancaman");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await threatService.updateStatus(id, status);
            toast.success(`Status diupdate ke ${status}`);
            fetchData();
        } catch {
            toast.error("Gagal update status");
        }
    };

    const handleViewDetail = (id: number) => {
        setSelectedThreatId(id);
        setIsDetailOpen(true);
    };

    const handleExport = () => {
        if (threats.length === 0) {
            toast.error("Tidak ada data untuk diekspor");
            return;
        }
        exportThreatsCSV(threats);
        toast.success(`${threats.length} data diekspor ke CSV`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Ancaman</h1>
                    <p className="text-sm text-gray-500">
                        Daftar konten ilegal yang terdeteksi pada situs universitas.
                    </p>
                </div>
                <Button
                    color="primary"
                    variant="flat"
                    radius="md"
                    startContent={<FiDownload />}
                    className="font-medium"
                    onPress={handleExport}
                    isDisabled={isLoading}
                >
                    {isLoading ? "Memuat..." : `Export Laporan (${threats.length})`}
                </Button>
            </div>

            <ThreatStatsCards stats={stats} />

            <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl" radius="lg">
                <CardBody className="p-0">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold">Daftar Temuan</h3>
                    </div>
                    <ThreatTable
                        data={threats}
                        isLoading={isLoading}
                        onUpdateStatus={handleUpdateStatus}
                        onViewDetail={handleViewDetail}
                    />
                </CardBody>
            </Card>

            <ThreatDetailModal
                threatId={selectedThreatId}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                onStatusUpdated={fetchData}
            />
        </div>
    );
}
