"use client";

import React, { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
  FiCheckCircle,
  FiAward,
  FiAlertCircle,
  FiMinusCircle,
  FiList,
  FiGlobe,
} from "react-icons/fi";
import { pimpinanMenuConfig } from "../config/menuConfig";
import {
  StatCard,
  PieChart,
  BarChart,
  FilterPanel,
} from "../components";

const APP_KEY = "dashboard-pimpinan";

// ============================================
// DUMMY DATA
// ============================================

const summaryStats = {
  totalProdi: { total: 115, trend: 0 },
  unggul: { total: 45, trend: 12.5 },
  baikSekali: { total: 38, trend: 5.2 },
  baik: { total: 25, trend: -4.5 },
  internasional: { total: 12, trend: 20 },
};

const distribusiAkreditasi = [
  { name: "Unggul", value: 45 },
  { name: "A", value: 20 }, // Legacy
  { name: "Baik Sekali", value: 38 },
  { name: "B", value: 15 }, // Legacy
  { name: "Baik", value: 25 },
  { name: "C", value: 5 }, // Legacy
];

const akreditasiPerFakultas = [
  { name: "FKIP", value: 15, category: "Unggul" },
  { name: "FEB", value: 8, category: "Unggul" },
  { name: "FT", value: 6, category: "Unggul" },
  { name: "FP", value: 5, category: "Unggul" },
  { name: "FMIPA", value: 4, category: "Unggul" },
  { name: "FISIP", value: 3, category: "Unggul" },
  { name: "FH", value: 2, category: "Unggul" },
  { name: "FK", value: 2, category: "Unggul" },
];

const statusKadaluarsa = [
  { name: "< 1 Tahun", value: 15 },
  { name: "1-2 Tahun", value: 25 },
  { name: "2-3 Tahun", value: 35 },
  { name: "> 3 Tahun", value: 40 },
];

