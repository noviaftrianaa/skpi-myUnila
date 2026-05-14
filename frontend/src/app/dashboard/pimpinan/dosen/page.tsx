"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader } from "@heroui/react";
import {
  FiUserCheck,
  FiAward,
  FiBookOpen,
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
  DashboardSkeleton,
  ErrorAlert,
} from "../components";
import { useDashboardData, useDashboardReference } from "../hooks";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { DosenData } from "../types";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import UnitFilter from "@/shared/components/data-unila/UnitFilter";
import ExportMenu, { type ExportFormat } from "@/shared/components/data-unila/ExportMenu";
import mahasiswaDataService, { type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { exportToCsv, exportToJson } from "@/lib/utils/exportCsv";
import { exportToPdf } from "@/lib/utils/exportPdf";
import toast, { Toaster } from "react-hot-toast";

const APP_KEY = "dashboard-pimpinan";

export default function DashboardDosenPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const [selectedSemesters, setSelectedSemesters] = useState<Set<string>>(new Set());
  const [selectedFakultas, setSelectedFakultas] = useState("");
  const [unitItems, setUnitItems] = useState<string[]>([]);
  const unitFilterStr = unitItems.join(",");
  const [orgFilters, setOrgFilters] = useState<MahasiswaFilters | null>(null);

  useEffect(() => {
    mahasiswaDataService.getFilters({
      id_fakultas: scope.forcedFakultas || undefined,
      id_jurusan: scope.forcedJurusan || undefined,
    }).then(setOrgFilters).catch(console.error);
  }, [scope.forcedFakultas, scope.forcedJurusan]);

  const { fakultas, semester, activeSemesters } = useDashboardReference();

  useEffect(() => {
    if (activeSemesters.length > 0 && selectedSemesters.size === 0) {
      setSelectedSemesters(new Set(activeSemesters));
    }
  }, [activeSemesters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-set fakultas dari activeContext (Dekan/Kaprodi)
  useEffect(() => {
    if (scope.forcedFakultas && !selectedFakultas) {
      setSelectedFakultas(scope.forcedFakultas);
    }
  }, [scope.forcedFakultas]); // eslint-disable-line react-hooks/exhaustive-deps

  const semesterParam = Array.from(selectedSemesters).join(",");
  // Efektif fakultas: kalau scope dipaksa, pakai itu (override manual)
  const effectiveFakultas = scope.forcedFakultas || selectedFakultas;
  const { data, loading, error, refetch } = useDashboardData<DosenData>(
    ENDPOINTS.DASHBOARD_PIMPINAN.DOSEN,
    {
      semester: semesterParam,
      ...(effectiveFakultas && { fakultas: effectiveFakultas }),
      ...(scope.forcedProdi && { prodi: scope.forcedProdi }),
      ...(unitFilterStr && { unit_filter: unitFilterStr }),
    }
  );

  const handleReset = () => {
    setSelectedSemesters(new Set(activeSemesters));
    setUnitItems([]);
    // Hanya reset selectedFakultas kalau user boleh ubah (Rektor)
    if (scope.canChangeFakultas) setSelectedFakultas("");
  };

  const handleExport = (fmtType: ExportFormat) => {
    if (!data) { toast.error("Data belum dimuat"); return; }
    const rows = (data.sebaranFakultas || []).map((r) => ({ fakultas: r.name, jumlah: r.value }));
    if (!rows.length) { toast.error("Tidak ada data sebaran"); return; }
    const baseName = `dosen-sebaran-${semesterParam || "all"}`;
    const headers = { fakultas: "Fakultas", jumlah: "Jumlah Dosen" } as const;
    if (fmtType === "excel") { exportToExcel(rows as unknown as Record<string, unknown>[], baseName, "Dosen", headers); toast.success("Excel di-download"); }
    else if (fmtType === "csv-client") { exportToCsv(rows as unknown as Record<string, unknown>[], baseName, headers); toast.success("CSV di-download"); }
    else if (fmtType === "pdf") { exportToPdf(rows as unknown as Record<string, unknown>[], baseName, { title: "Sebaran Dosen per Fakultas", headers, orientation: "landscape" }); toast.success("PDF di-download"); }
    else if (fmtType === "json") { exportToJson(rows, baseName); toast.success("JSON di-download"); }
    else { toast("Server export belum tersedia"); }
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiUserCheck className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <Toaster position="top-right" />
      <div className="p-6 space-y-6">
        <ScopeBadge />
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
            semester={semester}
            selectedSemesters={selectedSemesters}
            onSemesterChange={setSelectedSemesters}
            selectedFakultas={effectiveFakultas}
            onFakultasChange={setSelectedFakultas}
            fakultas={fakultas}
            showFakultas={scope.canChangeFakultas}
            showProdi={false}
            scopeBadge={scope.scopeName}
            onReset={handleReset}
            onExport={() => handleExport("excel")}
          />
        </div>
        <div className="flex flex-wrap gap-3 items-end p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50">
          <div className="flex-1 min-w-[240px]">
            <UnitFilter
              data={orgFilters}
              value={unitItems}
              onChange={(next) => setUnitItems(next)}
              forcedFakultas={scope.forcedFakultas || undefined}
              forcedJurusan={scope.forcedJurusan || undefined}
              forcedProdi={scope.forcedProdi || undefined}
            />
          </div>
          <ExportMenu onExport={handleExport} disabled={{ "csv-server": true }} />
        </div>

        {loading && <DashboardSkeleton />}
        {error && <ErrorAlert message={error} onRetry={refetch} />}

        {data && (
          <>
            {/* 1. KEY METRICS (Hitungan Utama) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Dosen"
                value={data.stats.total}
                icon={<FiUsers className="w-6 h-6 text-white" />}
                color="blue"
                description="Dosen Tetap & Tidak Tetap"
                href="/dashboard/data-unila/dosen?status=aktif"
                hint="Klik untuk daftar dosen aktif"
              />
              <StatCard
                title="Guru Besar"
                value={data.stats.guruBesar}
                icon={<FiAward className="w-6 h-6 text-white" />}
                color="yellow"
                description="Profesor Aktif"
                href="/dashboard/data-unila/dosen/jabfung"
                hint="Klik untuk daftar jabatan fungsional"
              />
              <StatCard
                title="Bergelar Doktor"
                value={data.stats.doktor}
                icon={<FiBookOpen className="w-6 h-6 text-white" />}
                color="purple"
                description="Pendidikan S3"
                href="/dashboard/data-unila/dosen/pendidikan?jenjang=S3"
                hint="Klik untuk daftar riwayat pendidikan S3"
              />
              <StatCard
                title="Rasio Dosen : Mhs"
                value={data.stats.rasio}
                icon={<FiActivity className="w-6 h-6 text-white" />}
                color="green"
                description="Ideal 1:20 - 1:30"
                hint="Rasio dosen aktif vs mahasiswa aktif. SK Mendikbud: ideal 1:20 (eksak) atau 1:30 (sosial-humaniora)."
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
                      data={data.jenjangPendidikan}
                      height={300}
                      donut={true}
                      colors={["#a855f7", "#3b82f6", "#f59e0b"]}
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
                      data={data.sebaranFakultas}
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
                    data={data.heatmapPendidikanJabfung}
                    height={350}
                    minColor="#f3e8ff"
                    maxColor="#7e22ce"
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
                    data={data.heatmapUsiaJabfung}
                    height={350}
                    minColor="#ffedd5"
                    maxColor="#c2410c"
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
                      data={data.ikatanKerja}
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
                      data={data.genderUsia}
                      height={320}
                      colors={["#3b82f6", "#ec4899"]}
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
                    data={data.sertifikasiJabfung}
                    stacked={true}
                    height={300}
                    colors={["#10b981", "#e5e7eb"]}
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
                    data={data.trendSertifikasi}
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
                    data={data.trendJabfung}
                    stacked={true}
                    height={350}
                    showLegend={true}
                    colors={["#fab005", "#228be6", "#4dabf7"]}
                    xAxisLabel="Tahun"
                  />
                </CardBody>
              </Card>
            </div>
          </>
        )}

      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
