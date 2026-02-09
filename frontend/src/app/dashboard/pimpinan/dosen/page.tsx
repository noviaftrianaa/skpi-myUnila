"use client";

import React, { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
  FiUserCheck,
  FiAward,
  FiBookOpen,
  FiFileText,
  FiTrendingUp,
  FiUsers,
  FiActivity,
} from "react-icons/fi";
import { pimpinanMenuConfig } from "../config/menuConfig";
import {
  StatCard,
  LineChart,
  PieChart,
  BarChart,
  DrilldownBarChart,
  PyramidChart,
  HeatmapChart,
  FilterPanel,
  type DrilldownData,
} from "../components";

const APP_KEY = "dashboard-pimpinan";

// ============================================
// DATA SUMBER (MOCK DATA)
// ============================================

const summaryStats = {
  total: 1552,   // Per request
  guruBesar: 164, // Per request
  doktor: 518,    // Per request
  rasio: "1:22"   // Per request
};

const jenjangPendidikanData = [
  { name: "S3 (Doktor)", value: 518 },
  { name: "S2 (Magister)", value: 984 },
  { name: "S1 (Sarjana)", value: 50 },
];

// Heatmap Data Data: [X, Y, Value]
const pendidikanJabfungData = [
  { x: "Asisten Ahli", y: "S3", value: 10 },
  { x: "Lektor", y: "S3", value: 100 },
  { x: "Lektor Kepala", y: "S3", value: 350 },
  { x: "Guru Besar", y: "S3", value: 164 },
  { x: "Tenaga Pengajar", y: "S2", value: 128 },
  { x: "Asisten Ahli", y: "S2", value: 300 },
  { x: "Lektor", y: "S2", value: 450 },
  { x: "Lektor Kepala", y: "S2", value: 50 },
  { x: "Tenaga Pengajar", y: "S1", value: 30 },
  { x: "Asisten Ahli", y: "S1", value: 20 },
];

const sebaranFakultas: DrilldownData[] = [
  {
    id: "fkip",
    name: "FKIP",
    value: 385,
    children: [
      { id: "fkip-pbi", name: "Pend. Bahasa Inggris", value: 45 },
      { id: "fkip-pbsi", name: "Pend. Bahasa Indonesia", value: 42 },
      { id: "fkip-mat", name: "Pend. Matematika", value: 38 },
      { id: "fkip-fis", name: "Pend. Fisika", value: 35 },
      { id: "fkip-bio", name: "Pend. Biologi", value: 32 },
      { id: "fkip-kim", name: "Pend. Kimia", value: 30 },
      { id: "fkip-pgsd", name: "PGSD", value: 85 },
      { id: "fkip-paud", name: "PG PAUD", value: 38 },
    ],
  },
  {
    id: "feb",
    name: "FEB",
    value: 245,
    children: [
      { id: "feb-akt", name: "Akuntansi", value: 85 },
      { id: "feb-man", name: "Manajemen", value: 92 },
      { id: "feb-ep", name: "Ekonomi Pembangunan", value: 68 },
    ]
  },
  { id: "fh", name: "FH", value: 168, children: [{ id: "fh-hk", name: "Hukum", value: 168 }] },
  { id: "fisip", name: "FISIP", value: 185, children: [{ id: "fisip-ad", name: "Adm. Negara", value: 60 }, { id: "fisip-kom", name: "Ilmu Komunikasi", value: 70 }] },
  { id: "ft", name: "FT", value: 220, children: [{ id: "ft-si", name: "Sipil", value: 50 }, { id: "ft-el", name: "Elektro", value: 60 }] },
  { id: "fmipa", name: "FMIPA", value: 198, children: [{ id: "fmipa-bio", name: "Biologi", value: 50 }, { id: "fmipa-kim", name: "Kimia", value: 60 }] },
  { id: "fp", name: "FP", value: 205, children: [{ id: "fp-ag", name: "Agrotek", value: 100 }] },
  { id: "fk", name: "FK", value: 236, children: [{ id: "fk-pd", name: "Pend. Dokter", value: 150 }] },
];

const usiaJabatanData = [
  { x: "Tenaga Pengajar", y: "< 30", value: 50 },
  { x: "Asisten Ahli", y: "< 30", value: 20 },
  { x: "Asisten Ahli", y: "30-40", value: 150 },
  { x: "Lektor", y: "30-40", value: 200 },
  { x: "Lektor", y: "41-50", value: 300 },
  { x: "Lektor Kepala", y: "41-50", value: 300 },
  { x: "Guru Besar", y: "41-50", value: 30 },
  { x: "Lektor Kepala", y: "51-60", value: 100 },
  { x: "Guru Besar", y: "51-60", value: 80 },
  { x: "Guru Besar", y: "> 60", value: 54 },
];

const ikatanKerjaData = [
  { name: "PNS", value: 950 },
  { name: "PPPK", value: 200 },
  { name: "Tetap Non-PNS", value: 150 },
  { name: "Kontrak/LB", value: 252 },
];

