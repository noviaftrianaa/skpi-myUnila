"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
    FiUsers,
    FiAward,
    FiClock,
    FiBriefcase,
    FiBook,
    FiDollarSign,
} from "react-icons/fi";
import { pimpinanMenuConfig } from "../config/menuConfig";
import {
    StatCard,
    LineChart,
    PieChart,
    BarChart,
    FilterPanel,
    DashboardSkeleton,
    ErrorAlert,
} from "../components";
import { useDashboardData, useDashboardReference } from "../hooks";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { LulusanData } from "../types";

const APP_KEY = "dashboard-pimpinan";

export default function DashboardLulusanPage() {
    useRequireAuth();

    const [selectedSemesters, setSelectedSemesters] = useState<Set<string>>(new Set());
    const [selectedFakultas, setSelectedFakultas] = useState("");
    const [selectedProdi, setSelectedProdi] = useState("");

    const { fakultas, semester, activeSemesters, getProdiByFakultas } = useDashboardReference();

    useEffect(() => {
        if (activeSemesters.length > 0 && selectedSemesters.size === 0) {
            setSelectedSemesters(new Set(activeSemesters));
        }
    }, [activeSemesters]); // eslint-disable-line react-hooks/exhaustive-deps

    const semesterParam = Array.from(selectedSemesters).join(",");
    const { data, loading, error, refetch } = useDashboardData<LulusanData>(
        ENDPOINTS.DASHBOARD_PIMPINAN.LULUSAN,
        {
            semester: semesterParam,
            ...(selectedFakultas && { fakultas: selectedFakultas }),
            ...(selectedProdi && { prodi: selectedProdi }),
        }
    );

    const handleFakultasChange = (value: string) => {
        setSelectedFakultas(value);
        setSelectedProdi("");
    };

    const handleReset = () => {
        setSelectedSemesters(new Set(activeSemesters));
        setSelectedFakultas("");
        setSelectedProdi("");
    };

    return (
        <DashboardLayoutWithDynamicMenu
            appName="Dashboard Pimpinan"
            appIcon={<FiAward className="w-6 h-6" />}
            appKey={APP_KEY}
            fallbackMenus={pimpinanMenuConfig}
        >
            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FiAward className="w-8 h-8 text-purple-600" />
                        Dashboard Lulusan & Alumni
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Statistik kelulusan, prestasi akademik, dan penelusuran alumni (Tracer Study)
                    </p>
                </div>

                {/* Filter */}
                <FilterPanel
                    semester={semester}
                    selectedSemesters={selectedSemesters}
                    onSemesterChange={setSelectedSemesters}
                    fakultas={fakultas}
                    selectedFakultas={selectedFakultas}
                    onFakultasChange={handleFakultasChange}
                    prodi={selectedFakultas ? getProdiByFakultas(selectedFakultas) : []}
                    selectedProdi={selectedProdi}
                    onProdiChange={setSelectedProdi}
                    showProdi={true}
                    onReset={handleReset}
                />

                {loading && <DashboardSkeleton />}
                {error && <ErrorAlert message={error} onRetry={refetch} />}

                {data && (
                    <>
                        {/* Stats — 4 metric konsisten dengan dashboard lain */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                title="Total Lulusan"
                                value={data.stats.totalLulusan.total}
                                icon={<FiUsers className="w-6 h-6 text-white" />}
                                color="blue"
                                trend={{ value: data.stats.totalLulusan.trend ?? 0, label: "YoY" }}
                            />
                            <StatCard
                                title="Lulus Tepat Waktu"
                                value={data.stats.tepatWaktu.total}
                                icon={<FiClock className="w-6 h-6 text-white" />}
                                color="green"
                                trend={{ value: data.stats.tepatWaktu.trend ?? 0, label: "YoY" }}
                            />
                            <StatCard
                                title="Rata-rata IPK"
                                value={data.stats.rataIPK.total}
                                icon={<FiBook className="w-6 h-6 text-white" />}
                                color="purple"
                                trend={{ value: data.stats.rataIPK.trend ?? 0, label: "YoY" }}
                            />
                            <StatCard
                                title="Bekerja Sesuai Bidang"
                                value={(() => {
                                    const sesuai = (data.kesesuaianBidang || []).find((k) =>
                                        /sesuai|sangat sesuai/i.test(k.name || "")
                                    );
                                    return sesuai?.value ?? 0;
                                })()}
                                subtitle="Tracer Study"
                                icon={<FiBriefcase className="w-6 h-6 text-white" />}
                                color="cyan"
                            />
                        </div>

                        {/* Row 1: Trend Lulusan & Ketepatan Waktu */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="bg-white dark:bg-gray-800 shadow-md">
                                <CardHeader>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Trend Jumlah Lulusan
                                        </h2>
                                        <p className="text-sm text-gray-500">Jumlah lulusan per tahun</p>
                                    </div>
                                </CardHeader>
                                <Divider />
                                <CardBody>
                                    <LineChart
                                        data={data.trendKelulusan}
                                        height={300}
                                        color="#8b5cf6"
                                    />
                                </CardBody>
                            </Card>

                            <Card className="bg-white dark:bg-gray-800 shadow-md">
                                <CardHeader>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Ketepatan Waktu Studi
                                        </h2>
                                        <p className="text-sm text-gray-500">Persentase kelulusan tepat waktu</p>
                                    </div>
                                </CardHeader>
                                <Divider />
                                <CardBody>
                                    <PieChart
                                        data={data.ketepatanWaktu}
                                        donut={true}
                                        height={300}
                                        colors={["#10b981", "#ef4444"]}
                                    />
                                </CardBody>
                            </Card>
                        </div>

                        {/* Row 2: IPK Lulusan & Lulusan per Jenjang */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="bg-white dark:bg-gray-800 shadow-md">
                                <CardHeader>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Distribusi IPK Lulusan
                                        </h2>
                                        <p className="text-sm text-gray-500">Sebaran nilai IPK Lulusan</p>
                                    </div>
                                </CardHeader>
                                <Divider />
                                <CardBody>
                                    <BarChart
                                        data={data.ipkLulusan}
                                        height={300}
                                        colors={["#3b82f6"]}
                                        xAxisLabel="Jumlah Lulusan"
                                    />
                                </CardBody>
                            </Card>

                            <Card className="bg-white dark:bg-gray-800 shadow-md">
                                <CardHeader>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Lulusan per Jenjang Pendidikan
                                        </h2>
                                        <p className="text-sm text-gray-500">Distribusi lulusan berdasarkan jenjang</p>
                                    </div>
                                </CardHeader>
                                <Divider />
                                <CardBody>
                                    {data.lulusanPerJenjang && data.lulusanPerJenjang.length > 0 ? (
                                        <PieChart
                                            data={data.lulusanPerJenjang}
                                            height={300}
                                            colors={["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"]}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                                            Data tidak tersedia
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </div>

                        {/* Row 3: Lulusan per Fakultas (full width) */}
                        <Card className="bg-white dark:bg-gray-800 shadow-md">
                            <CardHeader>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Lulusan per Fakultas
                                    </h2>
                                    <p className="text-sm text-gray-500">Jumlah lulusan berdasarkan fakultas</p>
                                </div>
                            </CardHeader>
                            <Divider />
                            <CardBody>
                                {data.lulusanPerFakultas && data.lulusanPerFakultas.length > 0 ? (
                                    <BarChart
                                        data={data.lulusanPerFakultas}
                                        horizontal={true}
                                        height={400}
                                        colors={["#8b5cf6"]}
                                        xAxisLabel="Jumlah Lulusan"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-[400px] text-gray-400 text-sm">
                                        Data tidak tersedia
                                    </div>
                                )}
                            </CardBody>
                        </Card>

                        {/* Tracer Study Section Divider */}
                        <div className="flex items-center gap-3 pt-4">
                            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                                <FiBriefcase className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tracer Study</h2>
                                <p className="text-sm text-gray-500">Penelusuran alumni pasca kelulusan</p>
                            </div>
                        </div>

                        {/* Row 4: Status Alumni & Kesesuaian Bidang Kerja */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="bg-white dark:bg-gray-800 shadow-md">
                                <CardHeader>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Status Alumni
                                        </h2>
                                        <p className="text-sm text-gray-500">Status pekerjaan alumni pasca lulus</p>
                                    </div>
                                </CardHeader>
                                <Divider />
                                <CardBody>
                                    {data.tracerStudyStatus && data.tracerStudyStatus.length > 0 ? (
                                        <PieChart
                                            data={data.tracerStudyStatus}
                                            donut={true}
                                            height={300}
                                            colors={["#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#6b7280"]}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                                            Data tracer study belum tersedia
                                        </div>
                                    )}
                                </CardBody>
                            </Card>

                            <Card className="bg-white dark:bg-gray-800 shadow-md">
                                <CardHeader>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Kesesuaian Bidang Kerja
                                        </h2>
                                        <p className="text-sm text-gray-500">Relevansi pekerjaan dengan bidang studi</p>
                                    </div>
                                </CardHeader>
                                <Divider />
                                <CardBody>
                                    {data.kesesuaianBidang && data.kesesuaianBidang.length > 0 ? (
                                        <PieChart
                                            data={data.kesesuaianBidang}
                                            donut={true}
                                            height={300}
                                            colors={["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6b7280"]}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                                            Data tracer study belum tersedia
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </div>

                        {/* Row 5: Masa Tunggu Kerja & Distribusi Penghasilan */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="bg-white dark:bg-gray-800 shadow-md">
                                <CardHeader>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Masa Tunggu Kerja
                                        </h2>
                                        <p className="text-sm text-gray-500">Waktu tunggu lulusan hingga mendapat pekerjaan</p>
                                    </div>
                                </CardHeader>
                                <Divider />
                                <CardBody>
                                    {data.masaTungguKerja && data.masaTungguKerja.length > 0 ? (
                                        <BarChart
                                            data={data.masaTungguKerja}
                                            height={300}
                                            colors={["#ec4899"]}
                                            xAxisLabel="Jumlah Alumni"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                                            Data tracer study belum tersedia
                                        </div>
                                    )}
                                </CardBody>
                            </Card>

                            <Card className="bg-white dark:bg-gray-800 shadow-md">
                                <CardHeader>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Distribusi Penghasilan
                                        </h2>
                                        <p className="text-sm text-gray-500">Sebaran penghasilan bulanan alumni</p>
                                    </div>
                                </CardHeader>
                                <Divider />
                                <CardBody>
                                    {data.incomeDistribusi && data.incomeDistribusi.length > 0 ? (
                                        <BarChart
                                            data={data.incomeDistribusi}
                                            height={300}
                                            colors={["#f59e0b"]}
                                            xAxisLabel="Jumlah Alumni"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
                                            Data tracer study belum tersedia
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </div>
                    </>
                )}

            </div>
        </DashboardLayoutWithDynamicMenu>
    );
}
