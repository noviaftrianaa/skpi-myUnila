"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import Dropdown, { type DropdownOption } from "@/shared/components/data-unila/Dropdown";
import ExportMenu, { type ExportFormat } from "@/shared/components/data-unila/ExportMenu";
import TendikProfileModal from "@/shared/components/data-unila/TendikProfileModal";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import { MdSchool } from "react-icons/md";
import {
  FiUsers, FiCheckCircle, FiCreditCard, FiBriefcase, FiAward, FiFilter, FiRotateCcw, FiX,
  FiClock as FiClockIco, FiDatabase,
} from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import tendikDataService, {
  type TendikItem, type TendikStats, type TendikFilters,
} from "@/lib/services/data-unila/tendikDataService";
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

function StatCard({ icon, label, value, gradient, subtext }: { icon: React.ReactNode; label: string; value: string | number; gradient: string; subtext?: string }) {
  const display = typeof value === "number" ? fmt(value) : fmt(num(value));
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

function InfoStrip({ stats }: { stats: TendikStats }) {
  const l = num(stats.gender_l);
  const p = num(stats.gender_p);
  const tg = l + p;
  const byJns = (stats.by_jns_pegawai || []).map((j) => ({ name: j.jenis || "Lainnya", value: num(j.jumlah) }));
  const top = byJns.slice(0, 5);
  const sumTop = top.reduce((s, j) => s + j.value, 0) || 1;
  const jColors = ["bg-teal-500", "bg-cyan-500", "bg-blue-500", "bg-violet-500", "bg-rose-500"];
  const byPend = (stats.by_pendidikan || []).map((p) => ({ name: p.jenjang || "Tidak Tercatat", value: num(p.jumlah) }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rasio Gender</h4>
          <span className="text-[10px] text-gray-400">Total: {fmt(tg)}</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <div className="bg-blue-500" style={{ width: tg ? `${(l / tg) * 100}%` : 0 }} />
          <div className="bg-pink-500" style={{ width: tg ? `${(p / tg) * 100}%` : 0 }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-gray-700 dark:text-gray-300">{fmt(l)} L</span><span className="text-gray-400">({pct(l, tg)})</span></span>
          <span className="inline-flex items-center gap-1.5"><span className="text-gray-400">({pct(p, tg)})</span><span className="text-gray-700 dark:text-gray-300">{fmt(p)} P</span><span className="w-2 h-2 rounded-full bg-pink-500" /></span>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jenis Kepegawaian</h4>
          <span className="text-[10px] text-gray-400">{byJns.length} jenis</span>
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
              <span className="text-gray-700 dark:text-gray-300">{j.name}</span>
              <span className="text-gray-400 tabular-nums">{fmt(j.value)}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 p-4 shadow-md relative overflow-hidden">
        <div className="absolute -top-8 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <h4 className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Pendidikan Terakhir</h4>
          <div className="mt-2 space-y-1.5">
            {byPend.slice(0, 4).map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <span className="text-white/90 font-medium truncate">{p.name}</span>
                <span className="text-white tabular-nums font-bold">{fmt(p.value)}</span>
              </div>
            ))}
            {byPend.length === 0 && (
              <p className="text-white/70 text-xs italic">Belum ada data pendidikan</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TendikPage() {
  useRequireAuth();

  const [data, setData] = useState<TendikItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TendikStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("nm_pegawai");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [filters, setFilters] = useState<TendikFilters | null>(null);
  const [filterOrg, setFilterOrg] = useState("");
  const [filterJns, setFilterJns] = useState("");
  const [filterStatus, setFilterStatus] = useState("Aktif");
  const [selectedItem, setSelectedItem] = useState<TendikItem | null>(null);

  useEffect(() => {
    tendikDataService.getFilters().then(setFilters).catch(console.error);
  }, []);

  useEffect(() => {
    setLoadingStats(true);
    tendikDataService.getStats({
      id_org1: filterOrg || undefined,
      jns_pegawai: filterJns || undefined,
      status: filterStatus || undefined,
    })
      .then(setStats).catch(console.error).finally(() => setLoadingStats(false));
  }, [filterOrg, filterJns, filterStatus]);

  useEffect(() => {
    setLoading(true);
    tendikDataService.getList({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      id_org1: filterOrg || undefined,
      jns_pegawai: filterJns || undefined,
      status: filterStatus || undefined,
    })
      .then((r) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data tendik"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterOrg, filterJns, filterStatus]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => {
    setSortBy(k); setSortOrder(o); setPage(1);
  }, []);

  const orgOptions: DropdownOption[] = (filters?.org1 || []).map((o) => ({ value: o.id_unit_orga, label: o.nm_unit_orga }));
  const jnsOptions: DropdownOption[] = (filters?.jns_pegawai || []).map((j) => ({ value: j.jenis, label: j.jenis }));
  const statusOptions: DropdownOption[] = (filters?.status || []).map((s) => ({ value: s.status, label: s.status }));

  const activeChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (filterOrg) {
    const f = orgOptions.find((o) => o.value === filterOrg);
    if (f) activeChips.push({ key: "org", label: f.label, clear: () => { setFilterOrg(""); setPage(1); } });
  }
  if (filterJns) activeChips.push({ key: "jns", label: filterJns, clear: () => { setFilterJns(""); setPage(1); } });
  if (filterStatus && filterStatus !== "Aktif") activeChips.push({ key: "stat", label: filterStatus, clear: () => { setFilterStatus("Aktif"); setPage(1); } });
  const hasFilter = activeChips.length > 0;

  const EXPORT_HEADERS = {
    nm_pegawai: "Nama Tendik",
    nip: "NIP",
    jk: "Jenis Kelamin",
    jns_pegawai: "Jenis Pegawai",
    nm_org1: "Unit Kerja",
    pendidikan_terakhir: "Pendidikan",
    golongan: "Golongan",
    nm_jabfung: "Jabatan Fungsional",
    nm_jabstruk: "Jabatan Struktural",
    status: "Status",
  } as const;

  const dataForExport = useMemo(() => data, [data]);

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") { toast("Server export belum tersedia"); return; }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    const baseName = `tendik-${filterStatus || "all"}`;
    if (fmtType === "excel") {
      exportToExcel(dataForExport as unknown as Record<string, unknown>[], baseName, "Tendik", EXPORT_HEADERS);
      toast.success("Excel berhasil di-download");
    } else if (fmtType === "csv-client") {
      exportToCsv(dataForExport as unknown as Record<string, unknown>[], baseName, EXPORT_HEADERS);
      toast.success("CSV berhasil di-download");
    } else if (fmtType === "pdf") {
      exportToPdf(dataForExport as unknown as Record<string, unknown>[], baseName, {
        title: "Data Daftar Tendik Universitas Lampung",
        subtitle: `Sumber: SIKEP — ${filterStatus || "Semua"}`,
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
    setFilterOrg("");
    setFilterJns("");
    setFilterStatus("Aktif");
    setPage(1);
  };

  const columns: Column<TendikItem>[] = [
    {
      key: "nip", label: "NIP / ID", width: "140px",
      render: (i) => (
        <div className="space-y-0.5">
          <div className="text-xs font-mono text-gray-900 dark:text-white">{i.nip || "—"}</div>
          <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{i.id_pegawai}</div>
        </div>
      ),
    },
    {
      key: "nm_pegawai", label: "NAMA TENDIK", sortable: true,
      render: (i) => (
        <button type="button" onClick={() => setSelectedItem(i)} className="text-left group">
          <div className="font-medium text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{i.nm_pegawai}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {i.jk === "L" ? "Laki-laki" : i.jk === "P" ? "Perempuan" : i.jk || "—"}
            {i.jns_pegawai && <span> · {i.jns_pegawai}</span>}
          </div>
        </button>
      ),
    },
    {
      key: "nm_org1", label: "UNIT KERJA",
      render: (i) => (
        <div>
          <div className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{i.nm_org1 || "—"}</div>
          {i.nm_org2 && <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{i.nm_org2}</div>}
        </div>
      ),
    },
    {
      key: "golongan", label: "GOL/PANGKAT", width: "150px",
      render: (i) => i.golongan ? (
        <div>
          <div className="text-xs font-bold text-gray-800 dark:text-gray-200">{i.golongan}</div>
          {i.pangkat && <div className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">{i.pangkat}</div>}
        </div>
      ) : <span className="text-xs text-gray-400">—</span>,
    },
    {
      key: "pendidikan_terakhir", label: "PENDIDIKAN", width: "100px", align: "center" as const,
      render: (i) => i.pendidikan_terakhir ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300">
          {i.pendidikan_terakhir}
        </span>
      ) : <span className="text-xs text-gray-400">—</span>,
    },
    {
      key: "status", label: "STATUS", width: "90px", align: "center" as const,
      render: (i) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset
          ${i.status === "Aktif" ? "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}>
          {i.status || "—"}
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
      pageTitle="Daftar Tendik"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Daftar Tendik</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Pegawai non-akademik Universitas Lampung — sumber data SIKEP
            </p>
          </div>
          {hasFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-400/30">
              <FiFilter className="w-3.5 h-3.5" /> Statistik sesuai filter aktif
            </span>
          )}
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : stats && (() => {
          const total = num(stats.total);
          return (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard icon={<FiUsers className="w-6 h-6" />} label="Total Tendik" value={total} gradient="from-teal-500 to-cyan-600" />
                <StatCard icon={<FiCheckCircle className="w-6 h-6" />} label="Aktif" value={num(stats.aktif)} gradient="from-emerald-500 to-teal-600" subtext={`${pct(num(stats.aktif), total)}`} />
                <StatCard icon={<FiCreditCard className="w-6 h-6" />} label="PNS" value={num(stats.pns)} gradient="from-blue-500 to-indigo-600" subtext={`${pct(num(stats.pns), total)}`} />
                <StatCard icon={<FiBriefcase className="w-6 h-6" />} label="PPPK" value={num(stats.pppk)} gradient="from-violet-500 to-purple-600" subtext={`${pct(num(stats.pppk), total)}`} />
                <StatCard icon={<FiBriefcase className="w-6 h-6" />} label="Kontrak" value={num(stats.honorer)} gradient="from-rose-500 to-pink-600" subtext={`${pct(num(stats.honorer), total)}`} />
                <StatCard icon={<FiAward className="w-6 h-6" />} label="Struktural" value={num(stats.struktural)} gradient="from-amber-500 to-orange-500" subtext={`${pct(num(stats.struktural), total)}`} />
              </div>
            </div>
          );
        })()}

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-0"><ScopeBadge /></div>
          {stats?.last_sync && (
            <div className="inline-flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 text-[11px] sm:text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <FiDatabase className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold">Sumber:</span>
                <span>{stats.data_source}</span>
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
                  <ExportMenu onExport={handleExport} disabled={{ "csv-server": true }} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <Dropdown label="Unit Kerja" value={filterOrg}
                  onChange={(v) => { setFilterOrg(v); setPage(1); }}
                  options={orgOptions} placeholder="Semua Unit" searchable />
                <Dropdown label="Jenis Pegawai" value={filterJns}
                  onChange={(v) => { setFilterJns(v); setPage(1); }}
                  options={jnsOptions} placeholder="Semua Jenis" />
                <Dropdown label="Status" value={filterStatus}
                  onChange={(v) => { setFilterStatus(v); setPage(1); }}
                  options={statusOptions} placeholder="Semua Status" />
              </div>

              {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktif</span>
                  {activeChips.map((c) => (
                    <span key={c.key} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-teal-50 text-teal-700 ring-1 ring-teal-200 rounded-full dark:bg-teal-500/10 dark:text-teal-300">
                      {c.label}
                      <button type="button" onClick={c.clear} className="ml-0.5 w-4 h-4 rounded-full hover:bg-teal-200 dark:hover:bg-teal-400/20 flex items-center justify-center">
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
              searchPlaceholder="Cari nama, NIP, ID pegawai..."
              defaultRowsPerPage={10}
            />
          </motion.div>
        </div>
      </div>
      <TendikProfileModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </DashboardLayoutWithDynamicMenu>
  );
}
