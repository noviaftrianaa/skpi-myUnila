"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import Dropdown, { type DropdownOption } from "@/shared/components/data-unila/Dropdown";
import UnitFilter from "@/shared/components/data-unila/UnitFilter";
import ExportMenu, { type ExportFormat } from "@/shared/components/data-unila/ExportMenu";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import { MdSchool } from "react-icons/md";
import { FiClipboard, FiUsers, FiCalendar, FiBookOpen, FiFilter, FiX } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import mahasiswaDataService, {
  type MahasiswaFilters, type UjianItem, type UjianStats,
} from "@/lib/services/data-unila/mahasiswaDataService";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { exportToCsv, exportToJson } from "@/lib/utils/exportCsv";
import { exportToPdf } from "@/lib/utils/exportPdf";
import { StatCardGridSkeleton } from "@/shared/components/data-unila/PageSkeleton";

const APP_KEY = "data-unila";

const num = (v: unknown) => typeof v === "number" ? v : (parseInt(String(v || 0), 10) || 0);
const fmt = (n: number) => n.toLocaleString("id-ID");

function StatCard({ icon, label, value, gradient, subtext }: { icon: React.ReactNode; label: string; value: string | number; gradient: string; subtext?: string }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradient} text-white p-4 shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
          {subtext && <div className="text-[10px] opacity-80 truncate">{subtext}</div>}
        </div>
      </div>
    </div>
  );
}

