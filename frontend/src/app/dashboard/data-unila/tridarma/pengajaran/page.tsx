"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import UnitFilter from "@/shared/components/data-unila/UnitFilter";
import ExportMenu, { type ExportFormat } from "@/shared/components/data-unila/ExportMenu";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import { MdSchool } from "react-icons/md";
import { FiBookOpen, FiUsers, FiClipboard, FiLayers, FiFilter, FiX } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import tridarmaDataService, {
  type PengajaranItem, type PengajaranStats,
} from "@/lib/services/data-unila/tridarmaDataService";
import mahasiswaDataService, {
  type MahasiswaFilters,
} from "@/lib/services/data-unila/mahasiswaDataService";
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

function DosenPengampuCell({ value, count }: { value: string | null; count: number }) {
  const [expanded, setExpanded] = useState(false);
  if (!value) return <span className="text-xs text-gray-400">—</span>;
  // Split by "; " — repository CONCATs with "; " (STUFF removed leading "; ")
  const dosens = value.split("; ").filter(Boolean);
  if (dosens.length === 0) return <span className="text-xs text-gray-400">—</span>;
  const visible = expanded ? dosens : dosens.slice(0, 2);
  const more = dosens.length - visible.length;
  return (
    <div className="text-xs text-gray-700 dark:text-gray-300 space-y-0.5 max-w-[340px]">
      {visible.map((d, idx) => (
        <div key={idx} className="line-clamp-1" title={d}>{d}</div>
      ))}
      {more > 0 && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          +{more} dosen lainnya
        </button>
      )}
      {expanded && count > 2 && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-[11px] font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          tutup
        </button>
      )}
    </div>
  );
}

function StatCard({
  icon, label, value, gradient, subtext,
}: { icon: React.ReactNode; label: string; value: string | number; gradient: string; subtext?: string }) {
  const display = typeof value === "number" ? fmt(value) : (/^[\d.,\s/–-]+$/.test(value) ? value : fmt(num(value)));
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

export default function PengajaranPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const forcedFak = scope.forcedFakultas || "";
  const forcedJur = scope.forcedJurusan || "";
  const forcedProdi = scope.forcedProdi || "";

  const [data, setData] = useState<PengajaranItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PengajaranStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("nama_kelas");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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
    setLoadingStats(true);
    tridarmaDataService.getPengajaranStats({
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
    })
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, [filterFak, filterProdi, filterJurusan, unitFilterStr]);

  useEffect(() => {
    setLoading(true);
    tridarmaDataService.getPengajaran({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
    })
      .then((r: { data: PengajaranItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data pengajaran"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak, filterProdi, filterJurusan, unitFilterStr]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => {
    setSortBy(k); setSortOrder(o); setPage(1);
  }, []);

  const hasFilter = !!(filterFak || filterProdi || filterJurusan || unitFilterStr);
  const activeChips: Array<{ key: string; label: string; clear: () => void }> = [];

  const EXPORT_HEADERS = {
    mata_kuliah: "Mata Kuliah",
    kode_mk: "Kode MK",
    nama_kelas: "Kelas",
    sks_mk: "SKS",
    prodi: "Program Studi",
    fakultas: "Fakultas",
    semester: "Semester",
    jumlah_dosen: "Jumlah Dosen",
    dosen_pengampu: "Dosen Pengampu",
  } as const;

  const dataForExport = useMemo(() => data, [data]);

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") { toast("Server export belum tersedia"); return; }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    const baseName = `tridarma-pengajaran-${filterFak ? "fak" : "all"}`;
    if (fmtType === "excel") {
      exportToExcel(dataForExport as unknown as Record<string, unknown>[], baseName, "Pengajaran", EXPORT_HEADERS);
      toast.success("Excel berhasil di-download");
    } else if (fmtType === "csv-client") {
      exportToCsv(dataForExport as unknown as Record<string, unknown>[], baseName, EXPORT_HEADERS);
      toast.success("CSV berhasil di-download");
    } else if (fmtType === "pdf") {
      exportToPdf(dataForExport as unknown as Record<string, unknown>[], baseName, {
        title: "Pengajaran (Kelas Kuliah) Universitas Lampung",
        subtitle: `Semester aktif: ${stats?.semester_aktif || "—"}`,
        headers: EXPORT_HEADERS,
        orientation: "landscape",
      });
      toast.success("PDF berhasil di-download");
    } else if (fmtType === "json") {
      exportToJson(dataForExport, baseName);
      toast.success("JSON berhasil di-download");
    }
  };

  const columns: Column<PengajaranItem>[] = [
    {
      key: "mata_kuliah", label: "MATA KULIAH", sortable: true,
      render: (i) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{i.mata_kuliah}</div>
          {i.kode_mk && <div className="text-xs text-gray-500 mt-0.5 font-mono">{i.kode_mk}</div>}
        </div>
      ),
    },
    {
      key: "nama_kelas", label: "KELAS", width: "110px", sortable: true,
      render: (i) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300">
          {i.nama_kelas}
        </span>
      ),
    },
    {
      key: "sks_mk", label: "SKS", width: "70px", align: "center" as const, sortable: true,
      render: (i) => <span className="font-mono text-sm">{i.sks_mk ?? "—"}</span>,
    },
    {
      key: "prodi", label: "PRODI",
      render: (i) => (
        <div>
          <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{i.prodi}</div>
          {i.fakultas && <div className="text-xs text-gray-500 line-clamp-1">{i.fakultas}</div>}
        </div>
      ),
    },
    {
      key: "dosen_pengampu", label: "DOSEN PENGAMPU",
      render: (i) => <DosenPengampuCell value={i.dosen_pengampu} count={i.jumlah_dosen} />,
    },
    {
      key: "jumlah_dosen", label: "JML", width: "70px", align: "center" as const,
      render: (i) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300">
          {i.jumlah_dosen}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={dataUnilaMenuConfig}
      pageTitle="Pengajaran"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Pengajaran</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelas kuliah aktif di semester <strong>{stats?.semester_aktif || "berjalan"}</strong> — Universitas Lampung
            </p>
          </div>
          {hasFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30">
              <FiFilter className="w-3.5 h-3.5" /> Statistik sesuai filter aktif
            </span>
          )}
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={<FiLayers className="w-6 h-6" />} label="Total Kelas" value={num(stats.total_kelas)} gradient="from-violet-500 to-purple-600" />
            <StatCard icon={<FiBookOpen className="w-6 h-6" />} label="Mata Kuliah" value={num(stats.total_matkul)} gradient="from-indigo-500 to-blue-600" />
            <StatCard icon={<FiUsers className="w-6 h-6" />} label="Dosen Mengajar" value={num(stats.total_dosen)} gradient="from-emerald-500 to-teal-600" />
            <StatCard icon={<FiClipboard className="w-6 h-6" />} label="Total SKS" value={num(stats.total_sks)} gradient="from-amber-500 to-orange-500" />
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

              <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-3">
                <UnitFilter
                  data={orgFilters}
                  value={unitItems}
                  onChange={(next) => { setUnitItems(next); setPage(1); }}
                  forcedFakultas={forcedFak || undefined}
                  forcedJurusan={forcedJur || undefined}
                  forcedProdi={forcedProdi || undefined}
                />
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
              searchPlaceholder="Cari mata kuliah, kelas, kode MK, prodi..."
              defaultRowsPerPage={20}
            />
          </motion.div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
