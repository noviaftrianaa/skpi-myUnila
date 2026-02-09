"use client";

import React, { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
  FiAward,
  FiGlobe,
  FiMapPin,
  FiTrendingUp,
  FiBook,
  FiStar,
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
  total: { total: 425, trend: 15.2 },
  nasional: { total: 280, trend: 12.8 },
  internasional: { total: 48, trend: 25.4 },
  publikasi: { total: 1250, trend: 8.5 },
};

const trendPrestasi = [
  { name: "2020", value: 180 },
  { name: "2021", value: 245 },
  { name: "2022", value: 320 },
  { name: "2023", value: 380 },
  { name: "2024", value: 425 },
];

const prestasiPerTingkat = [
  { name: "2022", value: 120, category: "Lokal" },
  { name: "2022", value: 160, category: "Nasional" },
  { name: "2022", value: 40, category: "Internasional" },
  { name: "2023", value: 130, category: "Lokal" },
  { name: "2023", value: 210, category: "Nasional" },
  { name: "2023", value: 40, category: "Internasional" },
  { name: "2024", value: 110, category: "Lokal" },
  { name: "2024", value: 267, category: "Nasional" },
  { name: "2024", value: 48, category: "Internasional" },
];

const jenisPrestasi = [
  { name: "Akademik/Ilmiah", value: 185 },
  { name: "Olahraga", value: 120 },
  { name: "Seni & Budaya", value: 65 },
  { name: "Teknologi & Inovasi", value: 55 },
];

const topProdiPrestasi = [
  { name: "Pend. Dokter", value: 45 },
  { name: "Ilmu Hukum", value: 38 },
  { name: "Manajemen", value: 35 },
  { name: "Pend. B. Inggris", value: 32 },
  { name: "Teknik Sipil", value: 28 },
  { name: "Akuntansi", value: 25 },
  { name: "Ilmu Komunikasi", value: 24 },
  { name: "Teknik Elektro", value: 22 },
  { name: "Agribisnis", value: 20 },
  { name: "Biologi", value: 18 },
];

const trendPublikasi = [
  { name: "2020", value: 850 },
  { name: "2021", value: 920 },
  { name: "2022", value: 1050 },
  { name: "2023", value: 1150 },
  { name: "2024", value: 1250 },
];

const jenisPublikasi = [
  { name: "Jurnal Internasional", value: 450 },
  { name: "Jurnal Nasional", value: 580 },
  { name: "Prosiding", value: 180 },
  { name: "Buku/Monograf", value: 40 },
];

const hkiPerFakultas = [
  { name: "FT", value: 45 },
  { name: "FMIPA", value: 38 },
  { name: "FP", value: 35 },
  { name: "FKIP", value: 25 },
  { name: "FK", value: 20 },
  { name: "Fisip", value: 15 },
  { name: "FEB", value: 12 },
  { name: "FH", value: 8 },
];

