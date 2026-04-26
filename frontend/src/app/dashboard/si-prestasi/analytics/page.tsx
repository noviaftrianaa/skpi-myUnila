"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import {
  FiAward, FiTrendingUp, FiUsers, FiBarChart2, FiRefreshCw, FiChevronRight, FiX,
  FiActivity, FiStar, FiDownload,
} from "react-icons/fi";
import { simPrestasiMenuConfig } from "../config/menuConfig";
import { StatCard, DashboardSkeleton, ErrorAlert } from "@/app/dashboard/pimpinan/components";
import { LineChart, BarChart, PieChart, HeatmapChart } from "@/app/dashboard/pimpinan/components/charts";
import {
  analyticsService,
  type AnalyticsTipe,
  type AnalyticsFilters,
  type Overview,
  type TrendRow,
  type ByLevel,
  type ByKategori,
  type ByPeringkat,
  type ByFakultas,
  type ByProdi,
  type TopMahasiswa,
  type WorkflowPipeline,
  type MatrixCell,
  type SyncHealth,
  type MahasiswaProdiRow,
} from "@/lib/services/si-prestasi/analyticsService";

const APP_KEY = "si-prestasi";

const TIPE_OPTIONS: { value: AnalyticsTipe; label: string }[] = [
  { value: "all",         label: "Semua Tipe" },
  { value: "prestasi",    label: "Prestasi Mandiri" },
  { value: "sertifikasi", label: "Sertifikasi" },
  { value: "rekognisi",   label: "Rekognisi" },
];

function badgePctClass(pct: number): string {
  if (pct >= 80) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
  if (pct >= 60) return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200";
  if (pct >= 40) return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
  return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200";
}

function statusColor(s: string): string {
  switch (s) {
    case "draft":    return "bg-slate-100 text-slate-700";
    case "review":   return "bg-yellow-100 text-yellow-800";
    case "ready":    return "bg-blue-100 text-blue-800";
    case "sending":  return "bg-cyan-100 text-cyan-800";
    case "sent":     return "bg-emerald-100 text-emerald-800";
    case "error":    return "bg-rose-100 text-rose-800";
    case "archived": return "bg-zinc-200 text-zinc-700";
    default:         return "bg-slate-100 text-slate-700";
  }
}

