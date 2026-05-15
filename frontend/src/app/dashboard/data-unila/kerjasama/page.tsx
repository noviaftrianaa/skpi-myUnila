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
import { FiGlobe, FiCheckCircle, FiXCircle, FiUsers, FiFilter, FiRotateCcw, FiX, FiAlertTriangle } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../config/menuConfig";
import kerjasamaDataService from "@/lib/services/data-unila/kerjasamaDataService";
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

interface KerjasamaItem {
  judul_mou: string;
  jenis: string | null;
  mitra: string | null;
  tgl_mulai: string | null;
  tgl_selesai: string | null;
  status: string | null;
  no_mou?: string | null;
  unit_pelaksana?: string | null;
  jml_unit?: number | string;
}

export default function KerjasamaPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const forcedFak = scope.forcedFakultas || "";
  const forcedJur = scope.forcedJurusan || "";
  const forcedProdi = scope.forcedProdi || "";

  const [data, setData] = useState<KerjasamaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number | string> | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tgl_mulai");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState("aktif");

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

  useEffect(() => {
    kerjasamaDataService.getStats().then(setStats).catch(console.error).finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    kerjasamaDataService.getList({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      status: filterStatus || undefined,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
    } as Record<string, any>)
      .then((r: { data: KerjasamaItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data kerjasama"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterStatus, filterFak, filterProdi, filterJurusan, unitFilterStr]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const statusOptions: DropdownOption[] = [
    { value: "aktif", label: "Aktif" },
    { value: "expired", label: "Expired" },
  ];

  const activeChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (filterStatus && filterStatus !== "aktif") activeChips.push({ key: "stat", label: filterStatus, clear: () => { setFilterStatus("aktif"); setPage(1); } });
  const hasFilter = activeChips.length > 0;

  const EXPORT_HEADERS = {
    judul_mou: "Judul MoU",
    jenis: "Jenis",
    mitra: "Mitra",
    tgl_mulai: "Tgl Mulai",
    tgl_selesai: "Tgl Selesai",
    status: "Status",
  } as const;

  const dataForExport = useMemo(() => data, [data]);

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") { toast("Server export belum tersedia"); return; }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    if (fmtType === "excel") exportToExcel(dataForExport as unknown as Record<string, unknown>[], "kerjasama", "Kerjasama", EXPORT_HEADERS);
    else if (fmtType === "csv-client") exportToCsv(dataForExport as unknown as Record<string, unknown>[], "kerjasama", EXPORT_HEADERS);
    else if (fmtType === "pdf") exportToPdf(dataForExport as unknown as Record<string, unknown>[], "kerjasama", { title: "Kerjasama Universitas Lampung", headers: EXPORT_HEADERS, orientation: "landscape" });
    else if (fmtType === "json") exportToJson(dataForExport, "kerjasama");
    toast.success(`${fmtType.toUpperCase()} berhasil di-download`);
  };

  const handleReset = () => { setFilterStatus("aktif"); setPage(1); };

  const columns: Column<KerjasamaItem>[] = [
    { key: "judul_mou", label: "JUDUL MOU", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{i.judul_mou}</div>
        {i.jenis && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{i.jenis}</div>}
      </div>
    )},
    { key: "mitra", label: "MITRA", sortable: true, render: (i) => (
      <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{i.mitra || "—"}</span>
    )},
    { key: "unit_pelaksana", label: "UNIT PELAKSANA", render: (i) => {
      const up = (i as unknown as { unit_pelaksana?: string | null }).unit_pelaksana;
      const jml = Number((i as unknown as { jml_unit?: number | string }).jml_unit || 0);
      if (!up && !jml) return <span className="text-xs text-gray-400">—</span>;
      return (
        <div className="text-xs leading-tight">
          <div className="text-gray-800 dark:text-gray-200 line-clamp-2">{up || "—"}</div>
          {jml > 1 && <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">+{jml - 1} unit lainnya</div>}
        </div>
      );
    }},
    { key: "tgl_mulai", label: "TGL MULAI", width: "110px", sortable: true, render: (i) => (
      <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{fmtDate(i.tgl_mulai)}</span>
    )},
    { key: "tgl_selesai", label: "TGL SELESAI", width: "110px", sortable: true, render: (i) => (
      <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{fmtDate(i.tgl_selesai)}</span>
    )},
    { key: "status", label: "STATUS", width: "100px", align: "center" as const, render: (i) => (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset
        ${i.status === "Aktif" ? "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
        : "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300"}`}>
        {i.status || "—"}
      </span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Kerjasama">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Data Kerjasama</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">MoU & perjanjian kerjasama Universitas Lampung — dalam dan luar negeri</p>
          </div>
          {hasFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300">
              <FiFilter className="w-3.5 h-3.5" /> {filterStatus}
            </span>
          )}
        </div>

        {loadingStats ? (
          <StatCardGridSkeleton count={5} />
        ) : stats && (() => {
          const total = num(stats.total);
          const aktif = num(stats.aktif);
          const expired = num(stats.expired);
          const akanExp = num(stats.akan_expire);
          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard icon={<FiGlobe className="w-6 h-6" />} label="Total MoU" value={total} gradient="from-cyan-500 to-blue-600" />
              <StatCard icon={<FiCheckCircle className="w-6 h-6" />} label="Aktif" value={aktif} gradient="from-emerald-500 to-teal-600" subtext={pct(aktif, total)} />
              <StatCard icon={<FiAlertTriangle className="w-6 h-6" />} label="Akan Expire" value={akanExp} gradient="from-amber-500 to-orange-500" subtext="≤ 90 hari" />
              <StatCard icon={<FiXCircle className="w-6 h-6" />} label="Expired" value={expired} gradient="from-rose-500 to-pink-600" subtext={pct(expired, total)} />
              <StatCard icon={<FiUsers className="w-6 h-6" />} label="Mitra Unik" value={num(stats.mitra_unik)} gradient="from-violet-500 to-purple-600" />
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
                <Dropdown label="Status" value={filterStatus} onChange={(v) => { setFilterStatus(v); setPage(1); }} options={statusOptions} placeholder="Semua Status" />
              </div>
              {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktif</span>
                  {activeChips.map((c) => (
                    <span key={c.key} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200 rounded-full dark:bg-cyan-500/10 dark:text-cyan-300">
                      {c.label}
                      <button type="button" onClick={c.clear} className="ml-0.5 w-4 h-4 rounded-full hover:bg-cyan-200 dark:hover:bg-cyan-400/20 flex items-center justify-center"><FiX className="w-3 h-3" /></button>
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
              searchPlaceholder="Cari judul MoU, mitra..."
              defaultRowsPerPage={10}
            />
          </motion.div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
