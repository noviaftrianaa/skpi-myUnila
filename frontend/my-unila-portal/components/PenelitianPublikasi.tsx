"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo } from "react";

// Import ECharts dynamically to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function PenelitianPublikasi() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Data publikasi per tahun
  const publikasiTahunData = [
    { tahun: "2020", nasional: 245, internasional: 128, scopus: 85 },
    { tahun: "2021", nasional: 298, internasional: 156, scopus: 112 },
    { tahun: "2022", nasional: 325, internasional: 189, scopus: 145 },
    { tahun: "2023", nasional: 378, internasional: 234, scopus: 178 },
    { tahun: "2024", nasional: 412, internasional: 267, scopus: 203 },
  ];

  // Data penelitian berdasarkan skema pendanaan
  const penelitianSkemaData = [
    { skema: "Penelitian Nasional", jumlah: 145, dana: 12.5 },
    { skema: "Penelitian Internal", jumlah: 234, dana: 8.3 },
    { skema: "Penelitian Kerjasama", jumlah: 89, dana: 15.7 },
    { skema: "Penelitian Mandiri", jumlah: 156, dana: 4.2 },
  ];

  // Chart configuration untuk publikasi
  const publikasiChartOption = useMemo(() => ({
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
      data: ["Nasional", "Internasional", "Scopus"],
      bottom: "0%",
      textStyle: {
        fontSize: 12,
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
      data: publikasiTahunData.map(item => item.tahun),
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
        name: "Nasional",
        type: "bar",
        data: publikasiTahunData.map(item => item.nasional),
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
      },
      {
        name: "Internasional",
        type: "bar",
        data: publikasiTahunData.map(item => item.internasional),
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
      },
      {
        name: "Scopus",
        type: "bar",
        data: publikasiTahunData.map(item => item.scopus),
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
      },
    ],
  }), []);

  // Chart configuration untuk penelitian
  const penelitianChartOption = useMemo(() => ({
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        const item = penelitianSkemaData[params.dataIndex];
        return `<div style="padding: 8px;">
          <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${params.name}</div>
          <div style="color: #3b82f6; font-size: 16px; font-weight: 700;">${params.value} penelitian</div>
          <div style="color: #10b981; font-size: 14px; font-weight: 600; margin-top: 4px;">Rp ${item.dana}M</div>
        </div>`;
      },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#3b82f6",
      borderWidth: 1,
      extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
    },
    legend: {
      bottom: "0%",
      left: "center",
      textStyle: {
        fontSize: 11,
        fontWeight: 600,
      },
    },
    series: [
      {
        name: "Skema Penelitian",
        type: "pie",
        radius: ["45%", "70%"],
        center: ["50%", "45%"],
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 4,
        },
        label: {
          show: true,
          position: "outside",
          formatter: "{b}\n{c}",
          fontSize: 11,
          fontWeight: 600,
        },
        emphasis: {
          scale: true,
          scaleSize: 10,
        },
        data: penelitianSkemaData.map((item, index) => ({
          value: item.jumlah,
          name: item.skema,
          itemStyle: {
            color: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"][index],
          },
        })),
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
              Penelitian & Publikasi
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Produktivitas riset dan publikasi ilmiah Universitas Lampung
            </p>
          </motion.div>

          {/* Highlights */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Total Publikasi 2024", value: "679", icon: "📄", gradient: "from-blue-500 to-blue-600" },
              { label: "Publikasi Scopus", value: "203", icon: "🌍", gradient: "from-emerald-500 to-emerald-600" },
              { label: "Total Penelitian", value: "624", icon: "🔬", gradient: "from-purple-500 to-purple-600" },
              { label: "Dana Penelitian", value: "40.7M", icon: "💰", gradient: "from-amber-500 to-amber-600" },
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
            {/* Publikasi Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Tren Publikasi Ilmiah
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[350px]">
                  <ReactECharts
                    option={publikasiChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">412</div>
                    <div className="text-xs font-semibold text-gray-600">Nasional 2024</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">267</div>
                    <div className="text-xs font-semibold text-gray-600">Internasional 2024</div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-600">203</div>
                    <div className="text-xs font-semibold text-gray-600">Scopus 2024</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Penelitian Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Skema Pendanaan Penelitian
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[350px]">
                  <ReactECharts
                    option={penelitianChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
                <div className="mt-6 space-y-3">
                  {penelitianSkemaData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"][index] }}
                        ></div>
                        <span className="font-semibold text-gray-700 text-sm">{item.skema}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">{item.jumlah}</div>
                        <div className="text-xs text-emerald-600 font-semibold">Rp {item.dana}M</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Achievements */}
          <motion.div variants={itemVariants} className="mt-8 grid md:grid-cols-3 gap-4">
            {[
              {
                title: "H-Index Universitas",
                value: "45",
                desc: "Google Scholar",
                icon: "📊",
                color: "blue",
              },
              {
                title: "Sitasi Tertinggi",
                value: "1,245",
                desc: "Per artikel",
                icon: "⭐",
                color: "purple",
              },
              {
                title: "Kolaborasi Internasional",
                value: "28%",
                desc: "Dari total publikasi",
                icon: "🤝",
                color: "emerald",
              },
            ].map((item, index) => (
              <div key={index} className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100/50 rounded-xl p-6 border border-${item.color}-200`}>
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{item.value}</div>
                <div className="text-sm font-bold text-gray-700 mb-1">{item.title}</div>
                <div className="text-xs text-gray-600">{item.desc}</div>
              </div>
            ))}
          </motion.div>

          {/* Info Box */}
          <motion.div variants={itemVariants} className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🎯</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Produktivitas Penelitian Meningkat</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Universitas Lampung terus meningkatkan produktivitas penelitian dan publikasi ilmiah. Pada tahun 2024, tercatat
                  679 publikasi dengan 203 artikel terindeks Scopus. Total dana penelitian mencapai Rp 40.7 Miliar dari berbagai
                  skema pendanaan nasional dan internal, menunjukkan komitmen kuat terhadap pengembangan riset berkualitas.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
