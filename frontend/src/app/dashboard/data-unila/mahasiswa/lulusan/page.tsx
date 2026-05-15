"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import Dropdown, { type DropdownOption } from "@/shared/components/data-unila/Dropdown";
import UnitFilter from "@/shared/components/data-unila/UnitFilter";
import ExportMenu, { type ExportFormat } from "@/shared/components/data-unila/ExportMenu";
import MahasiswaProfileModal from "@/shared/components/data-unila/MahasiswaProfileModal";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import { MdSchool } from "react-icons/md";
import {
  FiAward, FiCheckCircle, FiClock, FiUsers, FiFilter, FiRotateCcw, FiX,
  FiClock as FiClockIco, FiDatabase, FiCalendar, FiFileText,
} from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import mahasiswaDataService, {
  type LulusanItem, type LulusanStats, type MahasiswaFilters,
} from "@/lib/services/data-unila/mahasiswaDataService";
import toast from "react-hot-toast";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { exportToCsv, exportToJson } from "@/lib/utils/exportCsv";
import { exportToPdf } from "@/lib/utils/exportPdf";
import { StatCardGridSkeleton } from "@/shared/components/data-unila/PageSkeleton";

const APP_KEY = "data-unila";

/* ---------- Helpers ---------- */
function num(v?: string | number | null): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isNaN(n) ? 0 : n;
}
function fmt(n: number): string {
  return n.toLocaleString("id-ID");
}
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
function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}
function fmtLamaStudi(bulan?: number | null): string {
  if (bulan == null || bulan <= 0) return "—";
  const t = Math.floor(bulan / 12);
  const b = bulan % 12;
  if (t === 0) return `${b} bulan`;
  if (b === 0) return `${t} tahun`;
  return `${t} thn ${b} bln`;
}