export default function AnalyticsSiPrestasiPage() {
  useRequireAuth();

  const thisYear = new Date().getFullYear();

  // ===== Filters =====
  const [tahun, setTahun] = useState<number | "">("");
  const [tipe, setTipe] = useState<AnalyticsTipe>("all");
  const [selectedFakultas, setSelectedFakultas] = useState<{ id: string; nama: string } | null>(null);

  // ===== Data =====
  const [overview, setOverview] = useState<Overview | null>(null);
  const [trend, setTrend] = useState<TrendRow[]>([]);
  const [byLevel, setByLevel] = useState<ByLevel[]>([]);
  const [byKategori, setByKategori] = useState<ByKategori[]>([]);
  const [byPeringkat, setByPeringkat] = useState<ByPeringkat[]>([]);
  const [byFakultas, setByFakultas] = useState<ByFakultas[]>([]);
  const [byProdi, setByProdi] = useState<ByProdi[]>([]);
  const [topMhs, setTopMhs] = useState<TopMahasiswa[]>([]);
  const [workflow, setWorkflow] = useState<WorkflowPipeline[]>([]);
  const [matrix, setMatrix] = useState<MatrixCell[]>([]);
  const [sync, setSync] = useState<SyncHealth | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ===== Modal mahasiswa detail =====
  const [modalProdi, setModalProdi] = useState<ByProdi | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalRows, setModalRows] = useState<MahasiswaProdiRow[]>([]);
  const [modalPage, setModalPage] = useState(1);
  const [modalLast, setModalLast] = useState(1);

  const filters: AnalyticsFilters = useMemo(() => ({
    ...(tahun ? { tahun: Number(tahun) } : {}),
    ...(tipe !== "all" ? { tipe } : {}),
    ...(selectedFakultas ? { id_fakultas: selectedFakultas.id } : {}),
  }), [tahun, tipe, selectedFakultas]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, tr, lvl, kat, pkt, fak, prd, top, wf, mtx, sh] = await Promise.all([
        analyticsService.overview(filters),
        analyticsService.trend(5),
        analyticsService.byLevel(filters),
        analyticsService.byKategori(filters),
        analyticsService.byPeringkat(filters),
        analyticsService.byFakultas(filters),
        analyticsService.byProdi(filters),
        analyticsService.topMahasiswa(filters, 10),
        analyticsService.workflowPipeline(filters),
        analyticsService.matrixKategoriLevel(filters),
        analyticsService.syncHealth(),
      ]);
      setOverview(ov);
      setTrend(tr);
      setByLevel(lvl);
      setByKategori(kat);
      setByPeringkat(pkt);
      setByFakultas(fak);
      setByProdi(prd);
      setTopMhs(top);
      setWorkflow(wf);
      setMatrix(mtx);
      setSync(sh);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal memuat data analytics";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tahun, tipe, selectedFakultas]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await analyticsService.refreshCache();
      await fetchAll();
    } finally {
      setRefreshing(false);
    }
  };

  const handleReset = () => {
    setTahun("");
    setTipe("all");
    setSelectedFakultas(null);
  };

  const openMahasiswa = async (prodi: ByProdi, page = 1) => {
    setModalProdi(prodi);
    setModalLoading(true);
    setModalPage(page);
    try {
      const r = await analyticsService.mahasiswaProdi(prodi.id_sms_pdut, filters, page, 50);
      setModalRows(r.data);
      setModalLast(r.last_page);
    } catch {
      setModalRows([]);
    } finally {
      setModalLoading(false);
    }
  };

  // ===== Chart data transforms =====
  const trendChartData = useMemo(() => {
    const out: { name: string; value: number; category: string }[] = [];
    for (const t of trend) {
      out.push({ name: String(t.tahun), value: t.prestasi,    category: "Prestasi" });
      out.push({ name: String(t.tahun), value: t.sertifikasi, category: "Sertifikasi" });
      out.push({ name: String(t.tahun), value: t.rekognisi,   category: "Rekognisi" });
    }
    return out;
  }, [trend]);

  const byTipeChartData = useMemo(() => {
    if (!overview) return [];
    return [
      { name: "Prestasi Mandiri", value: overview.prestasi },
      { name: "Sertifikasi",      value: overview.sertifikasi },
      { name: "Rekognisi",        value: overview.rekognisi },
    ];
  }, [overview]);

  const byLevelChartData = useMemo(() => byLevel.map(l => ({ name: l.nama, value: l.jumlah })), [byLevel]);
  const byKategoriChartData = useMemo(() => byKategori.map(k => ({ name: k.nama, value: k.jumlah })), [byKategori]);
  const byPeringkatChartData = useMemo(() => byPeringkat.map(p => ({ name: p.nama, value: p.skor })), [byPeringkat]);
  const byFakultasChartData = useMemo(() => byFakultas.map(f => ({ name: f.nm_fakultas, value: f.jumlah })), [byFakultas]);
  const workflowChartData = useMemo(() => workflow.map(w => ({ name: w.status, value: w.jumlah })), [workflow]);

  const heatmapData = useMemo(() => {
    return matrix.map(c => ({ x: c.level, y: c.kategori, value: c.jumlah }));
  }, [matrix]);

  const exportCsv = () => {
    if (!byFakultas.length) return;
    const header = "Fakultas;Total Prestasi\n";
    const rows = byFakultas.map(f => `"${f.nm_fakultas}";${f.jumlah}`).join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", `prestasi_per_fakultas_${tahun || "all"}.csv`);
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 200);
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI Prestasi"
      appIcon={<FiAward className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={simPrestasiMenuConfig}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FiBarChart2 className="w-8 h-8 text-indigo-600" />
              Analytics Pimpinan — SI Prestasi
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Capaian prestasi mahasiswa &amp; pelaporan SIMKATMAWA — drilldown universitas → fakultas → prodi → mahasiswa.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200"
            >
              <FiRefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh Cache
            </button>
            <button
              onClick={exportCsv}
              disabled={!byFakultas.length}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <FiDownload className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Filter Analisa</h2>
            {(tahun || tipe !== "all" || selectedFakultas) && (
              <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                Reset filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Tahun Prestasi</label>
              <select
                value={tahun}
                onChange={(e) => setTahun(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Semua Tahun</option>
                {Array.from({ length: 6 }, (_, i) => thisYear - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Tipe Pelaporan</label>
              <select
                value={tipe}
                onChange={(e) => setTipe(e.target.value as AnalyticsTipe)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                {TIPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Fakultas</label>
              <select
                value={selectedFakultas?.id ?? ""}
                onChange={(e) => {
                  if (!e.target.value) { setSelectedFakultas(null); return; }
                  const f = byFakultas.find(r => r.id_fakultas === e.target.value);
                  if (f) setSelectedFakultas({ id: f.id_fakultas, nama: f.nm_fakultas });
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Seluruh Fakultas</option>
                {byFakultas.map(f => <option key={f.id_fakultas} value={f.id_fakultas}>{f.nm_fakultas}</option>)}
              </select>
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
                title="Total Pelaporan"
                value={overview.total}
                subtitle={`${overview.prestasi} + ${overview.sertifikasi} + ${overview.rekognisi}`}
                icon={<FiAward className="w-6 h-6 text-white" />}
                color="indigo"
              />
              <StatCard
                title="Prestasi Mandiri"
                value={overview.prestasi}
                subtitle="Lomba/kompetisi mahasiswa"
                icon={<FiTrendingUp className="w-6 h-6 text-white" />}
                color="blue"
              />
              <StatCard
                title="Sertifikasi + Rekognisi"
                value={overview.sertifikasi + overview.rekognisi}
                subtitle={`${overview.sertifikasi} sertifikasi · ${overview.rekognisi} rekognisi`}
                icon={<FiStar className="w-6 h-6 text-white" />}
                color="purple"
              />
              <StatCard
                title="Skor Bobot"
                value={overview.skor_bobot.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                subtitle="Σ peringkat × jml peserta"
                icon={<FiBarChart2 className="w-6 h-6 text-white" />}
                color="green"
              />
            </div>

            {/* Sync health card */}
            {sync && (
              <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 dark:border-emerald-800 dark:from-emerald-900/30 dark:to-teal-900/30">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FiActivity className="w-7 h-7 text-emerald-600" />
                    <div>
                      <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Status Sinkronisasi SIMKATMAWA</h3>
                      <p className="text-xs text-emerald-700 dark:text-emerald-200">Pengiriman pelaporan ke kemdiktisaintek</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-xs text-emerald-700 dark:text-emerald-300">Berhasil</div>
                      <div className="font-semibold text-emerald-900 dark:text-emerald-100">{sync.success} / {sync.total}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-emerald-700 dark:text-emerald-300">Success Rate</div>
                      <div className="font-semibold">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${badgePctClass(sync.success_pct)}`}>
                          {sync.success_pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-emerald-700 dark:text-emerald-300">Avg Retry</div>
                      <div className="font-semibold text-emerald-900 dark:text-emerald-100">{sync.avg_retry.toFixed(1)}x</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-emerald-700 dark:text-emerald-300">Last Sync</div>
                      <div className="font-semibold text-emerald-900 dark:text-emerald-100">
                        {sync.last_at ? new Date(sync.last_at).toLocaleString("id-ID") : "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Row: Trend + Komposisi */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Trend 5 Tahun (Stacked)</h3>
                  <p className="text-xs text-slate-500">Jumlah pelaporan per tipe per tahun</p>
                </div>
                <div className="p-3">
                  <BarChart data={trendChartData} stacked colors={["#6366f1", "#10b981", "#f59e0b"]} height={300} />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Komposisi Tipe</h3>
                </div>
                <div className="p-3">
                  {byTipeChartData.length ? <PieChart data={byTipeChartData} donut height={300} colors={["#6366f1", "#10b981", "#f59e0b"]} /> : <div className="flex h-[300px] items-center justify-center text-xs text-slate-400">Belum ada data</div>}
                </div>
              </div>
            </div>

            {/* Row: Level + Kategori + Peringkat */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Per Level (Tingkat)</h3>
                  <p className="text-xs text-slate-500">KAB → PROV → NAS → INT</p>
                </div>
                <div className="p-3">
                  <BarChart data={byLevelChartData} colors={["#3b82f6"]} height={260} />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Per Kategori</h3>
                  <p className="text-xs text-slate-500">RISNOV / SENBUD / OLAHRAGA / dst — prestasi mandiri</p>
                </div>
                <div className="p-3">
                  <BarChart data={byKategoriChartData} colors={["#a855f7"]} height={260} />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Skor per Peringkat</h3>
                  <p className="text-xs text-slate-500">Σ bobot × jumlah peserta</p>
                </div>
                <div className="p-3">
                  <BarChart data={byPeringkatChartData} colors={["#f59e0b"]} height={260} />
                </div>
              </div>
            </div>

            {/* Row: Heatmap + Workflow */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Heatmap Kategori × Level</h3>
                  <p className="text-xs text-slate-500">Sebaran prestasi mandiri</p>
                </div>
                <div className="p-3">
                  {heatmapData.length ? (
                    <HeatmapChart data={heatmapData} height={300} />
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-xs text-slate-400">Belum ada data</div>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Pipeline Workflow</h3>
                  <p className="text-xs text-slate-500">Sebaran status pelaporan: draft → review → ready → sent</p>
                </div>
                <div className="p-3">
                  <BarChart data={workflowChartData} horizontal colors={["#6366f1"]} height={300} />
                </div>
              </div>
            </div>

            {/* Fakultas Drilldown */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Sebaran Fakultas {selectedFakultas ? `— filter: ${selectedFakultas.nama}` : ""}
                  </h3>
                  <p className="text-xs text-slate-500">Klik baris fakultas untuk drilldown ke prodi</p>
                </div>
                <span className="text-xs text-slate-500">{byFakultas.length} fakultas</span>
              </div>
              {byFakultas.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-400">Belum ada data fakultas</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-3 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700">
                    <BarChart data={byFakultasChartData} horizontal colors={["#10b981"]} height={Math.max(300, byFakultas.length * 32)} />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                          <th className="px-4 py-3">Fakultas</th>
                          <th className="px-4 py-3 text-right">Jumlah</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {byFakultas.map(f => (
                          <tr
                            key={f.id_fakultas}
                            onClick={() => setSelectedFakultas({ id: f.id_fakultas, nama: f.nm_fakultas })}
                            className={`cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 ${selectedFakultas?.id === f.id_fakultas ? "bg-indigo-50 dark:bg-indigo-900/30" : ""}`}
                          >
                            <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{f.nm_fakultas}</td>
                            <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">{f.jumlah.toLocaleString("id-ID")}</td>
                            <td className="px-4 py-3 text-right text-slate-400"><FiChevronRight /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Prodi Drilldown */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Sebaran Prodi {selectedFakultas ? `— ${selectedFakultas.nama}` : "(seluruh fakultas)"}
                  </h3>
                  <p className="text-xs text-slate-500">Klik prodi untuk lihat daftar mahasiswa berprestasi</p>
                </div>
                <span className="text-xs text-slate-500">{byProdi.length} prodi</span>
              </div>
              <div className="max-h-[500px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/70">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      <th className="px-4 py-3">Prodi</th>
                      <th className="px-4 py-3 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {byProdi.map(p => (
                      <tr key={p.id_sms_pdut} onClick={() => openMahasiswa(p)} className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{p.nm_prodi}</td>
                        <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">{p.jumlah.toLocaleString("id-ID")}</td>
                      </tr>
                    ))}
                    {byProdi.length === 0 && (
                      <tr><td colSpan={2} className="px-4 py-8 text-center text-slate-400">Belum ada prodi tercatat</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Mahasiswa */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Top 10 Mahasiswa Berprestasi</h3>
                <p className="text-xs text-slate-500">Mahasiswa dengan jumlah pelaporan terbanyak</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">NIM</th>
                      <th className="px-4 py-3">Nama</th>
                      <th className="px-4 py-3">Prodi</th>
                      <th className="px-4 py-3 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {topMhs.map((m, i) => (
                      <tr key={m.nim} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-200">{m.nim}</td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{m.nm_mahasiswa}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{m.nm_prodi ?? "-"}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                            {m.jumlah}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {topMhs.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Belum ada mahasiswa tercatat</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer note */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400 space-y-1">
              <div><strong>Sumber:</strong> Postgres si_prestasi (realtime) + ref tables sync PDDIKTI/SIMKATMAWA</div>
              <div><strong>Cache:</strong> Redis 5 menit per kombinasi filter (klik Refresh untuk invalidate)</div>
              <div><strong>Drilldown:</strong> Universitas → Fakultas (klik) → Prodi (klik) → Mahasiswa modal</div>
            </div>
          </>
        )}
      </div>

      {/* Modal mahasiswa detail */}
      {modalProdi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalProdi(null)}>
          <div className="w-full max-w-5xl rounded-xl bg-white shadow-2xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pelaporan Prestasi — {modalProdi.nm_prodi}</h3>
                <p className="text-xs text-slate-500">Total: {modalProdi.jumlah} pelaporan</p>
              </div>
              <button onClick={() => setModalProdi(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto">
              {modalLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">Memuat...</div>
              ) : modalRows.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-slate-400">Tidak ada data</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/70">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      <th className="px-4 py-3">NIM</th>
                      <th className="px-4 py-3">Nama</th>
                      <th className="px-4 py-3">Tipe</th>
                      <th className="px-4 py-3">Judul</th>
                      <th className="px-4 py-3 text-right">Tahun</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {modalRows.map((r, i) => (
                      <tr key={`${r.nim}-${r.id_parent}-${i}`} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                        <td className="px-4 py-2 font-mono text-xs text-slate-700 dark:text-slate-200">{r.nim}</td>
                        <td className="px-4 py-2 text-slate-800 dark:text-slate-100">{r.nm_mahasiswa}</td>
                        <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">{r.parent_tipe}</td>
                        <td className="px-4 py-2 text-slate-800 dark:text-slate-100">{r.judul}</td>
                        <td className="px-4 py-2 text-right text-slate-700 dark:text-slate-200">{r.thn_prestasi}</td>
                        <td className="px-4 py-2"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor(r.status_workflow)}`}>{r.status_workflow}</span></td>
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
                  <button disabled={modalPage <= 1 || modalLoading} onClick={() => openMahasiswa(modalProdi, modalPage - 1)} className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700">« Sebelumnya</button>
                  <button disabled={modalPage >= modalLast || modalLoading} onClick={() => openMahasiswa(modalProdi, modalPage + 1)} className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-700">Selanjutnya »</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayoutWithDynamicMenu>
  );
}
