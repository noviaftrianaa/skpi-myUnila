"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import { dosenService, type DosenStatistics } from "@/lib/services/dosenService";

// Import ECharts dynamically to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function DataDosen() {
  const [statistics, setStatistics] = useState<DosenStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dosenService.getStatistics();
        setStatistics(data);
      } catch (error) {
        console.error("Error fetching dosen statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Data dosen berdasarkan jenjang pendidikan
  const pendidikanData = statistics?.pendidikan.data || [];

  // Data dosen berdasarkan jabatan fungsional (top 4)
  const jabatanData = statistics?.jabatan.data.slice(0, 4) || [];

  // Summary data
  const summary = statistics?.summary || {
    total_dosen: 0,
    total_guru_besar: 0,
    total_doktor: 0,
    rasio_dosen_mahasiswa: "1:0"
  };

  // Chart configuration untuk jenjang pendidikan
  const pendidikanChartOption = useMemo(() => {
    if (!pendidikanData || pendidikanData.length === 0) {
      return {
        series: [{ type: "pie", data: [] }]
      };
    }

    return {
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        return `<div style="padding: 8px;">
          <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${params.name}</div>
          <div style="color: #3b82f6; font-size: 18px; font-weight: 700;">${params.value}</div>
          <div style="color: #6b7280; font-size: 12px;">${params.percent.toFixed(1)}% dari total dosen</div>
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
        fontSize: 12,
        fontWeight: 600,
      },
    },
    series: [
      {
        name: "Jenjang Pendidikan",
        type: "pie",
        radius: ["45%", "70%"],
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
          formatter: "{b}\n{d}%",
          fontSize: 12,
          fontWeight: 600,
        },
        emphasis: {
          scale: true,
          scaleSize: 10,
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
        },
        data: pendidikanData.map(item => ({
          value: item.jumlah,
          name: item.jenjang,
          itemStyle: { color: item.color },
        })),
      },
    ],
  };
  }, [pendidikanData]);

  // Chart configuration untuk jabatan fungsional
  const jabatanChartOption = useMemo(() => {
    if (!jabatanData || jabatanData.length === 0) {
      return {
        xAxis: { type: "category", data: [] },
        yAxis: { type: "value" },
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
          <div style="color: #3b82f6; font-size: 18px; font-weight: 700;">${item.value}</div>
          <div style="color: #6b7280; font-size: 12px;">dosen</div>
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
      type: "category",
      data: jabatanData.map(item => item.jabatan),
      axisLabel: {
        color: "#1f2937",
        fontSize: 11,
        fontWeight: 600,
        interval: 0,
        rotate: 0,
      },
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false,
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
        type: "bar",
        data: jabatanData.map((item, index) => ({
          value: item.jumlah,
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"][index] },
                { offset: 1, color: ["#34d399", "#60a5fa", "#a78bfa", "#fbbf24"][index] },
              ],
            },
            borderRadius: [6, 6, 0, 0],
          },
        })),
        barWidth: "50%",
        label: {
          show: true,
          position: "top",
          formatter: "{c}",
          color: "#1f2937",
          fontSize: 12,
          fontWeight: 700,
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
  }, [jabatanData]);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
              Data Dosen
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Profil dan distribusi dosen Universitas Lampung berdasarkan kualifikasi dan jabatan
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Total Dosen", value: summary.total_dosen.toLocaleString(), icon: "👨‍🏫", gradient: "from-blue-500 to-blue-600" },
              { label: "Guru Besar", value: summary.total_guru_besar.toLocaleString(), icon: "🎓", gradient: "from-emerald-500 to-emerald-600" },
              { label: "Bergelar Doktor", value: summary.total_doktor.toLocaleString(), icon: "📚", gradient: "from-purple-500 to-purple-600" },
              { label: "Rasio Dosen:Mhs", value: summary.rasio_dosen_mahasiswa, icon: "📊", gradient: "from-pink-500 to-pink-600" },
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
            {/* Jenjang Pendidikan Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Jenjang Pendidikan Dosen
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[320px]">
                  <ReactECharts
                    option={pendidikanChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
                <div className="mt-6 space-y-3">
                  {pendidikanData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
                        <span className="font-semibold text-gray-700">{item.jenjang}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">{item.jumlah}</div>
                        <div className="text-xs text-gray-500">{item.persentase}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Jabatan Fungsional Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  Jabatan Fungsional Dosen
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[320px]">
                  <ReactECharts
                    option={jabatanChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {jabatanData.map((item, index) => (
                    <div key={index} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-gray-800 mb-1">{item.jumlah}</div>
                      <div className="text-xs font-semibold text-gray-600">{item.jabatan}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Additional Info */}
          <motion.div variants={itemVariants} className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="text-3xl">📌</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Kualifikasi Dosen Universitas Lampung</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Universitas Lampung memiliki {summary.total_dosen.toLocaleString()} dosen berkualitas dengan mayoritas bergelar
                  Magister ({pendidikanData.find(p => p.jenjang === 'S2/Magister')?.persentase || 0}%) dan
                  Doktor ({pendidikanData.find(p => p.jenjang === 'S3/Doktor')?.persentase || 0}%).
                  Sebanyak {summary.total_guru_besar.toLocaleString()} dosen telah mencapai jabatan fungsional tertinggi sebagai Guru Besar,
                  menunjukkan komitmen institusi terhadap pengembangan SDM akademik berkualitas tinggi.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
