"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function KelulusanTepatWaktu() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Data kelulusan tepat waktu per tahun
  const kelulusanData = {
    years: ["2020", "2021", "2022", "2023", "2024"],
    tepatWaktu: [72, 75, 78, 81, 84],
    terlambat1Tahun: [18, 16, 14, 12, 10],
    terlambat2Tahun: [10, 9, 8, 7, 6],
  };

  // Data masa studi dan IPK
  const masaStudiIPKData = [
    { kategori: "< 3.5 Tahun", jumlah: 245, avgIPK: 3.65 },
    { kategori: "3.5 - 4 Tahun", jumlah: 856, avgIPK: 3.52 },
    { kategori: "4 - 4.5 Tahun", jumlah: 512, avgIPK: 3.38 },
    { kategori: "4.5 - 5 Tahun", jumlah: 234, avgIPK: 3.25 },
    { kategori: "> 5 Tahun", jumlah: 128, avgIPK: 3.15 },
  ];

  // Chart kelulusan tepat waktu
  const kelulusanChartOption = useMemo(() => ({
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#3b82f6",
      borderWidth: 1,
      extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      formatter: (params: any) => {
        let result = `<div style="padding: 8px;"><div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`;
        params.forEach((param: any) => {
          result += `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: ${param.color};"></div>
            <span style="font-weight: 600;">${param.seriesName}:</span>
            <span style="color: #3b82f6; font-weight: 700;">${param.value}%</span>
          </div>`;
        });
        result += "</div>";
        return result;
      },
    },
    legend: {
      data: ["Tepat Waktu", "Terlambat 1 Tahun", "Terlambat > 1 Tahun"],
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
      data: kelulusanData.years,
      axisLabel: {
        color: "#1f2937",
        fontSize: 12,
        fontWeight: 600,
      },
    },
    yAxis: {
      type: "value",
      max: 100,
      axisLabel: {
        formatter: "{value}%",
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
        name: "Tepat Waktu",
        type: "bar",
        stack: "total",
        data: kelulusanData.tepatWaktu,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#10b981" },
              { offset: 1, color: "#34d399" },
            ],
          },
          borderRadius: [6, 6, 0, 0],
        },
        label: {
          show: true,
          position: "inside",
          formatter: "{c}%",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
        },
      },
      {
        name: "Terlambat 1 Tahun",
        type: "bar",
        stack: "total",
        data: kelulusanData.terlambat1Tahun,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#f59e0b" },
              { offset: 1, color: "#fbbf24" },
            ],
          },
        },
        label: {
          show: true,
          position: "inside",
          formatter: "{c}%",
          color: "#fff",
          fontSize: 11,
          fontWeight: 600,
        },
      },
      {
        name: "Terlambat > 1 Tahun",
        type: "bar",
        stack: "total",
        data: kelulusanData.terlambat2Tahun,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#ef4444" },
              { offset: 1, color: "#f87171" },
            ],
          },
        },
        label: {
          show: true,
          position: "inside",
          formatter: "{c}%",
          color: "#fff",
          fontSize: 11,
          fontWeight: 600,
        },
      },
    ],
  }), []);

  // Chart masa studi dan IPK
  const masaStudiChartOption = useMemo(() => ({
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
      data: ["Jumlah Lulusan", "Rata-rata IPK"],
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
      data: masaStudiIPKData.map(item => item.kategori),
      axisLabel: {
        color: "#1f2937",
        fontSize: 10,
        fontWeight: 600,
        interval: 0,
        rotate: 15,
      },
    },
    yAxis: [
      {
        type: "value",
        name: "Jumlah",
        position: "left",
        axisLabel: {
          formatter: "{value}",
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
      {
        type: "value",
        name: "IPK",
        position: "right",
        min: 2.5,
        max: 4.0,
        axisLabel: {
          formatter: "{value}",
          color: "#6b7280",
          fontSize: 11,
        },
      },
    ],
    series: [
      {
        name: "Jumlah Lulusan",
        type: "bar",
        data: masaStudiIPKData.map(item => item.jumlah),
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#3b82f6" },
              { offset: 1, color: "#60a5fa" },
            ],
          },
          borderRadius: [6, 6, 0, 0],
        },
        label: {
          show: true,
          position: "top",
          formatter: "{c}",
          color: "#1f2937",
          fontSize: 10,
          fontWeight: 700,
        },
      },
      {
        name: "Rata-rata IPK",
        type: "line",
        yAxisIndex: 1,
        data: masaStudiIPKData.map(item => item.avgIPK),
        smooth: true,
        symbolSize: 10,
        itemStyle: {
          color: "#10b981",
        },
        lineStyle: {
          width: 3,
        },
        label: {
          show: true,
          position: "top",
          formatter: "{c}",
          color: "#10b981",
          fontSize: 10,
          fontWeight: 700,
        },
      },
    ],
  }), []);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
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
              Kelulusan Tepat Waktu
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Statistik kelulusan mahasiswa dan analisis masa studi
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Kelulusan Tepat Waktu", value: "84%", icon: "✅", gradient: "from-emerald-500 to-emerald-600" },
              { label: "Rata-rata Masa Studi", value: "4.2 Th", icon: "⏱️", gradient: "from-blue-500 to-blue-600" },
              { label: "Rata-rata IPK", value: "3.48", icon: "🎓", gradient: "from-purple-500 to-purple-600" },
              { label: "Total Lulusan 2024", value: "1,975", icon: "👨‍🎓", gradient: "from-pink-500 to-pink-600" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-6 text-white shadow-lg`}
              >
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm font-semibold opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Kelulusan Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Tren Kelulusan Tepat Waktu
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[380px]">
                  <ReactECharts
                    option={kelulusanChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Masa Studi & IPK Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Masa Studi & IPK
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[380px]">
                  <ReactECharts
                    option={masaStudiChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Info */}
          <motion.div variants={itemVariants} className="mt-8 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
            <div className="flex items-start gap-4">
              <div className="text-3xl">📊</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Peningkatan Signifikan</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Tingkat kelulusan tepat waktu menunjukkan tren positif dari 72% (2020) menjadi 84% (2024).
                  Mayoritas mahasiswa lulus dengan masa studi 3.5-4 tahun dengan IPK rata-rata 3.52,
                  menunjukkan efektivitas sistem pendidikan dan bimbingan akademik di Universitas Lampung.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
