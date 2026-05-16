"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
    FiUsers,
    FiFileText,
    FiBriefcase,
} from "react-icons/fi";
import { pimpinanMenuConfig } from "../config/menuConfig";
import {
    StatCard,
    PieChart,
    BarChart,
    LineChart,
    FilterPanel,
    DashboardSkeleton,
    ErrorAlert,
} from "../components";
import { useDashboardData, useDashboardReference } from "../hooks";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { KerjasamaData } from "../types";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import UnitFilter from "@/shared/components/data-unila/UnitFilter";
import ExportMenu, { type ExportFormat } from "@/shared/components/data-unila/ExportMenu";
import mahasiswaDataService, { type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { exportToCsv, exportToJson } from "@/lib/utils/exportCsv";
import { exportToPdf } from "@/lib/utils/exportPdf";
import toast, { Toaster } from "react-hot-toast";

const APP_KEY = "dashboard-pimpinan";

export default function DashboardKerjasamaPage() {
    useRequireAuth();
    const scope = useRoleBasedScope();

    const [selectedSemesters, setSelectedSemesters] = useState<Set<string>>(new Set());
    const [unitItems, setUnitItems] = useState<string[]>([]);
    const unitFilterStr = unitItems.join(",");
    const [orgFilters, setOrgFilters] = useState<MahasiswaFilters | null>(null);

    useEffect(() => {
        mahasiswaDataService.getFilters({
            id_fakultas: scope.forcedFakultas || undefined,
            id_jurusan: scope.forcedJurusan || undefined,
        }).then(setOrgFilters).catch(console.error);
    }, [scope.forcedFakultas, scope.forcedJurusan]);

    const { semester, activeSemesters } = useDashboardReference();

    useEffect(() => {
        if (activeSemesters.length > 0 && selectedSemesters.size === 0) {
            setSelectedSemesters(new Set(activeSemesters));
        }
    }, [activeSemesters]); // eslint-disable-line react-hooks/exhaustive-deps

    const semesterParam = Array.from(selectedSemesters).join(",");
    const { data, loading, error, refetch } = useDashboardData<KerjasamaData>(
        ENDPOINTS.DASHBOARD_PIMPINAN.KERJASAMA,
        {
            semester: semesterParam,
            ...(scope.forcedFakultas && { fakultas: scope.forcedFakultas }),
            ...(scope.forcedProdi && { prodi: scope.forcedProdi }),
            ...(unitFilterStr && { unit_filter: unitFilterStr }),
        }
    );

    const handleReset = () => {
        setSelectedSemesters(new Set(activeSemesters));
        setUnitItems([]);
    };

    const handleExport = (fmtType: ExportFormat) => {
        if (!data) { toast.error("Data belum dimuat"); return; }
        const rows = (data.mitraByType || []).map((r) => ({ type: r.name, jumlah: r.value }));
        if (!rows.length) { toast.error("Tidak ada data"); return; }
        const baseName = `kerjasama-mitra-type-${semesterParam || "all"}`;
        const headers = { type: "Tipe Mitra", jumlah: "Jumlah Mitra" } as const;
        if (fmtType === "excel") { exportToExcel(rows as unknown as Record<string, unknown>[], baseName, "Kerjasama", headers); toast.success("Excel di-download"); }
        else if (fmtType === "csv-client") { exportToCsv(rows as unknown as Record<string, unknown>[], baseName, headers); toast.success("CSV di-download"); }
        else if (fmtType === "pdf") { exportToPdf(rows as unknown as Record<string, unknown>[], baseName, { title: "Kerjasama by Mitra Type", headers, orientation: "landscape" }); toast.success("PDF di-download"); }
        else if (fmtType === "json") { exportToJson(rows, baseName); toast.success("JSON di-download"); }
        else { toast("Server export belum tersedia"); }
    };

    return (
        <DashboardLayoutWithDynamicMenu
            appName="Dashboard Pimpinan"
            appIcon={<FiUsers className="w-6 h-6" />}
            appKey={APP_KEY}
            fallbackMenus={pimpinanMenuConfig}
        >
            <Toaster position="top-right" />
            <div className="p-6 space-y-6">
                <ScopeBadge />
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FiUsers className="w-8 h-8 text-indigo-600" />
                        Dashboard Kerjasama
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Monitoring kemitraan dan kerjasama (MoU, MoA, IA) Universitas Lampung
                    </p>
                </div>

                {/* Filter */}
                <FilterPanel
                    semester={semester}
                    selectedSemesters={selectedSemesters}
                    onSemesterChange={setSelectedSemesters}
                    scopeBadge={scope.scopeName}
                    onReset={handleReset}
                />
                <div className="flex flex-wrap gap-3 items-end p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50">
                    <div className="flex-1 min-w-[240px]">
                        <UnitFilter
                            data={orgFilters}
                            value={unitItems}
                            onChange={(next) => setUnitItems(next)}
                            forcedFakultas={scope.forcedFakultas || undefined}
                            forcedJurusan={scope.forcedJurusan || undefined}
                            forcedProdi={scope.forcedProdi || undefined}
                        />
                    </div>
                    <ExportMenu onExport={handleExport} disabled={{ "csv-server": true }} />
                </div>

                {loading && <DashboardSkeleton />}
                {error && <ErrorAlert message={error} onRetry={refetch} />}

                {data && (
                    <>
                        {/* Stats — 4 metric konsisten dengan dashboard lain */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                title="Total Mitra"
                                value={data.stats.totalMitra.total}
                                icon={<FiUsers className="w-6 h-6 text-white" />}
                                color="indigo"
                                trend={{ value: data.stats.totalMitra.trend ?? 0, label: "YoY" }}
                                href="/dashboard/data-unila/kerjasama"
                                hint="Lihat detail seluruh mitra kerjasama"
                            />
                            <StatCard
                                title="MoU Aktif"
                                value={data.stats.mouAktif.total}
                                icon={<FiFileText className="w-6 h-6 text-white" />}
                                color="green"
                                trend={{ value: data.stats.mouAktif.trend ?? 0, label: "YoY" }}
                                href="/dashboard/data-unila/kerjasama"
                                hint="Lihat detail kerjasama (filter MoU aktif di halaman)"
                            />
                            <StatCard
                                title="Mitra Internasional"
                                value={(() => {
                                    const intl = (data.mitraByScope || []).find((m) =>
                                        /internasional/i.test(m.name || "")
                                    );
                                    return intl?.value ?? 0;
                                })()}
                                subtitle="Cakupan global"
                                icon={<FiBriefcase className="w-6 h-6 text-white" />}
                                color="cyan"
                            />
                            <StatCard
                                title="DUDI / Industri"
                                value={(() => {
                                    const dudi = (data.mitraByType || []).find((m) =>
                                        /dudi|industri|swasta/i.test(m.name || "")
                                    );
                                    return dudi?.value ?? 0;
                                })()}
                                subtitle="Mitra industri"
                                icon={<FiBriefcase className="w-6 h-6 text-white" />}
                                color="purple"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Mitra by Scope */}
                            <Card className="bg-white dark:bg-gray-800 shadow-md">
                                <CardHeader>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Cakupan Kerjasama
                                        </h2>
                                        <p className="text-sm text-gray-500">Distribusi mitra berdasarkan cakupan wilayah</p>
                                    </div>
                                </CardHeader>
                                <Divider />
                                <CardBody className="min-h-[480px]">
                                    <PieChart
                                        data={data.mitraByScope}
                                        donut={true}
                                        height={300}
                                        colors={["#f59e0b", "#3b82f6", "#10b981"]}
                                    />
                                </CardBody>
                            </Card>

                            {/* Tren Kerjasama */}
                            <Card className="bg-white dark:bg-gray-800 shadow-md">
                                <CardHeader>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Tren Pertumbuhan Kerjasama
                                        </h2>
                                        <p className="text-sm text-gray-500">Jumlah dokumen kerjasama baru per tahun</p>
                                    </div>
                                </CardHeader>
                                <Divider />
                                <CardBody className="min-h-[480px]">
                                    <LineChart
                                        data={data.trenKerjasama}
                                        height={300}
                                        color="#6366f1"
                                    />
                                </CardBody>
                            </Card>
                        </div>

                        {/* Mitra by Type */}
                        <Card className="bg-white dark:bg-gray-800 shadow-md">
                            <CardHeader>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Jenis Mitra Kerjasama
                                    </h2>
                                    <p className="text-sm text-gray-500">Klasifikasi mitra kerjasama (DUDI, PT, Pemerintah)</p>
                                </div>
                            </CardHeader>
                            <Divider />
                            <CardBody className="min-h-[480px]">
                                <BarChart
                                    data={data.mitraByType}
                                    horizontal={true}
                                    height={350}
                                    colors={["#ec4899"]}
                                    xAxisLabel="Jumlah Mitra"
                                />
                            </CardBody>
                        </Card>
                    </>
                )}

            </div>
        </DashboardLayoutWithDynamicMenu>
    );
}
