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
import {
  FiActivity, FiUsers, FiBook, FiStar, FiFilter, FiRotateCcw, FiX,
  FiClock as FiClockIco, FiDatabase, FiMapPin, FiCalendar,
} from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import mahasiswaDataService, {
  type AktivitasItem, type AktivitasStats, type AktivitasFilters, type MahasiswaFilters,
} from "@/lib/services/data-unila/mahasiswaDataService";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { exportToCsv, exportToJson } from "@/lib/utils/exportCsv";
import { exportToPdf } from "@/lib/utils/exportPdf";

const APP_KEY = "data-unila";

const JENIS_COLOR_MAP: Record<string, string> = {
  "KKN": "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300",
  "PKL/Magang": "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300",
  "MBKM": "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300",
  "Penelitian": "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300",
  "Pengabdian Masyarakat": "bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300",
  "Pertukaran Mahasiswa": "bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300",
  "Wirausaha": "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300",
  "Kompetisi": "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300",
  "Lomba": "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300",
  "Organisasi": "bg-pink-50 text-pink-700 ring-pink-200 dark:bg-pink-500/10 dark:text-pink-300",
};
const JENIS_COLOR_DEFAULT = "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700 dark:text-gray-300";

/* ---------- helpers ---------- */
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
function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

/* ---------- StatCard ---------- */
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

/* ---------- Info Strip ---------- */
function _UnusedInfoStrip(_props: { stats: AktivitasStats }) {
  return null;
  /* InfoStrip removed per user request (konsisten Mahasiswa Daftar / Lulusan — fokus raw data) */
}

/* ============================================================ */

