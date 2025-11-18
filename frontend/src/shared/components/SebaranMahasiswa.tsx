"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo, useEffect, useState } from "react";
import { getSebaranStatistics } from "@/lib/services/mahasiswaSebaranService";

// Import ECharts dynamically to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/api/v1';

export default function SebaranMahasiswa() {
  const [sebaranData, setSebaranData] = useState<any[]>([]);
  const [fakultasData, setFakultasData] = useState<any[]>([]);
  const [prodiData, setProdiData] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'kabupaten' | 'fakultas'>('fakultas');
  const [drillLevel, setDrillLevel] = useState<'fakultas' | 'prodi'>('fakultas');
  const [selectedFakultas, setSelectedFakultas] = useState<{id: string, nama: string} | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Function to drill down into fakultas -> prodi
  const handleDrillDown = async (fakultasId: string, fakultasNama: string) => {
    try {
      setLoading(true);
      console.log('Drilling down to prodi for fakultas:', fakultasNama);

      const response = await fetch(`${API_URL}/mahasiswa-sebaran/fakultas/${fakultasId}/prodi`);
      const data = await response.json();

      if (data.success) {
        const prodiDataFormatted = data.data.data.map(item => ({
          id: item.id_prodi,
          nama: item.nama_prodi,
          jenjang: item.jenjang,
          jumlah: item.jumlah_mahasiswa,
          persentase: parseFloat(item.persentase.toFixed(1)),
        }));

        setProdiData(prodiDataFormatted);
        setSelectedFakultas({ id: fakultasId, nama: fakultasNama });
        setDrillLevel('prodi');
      }
    } catch (err) {
      console.error('Error drilling down:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to drill up back to fakultas
  const handleDrillUp = () => {
    setDrillLevel('fakultas');
    setSelectedFakultas(null);
    setProdiData([]);
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch statistics and kabupaten data
        const response = await getSebaranStatistics();

        // Fetch fakultas data
        const fakultasResponse = await fetch(`${API_URL}/mahasiswa-sebaran/fakultas`);
        const fakultasJson = await fakultasResponse.json();

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

        if (fakultasJson.success) {
          // Use fakultas data
          const fakData = fakultasJson.data.data.map(item => ({
            nama: item.nama_fakultas,
            jumlah: item.jumlah_mahasiswa,
            persentase: parseFloat(item.persentase.toFixed(1)),
            id: item.id_fakultas,
          }));

          setFakultasData(fakData);
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

  // Chart option for prodi
  const prodiChartOption = useMemo(() => {
    if (!prodiData || prodiData.length === 0) {
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
          const dataPoint = prodiData.find(d => d.nama === item.name);
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${item.name}</div>
            <div style="color: #6b7280; font-size: 11px; margin-bottom: 4px;">${dataPoint?.jenjang || ''}</div>
            <div style="color: #3b82f6; font-size: 18px; font-weight: 700;">${item.value.toLocaleString()}</div>
            <div style="color: #6b7280; font-size: 12px;">mahasiswa (${item.data.persentase}%)</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#10b981",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      grid: {
        left: "3%",
        right: "8%",
        bottom: "3%",
        top: "3%",
        containLabel: true,
      },
      dataZoom: [
        {
          type: 'slider',
          yAxisIndex: 0,
          start: 0,
          end: 100,
          right: '1%',
          width: 15,
          borderColor: '#10b981',
          fillerColor: 'rgba(16, 185, 129, 0.15)',
          handleStyle: {
            color: '#10b981',
            borderColor: '#10b981',
          },
          textStyle: {
            color: '#6b7280',
            fontSize: 10,
          },
          moveHandleSize: 5,
          showDataShadow: false,
        },
        {
          type: 'inside',
          yAxisIndex: 0,
          start: 0,
          end: 100,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
        }
      ],
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
        data: prodiData.map(item => item.nama),
        axisLabel: {
          color: "#1f2937",
          fontSize: 11,
          fontWeight: 500,
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
          data: prodiData.map((item, index) => ({
            value: item.jumlah,
            persentase: item.persentase,
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: "#10b981" },
                  { offset: 1, color: "#34d399" },
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
            fontSize: 11,
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
  }, [prodiData]);

  // Chart option for fakultas
  const fakultasChartOption = useMemo(() => {
    if (!fakultasData || fakultasData.length === 0) {
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
            <div style="color: #6b7280; font-size: 12px;">mahasiswa (${item.data.persentase}%)</div>
            <div style="color: #3b82f6; font-size: 11px; margin-top: 4px; font-weight: 600;">Klik untuk lihat prodi →</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#3b82f6",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      grid: {
        left: "3%",
        right: "8%",
        bottom: "3%",
        top: "3%",
        containLabel: true,
      },
      dataZoom: [
        {
          type: 'slider',
          yAxisIndex: 0,
          start: 0,
          end: 100,
          right: '1%',
          width: 15,
          borderColor: '#3b82f6',
          fillerColor: 'rgba(59, 130, 246, 0.15)',
          handleStyle: {
            color: '#3b82f6',
            borderColor: '#3b82f6',
          },
          textStyle: {
            color: '#6b7280',
            fontSize: 10,
          },
          moveHandleSize: 5,
          showDataShadow: false,
        },
        {
          type: 'inside',
          yAxisIndex: 0,
          start: 0,
          end: 100,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
        }
      ],
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
        data: fakultasData.map(item => item.nama),
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
          data: fakultasData.map((item, index) => ({
            value: item.jumlah,
            persentase: item.persentase,
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
                    "#f97316", "#10b981", "#14b8a6", "#06b6d4"
                  ][index % 9] },
                  { offset: 1, color: [
                    "#60a5fa", "#818cf8", "#a78bfa", "#c084fc", "#f472b6",
                    "#fb923c", "#34d399", "#2dd4bf", "#22d3ee"
                  ][index % 9] },
                ],
              },
              borderRadius: [0, 6, 6, 0],
            },
          })),
          barWidth: "70%",
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
              cursor: "pointer",
            },
          },
        },
      ],
    };
  }, [fakultasData]);

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

  // Show loading state with smooth skeleton
  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-white relative">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-2 sm:space-y-3 md:space-y-4">
              <div className="h-8 sm:h-9 md:h-10 bg-gray-100 dark:bg-gray-600 rounded-lg w-48 sm:w-64 md:w-80 mx-auto animate-shimmer"></div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-500 w-16 sm:w-20 mx-auto"></div>
              <div className="h-4 sm:h-5 md:h-6 bg-gray-100 dark:bg-gray-600 rounded w-64 sm:w-80 md:w-96 mx-auto animate-shimmer"></div>
            </div>

            {/* Tab Switcher Skeleton */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="h-10 sm:h-12 w-32 sm:w-40 bg-gray-100 dark:bg-gray-600 rounded-lg animate-shimmer"></div>
              <div className="h-10 sm:h-12 w-32 sm:w-40 bg-gray-100 dark:bg-gray-600 rounded-lg animate-shimmer"></div>
            </div>

            {/* Main Content Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Chart Section Skeleton */}
                <div className="p-4 sm:p-6 md:p-8 bg-gray-50/50 dark:bg-gray-800">
                  <div className="mb-4 sm:mb-6">
                    <div className="h-5 sm:h-6 md:h-7 bg-gray-100 dark:bg-gray-600 rounded w-48 sm:w-56 md:w-64 animate-shimmer"></div>
                  </div>
                  <div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] bg-gray-100 dark:bg-gray-600 rounded-lg sm:rounded-xl animate-soft-pulse flex items-center justify-center">
                    <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-200 dark:text-gray-400 animate-soft-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                </div>

                {/* Stats Section Skeleton */}
                <div className="p-4 sm:p-6 md:p-8 bg-white dark:bg-gray-800">
                  <div className="mb-4 sm:mb-6">
                    <div className="h-5 sm:h-6 md:h-7 bg-gray-100 dark:bg-gray-600 rounded w-36 sm:w-44 md:w-48 animate-shimmer"></div>
                  </div>
                  <div className="space-y-3 sm:space-y-4 max-h-[250px] sm:max-h-[300px] md:max-h-[350px] lg:max-h-[400px] overflow-hidden">
                    {[45, 66, 32, 47, 61, 72, 69, 77].map((width, i) => (
                      <div key={i} className="space-y-1 sm:space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="h-4 sm:h-5 bg-gray-100 dark:bg-gray-600 rounded w-24 sm:w-32 animate-shimmer"></div>
                          <div className="h-4 sm:h-5 bg-gray-100 dark:bg-gray-600 rounded w-12 sm:w-16 animate-shimmer"></div>
                        </div>
                        <div className="h-2 sm:h-2.5 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-500 dark:via-gray-400 dark:to-gray-500 rounded-full animate-soft-pulse" style={{ width: `${width}%` }}></div>
                        </div>
                        <div className="h-2.5 sm:h-3 bg-gray-100 dark:bg-gray-600 rounded w-20 sm:w-24 animate-shimmer"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white relative">
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
              Sebaran Mahasiswa
            </h2>
            <div className="flex items-center justify-center mb-2 sm:mb-3">
              <div className="h-0.5 sm:h-1 w-16 sm:w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-3">
              Distribusi mahasiswa aktif Universitas Lampung
            </p>

            {/* Tab Switcher */}
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
              <button
                onClick={() => {
                  setActiveView('fakultas');
                  // Reset drill level when switching to fakultas view
                  if (drillLevel === 'prodi') {
                    handleDrillUp();
                  }
                }}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all text-xs sm:text-sm md:text-base ${
                  activeView === 'fakultas'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Per Fakultas
              </button>
              <button
                onClick={() => {
                  setActiveView('kabupaten');
                  // Reset drill level when switching to kabupaten view
                  if (drillLevel === 'prodi') {
                    handleDrillUp();
                  }
                }}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all text-xs sm:text-sm md:text-base ${
                  activeView === 'kabupaten'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Per Kabupaten/Kota
              </button>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Chart Section */}
              <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-800 flex items-center gap-1 sm:gap-2">
                    {activeView === 'fakultas' ? (
                      drillLevel === 'prodi' && selectedFakultas ? (
                        <>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                          </svg>
                          <span className="text-xs sm:text-sm md:text-base lg:text-lg">Program Studi - {selectedFakultas.nama}</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                          </svg>
                          <span className="text-xs sm:text-sm md:text-base lg:text-lg">Sebaran Per Fakultas</span>
                        </>
                      )
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs sm:text-sm md:text-base lg:text-lg">Top 10 Kabupaten/Kota</span>
                      </>
                    )}
                  </h3>
                  {/* Back Button */}
                  {activeView === 'fakultas' && drillLevel === 'prodi' && (
                    <button
                      onClick={handleDrillUp}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold text-[10px] sm:text-xs md:text-sm shadow-sm w-full sm:w-auto justify-center sm:justify-start"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      Kembali
                    </button>
                  )}
                </div>
                <div className="h-[250px] sm:h-[280px] md:h-[320px] lg:h-[400px]">
                  <ReactECharts
                    option={
                      activeView === 'fakultas'
                        ? (drillLevel === 'prodi' ? prodiChartOption : fakultasChartOption)
                        : chartOption
                    }
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                    onEvents={
                      activeView === 'fakultas' && drillLevel === 'fakultas'
                        ? {
                            click: (params: any) => {
                              const clickedFakultas = fakultasData[params.dataIndex];
                              if (clickedFakultas) {
                                handleDrillDown(clickedFakultas.id, clickedFakultas.nama);
                              }
                            },
                          }
                        : {}
                    }
                  />
                </div>
              </div>

              {/* Stats Section */}
              <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-white overflow-hidden">
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-1 sm:gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Detail Sebaran
                </h3>
                <div className="overflow-x-auto overflow-y-hidden -mx-3 px-3 sm:-mx-4 sm:px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
                  <div className="space-y-3 sm:space-y-4 max-h-[250px] sm:max-h-[280px] md:max-h-[320px] lg:max-h-[400px] overflow-y-auto pr-2 min-w-[320px] sm:min-w-[360px] md:min-w-[400px]">
                  {/* Show prodi data when drilled down, otherwise show fakultas or kabupaten data */}
                  {activeView === 'fakultas' && drillLevel === 'prodi'
                    ? prodiData.map((item, index) => (
                        <div key={index} className="group min-w-[280px] sm:min-w-[320px] md:min-w-[360px]">
                          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <div className="flex-1 min-w-0 mr-2 sm:mr-4">
                              <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">{item.nama}</span>
                              <span className="text-[10px] sm:text-xs text-gray-500 ml-1 sm:ml-2 whitespace-nowrap">({item.jenjang})</span>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-green-600 whitespace-nowrap">{item.jumlah.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 overflow-hidden">
                            <motion.div
                              className="h-2 sm:h-2.5 rounded-full bg-green-500"
                              initial={{ width: 0 }}
                              whileInView={{ width: `${item.persentase}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                            />
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{item.persentase}% dari fakultas</div>
                        </div>
                      ))
                    : (activeView === 'fakultas' ? fakultasData : sebaranData).map((item, index) => (
                        <div key={index} className="group min-w-[280px] sm:min-w-[320px] md:min-w-[360px]">
                          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap flex-1 min-w-0 mr-2 sm:mr-4">
                              {activeView === 'fakultas' ? item.nama : item.provinsi}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-blue-600 whitespace-nowrap">{item.jumlah.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 overflow-hidden">
                            <motion.div
                              className={`h-2 sm:h-2.5 rounded-full ${
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
                          <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{item.persentase}% dari total mahasiswa</div>
                        </div>
                      ))
                  }
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats - Only show for Kabupaten/Kota view */}
          {activeView === 'kabupaten' && (
            <motion.div variants={itemVariants} className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {[
                {
                  label: "Mahasiswa Lokal",
                  value: statistics ? `${statistics.mahasiswa_lokal_persen}%` : "74%",
                  icon: "🏠",
                  color: "blue",
                  description: "Dari Provinsi Lampung"
                },
                {
                  label: "Mahasiswa Luar Daerah",
                  value: statistics ? `${statistics.mahasiswa_luar_daerah_persen}%` : "26%",
                  icon: "✈️",
                  color: "indigo",
                  description: "Dari Luar Provinsi Lampung"
                },
                {
                  label: "Provinsi Asal",
                  value: statistics ? `${statistics.total_provinsi}+` : "15+",
                  icon: "🗺️",
                  color: "purple",
                  description: "Total provinsi asal mahasiswa"
                },
                {
                  label: "Kabupaten Asal",
                  value: statistics ? `${statistics.total_kabupaten}+` : "50+",
                  icon: "🌟",
                  color: "pink",
                  description: "Total kabupaten/kota asal"
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-${stat.color}-200`}
                  title={stat.description}
                >
                  <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{stat.icon}</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-0.5 sm:mb-1">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs font-semibold text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