export default function UjianPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const forcedFak = scope.forcedFakultas || "";
  const forcedJur = scope.forcedJurusan || "";
  const forcedProdi = scope.forcedProdi || "";

  const [data, setData] = useState<UjianItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UjianStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [orgFilters, setOrgFilters] = useState<MahasiswaFilters | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tgl_selesai");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [filterFak, setFilterFak] = useState(forcedFak);
  const [filterProdi, setFilterProdi] = useState(forcedProdi);
  const [filterJurusan, setFilterJurusan] = useState(forcedJur);
  const [filterJenis, setFilterJenis] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
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
    setLoadingStats(true);
    mahasiswaDataService.getUjianStats({
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
    }).then(setStats).catch(console.error).finally(() => setLoadingStats(false));
  }, [filterFak, filterProdi, filterJurusan, unitFilterStr]);

  useEffect(() => {
    setLoading(true);
    mahasiswaDataService.getUjian({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
      jenis_ujian: filterJenis || undefined,
      tahun: filterTahun || undefined,
    })
      .then((r: { data: UjianItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data ujian mahasiswa"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak, filterProdi, filterJurusan, unitFilterStr, filterJenis, filterTahun]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const jenisOptions: DropdownOption[] = useMemo(() => {
    const arr = stats?.by_jenis || [];
    return arr.filter(j => j.jenis).map(j => ({ value: j.jenis, label: `${j.jenis} (${j.jumlah.toLocaleString("id-ID")})` }));
  }, [stats]);

  const currentYear = new Date().getFullYear();
  const tahunOptions: DropdownOption[] = Array.from({ length: 10 }, (_, i) => ({ value: String(currentYear - i), label: String(currentYear - i) }));

  const activeChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (filterJenis) activeChips.push({ key: "jns", label: `Jenis: ${filterJenis}`, clear: () => { setFilterJenis(""); setPage(1); } });
  if (filterTahun) activeChips.push({ key: "thn", label: `Tahun: ${filterTahun}`, clear: () => { setFilterTahun(""); setPage(1); } });

  const EXPORT_HEADERS = {
    nm_sdm: "Nama Dosen",
    nidn: "NIDN",
    nip: "NIP",
    peran_uji: "Peran",
    judul_ujian: "Judul Ujian",
    jenis_ujian: "Jenis",
    nm_mahasiswa: "Mahasiswa",
    nipd_mahasiswa: "NIM",
    nm_prodi: "Program Studi",
    nm_fakultas: "Fakultas",
    tahun: "Tahun",
    tgl_selesai: "Tgl Selesai",
  } as const;

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") { toast("Server export belum tersedia"); return; }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    const baseName = `ujian-${filterTahun || "all"}`;
    if (fmtType === "excel") exportToExcel(data as unknown as Record<string, unknown>[], baseName, "Ujian Mahasiswa", EXPORT_HEADERS);
    else if (fmtType === "csv-client") exportToCsv(data as unknown as Record<string, unknown>[], baseName, EXPORT_HEADERS);
    else if (fmtType === "pdf") exportToPdf(data as unknown as Record<string, unknown>[], baseName, { title: "Ujian Mahasiswa Universitas Lampung", headers: EXPORT_HEADERS, orientation: "landscape" });
    else if (fmtType === "json") exportToJson(data, baseName);
    toast.success(`${fmtType.toUpperCase()} berhasil di-download`);
  };

  const columns: Column<UjianItem>[] = [
    { key: "judul_ujian", label: "JUDUL UJIAN", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{i.judul_ujian || "—"}</div>
        {i.nm_mahasiswa && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            <span className="font-medium">Mhs:</span> {i.nm_mahasiswa}
            {i.nipd_mahasiswa && <span className="ml-1 font-mono">({i.nipd_mahasiswa})</span>}
          </div>
        )}
      </div>
    )},
    { key: "jenis_ujian", label: "JENIS", width: "140px", sortable: true, render: (i) => i.jenis_ujian ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ring-1 ring-inset bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 max-w-[130px] truncate" title={i.jenis_ujian}>
        {i.jenis_ujian}
      </span>
    ) : <span className="text-xs text-gray-400">—</span> },
    { key: "nm_sdm", label: "DOSEN PENGUJI", sortable: true, render: (i) => (
      <div>
        <div className="text-sm text-gray-900 dark:text-white">{i.nm_sdm || "—"}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{i.nidn || i.nip || "—"}</div>
      </div>
    )},
    { key: "peran_uji", label: "PERAN", width: "110px", align: "center" as const, render: (i) => (
      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300">
        {i.peran_uji || "—"}
      </span>
    )},
    { key: "nm_prodi", label: "PRODI", sortable: true, render: (i) => (
      <div>
        <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{i.nm_prodi || "—"}</div>
        {i.nm_fakultas && <div className="text-xs text-gray-500 line-clamp-1">{i.nm_fakultas}</div>}
      </div>
    )},
    { key: "tgl_selesai", label: "TGL UJIAN", width: "110px", sortable: true, render: (i) => (
      <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{i.tgl_selesai || "—"}</span>
    )},
  ];

  const hasFilter = activeChips.length > 0;

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Ujian Mahasiswa">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Ujian Mahasiswa</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Relasi dosen-penguji ke aktivitas akademik mahasiswa (skripsi, tesis, disertasi, ujian akhir dll).</p>
          </div>
          {hasFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300">
              <FiFilter className="w-3.5 h-3.5" /> Statistik sesuai filter aktif
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2"><div className="flex-1 min-w-0"><ScopeBadge /></div></div>

        {loadingStats ? (
          <StatCardGridSkeleton count={4} />
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={<FiClipboard className="w-5 h-5" />} label="Total Penguji-Ujian" value={fmt(num(stats.total))} gradient="from-violet-500 to-purple-600" />
            <StatCard icon={<FiUsers className="w-5 h-5" />} label="Dosen Penguji" value={fmt(num(stats.total_dosen))} gradient="from-blue-500 to-indigo-600" />
            <StatCard icon={<FiBookOpen className="w-5 h-5" />} label="Aktivitas Ujian" value={fmt(num(stats.total_ujian))} gradient="from-emerald-500 to-teal-600" />
            <StatCard icon={<FiCalendar className="w-5 h-5" />} label="Jenis Ujian" value={fmt(num(stats.total_jenis))} gradient="from-amber-500 to-orange-600" />
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
                {jenisOptions.length > 0 && (
                  <Dropdown label="Jenis Ujian" value={filterJenis} onChange={(v) => { setFilterJenis(v); setPage(1); }} options={jenisOptions} placeholder="Semua Jenis" searchable />
                )}
                <Dropdown label="Tahun" value={filterTahun} onChange={(v) => { setFilterTahun(v); setPage(1); }} options={tahunOptions} placeholder="Semua Tahun" />
              </div>
              {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktif</span>
                  {activeChips.map((c) => (
                    <span key={c.key} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-violet-50 text-violet-700 ring-1 ring-violet-200 rounded-full dark:bg-violet-500/10 dark:text-violet-300">
                      {c.label}
                      <button type="button" onClick={c.clear} className="ml-0.5 w-4 h-4 rounded-full hover:bg-violet-200 dark:hover:bg-violet-400/20 flex items-center justify-center">
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <DataTable columns={columns} data={data} loading={loading} serverSide totalRecords={total}
              currentPage={page} pageSize={limit} pageSizeOptions={[10, 20, 50, 100]}
              onPageChange={setPage} onPageSizeChange={setLimit}
              sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort}
              onSearchChange={(q) => { setSearch(q); setPage(1); }} searchValue={search}
              searchPlaceholder="Cari judul / dosen / NIDN..." />
          </motion.div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
