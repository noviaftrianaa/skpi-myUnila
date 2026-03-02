"use client";

import React, { useState, useEffect, useCallback } from "react";
import ThreatStatsCards from "./components/ThreatStatsCards";
import ThreatTable from "./components/ThreatTable";
import { Card, CardBody, Button } from "@heroui/react";
import { FiDownload } from "react-icons/fi";
import { threatService, Threat, ThreatStats } from "@/lib/services/webmon/threatService";
import { toast } from "react-hot-toast";

export default function ThreatsPage() {
    const [threats, setThreats] = useState<Threat[]>([]);
    const [stats, setStats] = useState<ThreatStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [threatsRes, statsRes] = await Promise.all([
                threatService.listThreats({ limit: 100 }),
                threatService.getStats(),
            ]);
            setThreats(threatsRes.data || []);
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Ancaman</h1>
                    <p className="text-sm text-gray-500">
                        Daftar konten ilegal yang terdeteksi pada situs universitas.
                    </p>
                </div>
                <Button color="primary" variant="flat" radius="md" startContent={<FiDownload />} className="font-medium">
                    Export Laporan
                </Button>
            </div>

            <ThreatStatsCards stats={stats} />

            <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl" radius="lg">
                <CardBody className="p-0">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold">Daftar Temuan</h3>
                    </div>
                    <ThreatTable data={threats} isLoading={isLoading} onUpdateStatus={handleUpdateStatus} />
                </CardBody>
            </Card>
        </div>
    );
}
