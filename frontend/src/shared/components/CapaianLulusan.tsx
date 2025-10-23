"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo, useEffect, useState } from "react";
import { capaianLulusanService, CapaianLulusanStatistics } from "@/lib/services/capaianLulusanService";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function CapaianLulusan() {
  const [capaianData, setCapaianData] = useState<CapaianLulusanStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await capaianLulusanService.getStatistics();
        setCapaianData(data);
      } catch (error) {
        console.error("Error fetching capaian lulusan data:", error);
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

  // Chart status lulusan (Pie Chart)
  const statusLulusanChartOption = useMemo(() => {
    if (!capaianData) return {};

    const statusData = [
      { name: 'Bekerja', value: capaianData.status_lulusan.bekerja },
      { name: 'Wiraswasta', value: capaianData.status_lulusan.wiraswasta },
      { name: 'Kuliah Lanjut', value: capaianData.status_lulusan.kuliah_lanjut },
      { name: 'Belum Bekerja', value: capaianData.status_lulusan.belum_bekerja },
    ].filter(item => item.value > 0);

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} Alumni ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
      },
      legend: {
        bottom: '0%',
        left: 'center',
        textStyle: {
          fontSize: 11,
          fontWeight: 600,
        },
      },
      series: [
        {
          name: 'Status Lulusan',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 3,
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n{c}',
            fontSize: 11,
            fontWeight: 600,
          },
          emphasis: {
            scale: true,
            scaleSize: 8,
          },
          data: statusData.map((item, index) => ({
            value: item.value,
            name: item.name,
            itemStyle: {
              color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][index],
            },
          })),
        },
      ],
    };
  }, [capaianData]);

  // Chart kesesuaian bidang (Bar Chart)
  const kesesuaianBidangChartOption = useMemo(() => {
    if (!capaianData || !capaianData.kesesuaian_bidang) return {};

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: capaianData.kesesuaian_bidang.map(item => item.label),
        axisLabel: {
          color: '#1f2937',
          fontSize: 11,
          fontWeight: 600,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}',
          color: '#6b7280',
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb',
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: 'Jumlah Alumni',
          type: 'bar',
          data: capaianData.kesesuaian_bidang.map(item => item.jumlah),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#047857' },
              ],
            },
            borderRadius: [6, 6, 0, 0],
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            color: '#1f2937',
            fontSize: 11,
            fontWeight: 700,
          },
          barMaxWidth: 80,
        },
      ],
    };
  }, [capaianData]);

  // Chart waktu tunggu trend (Line Chart)
  const waktuTungguTrendChartOption = useMemo(() => {
    if (!capaianData || !capaianData.waktu_tunggu_trend) return {};

    const sortedData = [...capaianData.waktu_tunggu_trend].reverse();

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
        formatter: (params: any) => {
          const data = params[0];
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">Tahun ${data.name}</div>
            <div style="color: #3b82f6; font-weight: 700;">${data.value} bulan</div>
          </div>`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: sortedData.map(item => item.tahun),
        axisLabel: {
          color: '#1f2937',
          fontSize: 11,
          fontWeight: 600,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Bulan',
        axisLabel: {
          formatter: '{value}',
          color: '#6b7280',
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb',
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: 'Waktu Tunggu',
          type: 'line',
          data: sortedData.map(item => item.avg_waktu_tunggu),
          smooth: true,
          symbolSize: 10,
          itemStyle: {
            color: '#3b82f6',
          },
          lineStyle: {
            width: 3,
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            color: '#3b82f6',
            fontSize: 11,
            fontWeight: 700,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
              ],
            },
          },
        },
      ],
    };
  }, [capaianData]);

  // Chart income distribution (Bar Chart)
  const incomeDistributionChartOption = useMemo(() => {
    if (!capaianData || !capaianData.income_distribution) return {};

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: capaianData.income_distribution.map(item => item.range),
        axisLabel: {
          color: '#1f2937',
          fontSize: 11,
          fontWeight: 600,
          rotate: 20,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}',
          color: '#6b7280',
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb',
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: 'Jumlah Alumni',
          type: 'bar',
          data: capaianData.income_distribution.map(item => item.jumlah),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#f59e0b' },
                { offset: 1, color: '#d97706' },
              ],
            },
            borderRadius: [6, 6, 0, 0],
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            color: '#1f2937',
            fontSize: 11,
            fontWeight: 700,
          },
          barMaxWidth: 80,
        },
      ],
    };
  }, [capaianData]);

  // Chart level perusahaan (Horizontal Bar)
  const levelPerusahaanChartOption = useMemo(() => {
    if (!capaianData || !capaianData.level_perusahaan) return {};

    // Sort dan ambil top 10
    const topLevels = [...capaianData.level_perusahaan]
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 10);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}',
          color: '#6b7280',
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: topLevels.map(item => item.level),
        axisLabel: {
          color: '#1f2937',
          fontSize: 11,
          fontWeight: 600,
        },
      },
      series: [
        {
          name: 'Jumlah Alumni',
          type: 'bar',
          data: topLevels.map(item => item.jumlah),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#8b5cf6' },
                { offset: 1, color: '#6366f1' },
              ],
            },
            borderRadius: [0, 6, 6, 0],
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}',
            color: '#1f2937',
            fontSize: 11,
            fontWeight: 700,
          },
          barMaxWidth: 40,
        },
      ],
    };
  }, [capaianData]);

  // Chart lokasi kerja provinsi (Top 15 provinces - horizontal bar)
  const lokasiProvinsiChartOption = useMemo(() => {
    if (!capaianData) return {};

    const top15 = capaianData.lokasi_kerja_provinsi.slice(0, 15);
    const provinsiNames = top15.map(item => item.provinsi.replace('Prov. ', ''));
    const provinsiData = top15.map(item => item.jumlah);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#1f2937', fontSize: 13 },
        formatter: (params: any) => {
          const data = params[0];
          return `
            <div style="padding: 8px;">
              <div style="font-weight: 700; margin-bottom: 6px; color: #1f2937;">${data.name}</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-block; width: 10px; height: 10px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 2px;"></span>
                <span style="color: #6b7280;">Alumni:</span>
                <span style="font-weight: 700; color: #1f2937;">${data.value.toLocaleString('id-ID')}</span>
              </div>
            </div>
          `;
        },
      },
      grid: {
        left: '25%',
        right: '15%',
        top: '3%',
        bottom: '3%',
        containLabel: false,
      },
      xAxis: {
        type: 'value',
        splitLine: { show: true, lineStyle: { color: '#f3f4f6', type: 'dashed' } },
        axisLabel: { color: '#6b7280', fontSize: 11 },
      },
      yAxis: {
        type: 'category',
        data: provinsiNames,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#374151', fontSize: 11, fontWeight: 500 },
      },
      series: [
        {
          type: 'bar',
          data: provinsiData,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#34d399' },
              ],
            },
            borderRadius: [0, 6, 6, 0],
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}',
            color: '#1f2937',
            fontSize: 11,
            fontWeight: 700,
          },
          barMaxWidth: 28,
        },
      ],
    };
  }, [capaianData]);

  // Chart lokasi kerja internasional (horizontal bar)
  const lokasiInternationalChartOption = useMemo(() => {
    if (!capaianData) return {};

    const countries = capaianData.lokasi_kerja_international.map(item => item.negara);
    const countryData = capaianData.lokasi_kerja_international.map(item => item.jumlah);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: '#1f2937', fontSize: 13 },
        formatter: (params: any) => {
          const data = params[0];
          return `
            <div style="padding: 8px;">
              <div style="font-weight: 700; margin-bottom: 6px; color: #1f2937;">${data.name}</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-block; width: 10px; height: 10px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 2px;"></span>
                <span style="color: #6b7280;">Alumni:</span>
                <span style="font-weight: 700; color: #1f2937;">${data.value}</span>
              </div>
            </div>
          `;
        },
      },
      grid: {
        left: '30%',
        right: '15%',
        top: '5%',
        bottom: '5%',
        containLabel: false,
      },
      xAxis: {
        type: 'value',
        splitLine: { show: true, lineStyle: { color: '#f3f4f6', type: 'dashed' } },
        axisLabel: { color: '#6b7280', fontSize: 11 },
        minInterval: 1,
      },
      yAxis: {
        type: 'category',
        data: countries,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#374151', fontSize: 12, fontWeight: 500 },
      },
      series: [
        {
          type: 'bar',
          data: countryData,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#f59e0b' },
                { offset: 1, color: '#fbbf24' },
              ],
            },
            borderRadius: [0, 6, 6, 0],
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}',
            color: '#1f2937',
            fontSize: 11,
            fontWeight: 700,
          },
          barMaxWidth: 35,
        },
      ],
    };
  }, [capaianData]);

  if (isLoading) {
    return (
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 pb-1 leading-relaxed">
                Capaian Lulusan
              </h2>
              <div className="flex items-center justify-center mb-3">
                <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Memuat data capaian lulusan...
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
              Capaian Lulusan
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Data tracer study dan pencapaian alumni Universitas Lampung (5 tahun terakhir)
            </p>
          </motion.div>

          {/* Stats Cards */}
          {capaianData && (
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="text-3xl mb-3">👨‍🎓</div>
                <div className="text-3xl font-bold mb-1">{capaianData.total_alumni.toLocaleString('id-ID')}</div>
                <div className="text-sm font-semibold opacity-90">Total Alumni Terdata</div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="text-3xl mb-3">⏱️</div>
                <div className="text-3xl font-bold mb-1">{capaianData.avg_waktu_tunggu.toFixed(1)}</div>
                <div className="text-sm font-semibold opacity-90">Rata-rata Waktu Tunggu (Bulan)</div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="text-3xl mb-3">💰</div>
                <div className="text-2xl font-bold mb-1">Rp {(capaianData.avg_income / 1000000).toFixed(1)}jt</div>
                <div className="text-sm font-semibold opacity-90">Rata-rata Penghasilan /Bulan</div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="text-3xl mb-3">🚀</div>
                <div className="text-3xl font-bold mb-1">{capaianData.persentase_bekerja_sebelum_lulus}%</div>
                <div className="text-sm font-semibold opacity-90">Bekerja Sebelum Lulus</div>
              </motion.div>
            </motion.div>
          )}

          {/* Charts Grid - 3 Columns */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Status Lulusan Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Status Lulusan
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[350px]">
                  <ReactECharts
                    option={statusLulusanChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Kesesuaian Bidang Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-emerald-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  Kesesuaian Bidang Kerja
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[350px]">
                  <ReactECharts
                    option={kesesuaianBidangChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Waktu Tunggu Trend Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-blue-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Tren Waktu Tunggu Kerja
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[350px]">
                  <ReactECharts
                    option={waktuTungguTrendChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Grid - 2 Columns Full Width */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Income Distribution Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-amber-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  Distribusi Penghasilan Alumni
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[400px]">
                  <ReactECharts
                    option={incomeDistributionChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Level Perusahaan Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 bg-purple-600">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                  Level Tempat Kerja Alumni
                </h3>
              </div>
              <div className="p-6">
                <div className="h-[400px]">
                  <ReactECharts
                    option={levelPerusahaanChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Lokasi Kerja Section */}
          <div className="mt-8">
            <motion.div variants={itemVariants} className="mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Sebaran Lokasi Kerja Alumni
              </h3>
              <p className="text-gray-600">Distribusi wilayah kerja alumni berdasarkan hasil tracer study</p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Lokasi Kerja Provinsi (Indonesia) Chart */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-emerald-600">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Sebaran Provinsi di Indonesia (Top 15)
                  </h3>
                </div>
                <div className="p-6">
                  <div className="h-[500px]">
                    <ReactECharts
                      option={lokasiProvinsiChartOption}
                      style={{ height: "100%", width: "100%" }}
                      opts={{ renderer: "svg" }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Lokasi Kerja International Chart */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-amber-600">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" />
                    </svg>
                    Alumni Bekerja di Luar Negeri
                  </h3>
                </div>
                <div className="p-6">
                  <div className="h-[500px] flex items-center justify-center">
                    {capaianData && capaianData.lokasi_kerja_international.length > 0 ? (
                      <ReactECharts
                        option={lokasiInternationalChartOption}
                        style={{ height: "100%", width: "100%" }}
                        opts={{ renderer: "svg" }}
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" />
                        </svg>
                        <p className="text-sm">Tidak ada data alumni yang bekerja di luar negeri</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Info Note */}
          <motion.div variants={itemVariants} className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="text-3xl">📊</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Tentang Data Tracer Study</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Data ini dikumpulkan dari tracer study alumni Universitas Lampung yang lulus dalam 5 tahun terakhir (berdasarkan tanggal kelulusan).
                  Total {capaianData?.total_alumni.toLocaleString('id-ID')} alumni telah berpartisipasi dalam survei tracer study ini,
                  dengan rata-rata waktu tunggu mendapat pekerjaan {capaianData?.avg_waktu_tunggu.toFixed(1)} bulan dan rata-rata penghasilan Rp {capaianData ? (capaianData.avg_income / 1000000).toFixed(1) : 0} juta per bulan.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
