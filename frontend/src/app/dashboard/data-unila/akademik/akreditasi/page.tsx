"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import Dropdown, { type DropdownOption } from "@/shared/components/data-unila/Dropdown";
import UnitFilter from "@/shared/components/data-unila/UnitFilter";
import ExportMenu, { type ExportFormat } from "@/shared/components/data-unila/ExportMenu";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";
import { MdSchool } from "react-icons/md";
import { FiAward, FiCheckCircle, FiAlertTriangle, FiClock, FiFilter, FiRotateCcw, FiX } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import akademikDataService, { type AkreditasiStats } from "@/lib/services/data-unila/akademikDataService";
import mahasiswaDataService, { type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { exportToCsv, exportToJson } from "@/lib/utils/exportCsv";
import { exportToPdf } from "@/lib/utils/exportPdf";
import { StatCardGridSkeleton } from "@/shared/components/data-unila/PageSkeleton";

const APP_KEY = "data-unila";

function num(v?: string | number | null): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isNaN(n) ? 0 : n;
}
function fmt(n: number): string { return n.toLocaleString("id-ID"); }
function pct(part: number, total: number): string {
  if (!total) return "—";
  return `${((part / total) * 100).toFixed(1)}%`;
}
function fmtDate(s?: string | null): string {
  if (!s) return "—";
  try {
    const d = new Date(s.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return s; }
}

function StatCard({ icon, label, value, gradient, subtext }: { icon: React.ReactNode; label: string; value: string | number; gradient: string; subtext?: string }) {
  const display = typeof value === "number" ? fmt(value) : value;
  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br ${gradient}`}>
      <div className="absolute -top-10 -right-8 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10 flex items-center gap-3 p-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-inset ring-white/25 flex items-center justify-center text-white shadow-inner">{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-white/80 uppercase tracking-[0.1em]">{label}</p>
          <h3 className="text-2xl font-extrabold text-white tabular-nums leading-tight">{display}</h3>
          {subtext && <p className="text-[11px] text-white/70 mt-0.5">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

interface AkreditasiItem {
  nm_prodi: string;
  nm_fakultas: string;
  peringkat: string | null;
  lembaga: string | null;
  no_sk: string | null;
  tgl_sk: string | null;
  tgl_expired: string | null;
  a_aktif: number;
}

function getStatusInfo(tglExpired: string | null, aAktif: number): { label: string; tone: string } {
  if (!aAktif) return { label: "Non-Aktif", tone: "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700 dark:text-gray-300" };
  if (!tglExpired) return { label: "Aktif", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300" };
  const exp = new Date(tglExpired);
  const now = new Date();
  const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Expired", tone: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300" };
  if (days <= 90) return { label: `Expire ${days}h`, tone: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300" };
  return { label: "Aktif", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300" };
}

export default function AkreditasiPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const forcedFak = scope.forcedFakultas || "";
  const forcedJur = scope.forcedJurusan || "";
  const forcedProdi = scope.forcedProdi || "";

  const [data, setData] = useState<AkreditasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AkreditasiStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("nm_prodi");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [filters, setFilters] = useState<MahasiswaFilters | null>(null);
  const [orgFilters, setOrgFilters] = useState<MahasiswaFilters | null>(null);
  const [filterFak, setFilterFak] = useState(forcedFak);
  const [filterProdi, setFilterProdi] = useState(forcedProdi);
  const [filterJurusan, setFilterJurusan] = useState(forcedJur);
  const [unitItems, setUnitItems] = useState<string[]>([]);
  const unitFilterStr = unitItems.join(",");
  const [filterExpiring, setFilterExpiring] = useState<"" | "soon" | "expired" | "alert">("");
  const [filterAkredStatus, setFilterAkredStatus] = useState<"" | "aktif" | "tidak_aktif">("aktif");

  // Init filterExpiring dari URL query param `?expiring=soon|expired|alert`
  useEffect(() => {
    if (typeof window === "undefined") return;
    const usp = new URLSearchParams(window.location.search);
    const e = usp.get("expiring");
    if (e === "soon" || e === "expired" || e === "alert") setFilterExpiring(e);
  }, []);

  useEffect(() => { setFilterFak(forcedFak); }, [forcedFak]);
  useEffect(() => { setFilterProdi(forcedProdi); }, [forcedProdi]);
  useEffect(() => { setFilterJurusan(forcedJur); }, [forcedJur]);

  useEffect(() => {
    mahasiswaDataService.getFilters({}).then(setFilters).catch(console.error);
  }, []);

  useEffect(() => {
    setLoadingStats(true);
    akademikDataService.getAkreditasiStats({
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
    }).then(setStats).catch(console.error).finally(() => setLoadingStats(false));
  }, [filterFak, filterProdi, filterJurusan, unitFilterStr]);

  useEffect(() => {
    mahasiswaDataService.getFilters({ id_fakultas: filterFak || undefined, id_jurusan: filterJurusan || undefined })
      .then(setOrgFilters).catch(console.error);
  }, [filterFak, filterJurusan]);

  useEffect(() => {
    setLoading(true);
    akademikDataService.getAkreditasi({
      page, limit,
      search: search || undefined,
      sort_by: filterExpiring && !sortBy.includes("expired") ? "tgl_expired" : sortBy,
      sort_order: filterExpiring === "soon" ? "asc" : sortOrder,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
      expiring: filterExpiring || undefined,
      akred_status: filterAkredStatus || undefined,
    } as Record<string, any>)
      .then((r: { data: AkreditasiItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data akreditasi"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak, filterProdi, filterJurusan, unitFilterStr, filterExpiring, filterAkredStatus]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const fakOptions: DropdownOption[] = (filters?.fakultas || []).map((f) => ({ value: f.id_fakultas, label: f.nm_fakultas }));

  const EXPORT_HEADERS = {
    nm_prodi: "Program Studi",
    nm_fakultas: "Fakultas",
    peringkat: "Peringkat",
    lembaga: "Lembaga",
    no_sk: "Nomor SK",
    tgl_sk: "Tgl SK",
    tgl_expired: "Tgl Berakhir",
  } as const;

  const dataForExport = useMemo(() => data, [data]);

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") { toast("Server export belum tersedia"); return; }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    if (fmtType === "excel") exportToExcel(dataForExport as unknown as Record<string, unknown>[], "akreditasi", "Akreditasi", EXPORT_HEADERS);
    else if (fmtType === "csv-client") exportToCsv(dataForExport as unknown as Record<string, unknown>[], "akreditasi", EXPORT_HEADERS);
    else if (fmtType === "pdf") exportToPdf(dataForExport as unknown as Record<string, unknown>[], "akreditasi", { title: "Akreditasi Program Studi Unila", headers: EXPORT_HEADERS, orientation: "landscape" });
    else if (fmtType === "json") exportToJson(dataForExport, "akreditasi");
    toast.success(`${fmtType.toUpperCase()} berhasil di-download`);
  };

  const columns: Column<AkreditasiItem>[] = [
    { key: "nm_prodi", label: "PROGRAM STUDI", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{i.nm_prodi}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{i.nm_fakultas || "—"}</div>
      </div>
    )},
    { key: "peringkat", label: "PERINGKAT", width: "130px", align: "center" as const, sortable: true, render: (i) => i.peringkat ? (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset
        ${/Unggul|^A$/.test(i.peringkat) ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
        : /Baik Sekali|^B$/.test(i.peringkat) ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300"
        : /Baik|^C$/.test(i.peringkat) ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300"
        : "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}>
        {i.peringkat}
      </span>
    ) : <span className="text-xs text-gray-400">—</span> },
    { key: "lembaga", label: "LEMBAGA", width: "110px", render: (i) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300">
        {i.lembaga || "—"}
      </span>
    )},
    { key: "no_sk", label: "NOMOR SK", render: (i) => (
      <span className="text-xs font-mono text-gray-700 dark:text-gray-300 line-clamp-1" title={i.no_sk || ""}>{i.no_sk || "—"}</span>
    )},
    { key: "tgl_expired", label: "BERAKHIR", width: "110px", sortable: true, render: (i) => (
      <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{fmtDate(i.tgl_expired)}</span>
    )},
    { key: "a_aktif", label: "STATUS", width: "110px", align: "center" as const, render: (i) => {
      const s = getStatusInfo(i.tgl_expired, i.a_aktif);
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap ${s.tone}`}>
          {s.label}
        </span>
      );
    }},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Akreditasi">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Akreditasi Program Studi</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Riwayat akreditasi BAN-PT, LAM, dan lembaga lainnya</p>
          </div>
          {filterFak && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300">
              <FiFilter className="w-3.5 h-3.5" /> {fakOptions.find((o) => o.value === filterFak)?.label}
            </span>
          )}
        </div>

        {loadingStats ? (
          <StatCardGridSkeleton count={5} />
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard icon={<FiAward className="w-6 h-6" />} label="Total Akreditasi" value={num(stats.total)} gradient="from-blue-500 to-indigo-600" subtext={`${fmt(num(stats.aktif))} aktif`} />
            <StatCard icon={<FiCheckCircle className="w-6 h-6" />} label="Unggul / A" value={num(stats.unggul)} gradient="from-emerald-500 to-teal-600" subtext={`${pct(num(stats.unggul), num(stats.total))}`} />
            <StatCard icon={<FiCheckCircle className="w-6 h-6" />} label="Baik Sekali / B" value={num(stats.baik_sekali)} gradient="from-violet-500 to-purple-600" subtext={`${pct(num(stats.baik_sekali), num(stats.total))}`} />
            <button type="button" onClick={() => { setFilterExpiring(filterExpiring === "soon" ? "" : "soon"); setPage(1); }} className={`text-left transition-transform hover:scale-[1.02] ${filterExpiring === "soon" ? "ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-gray-900 rounded-2xl" : ""}`} title="Klik untuk filter prodi yang akan expire ≤ 90 hari">
              <StatCard icon={<FiAlertTriangle className="w-6 h-6" />} label="Akan Expire" value={num(stats.akan_expire)} gradient="from-amber-500 to-orange-500" subtext="klik utk filter · ≤ 90 hari" />
            </button>
            <button type="button" onClick={() => { setFilterExpiring(filterExpiring === "expired" ? "" : "expired"); setPage(1); }} className={`text-left transition-transform hover:scale-[1.02] ${filterExpiring === "expired" ? "ring-2 ring-rose-400 ring-offset-2 dark:ring-offset-gray-900 rounded-2xl" : ""}`} title="Klik untuk filter prodi yang sudah expired">
              <StatCard icon={<FiClock className="w-6 h-6" />} label="Expired" value={num(stats.expired)} gradient="from-rose-500 to-pink-600" subtext="klik utk filter · lewat masa berlaku" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2"><div className="flex-1 min-w-0"><ScopeBadge /></div></div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden border border-gray-200/50 dark:border-gray-800">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="p-4 sm:p-5 space-y-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <FiFilter className="w-3.5 h-3.5" /> Filter Data
                </span>
                <div className="flex items-center gap-2">
                  <ExportMenu onExport={handleExport} disabled={{ "csv-server": true }} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <UnitFilter
                  data={orgFilters}
                  value={unitItems}
                  onChange={(next) => { setUnitItems(next); setPage(1); }}
                  forcedFakultas={forcedFak || undefined}
                  forcedJurusan={forcedJur || undefined}
                  forcedProdi={forcedProdi || undefined}
                />
                <Dropdown label="Status Akreditasi" value={filterAkredStatus}
                  onChange={(v) => { setFilterAkredStatus(v as "" | "aktif" | "tidak_aktif"); setPage(1); }}
                  options={[
                    { value: "aktif", label: "Aktif (a_aktif=1)" },
                    { value: "tidak_aktif", label: "Tidak Aktif (history)" },
                  ]} placeholder="Semua" />
              </div>
              {filterFak && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktif</span>
                  <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-200 rounded-full dark:bg-amber-500/10 dark:text-amber-300">
                    {fakOptions.find((o) => o.value === filterFak)?.label}
                    <button type="button" onClick={() => { setFilterFak(""); setPage(1); }} className="ml-0.5 w-4 h-4 rounded-full hover:bg-amber-200 dark:hover:bg-amber-400/20 flex items-center justify-center"><FiX className="w-3 h-3" /></button>
                  </span>
                </div>
              )}
            </div>

            <DataTable columns={columns} data={data} loading={loading} serverSide totalRecords={total}
              onPageChange={setPage}
              onRowsPerPageChange={(n) => { setLimit(n); setPage(1); }}
              onSearchChange={(q) => { setSearch(q); setPage(1); }}
              onSortChange={handleSort}
              searchPlaceholder="Cari prodi, no SK..."
              defaultRowsPerPage={10}
            />
          </motion.div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
