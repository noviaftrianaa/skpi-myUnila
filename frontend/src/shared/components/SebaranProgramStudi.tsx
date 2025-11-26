"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { Card, CardBody, Button, Spinner } from "@heroui/react";
import { FiArrowLeft, FiBook, FiAward, FiBarChart2 } from "react-icons/fi";
import dashboardService from "@/lib/services/public/dashboardService";

// Import ECharts dynamically (same as SebaranMahasiswa)
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
import type {
  FakultasSebaranData,
  ProdiSebaranData,
  SebaranStatistics,
} from "@/lib/types/dashboardTypes";

export default function SebaranProgramStudi() {
  const [fakultasData, setFakultasData] = useState<FakultasSebaranData[]>([]);
  const [prodiData, setProdiData] = useState<ProdiSebaranData[]>([]);
  const [statistics, setStatistics] = useState<SebaranStatistics | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Color map for jenjang
  const jenjangColors: Record<string, string> = {
    'D3': '#3b82f6',
    'D4': '#2563eb',
    'S1': '#10b981',
    'S1 Terapan': '#059669',
    'Profesi': '#8b5cf6',
    'S2': '#f59e0b',
    'S2 Terapan': '#d97706',
    'S3': '#ef4444'
  };

  // Function to drill down into fakultas -> prodi
  const handleDrillDown = async (fakultasId: string, fakultasNama: string) => {
    try {
      const response = await dashboardService.getProdiByFakultas(fakultasId);
      if (response.success && response.data) {
        setProdiData(response.data);
        setSelectedFakultas({ id: fakultasId, nama: fakultasNama });
        setDrillLevel('prodi');
      }
    } catch (err) {
      console.error('Error fetching prodi data:', err);
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
        const response = await dashboardService.getSebaranFakultas();

        if (response.success) {
          setFakultasData(response.data.fakultas);
          setStatistics(response.data.statistics);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare fakultas chart data
  const fakultasChartData = fakultasData.map(fakultas => {
    const data: any = {
      nama: fakultas.nama,
      id: fakultas.id,
      total: fakultas.total_prodi,
    };

    // Add each jenjang count
    fakultas.jenjang_counts.forEach(jenjang => {
      data[jenjang.jenjang] = jenjang.jumlah;
    });

    return data;
  });

  // Get all unique jenjang types for fakultas chart
  const jenjangTypes = Array.from(
    new Set(fakultasData.flatMap(f => f.jenjang_counts.map(j => j.jenjang)))
  ).sort((a, b) => {
    const priority: Record<string, number> = {
      'D3': 1, 'D4': 2, 'S1': 3, 'S1 Terapan': 4, 'Profesi': 5, 'S2': 6, 'S2 Terapan': 7, 'S3': 8, 'Sp-1': 9
    };
    return (priority[a] || 99) - (priority[b] || 99);
  });

  // Compute jenjang totals from fakultas data
  const jenjangTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    fakultasData.forEach(fakultas => {
      fakultas.jenjang_counts.forEach(jc => {
        totals[jc.jenjang] = (totals[jc.jenjang] || 0) + jc.jumlah;
      });
    });
    return totals;
  }, [fakultasData]);

  // Prepare prodi chart data - horizontal bar chart
  const prodiChartData = useMemo(() => {
    return [...prodiData]
      .sort((a, b) => {
        const priority: Record<string, number> = {
          'D3': 1, 'D4': 2, 'S1': 3, 'S1 Terapan': 4, 'Profesi': 5, 'S2': 6, 'S2 Terapan': 7, 'S3': 8
        };
        return (priority[a.jenjang] || 99) - (priority[b.jenjang] || 99);
      })
      .map((prodi) => ({
        nama: prodi.nama.length > 40 ? prodi.nama.substring(0, 40) + '...' : prodi.nama,
        fullName: prodi.nama,
        jenjang: prodi.jenjang,
        akreditasi: prodi.akreditasi,
        value: 1, // Just for display
        color: jenjangColors[prodi.jenjang] || '#6b7280'
      }));
  }, [prodiData]);

  // Fakultas Chart Options (Stacked Horizontal Bar)
  const fakultasChartOptions = useMemo(() => {
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
          let total = 0;
          let tooltipContent = `<div style="padding: 8px;"><div style="font-weight: 600; color: #1f2937; margin-bottom: 6px;">${params[0].name}</div>`;

          params.forEach((item: any) => {
            total += item.value;
            tooltipContent += `<div style="display: flex; align-items: center; margin: 4px 0;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${item.color}; margin-right: 6px;"></span>
              <span style="color: #6b7280; font-size: 12px;">${item.seriesName}:</span>
              <span style="margin-left: auto; font-weight: 600; color: #1f2937; font-size: 13px;">${item.value}</span>
            </div>`;
          });

          tooltipContent += `<div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #6b7280; font-size: 12px;">Total:</span>
              <span style="font-weight: 700; color: #1f2937; font-size: 14px;">${total}</span>
            </div>
          </div>`;
          tooltipContent += `<div style="color: #3b82f6; font-size: 11px; margin-top: 6px; font-weight: 600;">Klik untuk detail prodi →</div></div>`;

          return tooltipContent;
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
        data: fakultasData.map(f => f.nama.replace('Fakultas ', '')),
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
      series: jenjangTypes.map(jenjang => ({
        name: jenjang,
        type: "bar",
        stack: "total",
        data: fakultasData.map(fakultas => {
          const jenjangItem = fakultas.jenjang_counts.find(j => j.jenjang === jenjang);
          return jenjangItem ? jenjangItem.jumlah : 0;
        }),
        itemStyle: {
          color: jenjangColors[jenjang] || "#6b7280",
          borderRadius: jenjang === jenjangTypes[jenjangTypes.length - 1] ? [0, 6, 6, 0] : [0, 0, 0, 0],
        },
        label: {
          show: false,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0,0,0,0.3)",
          },
        },
      })),
    };
  }, [fakultasData, jenjangTypes]);

  // Prodi Chart Options (Simple Horizontal Bar)
  const prodiChartOptions = useMemo(() => {
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
          const prodiItem = prodiChartData[item.dataIndex];
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${prodiItem.fullName}</div>
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 6px;">
              <span style="color: #6b7280; font-size: 12px;">Jenjang:</span>
              <span style="font-weight: 600; color: ${prodiItem.color}; font-size: 13px;">${prodiItem.jenjang}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
              <span style="color: #6b7280; font-size: 12px;">Akreditasi:</span>
              <span style="font-weight: 600; color: #1f2937; font-size: 13px;">${prodiItem.akreditasi || 'N/A'}</span>
            </div>
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
        max: 1,
        show: false,
      },
      yAxis: {
        type: "category",
        data: prodiChartData.map(p => p.nama),
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
          data: prodiChartData.map((item) => ({
            value: item.value,
            itemStyle: {
              color: item.color,
              borderRadius: [0, 6, 6, 0],
            },
          })),
          barWidth: "60%",
          label: {
            show: true,
            position: "right",
            formatter: (params: any) => {
              const prodiItem = prodiChartData[params.dataIndex];
              return `${prodiItem.jenjang}`;
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
  }, [prodiData, prodiChartData]);

  return (
    <section id="sebaran-program-studi" className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        className="container mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Section Header */}
        <motion.div className="text-center mb-8 sm:mb-10" variants={itemVariants}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 sm:mb-3 pb-1 leading-relaxed px-2">
            Sebaran Program Studi
          </h2>
          <div className="flex items-center justify-center mb-2 sm:mb-3">
            <div className="h-1 w-16 sm:w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-3xl mx-auto">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span className="font-medium text-xs sm:text-sm">Klik bar untuk detail fakultas</span>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" label="Memuat data..." />
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Column */}
            <motion.div className="lg:col-span-2" variants={itemVariants}>
              <Card className="shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden rounded-2xl">
                <CardBody className="p-0">
                  {/* Chart Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                          <FiBarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {drillLevel === 'fakultas' ? 'Sebaran per Fakultas' : `Detail: ${selectedFakultas?.nama}`}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {drillLevel === 'fakultas' ? 'Distribusi program studi berdasarkan jenjang' : 'Program studi per jenjang pendidikan'}
                          </p>
                        </div>
                      </div>
                      {drillLevel === 'prodi' && (
                        <Button
                          color="primary"
                          variant="flat"
                          size="sm"
                          startContent={<FiArrowLeft />}
                          onClick={handleDrillUp}
                          className="shadow-sm"
                        >
                          Kembali
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Chart Content */}
                  <div className="p-6 bg-white dark:bg-gray-900">
                    <div className="h-[400px] lg:h-[600px]">
                      {drillLevel === 'fakultas' && fakultasData.length > 0 && (
                        <ReactECharts
                          key="fakultas-chart"
                          option={fakultasChartOptions}
                          notMerge={true}
                          lazyUpdate={false}
                          style={{ height: "100%", width: "100%" }}
                          opts={{ renderer: "svg" }}
                          onEvents={{
                            click: (params: any) => {
                              const clickedFakultas = fakultasData[params.dataIndex];
                              if (clickedFakultas) {
                                handleDrillDown(clickedFakultas.id, clickedFakultas.nama);
                              }
                            }
                          }}
                        />
                      )}

                      {drillLevel === 'prodi' && prodiData.length > 0 && (
                        <ReactECharts
                          key="prodi-chart"
                          option={prodiChartOptions}
                          notMerge={true}
                          lazyUpdate={false}
                          style={{ height: "100%", width: "100%" }}
                          opts={{ renderer: "svg" }}
                        />
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Statistics Column */}
            <motion.div className="space-y-6" variants={itemVariants}>
              {/* Statistics Card */}
              <Card className="shadow-xl border border-blue-200 dark:border-blue-800 overflow-hidden rounded-2xl">
                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-2xl">
                        <FiBook className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Statistik</h3>
                        <p className="text-xs text-blue-100">Universitas Lampung</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="text-3xl font-extrabold mb-1">{statistics?.total_prodi || 0}</div>
                        <div className="text-xs text-blue-100 font-medium">Program Studi</div>
                      </motion.div>
                      <motion.div
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="text-3xl font-extrabold mb-1">{statistics?.total_fakultas || 0}</div>
                        <div className="text-xs text-blue-100 font-medium">Fakultas</div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Per Jenjang Cards */}
              <Card className="shadow-xl border border-gray-200 dark:border-gray-700 rounded-2xl">
                <CardBody className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm">
                      <FiAward className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        Distribusi Jenjang
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Breakdown per jenjang pendidikan</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* D3 */}
                    <motion.div
                      className="group flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-md transition-all duration-200"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full ring-4 ring-blue-500/20"></div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">D3</span>
                      </div>
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{jenjangTotals['D3'] || 0}</span>
                    </motion.div>

                    {/* D4 */}
                    {jenjangTotals['D4'] > 0 && (
                      <motion.div
                        className="group flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/10 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 hover:shadow-md transition-all duration-200"
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full ring-4 ring-indigo-500/20"></div>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">D4</span>
                        </div>
                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">{jenjangTotals['D4'] || 0}</span>
                      </motion.div>
                    )}

                    {/* S1 */}
                    <motion.div
                      className="group flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-xl border border-green-200/50 dark:border-green-800/50 hover:shadow-md transition-all duration-200"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full ring-4 ring-green-500/20"></div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">S1</span>
                      </div>
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">{jenjangTotals['S1'] || 0}</span>
                    </motion.div>

                    {/* Profesi */}
                    {jenjangTotals['Profesi'] > 0 && (
                      <motion.div
                        className="group flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl border border-purple-200/50 dark:border-purple-800/50 hover:shadow-md transition-all duration-200"
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 bg-purple-500 rounded-full ring-4 ring-purple-500/20"></div>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Profesi</span>
                        </div>
                        <span className="text-sm font-bold text-purple-700 dark:text-purple-400">{jenjangTotals['Profesi'] || 0}</span>
                      </motion.div>
                    )}

                    {/* S2 */}
                    <motion.div
                      className="group flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-xl border border-orange-200/50 dark:border-orange-800/50 hover:shadow-md transition-all duration-200"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-full ring-4 ring-orange-500/20"></div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">S2</span>
                      </div>
                      <span className="text-sm font-bold text-orange-700 dark:text-orange-400">{jenjangTotals['S2'] || 0}</span>
                    </motion.div>

                    {/* S3 */}
                    <motion.div
                      className="group flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 rounded-xl border border-red-200/50 dark:border-red-800/50 hover:shadow-md transition-all duration-200"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full ring-4 ring-red-500/20"></div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">S3</span>
                      </div>
                      <span className="text-sm font-bold text-red-700 dark:text-red-400">{jenjangTotals['S3'] || 0}</span>
                    </motion.div>

                    {/* Sp-1 / Spesialis */}
                    {jenjangTotals['Sp-1'] > 0 && (
                      <motion.div
                        className="group flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-pink-100/50 dark:from-pink-900/20 dark:to-pink-800/10 rounded-xl border border-pink-200/50 dark:border-pink-800/50 hover:shadow-md transition-all duration-200"
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 bg-pink-500 rounded-full ring-4 ring-pink-500/20"></div>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sp-1</span>
                        </div>
                        <span className="text-sm font-bold text-pink-700 dark:text-pink-400">{jenjangTotals['Sp-1'] || 0}</span>
                      </motion.div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
