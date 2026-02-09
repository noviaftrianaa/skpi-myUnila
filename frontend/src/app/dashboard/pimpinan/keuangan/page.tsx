"use client";

import React, { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
  FiDollarSign,
  FiBriefcase,
  FiTrendingUp,
  FiCreditCard,
  FiActivity,
  FiPieChart,
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
  pendapatan: { total: 450000000000, trend: 5.2 }, // 450 Milyar
  spp: { total: 320000000000, trend: 4.8 },
  beasiswa: { total: 45000000000, trend: 12.5 },
  operasional: { total: 280000000000, trend: 3.1 },
};

const trendPendapatanSPP = [
  { name: "2020", value: 280000000000 },
  { name: "2021", value: 295000000000 },
  { name: "2022", value: 310000000000 },
  { name: "2023", value: 315000000000 },
  { name: "2024", value: 320000000000 },
];

const pendapatanPerUKT = [
  { name: "K1", value: 500, category: "Mhs" }, // Using simplified numbers for stacked bar example
  { name: "K2", value: 1200, category: "Mhs" },
  { name: "K3", value: 2500, category: "Mhs" },
  { name: "K4", value: 3800, category: "Mhs" },
  { name: "K5", value: 4200, category: "Mhs" },
  { name: "K6", value: 3100, category: "Mhs" },
  { name: "K7", value: 1500, category: "Mhs" },
  { name: "K8", value: 800, category: "Mhs" },
];

const sumberPendapatan = [
  { name: "SPP Mahasiswa", value: 320000000000 },
  { name: "Hibah Penelitian", value: 50000000000 },
  { name: "Kerjasama Mitra", value: 45000000000 },
  { name: "Sewa Aset", value: 15000000000 },
  { name: "Lainnya", value: 20000000000 },
];

// Comparison Target vs Realisasi
const realisasiVsTarget = [
  { name: "Rektorat", value: 95 },
  { name: "FKIP", value: 98 },
  { name: "FEB", value: 102 },
  { name: "FT", value: 90 },
  { name: "FP", value: 94 },
  { name: "FMIPA", value: 96 },
  { name: "FISIP", value: 92 },
  { name: "FH", value: 97 },
  { name: "FK", value: 105 },
];

const breakdownPengeluaran = [
  { name: "Gaji & Tunjangan", value: 150000000000 },
  { name: "Operasional Kantor", value: 45000000000 },
  { name: "Pemeliharaan", value: 30000000000 },
  { name: "Perjalanan Dinas", value: 15000000000 },
  { name: "Barang & Jasa", value: 40000000000 },
];

const trendBiayaOps = [
  { name: "Tw 1", value: 65000000000 },
  { name: "Tw 2", value: 72000000000 },
  { name: "Tw 3", value: 68000000000 },
  { name: "Tw 4", value: 75000000000 },
];

// Helper to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Compact format for charts
const formatCompact = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
};

