"use client";

import React, { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
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
  HeatmapChart,
  DrilldownBarChart,
  FilterPanel,
  type DrilldownData
} from "../components";

const APP_KEY = "dashboard-pimpinan";

// ============================================
// DUMMY DATA
// ============================================

const summaryStats = {
  aktif: { total: 32450, trend: 2.5 },
  baru: { total: 8540, trend: 1.2 },
  lulus: { total: 6450, trend: 3.8 },
  cuti: { total: 420, trend: -5.2 }, // negative trend is good for dropouts/cuti
  do: { total: 85, trend: -12.5 },
};

const trendMahasiswa = [
  { name: "2020", value: 28500 },
  { name: "2021", value: 29800 },
  { name: "2022", value: 31200 },
  { name: "2023", value: 32100 },
  { name: "2024", value: 32450 },
];

const sebaranFakultasData: DrilldownData[] = [
  {
    id: 'fkip', name: 'FKIP', value: 8540,
    children: [
      { id: 'fkip-pgsd', name: 'PGSD', value: 1200 },
      { id: 'fkip-pbi', name: 'Pend. B. Inggris', value: 850 },
      { id: 'fkip-penjas', name: 'Penjaskes', value: 780 }
    ]
  },
  {
    id: 'feb', name: 'FEB', value: 4520,
    children: [
      { id: 'feb-man', name: 'Manajemen', value: 1540 },
      { id: 'feb-akt', name: 'Akuntansi', value: 1320 },
      { id: 'feb-ep', name: 'Ekon. Pembangunan', value: 950 }
    ]
  },
  { id: 'fh', name: 'FH', value: 3850, children: [] },
  { id: 'fisip', name: 'FISIP', value: 3650, children: [] },
  { id: 'ft', name: 'FT', value: 3420, children: [] },
  { id: 'fp', name: 'FP', value: 3150, children: [] },
  { id: 'fmipa', name: 'FMIPA', value: 2840, children: [] },
  { id: 'fk', name: 'FK', value: 2480, children: [] },
];

const distribusiJenjang = [
  { name: "S1", value: 28500 },
  { name: "D3", value: 2450 },
  { name: "S2", value: 1250 },
  { name: "S3", value: 250 },
  { name: "Profesi", value: 180 },
];

const jalurMasuk = [
  { name: "SNBP", value: 2500 },
  { name: "SNBT", value: 3500 },
  { name: "Mandiri", value: 2540 },
  { name: "Prestasi", value: 120 },
  { name: "PMPAP", value: 350 }, // Program for less fortunate in Lampung
];

const distribusiIPK = [
  { name: "3.51 - 4.00", value: 8540 },
  { name: "3.01 - 3.50", value: 12450 },
  { name: "2.51 - 3.00", value: 6540 },
  { name: "2.01 - 2.50", value: 1250 },
  { name: "< 2.00", value: 420 },
];

const pembiayaan = [
  { name: "UKT Reguler", value: 24500 },
  { name: "KIP Kuliah", value: 6500 },
  { name: "Beasiswa Daerah", value: 850 },
  { name: "Beasiswa Lain", value: 600 },
];

