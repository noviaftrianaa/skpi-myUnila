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
  FiAward, FiUsers, FiStar, FiTrendingUp, FiFilter, FiRotateCcw, FiX,
} from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import dosenDataService, {
  type JabfungItem, type JabfungStats,
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

export default function JabfungPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const forcedFak = scope.forcedFakultas || "";
  const forcedJur = scope.forcedJurusan || "";
  const forcedProdi = scope.forcedProdi || "";

  const [data, setData] = useState<JabfungItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<JabfungStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tmt_sk_jabfung");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [orgFilters, setOrgFilters] = useState<MahasiswaFilters | null>(null);
  const [filterFak, setFilterFak] = useState(forcedFak);
  const [filterProdi, setFilterProdi] = useState(forcedProdi);
  const [filterJurusan, setFilterJurusan] = useState(forcedJur);
  const [filterJabfung, setFilterJabfung] = useState("");
  const [unitItems, setUnitItems] = useState<string[]>([]);
  const unitFilterStr = unitItems.join(",");
  const [selectedSdm, setSelectedSdm] = useState<string | null>(null);

  useEffect(() => { setFilterFak(forcedFak); }, [forcedFak]);
  useEffect(() => { setFilterProdi(forcedProdi); }, [forcedProdi]);
  useEffect(() => { setFilterJurusan(forcedJur); }, [forcedJur]);

  // URL param init — deep-link from Pimpinan / external (e.g. ?nm_jabfung=Lektor)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const usp = new URLSearchParams(window.location.search);
    const v = usp.get("nm_jabfung") || usp.get("id_jabfung");
    if (v) setFilterJabfung(v);
  }, []);

  useEffect(() => {
    mahasiswaDataService.getFilters({ id_fakultas: filterFak || undefined, id_jurusan: filterJurusan || undefined })
      .then(setOrgFilters).catch(console.error);
  }, [filterFak, filterJurusan]);

  useEffect(() => {
    setLoadingStats(true);
    dosenDataService.getJabfungStats({
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
      id_jabfung: filterJabfung || undefined,
    } as Record<string, string>)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, [filterFak, filterProdi, filterJurusan, unitFilterStr, filterJabfung]);

  useEffect(() => {
    setLoading(true);
    dosenDataService.getJabfungList({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
      id_jabfung: filterJabfung || undefined,
    } as Record<string, any>)
      .then((r: { data: JabfungItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data jabfung"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak, filterProdi, filterJurusan, unitFilterStr, filterJabfung]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => {
    setSortBy(k); setSortOrder(o); setPage(1);
  }, []);

  // Jabfung options derived dari stats.by_jabfung (jenis jabfung yang tercatat)
  const jabfungOptions: DropdownOption[] = (stats?.by_jabfung || [])
    .map((j) => ({ value: j.nm_jabfung, label: j.nm_jabfung }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const activeChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (filterJabfung) {
    activeChips.push({ key: "jab", label: `Jabfung: ${filterJabfung}`, clear: () => { setFilterJabfung(""); setPage(1); } });
  }
  const hasFilter = activeChips.length > 0;

  const EXPORT_HEADERS = {
    nm_sdm: "Nama Dosen",
    nidn: "NIDN",
    nip: "NIP",
    nm_jabfung: "Jabatan Fungsional",
    sk_jabfung: "No SK",
    tmt_sk_jabfung: "TMT SK",
    angka_kredit: "Angka Kredit",
    nm_prodi: "Program Studi",
    nm_fakultas: "Fakultas",
  } as const;

  const dataForExport = useMemo(() => data, [data]);

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") {
      toast("Server-side export belum tersedia untuk Jabfung. Gunakan format lain.");
      return;
    }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    const baseName = `jabfung-${filterFak ? "fak" : "all"}`;
    if (fmtType === "excel") {
      exportToExcel(dataForExport as unknown as Record<string, unknown>[], baseName, "Jabfung", EXPORT_HEADERS);
      toast.success("Excel berhasil di-download");
    } else if (fmtType === "csv-client") {
      exportToCsv(dataForExport as unknown as Record<string, unknown>[], baseName, EXPORT_HEADERS);
      toast.success("CSV berhasil di-download");
    } else if (fmtType === "pdf") {
      exportToPdf(dataForExport as unknown as Record<string, unknown>[], baseName, {
        title: "Riwayat Jabatan Fungsional Dosen Unila",
        headers: EXPORT_HEADERS,
        orientation: "landscape",
      });
      toast.success("PDF berhasil di-download");
    } else if (fmtType === "json") {
      exportToJson(dataForExport, baseName);
      toast.success("JSON berhasil di-download");
    }
  };

  const handleReset = () => {
    setFilterJabfung("");
    setUnitItems([]);
    if (!forcedFak) setFilterFak("");
    if (!forcedJur) setFilterJurusan("");
    if (!forcedProdi) setFilterProdi("");
    setPage(1);
  };

  const columns: Column<JabfungItem>[] = [
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
      key: "nm_jabfung", label: "JABATAN FUNGSIONAL", width: "200px", sortable: true,
      render: (i) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset whitespace-nowrap max-w-[190px] truncate
          ${/Guru Besar|Professor/i.test(i.nm_jabfung) ? "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300"
          : /Lektor Kepala/i.test(i.nm_jabfung) ? "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300"
          : /Lektor/i.test(i.nm_jabfung) ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300"
          : /Asisten/i.test(i.nm_jabfung) ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}
          title={i.nm_jabfung}>
          {i.nm_jabfung}
        </span>
      ),
    },
    {
      key: "nm_prodi", label: "PROGRAM STUDI",
      render: (i) => (
        <div>
          <div className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{i.nm_prodi || "—"}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{i.nm_fakultas || "—"}</div>
        </div>
      ),
    },
    {
      key: "tmt_sk_jabfung", label: "TMT SK", width: "120px", sortable: true,
      render: (i) => <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{fmtDate(i.tmt_sk_jabfung)}</span>,
    },
    {
      key: "angka_kredit", label: "AK", width: "80px", align: "right" as const, sortable: true,
      render: (i) => (
        <span className="inline-flex items-center justify-end font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
          {i.angka_kredit ? Number(i.angka_kredit).toFixed(2) : "—"}
        </span>
      ),
    },
    {
      key: "status_dosen", label: "STATUS", width: "120px", align: "center" as const,
      render: (i) => {
        const s = i.status_dosen || "—";
        const tone =
          s === "Aktif" ? "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300" :
          s === "Pensiun" ? "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300" :
          s === "Non-Aktif" ? "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300" :
          s === "—" ? "bg-gray-100 text-gray-500 ring-gray-200 dark:bg-gray-500/10 dark:text-gray-400" :
          "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300";
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ring-inset ${tone}`}>
            {s}
          </span>
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
      pageTitle="Jabatan Fungsional Dosen"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Jabatan Fungsional Dosen</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Riwayat SK & angka kredit jabatan fungsional dosen Unila</p>
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
          const gb = num(stats.guru_besar);
          const lk = num(stats.lektor_kepala);
          const lk2 = num(stats.lektor);
          const aa = num(stats.asisten);
          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard icon={<FiUsers className="w-6 h-6" />} label="Total Riwayat" value={total} gradient="from-blue-500 to-indigo-600" subtext={`${fmt(num(stats.total_dosen))} dosen`} />
              <StatCard icon={<FiStar className="w-6 h-6" />} label="Guru Besar" value={gb} gradient="from-rose-500 to-pink-600" subtext={`${pct(gb, total)} dari total`} />
              <StatCard icon={<FiAward className="w-6 h-6" />} label="Lektor Kepala" value={lk} gradient="from-violet-500 to-purple-600" subtext={`${pct(lk, total)}`} />
              <StatCard icon={<FiAward className="w-6 h-6" />} label="Lektor" value={lk2} gradient="from-blue-500 to-cyan-600" subtext={`${pct(lk2, total)}`} />
              <StatCard icon={<FiTrendingUp className="w-6 h-6" />} label="Asisten Ahli" value={aa} gradient="from-emerald-500 to-teal-600" subtext={`${pct(aa, total)}`} />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <UnitFilter
                  data={orgFilters}
                  value={unitItems}
                  onChange={(next) => { setUnitItems(next); setPage(1); }}
                  forcedFakultas={forcedFak || undefined}
                  forcedJurusan={forcedJur || undefined}
                  forcedProdi={forcedProdi || undefined}
                />
                <Dropdown
                  label="Jabatan Fungsional"
                  value={filterJabfung}
                  onChange={(v) => { setFilterJabfung(v); setPage(1); }}
                  options={jabfungOptions}
                  placeholder="Semua Jabfung"
                  searchable
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
              searchPlaceholder="Cari nama, NIDN, NIP..."
              defaultRowsPerPage={10}
            />
          </motion.div>
        </div>
      </div>
      <DosenProfileModal idSdm={selectedSdm} onClose={() => setSelectedSdm(null)} />
    </DashboardLayoutWithDynamicMenu>
  );
}
