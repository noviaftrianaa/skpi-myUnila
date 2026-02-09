"use client";

import React, { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
  FiActivity,
  FiBookOpen,
  FiUsers,
  FiDollarSign,
  FiTarget,
  FiLayers,
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

// ============================================
// DUMMY DATA
// ============================================

const summaryStats = {
  penelitian: { total: 450, trend: 12.5 },
  pengabdian: { total: 180, trend: 8.2 },
  totalDana: { total: 15200000000, trend: 5.4 }, // 15.2 M
  publikasiScopus: { total: 320, trend: 15.8 },
};

const trendLitabmas = [
  { name: "2020", value: 320, category: "Penelitian" },
  { name: "2021", value: 350, category: "Penelitian" },
  { name: "2022", value: 410, category: "Penelitian" },
  { name: "2023", value: 450, category: "Penelitian" },
  { name: "2024", value: 480, category: "Penelitian" },

  { name: "2020", value: 120, category: "Pengabdian" },
  { name: "2021", value: 140, category: "Pengabdian" },
  { name: "2022", value: 155, category: "Pengabdian" },
  { name: "2023", value: 165, category: "Pengabdian" },
  { name: "2024", value: 180, category: "Pengabdian" },
];

const sumberDana = [
  { name: "DRTPM / Kemdikbud", value: 6500000000 },
  { name: "Internal PT", value: 4200000000 },
  { name: "Mitra Industri", value: 2500000000 },
  { name: "Mandiri", value: 1500000000 },
  { name: "Internasional", value: 500000000 },
];

const bidangFokus = [
  { name: "Ketahanan Pangan", value: 120 },
  { name: "Kesehatan", value: 95 },
  { name: "Energi Baru", value: 45 },
  { name: "Sosial Humaniora", value: 85 },
  { name: "Pendidikan", value: 110 },
  { name: "Teknologi Informasi", value: 75 },
];

const sebaranFakultas = [
  { name: "FP", value: 85, category: "Penelitian" },
  { name: "FMIPA", value: 78, category: "Penelitian" },
  { name: "FT", value: 72, category: "Penelitian" },
  { name: "FKIP", value: 65, category: "Penelitian" },
  { name: "FK", value: 55, category: "Penelitian" },
  { name: "FEB", value: 45, category: "Penelitian" },
  { name: "FISIP", value: 40, category: "Penelitian" },
  { name: "FH", value: 35, category: "Penelitian" },

  { name: "FP", value: 35, category: "Pengabdian" },
  { name: "FMIPA", value: 25, category: "Pengabdian" },
  { name: "FT", value: 30, category: "Pengabdian" },
  { name: "FKIP", value: 45, category: "Pengabdian" },
  { name: "FK", value: 20, category: "Pengabdian" },
  { name: "FEB", value: 25, category: "Pengabdian" },
  { name: "FISIP", value: 35, category: "Pengabdian" },
  { name: "FH", value: 20, category: "Pengabdian" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
  }).format(value);
};

export default function DashboardLitabmasPage() {
  useRequireAuth();

  const [selectedTahun, setSelectedTahun] = useState("2024");

  const handleReset = () => {
    setSelectedTahun("2024");
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiActivity className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiActivity className="w-8 h-8 text-cyan-600" />
            Dashboard Penelitian & Pengabdian
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitoring kegiatan penelitian dan pengabdian masyarakat (Litabmas)
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
            title="Total Penelitian"
            value={summaryStats.penelitian.total}
            icon={<FiBookOpen className="w-6 h-6 text-white" />}
            color="blue"
            trend={{ value: summaryStats.penelitian.trend, label: "YoY" }}
          />
          <StatCard
            title="Total Pengabdian"
            value={summaryStats.pengabdian.total}
            icon={<FiUsers className="w-6 h-6 text-white" />}
            color="cyan"
            trend={{ value: summaryStats.pengabdian.trend, label: "YoY" }}
          />
          <StatCard
            title="Total Dana"
            value={summaryStats.totalDana.total}
            icon={<FiDollarSign className="w-6 h-6 text-white" />}
            color="green"
            trend={{ value: summaryStats.totalDana.trend, label: "YoY" }}
            valueFormatter={formatCurrency}
          />
          <StatCard
            title="Publikasi Scopus"
            value={summaryStats.publikasiScopus.total}
            icon={<FiTarget className="w-6 h-6 text-white" />}
            color="purple"
            trend={{ value: summaryStats.publikasiScopus.trend, label: "YoY" }}
          />
        </div>

        {/* Row 1: Trend & Sumber Dana */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Litabmas - Stacked Bar (Modified Logic needed for grouped trend, using simple stacked for now) */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Trend Kegiatan Litabmas
                </h2>
                <p className="text-sm text-gray-500">Jumlah judul per tahun</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              {/* Note: Using clustered bar chart logic manually or creating a new chart type if strict req. 
                   Here reusing BarChart with category support we added earlier 
               */}
              <BarChart
                data={trendLitabmas}
                height={300}
                colors={["#3b82f6", "#f97316"]}
              />
            </CardBody>
          </Card>

          {/* Sumber Dana */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sumber Dana Penelitian
                </h2>
                <p className="text-sm text-gray-500">Distribusi sumber pendanaan</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <PieChart
                data={sumberDana}
                donut={false}
                height={300}
                valueFormatter={formatCurrency}
                colors={["#10b981", "#3b82f6", "#f59e0b", "#6b7280", "#8b5cf6"]}
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 2: Sebaran & Fokus */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sebaran per Fakultas (Grouped Bar) */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Kinerja per Fakultas
                </h2>
                <p className="text-sm text-gray-500">Perbandingan jumlah penelitian & pengabdian</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={sebaranFakultas}
                height={320}
                colors={["#3b82f6", "#f97316"]}
              />
            </CardBody>
          </Card>

          {/* Bidang Fokus */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bidang Fokus Riset
                </h2>
                <p className="text-sm text-gray-500">Topik penelitian unggulan</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <PieChart
                data={bidangFokus}
                donut={true}
                height={320}
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 3: Skim Kegiatan */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Distribusi per Skim Kegiatan
                </h2>
                <p className="text-sm text-gray-500">Jumlah usulan berdasarkan skim</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={[
                  { name: "Penelitian Dasar", value: 120 },
                  { name: "Penelitian Terapan", value: 85 },
                  { name: "Penelitian Pengembangan", value: 45 },
                  { name: "Pengabdian Desa Binaan", value: 65 },
                  { name: "Kemitraan Masyarakat", value: 55 }
                ]}
                height={300}
                horizontal={true}
                colors={["#8b5cf6"]}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
