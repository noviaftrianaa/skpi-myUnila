"use client";

import React, { useState, useEffect } from "react";
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
  DashboardSkeleton,
  ErrorAlert,
} from "../components";
import { useDashboardData, useDashboardReference } from "../hooks";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { PublikasiData } from "../types";
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

export default function DashboardPublikasiPage() {
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

  const semesterParam = Array.from(selectedSemesters).join(",");
  const { data, loading, error, refetch } = useDashboardData<PublikasiData>(
    ENDPOINTS.DASHBOARD_PIMPINAN.PUBLIKASI,
    { semester: semesterParam, ...(scope.forcedFakultas ? { fakultas: scope.forcedFakultas } : (selectedFakultas && { fakultas: selectedFakultas })), ...(scope.forcedProdi && { prodi: scope.forcedProdi }), ...(unitFilterStr && { unit_filter: unitFilterStr }) }
  );

  const handleReset = () => {
    setSelectedSemesters(new Set(activeSemesters));
    setSelectedFakultas("");
    setUnitItems([]);
  };

  const handleExport = (fmtType: ExportFormat) => {
    if (!data) { toast.error("Data belum dimuat"); return; }
    const rows = (data.perFakultas || []).map((r) => ({ fakultas: r.name, jumlah: r.value }));
    if (!rows.length) { toast.error("Tidak ada data"); return; }
    const baseName = `publikasi-fakultas-${semesterParam || "all"}`;
    const headers = { fakultas: "Fakultas", jumlah: "Jumlah Publikasi" } as const;
    if (fmtType === "excel") { exportToExcel(rows as unknown as Record<string, unknown>[], baseName, "Publikasi", headers); toast.success("Excel di-download"); }
    else if (fmtType === "csv-client") { exportToCsv(rows as unknown as Record<string, unknown>[], baseName, headers); toast.success("CSV di-download"); }
    else if (fmtType === "pdf") { exportToPdf(rows as unknown as Record<string, unknown>[], baseName, { title: "Publikasi per Fakultas", headers, orientation: "landscape" }); toast.success("PDF di-download"); }
    else if (fmtType === "json") { exportToJson(rows, baseName); toast.success("JSON di-download"); }
    else { toast("Server export belum tersedia"); }
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiBook className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <Toaster position="top-right" />
      <div className="p-6 space-y-6">
        <ScopeBadge />
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
          semester={semester}
          selectedSemesters={selectedSemesters}
          onSemesterChange={setSelectedSemesters}
          fakultas={fakultas}
          selectedFakultas={selectedFakultas}
          showFakultas={scope.canChangeFakultas}
          scopeBadge={scope.scopeName}
          onFakultasChange={setSelectedFakultas}
          showProdi={false}
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
                title="Total Publikasi"
                value={data.stats.total.total}
                icon={<FiBook className="w-6 h-6 text-white" />}
                color="indigo"
                trend={{ value: data.stats.total.trend ?? 0, label: "YoY" }}
                href="/dashboard/data-unila/tridarma/publikasi"
                hint="Lihat detail publikasi ilmiah dosen"
              />
              <StatCard
                title="Top Penulis"
                value={data.topAuthors?.[0]?.value ?? 0}
                subtitle={data.topAuthors?.[0]?.name ?? "—"}
                icon={<FiAward className="w-6 h-6 text-white" />}
                color="green"
              />
              <StatCard
                title="Fakultas Aktif"
                value={data.perFakultas?.length ?? 0}
                subtitle="Memiliki publikasi"
                icon={<FiGlobe className="w-6 h-6 text-white" />}
                color="cyan"
              />
              <StatCard
                title="Pertumbuhan"
                value={(() => {
                  const t = data.trendPublikasi || [];
                  if (t.length < 2) return "—";
                  const last = Number(t[t.length - 1]?.value || 0);
                  const prev = Number(t[t.length - 2]?.value || 0);
                  if (!prev) return "—";
                  const pct = Math.round(((last - prev) / prev) * 100);
                  return `${pct > 0 ? "+" : ""}${pct}%`;
                })()}
                subtitle="Year-over-Year"
                icon={<FiTrendingUp className="w-6 h-6 text-white" />}
                color="purple"
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
                    data={data.trendPublikasi}
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
                    data={data.jenisPublikasi}
                    donut={true}
                    height={300}
                    colors={["#3b82f6", "#10b981", "#f97316", "#ef4444", "#f59e0b"]}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Row 2: Top Authors & Sebaran Fakultas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Authors */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Top Dosen Produktif
                    </h2>
                    <p className="text-sm text-gray-500">Berdasarkan jumlah publikasi tahun ini</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <BarChart
                    data={data.topAuthors}
                    height={300}
                    horizontal={true}
                    colors={["#10b981"]}
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
                    data={data.perFakultas}
                    height={300}
                    colors={["#3b82f6"]}
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
