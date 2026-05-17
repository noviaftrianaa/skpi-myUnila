"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import {
  FiCheckCircle,
  FiAward,
  FiAlertCircle,
  FiList,
  FiGlobe,
  FiAlertTriangle,
} from "react-icons/fi";
import { pimpinanMenuConfig } from "../config/menuConfig";
import {
  StatCard,
  PieChart,
  BarChart,
  DrilldownBarChart,
  DashboardSkeleton,
  ErrorAlert,
} from "../components";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { useDashboardData } from "../hooks";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { AkreditasiData, AkreditasiDetail, AkreditasiIntlDetail, ExpiryCalendarItem } from "../types";
import Link from "next/link";
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

const akredColumns: Column<AkreditasiDetail>[] = [
  { key: "fak", label: "Fakultas", sortable: true },
  { key: "prodi", label: "Program Studi", sortable: true },
  { key: "strata", label: "Jenjang", sortable: true },
  {
    key: "rank",
    label: "Peringkat",
    sortable: true,
    render: (item) => (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          item.rank === "Unggul" || item.rank === "A"
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : item.rank === "Baik Sekali" || item.rank === "B"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
        }`}
      >
        {item.rank}
      </span>
    ),
  },
  { key: "no_sk", label: "No SK", sortable: true, render: (i) => (
    <span className="font-mono text-xs text-gray-700 dark:text-gray-300 break-words">{(i as { no_sk?: string | null }).no_sk || "—"}</span>
  )},
  { key: "exp", label: "Masa Berlaku", sortable: true },
];

const intlDetailColumns: Column<AkreditasiIntlDetail>[] = [
  { key: "prodi", label: "Program Studi", sortable: true },
  { key: "fak", label: "Fakultas", sortable: true },
  { key: "strata", label: "Jenjang", sortable: true },
  { key: "lembaga", label: "Lembaga", sortable: true },
  { key: "exp", label: "Masa Berlaku", sortable: true },
];

export default function DashboardAkreditasiPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const [unitItems, setUnitItems] = useState<string[]>([]);
  const unitFilterStr = unitItems.join(",");
  const [orgFilters, setOrgFilters] = useState<MahasiswaFilters | null>(null);

  useEffect(() => {
    mahasiswaDataService.getFilters({
      id_fakultas: scope.forcedFakultas || undefined,
      id_jurusan: scope.forcedJurusan || undefined,
    }).then(setOrgFilters).catch(console.error);
  }, [scope.forcedFakultas, scope.forcedJurusan]);

  const { data, loading, error, refetch } = useDashboardData<AkreditasiData>(
    ENDPOINTS.DASHBOARD_PIMPINAN.AKREDITASI,
    {
      ...(scope.forcedFakultas && { fakultas: scope.forcedFakultas }),
      ...(scope.forcedProdi && { prodi: scope.forcedProdi }),
      ...(unitFilterStr && { unit_filter: unitFilterStr }),
    }
  );

  const handleExport = (fmtType: ExportFormat) => {
    if (!data) { toast.error("Data belum dimuat"); return; }
    const rows = (data.detailTable || []) as unknown as Record<string, unknown>[];
    if (!rows.length) { toast.error("Tidak ada data"); return; }
    const baseName = `akreditasi-prodi`;
    const headers = { fak: "Fakultas", prodi: "Program Studi", strata: "Jenjang", rank: "Peringkat", no_sk: "No SK", exp: "Masa Berlaku" } as const;
    if (fmtType === "excel") { exportToExcel(rows, baseName, "Akreditasi", headers); toast.success("Excel di-download"); }
    else if (fmtType === "csv-client") { exportToCsv(rows, baseName, headers); toast.success("CSV di-download"); }
    else if (fmtType === "pdf") { exportToPdf(rows, baseName, { title: "Akreditasi Prodi Universitas Lampung", headers, orientation: "landscape" }); toast.success("PDF di-download"); }
    else if (fmtType === "json") { exportToJson(rows, baseName); toast.success("JSON di-download"); }
    else { toast("Server export belum tersedia"); }
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiCheckCircle className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <Toaster position="top-right" />
      <div className="p-6 space-y-6">
        <ScopeBadge />
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
            {/* Alert banner kalau ada prodi yg expire ≤ 90 hari atau sudah expired */}
            {((data.stats.akanExpire?.total ?? 0) > 0 || (data.stats.expired?.total ?? 0) > 0) && (
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-rose-50 dark:from-amber-950/30 dark:to-rose-950/30 dark:border-amber-800/50 p-4 sm:p-5 flex items-start gap-3">
                <FiAlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold text-amber-900 dark:text-amber-200">Peringatan Akreditasi</span>
                    <span className="text-xs text-amber-700 dark:text-amber-400">— masa berlaku akreditasi prodi</span>
                  </div>
                  <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                    {(data.stats.akanExpire?.total ?? 0) > 0 && (
                      <span><strong>{data.stats.akanExpire?.total}</strong> prodi akan kadaluarsa dalam 90 hari. </span>
                    )}
                    {(data.stats.expired?.total ?? 0) > 0 && (
                      <span><strong>{data.stats.expired?.total}</strong> prodi sudah lewat masa berlaku — perlu re-akreditasi segera.</span>
                    )}
                  </p>
                  <a href="/dashboard/data-unila/akademik/akreditasi?expiring=alert" className="inline-block mt-2 text-sm font-medium text-amber-700 dark:text-amber-300 underline decoration-amber-300 decoration-dotted hover:decoration-solid">
                    Lihat detail prodi terkait →
                  </a>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className={`grid grid-cols-2 gap-4 ${(data.stats.internasional?.total || 0) > 0 ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
              <StatCard
                title="Total Prodi"
                value={data.stats.totalProdi.total}
                icon={<FiList className="w-6 h-6 text-white" />}
                color="cyan"
                trend={undefined}
                href="/dashboard/data-unila/akademik/prodi"
                hint="Klik untuk daftar program studi"
              />
              <StatCard
                title="Unggul / A"
                value={data.stats.unggul.total}
                icon={<FiAward className="w-6 h-6 text-white" />}
                color="green"
                trend={undefined}
              />
              <StatCard
                title="Baik Sekali / B"
                value={data.stats.baikSekali.total}
                icon={<FiCheckCircle className="w-6 h-6 text-white" />}
                color="blue"
                trend={undefined}
              />
              <StatCard
                title="Baik / C"
                value={data.stats.baik.total}
                icon={<FiAlertCircle className="w-6 h-6 text-white" />}
                color="yellow"
                trend={undefined}
              />
              {(data.stats.internasional?.total || 0) > 0 && (
                <StatCard
                  title="Internasional"
                  value={data.stats.internasional.total}
                  icon={<FiGlobe className="w-6 h-6 text-white" />}
                  color="purple"
                  trend={undefined}
                />
              )}
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
                    data={data.distribusiAkreditasi}
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
                    data={data.statusKadaluarsa}
                    height={300}
                    horizontal={true}
                    colors={["#ef4444", "#f97316", "#f59e0b", "#10b981"]}
                  />
                </CardBody>
              </Card>
            </div>

            {/* Row 2: Sebaran per Fakultas (DrilldownBarChart) - full width */}
            <Card className="bg-white dark:bg-gray-800 shadow-md">
              <CardHeader>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {scope.forcedFakultas ? "Sebaran Akreditasi per Program Studi" : "Sebaran Akreditasi per Fakultas"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {scope.forcedFakultas
                      ? "Jumlah peringkat akreditasi prodi di fakultas ini"
                      : "Jumlah program studi terakreditasi per fakultas (klik bar untuk drilldown ke prodi)"}
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="min-h-[480px]">
                <DrilldownBarChart
                  data={data.sebaranFakultas}
                  title={scope.forcedFakultas ? "Akreditasi Prodi" : "Sebaran Akreditasi per Fakultas"}
                  color="#3b82f6"
                  height={460}
                />
              </CardBody>
            </Card>

            {/* Row 3: Akreditasi per Fakultas Stacked - full width */}
            <Card className="bg-white dark:bg-gray-800 shadow-md">
              <CardHeader>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {scope.forcedFakultas ? "Akreditasi per Program Studi (Stacked)" : "Akreditasi per Fakultas (Stacked)"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {scope.forcedFakultas
                      ? "Distribusi peringkat akreditasi prodi di fakultas ini"
                      : "Distribusi peringkat akreditasi di setiap fakultas"}
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="min-h-[480px]">
                <BarChart
                  data={data.akreditasiPerFakultas}
                  height={460}
                  stacked={true}
                  colors={["#10b981", "#059669", "#3b82f6", "#f59e0b", "#ef4444"]}
                />
              </CardBody>
            </Card>

            {/* Row 4: Akreditasi Internasional & Detail — HIDE saat data kosong */}
            {(data.internasional?.length > 0 || data.internasionalDetail?.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.internasional?.length > 0 && (
                  <Card className="bg-white dark:bg-gray-800 shadow-md">
                    <CardHeader>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Akreditasi Internasional</h2>
                        <p className="text-sm text-gray-500">Jumlah prodi per lembaga akreditasi internasional</p>
                      </div>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                      <BarChart data={data.internasional} height={350} horizontal={true} colors={["#8b5cf6"]} />
                    </CardBody>
                  </Card>
                )}
                {data.internasionalDetail?.length > 0 && (
                  <Card className="bg-white dark:bg-gray-800 shadow-md">
                    <CardHeader>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detail Akreditasi Internasional</h2>
                        <p className="text-sm text-gray-500">Daftar prodi dengan sertifikasi internasional aktif</p>
                      </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="p-0">
                      <DataTable
                        data={data.internasionalDetail}
                        columns={intlDetailColumns}
                        searchable
                        searchKeys={["prodi", "fak", "lembaga"]}
                        searchPlaceholder="Cari prodi internasional..."
                        defaultRowsPerPage={5}
                        noWrapper
                      />
                    </CardBody>
                  </Card>
                )}
              </div>
            )}

            {/* Expiring Warning Card */}
            {data.expiringProdi.length > 0 && (
              <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                      <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">
                        Peringatan: Akreditasi Segera Kadaluarsa
                      </h2>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {data.expiringProdi.length} program studi memiliki akreditasi yang akan
                        berakhir dalam 1 tahun ke depan
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <Divider className="bg-red-200 dark:bg-red-800" />
                <CardBody>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-red-200 dark:divide-red-800">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wider">
                            Program Studi
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wider">
                            Fakultas
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wider">
                            Jenjang
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wider">
                            Peringkat
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wider">
                            Masa Berlaku
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100 dark:divide-red-900">
                        {data.expiringProdi.map((row, idx) => (
                          <tr key={idx} className="hover:bg-red-100/50 dark:hover:bg-red-900/30">
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                              {row.prodi}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                              {row.fak}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                              {row.strata}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  row.rank === "Unggul" || row.rank === "A"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : row.rank === "Baik Sekali" || row.rank === "B"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                }`}
                              >
                                {row.rank}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400">
                              {row.exp}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Detail Table (DataTable) - full width */}
            <Card className="bg-white dark:bg-gray-800 shadow-md">
              <CardHeader>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detail Status Akreditasi Program Studi
                  </h2>
                  <p className="text-sm text-gray-500">
                    Daftar lengkap status akreditasi nasional dan internasional
                  </p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="p-0">
                <DataTable
                  data={data.detailTable}
                  columns={akredColumns}
                  searchable
                  searchKeys={["prodi", "fak", "rank", "strata"]}
                  searchPlaceholder="Cari program studi..."
                  noWrapper
                />
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}

// =========================================================================
// Expiry Calendar Strip — 12 mini-cards (this month → 12 months ahead),
// severity color, klik → drill-down ke /data-unila/akademik/akreditasi
// =========================================================================
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

type Severity = "red" | "orange" | "amber" | "green";

function severityFor(monthsAhead: number): Severity {
  if (monthsAhead <= 0) return "red";
  if (monthsAhead <= 3) return "orange";
  if (monthsAhead <= 6) return "amber";
  return "green";
}

const SEVERITY_CLASS: Record<Severity, { bg: string; border: string; text: string; bar: string }> = {
  red:    { bg: "bg-red-50 dark:bg-red-950/30",     border: "border-red-300 dark:border-red-700",       text: "text-red-700 dark:text-red-300",       bar: "bg-red-500" },
  orange: { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-300 dark:border-orange-700", text: "text-orange-700 dark:text-orange-300", bar: "bg-orange-500" },
  amber:  { bg: "bg-amber-50 dark:bg-amber-950/30",   border: "border-amber-300 dark:border-amber-700",   text: "text-amber-700 dark:text-amber-300",   bar: "bg-amber-500" },
  green:  { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-300 dark:border-emerald-700", text: "text-emerald-700 dark:text-emerald-300", bar: "bg-emerald-500" },
};

function ExpiryCalendarStrip({ data }: { data: ExpiryCalendarItem[] }) {
  // Map year-month → count
  const map = new Map<string, number>();
  data.forEach((d) => {
    const key = `${d.year}-${String(d.month).padStart(2, "0")}`;
    map.set(key, (map.get(key) || 0) + d.expiring_count);
  });

  // Build 12 consecutive months starting from current month
  const now = new Date();
  const months: { year: number; month: number; key: string; label: string; monthsAhead: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    months.push({
      year: y,
      month: m,
      key: `${y}-${String(m).padStart(2, "0")}`,
      label: `${MONTH_LABELS[m - 1]} ${String(y).slice(2)}`,
      monthsAhead: i,
    });
  }
  const maxCount = months.reduce((acc, m) => Math.max(acc, map.get(m.key) || 0), 0) || 1;

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <div className="flex gap-3 min-w-max pb-2">
        {months.map((m) => {
          const count = map.get(m.key) || 0;
          const sev = count > 0 ? severityFor(m.monthsAhead) : "green";
          const cls = SEVERITY_CLASS[sev];
          const href = `/dashboard/data-unila/akademik/akreditasi?expiring=soon&month=${m.key}`;
          const pct = Math.round((count / maxCount) * 100);
          return (
            <Link
              key={m.key}
              href={href}
              className={`group block w-[88px] sm:w-[100px] shrink-0 rounded-xl border ${cls.bg} ${cls.border} px-3 py-2.5 hover:shadow-md transition-shadow`}
              title={`${m.label}: ${count} prodi akan kadaluarsa`}
            >
              <div className={`text-[10px] uppercase tracking-wider font-semibold ${cls.text}`}>
                {m.label}
              </div>
              <div className={`mt-1 text-2xl sm:text-3xl font-bold leading-none ${cls.text}`}>
                {count}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">prodi</div>
              <div className="mt-2 h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className={`h-full ${cls.bar} group-hover:opacity-80 transition-all`} style={{ width: `${count > 0 ? Math.max(8, pct) : 0}%` }} />
              </div>
            </Link>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-gray-500 dark:text-gray-400">
        <LegendDot color="bg-red-500"     label="Bulan ini" />
        <LegendDot color="bg-orange-500"  label="≤ 3 bulan" />
        <LegendDot color="bg-amber-500"   label="≤ 6 bulan" />
        <LegendDot color="bg-emerald-500" label="> 6 bulan" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