export default function DashboardKeuanganPage() {
  useRequireAuth();

  const [selectedTahun, setSelectedTahun] = useState("2024");

  const handleReset = () => {
    setSelectedTahun("2024");
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiDollarSign className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiDollarSign className="w-8 h-8 text-green-600" />
            Dashboard Keuangan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Realisasi anggaran, pendapatan, dan pengeluaran
          </p>
        </div>

        {/* Filter (Simplified for Keuangan) */}
        <FilterPanel
          tahunAjaran={[{ key: "2024", label: "2024" }, { key: "2023", label: "2023" }]}
          selectedTahun={selectedTahun}
          onTahunChange={setSelectedTahun}
          onReset={handleReset}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Pendapatan"
            value={formatCompact(summaryStats.pendapatan.total)}
            icon={<FiDollarSign className="w-6 h-6 text-white" />}
            color="green"
            trend={{ value: summaryStats.pendapatan.trend, label: "YoY" }}
          />
          <StatCard
            title="Pendapatan SPP"
            value={formatCompact(summaryStats.spp.total)}
            icon={<FiCreditCard className="w-6 h-6 text-white" />}
            color="blue"
            trend={{ value: summaryStats.spp.trend, label: "YoY" }}
          />
          <StatCard
            title="Dana Beasiswa"
            value={formatCompact(summaryStats.beasiswa.total)}
            icon={<FiBriefcase className="w-6 h-6 text-white" />}
            color="purple"
            trend={{ value: summaryStats.beasiswa.trend, label: "YoY" }}
          />
          <StatCard
            title="Biaya Operasional"
            value={formatCompact(summaryStats.operasional.total)}
            icon={<FiActivity className="w-6 h-6 text-white" />}
            color="yellow"
            trend={{ value: summaryStats.operasional.trend, label: "YoY" }}
          />
        </div>

        {/* Row 1: Trend SPP & Komposisi UKT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Pendapatan SPP */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Trend Pendapatan UKT
                </h2>
                <p className="text-sm text-gray-500">Pertumbuhan pendapatan UKT 5 tahun terakhir</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <LineChart
                data={trendPendapatanSPP}
                height={300}
                showArea={true}
                color="#10b981"
                valueFormatter={formatCompact}
              />
            </CardBody>
          </Card>

          {/* Komposisi Pendapatan UKT */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Komposisi Pendapatan UKT
                </h2>
                <p className="text-sm text-gray-500">Berdasarkan jalur masuk mahasiswa</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <PieChart
                data={[
                  { name: "SNBP", value: 45000000000 },
                  { name: "SNBT", value: 65000000000 },
                  { name: "Mandiri", value: 120000000000 },
                  { name: "Prestasi", value: 5000000000 },
                  { name: "PMPAP", value: 2000000000 },
                ]}
                donut={true}
                height={300}
                valueFormatter={formatCompact}
                colors={["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#6b7280"]}
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 2: Status Pembayaran */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Pembayaran */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Status Pembayaran UKT
                </h2>
                <p className="text-sm text-gray-500">Semester Ganjil 2024/2025</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <PieChart
                data={[
                  { name: "Lunas", value: 28000 },
                  { name: "Belum Bayar", value: 2500 },
                  { name: "Cicilan", value: 1500 },
                  { name: "Beasiswa (Lunas)", value: 4500 },
                ]}
                donut={false}
                height={300}
                colors={["#22c55e", "#ef4444", "#eab308", "#3b82f6"]}
              />
            </CardBody>
          </Card>

          {/* Penerimaan Harian */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tren Penerimaan Pembayaran (Harian)
                </h2>
                <p className="text-sm text-gray-500">Masa pembayaran 1-31 Juli 2024</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <LineChart
                data={[
                  { name: "Mg 1", value: 15000000000 },
                  { name: "Mg 2", value: 45000000000 },
                  { name: "Mg 3", value: 85000000000 },
                  { name: "Mg 4", value: 35000000000 },
                ]}
                height={300}
                showArea={false}
                color="#f97316"
                valueFormatter={formatCompact}
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 3: UKT & Realisasi per Fakultas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pendapatan per UKT */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sebaran Mahasiswa per Kelompok UKT
                </h2>
                <p className="text-sm text-gray-500">Jumlah mahasiswa pada setiap kategori UKT</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={pendapatanPerUKT}
                height={300}
                colors={["#3b82f6"]}
              />
            </CardBody>
          </Card>

          {/* Tunggakan UKT */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tunggakan UKT per Fakultas
                </h2>
                <p className="text-sm text-gray-500">Fakultas dengan tunggakan tertinggi</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={[
                  { name: "FH", value: 4.5 },
                  { name: "FISIP", value: 3.8 },
                  { name: "FEB", value: 3.2 },
                  { name: "FT", value: 2.5 },
                  { name: "FP", value: 2.1 },
                ]}
                height={300}
                horizontal={true}
                colors={["#ef4444"]}
                xAxisLabel="Jumlah Tunggakan (Milyar Rp)"
              />
            </CardBody>
          </Card>
        </div>

      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
