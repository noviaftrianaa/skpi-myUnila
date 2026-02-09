"use client";

import React, { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
  FiBook,
  FiFileText,
  FiGlobe,
  FiAward,
  FiTrendingUp,
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
  total: { total: 3450, trend: 10.5 },
  jurnalInter: { total: 1250, trend: 15.2 },
  jurnalNas: { total: 1540, trend: 5.8 },
  hki: { total: 320, trend: 20.1 },
  buku: { total: 140, trend: 2.5 },
};

const trendPublikasiYearly = [
  { name: "2020", value: 450 },
  { name: "2021", value: 520 },
  { name: "2022", value: 680 },
  { name: "2023", value: 850 },
  { name: "2024", value: 950 },
];

const jenisPublikasi = [
  { name: "Jurnal Internasional", value: 1250 },
  { name: "Jurnal Nasional", value: 1540 },
  { name: "Prosiding", value: 450 },
  { name: "Buku", value: 140 },
  { name: "HKI/Paten", value: 320 },
];

const indexScopus = [
  { name: "Q1", value: 120, category: "Quartile" },
  { name: "Q2", value: 240, category: "Quartile" },
  { name: "Q3", value: 350, category: "Quartile" },
  { name: "Q4", value: 180, category: "Quartile" },
  { name: "No Q", value: 360, category: "Quartile" },
];

const topAuthors = [
  { name: "Prof. Dr. Ir. Wan Abbas Zakaria", value: 45 },
  { name: "Prof. Dr. Karomani", value: 38 },
  { name: "Dr. Eng. Admi Syarif", value: 35 },
  { name: "Prof. Dr. Suharno", value: 32 },
  { name: "Dr. Nairobi", value: 28 },
];

export default function DashboardPublikasiPage() {
  useRequireAuth();

  const [selectedTahun, setSelectedTahun] = useState("2024");

  const handleReset = () => {
    setSelectedTahun("2024");
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiBook className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiBook className="w-8 h-8 text-indigo-600" />
            Dashboard Publikasi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Indikator kinerja publikasi ilmiah dosen
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Publikasi"
            value={summaryStats.total.total}
            icon={<FiBook className="w-6 h-6 text-white" />}
            color="indigo"
            trend={{ value: summaryStats.total.trend, label: "YoY" }}
          />
          <StatCard
            title="Jurnal Internasional"
            value={summaryStats.jurnalInter.total}
            icon={<FiGlobe className="w-6 h-6 text-white" />}
            color="blue"
            trend={{ value: summaryStats.jurnalInter.trend, label: "YoY" }}
          />
          <StatCard
            title="Jurnal Nasional"
            value={summaryStats.jurnalNas.total}
            icon={<FiFileText className="w-6 h-6 text-white" />}
            color="green"
            trend={{ value: summaryStats.jurnalNas.trend, label: "YoY" }}
          />
          <StatCard
            title="HKI / Paten"
            value={summaryStats.hki.total}
            icon={<FiAward className="w-6 h-6 text-white" />}
            color="yellow"
            trend={{ value: summaryStats.hki.trend, label: "YoY" }}
          />
          <StatCard
            title="Buku / Monograf"
            value={summaryStats.buku.total}
            icon={<FiBook className="w-6 h-6 text-white" />}
            color="cyan"
            trend={{ value: summaryStats.buku.trend, label: "YoY" }}
          />
        </div>

        {/* Row 1: Trend & Jenis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Publikasi */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pertumbuhan Publikasi
                </h2>
                <p className="text-sm text-gray-500">Jumlah dokumen publikasi 5 tahun terakhir</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <LineChart
                data={trendPublikasiYearly}
                height={300}
                showArea={true}
                color="#6366f1"
              />
            </CardBody>
          </Card>

          {/* Jenis Publikasi */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Jenis Publikasi
                </h2>
                <p className="text-sm text-gray-500">Proporsi jenis luaran</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <PieChart
                data={jenisPublikasi}
                donut={true}
                height={300}
                colors={["#3b82f6", "#10b981", "#f97316", "#ef4444", "#f59e0b"]}
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 2: Scopus & Top Authors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scopus Quartile */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Kualitas Publikasi (Scopus)
                </h2>
                <p className="text-sm text-gray-500">Distribusi Quartile jurnal terindeks Scopus</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={indexScopus}
                height={300}
                colors={["#ec4899"]}
              />
            </CardBody>
          </Card>

          {/* Top Authors */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top 5 Dosen Produktif (2024)
                </h2>
                <p className="text-sm text-gray-500">Berdasarkan jumlah publikasi tahun ini</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={topAuthors}
                height={300}
                horizontal={true}
                colors={["#10b981"]}
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 3: Sitasi & Sebaran Fakultas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tren Sitasi */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tren Sitasi (Scopus & Google Scholar)
                </h2>
                <p className="text-sm text-gray-500">Jumlah sitasi per tahun</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <LineChart
                data={[
                  { name: "2020", value: 1200 },
                  { name: "2021", value: 1540 },
                  { name: "2022", value: 1980 },
                  { name: "2023", value: 2450 },
                  { name: "2024", value: 3100 },
                ]}
                height={300}
                showArea={true}
                color="#f59e0b"
              />
            </CardBody>
          </Card>

          {/* Sebaran Fakultas */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Publikasi per Fakultas
                </h2>
                <p className="text-sm text-gray-500">Kontribusi publikasi ilmiah</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={[
                  { name: "FMIPA", value: 245 },
                  { name: "FT", value: 210 },
                  { name: "FP", value: 180 },
                  { name: "FKIP", value: 155 },
                  { name: "FK", value: 120 },
                  { name: "FEB", value: 95 },
                  { name: "FISIP", value: 85 },
                  { name: "FH", value: 65 },
                ]}
                height={300}
                colors={["#3b82f6"]}
              />
            </CardBody>
          </Card>
        </div>

      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
