"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { FiClock, FiUsers, FiAward, FiTrendingUp, FiDownload, FiRefreshCw, FiInfo, FiChevronRight, FiX } from "react-icons/fi";
import { pimpinanMenuConfig } from "../config/menuConfig";
import { StatCard, DashboardSkeleton, ErrorAlert } from "../components";
import { LineChart, BarChart, PieChart, GaugeChart } from "../components/charts";
import {
  ktwService,
  type JenjangKode,
  type KtwFakultasRow,
  type KtwProdiRow,
  type KtwOverviewData,
  type KtwMeta,
  type KtwMahasiswaRow,
} from "@/lib/services/public/ktwService";

const APP_KEY = "dashboard-pimpinan";

const JENJANG_OPTIONS: JenjangKode[] = ["D3", "D4", "S1", "S2", "S3"];
const MASA_MAP: Record<JenjangKode, number> = { D3: 3, D4: 4, S1: 4, S2: 2, S3: 3 };

function defaultCohort(jenjang: JenjangKode): number {
  const now = new Date();
  return now.getFullYear() - MASA_MAP[jenjang] - 1;
}

function tierColor(pct: number): "green" | "blue" | "yellow" | "red" {
  if (pct >= 80) return "green";
  if (pct >= 60) return "blue";
  if (pct >= 40) return "yellow";
  return "red";
}

function pctBadgeClass(pct: number): string {
  if (pct >= 80) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
  if (pct >= 60) return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200";
  if (pct >= 40) return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
  return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200";
}

