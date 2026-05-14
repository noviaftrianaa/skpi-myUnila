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
import { FiUsers, FiBriefcase, FiDollarSign, FiClock, FiFilter, FiRotateCcw, FiX } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../config/menuConfig";
import tracerDataService from "@/lib/services/data-unila/tracerDataService";
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
function fmtRupiah(n: number): string {
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)} M`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(1)} Jt`;
  if (n >= 1e3) return `Rp ${(n / 1e3).toFixed(0)} Rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
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

interface TracerItem {
  nama_lulusan: string;
  nim: string;
  nm_prodi: string;
  nm_fakultas: string;
  status_lulusan: string | null;
  tempat_kerja: string | null;
  masa_tunggu_bulan: number | null;
  income_per_bln: number | null;
}

export default function TracerPage() {
  useRequireAuth();
  const [data, setData] = useState<TracerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number | string> | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [filters, setFilters] = useState<MahasiswaFilters | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("nama_lulusan");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterFak, setFilterFak] = useState("");
  const [filterProdi, setFilterProdi] = useState("");
  const [filterJurusan, setFilterJurusan] = useState("");
  const [unitItems, setUnitItems] = useState<string[]>([]);
  const unitFilterStr = unitItems.join(",");

  useEffect(() => {
    tracerDataService.getStats().then(setStats).catch(console.error).finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    mahasiswaDataService.getFilters({ id_fakultas: filterFak || undefined, id_jurusan: filterJurusan || undefined }).then(setFilters).catch(console.error);
  }, [filterFak, filterJurusan]);

  useEffect(() => {
    setLoading(true);
    tracerDataService.getList({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
    } as Record<string, any>)
      .then((r: { data: TracerItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data tracer"))
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
    nim: "NIM",
    nama_lulusan: "Nama Lulusan",
    nm_prodi: "Program Studi",
    status_lulusan: "Status",
    tempat_kerja: "Tempat Kerja",
    masa_tunggu_bulan: "Masa Tunggu (bln)",
    income_per_bln: "Income/Bulan",
  } as const;

  const dataForExport = useMemo(() => data, [data]);

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") { toast("Server export belum tersedia"); return; }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    if (fmtType === "excel") exportToExcel(dataForExport as unknown as Record<string, unknown>[], "tracer-study", "Tracer", EXPORT_HEADERS);
    else if (fmtType === "csv-client") exportToCsv(dataForExport as unknown as Record<string, unknown>[], "tracer-study", EXPORT_HEADERS);
    else if (fmtType === "pdf") exportToPdf(dataForExport as unknown as Record<string, unknown>[], "tracer-study", { title: "Tracer Study Universitas Lampung", headers: EXPORT_HEADERS, orientation: "landscape" });
    else if (fmtType === "json") exportToJson(dataForExport, "tracer-study");
    toast.success(`${fmtType.toUpperCase()} berhasil di-download`);
  };

  const handleReset = () => { setFilterFak(""); setFilterProdi(""); setFilterJurusan(""); setUnitItems([]); setPage(1); };

  const columns: Column<TracerItem>[] = [
    { key: "nama_lulusan", label: "NAMA LULUSAN", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{i.nama_lulusan}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">{i.nim || "—"}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{i.nm_prodi}</div>
      </div>
    )},
    { key: "status_lulusan", label: "STATUS", width: "140px", render: (i) => i.status_lulusan ? (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1 ring-inset
        ${/Bekerja/i.test(i.status_lulusan) ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
        : /Studi|Lanjut/i.test(i.status_lulusan) ? "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300"
        : /Wirausaha/i.test(i.status_lulusan) ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300"
        : "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}>
        {i.status_lulusan}
      </span>
    ) : <span className="text-xs text-gray-400">—</span> },
    { key: "tempat_kerja", label: "TEMPAT KERJA", render: (i) => (
      <span className="text-xs text-gray-700 dark:text-gray-300 line-clamp-1">{i.tempat_kerja || "—"}</span>
    )},
    { key: "masa_tunggu_bulan", label: "TUNGGU", width: "90px", sortable: true, align: "center" as const, render: (i) => (
      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-mono bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300">
        {i.masa_tunggu_bulan != null ? `${i.masa_tunggu_bulan} bln` : "—"}
      </span>
    )},
    { key: "income_per_bln", label: "INCOME", width: "130px", sortable: true, align: "right" as const, render: (i) => (
      <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{i.income_per_bln ? fmtRupiah(num(i.income_per_bln)) : "—"}</span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Tracer Study">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Tracer Study</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Survey lulusan Unila — status pekerjaan, masa tunggu, income</p>
          </div>
          {hasFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-pink-50 text-pink-700 ring-1 ring-pink-200 dark:bg-pink-500/10 dark:text-pink-300">
              <FiFilter className="w-3.5 h-3.5" /> Filter aktif
            </span>
          )}
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : stats && (() => {
          const total = num(stats.total);
          const bekerja = num(stats.bekerja);
          const studi = num(stats.studi_lanjut);
          const wira = num(stats.wirausaha);
          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard icon={<FiUsers className="w-6 h-6" />} label="Total Response" value={total} gradient="from-pink-500 to-rose-600" />
              <StatCard icon={<FiBriefcase className="w-6 h-6" />} label="Bekerja" value={bekerja} gradient="from-emerald-500 to-teal-600" subtext={pct(bekerja, total)} />
              <StatCard icon={<MdSchool className="w-6 h-6" />} label="Studi Lanjut" value={studi} gradient="from-violet-500 to-purple-600" subtext={pct(studi, total)} />
              <StatCard icon={<FiClock className="w-6 h-6" />} label="Wirausaha" value={wira} gradient="from-amber-500 to-orange-500" subtext={pct(wira, total)} />
              <StatCard icon={<FiDollarSign className="w-6 h-6" />} label="Avg Income" value={stats.avg_income ? fmtRupiah(num(stats.avg_income)) : "—"} gradient="from-blue-500 to-indigo-600" subtext="per bulan" />
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
                  {hasFilter && (
                    <button type="button" onClick={handleReset} className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                      <FiRotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                  )}
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
                    <span key={c.key} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-pink-50 text-pink-700 ring-1 ring-pink-200 rounded-full dark:bg-pink-500/10 dark:text-pink-300">
                      {c.label}
                      <button type="button" onClick={c.clear} className="ml-0.5 w-4 h-4 rounded-full hover:bg-pink-200 dark:hover:bg-pink-400/20 flex items-center justify-center"><FiX className="w-3 h-3" /></button>
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
              searchPlaceholder="Cari nama, NIM, tempat kerja..."
              defaultRowsPerPage={10}
            />
          </motion.div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
