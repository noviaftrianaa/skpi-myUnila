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
  FiUsers, FiCheckCircle, FiCreditCard, FiAward, FiBriefcase, FiFilter, FiRotateCcw, FiX,
  FiClock as FiClockIco, FiDatabase,
} from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../config/menuConfig";
import dosenDataService, {
  type DosenItem, type DosenStats,
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
function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}

function StatCard({
  icon, label, value, gradient, subtext,
}: { icon: React.ReactNode; label: string; value: string | number; gradient: string; subtext?: string }) {
  const display = typeof value === "number" ? fmt(value) : (/^[\d.,\s/-]+$/.test(value) ? value : fmt(num(value)));
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

function InfoStrip({ stats }: { stats: DosenStats }) {
  const l = num(stats.gender_l);
  const p = num(stats.gender_p);
  const totalGender = l + p;
  const byJabfung = (stats.by_jabfung || []).map((j) => ({ name: j.nm_jabfung, value: num(j.jumlah) }));
  const top = byJabfung.slice(0, 6);
  const sumTop = top.reduce((s, j) => s + j.value, 0) || 1;
  const jColors = ["bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-blue-500", "bg-violet-500", "bg-rose-500"];
  const byPendidikan = (stats.by_pendidikan || []).map((p) => ({ name: p.jenjang || "Tidak Tercatat", value: num(p.jumlah) }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rasio Gender</h4>
          <span className="text-[10px] text-gray-400">Total: {fmt(totalGender)}</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <div className="bg-blue-500" style={{ width: totalGender ? `${(l / totalGender) * 100}%` : 0 }} />
          <div className="bg-pink-500" style={{ width: totalGender ? `${(p / totalGender) * 100}%` : 0 }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-gray-700 dark:text-gray-300 font-medium">{fmt(l)} L</span><span className="text-gray-400">({pct(l, totalGender)})</span></span>
          <span className="inline-flex items-center gap-1.5"><span className="text-gray-400">({pct(p, totalGender)})</span><span className="text-gray-700 dark:text-gray-300 font-medium">{fmt(p)} P</span><span className="w-2 h-2 rounded-full bg-pink-500" /></span>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Distribusi Jabfung</h4>
          <span className="text-[10px] text-gray-400">{byJabfung.length} jenis</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          {top.map((j, idx) => (
            <div key={j.name} className={jColors[idx % jColors.length]} style={{ width: `${(j.value / sumTop) * 100}%` }} title={`${j.name}: ${fmt(j.value)}`} />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1 text-[11px]">
          {top.map((j, idx) => (
            <span key={j.name} className="inline-flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${jColors[idx % jColors.length]}`} />
              <span className="text-gray-700 dark:text-gray-300 truncate max-w-[100px]" title={j.name}>{j.name}</span>
              <span className="text-gray-400 tabular-nums">{fmt(j.value)}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 shadow-md relative overflow-hidden">
        <div className="absolute -top-8 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <h4 className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Pendidikan Terakhir</h4>
          <div className="mt-2 space-y-1.5">
            {byPendidikan.slice(0, 4).map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <span className="text-white/90 font-medium truncate">{p.name}</span>
                <span className="text-white tabular-nums font-bold">{fmt(p.value)}</span>
              </div>
            ))}
            {byPendidikan.length === 0 && (
              <p className="text-white/70 text-xs italic">Belum ada data pendidikan</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DosenDataPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const forcedFak = scope.forcedFakultas || "";
  const forcedJur = scope.forcedJurusan || "";
  const forcedProdi = scope.forcedProdi || "";

  const [data, setData] = useState<DosenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DosenStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("nm_sdm");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [orgFilters, setOrgFilters] = useState<MahasiswaFilters | null>(null);
  const [filterFak, setFilterFak] = useState(forcedFak);
  const [filterProdi, setFilterProdi] = useState(forcedProdi);
  const [filterJurusan, setFilterJurusan] = useState(forcedJur);
  const [filterStatus, setFilterStatus] = useState("aktif");
  const [unitItems, setUnitItems] = useState<string[]>([]);
  const unitFilterStr = unitItems.join(",");

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { setFilterFak(forcedFak); }, [forcedFak]);
  useEffect(() => { setFilterProdi(forcedProdi); }, [forcedProdi]);
  useEffect(() => { setFilterJurusan(forcedJur); }, [forcedJur]);

  // URL param init — deep-link from Pimpinan / external (e.g. ?status=tidak_aktif)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const usp = new URLSearchParams(window.location.search);
    const v = usp.get("status");
    if (v) setFilterStatus(v);
  }, []);

  useEffect(() => {
    mahasiswaDataService.getFilters({ id_fakultas: filterFak || undefined, id_jurusan: filterJurusan || undefined })
      .then(setOrgFilters).catch(console.error);
  }, [filterFak, filterJurusan]);

  useEffect(() => {
    setLoadingStats(true);
    dosenDataService.getStats({
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
      status: filterStatus || undefined,
    } as Record<string, string>)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, [filterFak, filterProdi, filterJurusan, unitFilterStr, filterStatus]);

  useEffect(() => {
    setLoading(true);
    dosenDataService.getList({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      status: filterStatus || undefined,
      unit_filter: unitFilterStr || undefined,
    } as Record<string, any>)
      .then((r: { data: DosenItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data dosen"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak, filterProdi, filterJurusan, filterStatus, unitFilterStr]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => {
    setSortBy(k); setSortOrder(o); setPage(1);
  }, []);

  const fakOptions: DropdownOption[] = (orgFilters?.fakultas || []).map((f) => ({ value: f.id_fakultas, label: f.nm_fakultas }));
  const prodiOptions: DropdownOption[] = (orgFilters?.prodi || []).map((p) => ({ value: p.id_sms, label: p.nm_prodi, sublabel: p.jenjang }));
  const statusOptions: DropdownOption[] = [
    { value: "aktif", label: "Aktif" },
    { value: "tidak_aktif", label: "Tidak Aktif" },
  ];

  const activeChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (filterFak && !forcedFak) {
    const f = fakOptions.find((o) => o.value === filterFak);
    if (f) activeChips.push({ key: "fak", label: f.label, clear: () => { setFilterFak(""); setFilterProdi(""); setPage(1); } });
  }
  if (filterProdi && !forcedProdi) {
    const p = prodiOptions.find((o) => o.value === filterProdi);
    if (p) activeChips.push({ key: "prd", label: p.label, clear: () => { setFilterProdi(""); setPage(1); } });
  }
  if (filterStatus && filterStatus !== "aktif") {
    activeChips.push({ key: "stat", label: filterStatus, clear: () => { setFilterStatus("aktif"); setPage(1); } });
  }
  const hasFilter = activeChips.length > 0;
  const isFiltered = hasFilter;

  const EXPORT_HEADERS = {
    nidn: "NIDN",
    nip: "NIP",
    nm_sdm: "Nama",
    jk: "Jenis Kelamin",
    jenis_sdm: "Jenis SDM",
    nm_prodi: "Program Studi",
    nm_fakultas: "Fakultas",
    jabatan_fungsional: "Jabatan Fungsional",
    status: "Status",
  } as const;

  const buildSubtitle = () => {
    const parts: string[] = [];
    if (filterStatus) parts.push(`Status: ${filterStatus}`);
    if (filterFak) parts.push(`Fakultas: ${fakOptions.find((o) => o.value === filterFak)?.label}`);
    if (filterProdi) parts.push(`Prodi: ${prodiOptions.find((o) => o.value === filterProdi)?.label}`);
    return parts.join("  •  ") || "Semua dosen";
  };

  const dataForExport = useMemo(() => data, [data]);

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") {
      const url = dosenDataService.getExportUrl({
        search: search || undefined,
        id_fakultas: filterFak || undefined,
        id_prodi: filterProdi || undefined,
        status: filterStatus || undefined,
      });
      window.open(url, "_blank");
      return;
    }
    if (!data.length) { toast.error("Tidak ada data untuk diexport"); return; }
    const baseName = `dosen-${filterStatus || "semua"}`;
    if (fmtType === "excel") {
      exportToExcel(dataForExport as unknown as Record<string, unknown>[], baseName, "Dosen", EXPORT_HEADERS);
      toast.success("Excel berhasil di-download");
    } else if (fmtType === "csv-client") {
      exportToCsv(dataForExport as unknown as Record<string, unknown>[], baseName, EXPORT_HEADERS);
      toast.success("CSV berhasil di-download");
    } else if (fmtType === "pdf") {
      exportToPdf(dataForExport as unknown as Record<string, unknown>[], baseName, {
        title: "Data Dosen Universitas Lampung",
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
    setFilterStatus("aktif");
    setUnitItems([]);
    if (!forcedFak) setFilterFak("");
    if (!forcedJur) setFilterJurusan("");
    if (!forcedProdi) setFilterProdi("");
    setPage(1);
  };

  const columns: Column<DosenItem>[] = [
    {
      key: "nidn", label: "NIDN / NIP", width: "150px", sortable: true,
      render: (i) => (
        <div className="space-y-0.5">
          <div className="text-xs font-mono text-gray-900 dark:text-white">{i.nidn || "—"}</div>
          <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{i.nip || "—"}</div>
        </div>
      ),
    },
    {
      key: "nm_sdm", label: "NAMA DOSEN", sortable: true,
      render: (i) => (
        <button type="button" onClick={() => setSelectedId(i.id_sdm)} className="text-left group">
          <div className="font-medium text-blue-700 dark:text-blue-400 underline decoration-blue-300 decoration-dotted underline-offset-2 group-hover:decoration-solid group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">
            {i.nm_sdm}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {i.jk === "L" ? "Laki-laki" : i.jk === "P" ? "Perempuan" : i.jk}
            {i.jenis_sdm && <span> · {i.jenis_sdm}</span>}
          </div>
        </button>
      ),
    },
    {
      key: "nm_prodi", label: "PROGRAM STUDI", sortable: true,
      render: (i) => (
        <div>
          <div className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{i.nm_prodi || "—"}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{i.nm_fakultas || "—"}</div>
        </div>
      ),
    },
    {
      key: "jabatan_fungsional", label: "JABATAN FUNGSIONAL", width: "180px", sortable: true,
      render: (i) => i.jabatan_fungsional ? (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset whitespace-nowrap max-w-[170px] truncate
          ${/Guru Besar|Professor/i.test(i.jabatan_fungsional) ? "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300"
          : /Lektor Kepala/i.test(i.jabatan_fungsional) ? "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300"
          : /Lektor/i.test(i.jabatan_fungsional) ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300"
          : /Asisten/i.test(i.jabatan_fungsional) ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}
          title={i.jabatan_fungsional}>
          {i.jabatan_fungsional}
        </span>
      ) : <span className="text-xs text-gray-400">—</span>,
    },
    {
      key: "status", label: "STATUS", width: "90px", align: "center" as const,
      render: (i) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset
          ${i.status === "Aktif" ? "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}>
          {i.status}
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
      pageTitle="Data Dosen & SDM"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Data Dosen & SDM</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Pegawai akademik & non-akademik Universitas Lampung — biodata, jabfung, sertifikasi
            </p>
          </div>
          {isFiltered && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30">
              <FiFilter className="w-3.5 h-3.5" />
              Statistik sesuai filter aktif
            </span>
          )}
        </div>

        {loadingStats ? (
          <StatCardGridSkeleton count={5} />
        ) : stats && (() => {
          const total = num(stats.total);
          const dosen = num(stats.dosen);
          const tendik = num(stats.tendik);
          const berNidn = num(stats.ber_nidn);
          return (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <StatCard icon={<FiUsers className="w-6 h-6" />} label="Total Dosen" value={total} gradient="from-blue-500 to-indigo-600" subtext={`${fmt(num(stats.total_fakultas))} fakultas`} />
                <StatCard icon={<FiCheckCircle className="w-6 h-6" />} label="Aktif" value={num(stats.aktif)} gradient="from-emerald-500 to-teal-600" subtext={`${pct(num(stats.aktif), total)} dari total`} />
                <StatCard icon={<FiCreditCard className="w-6 h-6" />} label="Ber-NIDN" value={berNidn} gradient="from-violet-500 to-purple-600" subtext={`${pct(berNidn, dosen)} dari dosen`} />
                <StatCard icon={<FiAward className="w-6 h-6" />} label="Ber-NIP" value={num(stats.ber_nip)} gradient="from-pink-500 to-rose-600" subtext={`${pct(num(stats.ber_nip), dosen)} dari dosen`} />
                <StatCard icon={<FiAward className="w-6 h-6" />} label="Gender L/P" value={`${fmt(num(stats.gender_l))} / ${fmt(num(stats.gender_p))}`} gradient="from-amber-500 to-orange-500" subtext={`${pct(num(stats.gender_l), total)} L`} />
              </div>
            </div>
          );
        })()}

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-0">
            <ScopeBadge />
          </div>
          {stats?.last_sync && (
            <div className="inline-flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 text-[11px] sm:text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <FiDatabase className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold">Sumber:</span>
                <span>{stats.data_source || "SISTER"}</span>
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

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden border border-gray-200/50 dark:border-gray-800">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="p-4 sm:p-5 space-y-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <FiFilter className="w-3.5 h-3.5" /> Filter Data
                </span>
                <div className="flex items-center gap-2">
                  <ExportMenu onExport={handleExport} serverCsvLabel="CSV Lengkap (semua filter)" />
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
                <Dropdown label="Status" value={filterStatus}
                  onChange={(v) => { setFilterStatus(v); setPage(1); }}
                  options={statusOptions} placeholder="Semua Status" />
              </div>

              {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktif</span>
                  {activeChips.map((c) => (
                    <span key={c.key} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 rounded-full dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30">
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
              searchPlaceholder="Cari nama, NIDN, NIP, NIK..."
              defaultRowsPerPage={10}
            />
          </motion.div>
        </div>
      </div>

      <DosenProfileModal idSdm={selectedId} onClose={() => setSelectedId(null)} />
    </DashboardLayoutWithDynamicMenu>
  );
}
