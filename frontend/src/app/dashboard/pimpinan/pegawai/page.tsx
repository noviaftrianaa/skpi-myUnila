"use client";

import React, { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
  FiUsers,
  FiUserCheck,
  FiUserMinus,
  FiBriefcase,
  FiTrendingUp,
  FiAward,
} from "react-icons/fi";
import { pimpinanMenuConfig } from "../config/menuConfig";
import {
  StatCard,
  LineChart,
  PieChart,
  BarChart,
  PyramidChart,
  FilterPanel,
} from "../components";

const APP_KEY = "dashboard-pimpinan";

// ============================================
// DUMMY DATA
// ============================================

const summaryStats = {
  total: { total: 1145, trend: 2.4 },
  pns: { total: 542, trend: 0.5 },
  nonPns: { total: 603, trend: 4.8 },
  pensiun: { total: 15, trend: -10 },
};

const statusKepegawaian = [
  { name: "PNS", value: 542 },
  { name: "PPPK", value: 125 },
  { name: "Tetap Non-PNS", value: 245 },
  { name: "Kontrak/Honorer", value: 233 },
];

const distribusiPangkat = [
  { name: "IV/e", value: 45 },
  { name: "IV/d", value: 68 },
  { name: "IV/c", value: 120 },
  { name: "IV/b", value: 156 },
  { name: "IV/a", value: 85 },
  { name: "III/d", value: 210 },
  { name: "III/c", value: 180 },
  { name: "III/b", value: 145 },
  { name: "III/a", value: 95 },
  { name: "II/d", value: 41 },
];

// Simplified Unit Kerja (Fakultas + Pusat)
const sebaranUnitKerja = [
  { name: "Rektorat", value: 245 },
  { name: "FKIP", value: 180 },
  { name: "FEB", value: 120 },
  { name: "FT", value: 115 },
  { name: "FP", value: 110 },
  { name: "FMIPA", value: 95 },
  { name: "FISIP", value: 90 },
  { name: "FH", value: 85 },
  { name: "FK", value: 105 },
];

const pendidikanData = [
  { name: "S3", value: 45 },
  { name: "S2", value: 180 },
  { name: "S1", value: 450 },
  { name: "D3", value: 120 },
  { name: "SMA/SMK", value: 350 },
];

const trendRekrutmen = [
  { name: "2020", value: 45 },
  { name: "2021", value: 52 },
  { name: "2022", value: 38 },
  { name: "2023", value: 85 }, // Maybe mass hiring PPPK
  { name: "2024", value: 64 },
];

const usiaGenderData = [
  { ageGroup: "20-29", male: 45, female: 55 },
  { ageGroup: "30-39", male: 120, female: 135 },
  { ageGroup: "40-49", male: 150, female: 140 },
  { ageGroup: "50-59", male: 110, female: 95 },
  { ageGroup: "> 60", male: 25, female: 15 },
];

// Options
const tahunAjaranOptions = [
  { key: "2024", label: "2024" },
  { key: "2023", label: "2023" },
];

const unitKerjaOptions = [
  { key: "all", label: "Semua Unit" },
  { key: "rektorat", label: "Rektorat" },
  { key: "fkip", label: "FKIP" },
  { key: "ft", label: "FT" },
  // ... others
];

