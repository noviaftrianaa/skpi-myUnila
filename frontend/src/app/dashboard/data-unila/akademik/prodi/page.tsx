"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import Dropdown, { type DropdownOption } from "@/shared/components/data-unila/Dropdown";
import UnitFilter from "@/shared/components/data-unila/UnitFilter";
import ExportMenu, { type ExportFormat } from "@/shared/components/data-unila/ExportMenu";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";
import { MdSchool } from "react-icons/md";
import { FiBookOpen, FiAward, FiUsers, FiTrendingUp, FiFilter, FiRotateCcw, FiX } from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import akademikDataService, { type ProdiStats } from "@/lib/services/data-unila/akademikDataService";
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
function pct(part: number, total: number): string {
  if (!total) return "—";
  return `${((part / total) * 100).toFixed(1)}%`;
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

function InfoStrip({ stats }: { stats: ProdiStats }) {
  const jenjang = [
    { l: "Diploma", v: num(stats.diploma), color: "bg-amber-500" },
    { l: "S1", v: num(stats.sarjana), color: "bg-blue-500" },
    { l: "Profesi", v: num(stats.profesi), color: "bg-cyan-500" },
    { l: "Sp", v: num(stats.spesialis), color: "bg-teal-500" },
    { l: "S2", v: num(stats.magister), color: "bg-violet-500" },
    { l: "S3", v: num(stats.doktor), color: "bg-rose-500" },
  ].filter((j) => j.v > 0);
  const sumJ = jenjang.reduce((s, j) => s + j.v, 0) || 1;

  const akred = (stats.akreditasi_breakdown || []).map((a) => ({ name: a.peringkat, value: num(a.jumlah) }));
  const sumA = akred.reduce((s, a) => s + a.value, 0) || 1;
  const akredColors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-rose-500", "bg-gray-400"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Distribusi Jenjang</h4>
          <span className="text-[10px] text-gray-400">{jenjang.length} jenjang</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          {jenjang.map((j) => (
            <div key={j.l} className={j.color} style={{ width: `${(j.v / sumJ) * 100}%` }} title={`${j.l}: ${fmt(j.v)}`} />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
          {jenjang.map((j) => (
            <span key={j.l} className="inline-flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${j.color}`} />
              <span className="text-gray-700 dark:text-gray-300">{j.l}</span>
              <span className="text-gray-400 tabular-nums">{fmt(j.v)}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Distribusi Akreditasi</h4>
          <span className="text-[10px] text-gray-400">{akred.length} peringkat</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          {akred.map((a, idx) => (
            <div key={a.name} className={akredColors[idx % akredColors.length]} style={{ width: `${(a.value / sumA) * 100}%` }} title={`${a.name}: ${fmt(a.value)}`} />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
          {akred.map((a, idx) => (
            <span key={a.name} className="inline-flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${akredColors[idx % akredColors.length]}`} />
              <span className="text-gray-700 dark:text-gray-300">{a.name}</span>
              <span className="text-gray-400 tabular-nums">{fmt(a.value)}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ProdiItem {
  id_sms: string;
  nm_prodi: string;
  nm_fakultas: string;
  jenjang: string;
  akreditasi: string | null;
  mhs_aktif: number | string;
  jml_dosen: number | string;
}

export default function ProdiPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const forcedFak = scope.forcedFakultas || "";
  const forcedJur = scope.forcedJurusan || "";
  const forcedProdi = scope.forcedProdi || "";

  const [data, setData] = useState<ProdiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProdiStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("nm_prodi");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [filters, setFilters] = useState<MahasiswaFilters | null>(null);
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
    akademikDataService.getProdiStats().then(setStats).catch(console.error).finally(() => setLoadingStats(false));
    mahasiswaDataService.getFilters({}).then(setFilters).catch(console.error);
  }, []);

  useEffect(() => {
    mahasiswaDataService.getFilters({ id_fakultas: filterFak || undefined, id_jurusan: filterJurusan || undefined })
      .then(setOrgFilters).catch(console.error);
  }, [filterFak, filterJurusan]);

  useEffect(() => {
    setLoading(true);
    akademikDataService.getProdi({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
    } as Record<string, any>)
      .then((r: { data: ProdiItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data prodi"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterFak, filterProdi, filterJurusan, unitFilterStr]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const fakOptions: DropdownOption[] = (filters?.fakultas || []).map((f) => ({ value: f.id_fakultas, label: f.nm_fakultas }));

  const EXPORT_HEADERS = {
    nm_prodi: "Program Studi",
    nm_fakultas: "Fakultas",
    jenjang: "Jenjang",
    akreditasi: "Akreditasi",
    mhs_aktif: "Mahasiswa Aktif",
    jml_dosen: "Jumlah Dosen",
  } as const;

  const dataForExport = useMemo(() => data, [data]);

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") { toast("Server export belum tersedia"); return; }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    if (fmtType === "excel") exportToExcel(dataForExport as unknown as Record<string, unknown>[], "program-studi", "Prodi", EXPORT_HEADERS);
    else if (fmtType === "csv-client") exportToCsv(dataForExport as unknown as Record<string, unknown>[], "program-studi", EXPORT_HEADERS);
    else if (fmtType === "pdf") exportToPdf(dataForExport as unknown as Record<string, unknown>[], "program-studi", { title: "Program Studi Universitas Lampung", headers: EXPORT_HEADERS, orientation: "landscape" });
    else if (fmtType === "json") exportToJson(dataForExport, "program-studi");
    toast.success(`${fmtType.toUpperCase()} berhasil di-download`);
  };

  const columns: Column<ProdiItem>[] = [
    { key: "nm_prodi", label: "PROGRAM STUDI", sortable: true, render: (i) => (
      <div>
        <Link
          href={`/dashboard/data-unila/akademik/prodi/${encodeURIComponent(i.id_sms)}`}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
        >
          {i.nm_prodi}
        </Link>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{i.nm_fakultas} · Jenjang {i.jenjang || "—"}</div>
      </div>
    )},
    { key: "akreditasi", label: "AKREDITASI", width: "130px", align: "center" as const, render: (i) => i.akreditasi ? (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset
        ${/Unggul|^A$/.test(i.akreditasi) ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
        : /Baik Sekali|^B$/.test(i.akreditasi) ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300"
        : /Baik|^C$/.test(i.akreditasi) ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300"
        : "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}>
        {i.akreditasi}
      </span>
    ) : <span className="text-xs text-gray-400">Belum</span> },
    { key: "mhs_aktif", label: "MAHASISWA", width: "130px", sortable: true, align: "right" as const, render: (i) => (
      <span className="font-mono text-sm font-semibold text-gray-700 dark:text-gray-300">{fmt(num(i.mhs_aktif))}</span>
    )},
    { key: "jml_dosen", label: "DOSEN", width: "90px", align: "right" as const, render: (i) => (
      <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{fmt(num(i.jml_dosen))}</span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Program Studi">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Program Studi</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Prodi Unila dengan akreditasi & jumlah civitas akademika</p>
          </div>
          {filterFak && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300">
              <FiFilter className="w-3.5 h-3.5" /> {fakOptions.find((o) => o.value === filterFak)?.label}
            </span>
          )}
        </div>

        {loadingStats ? (
          <StatCardGridSkeleton count={5} />
        ) : stats && (() => {
          const total = num(stats.total);
          const unggul = num(stats.unggul);
          const pasca = num(stats.magister) + num(stats.doktor);
          return (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <StatCard icon={<FiBookOpen className="w-6 h-6" />} label="Total Prodi" value={total} gradient="from-blue-500 to-indigo-600" />
                <StatCard icon={<FiAward className="w-6 h-6" />} label="Unggul" value={unggul} gradient="from-emerald-500 to-teal-600" subtext={`${pct(unggul, total)} dari total`} />
                <StatCard icon={<FiUsers className="w-6 h-6" />} label="Sarjana (S1)" value={num(stats.sarjana)} gradient="from-violet-500 to-purple-600" subtext={`${pct(num(stats.sarjana), total)}`} />
                <StatCard icon={<FiTrendingUp className="w-6 h-6" />} label="Pascasarjana" value={pasca} gradient="from-amber-500 to-orange-500" subtext={`S2: ${fmt(num(stats.magister))} · S3: ${fmt(num(stats.doktor))}`} />
                <StatCard icon={<FiBookOpen className="w-6 h-6" />} label="Diploma" value={num(stats.diploma)} gradient="from-pink-500 to-rose-600" subtext={`${pct(num(stats.diploma), total)}`} />
              </div>
            </div>
          );
        })()}

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <UnitFilter
                  data={orgFilters}
                  value={unitItems}
                  onChange={(next) => { setUnitItems(next); setPage(1); }}
                  forcedFakultas={forcedFak || undefined}
                  forcedJurusan={forcedJur || undefined}
                  forcedProdi={forcedProdi || undefined}
                />
              </div>
              {filterFak && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktif</span>
                  <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-200 rounded-full dark:bg-amber-500/10 dark:text-amber-300">
                    {fakOptions.find((o) => o.value === filterFak)?.label}
                    <button type="button" onClick={() => { setFilterFak(""); setPage(1); }} className="ml-0.5 w-4 h-4 rounded-full hover:bg-amber-200 dark:hover:bg-amber-400/20 flex items-center justify-center"><FiX className="w-3 h-3" /></button>
                  </span>
                </div>
              )}
            </div>

            <DataTable columns={columns} data={data} loading={loading} serverSide totalRecords={total}
              onPageChange={setPage}
              onRowsPerPageChange={(n) => { setLimit(n); setPage(1); }}
              onSearchChange={(q) => { setSearch(q); setPage(1); }}
              onSortChange={handleSort}
              searchPlaceholder="Cari nama prodi, fakultas..."
              defaultRowsPerPage={10}
            />
          </motion.div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
