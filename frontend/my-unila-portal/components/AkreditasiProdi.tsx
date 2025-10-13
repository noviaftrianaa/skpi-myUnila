"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function AkreditasiProdi() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Data akreditasi (dari data yang sudah ada di ProgramStudiTable)
  const akreditasiData = [
    { status: "Unggul", jumlah: 42, persentase: 56, color: "#10b981" },
    { status: "Baik Sekali", jumlah: 30, persentase: 40, color: "#3b82f6" },
    { status: "Baik", jumlah: 3, persentase: 4, color: "#f59e0b" },
  ];

  const totalProdi = akreditasiData.reduce((sum, item) => sum + item.jumlah, 0);

  const chartOption = useMemo(() => ({
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} Program Studi ({d}%)",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#3b82f6",
      borderWidth: 1,
      textStyle: {
        color: "#1f2937",
        fontSize: 13,
      },
      extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; padding: 10px;",
    },
    legend: {
      orient: "vertical",
      right: "8%",
      top: "center",
      itemGap: 15,
      formatter: (name: string) => {
        const item = akreditasiData.find(d => d.status === name);
        return `{title|${name}}\n{value|${item?.jumlah} Prodi (${item?.persentase}%)}`;
      },
      textStyle: {
        fontSize: 14,
        color: "#4b5563",
        fontWeight: 600,
        rich: {
          title: {
            fontSize: 14,
            fontWeight: 600,
            color: "#1f2937",
            lineHeight: 20,
          },
          value: {
            fontSize: 12,
            color: "#6b7280",
            lineHeight: 18,
          },
        },
      },
    },
    series: [
      {
        name: "Akreditasi",
        type: "pie",
        radius: ["50%", "75%"],
        center: ["35%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 4,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: "bold",
            formatter: "{d}%",
          },
          itemStyle: {
            shadowBlur: 25,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.4)",
          },
          scale: true,
          scaleSize: 10,
        },
        labelLine: {
          show: false,
        },
        data: akreditasiData.map(item => ({
          value: item.jumlah,
          name: item.status,
          itemStyle: {
            color: item.color,
          },
        })),
      },
    ],
  }), []);

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50/30 via-white to-indigo-50/20 relative">
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
              Status Akreditasi Program Studi
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Data akreditasi terintegrasi dari PDDIKTI
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Chart Card */}
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Distribusi Akreditasi
                  </h3>
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                    Total: {totalProdi} Program Studi
                  </div>
                </div>
                <div className="h-[400px]">
                  <ReactECharts
                    option={chartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="space-y-6">
              {akreditasiData.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <svg className="w-7 h-7" style={{ color: item.color }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-500 mb-1">{item.status}</div>
                      <div className="text-3xl font-bold" style={{ color: item.color }}>{item.jumlah}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Program Studi</span>
                      <span className="font-bold text-gray-800">{item.persentase}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.persentase}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Highlight Card */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white/90">Pencapaian</div>
                    <div className="text-2xl font-bold">96%</div>
                  </div>
                </div>
                <div className="text-sm text-white/90">
                  Program Studi dengan akreditasi Unggul & Baik Sekali
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