export default function DashboardKtwPage() {
  useRequireAuth();

  const [jenjang, setJenjang] = useState<JenjangKode>("S1");
  const [cohort, setCohort] = useState<number>(defaultCohort("S1"));
  const [cutoff, setCutoff] = useState<string>("");
  const [selectedFakultas, setSelectedFakultas] = useState<{ id: string; nama: string } | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [overview, setOverview] = useState<KtwOverviewData | null>(null);
  const [meta, setMeta] = useState<KtwMeta | null>(null);
  const [fakultasRows, setFakultasRows] = useState<KtwFakultasRow[]>([]);
  const [prodiRows, setProdiRows] = useState<KtwProdiRow[]>([]);
  const [trend, setTrend] = useState<KtwOverviewData[]>([]);
  const [topProdi, setTopProdi] = useState<KtwProdiRow[]>([]);
  const [statusRows, setStatusRows] = useState<Array<{ id_jns_keluar: string; nm_status: string; jumlah: number; persentase: number }>>([]);
  const [genderRows, setGenderRows] = useState<Array<{ jk: string; nm_gender: string; maba: number; lulus: number; ktw_strict: number; pct_ktw: number }>>([]);
  const [jalurRows, setJalurRows] = useState<Array<{ id_jalur_daftar: string; nm_jalur: string; maba: number; lulus: number; ktw: number; pct_ktw: number; pct_survival: number }>>([]);
  const [presets, setPresets] = useState<Array<{ group: string; label: string; value: string }>>([]);

  // Modal state — mahasiswa detail
  const [modalProdi, setModalProdi] = useState<KtwProdiRow | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMhs, setModalMhs] = useState<KtwMahasiswaRow[]>([]);
  const [modalPage, setModalPage] = useState(1);
  const [modalLast, setModalLast] = useState(1);

  const cohortOptions = useMemo(() => {
    const max = new Date().getFullYear() - MASA_MAP[jenjang];
    return Array.from({ length: 10 }, (_, i) => max - i);
  }, [jenjang]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, fak, prodi, tr, top, st, gd, jl] = await Promise.all([
        ktwService.getOverview(cohort, jenjang, false, cutoff || undefined),
        ktwService.getByFakultas(cohort, jenjang, cutoff || undefined),
        ktwService.getByProdi(cohort, jenjang, selectedFakultas?.id ?? undefined, cutoff || undefined),
        ktwService.getTrend(jenjang, cohort - 5, cohort),
        ktwService.getTopProdi(cohort, jenjang, 10, cutoff || undefined),
        ktwService.getStatusBreakdown(cohort, jenjang, cutoff || undefined),
        ktwService.getGenderBreakdown(cohort, jenjang, cutoff || undefined),
        ktwService.getJalurBreakdown(cohort, jenjang, cutoff || undefined),
      ]);
      setOverview(ov.data);
      setMeta(ov.meta);
      setFakultasRows(fak.data);
      setProdiRows(prodi.data);
      setTrend(tr.data);
      setTopProdi(top.data);
      setStatusRows(st.data);
      setGenderRows(gd.data);
      setJalurRows(jl.data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal memuat data KTW";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ktwService.getPresets().then(r => setPresets(r.data)).catch(() => setPresets([]));
  }, []);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohort, jenjang, cutoff, selectedFakultas]);

  const handleRefreshCache = async () => {
    setRefreshing(true);
    try {
      await ktwService.refreshCache();
      await fetchAll();
    } catch {
      /* ignore */
    } finally {
      setRefreshing(false);
    }
  };

  const handleReset = () => {
    setJenjang("S1");
    setCohort(defaultCohort("S1"));
    setCutoff("");
    setSelectedFakultas(null);
  };

  const openMahasiswa = async (prodi: KtwProdiRow, page = 1) => {
    if (!prodi.id_prodi) return;
    setModalProdi(prodi);
    setModalLoading(true);
    setModalPage(page);
    try {
      const r = await ktwService.getMahasiswaList(prodi.id_prodi, cohort, page, 50);
      setModalMhs(r.data);
      setModalLast(r.pagination.last_page);
    } catch {
      setModalMhs([]);
    } finally {
      setModalLoading(false);
    }
  };

  const exportCsv = () => {
    if (!prodiRows.length) return;
    const header = "Prodi;Fakultas;Maba;Sudah Lulus;KTW Strict;% KTW;% Survival\n";
    const rows = prodiRows
      .map(r => `"${r.nm_prodi}";"${fakultasRows.find(f => f.id_fakultas === r.id_fakultas)?.nm_fakultas ?? ""}";${r.maba};${r.sudah_lulus};${r.ktw_strict};${r.pct_ktw_strict.toFixed(2)};${r.pct_survival.toFixed(2)}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KTW_${jenjang}_${cohort}${selectedFakultas ? `_${selectedFakultas.nama.replace(/\s+/g, "_")}` : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ===== Chart data =====
  const trendData = useMemo(
    () => trend.map(t => ({ name: String(t.tahun ?? "-"), value: t.pct_ktw_strict })),
    [trend]
  );

  const fakultasChartData = useMemo(
    () => fakultasRows.map(f => ({ name: f.nm_fakultas, value: Number(f.pct_ktw_strict.toFixed(2)) })),
    [fakultasRows]
  );

  const topProdiChartData = useMemo(
    () => topProdi.map(p => ({ name: p.nm_prodi.length > 30 ? p.nm_prodi.slice(0, 28) + "…" : p.nm_prodi, value: Number(p.pct_ktw_strict.toFixed(2)) })),
    [topProdi]
  );

  const genderChartData = useMemo(
    () => genderRows.map(g => ({ name: g.nm_gender, value: g.ktw_strict })),
    [genderRows]
  );

  const statusChartData = useMemo(
    () => statusRows.map(s => ({ name: s.nm_status, value: s.jumlah })),
    [statusRows]
  );

  const jalurChartData = useMemo(
    () => jalurRows.map(j => ({ name: j.nm_jalur, value: Number(j.pct_ktw.toFixed(2)) })),
    [jalurRows]
  );

  const ikuPct = overview?.pct_ktw_strict ?? 0;

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiClock className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FiClock className="w-8 h-8 text-indigo-600" />
              Kelulusan Tepat Waktu (KTW)
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Analisa kelulusan tepat waktu per angkatan — drilldown universitas → fakultas → prodi → mahasiswa.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInfo(v => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200"
            >
              <FiInfo className="w-4 h-4" /> Info KTW
            </button>
            <button
              onClick={handleRefreshCache}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200"
            >
              <FiRefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={exportCsv}
              disabled={!prodiRows.length}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <FiDownload className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Info panel */}
        {showInfo && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-100 space-y-2">
            <p><strong>Definisi KTW:</strong> Mahasiswa lulus dengan masa studi ≤ masa normatif PDDIKTI (S1 ≤ 4 th, D3 ≤ 3 th, S2 ≤ 2 th, S3 ≤ 3 th).</p>
            <p><strong>Formula:</strong> <code className="rounded bg-white/70 px-1 dark:bg-slate-800/60">tgl_keluar − tgl_masuk_sp</code> (kalender, tidak exclude cuti).</p>
            <p><strong>Persentase:</strong> KTW / Maba (Peserta Didik Baru angkatan Gasal). Transfer/pindahan/alih jenjang tidak dihitung.</p>
            <p><strong>Sumber:</strong> {meta?.source ?? "pdut realtime (pdrd.kuliah_mhs)"}. Konsisten dengan infografis publik.</p>
          </div>
        )}

        {/* Filter — tailwind only, no HeroUI */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Filter Analisa</h2>
            {(cutoff || selectedFakultas || jenjang !== "S1" || cohort !== defaultCohort("S1")) && (
              <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                Reset filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Jenjang</label>
              <select
                value={jenjang}
                onChange={(e) => {
                  const j = e.target.value as JenjangKode;
                  setJenjang(j);
                  setCohort(defaultCohort(j));
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                {JENJANG_OPTIONS.map(j => (
                  <option key={j} value={j}>{j} — {MASA_MAP[j]} th normatif</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Tahun Angkatan</label>
              <select
                value={cohort}
                onChange={(e) => setCohort(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                {cohortOptions.map(y => (
                  <option key={y} value={y}>{y} → TW {y + MASA_MAP[jenjang]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Fakultas</label>
              <select
                value={selectedFakultas?.id ?? ""}
                onChange={(e) => {
                  if (!e.target.value) { setSelectedFakultas(null); return; }
                  const f = fakultasRows.find(r => r.id_fakultas === e.target.value);
                  if (f && f.id_fakultas) setSelectedFakultas({ id: f.id_fakultas, nama: f.nm_fakultas });
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Seluruh Fakultas</option>
                {fakultasRows.filter(f => f.id_fakultas).map(f => (
                  <option key={f.id_fakultas!} value={f.id_fakultas!}>{f.nm_fakultas}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Cutoff Tanggal <span className="font-normal text-slate-400">(snapshot)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={cutoff}
                  onChange={(e) => setCutoff(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
                <select
                  value=""
                  onChange={(e) => { if (e.target.value) setCutoff(e.target.value); }}
                  className="w-28 rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  title="Preset dari kalender akademik"
                >
                  <option value="">⚡ Preset</option>
                  {Array.from(new Set(presets.map(p => p.group))).map(group => (
                    <optgroup key={group} label={group}>
                      {presets.filter(p => p.group === group).map(p => (
                        <option key={p.value + p.label} value={p.value}>{p.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading && <DashboardSkeleton />}
        {error && <ErrorAlert message={error} onRetry={fetchAll} />}

        {!loading && !error && overview && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Maba Angkatan"
                value={overview.maba}
                subtitle={`Angkatan ${overview.tahun ?? cohort} (Gasal)`}
                icon={<FiUsers className="w-6 h-6 text-white" />}
                color="blue"
              />
              <StatCard
                title="Sudah Lulus"
                value={overview.sudah_lulus}
                subtitle={`${overview.pct_survival.toFixed(1)}% survival`}
                icon={<FiAward className="w-6 h-6 text-white" />}
                color="cyan"
              />
              <StatCard
                title="KTW (Strict)"
                value={overview.ktw_strict}
                subtitle={`≤ ${overview.masa_normatif_tahun} th normatif`}
                icon={<FiClock className="w-6 h-6 text-white" />}
                color={tierColor(overview.pct_ktw_strict)}
              />
              <StatCard
                title="% KTW"
                value={`${overview.pct_ktw_strict.toFixed(2)}%`}
                subtitle={overview.pct_ktw_strict >= 80 ? "Capai target IKU" : "Di bawah target 80%"}
                icon={<FiTrendingUp className="w-6 h-6 text-white" />}
                color={tierColor(overview.pct_ktw_strict)}
              />
            </div>

            {/* Row: Gauge IKU + Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Pencapaian vs Target IKU 80%</h3>
                </div>
                <div className="p-3">
                  <GaugeChart value={ikuPct} target={100} title="" color={ikuPct >= 80 ? "#10b981" : ikuPct >= 60 ? "#3b82f6" : ikuPct >= 40 ? "#f59e0b" : "#ef4444"} height={240} />
                </div>
              </div>
              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Trend 6 Angkatan Terakhir</h3>
                  <span className="text-xs text-slate-500">% KTW per angkatan</span>
                </div>
                <div className="p-3">
                  <LineChart data={trendData} color="#6366f1" height={240} valueFormatter={(v) => `${v.toFixed(1)}%`} />
                </div>
              </div>
            </div>

            {/* Cerita angkatan */}
            <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 p-5 dark:border-indigo-800 dark:from-indigo-900/30 dark:via-blue-900/30 dark:to-purple-900/30">
              <h3 className="mb-2 text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                📊 Cerita Angkatan {overview.tahun ?? cohort} {selectedFakultas ? `— ${selectedFakultas.nama}` : "— Universitas"}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <div>
                  <div className="text-xs text-indigo-700 dark:text-indigo-300">🎯 Tepat Waktu</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{overview.ktw_strict} mhs ({overview.pct_ktw_strict.toFixed(1)}%)</div>
                </div>
                <div>
                  <div className="text-xs text-indigo-700 dark:text-indigo-300">🎓 Lulus Terlambat</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{Math.max(overview.sudah_lulus - overview.ktw_strict, 0)} mhs</div>
                </div>
                <div>
                  <div className="text-xs text-indigo-700 dark:text-indigo-300">📚 Masih Aktif</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{overview.masih_aktif} mhs</div>
                </div>
                <div>
                  <div className="text-xs text-indigo-700 dark:text-indigo-300">🚪 Keluar Non-Lulus</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{overview.keluar_non_lulus} mhs</div>
                </div>
              </div>
            </div>

            {/* Row: Fakultas ranking + Top Prodi */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Ranking Fakultas</h3>
                    <p className="text-xs text-slate-500">Klik fakultas di tabel bawah untuk drilldown ke prodi</p>
                  </div>
                </div>
                <div className="p-3">
                  <BarChart data={fakultasChartData} horizontal={true} colors={["#6366f1"]} height={360} xAxisLabel="% KTW" />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Top 10 Prodi</h3>
                    <p className="text-xs text-slate-500">Prodi performa terbaik (% KTW)</p>
                  </div>
                </div>
                <div className="p-3">
                  <BarChart data={topProdiChartData} horizontal={true} colors={["#10b981"]} height={360} xAxisLabel="% KTW" />
                </div>
              </div>
            </div>

            {/* Fakultas table — drilldown */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tabel Fakultas</h3>
                <p className="text-xs text-slate-500">Klik baris untuk drilldown ke prodi di fakultas tersebut</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      <th className="px-4 py-3">Fakultas</th>
                      <th className="px-4 py-3 text-right">Maba</th>
                      <th className="px-4 py-3 text-right">Sudah Lulus</th>
                      <th className="px-4 py-3 text-right">KTW</th>
                      <th className="px-4 py-3 text-right">% KTW</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {fakultasRows.map(f => (
                      <tr
                        key={f.id_fakultas ?? f.nm_fakultas}
                        onClick={() => {
                          if (f.id_fakultas) setSelectedFakultas({ id: f.id_fakultas, nama: f.nm_fakultas });
                        }}
                        className={`cursor-pointer transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20 ${selectedFakultas?.id === f.id_fakultas ? "bg-indigo-50 dark:bg-indigo-900/30" : ""}`}
                      >
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{f.nm_fakultas}</td>
                        <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">{f.maba.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">{f.sudah_lulus.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">{f.ktw_strict.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${pctBadgeClass(f.pct_ktw_strict)}`}>
                            {f.pct_ktw_strict.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-400">
                          <FiChevronRight className="inline-block" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Prodi table — per selected fakultas atau all */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Tabel Prodi {selectedFakultas ? `— ${selectedFakultas.nama}` : "(semua fakultas)"}
                  </h3>
                  <p className="text-xs text-slate-500">Klik prodi untuk lihat daftar mahasiswa angkatan</p>
                </div>
                <span className="text-xs text-slate-500">{prodiRows.length} prodi</span>
              </div>
              <div className="max-h-[560px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/70">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      <th className="px-4 py-3">Prodi</th>
                      <th className="px-4 py-3 text-right">Maba</th>
                      <th className="px-4 py-3 text-right">Lulus</th>
                      <th className="px-4 py-3 text-right">KTW</th>
                      <th className="px-4 py-3 text-right">% KTW</th>
                      <th className="px-4 py-3 text-right">% Survival</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {prodiRows.map(p => (
                      <tr
                        key={p.id_prodi ?? p.nm_prodi}
                        onClick={() => openMahasiswa(p)}
                        className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      >
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                          {p.nm_prodi}
                          {p.kode_dikti && <span className="ml-2 text-xs text-slate-400">({p.kode_dikti})</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">{p.maba.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">{p.sudah_lulus.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">{p.ktw_strict.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${pctBadgeClass(p.pct_ktw_strict)}`}>
                            {p.pct_ktw_strict.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{p.pct_survival.toFixed(2)}%</td>
                      </tr>
                    ))}
                    {prodiRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Tidak ada prodi</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Breakdown charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Breakdown Status Keluar</h3>
                </div>
                <div className="p-3">
                  {statusChartData.length ? <PieChart data={statusChartData} donut height={260} /> : <div className="flex h-[260px] items-center justify-center text-xs text-slate-400">Tidak ada data</div>}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">KTW per Gender</h3>
                </div>
                <div className="p-3">
                  {genderChartData.length ? <PieChart data={genderChartData} height={260} colors={["#3b82f6", "#ec4899"]} /> : <div className="flex h-[260px] items-center justify-center text-xs text-slate-400">Tidak ada data</div>}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">% KTW per Jalur Daftar</h3>
                </div>
                <div className="p-3">
                  {jalurChartData.length ? <BarChart data={jalurChartData} horizontal colors={["#f59e0b"]} height={260} xAxisLabel="% KTW" /> : <div className="flex h-[260px] items-center justify-center text-xs text-slate-400">Tidak ada data</div>}
                </div>
              </div>
            </div>

            {/* Metadata footer */}
            {meta && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400 space-y-1">
                <div><strong>Sumber:</strong> {meta.source}</div>
                <div><strong>Formula:</strong> <code className="rounded bg-white px-1 dark:bg-slate-800">{meta.formula}</code></div>
                <div><strong>As of:</strong> {meta.as_of} • <strong>Masa normatif:</strong> {meta.masa_normatif_tahun} th • <strong>Tolerance:</strong> {meta.tolerance_tahun} th</div>
                {meta.note_cuti && <div className="italic">{meta.note_cuti}</div>}
              </div>
            )}
          </>
        )}
      </div>

      {/* Mahasiswa detail modal — pure tailwind */}
      {modalProdi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalProdi(null)}>
          <div
            className="w-full max-w-5xl rounded-xl bg-white shadow-2xl dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Mahasiswa Angkatan {cohort} — {modalProdi.nm_prodi}
                </h3>
                <p className="text-xs text-slate-500">
                  Maba: {modalProdi.maba} • KTW: {modalProdi.ktw_strict} ({modalProdi.pct_ktw_strict.toFixed(2)}%)
                </p>
              </div>
              <button onClick={() => setModalProdi(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto">
              {modalLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">Memuat...</div>
              ) : modalMhs.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-slate-400">Tidak ada data mahasiswa</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/70">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      <th className="px-4 py-3">NIM</th>
                      <th className="px-4 py-3">Nama</th>
                      <th className="px-4 py-3">Masuk</th>
                      <th className="px-4 py-3">Keluar</th>
                      <th className="px-4 py-3 text-right">IPK</th>
                      <th className="px-4 py-3 text-right">Masa (th)</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-center">KTW?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {modalMhs.map(m => (
                      <tr key={m.nim} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="px-4 py-2 font-mono text-xs text-slate-700 dark:text-slate-200">{m.nim}</td>
                        <td className="px-4 py-2 text-slate-800 dark:text-slate-100">{m.nama}</td>
                        <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">{m.tgl_masuk_sp}</td>
                        <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">{m.tgl_keluar ?? "-"}</td>
                        <td className="px-4 py-2 text-right text-slate-700 dark:text-slate-200">{m.ipk ?? "-"}</td>
                        <td className="px-4 py-2 text-right text-slate-700 dark:text-slate-200">{m.masa_mukim_tahun?.toFixed(2) ?? "-"}</td>
                        <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">{m.status_keluar}</td>
                        <td className="px-4 py-2 text-center">
                          {m.is_ktw_strict ? <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">✓</span> : <span className="text-slate-300">−</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {modalLast > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-slate-700">
                <div>Halaman {modalPage} dari {modalLast}</div>
                <div className="flex gap-2">
                  <button
                    disabled={modalPage <= 1 || modalLoading}
                    onClick={() => openMahasiswa(modalProdi, modalPage - 1)}
                    className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700"
                  >
                    « Sebelumnya
                  </button>
                  <button
                    disabled={modalPage >= modalLast || modalLoading}
                    onClick={() => openMahasiswa(modalProdi, modalPage + 1)}
                    className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700"
                  >
                    Selanjutnya »
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayoutWithDynamicMenu>
  );
}
