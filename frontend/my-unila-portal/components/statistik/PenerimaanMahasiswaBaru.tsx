"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function PenerimaanMahasiswaBaru() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Data Jalur Mandiri per tahun
  const jalurMandiriData = {
    years: ["2020", "2021", "2022", "2023", "2024"],
    pendaftar: [3250, 3580, 3850, 4120, 4380],
    diterima: [1200, 1350, 1480, 1620, 1750],
    registrasi: [1050, 1180, 1290, 1420, 1540],
  };

  // Data Jalur Non Mandiri per tahun
  const jalurNonMandiriData = {
    years: ["2020", "2021", "2022", "2023", "2024"],
    snbp: [1850, 1920, 2050, 2180, 2310],
    snbt: [2150, 2280, 2420, 2560, 2690],
    lainnya: [320, 380, 450, 520, 580],
  };

  // Data Perbandingan Jalur (Current Year)
  const perbandinganJalurData = [
    { jalur: "Mandiri", jumlah: 1540, persentase: 22.4 },
    { jalur: "SNBP", jumlah: 2310, persentase: 33.6 },
    { jalur: "SNBT", jumlah: 2690, persentase: 39.1 },
    { jalur: "Lainnya", jumlah: 580, persentase: 8.4 },
  ];

  // Chart Jalur Mandiri
  const jalurMandiriChartOption = useMemo(() => ({
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#3b82f6",
      borderWidth: 1,
      extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
    },
    legend: {
      data: ["Pendaftar", "Diterima", "Registrasi"],
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
      data: jalurMandiriData.years,
      axisLabel: {
        color: "#1f2937",
        fontSize: 12,
        fontWeight: 600,
      },
    },
    yAxis: {
      type: "value",
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
    series: [
      {
        name: "Pendaftar",
        type: "bar",
        data: jalurMandiriData.pendaftar,
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
        name: "Diterima",
        type: "bar",
        data: jalurMandiriData.diterima,
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
          position: "top",
          formatter: "{c}",
          color: "#1f2937",
          fontSize: 10,
          fontWeight: 700,
        },
      },
      {
        name: "Registrasi",
        type: "bar",
        data: jalurMandiriData.registrasi,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#8b5cf6" },
              { offset: 1, color: "#a78bfa" },
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
    ],
  }), []);

  // Chart Jalur Non Mandiri
  const jalurNonMandiriChartOption = useMemo(() => ({
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#3b82f6",
      borderWidth: 1,
      extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
    },
    legend: {
      data: ["SNBP", "SNBT", "Lainnya"],
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
      data: jalurNonMandiriData.years,
      axisLabel: {
        color: "#1f2937",
        fontSize: 12,
        fontWeight: 600,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
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
        name: "SNBP",
        type: "line",
        data: jalurNonMandiriData.snbp,
        smooth: true,
        symbolSize: 8,
        itemStyle: { color: "#10b981" },
        lineStyle: { width: 3 },
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
        label: {
          show: true,
          position: "top",
          formatter: "{c}",
          color: "#10b981",
          fontSize: 10,
          fontWeight: 700,
        },
      },
      {
        name: "SNBT",
        type: "line",
        data: jalurNonMandiriData.snbt,
        smooth: true,
        symbolSize: 8,
        itemStyle: { color: "#3b82f6" },
        lineStyle: { width: 3 },
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
        label: {
          show: true,
          position: "top",
          formatter: "{c}",
          color: "#3b82f6",
          fontSize: 10,
          fontWeight: 700,
        },
      },
      {
        name: "Lainnya",
        type: "line",
        data: jalurNonMandiriData.lainnya,
        smooth: true,
        symbolSize: 8,
        itemStyle: { color: "#f59e0b" },
        lineStyle: { width: 3 },
        label: {
          show: true,
          position: "top",
          formatter: "{c}",
          color: "#f59e0b",
          fontSize: 10,
          fontWeight: 700,
        },
      },
    ],
  }), []);

  // Chart Perbandingan Jalur (Funnel)
  const perbandinganChartOption = useMemo(() => ({
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#3b82f6",
      borderWidth: 1,
      extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
    },
    series: [
      {
        name: "Jalur Penerimaan",
        type: "funnel",
        left: "10%",
        width: "80%",
        minSize: "20%",
        maxSize: "100%",
        sort: "descending",
        gap: 2,
        label: {
          show: true,
          position: "inside",
          formatter: "{b}\n{c}\n({d}%)",
          fontSize: 13,
          fontWeight: 700,
          color: "#fff",
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: "solid",
          },
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 2,
        },
        emphasis: {
          label: {
            fontSize: 15,
          },
        },
        data: perbandinganJalurData.map((item, index) => ({
          value: item.jumlah,
          name: item.jalur,
          itemStyle: {
            color: ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"][index],
          },
        })),
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
              Penerimaan Mahasiswa Baru
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Statistik penerimaan mahasiswa baru melalui berbagai jalur
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Total Pendaftar 2024", value: "10,540", icon: "📝", gradient: "from-blue-500 to-blue-600" },
              { label: "Total Diterima 2024", value: "7,120", icon: "✅", gradient: "from-emerald-500 to-emerald-600" },
              { label: "Total Registrasi 2024", value: "6,870", icon: "🎓", gradient: "from-purple-500 to-purple-600" },
              { label: "Tingkat Penerimaan", value: "67.5%", icon: "📊", gradient: "from-amber-500 to-amber-600" },
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
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Jalur Mandiri Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Jalur Mandiri
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[350px]">
                  <ReactECharts
                    option={jalurMandiriChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Pendaftar</div>
                    <div className="text-xl font-bold text-blue-600">4,380</div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Diterima</div>
                    <div className="text-xl font-bold text-emerald-600">1,750</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Registrasi</div>
                    <div className="text-xl font-bold text-purple-600">1,540</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Jalur Non Mandiri Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Jalur Non Mandiri
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[350px]">
                  <ReactECharts
                    option={jalurNonMandiriChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="text-xs font-semibold text-gray-600 mb-1">SNBP</div>
                    <div className="text-xl font-bold text-emerald-600">2,310</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs font-semibold text-gray-600 mb-1">SNBT</div>
                    <div className="text-xl font-bold text-blue-600">2,690</div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Lainnya</div>
                    <div className="text-xl font-bold text-amber-600">580</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Perbandingan Jalur */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 bg-blue-600">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Perbandingan Jalur Penerimaan 2024
              </h3>
            </div>
            <div className="p-6">
              <div className="h-[400px]">
                <ReactECharts
                  option={perbandinganChartOption}
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
                <h4 className="font-bold text-gray-800 mb-2">Tren Positif Penerimaan</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Jumlah pendaftar mahasiswa baru menunjukkan peningkatan konsisten selama 5 tahun terakhir.
                  Jalur SNBT mendominasi dengan 39.1% dari total penerimaan, diikuti SNBP 33.6% dan Jalur Mandiri 22.4%.
                  Tingkat registrasi mencapai 96.5% dari mahasiswa yang diterima, menunjukkan daya tarik tinggi Universitas Lampung.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
