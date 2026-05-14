"use client";

import React, { useState, useEffect } from "react";
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
  DashboardSkeleton,
  ErrorAlert,
} from "../components";
import { useDashboardData, useDashboardReference } from "../hooks";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { KeuanganData } from "../types";
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
  const { data, loading, error, refetch } = useDashboardData<KeuanganData>(
    ENDPOINTS.DASHBOARD_PIMPINAN.KEUANGAN,
    { semester: semesterParam, ...(scope.forcedFakultas ? { fakultas: scope.forcedFakultas } : (selectedFakultas && { fakultas: selectedFakultas })), ...(scope.forcedProdi && { prodi: scope.forcedProdi }), ...(unitFilterStr && { unit_filter: unitFilterStr }) }
  );

  const handleReset = () => {
    setSelectedSemesters(new Set(activeSemesters));
    setSelectedFakultas("");
    setUnitItems([]);
  };

  const handleExport = (fmtType: ExportFormat) => {
    if (!data) { toast.error("Data belum dimuat"); return; }
    const rows = (data.tunggakanFakultas || []).map((r) => ({ fakultas: r.name, jumlah: r.value }));
    if (!rows.length) { toast.error("Tidak ada data"); return; }
    const baseName = `keuangan-tunggakan-${semesterParam || "all"}`;
    const headers = { fakultas: "Fakultas", jumlah: "Jumlah Tunggakan" } as const;
    if (fmtType === "excel") { exportToExcel(rows as unknown as Record<string, unknown>[], baseName, "Keuangan", headers); toast.success("Excel di-download"); }
    else if (fmtType === "csv-client") { exportToCsv(rows as unknown as Record<string, unknown>[], baseName, headers); toast.success("CSV di-download"); }
    else if (fmtType === "pdf") { exportToPdf(rows as unknown as Record<string, unknown>[], baseName, { title: "Tunggakan Keuangan per Fakultas", headers, orientation: "landscape" }); toast.success("PDF di-download"); }
    else if (fmtType === "json") { exportToJson(rows, baseName); toast.success("JSON di-download"); }
    else { toast("Server export belum tersedia"); }
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiDollarSign className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <Toaster position="top-right" />
      <div className="p-6 space-y-6">
        <ScopeBadge />
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
                title="Total Pendapatan"
                value={formatCompact(data.stats.pendapatan.total as number)}
                icon={<FiDollarSign className="w-6 h-6 text-white" />}
                color="green"
                trend={{ value: data.stats.pendapatan.trend ?? 0, label: "YoY" }}
              />
              <StatCard
                title="Pendapatan SPP"
                value={formatCompact(data.stats.spp.total as number)}
                icon={<FiCreditCard className="w-6 h-6 text-white" />}
                color="blue"
                trend={{ value: data.stats.spp.trend ?? 0, label: "YoY" }}
                href="/dashboard/data-unila/keuangan/spp"
                hint="Lihat detail pembayaran SPP mahasiswa"
              />
              <StatCard
                title="Sumber Pendapatan"
                value={data.komposisiPendapatan?.length ?? 0}
                subtitle="Jenis pendapatan"
                icon={<FiPieChart className="w-6 h-6 text-white" />}
                color="indigo"
              />
              <StatCard
                title="Tunggakan Tertinggi"
                value={formatCompact(Number(data.tunggakanFakultas?.[0]?.value ?? 0))}
                subtitle={data.tunggakanFakultas?.[0]?.name ?? "—"}
                icon={<FiActivity className="w-6 h-6 text-white" />}
                color="red"
              />
            </div>

            {/* Row 1: Trend SPP & Komposisi Pendapatan */}
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
                    data={data.trendPendapatanSPP}
                    height={300}
                    showArea={true}
                    color="#10b981"
                    valueFormatter={formatCompact}
                  />
                </CardBody>
              </Card>

              {/* Komposisi Pendapatan */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Komposisi Pendapatan
                    </h2>
                    <p className="text-sm text-gray-500">Sumber pendapatan universitas</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <PieChart
                    data={data.komposisiPendapatan}
                    donut={true}
                    height={300}
                    valueFormatter={formatCompact}
                    colors={["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#6b7280"]}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Row 2: Status Pembayaran & Pendapatan per UKT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Pembayaran */}
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Metode Pembayaran UKT
                    </h2>
                    <p className="text-sm text-gray-500">Distribusi metode pembayaran mahasiswa</p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <PieChart
                    data={data.statusPembayaran}
                    donut={false}
                    height={300}
                    colors={["#22c55e", "#ef4444", "#eab308", "#3b82f6"]}
                  />
                </CardBody>
              </Card>

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
                    data={data.pendapatanPerUKT}
                    height={300}
                    colors={["#3b82f6"]}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Row 3: Pembayaran per Fakultas */}
            <Card className="bg-white dark:bg-gray-800 shadow-md">
              <CardHeader>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Pembayaran UKT per Fakultas
                  </h2>
                  <p className="text-sm text-gray-500">Total pembayaran UKT per fakultas</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <BarChart
                  data={data.tunggakanFakultas}
                  height={300}
                  horizontal={true}
                  colors={["#3b82f6"]}
                  xAxisLabel="Total Pembayaran"
                />
              </CardBody>
            </Card>
          </>
        )}

      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
