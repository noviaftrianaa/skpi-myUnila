"use client";

import React, { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
    FiUsers,
    FiFileText,
    FiGlobe,
    FiGlobe,
    FiBriefcase,
} from "react-icons/fi"; // Check if FiHandshake exists, if not use FiUsers or similar
import { pimpinanMenuConfig } from "../config/menuConfig";
import {
    StatCard,
    PieChart,
    BarChart,
    LineChart,
    FilterPanel,
} from "../components";

const APP_KEY = "dashboard-pimpinan";

// DUMMY DATA
const summaryStats = {
    totalMitra: { total: 450, trend: 15 },
    mouAktif: { total: 320, trend: 8 },
    moaAktif: { total: 210, trend: 12 },
    iaAktif: { total: 540, trend: 20 }, // Implementation Arrangement
};

const mitraByScope = [
    { name: "Nasional", value: 350 },
    { name: "Internasional", value: 80 },
    { name: "Regional / Lokal", value: 20 },
];

const mitraByType = [
    { name: "Perguruan Tinggi", value: 150 },
    { name: "Dunia Usaha/Industri (DUDI)", value: 200 },
    { name: "Pemerintah", value: 80 },
    { name: "LSM / NGO", value: 20 },
];

const trenKerjasama = [
    { name: "2020", value: 120 },
    { name: "2021", value: 150 },
    { name: "2022", value: 200 },
    { name: "2023", value: 350 },
    { name: "2024", value: 450 },
];

export default function DashboardKerjasamaPage() {
    useRequireAuth();

    const [selectedTahun, setSelectedTahun] = useState("2024");
    const [selectedStatus, setSelectedStatus] = useState("");

    const handleReset = () => {
        setSelectedTahun("2024");
        setSelectedStatus("");
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
                    tahunAjaran={[{ key: "2024", label: "2024" }, { key: "2023", label: "2023" }]}
                    selectedTahun={selectedTahun}
                    onTahunChange={setSelectedTahun}
                    onReset={handleReset}
                />

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Mitra"
                        value={summaryStats.totalMitra.total}
                        icon={<FiUsers className="w-6 h-6 text-white" />}
                        color="indigo"
                        trend={{ value: summaryStats.totalMitra.trend, label: "YoY" }}
                    />
                    <StatCard
                        title="MoU Aktif"
                        value={summaryStats.mouAktif.total}
                        icon={<FiFileText className="w-6 h-6 text-white" />}
                        color="green"
                        trend={{ value: summaryStats.mouAktif.trend, label: "YoY" }}
                    />
                    <StatCard
                        title="MoA Aktif"
                        value={summaryStats.moaAktif.total}
                        icon={<FiFileText className="w-6 h-6 text-white" />}
                        color="blue"
                        trend={{ value: summaryStats.moaAktif.trend, label: "YoY" }}
                    />
                    <StatCard
                        title="Impl. Agreement (IA)"
                        value={summaryStats.iaAktif.total}
                        icon={<FiBriefcase className="w-6 h-6 text-white" />}
                        color="purple"
                        trend={{ value: summaryStats.iaAktif.trend, label: "YoY" }}
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
                                data={mitraByScope}
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
                                data={trenKerjasama}
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
                            data={mitraByType}
                            horizontal={true}
                            height={350}
                            colors={["#ec4899"]}
                            xAxisLabel="Jumlah Mitra"
                        />
                    </CardBody>
                </Card>

            </div>
        </DashboardLayoutWithDynamicMenu>
    );
}