const sertifikasiJabfungData = [
  { name: "Guru Besar", value: 164, category: "Sudah Serdos" },
  { name: "Guru Besar", value: 0, category: "Belum Serdos" },
  { name: "Lektor Kepala", value: 390, category: "Sudah Serdos" },
  { name: "Lektor Kepala", value: 10, category: "Belum Serdos" },
  { name: "Lektor", value: 500, category: "Sudah Serdos" },
  { name: "Lektor", value: 50, category: "Belum Serdos" },
  { name: "Asisten Ahli", value: 200, category: "Sudah Serdos" },
  { name: "Asisten Ahli", value: 110, category: "Belum Serdos" },
  { name: "Tenaga Pengajar", value: 0, category: "Sudah Serdos" },
  { name: "Tenaga Pengajar", value: 128, category: "Belum Serdos" },
];


const genderUsiaData = [
  { ageGroup: "20-29", male: 15, female: 20 },
  { ageGroup: "30-39", male: 120, female: 130 },
  { ageGroup: "40-49", male: 250, female: 200 },
  { ageGroup: "50-59", male: 300, female: 250 },
  { ageGroup: "60+", male: 150, female: 117 },
];

const trendSertifikasiData = [
  { name: "2020", value: 980 },
  { name: "2021", value: 1050 },
  { name: "2022", value: 1120 },
  { name: "2023", value: 1200 },
  { name: "2024", value: 1254 },
];

const trendJabfungData = [
  // Tahun 2020
  { name: "2020", value: 100, category: "Guru Besar" },
  { name: "2020", value: 300, category: "Lektor Kepala" },
  { name: "2020", value: 450, category: "Lektor" },
  // Tahun 2021
  { name: "2021", value: 120, category: "Guru Besar" },
  { name: "2021", value: 320, category: "Lektor Kepala" },
  { name: "2021", value: 480, category: "Lektor" },
  // Tahun 2022
  { name: "2022", value: 140, category: "Guru Besar" },
  { name: "2022", value: 350, category: "Lektor Kepala" },
  { name: "2022", value: 500, category: "Lektor" },
  // Tahun 2023
  { name: "2023", value: 155, category: "Guru Besar" },
  { name: "2023", value: 380, category: "Lektor Kepala" },
  { name: "2023", value: 520, category: "Lektor" },
  // Tahun 2024
  { name: "2024", value: 164, category: "Guru Besar" },
  { name: "2024", value: 400, category: "Lektor Kepala" },
  { name: "2024", value: 550, category: "Lektor" },
];


