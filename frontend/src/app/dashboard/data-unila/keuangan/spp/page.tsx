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
import { FiDollarSign, FiCheckCircle, FiClock, FiCreditCard, FiFilter, FiRotateCcw, FiX } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import keuanganDataService, { type SppItem, type SppStats } from "@/lib/services/data-unila/keuanganDataService";
import mahasiswaDataService, { type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { exportToCsv, exportToJson } from "@/lib/utils/exportCsv";
import { exportToPdf } from "@/lib/utils/exportPdf";
import { StatCardGridSkeleton } from "@/shared/components/data-unila/PageSkeleton";
import { fmtRupiah, num } from "@/lib/utils/formatRupiah";

const APP_KEY = "data-unila";

function fmt(n: number): string { return n.toLocaleString("id-ID"); }
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

export default function SppPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const forcedFak = scope.forcedFakultas || "";
  const forcedJur = scope.forcedJurusan || "";
  const forcedProdi = scope.forcedProdi || "";

  const [data, setData] = useState<SppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SppStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tgl_bayar");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // Default tahun = tahun ajaran aktif (2025) supaya konsisten dgn Pimpinan card.
  // Tanpa default, "Semua Tahun" akan tampil total akumulasi sejak 2015 (Triliun) yg menyesatkan.
  const [filterTahun, setFilterTahun] = useState(() => String(new Date().getFullYear() - 1));

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
  const tahunOptions: DropdownOption[] = Array.from({ length: 10 }, (_, i) => ({ value: String(currentYear - i), label: String(currentYear - i) }));

  useEffect(() => {
    keuanganDataService.getSppStats({
      tahun: filterTahun || undefined,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
    }).then(setStats).catch(console.error).finally(() => setLoadingStats(false));
  }, [filterTahun, filterFak, filterProdi, filterJurusan, unitFilterStr]);

  useEffect(() => {
    setLoading(true);
    keuanganDataService.getSppList({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      tahun: filterTahun || undefined,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
    })
      .then((r: { data: SppItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data SPP"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterTahun, filterFak, filterProdi, filterJurusan, unitFilterStr]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const EXPORT_HEADERS = {
    nipd: "NIM",
    nm_pd: "Nama Mahasiswa",
    nm_prodi: "Program Studi",
    nm_smt: "Semester",
    tgl_bayar: "Tgl Bayar",
    nominal: "Nominal",
    total_tagihan: "Total Tagihan",
    sisa_tagihan: "Sisa",
    cicilan_ke: "Cicilan Ke",
    kelas_ukt: "Kelas UKT",
  } as const;

  const dataForExport = useMemo(() => data, [data]);

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") { toast("Server export belum tersedia"); return; }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    if (fmtType === "excel") exportToExcel(dataForExport as unknown as Record<string, unknown>[], "spp", "SPP", EXPORT_HEADERS);
    else if (fmtType === "csv-client") exportToCsv(dataForExport as unknown as Record<string, unknown>[], "spp", EXPORT_HEADERS);
    else if (fmtType === "pdf") exportToPdf(dataForExport as unknown as Record<string, unknown>[], "spp", { title: "Pembayaran SPP Mahasiswa Unila", headers: EXPORT_HEADERS, orientation: "landscape" });
    else if (fmtType === "json") exportToJson(dataForExport, "spp");
    toast.success(`${fmtType.toUpperCase()} berhasil di-download`);
  };

  const columns: Column<SppItem>[] = [
    { key: "nipd", label: "NIM", width: "120px", render: (i) => (
      <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{i.nipd || "—"}</span>
    )},
    { key: "nm_pd", label: "NAMA MAHASISWA", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{i.nm_pd || "—"}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{i.nm_prodi || "—"}</div>
      </div>
    )},
    { key: "nm_smt", label: "SEMESTER", width: "120px", render: (i) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300">{i.nm_smt || i.id_smt || "—"}</span>
    )},
    { key: "tgl_bayar", label: "TGL BAYAR", width: "110px", sortable: true, render: (i) => (
      <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{fmtDate(i.tgl_bayar)}</span>
    )},
    { key: "nominal", label: "DIBAYAR", width: "140px", sortable: true, align: "right" as const, render: (i) => {
      const n = num(i.nominal);
      if (n < 0) return (
        <span className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-300" title="Koreksi / refund">
          {fmtRupiah(n)}
        </span>
      );
      return <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300">{fmtRupiah(n)}</span>;
    }},
    { key: "sisa_tagihan", label: "SISA", width: "120px", align: "right" as const, render: (i) => {
      const n = num(i.sisa_tagihan);
      if (n < 0) return (
        <span className="font-mono text-xs font-medium text-sky-700 dark:text-sky-300" title="Mahasiswa bayar lebih dari tagihan (credit balance)">
          Lebih {fmtRupiah(Math.abs(n))}
        </span>
      );
      return (
        <span className={`font-mono text-xs ${n > 0 ? "text-rose-700 dark:text-rose-300 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
          {fmtRupiah(n)}
        </span>
      );
    }},
    { key: "a_cicil", label: "TIPE", width: "100px", align: "center" as const, render: (i) => i.a_cicil ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300">Cicil {i.cicilan_ke}</span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300">Lunas</span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="SPP">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Pembayaran SPP</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Transaksi pembayaran SPP/UKT mahasiswa per semester</p>
          </div>
          {filterTahun && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300">
              <FiFilter className="w-3.5 h-3.5" /> Tahun {filterTahun}
            </span>
          )}
        </div>

        {loadingStats ? (
          <StatCardGridSkeleton count={5} />
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard icon={<FiCreditCard className="w-6 h-6" />} label="Total Transaksi" value={num(stats.total)} gradient="from-emerald-500 to-teal-600" />
            <StatCard icon={<FiDollarSign className="w-6 h-6" />} label="Total Tagihan" value={fmtRupiah(num(stats.total_tagihan))} gradient="from-blue-500 to-indigo-600" />
            <StatCard icon={<FiCheckCircle className="w-6 h-6" />} label="Terbayar" value={fmtRupiah(num(stats.total_terbayar))} gradient="from-violet-500 to-purple-600" />
            <StatCard icon={<FiCheckCircle className="w-6 h-6" />} label="Lunas" value={num(stats.lunas)} gradient="from-pink-500 to-rose-600" />
            <StatCard icon={<FiClock className="w-6 h-6" />} label="Cicilan" value={num(stats.cicilan)} gradient="from-amber-500 to-orange-500" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <UnitFilter
                  data={orgFilters}
                  value={unitItems}
                  onChange={(next) => { setUnitItems(next); setPage(1); }}
                  forcedFakultas={forcedFak || undefined}
                  forcedJurusan={forcedJur || undefined}
                  forcedProdi={forcedProdi || undefined}
                />
                <Dropdown label="Tahun" value={filterTahun} onChange={(v) => { setFilterTahun(v); setPage(1); }} options={tahunOptions} placeholder="Semua Tahun" />
              </div>
              {filterTahun && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktif</span>
                  <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 rounded-full dark:bg-emerald-500/10 dark:text-emerald-300">
                    Tahun {filterTahun}
                    <button type="button" onClick={() => { setFilterTahun(""); setPage(1); }} className="ml-0.5 w-4 h-4 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-400/20 flex items-center justify-center"><FiX className="w-3 h-3" /></button>
                  </span>
                </div>
              )}
            </div>

            <DataTable columns={columns} data={data} loading={loading} serverSide totalRecords={total}
              onPageChange={setPage}
              onRowsPerPageChange={(n) => { setLimit(n); setPage(1); }}
              onSearchChange={(q) => { setSearch(q); setPage(1); }}
              onSortChange={handleSort}
              searchPlaceholder="Cari NIM, nama mahasiswa..."
              defaultRowsPerPage={10}
            />
          </motion.div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