export default function AktivitasPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const forcedFak = scope.forcedFakultas || "";
  const forcedProdi = scope.forcedProdi || "";

  const [data, setData] = useState<AktivitasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AktivitasStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("id_smt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const forcedJur = scope.forcedJurusan || "";
  const [orgFilters, setOrgFilters] = useState<MahasiswaFilters | null>(null);
  const [aktFilters, setAktFilters] = useState<AktivitasFilters | null>(null);
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
    mahasiswaDataService.getAktivitasFilters()
      .then(setAktFilters).catch(console.error);
  }, []);

  useEffect(() => {
    setLoadingStats(true);
    mahasiswaDataService.getAktivitasStats({
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      id_jns_akt_mhs: filterJenis || undefined,
      tahun: filterTahun || undefined,
      unit_filter: unitFilterStr || undefined,
    } as Record<string, string>)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, [filterFak, filterProdi, filterJurusan, filterJenis, filterTahun, unitFilterStr]);

  useEffect(() => {
    setLoading(true);
    mahasiswaDataService.getAktivitas({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      id_jns_akt_mhs: filterJenis || undefined,
      tahun: filterTahun || undefined,
      unit_filter: unitFilterStr || undefined,
    })
      .then((r) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data aktivitas"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak, filterProdi, filterJurusan, filterJenis, filterTahun, unitFilterStr]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => {
    setSortBy(k); setSortOrder(o); setPage(1);
  }, []);

  const fakOptions: DropdownOption[] = (orgFilters?.fakultas || []).map((f) => ({ value: f.id_fakultas, label: f.nm_fakultas }));
  const prodiOptions: DropdownOption[] = (orgFilters?.prodi || []).map((p) => ({ value: p.id_sms, label: p.nm_prodi, sublabel: p.jenjang }));
  const jenisOptions: DropdownOption[] = (aktFilters?.jenis || []).map((j) => ({ value: String(j.id_jns_akt_mhs), label: j.nama_jenis }));
  const tahunOptions: DropdownOption[] = (aktFilters?.tahun || []).map((t) => ({ value: String(t.tahun), label: String(t.tahun) }));

  const activeChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (filterTahun) activeChips.push({ key: "thn", label: `Tahun ${filterTahun}`, clear: () => { setFilterTahun(""); setPage(1); } });
  if (filterJenis) {
    const j = jenisOptions.find((o) => o.value === filterJenis);
    if (j) activeChips.push({ key: "jns", label: j.label, clear: () => { setFilterJenis(""); setPage(1); } });
  }
  if (filterFak && !forcedFak) {
    const f = fakOptions.find((o) => o.value === filterFak);
    if (f) activeChips.push({ key: "fak", label: f.label, clear: () => { setFilterFak(""); setFilterProdi(""); setPage(1); } });
  }
  if (filterProdi && !forcedProdi) {
    const p = prodiOptions.find((o) => o.value === filterProdi);
    if (p) activeChips.push({ key: "prd", label: p.label, clear: () => { setFilterProdi(""); setPage(1); } });
  }
  const hasFilter = activeChips.length > 0;
  const isFiltered = hasFilter;

  const EXPORT_HEADERS = {
    judul: "Judul Aktivitas",
    jenis_aktivitas: "Jenis",
    nm_fakultas: "Fakultas",
    nm_prodi: "Program Studi",
    nm_smt: "Semester",
    tahun: "Tahun",
    daftar_anggota: "Daftar Anggota",
    lokasi_kegiatan: "Lokasi",
    tgl_selesai: "Tgl Selesai",
  } as const;

  const buildSubtitle = () => {
    const parts: string[] = [];
    if (filterTahun) parts.push(`Tahun: ${filterTahun}`);
    if (filterJenis) parts.push(`Jenis: ${jenisOptions.find((o) => o.value === filterJenis)?.label}`);
    if (filterFak) parts.push(`Fakultas: ${fakOptions.find((o) => o.value === filterFak)?.label}`);
    if (filterProdi) parts.push(`Prodi: ${prodiOptions.find((o) => o.value === filterProdi)?.label}`);
    return parts.join("  •  ") || "Semua aktivitas mahasiswa";
  };

  const dataForExport = useMemo(() => data, [data]);

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") {
      toast("Server-side export belum tersedia. Gunakan CSV biasa atau filter dulu.");
      return;
    }
    if (!data.length) { toast.error("Tidak ada data untuk diexport"); return; }
    const baseName = `aktivitas-mahasiswa-${filterTahun || "all"}`;
    if (fmtType === "excel") {
      exportToExcel(dataForExport as unknown as Record<string, unknown>[], baseName, "Aktivitas", EXPORT_HEADERS);
      toast.success("Excel berhasil di-download");
    } else if (fmtType === "csv-client") {
      exportToCsv(dataForExport as unknown as Record<string, unknown>[], baseName, EXPORT_HEADERS);
      toast.success("CSV berhasil di-download");
    } else if (fmtType === "pdf") {
      exportToPdf(dataForExport as unknown as Record<string, unknown>[], baseName, {
        title: "Data Aktivitas Mahasiswa Universitas Lampung",
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
    setFilterTahun("");
    setFilterJenis("");
    setUnitItems([]);
    if (!forcedFak) setFilterFak("");
    if (!forcedJur) setFilterJurusan("");
    if (!forcedProdi) setFilterProdi("");
    setPage(1);
  };

  const columns: Column<AktivitasItem>[] = [
    {
      key: "judul", label: "JUDUL AKTIVITAS", sortable: true,
      render: (i) => (
        <div className="max-w-[360px]">
          <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{i.judul}</div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
            {i.nm_fakultas || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "jenis_aktivitas", label: "JENIS", width: "150px", sortable: true,
      render: (i) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap ${JENIS_COLOR_MAP[i.jenis_aktivitas] || JENIS_COLOR_DEFAULT}`}>
          {i.jenis_aktivitas}
        </span>
      ),
    },
    {
      key: "nm_prodi", label: "PRODI", sortable: true,
      render: (i) => <span className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{i.nm_prodi || "—"}</span>,
    },
    {
      key: "id_smt", label: "SEMESTER", width: "140px", align: "center" as const, sortable: true,
      render: (i) => (
        <span className="text-xs text-gray-700 dark:text-gray-300">{i.nm_smt || i.id_smt || "—"}</span>
      ),
    },
    {
      key: "daftar_anggota", label: "DAFTAR ANGGOTA", width: "300px",
      render: (i) => {
        if (!i.daftar_anggota) return <span className="text-xs text-gray-400">—</span>;
        const items = i.daftar_anggota.split(/;\s*/).filter(Boolean);
        const tone = (peran: string) =>
          /Ketua/i.test(peran) ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300" :
          /Anggota/i.test(peran) ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300" :
          /Personal/i.test(peran) ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300" :
          "bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300";
        return (
          <div className="max-w-[300px]">
            <details className="group">
              <summary className="cursor-pointer list-none">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{items.length} anggota</span>
                  <span className="text-[10px] text-gray-400 group-open:hidden">↓ klik untuk detail</span>
                  <span className="text-[10px] text-gray-400 hidden group-open:inline">↑ tutup</span>
                </div>
                {/* Preview ringkas: 2 nama pertama */}
                <div className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2 group-open:hidden">
                  {items.slice(0, 2).join("; ")}{items.length > 2 ? ` +${items.length - 2} lainnya` : ""}
                </div>
              </summary>
              {/* Full list dengan badge peran */}
              <ul className="mt-2 space-y-1 max-h-56 overflow-y-auto pr-1">
                {items.map((item, idx) => {
                  const match = item.match(/^(.+?)\s*\(([^)]+)\)\s*-\s*(.+)$/);
                  if (!match) return <li key={idx} className="text-[11px] text-gray-600 dark:text-gray-400">{item}</li>;
                  const [, nama, nipd, peran] = match;
                  return (
                    <li key={idx} className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="truncate text-gray-700 dark:text-gray-300" title={nama}>{nama}</span>
                      <span className="font-mono text-[10px] text-gray-500 shrink-0">{nipd}</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold ring-1 ring-inset shrink-0 ${tone(peran)}`}>{peran}</span>
                    </li>
                  );
                })}
              </ul>
            </details>
          </div>
        );
      },
    },
    {
      key: "lokasi_kegiatan", label: "LOKASI", width: "180px",
      render: (i) => (
        <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
          {i.lokasi_kegiatan && <FiMapPin className="w-3 h-3 shrink-0 text-gray-400" />}
          {i.lokasi_kegiatan || "—"}
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
      pageTitle="Aktivitas Mahasiswa"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Aktivitas Mahasiswa</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              KKN, PKL/Magang, MBKM, kompetisi, organisasi, dan kegiatan mahasiswa lainnya
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
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stats && (() => {
          const total = num(stats.total);
          return (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <StatCard
                  icon={<FiActivity className="w-6 h-6" />}
                  label="Total Aktivitas"
                  value={total}
                  gradient="from-blue-500 to-indigo-600"
                  subtext={`${fmt(num(stats.total_prodi))} prodi`}
                />
                <StatCard
                  icon={<FiBook className="w-6 h-6" />}
                  label="Akademik"
                  value={num(stats.akademik)}
                  gradient="from-emerald-500 to-teal-600"
                  subtext={`${pct(num(stats.akademik), total)}`}
                />
                <StatCard
                  icon={<FiStar className="w-6 h-6" />}
                  label="Non-Akademik"
                  value={num(stats.non_akademik)}
                  gradient="from-amber-500 to-orange-500"
                  subtext={`${pct(num(stats.non_akademik), total)}`}
                />
                <StatCard
                  icon={<FiUsers className="w-6 h-6" />}
                  label="MBKM"
                  value={num(stats.mbkm)}
                  gradient="from-violet-500 to-purple-600"
                  subtext={`KKN: ${fmt(num(stats.kkn))} · PKL: ${fmt(num(stats.pkl))}`}
                />
                <StatCard
                  icon={<FiActivity className="w-6 h-6" />}
                  label="Kompetisi"
                  value={num(stats.kompetisi)}
                  gradient="from-pink-500 to-rose-600"
                  subtext={`Org: ${fmt(num(stats.organisasi))} · ${fmt(num(stats.total_semester))} smt`}
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

        {/* Data Table + Filter */}
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
                  {hasFilter && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <FiRotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                  )}
                  <ExportMenu onExport={handleExport} disabled={{ "csv-server": true }} />
                </div>
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
                <Dropdown
                  label="Jenis Aktivitas"
                  value={filterJenis}
                  onChange={(v) => { setFilterJenis(v); setPage(1); }}
                  options={jenisOptions}
                  placeholder="Semua Jenis"
                  searchable
                />
                <Dropdown
                  label="Tahun"
                  value={filterTahun}
                  onChange={(v) => { setFilterTahun(v); setPage(1); }}
                  options={tahunOptions}
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
              searchPlaceholder="Cari judul aktivitas, lokasi..."
              defaultRowsPerPage={10}
            />
          </motion.div>
        </div>
      </div>

      {/* silence unused */}
      <span className="hidden"><FiCalendar /></span>
    </DashboardLayoutWithDynamicMenu>
  );
}
