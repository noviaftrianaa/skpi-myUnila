"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo, useEffect, useState } from "react";
import { getSebaranStatistics } from "@/lib/services/mahasiswaSebaranService";

// Import ECharts dynamically to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function SebaranMahasiswa() {
  const [sebaranData, setSebaranData] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getSebaranStatistics();

        if (response.success) {
          // Use kabupaten data for visualization (top 10)
          const kabupatenData = response.data.kabupaten.data.slice(0, 10).map(item => ({
            provinsi: item.nama_kabupaten,
            jumlah: item.jumlah_mahasiswa,
            persentase: parseFloat(item.persentase.toFixed(1)),
          }));

          setSebaranData(kabupatenData);
          setStatistics(response.data.statistics);
        }
      } catch (err) {
        console.error('Error fetching sebaran data:', err);
        // Use fallback data
        setSebaranData([
          { provinsi: "Lampung", jumlah: 18500, persentase: 74 },
          { provinsi: "Sumatera Selatan", jumlah: 2800, persentase: 11.2 },
          { provinsi: "Bengkulu", jumlah: 1200, persentase: 4.8 },
          { provinsi: "Jakarta", jumlah: 800, persentase: 3.2 },
          { provinsi: "Banten", jumlah: 600, persentase: 2.4 },
          { provinsi: "Lainnya", jumlah: 1100, persentase: 4.4 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Map chart configuration (simple bar representation of Indonesia regions)
  // MUST be called before any conditional returns to follow Rules of Hooks
  const chartOption = useMemo(() => {
    // Return empty config if no data to prevent errors
    if (!sebaranData || sebaranData.length === 0) {
      return {
        xAxis: { type: "value" },
        yAxis: { type: "category", data: [] },
        series: [{ type: "bar", data: [] }]
      };
    }

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: (params: any) => {
          const item = params[0];
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${item.name}</div>
            <div style="color: #3b82f6; font-size: 18px; font-weight: 700;">${item.value.toLocaleString()}</div>
            <div style="color: #6b7280; font-size: 12px;">mahasiswa</div>
          </div>`;
        },
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
      yAxis: {
        type: "category",
        data: sebaranData.map(item => item.provinsi),
        axisLabel: {
          color: "#1f2937",
          fontSize: 12,
          fontWeight: 600,
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
      },
      series: [
        {
          type: "bar",
          data: sebaranData.map((item, index) => ({
            value: item.jumlah,
            persentase: item.persentase, // Add persentase to data object
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: [
                    "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899",
                    "#94a3b8", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
                  ][index % 10] },
                  { offset: 1, color: [
                    "#60a5fa", "#818cf8", "#a78bfa", "#c084fc", "#f472b6",
                    "#cbd5e1", "#60a5fa", "#818cf8", "#a78bfa", "#c084fc",
                  ][index % 10] },
                ],
              },
              borderRadius: [0, 6, 6, 0],
            },
          })),
          barWidth: "60%",
          label: {
            show: true,
            position: "right",
            formatter: (params: any) => {
              const persentase = params.data.persentase || 0;
              return `${persentase}%`;
            },
            color: "#1f2937",
            fontSize: 12,
            fontWeight: 600,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0,0,0,0.3)",
            },
          },
        },
      ],
    };
  }, [sebaranData]);

  // Show loading state
  if (loading) {
    return (
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                Sebaran Mahasiswa
              </h2>
              <p className="text-gray-600 text-lg">Memuat data...</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-16 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Sebaran Mahasiswa
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Distribusi mahasiswa aktif Universitas Lampung berdasarkan asal kabupaten/kota
            </p>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Chart Section */}
              <div className="p-8 bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Top 10 Kabupaten/Kota
                </h3>
                <div className="h-[350px]">
                  <ReactECharts
                    option={chartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>

              {/* Stats Section */}
              <div className="p-8 bg-white">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Detail Sebaran
                </h3>
                <div className="space-y-4">
                  {sebaranData.map((item, index) => (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">{item.provinsi}</span>
                        <span className="text-sm font-bold text-blue-600">{item.jumlah.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          className={`h-2.5 rounded-full ${
                            index === 0 ? "bg-blue-500" :
                            index === 1 ? "bg-indigo-500" :
                            index === 2 ? "bg-violet-500" :
                            index === 3 ? "bg-purple-500" :
                            index === 4 ? "bg-pink-500" :
                            "bg-slate-400"
                          }`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.persentase}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{item.persentase}% dari total mahasiswa</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants} className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Mahasiswa Lokal",
                value: statistics ? `${statistics.mahasiswa_lokal_persen}%` : "74%",
                icon: "🏠",
                color: "blue"
              },
              {
                label: "Mahasiswa Luar Daerah",
                value: statistics ? `${statistics.mahasiswa_luar_daerah_persen}%` : "26%",
                icon: "✈️",
                color: "indigo"
              },
              {
                label: "Provinsi Asal",
                value: statistics ? `${statistics.total_provinsi}+` : "15+",
                icon: "🗺️",
                color: "purple"
              },
              {
                label: "Kabupaten Asal",
                value: statistics ? `${statistics.total_kabupaten}+` : "50+",
                icon: "🌟",
                color: "pink"
              },
            ].map((stat, index) => (
              <div key={index} className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100/50 rounded-xl p-5 border border-${stat.color}-200`}>
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-xs font-semibold text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
