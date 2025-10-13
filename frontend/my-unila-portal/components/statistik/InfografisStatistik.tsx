"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function InfografisStatistik() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Data Dosen per Fakultas
  const dosenData = [
    { fakultas: "Teknik", jumlah: 185 },
    { fakultas: "FKIP", jumlah: 165 },
    { fakultas: "Ekonomi & Bisnis", jumlah: 82 },
    { fakultas: "Pertanian", jumlah: 78 },
    { fakultas: "MIPA", jumlah: 72 },
    { fakultas: "Hukum", jumlah: 45 },
    { fakultas: "FISIP", jumlah: 43 },
  ];

  // Data Mahasiswa per Jenjang
  const mahasiswaData = [
    { jenjang: "S1", jumlah: 18500, persentase: 74 },
    { jenjang: "S2", jumlah: 4200, persentase: 16.8 },
    { jenjang: "S3", jumlah: 1800, persentase: 7.2 },
    { jenjang: "D3", jumlah: 500, persentase: 2 },
  ];

  // Data Publikasi & HAKI per tahun
  const publikasiHAKIData = {
    years: ["2020", "2021", "2022", "2023", "2024"],
    jurnal: [245, 298, 325, 378, 412],
    prosiding: [156, 189, 215, 267, 298],
    buku: [45, 52, 58, 67, 75],
    haki: [28, 35, 42, 51, 63],
  };

  // Data Penelitian & Pengabdian
  const penelitianData = [
    { kategori: "Penelitian", nasional: 145, internal: 234, kerjasama: 89 },
    { kategori: "Pengabdian", nasional: 98, internal: 178, kerjasama: 67 },
  ];

  // Chart Dosen (Horizontal Bar)
  const dosenChartOption = useMemo(() => ({
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#3b82f6",
      borderWidth: 1,
      extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
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
    yAxis: {
      type: "category",
      data: dosenData.map(item => item.fakultas),
      axisLabel: {
        color: "#1f2937",
        fontSize: 11,
        fontWeight: 600,
      },
    },
    series: [{
      type: "bar",
      data: dosenData.map((item, index) => ({
        value: item.jumlah,
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"][index] },
              { offset: 1, color: ["#60a5fa", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#f472b6", "#818cf8"][index] },
            ],
          },
          borderRadius: [0, 6, 6, 0],
        },
      })),
      barWidth: "60%",
      label: {
        show: true,
        position: "right",
        formatter: "{c}",
        color: "#1f2937",
        fontSize: 11,
        fontWeight: 700,
      },
    }],
  }), []);

  // Chart Mahasiswa (Donut)
  const mahasiswaChartOption = useMemo(() => ({
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#3b82f6",
      borderWidth: 1,
      extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
    },
    legend: {
      bottom: "0%",
      textStyle: {
        fontSize: 12,
        fontWeight: 600,
      },
    },
    series: [{
      name: "Mahasiswa",
      type: "pie",
      radius: ["50%", "75%"],
      center: ["50%", "45%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: "#fff",
        borderWidth: 4,
      },
      label: {
        show: true,
        position: "outside",
        formatter: "{b}\n{c}\n({d}%)",
        fontSize: 11,
        fontWeight: 600,
      },
      emphasis: {
        scale: true,
        scaleSize: 10,
      },
      data: mahasiswaData.map((item, index) => ({
        value: item.jumlah,
        name: item.jenjang,
        itemStyle: {
          color: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"][index],
        },
      })),
    }],
  }), []);

  // Chart Publikasi & HAKI (Line)
  const publikasiChartOption = useMemo(() => ({
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#3b82f6",
      borderWidth: 1,
      extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
    },
    legend: {
      data: ["Jurnal", "Prosiding", "Buku", "HAKI"],
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
      data: publikasiHAKIData.years,
      axisLabel: {
        color: "#1f2937",
        fontSize: 11,
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
        name: "Jurnal",
        type: "line",
        data: publikasiHAKIData.jurnal,
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
      },
      {
        name: "Prosiding",
        type: "line",
        data: publikasiHAKIData.prosiding,
        smooth: true,
        symbolSize: 8,
        itemStyle: { color: "#8b5cf6" },
        lineStyle: { width: 3 },
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
        name: "Buku",
        type: "line",
        data: publikasiHAKIData.buku,
        smooth: true,
        symbolSize: 8,
        itemStyle: { color: "#10b981" },
        lineStyle: { width: 3 },
      },
      {
        name: "HAKI",
        type: "line",
        data: publikasiHAKIData.haki,
        smooth: true,
        symbolSize: 8,
        itemStyle: { color: "#f59e0b" },
        lineStyle: { width: 3 },
      },
    ],
  }), []);

  // Chart Penelitian & Pengabdian (Grouped Bar)
  const penelitianChartOption = useMemo(() => ({
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#3b82f6",
      borderWidth: 1,
      extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
    },
    legend: {
      data: ["Nasional", "Internal", "Kerjasama"],
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
      data: penelitianData.map(item => item.kategori),
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
        name: "Nasional",
        type: "bar",
        data: penelitianData.map(item => item.nasional),
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
          fontSize: 11,
          fontWeight: 700,
        },
      },
      {
        name: "Internal",
        type: "bar",
        data: penelitianData.map(item => item.internal),
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
          fontSize: 11,
          fontWeight: 700,
        },
      },
      {
        name: "Kerjasama",
        type: "bar",
        data: penelitianData.map(item => item.kerjasama),
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
          fontSize: 11,
          fontWeight: 700,
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
              Infografis Statistik
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Data dan statistik lengkap Universitas Lampung
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Total Dosen", value: "670", icon: "👨‍🏫", gradient: "from-blue-500 to-blue-600" },
              { label: "Total Mahasiswa", value: "25,000", icon: "👨‍🎓", gradient: "from-purple-500 to-purple-600" },
              { label: "Publikasi 2024", value: "785", icon: "📄", gradient: "from-emerald-500 to-emerald-600" },
              { label: "Penelitian Aktif", value: "468", icon: "🔬", gradient: "from-amber-500 to-amber-600" },
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
            {/* Dosen Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Dosen per Fakultas
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[320px]">
                  <ReactECharts
                    option={dosenChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Mahasiswa Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Mahasiswa per Jenjang
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[320px]">
                  <ReactECharts
                    option={mahasiswaChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Publikasi & HAKI Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  Publikasi & HAKI
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[320px]">
                  <ReactECharts
                    option={publikasiChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Penelitian & Pengabdian Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Penelitian & Pengabdian
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[320px]">
                  <ReactECharts
                    option={penelitianChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
