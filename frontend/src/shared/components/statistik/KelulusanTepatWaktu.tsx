"use client";

/**
 * KelulusanTepatWaktu — ringkasan general di halaman /infografis.
 *
 * Data source: /api/v1/ktw/* (cohort-based, konsisten dengan /infografis/ktw detail).
 * Default: S1 angkatan (tahun ini - 4).
 */

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import {
  ktwService,
  type KtwOverviewResponse,
  type KtwTrendResponse,
} from "@/lib/services/public/ktwService";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function KelulusanTepatWaktu() {
  const [overview, setOverview] = useState<KtwOverviewResponse | null>(null);
  const [trend, setTrend] = useState<KtwTrendResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const defaultCohort = currentYear - 4; // S1 normatif 4 tahun

  useEffect(() => {
    async function load() {
      try {
        const [ov, tr] = await Promise.all([
          ktwService.getOverview(defaultCohort, "S1", false),
          ktwService.getTrend("S1", defaultCohort - 5, defaultCohort),
        ]);
        setOverview(ov);
        setTrend(tr);
      } catch (e) {
        console.error("Kelulusan summary load error:", e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [defaultCohort]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const trendChartOption = useMemo(() => {
    if (!trend?.data || trend.data.length === 0) return {};
    const years = trend.data.map((d) => d.tahun).filter(Boolean);
    const ktw = trend.data.map((d) => d.pct_ktw_strict);
    const survival = trend.data.map((d) => d.pct_survival);
    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255,255,255,0.96)",
        borderColor: "#3b82f6",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;",
      },
      legend: { data: ["KTW", "Total Lulus"], bottom: 0, textStyle: { fontSize: 11, fontWeight: 600 } },
      grid: { left: 50, right: 30, top: 20, bottom: 50, containLabel: true },
      xAxis: {
        type: "category",
        data: years,
        axisLabel: { fontSize: 12, fontWeight: 600, color: "#1f2937" },
      },
      yAxis: {
        type: "value",
        max: 100,
        axisLabel: { formatter: "{value}%", fontSize: 10, color: "#6b7280" },
        splitLine: { lineStyle: { color: "#e5e7eb", type: "dashed" } },
      },
      series: [
        {
          name: "KTW",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 10,
          data: ktw,
          itemStyle: { color: "#3b82f6" },
          lineStyle: { width: 3 },
          areaStyle: { color: "rgba(59, 130, 246, 0.1)" },
          label: { show: true, position: "top", formatter: "{c}%", fontSize: 10, fontWeight: 600, color: "#3b82f6" },
        },
        {
          name: "Total Lulus",
          type: "line",
          smooth: true,
          symbol: "diamond",
          symbolSize: 8,
          data: survival,
          itemStyle: { color: "#8b5cf6" },
          lineStyle: { width: 2, type: "dashed" },
        },
      ],
    };
  }, [trend]);

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-white">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 sm:mb-3 pb-1 leading-relaxed px-2">
            Kelulusan Tepat Waktu
          </h2>
          <div className="flex items-center justify-center mb-2 sm:mb-3">
            <div className="h-0.5 sm:h-1 w-16 sm:w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-3">
            Ringkasan S1 angkatan {defaultCohort} — Peserta Didik Baru periode Gasal.
          </p>
        </motion.div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-200 animate-pulse rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 h-32" />
            ))}
          </div>
        )}

        {/* Stat Cards — match existing infografis style */}
        {overview && !isLoading && (
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 sm:mb-10">
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg">
              <div className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">✅</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-0.5 sm:mb-1">{overview.data.pct_ktw_strict.toFixed(1)}%</div>
              <div className="text-[10px] sm:text-xs md:text-sm font-semibold opacity-90">Kelulusan Tepat Waktu</div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg">
              <div className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">👨‍🎓</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-0.5 sm:mb-1">{overview.data.maba.toLocaleString("id-ID")}</div>
              <div className="text-[10px] sm:text-xs md:text-sm font-semibold opacity-90">Maba S1 Angkatan {defaultCohort}</div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg">
              <div className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">🎯</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-0.5 sm:mb-1">{overview.data.ktw_strict.toLocaleString("id-ID")}</div>
              <div className="text-[10px] sm:text-xs md:text-sm font-semibold opacity-90">Lulus Tepat Waktu ≤ {overview.data.masa_normatif_tahun}y</div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg">
              <div className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">📊</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-0.5 sm:mb-1">{overview.data.pct_survival.toFixed(1)}%</div>
              <div className="text-[10px] sm:text-xs md:text-sm font-semibold opacity-90">Total Lulus (Survival)</div>
            </motion.div>
          </motion.div>
        )}

        {/* Trend chart */}
        {trend && Object.keys(trendChartOption).length > 0 && (
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-blue-600">
              <h3 className="text-white font-bold text-base sm:text-lg">Trend KTW S1 — 6 Angkatan Terakhir</h3>
              <p className="text-blue-100 text-xs sm:text-sm">Persentase KTW &amp; Total Lulus untuk angkatan {defaultCohort - 5}-{defaultCohort} Gasal</p>
            </div>
            <div className="p-3 sm:p-4 md:p-6">
              <div className="h-[280px] sm:h-[320px] md:h-[360px]">
                <ReactECharts option={trendChartOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Info banner + CTA */}
        <motion.div variants={itemVariants} className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 text-sm text-blue-900">
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0">📊</div>
            <div>
              <strong>Ringkasan Umum.</strong> Data di atas adalah snapshot S1 angkatan {defaultCohort} (PDB Gasal) dari pdut realtime.
              Untuk drilldown per fakultas, prodi, jenjang lain (D3/S2/S3), filter cutoff, chart jalur masuk, status mahasiswa,
              top 10 prodi, pencapaian IKU, dan export data — klik tombol di bawah.
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/infografis/ktw"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Lihat Detail KTW
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