/* ---------- Stat Card ---------- */
function StatCard({
  icon, label, value, gradient, subtext,
}: {
  icon: React.ReactNode; label: string; value: string | number; gradient: string; subtext?: string;
}) {
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

/* ============================================================ */

export default function LulusanPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();

  const [data, setData] = useState<LulusanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LulusanStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tgl_lulus");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [filters, setFilters] = useState<MahasiswaFilters | null>(null);
  const forcedFak = scope.forcedFakultas || "";
  const forcedJur = scope.forcedJurusan || "";
  const forcedProdi = scope.forcedProdi || "";
  const [filterFak, setFilterFak] = useState(forcedFak);
  const [filterProdi, setFilterProdi] = useState(forcedProdi);
  const [filterJurusan, setFilterJurusan] = useState(forcedJur);
  const [filterAngkatan, setFilterAngkatan] = useState("");
  // Default tahun lulus = current year - 1 (asumsi tahun ini belum selesai)
  const DEFAULT_TAHUN_LULUS = String(new Date().getFullYear() - 1);
  const [filterTahunLulus, setFilterTahunLulus] = useState(DEFAULT_TAHUN_LULUS);
  const [unitItems, setUnitItems] = useState<string[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { setLimit(10); setFilterFak(forcedFak); }, [forcedFak]);
  useEffect(() => { setFilterProdi(forcedProdi); }, [forcedProdi]);
  useEffect(() => { setFilterJurusan(forcedJur); }, [forcedJur]);

  useEffect(() => {
    mahasiswaDataService
      .getFilters({ id_fakultas: filterFak || undefined, id_jurusan: filterJurusan || undefined })
      .then(setFilters)
      .catch(console.error);
  }, [filterFak, filterJurusan]);

  const unitFilterStr = unitItems.join(",");
  const handleUnitItemsChange = (next: string[]) => {
    setUnitItems(next);
    setPage(1);
  };

  useEffect(() => {
    setLoadingStats(true);
    mahasiswaDataService
      .getLulusanStats({
        id_fakultas: filterFak || undefined,
        id_prodi: filterProdi || undefined,
        id_jurusan: filterJurusan || undefined,
        angkatan: filterAngkatan || undefined,
        tahun_lulus: filterTahunLulus || undefined,
        unit_filter: unitFilterStr || undefined,
      })
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, [filterFak, filterProdi, filterJurusan, filterAngkatan, filterTahunLulus, unitFilterStr]);

  useEffect(() => {
    setLoading(true);
    mahasiswaDataService
      .getLulusan({
        page, limit,
        search: search || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        id_fakultas: filterFak || undefined,
        id_prodi: filterProdi || undefined,
        id_jurusan: filterJurusan || undefined,
        angkatan: filterAngkatan || undefined,
        tahun_lulus: filterTahunLulus || undefined,
        unit_filter: unitFilterStr || undefined,
      })
      .then((r) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data lulusan"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak, filterProdi, filterJurusan, filterAngkatan, filterTahunLulus, unitFilterStr]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => {
    setSortBy(k); setSortOrder(o); setPage(1);
  }, []);

  const fakOptions: DropdownOption[] = (filters?.fakultas || []).map((f) => ({ value: f.id_fakultas, label: f.nm_fakultas }));
  const prodiOptions: DropdownOption[] = (filters?.prodi || []).map((p) => ({ value: p.id_sms, label: p.nm_prodi, sublabel: p.jenjang }));
  const angkatanOptions: DropdownOption[] = (filters?.angkatan || []).map((a) => ({ value: a.angkatan, label: a.angkatan }));
  const tahunLulusOptions: DropdownOption[] = (filters?.tahun_lulus || []).map((t) => ({ value: String(t.tahun_lulus), label: String(t.tahun_lulus) }));

  const activeChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (filterTahunLulus) activeChips.push({ key: "thn", label: `Lulus ${filterTahunLulus}`, clear: () => { setFilterTahunLulus(""); setPage(1); } });
  if (filterAngkatan) activeChips.push({ key: "ang", label: `Angkatan ${filterAngkatan}`, clear: () => { setFilterAngkatan(""); setPage(1); } });
  if (filterFak && !forcedFak) {
    const f = fakOptions.find((o) => o.value === filterFak);
    if (f) activeChips.push({ key: "fak", label: f.label, clear: () => { setFilterFak(""); setFilterProdi(""); setPage(1); } });
  }
  if (filterProdi && !forcedProdi) {
    const p = prodiOptions.find((o) => o.value === filterProdi);
    if (p) activeChips.push({ key: "prd", label: p.label, clear: () => { setFilterProdi(""); setPage(1); } });
  }
  const hasFilter = activeChips.length > 0;

  const isFiltered = Boolean(filterTahunLulus || filterAngkatan || (filterFak && !forcedFak) || (filterProdi && !forcedProdi));

  const EXPORT_HEADERS = {
    nipd: "NIM",
    nm_pd: "Nama Lulusan",
    nm_prodi: "Program Studi",
    nm_fakultas: "Fakultas",
    angkatan: "Angkatan",
    jalur_masuk: "Jalur Masuk",
    tgl_masuk: "Tgl Masuk",
    tgl_lulus: "Tgl Lulus",
    lama_studi: "Masa Studi",
    sk_yudisium: "SK Yudisium",
    tgl_sk_yudisium: "Tgl SK Yudisium",
    ipk: "IPK",
  } as const;

  const buildSubtitle = () => {
    const parts: string[] = [];
    if (filterAngkatan) parts.push(`Angkatan: ${filterAngkatan}`);
    if (filterFak) {
      const f = fakOptions.find((x) => x.value === filterFak);
      if (f) parts.push(`Fakultas: ${f.label}`);
    }
    if (filterProdi) {
      const p = prodiOptions.find((x) => x.value === filterProdi);
      if (p) parts.push(`Prodi: ${p.label}`);
    }
    return parts.join("  •  ") || "Semua data lulusan";
  };

  const dataForExport = useMemo(
    () => data.map((d) => ({
      ...d,
      lama_studi: fmtLamaStudi(d.lama_studi_bulan),
    })),
    [data]
  );

  const handleExport = (fmtType: ExportFormat) => {
    if (!data.length) { toast.error("Tidak ada data untuk diexport"); return; }
    const baseName = `lulusan-${filterFak ? "fak" : "all"}-${filterAngkatan || "all"}`;
    if (fmtType === "csv-server") {
      toast("Export CSV server-side belum tersedia untuk Lulusan");
      return;
    }
    if (fmtType === "excel") {
      exportToExcel(dataForExport as unknown as Record<string, unknown>[], baseName, "Lulusan", EXPORT_HEADERS);
      toast.success("Excel berhasil di-download");
    } else if (fmtType === "csv-client") {
      exportToCsv(dataForExport as unknown as Record<string, unknown>[], baseName, EXPORT_HEADERS);
      toast.success("CSV berhasil di-download");
    } else if (fmtType === "pdf") {
      exportToPdf(dataForExport as unknown as Record<string, unknown>[], baseName, {
        title: "Data Lulusan Universitas Lampung",
        subtitle: buildSubtitle(),
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
    setFilterTahunLulus(DEFAULT_TAHUN_LULUS); // reset ke default tahun ini-1
    setFilterAngkatan("");
    setUnitItems([]);
    if (!forcedFak) setFilterFak("");
    if (!forcedJur) setFilterJurusan("");
    if (!forcedProdi) setFilterProdi("");
    setPage(1);
  };

  const columns: Column<LulusanItem>[] = [
    {
      key: "nipd", label: "NIM", width: "130px", sortable: true,
      render: (i) => <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{i.nipd}</span>,
    },
    {
      key: "nm_pd", label: "NAMA LULUSAN", sortable: true,
      render: (i) => (
        <button
          type="button"
          onClick={() => setSelectedId(i.id_pd)}
          className="text-left group"
        >
          <div className="font-medium text-blue-700 dark:text-blue-400 underline decoration-blue-300 decoration-dotted underline-offset-2 group-hover:decoration-solid group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">
            {i.nm_pd}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {i.jk === "L" ? "Laki-laki" : i.jk === "P" ? "Perempuan" : i.jk}
          </div>
        </button>
      ),
    },
    {
      key: "nm_prodi", label: "PROGRAM STUDI", sortable: true,
      render: (i) => (
        <div>
          <div className="text-sm text-gray-800 dark:text-gray-200">{i.nm_prodi}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{i.nm_fakultas}</div>
        </div>
      ),
    },
    {
      key: "angkatan", label: "ANGKATAN", width: "90px", align: "center" as const, sortable: true,
      render: (i) => <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{i.angkatan}</span>,
    },
    {
      key: "tgl_lulus", label: "TGL LULUS", width: "120px", sortable: true,
      render: (i) => (
        <span className="text-xs text-gray-700 dark:text-gray-300 font-mono">{fmtDate(i.tgl_lulus)}</span>
      ),
    },
    {
      key: "lama_studi_bulan", label: "MASA STUDI", width: "130px", sortable: true, align: "center" as const,
      render: (i) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap
          ${i.tepat_waktu
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
            : "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300"}`}
          title={i.tepat_waktu ? "Tepat waktu" : "Melebihi durasi normatif"}>
          {fmtLamaStudi(i.lama_studi_bulan)}
        </span>
      ),
    },
    {
      key: "sk_yudisium", label: "SK YUDISIUM", width: "160px",
      render: (i) => i.sk_yudisium ? (
        <div className="min-w-0">
          <div className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate max-w-[150px]" title={i.sk_yudisium}>
            {i.sk_yudisium}
          </div>
          {i.tgl_sk_yudisium && (
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              {fmtDate(i.tgl_sk_yudisium)}
            </div>
          )}
        </div>
      ) : <span className="text-xs text-gray-400">—</span>,
    },
    {
      key: "ipk", label: "IPK", width: "70px", align: "center" as const, sortable: true,
      render: (i) => {
        const v = i.ipk ? parseFloat(String(i.ipk)) : null;
        if (v == null || Number.isNaN(v)) return <span className="text-xs text-gray-400">—</span>;
        const tone =
          v >= 3.5 ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
          : v >= 3.0 ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300"
          : v >= 2.5 ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300"
          : "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300";
        return (
          <span className={`inline-flex items-center justify-center min-w-[42px] px-1.5 py-0.5 rounded-md text-xs font-bold font-mono ring-1 ring-inset ${tone}`}>
            {v.toFixed(2)}
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
      pageTitle="Data Lulusan"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Data Lulusan</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Alumni Universitas Lampung — masa studi, SK yudisium, dan IPK
            </p>
          </div>
          {isFiltered && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/30">
              <FiFilter className="w-3.5 h-3.5" />
              Statistik sesuai filter aktif
            </span>
          )}
        </div>

        {/* Stat Cards */}
        {loadingStats ? (
          <StatCardGridSkeleton count={5} />
        ) : stats && (() => {
          const total = num(stats.total);
          const tepat = num(stats.tepat_waktu);
          const cum = num(stats.cumlaude);
          const avgIpk = stats.avg_ipk ? parseFloat(String(stats.avg_ipk)) : null;
          const avgLama = stats.avg_lama_studi_bulan ? parseFloat(String(stats.avg_lama_studi_bulan)) : null;
          return (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <StatCard
                  icon={<FiUsers className="w-6 h-6" />}
                  label="Total Lulusan"
                  value={total}
                  gradient="from-green-500 to-emerald-600"
                  subtext={`${fmt(num(stats.total_prodi))} prodi`}
                />
                <StatCard
                  icon={<FiAward className="w-6 h-6" />}
                  label="Cumlaude"
                  value={cum}
                  gradient="from-yellow-400 to-amber-500"
                  subtext={`${pct(cum, total)} dari total`}
                />
                <StatCard
                  icon={<FiCheckCircle className="w-6 h-6" />}
                  label="Tepat Waktu"
                  value={tepat}
                  gradient="from-blue-500 to-indigo-600"
                  subtext={`${pct(tepat, total)} dari total`}
                />
                <StatCard
                  icon={<FiCalendar className="w-6 h-6" />}
                  label="Rata2 Studi"
                  value={fmtLamaStudi(avgLama ? Math.round(avgLama) : null)}
                  gradient="from-violet-500 to-purple-600"
                />
                <StatCard
                  icon={<FiAward className="w-6 h-6" />}
                  label="IPK Rata-rata"
                  value={avgIpk && avgIpk > 0 ? avgIpk.toFixed(2) : "—"}
                  gradient="from-pink-500 to-rose-600"
                  subtext={`${fmt(num(stats.total_angkatan))} angkatan`}
                />
              </div>
            </div>
          );
        })()}

        {/* Scope + Meta */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-0">
            <ScopeBadge />
          </div>
          {stats?.last_sync && (
            <div className="inline-flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 text-[11px] sm:text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <FiDatabase className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold">Sumber:</span>
                <span>{stats.data_source || "PDDikti"}</span>
              </span>
              <span className="h-3 w-px bg-slate-300 dark:bg-gray-600" />
              <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <FiClockIco className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold">Sync terakhir:</span>
                <span className="font-mono">{formatDateTime(stats.last_sync)}</span>
              </span>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden border border-gray-200/50 dark:border-gray-800">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Filter bar */}
            <div className="p-4 sm:p-5 space-y-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <FiFilter className="w-3.5 h-3.5" />
                  Filter Data
                </span>
                <div className="flex items-center gap-2">
                  <ExportMenu
                    onExport={handleExport}
                    disabled={{ "csv-server": true }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <UnitFilter
                  data={filters}
                  value={unitItems}
                  onChange={handleUnitItemsChange}
                  forcedFakultas={forcedFak || undefined}
                  forcedJurusan={forcedJur || undefined}
                  forcedProdi={forcedProdi || undefined}
                />
                <Dropdown
                  label="Angkatan"
                  value={filterAngkatan}
                  onChange={(v) => { setFilterAngkatan(v); setPage(1); }}
                  options={angkatanOptions}
                  placeholder="Semua Angkatan"
                />
                <Dropdown
                  label="Tahun Lulus"
                  value={filterTahunLulus}
                  onChange={(v) => { setFilterTahunLulus(v); setPage(1); }}
                  options={tahunLulusOptions}
                  placeholder="Semua Tahun"
                />
              </div>

              {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktif</span>
                  {activeChips.map((c) => (
                    <span key={c.key} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200 rounded-full dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/30">
                      {c.label}
                      <button type="button" onClick={c.clear} className="ml-0.5 w-4 h-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-400/20 flex items-center justify-center" aria-label={`Hapus filter ${c.label}`}>
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <DataTable
              columns={columns}
              data={data}
              loading={loading}
              serverSide
              totalRecords={total}
              onPageChange={setPage}
              onRowsPerPageChange={(n) => { setLimit(n); setPage(1); }}
              onSearchChange={(q) => { setSearch(q); setPage(1); }}
              onSortChange={handleSort}
              searchPlaceholder="Cari nama, NIM, SK Yudisium..."
              defaultRowsPerPage={10}
            />
          </motion.div>
        </div>
      </div>

      {/* Profile modal — reuse comprehensive modal dari mahasiswa */}
      <MahasiswaProfileModal idPd={selectedId} onClose={() => setSelectedId(null)} />

      {/* Silence unused imports */}
      <span className="hidden">
        <FiClock />
        <FiFileText />
      </span>
    </DashboardLayoutWithDynamicMenu>
  );
}
