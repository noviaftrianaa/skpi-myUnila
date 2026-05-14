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
import { FiBookOpen, FiTrendingUp, FiAward, FiFilter, FiRotateCcw, FiX, FiExternalLink } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import tridarmaDataService, { type PublikasiItem, type PublikasiStats } from "@/lib/services/data-unila/tridarmaDataService";
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

export default function PublikasiPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const forcedFak = scope.forcedFakultas || "";
  const forcedJur = scope.forcedJurusan || "";
  const forcedProdi = scope.forcedProdi || "";

  const [data, setData] = useState<PublikasiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PublikasiStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tgl_terbit");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterTahun, setFilterTahun] = useState("");

  const [orgFilters, setOrgFilters] = useState<MahasiswaFilters | null>(null);
  const [filterFak, setFilterFak] = useState(forcedFak);
  const [filterProdi, setFilterProdi] = useState(forcedProdi);
  const [filterJurusan, setFilterJurusan] = useState(forcedJur);
  const [unitItems, setUnitItems] = useState<string[]>([]);
  const unitFilterStr = unitItems.join(",");

  useEffect(() => { setFilterFak(forcedFak); }, [forcedFak]);
  useEffect(() => { setFilterProdi(forcedProdi); }, [forcedProdi]);
  useEffect(() => { setFilterJurusan(forcedJur); }, [forcedJur]);

  useEffect(() => {
    mahasiswaDataService.getFilters({ id_fakultas: filterFak || undefined, id_jurusan: filterJurusan || undefined })
      .then(setOrgFilters).catch(console.error);
  }, [filterFak, filterJurusan]);

  const currentYear = new Date().getFullYear();
  const tahunOptions: DropdownOption[] = Array.from({ length: 15 }, (_, i) => ({ value: String(currentYear - i), label: String(currentYear - i) }));

  useEffect(() => {
    tridarmaDataService.getPublikasiStats({
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
    }).then(setStats).catch(console.error).finally(() => setLoadingStats(false));
  }, [filterFak, filterProdi, filterJurusan, unitFilterStr]);

  useEffect(() => {
    setLoading(true);
    tridarmaDataService.getPublikasi({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      tahun: filterTahun || undefined,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
    })
      .then((r: { data: PublikasiItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data publikasi"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterTahun, filterFak, filterProdi, filterJurusan, unitFilterStr]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const EXPORT_HEADERS = {
    judul: "Judul Publikasi",
    nama_jurnal: "Nama Jurnal",
    tgl_terbit: "Tanggal Terbit",
    vol: "Volume",
    no: "No",
    hal: "Halaman",
    doi: "DOI",
    issn: "ISSN",
    quartile: "Quartile",
    jenis_publikasi: "Jenis",
  } as const;

  const dataForExport = useMemo(() => data, [data]);

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") { toast("Server export belum tersedia"); return; }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    const baseName = `publikasi-${filterTahun || "all"}`;
    if (fmtType === "excel") exportToExcel(dataForExport as unknown as Record<string, unknown>[], baseName, "Publikasi", EXPORT_HEADERS);
    else if (fmtType === "csv-client") exportToCsv(dataForExport as unknown as Record<string, unknown>[], baseName, EXPORT_HEADERS);
    else if (fmtType === "pdf") exportToPdf(dataForExport as unknown as Record<string, unknown>[], baseName, { title: "Publikasi Ilmiah Universitas Lampung", headers: EXPORT_HEADERS, orientation: "landscape" });
    else if (fmtType === "json") exportToJson(dataForExport, baseName);
    toast.success(`${fmtType.toUpperCase()} berhasil di-download`);
  };

  const columns: Column<PublikasiItem>[] = [
    { key: "judul", label: "JUDUL PUBLIKASI", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{i.judul}</div>
        <div className="text-xs text-gray-500 mt-0.5 italic line-clamp-1">{i.nama_jurnal || "—"}</div>
        {i.doi && (
          <a href={`https://doi.org/${i.doi}`} target="_blank" rel="noopener" className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 mt-0.5">
            <FiExternalLink className="w-2.5 h-2.5" /> {i.doi}
          </a>
        )}
      </div>
    )},
    { key: "jenis_publikasi", label: "JENIS", width: "120px", render: (i) => i.jenis_publikasi ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 max-w-[110px] truncate" title={i.jenis_publikasi}>
        {i.jenis_publikasi}
      </span>
    ) : <span className="text-xs text-gray-400">—</span> },
    { key: "tahun", label: "TAHUN", width: "80px", sortable: true, align: "center" as const, render: (i) => (
      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300">{i.tahun}</span>
    )},
    { key: "quartile", label: "QUARTILE", width: "100px", sortable: true, align: "center" as const, render: (i) => i.quartile ? (
      <span className={`inline-flex items-center justify-center w-12 h-6 rounded-md text-xs font-bold ring-1 ring-inset
        ${i.quartile === "Q1" ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
        : i.quartile === "Q2" ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300"
        : i.quartile === "Q3" ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300"
        : "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}>
        {i.quartile}
      </span>
    ) : <span className="text-xs text-gray-400">—</span> },
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Publikasi">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Publikasi Ilmiah</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Publikasi jurnal & prosiding dosen Universitas Lampung</p>
          </div>
          {filterTahun && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300">
              <FiFilter className="w-3.5 h-3.5" /> Tahun {filterTahun}
            </span>
          )}
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : stats && (() => {
          const total = num(stats.total);
          const berQ = num(stats.ber_quartile);
          const berDoi = num(stats.ber_doi);
          return (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard icon={<FiBookOpen className="w-6 h-6" />} label="Total Publikasi" value={total} gradient="from-blue-500 to-indigo-600" />
              <StatCard icon={<FiAward className="w-6 h-6" />} label="Ber-Quartile" value={berQ} gradient="from-emerald-500 to-teal-600" subtext={`${pct(berQ, total)} dari total`} />
              <StatCard icon={<FiExternalLink className="w-6 h-6" />} label="Ber-DOI" value={berDoi} gradient="from-violet-500 to-purple-600" subtext={`${pct(berDoi, total)} dari total`} />
              <StatCard icon={<FiTrendingUp className="w-6 h-6" />} label="Rentang Tahun" value={num(stats.rentang_tahun)} gradient="from-amber-500 to-orange-500" subtext="tahun unik" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <UnitFilter
                  data={orgFilters}
                  value={unitItems}
                  onChange={(next) => { setUnitItems(next); setPage(1); }}
                  forcedFakultas={forcedFak || undefined}
                  forcedJurusan={forcedJur || undefined}
                  forcedProdi={forcedProdi || undefined}
                />
                <Dropdown label="Tahun Terbit" value={filterTahun} onChange={(v) => { setFilterTahun(v); setPage(1); }} options={tahunOptions} placeholder="Semua Tahun" />
              </div>
              {filterTahun && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktif</span>
                  <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200 rounded-full dark:bg-blue-500/10 dark:text-blue-300">
                    Tahun {filterTahun}
                    <button type="button" onClick={() => { setFilterTahun(""); setPage(1); }} className="ml-0.5 w-4 h-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-400/20 flex items-center justify-center"><FiX className="w-3 h-3" /></button>
                  </span>
                </div>
              )}
            </div>

            <DataTable columns={columns} data={data} loading={loading} serverSide totalRecords={total}
              onPageChange={setPage}
              onRowsPerPageChange={(n) => { setLimit(n); setPage(1); }}
              onSearchChange={(q) => { setSearch(q); setPage(1); }}
              onSortChange={handleSort}
              searchPlaceholder="Cari judul, jurnal, DOI..."
              defaultRowsPerPage={10}
            />
          </motion.div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
