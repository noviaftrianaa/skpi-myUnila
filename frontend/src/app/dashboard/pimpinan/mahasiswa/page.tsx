"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import {
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiAward,
  FiRefreshCw,
  FiMapPin,
  FiGlobe,
  FiBookOpen,
  FiDollarSign,
  FiActivity,
  FiPieChart,
  FiAlertTriangle,
} from "react-icons/fi";
import { pimpinanMenuConfig } from "../config/menuConfig";
import {
  StatCard,
  LineChart,
  PieChart,
  BarChart,
  DrilldownBarChart,
  DashboardSkeleton,
  ErrorAlert,
} from "../components";
import { useDashboardData, useDashboardReference } from "../hooks";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { MahasiswaData } from "../types";
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

// ===== Reusable tailwind UI blocks =====

function SectionCard({
  title,
  subtitle,
  icon,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}>
      <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-3 dark:border-slate-700">
        {icon && <div className="mt-0.5 text-slate-500 dark:text-slate-400">{icon}</div>}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function EmptyChartPlaceholder({ message = "Data tidak tersedia pada filter ini", height = 260 }: { message?: string; height?: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-center dark:border-slate-700 dark:bg-slate-900/30"
      style={{ height }}
    >
      <FiPieChart className="mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
      <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

export default function DashboardMahasiswaPage() {
  useRequireAuth();

  const [selectedSemesters, setSelectedSemesters] = useState<Set<string>>(new Set());
  const [selectedFakultas, setSelectedFakultas] = useState("");
  const [selectedProdi, setSelectedProdi] = useState("");
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

  const { fakultas, semester, activeSemesters, getProdiByFakultas } = useDashboardReference();

  useEffect(() => {
    if (activeSemesters.length > 0 && selectedSemesters.size === 0) {
      setSelectedSemesters(new Set(activeSemesters));
    }
  }, [activeSemesters]); // eslint-disable-line react-hooks/exhaustive-deps

  const semesterParam = Array.from(selectedSemesters).join(",");
  const { data, loading, error, refetch } = useDashboardData<MahasiswaData>(
    ENDPOINTS.DASHBOARD_PIMPINAN.MAHASISWA,
    {
      semester: semesterParam,
      ...(selectedFakultas && { fakultas: selectedFakultas }),
      ...(selectedProdi && { prodi: selectedProdi }),
      ...(unitFilterStr && { unit_filter: unitFilterStr }),
    }
  );

  const handleExport = (fmtType: ExportFormat) => {
    if (!data) { toast.error("Data belum dimuat"); return; }
    const rows = (data.sebaranFakultas || []).map((r) => ({ fakultas: r.name, jumlah: r.value }));
    if (!rows.length) { toast.error("Tidak ada data sebaran"); return; }
    const baseName = `mahasiswa-sebaran-${semesterParam || "all"}`;
    const headers = { fakultas: "Fakultas", jumlah: "Jumlah Mahasiswa" } as const;
    if (fmtType === "excel") { exportToExcel(rows as unknown as Record<string, unknown>[], baseName, "Mahasiswa", headers); toast.success("Excel di-download"); }
    else if (fmtType === "csv-client") { exportToCsv(rows as unknown as Record<string, unknown>[], baseName, headers); toast.success("CSV di-download"); }
    else if (fmtType === "pdf") { exportToPdf(rows as unknown as Record<string, unknown>[], baseName, { title: "Sebaran Mahasiswa per Fakultas", headers, orientation: "landscape" }); toast.success("PDF di-download"); }
    else if (fmtType === "json") { exportToJson(rows, baseName); toast.success("JSON di-download"); }
    else { toast("Server export belum tersedia"); }
  };

  const handleFakultasChange = (value: string) => {
    setSelectedFakultas(value);
    setSelectedProdi("");
  };

  const handleReset = () => {
    setSelectedSemesters(new Set(activeSemesters));
    setSelectedFakultas("");
    setSelectedProdi("");
    setUnitItems([]);
  };

  const availableProdi = useMemo(
    () => (selectedFakultas ? getProdiByFakultas(selectedFakultas) : []),
    [selectedFakultas, getProdiByFakultas]
  );

  const isFilterDirty =
    !!selectedFakultas ||
    !!selectedProdi ||
    (activeSemesters.length > 0 && [...selectedSemesters].sort().join() !== [...activeSemesters].sort().join());

  // Summary active semester label for header
  const activeSemesterLabel = useMemo(() => {
    if (selectedSemesters.size === 0) return "-";
    const ids = Array.from(selectedSemesters);
    const first = semester.find(s => String(s.id_smt) === ids[0]);
    return ids.length === 1
      ? (first?.nm_smt ?? ids[0])
      : `${ids.length} semester terpilih`;
  }, [selectedSemesters, semester]);

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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <FiUsers className="h-8 w-8 text-blue-600" />
              Dashboard Mahasiswa
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Potret mahasiswa aktif Universitas Lampung — demografi, akademik, geografis, warning masa studi.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                <FiActivity className="h-3 w-3" /> Periode: {activeSemesterLabel}
              </span>
              {selectedFakultas && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-200">
                  Fakultas: {fakultas.find(f => f.id_fakultas === selectedFakultas)?.nm_fakultas ?? selectedFakultas.slice(0, 8)}
                </span>
              )}
              {selectedProdi && (
                <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2.5 py-1 font-medium text-pink-800 dark:bg-pink-900/40 dark:text-pink-200">
                  Prodi: {availableProdi.find(p => p.id_sms === selectedProdi)?.nm_prodi ?? selectedProdi.slice(0, 8)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {/* Filter — pure tailwind, no HeroUI */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Filter</h2>
            <div className="flex items-center gap-2">
              <ExportMenu onExport={handleExport} disabled={{ "csv-server": true }} />
              {isFilterDirty && (
                <button
                  onClick={handleReset}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <div className="mb-3">
            <UnitFilter
              data={orgFilters}
              value={unitItems}
              onChange={(next) => setUnitItems(next)}
              forcedFakultas={scope.forcedFakultas || undefined}
              forcedJurusan={scope.forcedJurusan || undefined}
              forcedProdi={scope.forcedProdi || undefined}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {/* Semester (multi-select via checkbox list) */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Semester {selectedSemesters.size > 0 && <span className="font-normal text-slate-400">({selectedSemesters.size} dipilih)</span>}
              </label>
              <details className="group rounded-lg border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
                <summary className="cursor-pointer list-none px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 flex items-center justify-between">
                  <span className="truncate">
                    {selectedSemesters.size === 0
                      ? "Pilih semester..."
                      : selectedSemesters.size === 1
                        ? (semester.find(s => String(s.id_smt) === Array.from(selectedSemesters)[0])?.nm_smt ?? "-")
                        : `${selectedSemesters.size} semester`}
                  </span>
                  <svg className="h-4 w-4 transition-transform group-open:rotate-180" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                </summary>
                <div className="max-h-60 overflow-y-auto border-t border-slate-200 p-2 dark:border-slate-700">
                  {semester.length === 0 && <p className="px-2 py-3 text-xs text-slate-400">Memuat...</p>}
                  {semester.map(s => {
                    const key = String(s.id_smt);
                    const checked = selectedSemesters.has(key);
                    return (
                      <label key={key} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            const next = new Set(selectedSemesters);
                            if (e.target.checked) next.add(key);
                            else next.delete(key);
                            setSelectedSemesters(next);
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-slate-700 dark:text-slate-200">{s.nm_smt}</span>
                      </label>
                    );
                  })}
                </div>
              </details>
            </div>

            {/* Fakultas */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Fakultas</label>
              <select
                value={selectedFakultas}
                onChange={e => handleFakultasChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Seluruh Fakultas</option>
                {fakultas.map(f => (
                  <option key={f.id_fakultas} value={f.id_fakultas}>{f.nm_fakultas}</option>
                ))}
              </select>
            </div>

            {/* Prodi (cascading) */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Prodi {!selectedFakultas && <span className="font-normal text-slate-400">(pilih fakultas dulu)</span>}
              </label>
              <select
                value={selectedProdi}
                onChange={e => setSelectedProdi(e.target.value)}
                disabled={!selectedFakultas}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
              >
                <option value="">Seluruh Prodi</option>
                {availableProdi.map(p => (
                  <option key={p.id_sms} value={p.id_sms}>{p.nm_prodi}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading && <DashboardSkeleton />}
        {error && <ErrorAlert message={error} onRetry={refetch} />}

        {!loading && !error && data && (
          <>
            {/* Stats Grid — KPI utama */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <StatCard
                title="Mahasiswa Aktif"
                value={data.stats.aktif.total}
                icon={<FiUserCheck className="w-6 h-6 text-white" />}
                color="blue"
                trend={{ value: data.stats.aktif.trend ?? 0, label: "YoY" }}
                href="/dashboard/data-unila/mahasiswa?status=aktif"
                hint="Lihat detail mahasiswa berstatus aktif"
              />
              <StatCard
                title="Mahasiswa Baru"
                value={data.stats.baru.total}
                icon={<FiUserPlus className="w-6 h-6 text-white" />}
                color="green"
                trend={{ value: data.stats.baru.trend ?? 0, label: "YoY" }}
                href="/dashboard/data-unila/mahasiswa"
                hint="Lihat detail data mahasiswa"
              />
              <StatCard
                title="Lulusan"
                value={data.stats.lulus.total}
                icon={<FiAward className="w-6 h-6 text-white" />}
                color="purple"
                trend={{ value: data.stats.lulus.trend ?? 0, label: "YoY" }}
                href="/dashboard/data-unila/mahasiswa/lulusan"
                hint="Lihat detail lulusan / alumni"
              />
              <StatCard
                title="Cuti Akademik"
                value={data.stats.cuti.total}
                icon={<FiUserX className="w-6 h-6 text-white" />}
                color="yellow"
                trend={{ value: data.stats.cuti.trend ?? 0, label: "YoY" }}
              />
              <StatCard
                title="Drop Out"
                value={data.stats.do.total}
                icon={<FiUserX className="w-6 h-6 text-white" />}
                color="red"
                trend={{ value: data.stats.do.trend ?? 0, label: "YoY" }}
              />
            </div>

            {/* ROW — Trend & Sebaran */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <SectionCard title="Trend Mahasiswa Aktif" subtitle="5 tahun terakhir" icon={<FiActivity className="h-4 w-4" />}>
                {data.trendMahasiswa?.length ? <LineChart data={data.trendMahasiswa} height={260} showArea color="#2563eb" /> : <EmptyChartPlaceholder />}
              </SectionCard>
              <SectionCard title="Trend Mahasiswa Baru" subtitle="Penerimaan per tahun" icon={<FiUserPlus className="h-4 w-4" />}>
                {data.trendMahasiswaBaru?.length ? <LineChart data={data.trendMahasiswaBaru} height={260} showArea color="#10b981" /> : <EmptyChartPlaceholder />}
              </SectionCard>
              <SectionCard title="Sebaran Fakultas" subtitle="Klik untuk drilldown prodi" icon={<FiUsers className="h-4 w-4" />}>
                {data.sebaranFakultas?.length ? <DrilldownBarChart data={data.sebaranFakultas} title="Mahasiswa per Fakultas" height={260} color="#3b82f6" /> : <EmptyChartPlaceholder />}
              </SectionCard>
            </div>

            {/* ROW — Demografi & Profil Pendaftaran */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              <SectionCard title="Distribusi Jenjang" icon={<FiBookOpen className="h-4 w-4" />}>
                {data.distribusiJenjang?.length ? <PieChart data={data.distribusiJenjang} donut height={250} /> : <EmptyChartPlaceholder height={250} />}
              </SectionCard>
              <SectionCard title="Jalur Masuk" icon={<FiUserPlus className="h-4 w-4" />}>
                {data.jalurMasuk?.length ? <PieChart data={data.jalurMasuk} donut height={250} colors={["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"]} /> : <EmptyChartPlaceholder height={250} />}
              </SectionCard>
              <SectionCard title="Sistem Pembiayaan" icon={<FiDollarSign className="h-4 w-4" />}>
                {data.pembiayaan?.length ? <PieChart data={data.pembiayaan} height={250} colors={["#6366f1", "#14b8a6", "#f97316"]} /> : <EmptyChartPlaceholder height={250} />}
              </SectionCard>
              <SectionCard title="Distribusi Gender" icon={<FiUsers className="h-4 w-4" />}>
                {data.genderDistribusi?.length ? <PieChart data={data.genderDistribusi} donut height={250} colors={["#3b82f6", "#ec4899"]} /> : <EmptyChartPlaceholder height={250} />}
              </SectionCard>
            </div>

            {/* ROW — Status Mahasiswa & Rasio Dosen */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SectionCard
                title="Status Mahasiswa Semester Terpilih"
                subtitle="Berdasarkan kuliah_mhs.id_stat_mhs (A/N/U/C/M)"
                icon={<FiUserCheck className="h-4 w-4" />}
              >
                {data.statusMahasiswa?.length ? (
                  <BarChart data={data.statusMahasiswa} horizontal height={280} colors={["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444"]} />
                ) : (
                  <EmptyChartPlaceholder message="Tidak ada data status pada semester ini" height={280} />
                )}
              </SectionCard>
              <SectionCard
                title="Rasio Dosen : Mahasiswa"
                subtitle="Dosen aktif dibanding mahasiswa aktif per fakultas"
                icon={<FiActivity className="h-4 w-4" />}
              >
                {data.rasioDosenMahasiswa?.length ? (
                  <BarChart data={data.rasioDosenMahasiswa} horizontal height={280} colors={["#6366f1"]} xAxisLabel="Rasio (mhs : dosen)" />
                ) : (
                  <EmptyChartPlaceholder message="Data rasio belum tersedia" height={280} />
                )}
              </SectionCard>
            </div>

            {/* ROW — Akademik */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SectionCard title="Distribusi IPK" subtitle="Sebaran IPK seluruh mahasiswa" icon={<FiBookOpen className="h-4 w-4" />}>
                {data.distribusiIPK?.length ? <BarChart data={data.distribusiIPK} height={300} colors={["#10b981", "#3b82f6", "#f59e0b", "#f97316", "#ef4444"]} /> : <EmptyChartPlaceholder height={300} />}
              </SectionCard>
              <SectionCard title="Rata-rata IPK per Fakultas" icon={<FiAward className="h-4 w-4" />}>
                {data.ipkPerFakultas?.length ? <BarChart data={data.ipkPerFakultas} horizontal height={300} colors={["#8b5cf6"]} xAxisLabel="IPK" /> : <EmptyChartPlaceholder height={300} />}
              </SectionCard>
            </div>

            {/* ROW — Studi & Beasiswa */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <SectionCard title="Masa Studi Lulusan" subtitle="Distribusi lama studi" icon={<FiActivity className="h-4 w-4" />}>
                {data.masaStudi?.length ? <PieChart data={data.masaStudi} donut height={260} colors={["#10b981", "#3b82f6", "#ef4444"]} /> : <EmptyChartPlaceholder height={260} />}
              </SectionCard>
              <SectionCard title="Status Penerima Beasiswa" icon={<FiAward className="h-4 w-4" />}>
                {data.beasiswa?.length ? <BarChart data={data.beasiswa} horizontal height={260} colors={["#f59e0b"]} xAxisLabel="Penerima" /> : <EmptyChartPlaceholder height={260} />}
              </SectionCard>
              <SectionCard title="Mahasiswa Tugas Akhir" subtitle="Sedang skripsi/tesis" icon={<FiBookOpen className="h-4 w-4" />}>
                {data.tugasAkhir?.length ? <BarChart data={data.tugasAkhir} height={260} colors={["#ec4899"]} xAxisLabel="Mahasiswa" /> : <EmptyChartPlaceholder height={260} />}
              </SectionCard>
            </div>

            {/* ROW — Geografis */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SectionCard title="Top 5 Asal Provinsi" subtitle="Domisili mahasiswa" icon={<FiMapPin className="h-4 w-4" />}>
                {data.asalProvinsi?.length ? <BarChart data={data.asalProvinsi} horizontal height={280} colors={["#3b82f6"]} /> : <EmptyChartPlaceholder height={280} />}
              </SectionCard>
              <SectionCard title="Mahasiswa Asing" subtitle="Sebaran negara asal" icon={<FiGlobe className="h-4 w-4" />}>
                {data.mahasiswaAsing?.length ? <BarChart data={data.mahasiswaAsing} height={280} colors={["#ec4899"]} /> : <EmptyChartPlaceholder message="Tidak ada mahasiswa asing pada filter ini" height={280} />}
              </SectionCard>
            </div>

            {/* ROW — Early Warning */}
            {data.warningMasaStudi?.length ? (
              <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 shadow-sm dark:border-red-900 dark:from-red-900/20 dark:via-orange-900/20 dark:to-yellow-900/20">
                <div className="flex items-start gap-3 border-b border-red-200 px-5 py-3 dark:border-red-900">
                  <div className="rounded-lg bg-gradient-to-br from-red-500 to-orange-500 p-2">
                    <FiAlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-red-900 dark:text-red-100">Early Warning — Masa Studi Melebihi Batas</h3>
                    <p className="text-xs text-red-700 dark:text-red-200">Mahasiswa melampaui masa normatif PDDIKTI — perlu intervensi prodi</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {data.warningMasaStudi.map((item, idx) => {
                      const total = data.warningMasaStudi.reduce((sum, i) => sum + i.value, 0);
                      const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                      const gradient = ["from-red-500 to-red-600", "from-orange-500 to-orange-600", "from-yellow-500 to-yellow-600"][idx % 3];
                      const bg = ["bg-red-50 dark:bg-red-900/30", "bg-orange-50 dark:bg-orange-900/30", "bg-yellow-50 dark:bg-yellow-900/30"][idx % 3];
                      const text = ["text-red-700 dark:text-red-200", "text-orange-700 dark:text-orange-200", "text-yellow-700 dark:text-yellow-200"][idx % 3];
                      return (
                        <div key={idx} className={`rounded-xl border border-slate-200 p-4 dark:border-slate-700 ${bg}`}>
                          <div className="mb-3 flex items-start justify-between">
                            <span className={`text-sm font-semibold ${text}`}>{item.name}</span>
                            <span className={`text-2xl font-bold ${text}`}>{item.value.toLocaleString("id-ID")}</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="mt-1 block text-xs text-slate-500">{pct}% dari total warning</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
