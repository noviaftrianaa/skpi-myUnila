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
import { FiBookOpen, FiUsers, FiCalendar, FiGrid, FiFilter, FiX } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import dosenDataService, {
  type PendidikanItem, type PendidikanStats,
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

export default function PendidikanPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const forcedFak = scope.forcedFakultas || "";
  const forcedJur = scope.forcedJurusan || "";
  const forcedProdi = scope.forcedProdi || "";

  const [data, setData] = useState<PendidikanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PendidikanStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("thn_lulus");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [orgFilters, setOrgFilters] = useState<MahasiswaFilters | null>(null);
  const [filterFak, setFilterFak] = useState(forcedFak);
  const [filterProdi, setFilterProdi] = useState(forcedProdi);
  const [filterJurusan, setFilterJurusan] = useState(forcedJur);
  const [filterJenjang, setFilterJenjang] = useState("");
  const [unitItems, setUnitItems] = useState<string[]>([]);
  const unitFilterStr = unitItems.join(",");
  const [selectedSdm, setSelectedSdm] = useState<string | null>(null);

  useEffect(() => { setFilterFak(forcedFak); }, [forcedFak]);
  useEffect(() => { setFilterProdi(forcedProdi); }, [forcedProdi]);
  useEffect(() => { setFilterJurusan(forcedJur); }, [forcedJur]);

  // URL param init — deep-link from Pimpinan / external (e.g. ?jenjang=S3)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const usp = new URLSearchParams(window.location.search);
    const v = usp.get("jenjang");
    if (v) setFilterJenjang(v);
  }, []);

  useEffect(() => {
    mahasiswaDataService.getFilters({ id_fakultas: filterFak || undefined, id_jurusan: filterJurusan || undefined })
      .then(setOrgFilters).catch(console.error);
  }, [filterFak, filterJurusan]);

  useEffect(() => {
    setLoadingStats(true);
    dosenDataService.getPendidikanStats({
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
      jenjang: filterJenjang || undefined,
    } as Record<string, string>)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, [filterFak, filterProdi, filterJurusan, unitFilterStr, filterJenjang]);

  useEffect(() => {
    setLoading(true);
    dosenDataService.getPendidikanList({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
      jenjang: filterJenjang || undefined,
    } as Record<string, any>)
      .then((r: { data: PendidikanItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data pendidikan"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak, filterProdi, filterJurusan, unitFilterStr, filterJenjang]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => {
    setSortBy(k); setSortOrder(o); setPage(1);
  }, []);

  const jenjangOptions: DropdownOption[] = (stats?.by_jenjang || [])
    .map((j) => ({ value: j.nm_jenjang, label: `${j.nm_jenjang} (${j.jumlah})` }));

  const activeChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (filterJenjang) activeChips.push({ key: "jjg", label: `Jenjang: ${filterJenjang}`, clear: () => { setFilterJenjang(""); setPage(1); } });
  const hasFilter = activeChips.length > 0;

  const EXPORT_HEADERS = {
    nm_sdm: "Nama Dosen",
    nidn: "NIDN",
    nip: "NIP",
    jenjang: "Jenjang",
    gelar: "Gelar",
    bidang_studi: "Bidang Studi",
    institusi: "Institusi Asal",
    thn_lulus: "Tahun Lulus",
    nm_prodi: "Program Studi",
    nm_fakultas: "Fakultas",
  } as const;

  const dataForExport = useMemo(() => data, [data]);

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") { toast("Server export belum tersedia"); return; }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    const baseName = `pendidikan-dosen-${filterJenjang || "all"}`;
    if (fmtType === "excel") {
      exportToExcel(dataForExport as unknown as Record<string, unknown>[], baseName, "Pendidikan", EXPORT_HEADERS);
      toast.success("Excel berhasil di-download");
    } else if (fmtType === "csv-client") {
      exportToCsv(dataForExport as unknown as Record<string, unknown>[], baseName, EXPORT_HEADERS);
      toast.success("CSV berhasil di-download");
    } else if (fmtType === "pdf") {
      exportToPdf(dataForExport as unknown as Record<string, unknown>[], baseName, {
        title: "Riwayat Pendidikan Dosen Universitas Lampung",
        headers: EXPORT_HEADERS,
        orientation: "landscape",
      });
      toast.success("PDF berhasil di-download");
    } else if (fmtType === "json") {
      exportToJson(dataForExport, baseName);
      toast.success("JSON berhasil di-download");
    }
  };

  const columns: Column<PendidikanItem>[] = [
    {
      key: "nm_sdm", label: "NAMA DOSEN", sortable: true,
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
      key: "jenjang", label: "JENJANG", width: "100px", sortable: true,
      render: (i) => {
        const j = i.jenjang || "—";
        const tone =
          /S3/i.test(j) ? "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300" :
          /S2/i.test(j) ? "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300" :
          /S1/i.test(j) ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300" :
          /Sp-?[12]|Profesi/i.test(j) ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300" :
          "bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300";
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ring-1 ring-inset ${tone}`}>
            {j}
          </span>
        );
      },
    },
    {
      key: "bidang_studi", label: "BIDANG STUDI / GELAR", sortable: true,
      render: (i) => (
        <div>
          <div className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{i.bidang_studi || "—"}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{i.gelar ? `(${i.gelar})` : ""} {i.institusi || ""}</div>
        </div>
      ),
    },
    {
      key: "thn_lulus", label: "TAHUN", width: "80px", align: "center" as const, sortable: true,
      render: (i) => (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300">
          {i.thn_lulus || "—"}
        </span>
      ),
    },
    {
      key: "ipk", label: "IPK", width: "80px", align: "right" as const,
      render: (i) => (
        <span className="font-mono text-xs text-emerald-700 dark:text-emerald-300 tabular-nums">
          {i.ipk ? Number(i.ipk).toFixed(2) : "—"}
        </span>
      ),
    },
    {
      key: "nm_prodi", label: "HOMEBASE",
      render: (i) => (
        <div>
          <div className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{i.nm_prodi || "—"}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{i.nm_fakultas || "—"}</div>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={dataUnilaMenuConfig}
      pageTitle="Riwayat Pendidikan Dosen"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Riwayat Pendidikan Dosen</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Riwayat pendidikan formal — jenjang, gelar, bidang studi, dan institusi asal</p>
          </div>
          {hasFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30">
              <FiFilter className="w-3.5 h-3.5" /> Statistik sesuai filter aktif
            </span>
          )}
        </div>

        {loadingStats ? (
          <StatCardGridSkeleton count={5} />
        ) : stats && (() => {
          const total = num(stats.total);
          const totalDosen = num(stats.total_dosen);
          return (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard icon={<FiBookOpen className="w-6 h-6" />} label="Total Riwayat" value={total} gradient="from-blue-500 to-indigo-600" />
              <StatCard icon={<FiUsers className="w-6 h-6" />} label="Dosen Tercatat" value={totalDosen} gradient="from-emerald-500 to-teal-600" subtext={`rata-rata ${total && totalDosen ? (total / totalDosen).toFixed(1) : "—"} pendidikan/dosen`} />
              <StatCard icon={<FiGrid className="w-6 h-6" />} label="Jenjang Tercatat" value={num(stats.total_jenjang)} gradient="from-violet-500 to-purple-600" />
              <StatCard
                icon={<FiCalendar className="w-6 h-6" />}
                label="Rentang Tahun"
                value={stats.tahun_min && stats.tahun_max ? `${stats.tahun_min} – ${stats.tahun_max}` : "—"}
                gradient="from-amber-500 to-orange-500"
                subtext="tahun lulus min-max"
              />
            </div>
          );
        })()}

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
                {jenjangOptions.length > 0 && (
                  <Dropdown label="Jenjang Pendidikan" value={filterJenjang}
                    onChange={(v) => { setFilterJenjang(v); setPage(1); }}
                    options={jenjangOptions} placeholder="Semua Jenjang" searchable />
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
              searchPlaceholder="Cari nama dosen, NIDN, institusi asal, bidang studi..."
              defaultRowsPerPage={10}
            />
          </motion.div>
        </div>
      </div>
      <DosenProfileModal idSdm={selectedSdm} onClose={() => setSelectedSdm(null)} />
    </DashboardLayoutWithDynamicMenu>
  );
}