export default function DashboardPegawaiPage() {
  useRequireAuth();

  const [selectedTahun, setSelectedTahun] = useState("2024");
  const [selectedUnit, setSelectedUnit] = useState("");

  const handleReset = () => {
    setSelectedTahun("2024");
    setSelectedUnit("");
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
            <FiBriefcase className="w-8 h-8 text-blue-600" />
            Dashboard Pegawai (Tendik)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Data statistik kepegawaian dan tenaga kependidikan
          </p>
        </div>

        {/* Filter */}
        <FilterPanel
          tahunAjaran={tahunAjaranOptions}
          selectedTahun={selectedTahun}
          onTahunChange={setSelectedTahun}
          fakultas={unitKerjaOptions} // Reusing prop name for unit kerja
          selectedFakultas={selectedUnit}
          onFakultasChange={setSelectedUnit}
          showProdi={false}
          onReset={handleReset}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Tendik"
            value={summaryStats.total.total}
            icon={<FiUsers className="w-6 h-6 text-white" />}
            color="blue"
            trend={{ value: summaryStats.total.trend, label: "YoY" }}
          />
          <StatCard
            title="PNS"
            value={summaryStats.pns.total}
            icon={<FiUserCheck className="w-6 h-6 text-white" />}
            color="green"
            trend={{ value: summaryStats.pns.trend, label: "YoY" }}
          />
          <StatCard
            title="Non-PNS"
            value={summaryStats.nonPns.total}
            icon={<FiBriefcase className="w-6 h-6 text-white" />}
            color="purple"
            trend={{ value: summaryStats.nonPns.trend, label: "YoY" }}
          />
          <StatCard
            title="Pensiun (2024)"
            value={summaryStats.pensiun.total}
            icon={<FiUserMinus className="w-6 h-6 text-white" />}
            color="red"
            trend={{ value: summaryStats.pensiun.trend, label: "vs 2023" }}
          />
        </div>

        {/* Row 1: Status & Pangkat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Kepegawaian */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Status Kepegawaian
                </h2>
                <p className="text-sm text-gray-500">
                  Proporsi PNS, PPPK, dan Non-PNS
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <PieChart
                data={statusKepegawaian}
                donut={true}
                showLegend={true}
                height={300}
                colors={["#10b981", "#3b82f6", "#f59e0b", "#6b7280"]}
              />
            </CardBody>
          </Card>

          {/* Distribusi Pangkat - Horizontal Bar */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Distribusi Pangkat/Golongan
                </h2>
                <p className="text-sm text-gray-500">
                  Jumlah pegawai berdasarkan golongan ruang
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={distribusiPangkat}
                horizontal={true}
                height={300}
                colors={["#8b5cf6"]}
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 2: Unit Kerja & Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sebaran Unit Kerja */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sebaran per Unit Kerja
                </h2>
                <p className="text-sm text-gray-500">Top 10 unit dengan pegawai terbanyak</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={sebaranUnitKerja}
                height={300}
                colors={["#3b82f6"]}
                vertical={true}
              />
            </CardBody>
          </Card>

          {/* Trend Rekrutmen */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Trend Rekrutmen
                </h2>
                <p className="text-sm text-gray-500">Jumlah pegawai baru 5 tahun terakhir</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <LineChart
                data={trendRekrutmen}
                height={300}
                showArea={true}
                color="#06b6d4"
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 3: Demografi (Pyramid & Pendidikan) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pyramid Usia & Gender */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Demografi Usia & Gender
                </h2>
                <p className="text-sm text-gray-500">Distribusi pegawai laki-laki vs perempuan per kelompok usia</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <PyramidChart
                data={usiaGenderData}
                height={350}
              />
            </CardBody>
          </Card>

          {/* Pendidikan Terakhir */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pendidikan Terakhir
                </h2>
                <p className="text-sm text-gray-500">Tingkat pendidikan pegawai</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <PieChart
                data={pendidikanData}
                donut={false}
                showLegend={true}
                height={350}
                colors={["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4"]}
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 4: Masa Kerja */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Distribusi Masa Kerja
                </h2>
                <p className="text-sm text-gray-500">Jumlah pegawai berdasarkan rentang masa kerja</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={[
                  { name: "< 5 Tahun", value: 320 },
                  { name: "5-10 Tahun", value: 280 },
                  { name: "11-20 Tahun", value: 350 },
                  { name: "21-30 Tahun", value: 150 },
                  { name: "> 30 Tahun", value: 45 },
                ]}
                height={300}
                colors={["#f59e0b"]}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
