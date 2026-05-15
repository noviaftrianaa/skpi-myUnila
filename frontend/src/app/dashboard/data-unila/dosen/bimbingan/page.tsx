"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import Dropdown, { type DropdownOption } from "@/shared/components/data-unila/Dropdown";
import UnitFilter from "@/shared/components/data-unila/UnitFilter";
import ExportMenu, { type ExportFormat } from "@/shared/components/data-unila/ExportMenu";
import DosenProfileModal from "@/shared/components/data-unila/DosenProfileModal";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import { MdSchool } from "react-icons/md";
import {
  FiBookOpen, FiUsers, FiGrid, FiAward, FiFilter, FiX,
} from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import dosenDataService, {
  type BimbinganItem, type BimbinganStats,
} from "@/lib/services/data-unila/dosenDataService";
import mahasiswaDataService, {
  type MahasiswaFilters,
} from "@/lib/services/data-unila/mahasiswaDataService";
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

function StatCard({
  icon, label, value, gradient, subtext,
}: { icon: React.ReactNode; label: string; value: string | number; gradient: string; subtext?: string }) {
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

export default function BimbinganPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const forcedFak = scope.forcedFakultas || "";
  const forcedJur = scope.forcedJurusan || "";
  const forcedProdi = scope.forcedProdi || "";

  const [data, setData] = useState<BimbinganItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BimbinganStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tgl_mulai");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [orgFilters, setOrgFilters] = useState<MahasiswaFilters | null>(null);
  const [filterFak, setFilterFak] = useState(forcedFak);
  const [filterProdi, setFilterProdi] = useState(forcedProdi);
  const [filterJurusan, setFilterJurusan] = useState(forcedJur);
  const [filterJenisAkt, setFilterJenisAkt] = useState("");
  const [unitItems, setUnitItems] = useState<string[]>([]);
  const unitFilterStr = unitItems.join(",");
  const [selectedSdm, setSelectedSdm] = useState<string | null>(null);

  useEffect(() => { setFilterFak(forcedFak); }, [forcedFak]);
  useEffect(() => { setFilterProdi(forcedProdi); }, [forcedProdi]);
  useEffect(() => { setFilterJurusan(forcedJur); }, [forcedJur]);

  useEffect(() => {
    mahasiswaDataService.getFilters({ id_fakultas: filterFak || undefined, id_jurusan: filterJurusan || undefined })
      .then(setOrgFilters).catch(console.error);
  }, [filterFak, filterJurusan]);

  useEffect(() => {
    setLoadingStats(true);
    dosenDataService.getBimbinganStats({
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
      jenis_aktivitas: filterJenisAkt || undefined,
    })
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, [filterFak, filterProdi, filterJurusan, unitFilterStr, filterJenisAkt]);

  useEffect(() => {
    setLoading(true);
    dosenDataService.getBimbinganList({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
      jenis_aktivitas: filterJenisAkt || undefined,
    })
      .then((r: { data: BimbinganItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data bimbingan"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak, filterProdi, filterJurusan, unitFilterStr, filterJenisAkt]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => {
    setSortBy(k); setSortOrder(o); setPage(1);
  }, []);

  const jenisAktOptions: DropdownOption[] = (stats?.by_jenis_aktivitas || [])
    .map((j) => ({ value: j.jenis_aktivitas, label: `${j.jenis_aktivitas} (${fmt(num(j.jumlah))})` }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const activeChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (filterJenisAkt) activeChips.push({ key: "ja", label: `Jenis: ${filterJenisAkt}`, clear: () => { setFilterJenisAkt(""); setPage(1); } });
  const hasFilter = activeChips.length > 0;

  const EXPORT_HEADERS = {
    nm_sdm: "Nama Dosen",
    nidn: "NIDN",
    judul_bimbingan: "Judul",
    jenis_aktivitas: "Jenis",
    nm_mahasiswa: "Mahasiswa",
    nipd_mahasiswa: "NIM",
    urutan_promotor: "Urutan Promotor",
    no_sk: "No. SK",
    tgl_sk: "Tgl SK",
    tgl_mulai: "Tgl Mulai",
    tgl_selesai: "Tgl Selesai",
    nm_prodi: "Program Studi",
    nm_fakultas: "Fakultas",
  } as const;

  const dataForExport = useMemo(() => data, [data]);

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") { toast("Server export belum tersedia"); return; }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    const baseName = `bimbingan-mahasiswa-${filterJenisAkt || "all"}`;
    if (fmtType === "excel") {
      exportToExcel(dataForExport as unknown as Record<string, unknown>[], baseName, "Bimbingan", EXPORT_HEADERS);
      toast.success("Excel berhasil di-download");
    } else if (fmtType === "csv-client") {
      exportToCsv(dataForExport as unknown as Record<string, unknown>[], baseName, EXPORT_HEADERS);
      toast.success("CSV berhasil di-download");
    } else if (fmtType === "pdf") {
      exportToPdf(dataForExport as unknown as Record<string, unknown>[], baseName, {
        title: "Bimbingan Mahasiswa Universitas Lampung",
        headers: EXPORT_HEADERS,
        orientation: "landscape",
      });
      toast.success("PDF berhasil di-download");
    } else if (fmtType === "json") {
      exportToJson(dataForExport, baseName);
      toast.success("JSON berhasil di-download");
    }
  };

  const columns: Column<BimbinganItem>[] = [
    {
      key: "nm_sdm", label: "DOSEN PEMBIMBING", sortable: true,
      render: (i) => (
        <button type="button" onClick={() => setSelectedSdm(i.id_sdm)} className="text-left group">
          <div className="font-medium text-blue-700 dark:text-blue-400 underline decoration-blue-300 decoration-dotted underline-offset-2 group-hover:decoration-solid group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">{i.nm_sdm}</div>
          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
            {i.nidn || "—"} {i.nip && `· ${i.nip}`}
          </div>
        </button>
      ),
    },
    {
      key: "judul_bimbingan", label: "JUDUL & MAHASISWA", sortable: true,
      render: (i) => (
        <div>
          <div className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 max-w-[400px]">{i.judul_bimbingan || "—"}</div>
          {i.nm_mahasiswa && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
              <span className="font-medium">Mhs:</span> {i.nm_mahasiswa}
              {i.nipd_mahasiswa && <span className="ml-1 font-mono">({i.nipd_mahasiswa})</span>}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "jenis_aktivitas", label: "JENIS", width: "140px", sortable: true,
      render: (i) => {
        const j = i.jenis_aktivitas || "—";
        const tone =
          /Skripsi/i.test(j) ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300" :
          /Tesis/i.test(j) ? "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300" :
          /Disertasi/i.test(j) ? "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300" :
          /KKN/i.test(j) ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300" :
          "bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300";
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ring-1 ring-inset ${tone}`} title={j}>
            {j}
          </span>
        );
      },
    },
    {
      key: "urutan_promotor", label: "PROMOTOR", width: "100px", align: "center" as const,
      render: (i) => i.urutan_promotor != null ? (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300">
          Ke-{i.urutan_promotor}
        </span>
      ) : <span className="text-xs text-gray-400">—</span>,
    },
    {
      key: "nm_prodi", label: "PRODI", sortable: true,
      render: (i) => (
        <div>
          <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{i.nm_prodi || "—"}</div>
          {i.nm_fakultas && <div className="text-xs text-gray-500 line-clamp-1">{i.nm_fakultas}</div>}
        </div>
      ),
    },
    {
      key: "no_sk", label: "NO. SK / TGL", width: "180px",
      render: (i) => {
        const noSk = (i as unknown as { no_sk?: string | null }).no_sk;
        const tglSk = (i as unknown as { tgl_sk?: string | null }).tgl_sk;
        if (!noSk && !tglSk) return <span className="text-xs text-gray-400">—</span>;
        return (
          <div className="text-xs leading-tight">
            {noSk && <div className="font-mono text-gray-800 dark:text-gray-200 break-words">{noSk}</div>}
            {tglSk && <div className="text-gray-500 dark:text-gray-400 font-mono mt-0.5">{tglSk}</div>}
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={dataUnilaMenuConfig}
      pageTitle="Bimbingan Mahasiswa"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Bimbingan Mahasiswa</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Relasi dosen-mahasiswa pada aktivitas akademik — Skripsi, Tesis, Disertasi, KKN dll.</p>
          </div>
          {hasFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30">
              <FiFilter className="w-3.5 h-3.5" /> Statistik sesuai filter aktif
            </span>
          )}
        </div>

        {loadingStats ? (
          <StatCardGridSkeleton count={4} />
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={<FiBookOpen className="w-6 h-6" />} label="Total Bimbingan" value={num(stats.total)} gradient="from-blue-500 to-indigo-600" />
            <StatCard icon={<FiUsers className="w-6 h-6" />} label="Dosen Pembimbing" value={num(stats.total_dosen)} gradient="from-emerald-500 to-teal-600" />
            <StatCard icon={<FiAward className="w-6 h-6" />} label="Aktivitas" value={num(stats.total_aktivitas)} gradient="from-violet-500 to-purple-600" />
            <StatCard icon={<FiGrid className="w-6 h-6" />} label="Jenis Aktivitas" value={num(stats.total_jenis)} gradient="from-amber-500 to-orange-500" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-0"><ScopeBadge /></div>
        </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                <UnitFilter
                  data={orgFilters}
                  value={unitItems}
                  onChange={(next) => { setUnitItems(next); setPage(1); }}
                  forcedFakultas={forcedFak || undefined}
                  forcedJurusan={forcedJur || undefined}
                  forcedProdi={forcedProdi || undefined}
                />
                {jenisAktOptions.length > 0 && (
                  <Dropdown label="Jenis Aktivitas" value={filterJenisAkt}
                    onChange={(v) => { setFilterJenisAkt(v); setPage(1); }}
                    options={jenisAktOptions} placeholder="Semua Jenis" searchable />
                )}
              </div>

              {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktif</span>
                  {activeChips.map((c) => (
                    <span key={c.key} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 rounded-full dark:bg-emerald-500/10 dark:text-emerald-300">
                      {c.label}
                      <button type="button" onClick={c.clear} className="ml-0.5 w-4 h-4 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-400/20 flex items-center justify-center">
                        <FiX className="w-3 h-3" />
                      </button>
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
              searchPlaceholder="Cari nama dosen, NIDN, judul..."
              defaultRowsPerPage={20}
            />
          </motion.div>
        </div>
      </div>
      <DosenProfileModal idSdm={selectedSdm} onClose={() => setSelectedSdm(null)} />
    </DashboardLayoutWithDynamicMenu>
  );
}
