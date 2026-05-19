"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import {
  FiUsers,
  FiUserCheck,
  FiBriefcase,
  FiDollarSign,
  FiBookOpen,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";
import { MdDashboard, MdSchool } from "react-icons/md";
import Link from "next/link";
import { pimpinanMenuConfig } from "./config/menuConfig";
import {
  StatCard,
  LineChart,
  MultiLineChart,
  PieChart,
  BarChart,
  FilterPanel,
  DashboardSkeleton,
  ErrorAlert,
} from "./components";
import { useDashboardData, useDashboardReference } from "./hooks";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { BerandaData, Top5Item, AlertItem } from "./types";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import UnitFilter from "@/shared/components/data-unila/UnitFilter";
import { fmtRupiah } from "@/lib/utils/formatRupiah";
import mahasiswaDataService, { type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";

const APP_KEY = "dashboard-pimpinan";

export default function DashboardBerandaPage() {
  useRequireAuth();
  const [selectedSemesters, setSelectedSemesters] = useState<Set<string>>(new Set());
  // Role-based scoping (Dekan/Kaprodi auto-filter, Rektor bebas)
  const scope = useRoleBasedScope();
  const [unitItems, setUnitItems] = useState<string[]>([]);
  const unitFilterStr = unitItems.join(",");
  const [orgFilters, setOrgFilters] = useState<MahasiswaFilters | null>(null);

  useEffect(() => {
    mahasiswaDataService.getFilters({
      id_fakultas: scope.forcedFakultas || undefined,
      id_jurusan: scope.forcedJurusan || undefined,
    }).then(setOrgFilters).catch(console.error);
  }, [scope.forcedFakultas, scope.forcedJurusan]);

  const { semester, activeSemesters } = useDashboardReference();

  useEffect(() => {
    // Default selection = full Tahun Ajaran aktif (Ganjil + Genap), bukan cuma 1 semester.
    // Pendapatan UKT & metrik kumulatif TA jadi konsisten dgn akumulasi tahun ajaran.
    if (activeSemesters.length > 0 && selectedSemesters.size === 0) {
      const year = activeSemesters[0]?.substring(0, 4);
      if (year && /^\d{4}$/.test(year)) {
        setSelectedSemesters(new Set([`${year}1`, `${year}2`]));
      } else {
        setSelectedSemesters(new Set(activeSemesters));
      }
    }
  }, [activeSemesters]); // eslint-disable-line react-hooks/exhaustive-deps

  const semesterParam = Array.from(selectedSemesters).join(",");

  // U3 — Tahun Ajaran Quick Preset (derive 5 TA terakhir dari semester reference)
  const tahunAjaranOptions = useMemo(() => {
    if (!semester || semester.length === 0) return [] as Array<{ key: string; label: string; semesters: string[] }>;
    const yearSet = new Set<string>();
    (semester as Array<{ key: string }>).forEach((s) => {
      const y = String(s.key).substring(0, 4);
      if (/^\d{4}$/.test(y)) yearSet.add(y);
    });
    const years = Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a)).slice(0, 5);
    return years.map((y) => ({ key: y, label: `TA ${y}/${parseInt(y) + 1}`, semesters: [`${y}1`, `${y}2`] }));
  }, [semester]);

  const activeTA = useMemo(() => {
    const sels = Array.from(selectedSemesters);
    for (const opt of tahunAjaranOptions) {
      if (opt.semesters.every((s) => sels.includes(s)) && sels.length === opt.semesters.length) return opt.key;
    }
    return null;
  }, [tahunAjaranOptions, selectedSemesters]);

  const { data, loading, error, refetch } = useDashboardData<BerandaData>(
    ENDPOINTS.DASHBOARD_PIMPINAN.BERANDA,
    {
      semester: semesterParam,
      // Auto-scope ke fakultas/prodi user kalau Dekan/Kaprodi
      ...(scope.forcedFakultas && { fakultas: scope.forcedFakultas }),
      ...(scope.forcedProdi && { prodi: scope.forcedProdi }),
      ...(unitFilterStr && { unit_filter: unitFilterStr }),
    }
  );

  const handleReset = () => {
    setSelectedSemesters(new Set(activeSemesters));
    setUnitItems([]);
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 p-6 space-y-8">
        {/* Top Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-800 p-8 text-white shadow-xl">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <MdSchool className="w-10 h-10 text-yellow-400" />
                Dashboard Center
              </h1>
              <p className="text-blue-100 max-w-xl text-lg">
                Ringkasan eksekutif performa Universitas Lampung berdasarkan data real-time terintegrasi.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                <span className="text-sm font-medium text-blue-100">Periode Aktif</span>
                <p className="text-xl font-bold text-white">{Array.from(selectedSemesters).join(", ") || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scope Badge */}
        <ScopeBadge />

        {/* Tahun Ajaran Quick Preset (U3 — YoY comparison) */}
        {tahunAjaranOptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tahun Ajaran</span>
            {tahunAjaranOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSelectedSemesters(new Set(opt.semesters))}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeTA === opt.key
                    ? "bg-indigo-600 text-white ring-1 ring-indigo-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
            {activeTA && (
              <span className="ml-auto text-[10px] text-gray-500 dark:text-gray-400">YoY: stat card 'Pendapatan/Penelitian/Publikasi' tampilkan delta vs TA sebelumnya</span>
            )}
          </div>
        )}

        {/* Global Filter */}
        <div className="space-y-3">
          <FilterPanel
            semester={semester}
            selectedSemesters={selectedSemesters}
            onSemesterChange={setSelectedSemesters}
            showProdi={false}
            scopeBadge={scope.scopeName}
            onReset={handleReset}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700/50">
            <UnitFilter
              data={orgFilters}
              value={unitItems}
              onChange={(next) => setUnitItems(next)}
              forcedFakultas={scope.forcedFakultas || undefined}
              forcedJurusan={scope.forcedJurusan || undefined}
              forcedProdi={scope.forcedProdi || undefined}
            />
          </div>
        </div>

        {loading && <DashboardSkeleton />}
        {error && <ErrorAlert message={error} onRetry={refetch} />}

        {data && (
          <>
            {/* Key Metrics Grid - Executive Summary */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-blue-600" /> Indikator Utama
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-fr">
                <StatCard
                  title="Total Mahasiswa Aktif"
                  value={data.summaryStats.mahasiswa.active.toLocaleString('id-ID')}
                  icon={<FiUsers className="w-6 h-6 text-white" />}
                  color="blue"
                  trend={{ value: data.summaryStats.mahasiswa.trend ?? 0, label: "vs Semester Lalu" }}
                  description={`${data.summaryStats.mahasiswa.total.toLocaleString('id-ID')} Terdaftar`}
                  href="/dashboard/data-unila/mahasiswa?status=aktif"
                  hint="Klik untuk daftar mahasiswa aktif"
                />
                <StatCard
                  title="Total SDM"
                  value={data.summaryStats.sdm.total.toLocaleString('id-ID')}
                  icon={<FiUserCheck className="w-6 h-6 text-white" />}
                  color="green"
                  trend={{ value: data.summaryStats.sdm.trend ?? 0, label: "YoY" }}
                  description={`${data.summaryStats.sdm.dosen} Dosen, ${data.summaryStats.sdm.tendik} Tendik`}
                  href="/dashboard/data-unila/dosen"
                  hint="Klik untuk daftar dosen"
                />
                <StatCard
                  title="Pendapatan UKT"
                  value={fmtRupiah(data.summaryStats.keuangan.total)}
                  icon={<FiDollarSign className="w-6 h-6 text-white" />}
                  color="yellow"
                  trend={{ value: data.summaryStats.keuangan.trend ?? 0, label: "vs TA sebelumnya" }}
                  description={`Pendapatan SPP periode aktif`}
                  href="/dashboard/data-unila/keuangan/spp"
                  hint="Klik untuk detail pembayaran SPP"
                />
                <StatCard
                  title="Prodi Unggul/A"
                  value={`${data.summaryStats.akademik.prodi > 0 ? (data.summaryStats.akademik.akrUnggul / data.summaryStats.akademik.prodi * 100).toFixed(0) : 0}%`}
                  icon={<FiBriefcase className="w-6 h-6 text-white" />}
                  color="purple"
                  description={`${data.summaryStats.akademik.akrUnggul} dari ${data.summaryStats.akademik.prodi} Prodi`}
                  href="/dashboard/data-unila/akademik/akreditasi"
                  hint="Klik untuk daftar akreditasi prodi"
                />
              </div>
            </div>

            {/* Trend 5 Tahun (YoY) — 4 metric utama */}
            {data.trendYoY && data.trendYoY.years.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiTrendingUp className="text-violet-600" /> Trend 5 Tahun
                </h2>
                <Card className="shadow-md border-none">
                  <CardHeader className="flex justify-between p-5 pb-0">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">Perbandingan Year-over-Year</h3>
                      <p className="text-sm text-gray-500">
                        Mahasiswa Aktif, Guru Besar, Publikasi, Litabmas (Penelitian+Pengabdian), dan Akreditasi Unggul/A — {data.trendYoY.years[0]} s/d {data.trendYoY.years[data.trendYoY.years.length - 1]}
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <MultiLineChart
                      categories={data.trendYoY.years}
                      series={[
                        { name: "Mahasiswa Aktif", data: data.trendYoY.mahasiswa, color: "#3b82f6" },
                        { name: "Guru Besar", data: data.trendYoY.guruBesar, color: "#f43f5e" },
                        { name: "Publikasi", data: data.trendYoY.publikasi, color: "#8b5cf6" },
                        { name: "Litabmas", data: data.trendYoY.litabmas ?? [], color: "#f59e0b" },
                        { name: "Akreditasi Unggul/A", data: data.trendYoY.akreditasiUnggul, color: "#10b981" },
                      ]}
                      height={340}
                      logScale={true}
                    />
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 text-center">
                      Skala log untuk visibilitas seri kecil (GB, akreditasi). Hover untuk nilai absolut.
                    </p>
                  </CardBody>
                </Card>
              </div>
            )}

            {/* Top 5 Fakultas — 4 metric (klik → drill-down ke Data Unila) */}
            {data.top5Fakultas && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiTrendingUp className="text-emerald-600" /> Top 5 Fakultas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Top5Card
                    title="Top 5 Fakultas — Mahasiswa Aktif"
                    items={data.top5Fakultas.mahasiswa}
                    color="bg-blue-500"
                    hrefBuilder={(id) => `/dashboard/data-unila/mahasiswa?id_fakultas=${encodeURIComponent(id)}`}
                  />
                  <Top5Card
                    title="Top 5 Fakultas — Dosen"
                    items={data.top5Fakultas.dosen}
                    color="bg-rose-500"
                    hrefBuilder={(id) => `/dashboard/data-unila/dosen?id_fakultas=${encodeURIComponent(id)}`}
                  />
                  <Top5Card
                    title="Top 5 Fakultas — Publikasi (5 Tahun)"
                    items={data.top5Fakultas.publikasi}
                    color="bg-violet-500"
                    hrefBuilder={(id) => `/dashboard/data-unila/tridarma/publikasi?id_fakultas=${encodeURIComponent(id)}`}
                  />
                  <Top5Card
                    title="Top 5 Fakultas — Akreditasi Unggul/A"
                    items={data.top5Fakultas.akreditasiUnggul}
                    color="bg-emerald-500"
                    hrefBuilder={(id) => `/dashboard/data-unila/akademik/akreditasi?id_fakultas=${encodeURIComponent(id)}`}
                  />
                </div>
              </div>
            )}

            {/* Pusat Peringatan — Alert Center */}
            {data.alerts && Object.keys(data.alerts).length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FiAlertCircle className="text-amber-600" /> Pusat Peringatan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(data.alerts).map(([key, alert]) => (
                    <AlertCard key={key} alertKey={key} alert={alert} />
                  ))}
                </div>
              </div>
            )}

            {/* Charts Row 1: Demography & Quality */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Population Trend */}
              <Card className="lg:col-span-2 shadow-md border-none">
                <CardHeader className="flex justify-between p-5 pb-0">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Trend Populasi Mahasiswa</h3>
                    <p className="text-sm text-gray-500">Pertumbuhan jumlah mahasiswa aktif 5 tahun terakhir</p>
                  </div>
                  <Button size="sm" variant="light" color="primary">Lihat Detail</Button>
                </CardHeader>
                <CardBody>
                  <LineChart data={data.populasiTrend} height={300} color="#3b82f6" />
                </CardBody>
              </Card>

              {/* Accreditation Status */}
              <Card className="shadow-md border-none">
                <CardHeader className="p-5 pb-0">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Status Akreditasi</h3>
                    <p className="text-sm text-gray-500">Distribusi Peringkat Prodi</p>
                  </div>
                </CardHeader>
                <CardBody className="flex flex-col items-center justify-center">
                  <PieChart
                    data={data.akreditasiDist}
                    height={250}
                    donut={true}
                    colors={["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"]}
                  />
                  <div className="w-full mt-4 flex justify-between px-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Internasional</p>
                      <p className="text-lg font-bold text-purple-600">{data.summaryStats.akademik.akrInternasional}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Unggul</p>
                      <p className="text-lg font-bold text-green-600">{data.summaryStats.akademik.akrUnggul}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Charts Row 2: Distribution & Efficiency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mahasiswa per Fakultas */}
              <Card className="shadow-md border-none">
                <CardHeader className="p-5 pb-0">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Sebaran Mahasiswa per Fakultas</h3>
                </CardHeader>
                <CardBody>
                  <BarChart
                    data={data.fakultasData}
                    height={300}
                    horizontal={true}
                    colors={["#6366f1"]}
                  />
                </CardBody>
              </Card>

              {/* Key Notifications / Insights — REAL DATA dari trendYoY */}
              <Card className="shadow-md border-none bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
                <CardHeader className="p-5 pb-0 mb-2">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FiAlertCircle className="text-orange-500" /> Insights & Atensi
                  </h3>
                </CardHeader>
                <CardBody className="p-5 pt-0 space-y-4">
                  {(() => {
                    const trend = data.trendYoY;
                    const summary = data.summaryStats;
                    if (!trend || !summary) return null;
                    const insights: Array<{ tone: 'good'|'warn'|'info'; icon: React.ReactNode; title: string; desc: string }> = [];

                    // Insight 1: Mahasiswa trend (last 2 years YoY delta)
                    const mhs = trend.mahasiswa || [];
                    if (mhs.length >= 2) {
                      const curr = mhs[mhs.length - 1];
                      const prev = mhs[mhs.length - 2];
                      const delta = curr - prev;
                      const pct = prev > 0 ? ((delta / prev) * 100).toFixed(1) : '0';
                      const yearCurr = trend.years[trend.years.length - 1];
                      const yearPrev = trend.years[trend.years.length - 2];
                      insights.push({
                        tone: delta >= 0 ? 'good' : 'warn',
                        icon: <FiUsers />,
                        title: `Mahasiswa Aktif ${yearCurr}: ${curr.toLocaleString('id-ID')}`,
                        desc: `${delta >= 0 ? 'Naik' : 'Turun'} ${Math.abs(delta).toLocaleString('id-ID')} (${pct}%) dibanding ${yearPrev}.`,
                      });
                    }

                    // Insight 2: Guru Besar growth. "Saat ini" pakai canonical
                    // summaryStats.sdm.guruBesar (165) — trend latest dibatasi tahun
                    // sehingga bisa selisih dari canonical (GB diangkat tahun berjalan).
                    const gb = trend.guruBesar || [];
                    const gbNow = (summary as { sdm?: { guruBesar?: number } }).sdm?.guruBesar ?? gb[gb.length - 1] ?? 0;
                    if (gb.length >= 5) {
                      const first = gb[0];
                      const growth = first > 0 ? (((gbNow - first) / first) * 100).toFixed(0) : '0';
                      insights.push({
                        tone: 'good',
                        icon: <FiCheckCircle />,
                        title: `Guru Besar Tumbuh ${growth}%`,
                        desc: `Dari ${first} (${trend.years[0]}) menjadi ${gbNow} saat ini.`,
                      });
                    }

                    // Insight 3: Akreditasi Unggul progress
                    if (summary.akademik.prodi > 0) {
                      const pct = ((summary.akademik.akrUnggul / summary.akademik.prodi) * 100).toFixed(0);
                      insights.push({
                        tone: summary.akademik.akrUnggul / summary.akademik.prodi >= 0.5 ? 'good' : 'info',
                        icon: <FiBookOpen />,
                        title: `Prodi Unggul/A: ${summary.akademik.akrUnggul} dari ${summary.akademik.prodi}`,
                        desc: `${pct}% prodi Unila sudah peringkat Unggul/A. ${summary.akademik.prodi - summary.akademik.akrUnggul} prodi masih di bawah target.`,
                      });
                    }

                    // Insight 4: Publikasi trend
                    const pub = trend.publikasi || [];
                    if (pub.length >= 2) {
                      const curr = pub[pub.length - 1];
                      const prev = pub[pub.length - 2];
                      const delta = curr - prev;
                      const pct = prev > 0 ? ((delta / prev) * 100).toFixed(1) : '0';
                      const yearCurr = trend.years[trend.years.length - 1];
                      insights.push({
                        tone: delta >= 0 ? 'good' : 'warn',
                        icon: <FiTrendingUp />,
                        title: `Publikasi ${yearCurr}: ${curr.toLocaleString('id-ID')}`,
                        desc: `${delta >= 0 ? 'Naik' : 'Turun'} ${Math.abs(delta).toLocaleString('id-ID')} judul (${pct}%) dibanding tahun sebelumnya.`,
                      });
                    }

                    const toneClass = (t: 'good'|'warn'|'info') => t === 'good'
                      ? 'bg-green-100 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-300'
                      : t === 'warn'
                      ? 'bg-orange-100 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-300'
                      : 'bg-blue-100 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-300';
                    return (
                      <>
                        {insights.map((ins, i) => (
                          <div key={i} className="flex gap-4 items-start p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className={`p-2 ${toneClass(ins.tone)} rounded-full mt-1`}>{ins.icon}</div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200">{ins.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{ins.desc}</p>
                            </div>
                          </div>
                        ))}
                        {insights.length === 0 && (
                          <p className="text-sm text-gray-500 italic py-4 text-center">Belum ada insights tersedia.</p>
                        )}
                      </>
                    );
                  })()}
                </CardBody>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu >
  );
}

