"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import Dropdown, { type DropdownOption } from "@/shared/components/data-unila/Dropdown";
import UnitFilter from "@/shared/components/data-unila/UnitFilter";
import ExportMenu, { type ExportFormat } from "@/shared/components/data-unila/ExportMenu";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";
import { MdSchool } from "react-icons/md";
import { FiUsers, FiMapPin, FiLayers, FiCalendar, FiFilter, FiRotateCcw, FiX } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../config/menuConfig";
import kknDataService, { type KknItem, type KknStats, type KknPeriode } from "@/lib/services/data-unila/kknDataService";
import mahasiswaDataService, { type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
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
function fmtDate(s?: string | null): string {
  if (!s) return "—";
  try {
    const d = new Date(s.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return s; }
}

function StatCard({ icon, label, value, gradient, subtext }: { icon: React.ReactNode; label: string; value: string | number; gradient: string; subtext?: string }) {
  const display = typeof value === "number" ? fmt(value) : value;
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

function InfoStrip({ stats }: { stats: KknStats }) {
  const byKab = (stats.by_kabupaten || []).map((k) => ({ name: k.nm_kabupaten || "Lainnya", value: num(k.jml_mhs) }));
  const topKab = byKab.slice(0, 6);
  const sumKab = topKab.reduce((s, k) => s + k.value, 0) || 1;
  const colors = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];
  const byPeriode = (stats.by_periode || []).slice(0, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Top Kabupaten KKN</h4>
          <span className="text-[10px] text-gray-400">{byKab.length} kabupaten</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          {topKab.map((k, idx) => (
            <div key={k.name} className={colors[idx % colors.length]} style={{ width: `${(k.value / sumKab) * 100}%` }} title={`${k.name}: ${fmt(k.value)}`} />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
          {topKab.map((k, idx) => (
            <span key={k.name} className="inline-flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${colors[idx % colors.length]}`} />
              <span className="text-gray-700 dark:text-gray-300 truncate max-w-[120px]" title={k.name}>{k.name}</span>
              <span className="text-gray-400 tabular-nums">{fmt(k.value)}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-4 shadow-md relative overflow-hidden">
        <div className="absolute -top-8 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <h4 className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Periode Terbaru</h4>
          <div className="mt-2 space-y-1.5">
            {byPeriode.map((p) => (
              <div key={p.nm_periode} className="flex items-center justify-between text-xs">
                <span className="text-white/90 font-medium truncate">{p.nm_periode}</span>
                <span className="text-white tabular-nums font-bold">{fmt(num(p.jml_mhs))}</span>
              </div>
            ))}
            {byPeriode.length === 0 && (
              <p className="text-white/70 text-xs italic">Belum ada data periode</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KknPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const forcedFak = scope.forcedFakultas || "";
  const forcedJur = scope.forcedJurusan || "";
  const forcedProdi = scope.forcedProdi || "";

  const [data, setData] = useState<KknItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<KknStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [periodeList, setPeriodeList] = useState<KknPeriode[]>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("nm_mahasiswa");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [filterPeriode, setFilterPeriode] = useState("");
  const [filterKabupaten, setFilterKabupaten] = useState("");

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
    kknDataService.getStats().then(setStats).catch(console.error).finally(() => setLoadingStats(false));
    kknDataService.getPeriode().then(setPeriodeList).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    kknDataService.getList({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      id_periode: filterPeriode || undefined,
      nm_kabupaten: filterKabupaten || undefined,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
    } as Record<string, any>)
      .then((r: { data: KknItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data KKN"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterPeriode, filterKabupaten, filterFak, filterProdi, filterJurusan, unitFilterStr]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const periodeOptions: DropdownOption[] = periodeList.map((p) => ({ value: p.id_periode, label: p.nm_periode, sublabel: p.gelombang || undefined }));
  const kabupatenOptions: DropdownOption[] = (stats?.by_kabupaten || []).map((k) => ({ value: k.nm_kabupaten, label: k.nm_kabupaten }));

  const activeChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (filterPeriode) {
    const p = periodeOptions.find((o) => o.value === filterPeriode);
    if (p) activeChips.push({ key: "per", label: p.label, clear: () => { setFilterPeriode(""); setPage(1); } });
  }
  if (filterKabupaten) activeChips.push({ key: "kab", label: filterKabupaten, clear: () => { setFilterKabupaten(""); setPage(1); } });
  const hasFilter = activeChips.length > 0;

  const EXPORT_HEADERS = {
    npm: "NPM",
    nm_mahasiswa: "Nama Mahasiswa",
    nm_kelompok: "Kelompok",
    kode_kelompok: "Kode Kelompok",
    nm_kabupaten: "Kabupaten",
    nm_kecamatan: "Kecamatan",
    nm_desa: "Desa",
    nm_periode: "Periode",
    tahun_akademik: "Tahun Akademik",
    peran: "Peran",
    status: "Status",
  } as const;

  const dataForExport = useMemo(() => data, [data]);

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") { toast("Server export belum tersedia"); return; }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    if (fmtType === "excel") exportToExcel(dataForExport as unknown as Record<string, unknown>[], "kkn", "KKN", EXPORT_HEADERS);
    else if (fmtType === "csv-client") exportToCsv(dataForExport as unknown as Record<string, unknown>[], "kkn", EXPORT_HEADERS);
    else if (fmtType === "pdf") exportToPdf(dataForExport as unknown as Record<string, unknown>[], "kkn", { title: "Data KKN Universitas Lampung", headers: EXPORT_HEADERS, orientation: "landscape" });
    else if (fmtType === "json") exportToJson(dataForExport, "kkn");
    toast.success(`${fmtType.toUpperCase()} berhasil di-download`);
  };

  const handleReset = () => { setFilterPeriode(""); setFilterKabupaten(""); setPage(1); };

  const columns: Column<KknItem>[] = [
    { key: "npm", label: "NPM", width: "120px", render: (i) => (
      <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{i.npm || "—"}</span>
    )},
    { key: "nm_mahasiswa", label: "NAMA MAHASISWA", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{i.nm_mahasiswa || "—"}</div>
        {i.peran && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Peran: {i.peran}</div>}
      </div>
    )},
    { key: "nm_kelompok", label: "KELOMPOK", width: "160px", render: (i) => (
      <div>
        <div className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{i.nm_kelompok || "—"}</div>
        {i.kode_kelompok && <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{i.kode_kelompok}</div>}
      </div>
    )},
    { key: "lokasi", label: "LOKASI", render: (i) => (
      <div>
        <div className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{i.nm_desa || "—"}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{[i.nm_kecamatan, i.nm_kabupaten].filter(Boolean).join(", ") || "—"}</div>
      </div>
    )},
    { key: "nm_periode", label: "PERIODE", width: "150px", render: (i) => (
      <div>
        <div className="text-xs text-gray-800 dark:text-gray-200 line-clamp-1">{i.nm_periode}</div>
        {i.tahun_akademik && <div className="text-[10px] text-gray-500 dark:text-gray-400">{i.tahun_akademik}</div>}
      </div>
    )},
    { key: "tgl_bergabung", label: "TGL BERGABUNG", width: "120px", sortable: true, render: (i) => (
      <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{fmtDate(i.tgl_bergabung)}</span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Data KKN">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Data KKN</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Kuliah Kerja Nyata mahasiswa Unila — kelompok, lokasi, periode</p>
          </div>
          {hasFilter && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300">
              <FiFilter className="w-3.5 h-3.5" /> Filter aktif
            </span>
          )}
        </div>

        {loadingStats ? (
          <StatCardGridSkeleton count={5} />
        ) : stats && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatCard icon={<FiUsers className="w-6 h-6" />} label="Total Mahasiswa KKN" value={num(stats.total_mhs)} gradient="from-violet-500 to-purple-600" />
              <StatCard icon={<FiLayers className="w-6 h-6" />} label="Total Kelompok" value={num(stats.total_kelompok)} gradient="from-blue-500 to-indigo-600" />
              <StatCard icon={<FiMapPin className="w-6 h-6" />} label="Total Lokasi" value={num(stats.total_lokasi)} gradient="from-emerald-500 to-teal-600" subtext={`${fmt(num(stats.total_kabupaten))} kabupaten`} />
              <StatCard icon={<FiCalendar className="w-6 h-6" />} label="Periode Aktif" value={num(stats.periode_aktif)} gradient="from-amber-500 to-orange-500" subtext={`dari ${fmt(num(stats.total_periode))} total`} />
              <StatCard icon={<FiMapPin className="w-6 h-6" />} label="Kabupaten" value={num(stats.total_kabupaten)} gradient="from-pink-500 to-rose-600" />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2"><div className="flex-1 min-w-0"><ScopeBadge /></div></div>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <UnitFilter
                  data={orgFilters}
                  value={unitItems}
                  onChange={(next) => { setUnitItems(next); setPage(1); }}
                  forcedFakultas={forcedFak || undefined}
                  forcedJurusan={forcedJur || undefined}
                  forcedProdi={forcedProdi || undefined}
                />
                <Dropdown label="Periode KKN" value={filterPeriode} onChange={(v) => { setFilterPeriode(v); setPage(1); }} options={periodeOptions} placeholder="Semua Periode" searchable />
                <Dropdown label="Kabupaten" value={filterKabupaten} onChange={(v) => { setFilterKabupaten(v); setPage(1); }} options={kabupatenOptions} placeholder="Semua Kabupaten" searchable />
              </div>
              {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktif</span>
                  {activeChips.map((c) => (
                    <span key={c.key} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-violet-50 text-violet-700 ring-1 ring-violet-200 rounded-full dark:bg-violet-500/10 dark:text-violet-300">
                      {c.label}
                      <button type="button" onClick={c.clear} className="ml-0.5 w-4 h-4 rounded-full hover:bg-violet-200 dark:hover:bg-violet-400/20 flex items-center justify-center"><FiX className="w-3 h-3" /></button>
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
              searchPlaceholder="Cari NPM, nama mahasiswa, kelompok..."
              defaultRowsPerPage={10}
            />
          </motion.div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
