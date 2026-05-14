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
import { MdSchool } from "react-icons/md";
import { FiBookOpen, FiCheckCircle, FiBook, FiLayers, FiFilter, FiRotateCcw, FiX } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import akademikDataService, { type MatkulStats } from "@/lib/services/data-unila/akademikDataService";
import mahasiswaDataService, { type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { exportToCsv, exportToJson } from "@/lib/utils/exportCsv";
import { exportToPdf } from "@/lib/utils/exportPdf";

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

interface MatkulItem {
  id_mk: string;
  kode_mk: string;
  nm_mk: string;
  sks_mk: number;
  sks_tatap_muka: number;
  sks_praktek: number;
  sks_praktek_lapangan: number;
  sks_simulasi: number;
  jenis_mk: string;
  nm_prodi: string;
  nm_fakultas: string;
  id_fakultas: string;
}

export default function MatkulPage() {
  useRequireAuth();
  const [data, setData] = useState<MatkulItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MatkulStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("nm_mk");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [filters, setFilters] = useState<MahasiswaFilters | null>(null);
  const [filterFak, setFilterFak] = useState("");
  const [filterProdi, setFilterProdi] = useState("");
  const [filterJurusan, setFilterJurusan] = useState("");
  const [unitItems, setUnitItems] = useState<string[]>([]);
  const unitFilterStr = unitItems.join(",");

  useEffect(() => {
    akademikDataService.getMatkulStats().then(setStats).catch(console.error).finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    mahasiswaDataService.getFilters({ id_fakultas: filterFak || undefined, id_jurusan: filterJurusan || undefined }).then(setFilters).catch(console.error);
  }, [filterFak, filterJurusan]);

  useEffect(() => {
    setLoading(true);
    akademikDataService.getMatkul({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
    } as Record<string, any>)
      .then((r: { data: MatkulItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data mata kuliah"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak, filterProdi, filterJurusan, unitFilterStr]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const fakOptions: DropdownOption[] = (filters?.fakultas || []).map((f) => ({ value: f.id_fakultas, label: f.nm_fakultas }));
  const prodiOptions: DropdownOption[] = (filters?.prodi || []).map((p) => ({ value: p.id_sms, label: p.nm_prodi, sublabel: p.jenjang }));

  const activeChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (filterFak) {
    const f = fakOptions.find((o) => o.value === filterFak);
    if (f) activeChips.push({ key: "fak", label: f.label, clear: () => { setFilterFak(""); setFilterProdi(""); setPage(1); } });
  }
  if (filterProdi) {
    const p = prodiOptions.find((o) => o.value === filterProdi);
    if (p) activeChips.push({ key: "prd", label: p.label, clear: () => { setFilterProdi(""); setPage(1); } });
  }
  const hasFilter = activeChips.length > 0;

  const EXPORT_HEADERS = {
    kode_mk: "Kode MK",
    nm_mk: "Nama Mata Kuliah",
    sks_mk: "SKS Total",
    sks_tatap_muka: "SKS Teori",
    sks_praktek: "SKS Praktek",
    jenis_mk: "Jenis MK",
    nm_prodi: "Program Studi",
    nm_fakultas: "Fakultas",
  } as const;

  const dataForExport = useMemo(() => data, [data]);

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") { toast("Server export belum tersedia"); return; }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    if (fmtType === "excel") exportToExcel(dataForExport as unknown as Record<string, unknown>[], "mata-kuliah", "Matkul", EXPORT_HEADERS);
    else if (fmtType === "csv-client") exportToCsv(dataForExport as unknown as Record<string, unknown>[], "mata-kuliah", EXPORT_HEADERS);
    else if (fmtType === "pdf") exportToPdf(dataForExport as unknown as Record<string, unknown>[], "mata-kuliah", { title: "Mata Kuliah Universitas Lampung", headers: EXPORT_HEADERS, orientation: "landscape" });
    else if (fmtType === "json") exportToJson(dataForExport, "mata-kuliah");
    toast.success(`${fmtType.toUpperCase()} berhasil di-download`);
  };

  const handleReset = () => {
    setFilterFak(""); setFilterProdi(""); setFilterJurusan(""); setUnitItems([]); setPage(1);
  };

  const columns: Column<MatkulItem>[] = [
    { key: "kode_mk", label: "KODE", width: "110px", render: (i) => (
      <span className="font-mono text-xs font-bold text-gray-800 dark:text-gray-200">{i.kode_mk || "—"}</span>
    )},
    { key: "nm_mk", label: "NAMA MATA KULIAH", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{i.nm_mk}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{i.nm_prodi || "—"}</div>
      </div>
    )},
    { key: "sks_mk", label: "SKS", width: "70px", align: "center" as const, sortable: true, render: (i) => (
      <span className="inline-flex items-center justify-center min-w-[36px] px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300">
        {i.sks_mk || 0}
      </span>
    )},
    { key: "sks_breakdown", label: "T/P", width: "100px", align: "center" as const, render: (i) => (
      <div className="text-[11px] text-gray-600 dark:text-gray-400 font-mono">
        <span>T:{num(i.sks_tatap_muka)}</span>
        <span className="mx-1 text-gray-300">/</span>
        <span>P:{num(i.sks_praktek) + num(i.sks_praktek_lapangan)}</span>
      </div>
    )},
    { key: "jenis_mk", label: "JENIS", width: "120px", render: (i) => i.jenis_mk ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 max-w-[110px] truncate" title={i.jenis_mk}>
        {i.jenis_mk}
      </span>
    ) : <span className="text-xs text-gray-400">—</span> },
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Mata Kuliah">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Mata Kuliah</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Master mata kuliah seluruh program studi Universitas Lampung</p>
          </div>
          {hasFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300">
              <FiFilter className="w-3.5 h-3.5" /> Filter aktif
            </span>
          )}
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : stats && (() => {
          const total = num(stats.total);
          const dgnP = num(stats.dgn_praktikum);
          return (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard icon={<FiBookOpen className="w-6 h-6" />} label="Total Mata Kuliah" value={total} gradient="from-blue-500 to-indigo-600" />
              <StatCard icon={<FiCheckCircle className="w-6 h-6" />} label="Dengan Praktikum" value={dgnP} gradient="from-emerald-500 to-teal-600" subtext={`${pct(dgnP, total)} dari total`} />
              <StatCard icon={<FiBook className="w-6 h-6" />} label="Teori Only" value={num(stats.teori_only)} gradient="from-violet-500 to-purple-600" subtext={`${pct(num(stats.teori_only), total)}`} />
              <StatCard icon={<FiLayers className="w-6 h-6" />} label="Total SKS" value={num(stats.total_sks)} gradient="from-amber-500 to-orange-500" subtext={`Rata-rata ${stats.rata_sks ? Number(stats.rata_sks).toFixed(1) : "—"} SKS`} />
            </div>
          );
        })()}

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
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                <UnitFilter
                  data={filters}
                  value={unitItems}
                  onChange={(next) => { setUnitItems(next); setPage(1); }}
                />
              </div>
              {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktif</span>
                  {activeChips.map((c) => (
                    <span key={c.key} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-200 rounded-full dark:bg-amber-500/10 dark:text-amber-300">
                      {c.label}
                      <button type="button" onClick={c.clear} className="ml-0.5 w-4 h-4 rounded-full hover:bg-amber-200 dark:hover:bg-amber-400/20 flex items-center justify-center"><FiX className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <DataTable columns={columns} data={data} loading={loading} serverSide totalRecords={total}
              onPageChange={setPage}
              onRowsPerPageChange={(n) => { setLimit(n); setPage(1); }}
              onSearchChange={(q) => { setSearch(q); setPage(1); }}
              onSortChange={handleSort}
              searchPlaceholder="Cari kode atau nama matkul..."
              defaultRowsPerPage={10}
            />
          </motion.div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