// =========================================================================
// Alert Card — Pusat Peringatan Pimpinan
// =========================================================================
function AlertCard({ alertKey, alert }: { alertKey: string; alert: AlertItem }) {
  // Severity-based tones
  const tones: Record<string, { bg: string; ring: string; text: string; badge: string; dotBg: string }> = {
    high:   { bg: "bg-rose-50 dark:bg-rose-500/5",     ring: "ring-rose-200 dark:ring-rose-500/30",     text: "text-rose-700 dark:text-rose-300",     badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",     dotBg: "bg-rose-500" },
    medium: { bg: "bg-amber-50 dark:bg-amber-500/5",   ring: "ring-amber-200 dark:ring-amber-500/30",   text: "text-amber-700 dark:text-amber-300",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300", dotBg: "bg-amber-500" },
    low:    { bg: "bg-sky-50 dark:bg-sky-500/5",       ring: "ring-sky-200 dark:ring-sky-500/30",       text: "text-sky-700 dark:text-sky-300",       badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",       dotBg: "bg-sky-500" },
  };
  const tone = tones[alert.severity] || tones.low;

  // Per-key icon (using react-icons set already imported at top)
  const icons: Record<string, React.ReactNode> = {
    akreditasi_expire:  <FiAlertCircle className="w-5 h-5" />,
    dosen_pensiun:      <FiUserCheck className="w-5 h-5" />,
    dosen_tanpa_nidn:   <FiUsers className="w-5 h-5" />,
    dosen_tanpa_jabfung: <FiBriefcase className="w-5 h-5" />,
  };

  return (
    <Link
      href={alert.link}
      className={`group relative block rounded-2xl ${tone.bg} ring-1 ring-inset ${tone.ring} p-5 transition-all hover:shadow-md hover:-translate-y-0.5`}
      title={`Lihat detail: ${alert.label}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${tone.badge} flex items-center justify-center shrink-0`}>
          {icons[alertKey] || <FiAlertCircle className="w-5 h-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tabular-nums ${tone.text}`}>
              {alert.count.toLocaleString("id-ID")}
            </span>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${tone.badge}`}>
              {alert.severity === "high" ? "Tinggi" : alert.severity === "medium" ? "Sedang" : "Rendah"}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1 leading-snug">
            {alert.label}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 inline-flex items-center gap-1 group-hover:underline">
            Lihat detail →
          </p>
        </div>
      </div>
    </Link>
  );
}

// =========================================================================
// Top 5 Card — horizontal bars, klik baris → drill-down ke Data Unila
// =========================================================================
function Top5Card({
  title,
  items,
  color,
  hrefBuilder,
}: {
  title: string;
  items: Top5Item[];
  color: string;
  hrefBuilder: (id: string) => string;
}) {
  const max = items.reduce((acc, it) => Math.max(acc, it.value), 0) || 1;
  return (
    <Card className="shadow-md border-none">
      <CardHeader className="p-5 pb-2">
        <h3 className="text-base font-bold text-gray-800 dark:text-white">{title}</h3>
      </CardHeader>
      <CardBody className="pt-0">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-6 text-center">Belum ada data</p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((it, idx) => {
              const pct = Math.max(4, Math.round((it.value / max) * 100));
              return (
                <li key={it.id_fak || idx}>
                  <Link
                    href={hrefBuilder(it.id_fak)}
                    className="group block hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-2 py-1.5 transition-colors"
                    title={`Lihat detail ${it.nm_fakultas}`}
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                        <span className="inline-block w-5 text-gray-400 font-mono">{idx + 1}.</span>
                        {it.nm_fakultas}
                      </span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-gray-900 dark:text-white shrink-0">
                        {it.value.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full ${color} group-hover:opacity-80 transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
