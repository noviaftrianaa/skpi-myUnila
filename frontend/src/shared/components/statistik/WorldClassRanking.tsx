"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function WorldClassRanking() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Data ranking per tahun
  const rankingData = {
    years: ["2020", "2021", "2022", "2023", "2024"],
    greenMetric: [285, 268, 245, 228, 215],
    qsWorld: [1201, 1185, 1150, 1120, 1095],
    timesHigher: [1001, 985, 950, 920, 895],
    webometrics: [3250, 3120, 2985, 2850, 2715],
  };

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
  }), []);

  return (
    <section className="py-20 bg-white relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
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
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              {
                name: "Green Metric",
                rank: 215,
                change: -13,
                icon: "🌱",
                gradient: "from-emerald-500 to-emerald-600",
                desc: "UI GreenMetric World University Ranking"
              },
              {
                name: "QS World",
                rank: 1095,
                change: -25,
                icon: "🌏",
                gradient: "from-blue-500 to-blue-600",
                desc: "QS World University Rankings"
              },
              {
                name: "Times Higher Ed.",
                rank: 895,
                change: -25,
                icon: "🎓",
                gradient: "from-purple-500 to-purple-600",
                desc: "Times Higher Education Ranking"
              },
              {
                name: "Webometrics",
                rank: 2715,
                change: -135,
                icon: "🌐",
                gradient: "from-amber-500 to-amber-600",
                desc: "Webometrics Ranking of World Universities"
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`bg-gradient-to-br ${item.gradient} rounded-xl p-6 text-white shadow-lg relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 text-8xl opacity-10 -mt-4 -mr-4">{item.icon}</div>
                <div className="relative z-10">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="text-sm font-semibold opacity-90 mb-2">{item.name}</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-bold">#{item.rank}</div>
                    <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      {Math.abs(item.change)}
                    </div>
                  </div>
                  <div className="text-xs opacity-75 mt-2">{item.desc}</div>
                </div>
              </motion.div>
            ))}
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
              <div className="text-3xl">📈</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Peningkatan Konsisten</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Universitas Lampung menunjukkan tren positif dengan peningkatan peringkat yang konsisten di semua ranking universitas dunia.
                  Pencapaian ini mencerminkan komitmen institusi dalam meningkatkan kualitas pendidikan, penelitian, dan keberlanjutan lingkungan.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
