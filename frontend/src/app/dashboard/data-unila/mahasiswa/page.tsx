"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import MahasiswaDataTable, { type MahasiswaActiveFilters } from "@/shared/components/data-unila/MahasiswaDataTable";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import { FiUsers, FiCheckCircle, FiXCircle, FiClock, FiTrendingUp, FiFilter, FiClock as FiClockIco, FiDatabase, FiLogOut } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../config/menuConfig";
import mahasiswaDataService, { type MahasiswaStats } from "@/lib/services/data-unila/mahasiswaDataService";
import { StatCardGridSkeleton } from "@/shared/components/data-unila/PageSkeleton";

const APP_KEY = "data-unila";

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function num(v?: string | number | null): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isNaN(n) ? 0 : n;
}

function fmt(n: number): string {
  return n.toLocaleString("id-ID");
}

function pct(part: number, total: number): string {
  if (!total) return "—";
  return `${((part / total) * 100).toFixed(1)}%`;
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
  subtext?: string;
};

function StatCard({ icon, label, value, gradient, subtext }: StatCardProps) {
  const display = typeof value === "number" ? fmt(value) : fmt(num(value));
  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br ${gradient}`}>
      <div className="absolute -top-10 -right-8 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10 flex items-center gap-3 p-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-inset ring-white/25 flex items-center justify-center text-white shadow-inner">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-white/80 uppercase tracking-[0.1em]">{label}</p>
          <h3 className="text-2xl font-extrabold text-white tabular-nums leading-tight">{display}</h3>
          {subtext && <p className="text-[11px] text-white/70 mt-0.5">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

export default function MahasiswaDataPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const [stats, setStats] = useState<MahasiswaStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [activeFilters, setActiveFilters] = useState<MahasiswaActiveFilters | null>(null);

  const handleFiltersChange = useCallback((f: MahasiswaActiveFilters) => {
    setActiveFilters((prev) => {
      // Compare to avoid re-renders when filter values didn't actually change
      if (
        prev &&
        prev.status === f.status &&
        prev.id_fakultas === f.id_fakultas &&
        prev.id_prodi === f.id_prodi &&
        prev.angkatan === f.angkatan &&
        prev.search === f.search
      ) {
        return prev;
      }
      return f;
    });
  }, []);

  // Memoize orgFilter so its identity is stable — prevent infinite loop in child useEffect
  const memoOrgFilter = useMemo(
    () => ({
      id_fakultas: scope.forcedFakultas || undefined,
      id_jurusan: scope.forcedJurusan || undefined,
      id_prodi: scope.forcedProdi || undefined,
    }),
    [scope.forcedFakultas, scope.forcedJurusan, scope.forcedProdi]
  );

  useEffect(() => {
    setLoadingStats(true);
    const params: Record<string, string> = {};
    // Scope forced (peran) — selalu prioritas
    if (scope.forcedFakultas) params.id_fakultas = scope.forcedFakultas;
    if (scope.forcedJurusan) params.id_jurusan = scope.forcedJurusan;
    if (scope.forcedProdi) params.id_prodi = scope.forcedProdi;
    // User-selected filters override hanya jika scope tidak force
    if (activeFilters) {
      if (!scope.forcedFakultas && activeFilters.id_fakultas) params.id_fakultas = activeFilters.id_fakultas;
      if (!scope.forcedJurusan && activeFilters.id_jurusan) params.id_jurusan = activeFilters.id_jurusan;
      if (!scope.forcedProdi && activeFilters.id_prodi) params.id_prodi = activeFilters.id_prodi;
      if (activeFilters.angkatan) params.angkatan = activeFilters.angkatan;
      if (activeFilters.unit_filter) params.unit_filter = activeFilters.unit_filter;
    }
    mahasiswaDataService
      .getStats(params)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, [scope.forcedFakultas, scope.forcedJurusan, scope.forcedProdi, activeFilters]);

  // Apakah ada filter user-applied (untuk show badge "ter-filter" di stats)
  const isFiltered = Boolean(
    activeFilters && (
      activeFilters.angkatan ||
      (!scope.forcedFakultas && activeFilters.id_fakultas) ||
      (!scope.forcedProdi && activeFilters.id_prodi)
    )
  );

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={dataUnilaMenuConfig}
      pageTitle="Data Mahasiswa"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Data Mahasiswa
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Raw data mahasiswa Universitas Lampung — filter, cari, dan download
            </p>
          </div>
          {isFiltered && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/30">
              <FiFilter className="w-3.5 h-3.5" />
              Statistik sesuai filter aktif
            </span>
          )}
        </div>

        {/* Stats */}
        {loadingStats ? (
          <StatCardGridSkeleton count={5} />
        ) : stats && (() => {
          const total = num(stats.total);
          const aktif = num(stats.aktif);
          const lulus = num(stats.lulus);
          const cuti  = num(stats.cuti);
          const keluar = num(stats.keluar);
          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard
                icon={<FiUsers className="w-6 h-6" />}
                label="Total"
                value={total}
                gradient="from-blue-500 to-blue-600"
                subtext="Semua status"
              />
              <StatCard
                icon={<FiCheckCircle className="w-6 h-6" />}
                label="Aktif"
                value={aktif}
                gradient="from-green-500 to-emerald-600"
                subtext={`${pct(aktif, total)} dari total`}
              />
              <StatCard
                icon={<FiClock className="w-6 h-6" />}
                label="Cuti"
                value={cuti}
                gradient="from-amber-500 to-orange-500"
                subtext={`${pct(cuti, total)} dari total`}
              />
              <StatCard
                icon={<FiTrendingUp className="w-6 h-6" />}
                label="Lulus"
                value={lulus}
                gradient="from-violet-500 to-purple-600"
                subtext={`${pct(lulus, total)} dari total`}
              />
              <StatCard
                icon={<FiLogOut className="w-6 h-6" />}
                label="Keluar"
                value={keluar}
                gradient="from-red-500 to-rose-600"
                subtext={`${pct(keluar, total)} non-Lulus`}
              />
            </div>
          );
        })()}

        {/* Scope + Data Source meta */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-0">
            <ScopeBadge />
          </div>
          {stats?.last_sync && (
            <div className="inline-flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 text-[11px] sm:text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <FiDatabase className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold">Sumber:</span>
                <span>{stats.data_source || "PDDikti"}</span>
              </span>
              <span className="h-3 w-px bg-slate-300 dark:bg-gray-600" />
              <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <FiClockIco className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold">Sync terakhir:</span>
                <span className="font-mono">{formatDateTime(stats.last_sync)}</span>
              </span>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden border border-gray-200/50 dark:border-gray-800">
          <MahasiswaDataTable
            orgFilter={memoOrgFilter}
            onFiltersChange={handleFiltersChange}
          />
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
