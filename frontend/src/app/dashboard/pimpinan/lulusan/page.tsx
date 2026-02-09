"use client";

import React, { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
    FiUsers,
    FiAward,
    FiTrendingUp,
    FiClock,
    FiBriefcase,
    FiBook,
} from "react-icons/fi";
import { pimpinanMenuConfig } from "../config/menuConfig";
import {
    StatCard,
    LineChart,
    PieChart,
    BarChart,
    FilterPanel,
} from "../components";

const APP_KEY = "dashboard-pimpinan";

// DUMMY DATA
const summaryStats = {
    totalLulusan: { total: 6450, trend: 3.2 },
    tepatWaktu: { total: "78%", trend: 1.5 },
    rataIPK: { total: "3.54", trend: 0.02 },
    masaTunggu: { total: "3.5 Bln", trend: -0.2 },
};

const trendKelulusan = [
    { name: "2020", value: 5800 },
    { name: "2021", value: 6100 },
    { name: "2022", value: 6250 },
    { name: "2023", value: 6380 },
    { name: "2024", value: 6450 },
];

const ketepatanWaktu = [
    { name: "Tepat Waktu (< 4 Thn)", value: 4500 },
    { name: "Terlambat (> 4 Thn)", value: 1950 },
];

const tracerStudyStatus = [
    { name: "Bekerja", value: 3200 },
    { name: "Wirausaha", value: 850 },
    { name: "Lanjut Studi", value: 1200 },
    { name: "Mencari Kerja", value: 950 },
    { name: "Belum Memutuskan", value: 250 },
];

const ipkLulusan = [
    { name: "3.51 - 4.00", value: 3500 },
    { name: "3.01 - 3.50", value: 2100 },
    { name: "2.51 - 3.00", value: 750 },
    { name: "< 2.50", value: 100 },
];

const masaTungguKerja = [
    { name: "< 3 Bulan", value: 2450 },
    { name: "3 - 6 Bulan", value: 1850 },
    { name: "6 - 12 Bulan", value: 1200 },
    { name: "> 12 Bulan", value: 950 },
];

export default function DashboardLulusanPage() {
    useRequireAuth();

    const [selectedTahun, setSelectedTahun] = useState("2024");
    const [selectedFakultas, setSelectedFakultas] = useState("");

    const handleReset = () => {
        setSelectedTahun("2024");
        setSelectedFakultas("");
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
                    tahunAjaran={[{ key: "2024", label: "2024" }, { key: "2023", label: "2023" }]}
                    selectedTahun={selectedTahun}
                    onTahunChange={setSelectedTahun}
                    fakultas={[{ key: "all", label: "Semua Fakultas" }]}
                    selectedFakultas={selectedFakultas}
                    onFakultasChange={setSelectedFakultas}
                    showProdi={false}
                    onReset={handleReset}
                />

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Lulusan"
                        value={summaryStats.totalLulusan.total}
                        icon={<FiUsers className="w-6 h-6 text-white" />}
                        color="blue"
                        trend={{ value: summaryStats.totalLulusan.trend, label: "YoY" }}
                    />
                    <StatCard
                        title="Lulus Tepat Waktu"
                        value={summaryStats.tepatWaktu.total}
                        icon={<FiClock className="w-6 h-6 text-white" />}
                        color="green"
                        trend={{ value: summaryStats.tepatWaktu.trend, label: "YoY" }}
                    />
                    <StatCard
                        title="Rata-rata IPK"
                        value={summaryStats.rataIPK.total}
                        icon={<FiBook className="w-6 h-6 text-white" />}
                        color="purple"
                        trend={{ value: summaryStats.rataIPK.trend, label: "YoY" }}
                    />
                    <StatCard
                        title="Masa Tunggu Kerja"
                        value={summaryStats.masaTunggu.total}
                        icon={<FiBriefcase className="w-6 h-6 text-white" />}
                        color="yellow"
                        trend={{ value: summaryStats.masaTunggu.trend, label: "YoY" }}
                    />
                </div>

                {/* Row 1: Trend & Ketepatan Waktu */}
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
                                data={trendKelulusan}
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
                                data={ketepatanWaktu}
                                donut={true}
                                height={300}
                                colors={["#10b981", "#ef4444"]}
                            />
                        </CardBody>
                    </Card>
                </div>

                {/* Row 2: IPK & Tracer Study */}
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
                                data={ipkLulusan}
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
                                    Status Alumni (Tracer Study)
                                </h2>
                                <p className="text-sm text-gray-500">Status pekerjaan 6 bulan pasca lulus</p>
                            </div>
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <BarChart
                                data={tracerStudyStatus}
                                horizontal={true}
                                height={300}
                                colors={["#f59e0b"]}
                                xAxisLabel="Jumlah Alumni"
                            />
                        </CardBody>
                    </Card>
                </div>

                {/* Row 3: Masa Tunggu */}
                <Card className="bg-white dark:bg-gray-800 shadow-md">
                    <CardHeader>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Masa Tunggu Mendapat Pekerjaan
                            </h2>
                            <p className="text-sm text-gray-500">Waktu tunggu lulusan hingga mendapatkan pekerjaan pertama</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <BarChart
                            data={masaTungguKerja}
                            height={300}
                            colors={["#ec4899"]}
                            xAxisLabel="Jumlah Alumni"
                        />
                    </CardBody>
                </Card>

            </div>
        </DashboardLayoutWithDynamicMenu>
    );
}
