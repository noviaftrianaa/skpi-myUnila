"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import dashboardService from "@/lib/services/public/dashboardService";
import type { ProgramStudiStatistics } from "@/lib/types/dashboardTypes";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function AkreditasiProdi() {
  const [statistics, setStatistics] = useState<ProgramStudiStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load statistics from API
  useEffect(() => {
    const loadStatistics = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getProgramStudiStatistics();
        if (response.success) {
          setStatistics(response.data);
        }
      } catch (error) {
        console.error('Error loading akreditasi statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStatistics();
  }, []);

  // Calculate akreditasi data from API response
  const akreditasiData = useMemo(() => {
    if (!statistics) return [];

    const total = statistics.total_prodi || 1; // Avoid division by zero

    return [
      {
        status: "Unggul",
        jumlah: statistics.akreditasi_count.unggul,
        persentase: Math.round((statistics.akreditasi_count.unggul / total) * 100),
        color: "#10b981"
      },
      {
        status: "Baik Sekali",
        jumlah: statistics.akreditasi_count.baik_sekali,
        persentase: Math.round((statistics.akreditasi_count.baik_sekali / total) * 100),
        color: "#3b82f6"
      },
      {
        status: "Baik",
        jumlah: statistics.akreditasi_count.baik,
        persentase: Math.round((statistics.akreditasi_count.baik / total) * 100),
        color: "#f59e0b"
      },
      {
        status: "A",
        jumlah: statistics.akreditasi_count.a,
        persentase: Math.round((statistics.akreditasi_count.a / total) * 100),
        color: "#8b5cf6"
      },
      {
        status: "B",
        jumlah: statistics.akreditasi_count.b,
        persentase: Math.round((statistics.akreditasi_count.b / total) * 100),
        color: "#ec4899"
      },
      {
        status: "C",
        jumlah: statistics.akreditasi_count.c,
        persentase: Math.round((statistics.akreditasi_count.c / total) * 100),
        color: "#f97316"
      },
      {
        status: "Tidak Terakreditasi",
        jumlah: statistics.akreditasi_count.tidak_terakreditasi,
        persentase: Math.round((statistics.akreditasi_count.tidak_terakreditasi / total) * 100),
        color: "#ef4444"
      },
      {
        status: "Belum Terakreditasi",
        jumlah: statistics.akreditasi_count.belum_terakreditasi,
        persentase: Math.round((statistics.akreditasi_count.belum_terakreditasi / total) * 100),
        color: "#6b7280"
      },
    ].filter(item => item.jumlah > 0); // Only show categories with data
  }, [statistics]);

  const totalProdi = statistics?.total_prodi || 0;

  // Calculate percentage of Unggul + Baik Sekali
  const excellencePercentage = useMemo(() => {
    if (!statistics || !statistics.total_prodi) return 0;
    const excellent = statistics.akreditasi_count.unggul + statistics.akreditasi_count.baik_sekali;
    return Math.round((excellent / statistics.total_prodi) * 100);
  }, [statistics]);

  const chartOption = useMemo(() => ({
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} Program Studi ({d}%)",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#3b82f6",
      borderWidth: 1,
      textStyle: {
        color: "#1f2937",
        fontSize: isMobile ? 11 : 13,
      },
      extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; padding: 10px;",
    },
    legend: {
      orient: isMobile ? "horizontal" : "vertical",
      ...(isMobile ? {
        bottom: "5%",
        left: "center",
      } : {
        right: "5%",
        top: "center",
      }),
      itemGap: isMobile ? 8 : 10,
      itemWidth: isMobile ? 10 : 14,
      itemHeight: isMobile ? 10 : 14,
      formatter: (name: string) => {
        const item = akreditasiData.find(d => d.status === name);
        return isMobile ? `{title|${name.length > 12 ? name.substring(0, 12) + '...' : name}} {value|${item?.jumlah}}` : `{title|${name}} {value|${item?.jumlah}}`;
      },
      textStyle: {
        fontSize: isMobile ? 9 : 11,
        color: "#4b5563",
        fontWeight: 500,
        rich: {
          title: {
            fontSize: isMobile ? 9 : 11,
            fontWeight: 600,
            color: "#1f2937",
            padding: [0, 4, 0, 0],
          },
          value: {
            fontSize: isMobile ? 9 : 11,
            fontWeight: 700,
            color: "#6b7280",
            backgroundColor: "#f3f4f6",
            borderRadius: 4,
            padding: isMobile ? [1, 4] : [2, 6],
          },
        },
      },
    },
    grid: {
      ...(isMobile ? {
        bottom: "25%",
      } : {}),
    },
    series: [
      {
        name: "Akreditasi",
        type: "pie",
        radius: isMobile ? ["40%", "65%"] : ["50%", "75%"],
        center: isMobile ? ["50%", "45%"] : ["40%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: isMobile ? 6 : 10,
          borderColor: "#fff",
          borderWidth: isMobile ? 2 : 4,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: isMobile ? 14 : 18,
            fontWeight: "bold",
            formatter: "{d}%",
          },
          itemStyle: {
            shadowBlur: isMobile ? 15 : 25,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.4)",
          },
          scale: true,
          scaleSize: isMobile ? 5 : 10,
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
  }), [akreditasiData, isMobile]);

  return (
    <section className="py-20 bg-white relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-sm font-semibold text-gray-700">Memuat data akreditasi...</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 sm:mb-3 pb-1 leading-relaxed px-2">
              Status Akreditasi Program Studi
            </h2>
            <div className="flex items-center justify-center mb-2 sm:mb-3">
              <div className="h-1 w-16 sm:w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
              Data akreditasi terintegrasi dari BAN-PT
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
            {/* Chart Card - Takes 3/5 of space */}
            <motion.div variants={itemVariants} className="lg:col-span-3 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Distribusi Akreditasi
                  </h3>
                  <div className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2.5 sm:px-3 py-1 rounded-full font-medium">
                    Total: {totalProdi} Program Studi
                  </div>
                </div>
                <div className="h-[280px] sm:h-[350px] md:h-[420px]">
                  <ReactECharts
                    option={chartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Stats Cards - Compact Grid - Takes 2/5 of space */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-5">
              {/* Highlight Card */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-white/90">Pencapaian Terbaik</div>
                      <div className="text-2xl sm:text-3xl font-bold">{excellencePercentage}%</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs sm:text-sm text-white/80">Unggul &</div>
                    <div className="text-xs sm:text-sm text-white/80">Baik Sekali</div>
                  </div>
                </div>
              </div>

              {/* Compact Stats Grid - 2 columns */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-5">
                <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-3 sm:mb-4 uppercase tracking-wide">Detail Akreditasi</h4>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {akreditasiData.map((item, index) => (
                    <motion.div
                      key={index}
                      className="group cursor-pointer"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-3.5 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                          {/* Color indicator */}
                          <div
                            className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: item.color }}
                          >
                            <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-0.5 sm:mb-1 truncate">{item.status}</div>
                            <div className="flex items-baseline gap-1 sm:gap-1.5 md:gap-2">
                              <div className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: item.color }}>{item.jumlah}</div>
                              <div className="text-[10px] sm:text-xs font-semibold text-gray-400">prodi</div>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-1.5 sm:mt-2">
                              <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-600">{item.persentase}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5 overflow-hidden">
                                <motion.div
                                  className="h-1 sm:h-1.5 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${item.persentase}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.8, delay: index * 0.1 }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Source attribution — sumber data akreditasi */}
          <motion.div
            variants={itemVariants}
            className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500"
          >
            <span>Sumber data:</span>
            <a
              href="https://banpt.or.id/direktori/prodi/pencarian_prodi.php"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              BAN-PT (Direktori Akreditasi)
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <span className="text-gray-400">·</span>
            <span className="text-gray-400">disinkronkan oleh admin SI Akademik</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
