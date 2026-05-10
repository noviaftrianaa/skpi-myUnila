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

const APP_KEY = "dashboard-pimpinan";

export default function DashboardKerjasamaPage() {
    useRequireAuth();

    const [selectedSemesters, setSelectedSemesters] = useState<Set<string>>(new Set());

    const { semester, activeSemesters } = useDashboardReference();

    useEffect(() => {
        if (activeSemesters.length > 0 && selectedSemesters.size === 0) {
            setSelectedSemesters(new Set(activeSemesters));
        }
    }, [activeSemesters]); // eslint-disable-line react-hooks/exhaustive-deps

    const semesterParam = Array.from(selectedSemesters).join(",");
    const { data, loading, error, refetch } = useDashboardData<KerjasamaData>(
        ENDPOINTS.DASHBOARD_PIMPINAN.KERJASAMA,
        { semester: semesterParam }
    );

    const handleReset = () => {
        setSelectedSemesters(new Set(activeSemesters));
    };

    return (
        <DashboardLayoutWithDynamicMenu
            appName="Dashboard Pimpinan"
            appIcon={<FiUsers className="w-6 h-6" />}
            appKey={APP_KEY}
            fallbackMenus={pimpinanMenuConfig}
        >
            <div className="p-6 space-y-6">
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
                    onReset={handleReset}
                />

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
                            />
                            <StatCard
                                title="MoU Aktif"
                                value={data.stats.mouAktif.total}
                                icon={<FiFileText className="w-6 h-6 text-white" />}
                                color="green"
                                trend={{ value: data.stats.mouAktif.trend ?? 0, label: "YoY" }}
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
                                <CardBody>
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
                                <CardBody>
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
                            <CardBody>
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
