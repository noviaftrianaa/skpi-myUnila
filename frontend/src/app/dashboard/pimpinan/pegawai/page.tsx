"use client";

import React, { useState, useEffect } from "react";
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
  PieChart,
  BarChart,
  PyramidChart,
  FilterPanel,
  DashboardSkeleton,
  ErrorAlert,
} from "../components";
import { useDashboardData, useDashboardReference } from "../hooks";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { PegawaiData } from "../types";
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

export default function DashboardPegawaiPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();

  const [selectedSemesters, setSelectedSemesters] = useState<Set<string>>(new Set());
  const [unitItems, setUnitItems] = useState<string[]>([]);
  const unitFilterStr = unitItems.join(",");
  const [orgFilters, setOrgFilters] = useState<MahasiswaFilters | null>(null);

  useEffect(() => {
    mahasiswaDataService.getFilters({
      id_fakultas: scope.forcedFakultas || undefined,
      id_jurusan: scope.forcedJurusan || undefined,
    }).then(setOrgFilters).catch(console.error);
  }, [scope.forcedFakultas, scope.forcedJurusan]);

  const { semester, activeSemesters } = useDashboardReference();

  useEffect(() => {
    if (activeSemesters.length > 0 && selectedSemesters.size === 0) {
      setSelectedSemesters(new Set(activeSemesters));
    }
  }, [activeSemesters]); // eslint-disable-line react-hooks/exhaustive-deps

  const semesterParam = Array.from(selectedSemesters).join(",");
  const { data, loading, error, refetch } = useDashboardData<PegawaiData>(
    ENDPOINTS.DASHBOARD_PIMPINAN.PEGAWAI,
    {
      semester: semesterParam,
      ...(scope.forcedFakultas && { fakultas: scope.forcedFakultas }),
      ...(scope.forcedProdi && { prodi: scope.forcedProdi }),
      ...(unitFilterStr && { unit_filter: unitFilterStr }),
    }
  );

  const handleReset = () => {
    setSelectedSemesters(new Set(activeSemesters));
    setUnitItems([]);
  };

  const handleExport = (fmtType: ExportFormat) => {
    if (!data) { toast.error("Data belum dimuat"); return; }
    const rows = (data.sebaranUnitKerja || []).map((r) => ({ unit: r.name, jumlah: r.value }));
    if (!rows.length) { toast.error("Tidak ada data"); return; }
    const baseName = `pegawai-unit-kerja`;
    const headers = { unit: "Unit Kerja", jumlah: "Jumlah Tendik" } as const;
    if (fmtType === "excel") { exportToExcel(rows as unknown as Record<string, unknown>[], baseName, "Pegawai", headers); toast.success("Excel di-download"); }
    else if (fmtType === "csv-client") { exportToCsv(rows as unknown as Record<string, unknown>[], baseName, headers); toast.success("CSV di-download"); }
    else if (fmtType === "pdf") { exportToPdf(rows as unknown as Record<string, unknown>[], baseName, { title: "Tendik per Unit Kerja", headers, orientation: "landscape" }); toast.success("PDF di-download"); }
    else if (fmtType === "json") { exportToJson(rows, baseName); toast.success("JSON di-download"); }
    else { toast("Server export belum tersedia"); }
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiUsers className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <Toaster position="top-right" />
      <div className="p-6 space-y-6">
        <ScopeBadge />
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

        {/* Filter — konsisten dgn dashboard lain */}
        <FilterPanel
          semester={semester}
          selectedSemesters={selectedSemesters}
          onSemesterChange={setSelectedSemesters}
          showFakultas={false}
          showProdi={false}
          scopeBadge={scope.scopeName}
          onReset={handleReset}
        />
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
            {/* Stats — 4 metric konsisten dengan dashboard lain */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Total Tendik"
                value={data.stats.total.total}
                icon={<FiUsers className="w-6 h-6 text-white" />}
                color="blue"
                trend={undefined}
                href="/dashboard/data-unila/dosen/tendik"
                hint="Lihat detail tenaga kependidikan"
              />
              <StatCard
                title="PNS"
                value={data.stats.pns.total}
                icon={<FiUserCheck className="w-6 h-6 text-white" />}
                color="green"
                trend={undefined}
                href="/dashboard/data-unila/dosen/tendik"
                hint="Lihat detail tendik (filter PNS di halaman)"
              />
              <StatCard
                title="Non-PNS"
                value={data.stats.nonPns.total}
                icon={<FiBriefcase className="w-6 h-6 text-white" />}
                color="purple"
                trend={undefined}
                href="/dashboard/data-unila/dosen/tendik"
                hint="Lihat detail tendik (filter Non-PNS di halaman)"
              />
              <StatCard
                title="Unit Kerja"
                value={data.sebaranUnitKerja?.length ?? 0}
                subtitle="Sebaran tendik"
                icon={<FiAward className="w-6 h-6 text-white" />}
                color="cyan"
              />
            </div>

            {/* Row 1: Status Kepegawaian & Sebaran Unit Kerja */}
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
                <CardBody className="min-h-[480px]">
                  <PieChart
                    data={data.statusKepegawaian}
                    donut={true}
                    showLegend={true}
                    height={300}
                    colors={["#10b981", "#3b82f6", "#f59e0b", "#6b7280"]}
                  />
                </CardBody>
              </Card>

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
                <CardBody className="min-h-[480px]">
                  <BarChart
                    data={data.sebaranUnitKerja}
                    height={300}
                    colors={["#3b82f6"]}
                    horizontal={true}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Row 2: Demografi (Pyramid & Pendidikan) */}
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
                    data={data.genderUsia}
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
                <CardBody className="min-h-[480px]">
                  <PieChart
                    data={data.pendidikan}
                    donut={false}
                    showLegend={true}
                    height={350}
                    colors={["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4"]}
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
