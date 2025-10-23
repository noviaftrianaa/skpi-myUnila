"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo, useEffect, useState } from "react";
import { kelulusanService, KelulusanStatistics } from "@/lib/services/kelulusanService";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function KelulusanTepatWaktu() {
  const [kelulusanData, setKelulusanData] = useState<KelulusanStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await kelulusanService.getStatistics();
        setKelulusanData(data);
      } catch (error) {
        console.error("Error fetching kelulusan data:", error);
      } finally {
        setIsLoading(false);
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

  // Chart kelulusan tepat waktu per tahun
  const kelulusanChartOption = useMemo(() => {
    if (!kelulusanData?.by_year) return {};

    const years = kelulusanData.by_year.map(item => item.tahun.toString()).reverse();
    const tepatWaktuData = kelulusanData.by_year.map(item => item.persentase_tepat_waktu).reverse();
    const tidakTepatWaktuData = kelulusanData.by_year.map(item =>
      item.total_lulusan > 0
        ? parseFloat((100 - item.persentase_tepat_waktu).toFixed(2))
        : 0
    ).reverse();

    return {
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
          const yearData = kelulusanData.by_year.find(y => y.tahun.toString() === params[0].axisValue);
          let result = `<div style="padding: 8px;"><div style="font-weight: 600; margin-bottom: 8px;">Tahun ${params[0].axisValue}</div>`;
          result += `<div style="margin-bottom: 8px; color: #6b7280;">Total Lulusan: <span style="font-weight: 700; color: #1f2937;">${yearData?.total_lulusan.toLocaleString('id-ID')}</span></div>`;
          result += `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></div>
            <span style="font-weight: 600;">Tepat Waktu:</span>
            <span style="color: #10b981; font-weight: 700;">${yearData?.tepat_waktu.toLocaleString('id-ID')} (${yearData?.persentase_tepat_waktu}%)</span>
          </div>`;
          result += `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></div>
            <span style="font-weight: 600;">Tidak Tepat Waktu:</span>
            <span style="color: #ef4444; font-weight: 700;">${yearData?.tidak_tepat_waktu.toLocaleString('id-ID')}</span>
          </div>`;
          result += "</div>";
          return result;
        },
      },
      legend: {
        data: ["Tepat Waktu", "Tidak Tepat Waktu"],
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
        data: years,
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
          data: tepatWaktuData,
          barMinHeight: 3,
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
          name: "Tidak Tepat Waktu",
          type: "bar",
          stack: "total",
          data: tidakTepatWaktuData,
          barMinHeight: 3,
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
            formatter: (params: any) => params.value > 5 ? `${params.value}%` : '',
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
          },
        },
      ],
    };
  }, [kelulusanData]);

  // Calculate overall average IPK
  const overallAvgIpk = useMemo(() => {
    if (!kelulusanData?.by_masa_studi || kelulusanData.by_masa_studi.length === 0) return 0;

    const totalJumlah = kelulusanData.by_masa_studi.reduce((sum, item) => sum + item.jumlah, 0);
    const weightedIpk = kelulusanData.by_masa_studi.reduce((sum, item) => sum + (item.avg_ipk * item.jumlah), 0);

    return totalJumlah > 0 ? parseFloat((weightedIpk / totalJumlah).toFixed(2)) : 0;
  }, [kelulusanData]);

  // Chart masa studi dan IPK
  const masaStudiChartOption = useMemo(() => {
    if (!kelulusanData?.by_masa_studi) return {};

    const kategori = kelulusanData.by_masa_studi.map(item => item.kategori);
    const jumlahData = kelulusanData.by_masa_studi.map(item => item.jumlah);
    const ipkData = kelulusanData.by_masa_studi.map(item => item.avg_ipk);

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#3b82f6",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
        formatter: (params: any) => {
          const masaStudiData = kelulusanData.by_masa_studi.find(m => m.kategori === params[0].axisValue);
          let result = `<div style="padding: 8px;"><div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`;
          result += `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: #3b82f6;"></div>
            <span style="font-weight: 600;">Jumlah Lulusan:</span>
            <span style="color: #3b82f6; font-weight: 700;">${masaStudiData?.jumlah.toLocaleString('id-ID')}</span>
          </div>`;
          result += `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></div>
            <span style="font-weight: 600;">Rata-rata IPK:</span>
            <span style="color: #10b981; font-weight: 700;">${masaStudiData?.avg_ipk}</span>
          </div>`;
          result += "</div>";
          return result;
        },
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
        data: kategori,
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
          data: jumlahData,
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
          data: ipkData,
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
    };
  }, [kelulusanData]);

  // Chart fakultas
  const fakultasChartOption = useMemo(() => {
    if (!kelulusanData?.by_fakultas) return {};

    // Sort dan ambil top 10
    const topFakultas = [...kelulusanData.by_fakultas]
      .sort((a, b) => b.total_lulusan - a.total_lulusan)
      .slice(0, 10);

    return {
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
          const fakultasData = topFakultas.find(f => f.fakultas === params[0].axisValue);
          let result = `<div style="padding: 8px;"><div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`;
          result += `<div style="margin-bottom: 8px; color: #6b7280;">Total Lulusan: <span style="font-weight: 700; color: #1f2937;">${fakultasData?.total_lulusan.toLocaleString('id-ID')}</span></div>`;
          result += `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></div>
            <span style="font-weight: 600;">Tepat Waktu:</span>
            <span style="color: #10b981; font-weight: 700;">${fakultasData?.tepat_waktu.toLocaleString('id-ID')} (${fakultasData?.persentase_tepat_waktu}%)</span>
          </div>`;
          result += "</div>";
          return result;
        },
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
        data: topFakultas.map(item => item.fakultas),
        axisLabel: {
          color: "#1f2937",
          fontSize: 11,
          fontWeight: 600,
          rotate: 20,
          interval: 0,
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
          name: "Jumlah Lulusan",
          type: "bar",
          data: topFakultas.map(item => item.total_lulusan),
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#3b82f6" },
                { offset: 1, color: "#1d4ed8" },
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
          barMaxWidth: 80,
        },
      ],
    };
  }, [kelulusanData]);

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 pb-1 leading-relaxed">
                Kelulusan Tepat Waktu
              </h2>
              <div className="flex items-center justify-center mb-3">
                <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Memuat data kelulusan...
              </p>
            </div>
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
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
          {kelulusanData && (
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="text-3xl mb-3">✅</div>
                <div className="text-3xl font-bold mb-1">{kelulusanData.persentase_tepat_waktu}%</div>
                <div className="text-sm font-semibold opacity-90">Kelulusan Tepat Waktu</div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="text-3xl mb-3">👨‍🎓</div>
                <div className="text-3xl font-bold mb-1">{kelulusanData.total.toLocaleString('id-ID')}</div>
                <div className="text-sm font-semibold opacity-90">Total Lulusan {new Date().getFullYear()}</div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="text-3xl mb-3">🎯</div>
                <div className="text-3xl font-bold mb-1">{kelulusanData.total_tepat_waktu.toLocaleString('id-ID')}</div>
                <div className="text-sm font-semibold opacity-90">Lulus Tepat Waktu</div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="text-3xl mb-3">⭐</div>
                <div className="text-3xl font-bold mb-1">{overallAvgIpk.toFixed(2)}</div>
                <div className="text-sm font-semibold opacity-90">Rata-rata IPK</div>
              </motion.div>
            </motion.div>
          )}

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

          {/* Kelulusan per Fakultas Chart - Full Width */}
          <motion.div variants={itemVariants} className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 bg-blue-600">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                Sebaran Kelulusan per Fakultas
              </h3>
            </div>
            <div className="p-6">
              <div className="h-[450px]">
                <ReactECharts
                  option={fakultasChartOption}
                  style={{ height: "100%", width: "100%" }}
                  opts={{ renderer: "svg" }}
                />
              </div>
            </div>
          </motion.div>

          {/* Info */}
          {kelulusanData && kelulusanData.by_year && kelulusanData.by_year.length > 0 && (
            <motion.div variants={itemVariants} className="mt-8 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
              <div className="flex items-start gap-4">
                <div className="text-3xl">📊</div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Statistik Kelulusan Tahun {kelulusanData.by_year[0].tahun}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Dari {kelulusanData.total.toLocaleString('id-ID')} total lulusan tahun {kelulusanData.by_year[0].tahun}, sebanyak {kelulusanData.total_tepat_waktu.toLocaleString('id-ID')} mahasiswa ({kelulusanData.persentase_tepat_waktu}%)
                    berhasil lulus tepat waktu sesuai standar jenjang pendidikan dengan rata-rata IPK {overallAvgIpk.toFixed(2)}.
                    Pencapaian ini menunjukkan peningkatan signifikan dibandingkan tahun-tahun sebelumnya
                    dan mencerminkan komitmen Universitas Lampung dalam meningkatkan kualitas pendidikan dan dukungan akademik bagi mahasiswa.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
