"use client";

import React, { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider, Button } from "@heroui/react";
import {
  FiUsers,
  FiUserCheck,
  FiBriefcase,
  FiDollarSign,
  FiBookOpen,
  FiGlobe,
  FiTrendingUp,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";
import { MdDashboard, MdSchool } from "react-icons/md";
import { pimpinanMenuConfig } from "./config/menuConfig";
import {
  StatCard,
  LineChart,
  PieChart,
  BarChart,
  FilterPanel
} from "./components";

const APP_KEY = "dashboard-pimpinan";

// ============================================
// DUMMY DATA
// ============================================

const summaryStats = {
  mahasiswa: { total: 32456, trend: 2.5, active: 28900, cuti: 1200 },
  sdm: { total: 3998, trend: 1.2, dosen: 1250, tendik: 2748 },
  akademik: { prodi: 108, akrUnggul: 42, akrInternasional: 15 },
  keuangan: { total: 245000000000, trend: 5.3, serapan: 85 },
  penelitian: { judul: 850, publikasi: 1240 },
  kerjasama: { mitra: 450, mou: 320 },
};

const populasiTrend = [
  { name: "2020", value: 32300, category: "Mahasiswa" },
  { name: "2021", value: 33650, category: "Mahasiswa" },
  { name: "2022", value: 34550, category: "Mahasiswa" },
  { name: "2023", value: 35150, category: "Mahasiswa" },
  { name: "2024", value: 36454, category: "Mahasiswa" },
];

const kelulusanTrend = [
  { name: "2020", value: 85, category: "Lulus Tepat Waktu (%)" },
  { name: "2021", value: 87, category: "Lulus Tepat Waktu (%)" },
  { name: "2022", value: 86, category: "Lulus Tepat Waktu (%)" },
  { name: "2023", value: 89, category: "Lulus Tepat Waktu (%)" },
  { name: "2024", value: 91, category: "Lulus Tepat Waktu (%)" },
];

const akreditasiDist = [
  { name: "Unggul", value: 42 },
  { name: "A", value: 35 },
  { name: "Baik Sekali", value: 20 },
  { name: "Baik", value: 11 },
];

const fakultasData = [
  { name: "FEB", value: 4500, category: "Mahasiswa" },
  { name: "Hukum", value: 3200, category: "Mahasiswa" },
  { name: "KIP", value: 5600, category: "Mahasiswa" },
  { name: "Pertanian", value: 3100, category: "Mahasiswa" },
  { name: "Teknik", value: 3800, category: "Mahasiswa" },
  { name: "ISIP", value: 2900, category: "Mahasiswa" },
  { name: "MIPA", value: 2100, category: "Mahasiswa" },
  { name: "Kedokteran", value: 1800, category: "Mahasiswa" },
];

export default function DashboardBerandaPage() {
  useRequireAuth();
  const [selectedTahun, setSelectedTahun] = useState("2024-Ganjil");

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 p-6 space-y-8">
        {/* Top Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-800 p-8 text-white shadow-xl">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <MdSchool className="w-10 h-10 text-yellow-400" />
                Dashboard Center
              </h1>
              <p className="text-blue-100 max-w-xl text-lg">
                Ringkasan eksekutif performa Universitas Lampung berdasarkan data real-time terintegrasi.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                <span className="text-sm font-medium text-blue-100">Periode Aktif</span>
                <p className="text-xl font-bold text-white">{selectedTahun}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Filter */}
        <div>
          <FilterPanel
            tahunAjaran={[
              { key: "2024-Ganjil", label: "2024/2025 Ganjil" },
              { key: "2023-Genap", label: "2023/2024 Genap" },
            ]}
            selectedTahun={selectedTahun}
            onTahunChange={setSelectedTahun}
            showProdi={false}
          />
        </div>

        {/* Key Metrics Grid - Executive Summary */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-blue-600" /> Indikator Utama
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Total Mahasiswa Aktif"
              value={summaryStats.mahasiswa.active.toLocaleString('id-ID')}
              icon={<FiUsers className="w-6 h-6 text-white" />}
              color="blue"
              trend={{ value: 2.5, label: "vs Semester Lalu" }}
              description="32.456 Terdaftar"
            />
            <StatCard
              title="Capaian IKU Institusi"
              value="72.8"
              icon={<FiTrendingUp className="w-6 h-6 text-white" />}
              color="green"
              trend={{ value: 5.1, label: "Poin" }}
              description="Target 2024: 75.0"
            />
            <StatCard
              title="Serapan Anggaran"
              value={`${summaryStats.keuangan.serapan}%`}
              icon={<FiDollarSign className="w-6 h-6 text-white" />}
              color="yellow"
              description={`Rp ${(summaryStats.keuangan.total / 1000000000).toFixed(0)} Miliar`}
            />
            <StatCard
              title="Prodi Unggul/A"
              value={`${((summaryStats.akademik.akrUnggul + 35) / summaryStats.akademik.prodi * 100).toFixed(0)}%`}
              icon={<FiBriefcase className="w-6 h-6 text-white" />}
              color="purple"
              trend={{ value: 3, label: "Prodi Baru" }}
              description="77 dari 108 Prodi"
            />
          </div>
        </div>

        {/* Charts Row 1: Demography & Quality */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Population Trend */}
          <Card className="lg:col-span-2 shadow-md border-none">
            <CardHeader className="flex justify-between p-5 pb-0">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Trend Populasi Mahasiswa</h3>
                <p className="text-sm text-gray-500">Pertumbuhan jumlah mahasiswa aktif 5 tahun terakhir</p>
              </div>
              <Button size="sm" variant="light" color="primary">Lihat Detail</Button>
            </CardHeader>
            <CardBody>
              <LineChart data={populasiTrend} height={300} color="#3b82f6" />
            </CardBody>
          </Card>

          {/* Accreditation Status */}
          <Card className="shadow-md border-none">
            <CardHeader className="p-5 pb-0">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Status Akreditasi</h3>
                <p className="text-sm text-gray-500">Distribusi Peringkat Prodi</p>
              </div>
            </CardHeader>
            <CardBody className="flex flex-col items-center justify-center">
              <PieChart
                data={akreditasiDist}
                height={250}
                donut={true}
                colors={["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"]}
              />
              <div className="w-full mt-4 flex justify-between px-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Internasional</p>
                  <p className="text-lg font-bold text-purple-600">{summaryStats.akademik.akrInternasional}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Unggul</p>
                  <p className="text-lg font-bold text-green-600">{summaryStats.akademik.akrUnggul}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Charts Row 2: Distribution & Efficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mahasiswa per Fakultas */}
          <Card className="shadow-md border-none">
            <CardHeader className="p-5 pb-0">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Sebaran Mahasiswa per Fakultas</h3>
            </CardHeader>
            <CardBody>
              <BarChart
                data={fakultasData}
                height={300}
                horizontal={true}
                colors={["#6366f1"]}
              />
            </CardBody>
          </Card>

          {/* Key Notifications / Insights */}
          <Card className="shadow-md border-none bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="p-5 pb-0 mb-2">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FiAlertCircle className="text-orange-500" /> Insights & Atensi
              </h3>
            </CardHeader>
            <CardBody className="p-5 pt-0 space-y-4">
              <div className="flex gap-4 items-start p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-blue-100 dark:border-gray-700">
                <div className="p-2 bg-green-100 text-green-600 rounded-full mt-1">
                  <FiCheckCircle />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Target IKU 1 Tercapai</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    85% Lulusan berhasil mendapat pekerjaan dalam 6 bulan. Meningkat 5% dari tahun lalu.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-orange-100 dark:border-gray-700">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-full mt-1">
                  <FiAlertCircle />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Perhatian: Rasio Dosen</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    3 Prodi di Fakultas Teknik memiliki rasio mahasiswa:dosen di atas 1:45. Perlu penambahan SDM.
                  </p>
                  <Button size="sm" variant="flat" color="warning" className="mt-2 h-8">Lihat Detail</Button>
                </div>
              </div>

              <div className="flex gap-4 items-start p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-gray-700">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-full mt-1">
                  <FiBookOpen />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Publikasi Internasional</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Lonjakan 20% publikasi Scopus Q1 di semester ini, didominasi oleh FMIPA dan FKIP.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu >
  );
}
