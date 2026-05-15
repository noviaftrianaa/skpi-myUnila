"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import UnitFilter from "@/shared/components/data-unila/UnitFilter";
import ExportMenu, { type ExportFormat } from "@/shared/components/data-unila/ExportMenu";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import { MdSchool } from "react-icons/md";
import { FiBookOpen, FiCheckCircle, FiClipboard, FiBarChart2, FiFilter } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import akademikDataService, { type KurikulumItem, type KurikulumStats } from "@/lib/services/data-unila/akademikDataService";
import KurikulumMatkulModal from "@/shared/components/data-unila/KurikulumMatkulModal";
import mahasiswaDataService, { type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { exportToCsv, exportToJson } from "@/lib/utils/exportCsv";
import { exportToPdf } from "@/lib/utils/exportPdf";
import { StatCardGridSkeleton } from "@/shared/components/data-unila/PageSkeleton";

const APP_KEY = "data-unila";

const num = (v: unknown) => typeof v === "number" ? v : (parseFloat(String(v || 0)) || 0);
const fmt = (n: number) => Number.isInteger(n) ? n.toLocaleString("id-ID") : n.toFixed(2);

function StatCard({ icon, label, value, gradient }: { icon: React.ReactNode; label: string; value: string | number; gradient: string }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradient} text-white p-4 shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default function KurikulumPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const forcedFak = scope.forcedFakultas || "";
  const forcedJur = scope.forcedJurusan || "";
  const forcedProdi = scope.forcedProdi || "";

  const [data, setData] = useState<KurikulumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<KurikulumStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [orgFilters, setOrgFilters] = useState<MahasiswaFilters | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tahun_mulai");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterFak, setFilterFak] = useState(forcedFak);
  const [filterProdi, setFilterProdi] = useState(forcedProdi);
  const [filterJurusan, setFilterJurusan] = useState(forcedJur);
  const [unitItems, setUnitItems] = useState<string[]>([]);
  const unitFilterStr = unitItems.join(",");
  const [selectedKurikulum, setSelectedKurikulum] = useState<string | null>(null);

  useEffect(() => { setFilterFak(forcedFak); }, [forcedFak]);
  useEffect(() => { setFilterProdi(forcedProdi); }, [forcedProdi]);
  useEffect(() => { setFilterJurusan(forcedJur); }, [forcedJur]);

  useEffect(() => {
    mahasiswaDataService.getFilters({ id_fakultas: filterFak || undefined, id_jurusan: filterJurusan || undefined })
      .then(setOrgFilters).catch(console.error);
  }, [filterFak, filterJurusan]);

  useEffect(() => {
    setLoadingStats(true);
    akademikDataService.getKurikulumStats({
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
    }).then(setStats).catch(console.error).finally(() => setLoadingStats(false));
  }, [filterFak, filterProdi, filterJurusan, unitFilterStr]);

  useEffect(() => {
    setLoading(true);
    akademikDataService.getKurikulum({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
    })
      .then((r: { data: KurikulumItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data kurikulum"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak, filterProdi, filterJurusan, unitFilterStr]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const EXPORT_HEADERS = {
    nm_kurikulum: "Nama Kurikulum",
    nm_prodi: "Program Studi",
    nm_fakultas: "Fakultas",
    jenjang: "Jenjang",
    tahun_mulai: "Tahun Mulai",
    sks_lulus: "SKS Lulus",
    sks_wajib: "SKS Wajib",
    sks_pilihan: "SKS Pilihan",
    jmlh_smt_normal: "Semester Normal",
    jml_matkul: "Jumlah Matkul",
    a_digunakan: "Aktif",
  } as const;

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") { toast("Server export belum tersedia"); return; }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    if (fmtType === "excel") exportToExcel(data as unknown as Record<string, unknown>[], "kurikulum", "Kurikulum", EXPORT_HEADERS);
    else if (fmtType === "csv-client") exportToCsv(data as unknown as Record<string, unknown>[], "kurikulum", EXPORT_HEADERS);
    else if (fmtType === "pdf") exportToPdf(data as unknown as Record<string, unknown>[], "kurikulum", { title: "Kurikulum Universitas Lampung", headers: EXPORT_HEADERS, orientation: "landscape" });
    else if (fmtType === "json") exportToJson(data, "kurikulum");
    toast.success(`${fmtType.toUpperCase()} berhasil di-download`);
  };

  const columns: Column<KurikulumItem>[] = [
    { key: "nm_kurikulum", label: "NAMA KURIKULUM", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{i.nm_kurikulum || "—"}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{i.nm_prodi}</div>
      </div>
    )},
    { key: "jenjang", label: "JENJANG", width: "90px", align: "center" as const, render: (i) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300">
        {i.jenjang || "—"}
      </span>
    )},
    { key: "tahun_mulai", label: "TAHUN MULAI", width: "110px", sortable: true, align: "center" as const, render: (i) => (
      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300">{i.tahun_mulai}</span>
    )},
    { key: "sks_lulus", label: "SKS LULUS", width: "100px", sortable: true, align: "right" as const, render: (i) => (
      <div className="text-right">
        <div className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">{fmt(num(i.sks_lulus))}</div>
        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">W:{fmt(num(i.sks_wajib))} P:{fmt(num(i.sks_pilihan))}</div>
      </div>
    )},
    { key: "jmlh_smt_normal", label: "SEMESTER", width: "90px", align: "center" as const, render: (i) => (
      <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{i.jmlh_smt_normal || "—"} smt</span>
    )},
    { key: "jml_matkul", label: "MATKUL", width: "110px", sortable: true, align: "center" as const, render: (i) => (
      <button type="button" onClick={() => setSelectedKurikulum(i.id_kurikulum_sp)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ring-1 ring-inset bg-violet-50 text-violet-700 ring-violet-200 hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-300 transition-colors"
        title="Lihat list matkul + total SKS">
        {fmt(num(i.jml_matkul))} matkul
      </button>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Kurikulum">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Kurikulum Prodi</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Daftar kurikulum per program studi (pdrd.kurikulum_sp) — SKS lulus, jumlah matkul, status aktif.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2"><div className="flex-1 min-w-0"><ScopeBadge /></div></div>

        {loadingStats ? (
          <StatCardGridSkeleton count={4} />
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={<FiClipboard className="w-5 h-5" />} label="Total Kurikulum" value={fmt(num(stats.total))} gradient="from-violet-500 to-purple-600" />
            <StatCard icon={<FiCheckCircle className="w-5 h-5" />} label="Sedang Digunakan" value={fmt(num(stats.aktif))} gradient="from-emerald-500 to-teal-600" />
            <StatCard icon={<FiBookOpen className="w-5 h-5" />} label="Prodi Tercakup" value={fmt(num(stats.total_prodi))} gradient="from-blue-500 to-indigo-600" />
            <StatCard icon={<FiBarChart2 className="w-5 h-5" />} label="Avg SKS Lulus" value={num(stats.avg_sks).toFixed(1)} gradient="from-amber-500 to-orange-600" />
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden border border-gray-200/50 dark:border-gray-800">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="p-4 sm:p-5 space-y-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <FiFilter className="w-3.5 h-3.5" /> Filter Data
                </span>
                <ExportMenu onExport={handleExport} disabled={{ "csv-server": true }} />
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
              </div>
            </div>

            <DataTable columns={columns} data={data} loading={loading} serverSide totalRecords={total}
              currentPage={page} pageSize={limit} pageSizeOptions={[10, 20, 50, 100]}
              onPageChange={setPage} onPageSizeChange={setLimit}
              sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort}
              onSearchChange={(q) => { setSearch(q); setPage(1); }} searchValue={search}
              searchPlaceholder="Cari nama kurikulum / prodi..." />
          </motion.div>
        </div>
      </div>
      <KurikulumMatkulModal idKurikulum={selectedKurikulum} onClose={() => setSelectedKurikulum(null)} />
    </DashboardLayoutWithDynamicMenu>
  );
}