export default function DashboardMahasiswaPage() {
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
      appIcon={<FiUsers className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FiUsers className="w-8 h-8 text-blue-600" />
            Dashboard Mahasiswa
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Data akademik dan kemahasiswaan Universitas Lampung
          </p>
        </div>

        {/* Filter */}
        <FilterPanel
          tahunAjaran={[{ key: "2024", label: "2024" }, { key: "2023", label: "2023" }]}
          selectedTahun={selectedTahun}
          onTahunChange={setSelectedTahun}
          fakultas={[{ key: "all", label: "Semua Fakultas" }]} // simplified
          selectedFakultas={selectedFakultas}
          onFakultasChange={setSelectedFakultas}
          showProdi={false}
          onReset={handleReset}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Mahasiswa Aktif"
            value={summaryStats.aktif.total}
            icon={<FiUserCheck className="w-6 h-6 text-white" />}
            color="blue"
            trend={{ value: summaryStats.aktif.trend, label: "YoY" }}
          />
          <StatCard
            title="Mahasiswa Baru"
            value={summaryStats.baru.total}
            icon={<FiUserPlus className="w-6 h-6 text-white" />}
            color="green"
            trend={{ value: summaryStats.baru.trend, label: "YoY" }}
          />
          <StatCard
            title="Lulusan"
            value={summaryStats.lulus.total}
            icon={<FiAward className="w-6 h-6 text-white" />}
            color="purple"
            trend={{ value: summaryStats.lulus.trend, label: "YoY" }}
          />
          <StatCard
            title="Cuti Akademik"
            value={summaryStats.cuti.total}
            icon={<FiUserX className="w-6 h-6 text-white" />}
            color="yellow"
            trend={{ value: summaryStats.cuti.trend, label: "YoY" }}
          />
          <StatCard
            title="Drop Out (DO)"
            value={summaryStats.do.total}
            icon={<FiUserX className="w-6 h-6 text-white" />}
            color="red"
            trend={{ value: summaryStats.do.trend, label: "YoY" }}
          />
        </div>

        {/* Row 1: Trend & Sebaran Fakultas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Mahasiswa */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Trend Jumlah Mahasiswa
                </h2>
                <p className="text-sm text-gray-500">Pertumbuhan populasi mahasiswa 5 tahun terakhir</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <LineChart
                data={trendMahasiswa}
                height={300}
                showArea={true}
                color="#2563eb"
              />
            </CardBody>
          </Card>

          {/* Sebaran Fakultas Drilldown */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sebaran Mahasiswa per Fakultas
                </h2>
                <p className="text-sm text-gray-500">Klik bar untuk melihat detail prodi</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <DrilldownBarChart
                data={sebaranFakultasData}
                title="Mahasiswa per Fakultas"
                height={320}
                color="#3b82f6"
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 2: Demografi & Akademik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Jenjang */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <h2 className="text-base font-semibold">Distribusi Jenjang</h2>
            </CardHeader>
            <CardBody>
              <PieChart data={distribusiJenjang} donut={true} height={250} showLegend={false} />
            </CardBody>
          </Card>

          {/* Jalur Masuk */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <h2 className="text-base font-semibold">Jalur Masuk (2024)</h2>
            </CardHeader>
            <CardBody>
              <PieChart data={jalurMasuk} donut={true} height={250} showLegend={false} colors={["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"]} />
            </CardBody>
          </Card>

          {/* Pembiayaan */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <h2 className="text-base font-semibold">Sistem Pembiayaan</h2>
            </CardHeader>
            <CardBody>
              <PieChart data={pembiayaan} donut={false} height={250} showLegend={false} colors={["#6366f1", "#14b8a6", "#f97316"]} />
            </CardBody>
          </Card>
        </div>

        {/* Row 3: Distribusi IPK */}
        <Card className="bg-white dark:bg-gray-800 shadow-md">
          <CardHeader>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Distribusi IPK Mahasiswa
              </h2>
              <p className="text-sm text-gray-500">Sebaran Indeks Prestasi Kumulatif</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <BarChart
              data={distribusiIPK}
              height={300}
              colors={["#10b981", "#3b82f6", "#f59e0b", "#f97316", "#ef4444"]} // Gradasi hijau ke merah
            />
          </CardBody>
        </Card>

        {/* Row 3: IPK & Masa Studi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Rata-rata IPK Mahasiswa
                </h2>
                <p className="text-sm text-gray-500">Rata-rata IPK per Fakultas</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={[
                  { name: "FK", value: 3.85 },
                  { name: "FMIPA", value: 3.65 },
                  { name: "FKIP", value: 3.62 },
                  { name: "FEB", value: 3.58 },
                  { name: "FISIP", value: 3.55 },
                  { name: "FP", value: 3.52 },
                  { name: "FH", value: 3.50 },
                  { name: "FT", value: 3.45 },
                ]}
                height={300}
                colors={["#8b5cf6"]}
                xAxisLabel="IPK"
              />
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Masa Studi Lulusan
                </h2>
                <p className="text-sm text-gray-500">Distribusi lama masa studi</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <PieChart
                data={[
                  { name: "< 4 Tahun", value: 15 },
                  { name: "4 Tahun", value: 65 },
                  { name: "> 4 Tahun", value: 20 },
                ]}
                donut={true}
                height={300}
                colors={["#10b981", "#3b82f6", "#ef4444"]}
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 4: Beasiswa & Tugas Akhir */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Status Penerima Beasiswa
                </h2>
                <p className="text-sm text-gray-500">Jumlah penerima beasiswa aktif</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={[
                  { name: "KIP Kuliah", value: 1250 },
                  { name: "PPA", value: 450 },
                  { name: "Bank Indonesia", value: 120 },
                  { name: "Djarum", value: 50 },
                  { name: "Pemda", value: 200 },
                ]}
                horizontal={true}
                height={300}
                colors={["#f59e0b"]}
                xAxisLabel="Jumlah Penerima"
              />
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Mahasiswa Tugas Akhir
                </h2>
                <p className="text-sm text-gray-500">Mahasiswa sedang skripsi/tesis</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={[
                  { name: "FH", value: 450 },
                  { name: "FEB", value: 380 },
                  { name: "FKIP", value: 320 },
                  { name: "FT", value: 250 },
                  { name: "FP", value: 210 },
                  { name: "FISIP", value: 180 },
                  { name: "FMIPA", value: 150 },
                  { name: "FK", value: 100 },
                ]}
                height={300}
                colors={["#ec4899"]}
                xAxisLabel="Mahasiswa"
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 4: Geografis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asal Daerah */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top 5 Asal Provinsi
                </h2>
                <p className="text-sm text-gray-500">
                  Domisili asal mahasiswa
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={[
                  { name: "Lampung", value: 24500 },
                  { name: "Sumatera Selatan", value: 3200 },
                  { name: "Banten", value: 1540 },
                  { name: "Jawa Barat", value: 1250 },
                  { name: "Sumatera Utara", value: 850 },
                ]}
                height={300}
                horizontal={true}
                colors={["#3b82f6"]}
              />
            </CardBody>
          </Card>

          {/* Mahasiswa Asing */}
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Mahasiswa Asing
                </h2>
                <p className="text-sm text-gray-500">
                  Sebaran negara asal mahasiswa internasional
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={[
                  { name: "Malaysia", value: 45 },
                  { name: "Thailand", value: 32 },
                  { name: "Palestina", value: 12 },
                  { name: "Yaman", value: 8 },
                  { name: "Madagaskar", value: 5 },
                ]}
                height={300}
                colors={["#ec4899"]}
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 5: Peminat & MBKM */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Rasio Peminat vs Diterima
                </h2>
                <p className="text-sm text-gray-500">Tingkat keketatan seleksi masuk</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={[
                  { name: "Kedokteran", value: 4500 },
                  { name: "Manajemen", value: 3200 },
                  { name: "Hukum", value: 2800 },
                  { name: "Ilmu Komunikasi", value: 2500 },
                  { name: "Akuntansi", value: 2100 },
                ]}
                height={300}
                colors={["#f59e0b"]}
                xAxisLabel="Jumlah Peminat"
              />
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Partisipasi MBKM
                </h2>
                <p className="text-sm text-gray-500">Mahasiswa Kampus Merdeka (Inbound/Outbound)</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <PieChart
                data={[
                  { name: "Pertukaran Mahasiswa", value: 450 },
                  { name: "Magang Bersertifikat", value: 320 },
                  { name: "Kampus Mengajar", value: 180 },
                  { name: "Studi Independen", value: 150 },
                ]}
                donut={true}
                height={300}
                colors={["#3b82f6", "#10b981", "#8b5cf6", "#ec4899"]}
                showLegend={true}
              />
            </CardBody>
          </Card>
        </div>

        {/* Row 6: Kegiatan & Warning Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Keaktifan Kegiatan Mahasiswa
                </h2>
                <p className="text-sm text-gray-500">Partisipasi dalam UKM dan Organisasi</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <BarChart
                data={[
                  { name: "BEM/DPM", value: 450 },
                  { name: "UKM Olahraga", value: 850 },
                  { name: "UKM Seni", value: 620 },
                  { name: "UKM Penalaran", value: 350 },
                  { name: "UKM Keagamaan", value: 500 },
                ]}
                horizontal={true}
                height={280}
                colors={["#06b6d4"]}
                xAxisLabel="Anggota Aktif"
              />
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md border-l-4 border-l-red-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FiUserX className="w-6 h-6 text-red-500" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Warning: Masa Studi Maksimal
                  </h2>
                  <p className="text-sm text-gray-500">Mahasiswa mendekati batas masa studi (Drop Out Warning)</p>
                </div>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="font-medium text-red-700 dark:text-red-300">S1 ({">"} 12 Semester)</span>
                  <span className="font-bold text-red-600 text-lg">450 Mhs</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="font-medium text-red-700 dark:text-red-300">D3 ({">"} 8 Semester)</span>
                  <span className="font-bold text-red-600 text-lg">120 Mhs</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="font-medium text-red-700 dark:text-red-300">S2 ({">"} 6 Semester)</span>
                  <span className="font-bold text-red-600 text-lg">85 Mhs</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