export default function DashboardDosenPage() {
  useRequireAuth();
  const [selectedTahun, setSelectedTahun] = useState("2024");
  const [selectedFakultas, setSelectedFakultas] = useState("");

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiUserCheck className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FiUserCheck className="w-8 h-8 text-blue-600" />
              Dashboard Dosen
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gambaran lengkap profil, kompetensi, dan kinerja dosen
            </p>
          </div>
          <FilterPanel
            tahunAjaran={[{ key: "2024", label: "2024" }, { key: "2023", label: "2023" }]}
            selectedTahun={selectedTahun}
            onTahunChange={setSelectedTahun}
            selectedFakultas={selectedFakultas}
            onFakultasChange={setSelectedFakultas}
            fakultas={[{ key: "all", label: "Semua Fakultas" }, ...sebaranFakultas.map(f => ({ key: f.id, label: f.name }))]}
            showProdi={false}
          />
        </div>

        {/* 1. KEY METRICS (Hitungan Utama) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Dosen"
            value={summaryStats.total}
            icon={<FiUsers className="w-6 h-6 text-white" />}
            color="blue"
            description="Dosen Tetap & Tidak Tetap"
          />
          <StatCard
            title="Guru Besar"
            value={summaryStats.guruBesar}
            icon={<FiAward className="w-6 h-6 text-white" />}
            color="yellow"
            description="Profesor Aktif"
          />
          <StatCard
            title="Bergelar Doktor"
            value={summaryStats.doktor}
            icon={<FiBookOpen className="w-6 h-6 text-white" />}
            color="purple"
            description="Pendidikan S3"
          />
          <StatCard
            title="Rasio Dosen : Mhs"
            value={summaryStats.rasio}
            icon={<FiActivity className="w-6 h-6 text-white" />}
            color="green"
            description="Ideal 1:20 - 1:30"
          />
        </div>

        {/* 2. BARIS KEDUA: DISTRIBUSI PENDIDIKAN & SEBARAN FAKULTAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Card className="h-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h4 className="font-bold text-lg text-gray-800 dark:text-white">Jenjang Pendidikan</h4>
                <p className="text-tiny text-gray-500">Komposisi S1, S2, dan S3</p>
              </CardHeader>
              <CardBody className="overflow-hidden">
                <PieChart
                  data={jenjangPendidikanData}
                  height={300}
                  donut={true}
                  colors={["#a855f7", "#3b82f6", "#f59e0b"]} // Ungu (S3), Biru (S2), Orange (S1)
                />
              </CardBody>
            </Card>
          </div>
          <div className="lg:col-span-8">
            <Card className="h-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h4 className="font-bold text-lg text-gray-800 dark:text-white">Sebaran Dosen per Fakultas</h4>
                <p className="text-tiny text-gray-500">Klik bar untuk melihat detail Program Studi</p>
              </CardHeader>
              <CardBody>
                <DrilldownBarChart
                  data={sebaranFakultas}
                  height={320}
                  color="#3b82f6"
                  title="Sebaran Dosen per Fakultas"
                />
              </CardBody>
            </Card>
          </div>
        </div>

        {/* 3. BARIS KETIGA: HUBUNGAN PENDIDIKAN & JABATAN (HEATMAPS) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <h4 className="font-bold text-lg text-gray-800 dark:text-white">Pendidikan & Jabatan Fungsional</h4>
              <p className="text-tiny text-gray-500">Korelasi tingkat pendidikan dengan jabatan akademik</p>
            </CardHeader>
            <CardBody>
              <HeatmapChart
                data={pendidikanJabfungData}
                height={350}
                minColor="#f3e8ff" // Light Purple
                maxColor="#7e22ce" // Dark Purple
              />
            </CardBody>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <h4 className="font-bold text-lg text-gray-800 dark:text-white">Usia & Jabatan Fungsional</h4>
              <p className="text-tiny text-gray-500">Sebaran kelompok usia pada setiap jabatan</p>
            </CardHeader>
            <CardBody>
              <HeatmapChart
                data={usiaJabatanData}
                height={350}
                minColor="#ffedd5" // Light Orange
                maxColor="#c2410c" // Dark Orange
              />
            </CardBody>
          </Card>
        </div>

        {/* 4. BARIS KEEMPAT: DEMOGRAFI & STATUS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <Card className="h-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h4 className="font-bold text-lg text-gray-800 dark:text-white">Ikatan Kerja & Status</h4>
                <p className="text-tiny text-gray-500">Proporsi status kepegawaian</p>
              </CardHeader>
              <CardBody>
                <PieChart
                  data={ikatanKerjaData}
                  donut={false}
                  height={300}
                  showLegend={true}
                  colors={["#10b981", "#3b82f6", "#f59e0b", "#94a3b8"]}
                />
              </CardBody>
            </Card>
          </div>
          <div className="lg:col-span-7">
            <Card className="h-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
              <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
                <h4 className="font-bold text-lg text-gray-800 dark:text-white">Distribusi Gender & Usia</h4>
                <p className="text-tiny text-gray-500">Piramida penduduk dosen</p>
              </CardHeader>
              <CardBody>
                <PyramidChart
                  data={genderUsiaData}
                  height={320}
                  colors={["#3b82f6", "#ec4899"]} // Biru (Pria), Pink (Wanita)
                />
              </CardBody>
            </Card>
          </div>
        </div>

        {/* 5. BARIS KELIMA: KOMPETENSI (SERTIFIKASI) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <h4 className="font-bold text-lg text-gray-800 dark:text-white">Sertifikasi per Jabatan</h4>
              <p className="text-tiny text-gray-500">Rasio dosen tersertifikasi (Serdos)</p>
            </CardHeader>
            <CardBody>
              <BarChart
                data={sertifikasiJabfungData}
                stacked={true}
                height={300}
                colors={["#10b981", "#e5e7eb"]} // Hijau (Sudah), Abu (Belum)
                showLegend={true}
                horizontal={true}
              />
            </CardBody>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <h4 className="font-bold text-lg text-gray-800 dark:text-white">Tren Sertifikasi (5 Tahun)</h4>
              <p className="text-tiny text-gray-500">Pertumbuhan jumlah dosen tersertifikasi</p>
            </CardHeader>
            <CardBody>
              <LineChart
                data={trendSertifikasiData}
                color="#10b981"
                height={300}
                showArea={true}
              />
            </CardBody>
          </Card>
        </div>

        {/* 6. BARIS KEENAM: TREN HISTORICAL JABFUNG */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
              <h4 className="font-bold text-lg text-gray-800 dark:text-white">Tren Jabatan Fungsional (5 Tahun)</h4>
              <p className="text-tiny text-gray-500">Pertumbuhan populasi per jenjang jabatan akademik</p>
            </CardHeader>
            <CardBody>
              <BarChart
                data={trendJabfungData}
                stacked={true}
                height={350}
                showLegend={true}
                colors={["#fab005", "#228be6", "#4dabf7"]} // Kuning (GB), Biru Tua (LK), Biru Muda (L)
                xAxisLabel="Tahun"
              />
            </CardBody>
          </Card>
        </div>

      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