export default function DashboardPrestasiPage() {
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
            <FiAward className="w-8 h-8 text-yellow-500" />
            Dashboard Prestasi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Capaian prestasi mahasiswa dan publikasi ilmiah
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Prestasi"
            value={summaryStats.total.total}
            icon={<FiAward className="w-6 h-6 text-white" />}
            color="yellow"
            trend={{ value: summaryStats.total.trend, label: "YoY" }}
          />
          <StatCard
            title="Nasional"
            value={summaryStats.nasional.total}
            icon={<FiMapPin className="w-6 h-6 text-white" />}
            color="blue"
            trend={{ value: summaryStats.nasional.trend, label: "YoY" }}
          />
          <StatCard
            title="Internasional"
            value={summaryStats.internasional.total}
            icon={<FiGlobe className="w-6 h-6 text-white" />}
            color="purple"
            trend={{ value: summaryStats.internasional.trend, label: "YoY" }}
          />
          <StatCard
            title="Publikasi Ilmiah"
            value={summaryStats.publikasi.total}
            icon={<FiBook className="w-6 h-6 text-white" />}
            color="green"
            trend={{ value: summaryStats.publikasi.trend, label: "YoY" }}
          />
        </div>

        {/* Row 1: Trend & Sebaran Tingkat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Prestasi */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Trend Prestasi Mahasiswa
                </h2>
                <p className="text-sm text-gray-500">Jumlah prestasi 5 tahun terakhir</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <LineChart
                data={trendPrestasi}
                height={300}
                showArea={true}
                color="#eab308"
              />
            </CardBody>
          </Card>

          {/* Prestasi per Tingkat (Stacked) */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Prestasi per Tingkat
                </h2>
                <p className="text-sm text-gray-500">Komposisi tingkat prestasi per tahun</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={prestasiPerTingkat}
                stacked={true}
                height={300}
                colors={["#94a3b8", "#3b82f6", "#a855f7"]} // Lokal (Gray), Nas (Blue), Inter (Purple)
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 2: Jenis & Top Prodi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Jenis Prestasi */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Jenis Bidang Prestasi
                </h2>
                <p className="text-sm text-gray-500">Kategori bidang prestasi</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <PieChart
                data={jenisPrestasi}
                donut={true}
                height={300}
                colors={["#f59e0b", "#ef4444", "#10b981", "#3b82f6"]}
              />
            </CardBody>
          </Card>

          {/* Top 10 Prodi */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top 10 Prodi Berprestasi
                </h2>
                <p className="text-sm text-gray-500">Program studi dengan prestasi terbanyak</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={topProdiPrestasi}
                height={300}
                horizontal={true}
                colors={["#f59e0b"]}
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 2.5: Fakultas & Dosen/Mhs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sebaran Fakultas */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sebaran Prestasi per Fakultas
                </h2>
                <p className="text-sm text-gray-500">Kontribusi prestasi per fakultas</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={[
                  { name: "FKIP", value: 85 },
                  { name: "FMIPA", value: 72 },
                  { name: "FT", value: 65 },
                  { name: "FP", value: 60 },
                  { name: "FEB", value: 55 },
                  { name: "FK", value: 35 },
                  { name: "FISIP", value: 30 },
                  { name: "FH", value: 23 },
                ]}
                height={300}
                colors={["#10b981"]}
              />
            </CardBody>
          </Card>

          {/* Dosen vs Mahasiswa */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Prestasi Mahasiswa vs Dosen
                </h2>
                <p className="text-sm text-gray-500">Perbandingan jumlah prestasi</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <PieChart
                data={[
                  { name: "Mahasiswa", value: 320 },
                  { name: "Dosen", value: 105 },
                ]}
                donut={true}
                height={300}
                colors={["#3b82f6", "#f97316"]}
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 3: Publikasi Section */}
        <div className="mt-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <FiBook className="w-6 h-6" /> Publikasi & HKI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Trend Publikasi */}
            <Card className="bg-white dark:bg-gray-800 shadow-md">
              <CardHeader className="pb-0">
                <h3 className="font-semibold">Trend Publikasi</h3>
              </CardHeader>
              <CardBody>
                <LineChart data={trendPublikasi} height={250} color="#10b981" />
              </CardBody>
            </Card>

            {/* Jenis Publikasi */}
            <Card className="bg-white dark:bg-gray-800 shadow-md">
              <CardHeader className="pb-0">
                <h3 className="font-semibold">Jenis Publikasi</h3>
              </CardHeader>
              <CardBody>
                <PieChart data={jenisPublikasi} height={250} donut={true} showLegend={false} />
              </CardBody>
            </Card>

            {/* HKI per Fakultas */}
            <Card className="bg-white dark:bg-gray-800 shadow-md">
              <CardHeader className="pb-0">
                <h3 className="font-semibold">HKI/Paten per Fakultas</h3>
              </CardHeader>
              <CardBody>
                <BarChart data={hkiPerFakultas} height={250} colors={["#8b5cf6"]} />
              </CardBody>
            </Card>
          </div>
        </div>

      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
