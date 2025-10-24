"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import { dashboardService } from "@/lib/services/dashboardService";
import type { Ranking, ChartDataCategory } from "@/lib/types/dashboardTypes";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function WorldClassRanking() {
  const [latestRankings, setLatestRankings] = useState<Ranking[]>([]);
  const [chartCategories, setChartCategories] = useState<ChartDataCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Fetch ranking data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch latest rankings and chart data
        const [latestResponse, chartResponse] = await Promise.all([
          dashboardService.getLatestRankings(),
          dashboardService.getChartData(2020, 2025), // Last 5 years
        ]);

        if (latestResponse.success && latestResponse.data?.rankings) {
          setLatestRankings(latestResponse.data.rankings);
        } else {
          setLatestRankings([]);
        }

        if (chartResponse.success && chartResponse.data?.categories) {
          setChartCategories(chartResponse.data.categories);
        } else {
          setChartCategories([]);
        }
      } catch (error) {
        console.error('Failed to fetch ranking data:', error);
        // Set empty array to prevent undefined state
        setLatestRankings([]);
        setChartCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform chart data for ECharts
  const rankingData = useMemo(() => {
    if (chartCategories.length === 0) {
      return {
        years: [],
        greenMetric: [],
        qsWorld: [],
        timesHigher: [],
        webometrics: [],
      };
    }

    // Get all unique years sorted
    const allYears = new Set<string>();
    chartCategories.forEach(cat => {
      cat.data.forEach(d => allYears.add(d.year));
    });
    const years = Array.from(allYears).sort();

    // Helper to get data for category
    const getCategoryData = (code: string) => {
      const category = chartCategories.find(c => c.category.code === code);
      if (!category) return [];

      return years.map(year => {
        const item = category.data.find(d => d.year === year);
        return item?.world_rank_numeric || null;
      });
    };

    return {
      years,
      greenMetric: getCategoryData('greenmetric'),
      qsWorld: getCategoryData('qs'),
      timesHigher: getCategoryData('the'),
      webometrics: getCategoryData('webometrics'),
    };
  }, [chartCategories]);

  // Chart configuration
  const chartOption = useMemo(() => ({
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#3b82f6",
      borderWidth: 1,
      extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
    },
    legend: {
      data: ["Green Metric", "QS World", "Times Higher Ed.", "Webometrics"],
      bottom: "0%",
      textStyle: {
        fontSize: 11,
        fontWeight: 600,
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "12%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: rankingData.years,
      axisLabel: {
        color: "#1f2937",
        fontSize: 12,
        fontWeight: 600,
      },
    },
    yAxis: {
      type: "value",
      inverse: true,
      axisLabel: {
        formatter: "#{value}",
        color: "#6b7280",
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: "#e5e7eb",
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "Green Metric",
        type: "line",
        data: rankingData.greenMetric,
        smooth: true,
        symbolSize: 8,
        itemStyle: {
          color: "#10b981",
        },
        lineStyle: {
          width: 3,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16, 185, 129, 0.3)" },
              { offset: 1, color: "rgba(16, 185, 129, 0.05)" },
            ],
          },
        },
      },
      {
        name: "QS World",
        type: "line",
        data: rankingData.qsWorld,
        smooth: true,
        symbolSize: 8,
        itemStyle: {
          color: "#3b82f6",
        },
        lineStyle: {
          width: 3,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59, 130, 246, 0.3)" },
              { offset: 1, color: "rgba(59, 130, 246, 0.05)" },
            ],
          },
        },
      },
      {
        name: "Times Higher Ed.",
        type: "line",
        data: rankingData.timesHigher,
        smooth: true,
        symbolSize: 8,
        itemStyle: {
          color: "#8b5cf6",
        },
        lineStyle: {
          width: 3,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(139, 92, 246, 0.3)" },
              { offset: 1, color: "rgba(139, 92, 246, 0.05)" },
            ],
          },
        },
      },
      {
        name: "Webometrics",
        type: "line",
        data: rankingData.webometrics,
        smooth: true,
        symbolSize: 8,
        itemStyle: {
          color: "#f59e0b",
        },
        lineStyle: {
          width: 3,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(245, 158, 11, 0.3)" },
              { offset: 1, color: "rgba(245, 158, 11, 0.05)" },
            ],
          },
        },
      },
    ],
  }), [rankingData]);

  return (
    <section className="py-20 bg-white relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 pb-1 leading-relaxed">
              World Class University Ranking
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Pencapaian Universitas Lampung di berbagai ranking universitas dunia
            </p>
          </motion.div>

          {/* Current Rankings */}
          <motion.div
            key={`rankings-${latestRankings.length}-${loading}`}
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {loading ? (
              // Loading skeleton
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 rounded-xl p-6 animate-pulse">
                  <div className="h-8 w-8 bg-gray-300 rounded mb-3"></div>
                  <div className="h-4 w-20 bg-gray-300 rounded mb-2"></div>
                  <div className="h-10 w-24 bg-gray-300 rounded"></div>
                </div>
              ))
            ) : latestRankings && latestRankings.length > 0 ? (
              latestRankings.map((ranking, index) => {
                // Map category code to icon and gradient
                const categoryMeta: Record<string, { icon: string; gradient: string }> = {
                  greenmetric: { icon: "🌱", gradient: "from-emerald-500 to-emerald-600" },
                  qs: { icon: "🌏", gradient: "from-blue-500 to-blue-600" },
                  the: { icon: "🎓", gradient: "from-purple-500 to-purple-600" },
                  webometrics: { icon: "🌐", gradient: "from-amber-500 to-amber-600" },
                };

                const meta = categoryMeta[ranking.category.code] || { icon: "🏆", gradient: "from-gray-500 to-gray-600" };

                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className={`bg-gradient-to-br ${meta.gradient} rounded-xl p-6 text-white shadow-lg relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 text-8xl opacity-10 -mt-4 -mr-4">{meta.icon}</div>
                    <div className="relative z-10">
                      <div className="text-3xl mb-3">{meta.icon}</div>
                      <div className="text-sm font-semibold opacity-90 mb-2">{ranking.category.name}</div>
                      <div className="text-xs opacity-75 mb-2">
                        {ranking.year} {ranking.period && `(${ranking.period})`}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-4xl font-bold">#{ranking.ranks.world}</div>
                      </div>
                      {ranking.ranks.national && (
                        <div className="text-xs opacity-75 mt-2">National Rank: #{ranking.ranks.national}</div>
                      )}
                      <div className="text-xs opacity-75 mt-1">{ranking.category.full_name}</div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              // No data fallback
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>Data ranking belum tersedia</p>
              </div>
            )}
          </motion.div>

          {/* Chart */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 bg-blue-600">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Tren Peringkat 5 Tahun Terakhir
              </h3>
            </div>
            <div className="p-6">
              <div className="h-[400px]">
                <ReactECharts
                  option={chartOption}
                  style={{ height: "100%", width: "100%" }}
                  opts={{ renderer: "svg" }}
                />
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div variants={itemVariants} className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="text-3xl">📊</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Prestasi Ranking Universitas Dunia</h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  Universitas Lampung menunjukkan komitmen kuat dalam peningkatan kualitas dengan meraih berbagai prestasi di ranking universitas dunia:
                </p>
                <ul className="text-sm text-gray-600 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span><strong>UI GreenMetric 2024:</strong> Peringkat 13 nasional dari 183 universitas di Indonesia, fokus pada keberlanjutan lingkungan dan kampus hijau</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span><strong>QS World 2025:</strong> Ranking 1401+ dunia, masuk 3 besar universitas terbaik di Sumatra</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold mt-0.5">•</span>
                    <span><strong>Times Higher Ed. 2024:</strong> Top 1500 dunia dari 1.904 universitas di 108 negara, peringkat 16 terbaik di Indonesia</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold mt-0.5">•</span>
                    <span><strong>Webometrics 2025:</strong> Ranking 1588 dunia, peringkat 17 nasional, PTN nomor 1 di luar Pulau Jawa berdasarkan web presence</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