export default function DashboardAkreditasiPage() {
  useRequireAuth();

  const [selectedTahun, setSelectedTahun] = useState("2024");

  const handleReset = () => {
    setSelectedTahun("2024");
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiCheckCircle className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiCheckCircle className="w-8 h-8 text-blue-600" />
            Dashboard Akreditasi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Status akreditasi program studi nasional (BAN-PT/LAM) dan internasional
          </p>
        </div>

        {/* Filter */}
        <FilterPanel
          tahunAjaran={[{ key: "2024", label: "2024" }]}
          selectedTahun={selectedTahun}
          onTahunChange={setSelectedTahun}
          onReset={handleReset}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            title="Total Prodi"
            value={summaryStats.totalProdi.total}
            icon={<FiList className="w-6 h-6 text-white" />}
            color="cyan"
            trend={undefined}
          />
          <StatCard
            title="Unggul / A"
            value={summaryStats.unggul.total + 20}
            icon={<FiAward className="w-6 h-6 text-white" />}
            color="green"
            trend={{ value: summaryStats.unggul.trend, label: "YoY" }}
          />
          <StatCard
            title="Baik Sekali / B"
            value={summaryStats.baikSekali.total + 15}
            icon={<FiCheckCircle className="w-6 h-6 text-white" />}
            color="blue"
            trend={{ value: summaryStats.baikSekali.trend, label: "YoY" }}
          />
          <StatCard
            title="Baik / C"
            value={summaryStats.baik.total + 5}
            icon={<FiAlertCircle className="w-6 h-6 text-white" />}
            color="yellow"
            trend={{ value: summaryStats.baik.trend, label: "YoY" }}
          />
          <StatCard
            title="Internasional"
            value={summaryStats.internasional.total}
            icon={<FiGlobe className="w-6 h-6 text-white" />}
            color="purple"
            trend={{ value: summaryStats.internasional.trend, label: "YoY" }}
          />
        </div>

        {/* Row 1: Distribusi & Kadaluarsa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribusi Peringkat */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Distribusi Peringkat Akreditasi
                </h2>
                <p className="text-sm text-gray-500">Sebaran peringkat akreditasi prodi</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <PieChart
                data={distribusiAkreditasi}
                donut={true}
                height={300}
                colors={["#10b981", "#059669", "#3b82f6", "#2563eb", "#f59e0b", "#d97706"]}
              />
            </CardBody>
          </Card>

          {/* Masa Berlaku */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sisa Masa Berlaku
                </h2>
                <p className="text-sm text-gray-500">Estimasi waktu re-akreditasi</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={statusKadaluarsa}
                height={300}
                horizontal={true}
                colors={["#ef4444", "#f97316", "#f59e0b", "#10b981"]} // <1 thn red, >3 thn green
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 2: Per Fakultas */}
        <Card className="bg-white dark:bg-gray-800 shadow-md">
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Prodi Unggul per Fakultas
              </h2>
              <p className="text-sm text-gray-500">Jumlah program studi dengan akreditasi Unggul</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <BarChart
              data={akreditasiPerFakultas}
              height={350}
              colors={["#10b981"]}
            />
          </CardBody>
        </Card>

        {/* Row 3: Akreditasi Internasional */}
        <Card className="bg-white dark:bg-gray-800 shadow-md">
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Akreditasi Internasional
              </h2>
              <p className="text-sm text-gray-500">Program studi dengan sertifikasi internasional (ASIIN, AUN-QA, abet, etc)</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <BarChart
              data={[
                { name: "Teknik Kimia", value: 1, category: "IABEE" },
                { name: "Teknik Elektro", value: 1, category: "IABEE" },
                { name: "Kimia", value: 1, category: "RSC" },
                { name: "Biologi", value: 1, category: "ASIIN" },
                { name: "Agribisnis", value: 1, category: "AUN-QA" },
                { name: "Teknologi Hasil Pertanian", value: 1, category: "AUN-QA" },
              ]}
              height={400}
              horizontal={true}
              colors={["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"]} // Vibrant palette for categories
              xAxisLabel="Status Terakreditasi"
            />
          </CardBody>
        </Card>

        {/* Row 4: Detail Data Table */}
        <Card className="bg-white dark:bg-gray-800 shadow-md">
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detail Status Akreditasi Program Studi
              </h2>
              <p className="text-sm text-gray-500">Daftar lengkap status akreditasi nasional dan internasional</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Program Studi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fakultas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Strata</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Peringkat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Internasional</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Masa Berlaku</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    { prodi: "Pendidikan Dokter", fak: "FK", strata: "S1", rank: "Unggul", int: "-", exp: "2028-05-12" },
                    { prodi: "Akuntansi", fak: "FEB", strata: "S1", rank: "Unggul", int: "AUN-QA", exp: "2027-11-20" },
                    { prodi: "Hukum", fak: "FH", strata: "S1", rank: "Unggul", int: "-", exp: "2029-01-15" },
                    { prodi: "Kimia", fak: "FMIPA", strata: "S1", rank: "Unggul", int: "RSC", exp: "2026-08-30" },
                    { prodi: "Teknik Sipil", fak: "FT", strata: "S1", rank: "Baik Sekali", int: "-", exp: "2025-12-10" },
                    { prodi: "Agroteknologi", fak: "FP", strata: "S1", rank: "Unggul", int: "-", exp: "2028-03-22" },
                    { prodi: "Ilmu Komunikasi", fak: "FISIP", strata: "S1", rank: "A", int: "-", exp: "2026-06-18" },
                    { prodi: "Pendidikan Biologi", fak: "FKIP", strata: "S1", rank: "Unggul", int: "ASIIN", exp: "2027-09-05" },
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{row.prodi}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{row.fak}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{row.strata}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.rank === 'Unggul' || row.rank === 'A' ? 'bg-green-100 text-green-800' :
                          row.rank === 'Baik Sekali' || row.rank === 'B' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {row.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{row.int}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{row.exp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
