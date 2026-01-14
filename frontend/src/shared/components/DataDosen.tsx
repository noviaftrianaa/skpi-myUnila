"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import { dosenService, type DosenStatistics, type HeatmapPendidikanJabfung, type HeatmapUsiaPendidikan, type HeatmapUsiaJabfung, type HeatmapIkatanStatus, type SertifikasiJabfungData, type GenderUsiaData, type TrenSertifikasiData, type TrenJabfungData } from "@/lib/services/public/dosenService";

// Import ECharts dynamically to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_PUBLIC_API_URL}`
  : 'http://localhost:9800/public-service/api/v1';

export default function DataDosen() {
  const [statistics, setStatistics] = useState<DosenStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  // State for sebaran dosen drilldown
  const [fakultasSebaranData, setFakultasSebaranData] = useState<any[]>([]);
  const [prodiSebaranData, setProdiSebaranData] = useState<any[]>([]);
  const [drillLevel, setDrillLevel] = useState<'fakultas' | 'prodi'>('fakultas');
  const [selectedFakultas, setSelectedFakultas] = useState<{id: string, nama: string} | null>(null);

  // State for heatmaps
  const [heatmapData, setHeatmapData] = useState<HeatmapPendidikanJabfung | null>(null);
  const [heatmapUsiaData, setHeatmapUsiaData] = useState<HeatmapUsiaPendidikan | null>(null);
  const [heatmapUsiaJabfungData, setHeatmapUsiaJabfungData] = useState<HeatmapUsiaJabfung | null>(null);
  const [heatmapIkatanStatusData, setHeatmapIkatanStatusData] = useState<HeatmapIkatanStatus | null>(null);

  // State for Chart 5 & 6
  const [sertifikasiJabfungData, setSertifikasiJabfungData] = useState<SertifikasiJabfungData | null>(null);
  const [genderUsiaData, setGenderUsiaData] = useState<GenderUsiaData | null>(null);

  // State for Chart 7 & 8
  const [trenSertifikasiData, setTrenSertifikasiData] = useState<TrenSertifikasiData | null>(null);
  const [trenJabfungData, setTrenJabfungData] = useState<TrenJabfungData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dosenService.getStatistics();
        setStatistics(data);

        // Fetch sebaran fakultas data
        const sebaranResponse = await fetch(`${API_URL}/dosen-sebaran/fakultas`);
        const sebaranJson = await sebaranResponse.json();

        if (sebaranJson.success) {
          const fakData = sebaranJson.data.data.map((item: any) => ({
            nama: item.nama_fakultas,
            jumlah: item.jumlah_dosen,
            mahasiswa: item.jumlah_mahasiswa,
            rasio: item.rasio,
            persentase: parseFloat(item.persentase.toFixed(1)),
            id: item.id_fakultas,
          }));
          setFakultasSebaranData(fakData);
        }

        // Fetch heatmap data
        const heatmapResult = await dosenService.getHeatmapPendidikanJabfung();
        setHeatmapData(heatmapResult);

        // Fetch heatmap usia vs pendidikan
        const heatmapUsiaResult = await dosenService.getHeatmapUsiaPendidikan();
        setHeatmapUsiaData(heatmapUsiaResult);

        // Fetch heatmap usia vs jabfung
        const heatmapUsiaJabfungResult = await dosenService.getHeatmapUsiaJabfung();
        setHeatmapUsiaJabfungData(heatmapUsiaJabfungResult);

        // Fetch heatmap ikatan kerja vs status pegawai
        const heatmapIkatanStatusResult = await dosenService.getHeatmapIkatanStatus();
        setHeatmapIkatanStatusData(heatmapIkatanStatusResult);

        // Fetch sertifikasi per jabfung (Chart 5)
        const sertifikasiResult = await dosenService.getSertifikasiJabfung();
        setSertifikasiJabfungData(sertifikasiResult);

        // Fetch gender & usia (Chart 6)
        const genderUsiaResult = await dosenService.getGenderUsia();
        setGenderUsiaData(genderUsiaResult);

        // Fetch tren sertifikasi (Chart 7)
        const trenSertifikasiResult = await dosenService.getTrenSertifikasi();
        setTrenSertifikasiData(trenSertifikasiResult);

        // Fetch tren jabfung (Chart 8)
        const trenJabfungResult = await dosenService.getTrenJabfung();
        setTrenJabfungData(trenJabfungResult);
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

  // Drilldown functions for sebaran dosen
  const handleDrillDown = async (fakultasId: string, fakultasNama: string) => {
    try {
      setLoading(true);
      // Add cache buster to prevent stale data
      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetch(`${API_URL}/dosen-sebaran/fakultas/${fakultasId}/prodi${cacheBuster}`);
      const data = await response.json();

      if (data.success) {
        console.log('Drilldown API response:', data.data.data[0]); // Debug log

        const prodiDataFormatted = data.data.data.map((item: any) => ({
          id: item.id_prodi,
          nama: item.nama_prodi,
          jenjang: item.jenjang,
          jumlah: item.jumlah_dosen,
          mahasiswa: item.jumlah_mahasiswa,
          rasio: item.rasio,
          persentase: parseFloat(item.persentase.toFixed(1)),
        }));

        console.log('Formatted prodi data:', prodiDataFormatted[0]); // Debug log

        setProdiSebaranData(prodiDataFormatted);
        setSelectedFakultas({ id: fakultasId, nama: fakultasNama });
        setDrillLevel('prodi');

        // Prevent scroll jump - smooth scroll to chart
        setTimeout(() => {
          const chartElement = document.getElementById('sebaran-dosen-chart');
          if (chartElement) {
            chartElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      }
    } catch (err) {
      console.error('Error drilling down:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrillUp = () => {
    setDrillLevel('fakultas');
    setSelectedFakultas(null);
    setProdiSebaranData([]);

    // Prevent scroll jump - smooth scroll to chart
    setTimeout(() => {
      const chartElement = document.getElementById('sebaran-dosen-chart');
      if (chartElement) {
        chartElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  // Data dosen berdasarkan jenjang pendidikan
  const pendidikanData = statistics?.pendidikan.data || [];

  // Data dosen berdasarkan jabatan fungsional (all categories)
  const jabatanData = statistics?.jabatan.data || [];

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
        data: jabatanData.map((item, index) => {
          // Define color mapping based on jabatan name
          const colorMap: Record<string, [string, string]> = {
            'Profesor': ['#10b981', '#34d399'],        // Green
            'Lektor Kepala': ['#8b5cf6', '#a78bfa'],   // Purple
            'Lektor': ['#3b82f6', '#60a5fa'],          // Blue
            'Asisten Ahli': ['#f59e0b', '#fbbf24'],    // Orange
            'Belum Ada Jabatan': ['#6b7280', '#9ca3af'], // Gray
          };

          // Get color based on jabatan name, fallback to index-based colors
          const [colorStart, colorEnd] = colorMap[item.jabatan] ||
            [['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'][index % 5],
             ['#34d399', '#60a5fa', '#a78bfa', '#fbbf24', '#f472b6'][index % 5]];

          return {
            value: item.jumlah,
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: colorStart },
                  { offset: 1, color: colorEnd },
                ],
              },
              borderRadius: [6, 6, 0, 0],
            },
          };
        }),
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

  // Chart configuration untuk sebaran dosen per fakultas
  const fakultasSebaranChartOption = useMemo(() => {
    if (!fakultasSebaranData || fakultasSebaranData.length === 0) {
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
          const dataItem = fakultasSebaranData.find(d => d.nama === item.name);
          return `<div style="padding: 10px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 6px;">${item.name}</div>
            <div style="color: #f97316; font-size: 20px; font-weight: 700; margin-bottom: 4px;">${item.value} dosen</div>
            <div style="color: #6b7280; font-size: 13px; margin-bottom: 2px;">Mahasiswa: ${dataItem?.mahasiswa?.toLocaleString() || 0}</div>
            <div style="color: #059669; font-size: 14px; font-weight: 600;">Rasio: ${dataItem?.rasio || '1:0'}</div>
            <div style="color: #9ca3af; font-size: 11px; margin-top: 6px; font-style: italic;">💡 Klik untuk lihat per prodi →</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#f97316",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;",
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
        data: fakultasSebaranData.map(item => item.nama),
        axisLabel: {
          color: "#1f2937",
          fontSize: 10,
          fontWeight: 600,
          interval: 0,
          rotate: 20,
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
          data: fakultasSebaranData.map((item) => ({
            value: item.jumlah,
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "#f97316" },
                  { offset: 1, color: "#fb923c" },
                ],
              },
              borderRadius: [6, 6, 0, 0],
            },
          })),
          barWidth: "55%",
          label: {
            show: true,
            position: "top",
            formatter: "{c}",
            color: "#1f2937",
            fontSize: 11,
            fontWeight: 700,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(249, 115, 22, 0.4)",
            },
          },
        },
      ],
    };
  }, [fakultasSebaranData]);

  // Chart configuration untuk sebaran dosen per prodi (drilldown)
  const prodiSebaranChartOption = useMemo(() => {
    if (!prodiSebaranData || prodiSebaranData.length === 0) {
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
          const dataItem = prodiSebaranData[item.dataIndex];
          return `<div style="padding: 10px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${dataItem?.nama || item.name}</div>
            <div style="color: #d97706; font-size: 12px; margin-bottom: 6px; font-weight: 500;">${dataItem?.jenjang || ''}</div>
            <div style="color: #f59e0b; font-size: 20px; font-weight: 700; margin-bottom: 4px;">${item.value} dosen</div>
            <div style="color: #6b7280; font-size: 13px; margin-bottom: 2px;">Mahasiswa: ${dataItem?.mahasiswa?.toLocaleString() || 0}</div>
            <div style="color: #059669; font-size: 14px; font-weight: 600;">Rasio: ${dataItem?.rasio || '1:0'}</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#f59e0b",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;",
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
        data: prodiSebaranData.map(item => `${item.nama}\n(${item.jenjang})`),
        axisLabel: {
          color: "#1f2937",
          fontSize: 9,
          fontWeight: 600,
          interval: 0,
          rotate: 25,
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
          data: prodiSebaranData.map((item) => ({
            value: item.jumlah,
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "#f59e0b" },
                  { offset: 1, color: "#fbbf24" },
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
            fontSize: 10,
            fontWeight: 700,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(245, 158, 11, 0.4)",
            },
          },
        },
      ],
    };
  }, [prodiSebaranData]);

  // Heatmap chart option: Jenjang Pendidikan dan Jabatan Fungsional
  const heatmapChartOption = useMemo(() => {
    if (!heatmapData || !heatmapData.data || heatmapData.data.length === 0) {
      return {
        series: [{ type: "heatmap", data: [] }]
      };
    }

    return {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const xLabel = heatmapData.xAxis[params.data[0]];
          const yLabel = heatmapData.yAxis[params.data[1]];
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${yLabel}</div>
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">${xLabel}</div>
            <div style="color: #8b5cf6; font-size: 20px; font-weight: 700;">${params.data[2]} dosen</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#8b5cf6",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      grid: {
        left: '15%',
        right: '10%',
        top: '10%',
        bottom: '20%',
      },
      xAxis: {
        type: 'category',
        data: heatmapData.xAxis,
        splitArea: { show: true },
        axisLabel: {
          color: "#1f2937",
          fontSize: 10,
          fontWeight: 600,
          interval: 0,
          rotate: 20,
        },
      },
      yAxis: {
        type: 'category',
        data: heatmapData.yAxis,
        splitArea: { show: true },
        axisLabel: {
          color: "#1f2937",
          fontSize: 11,
          fontWeight: 600,
        },
      },
      visualMap: {
        min: 0,
        max: heatmapData.maxValue,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#f3e8ff', '#c084fc', '#a855f7', '#9333ea', '#7c3aed', '#6d28d9']
        },
        textStyle: {
          color: '#6b7280',
          fontSize: 10,
        },
      },
      series: [{
        name: 'Jumlah Dosen',
        type: 'heatmap',
        data: heatmapData.data,
        label: {
          show: true,
          formatter: (params: any) => params.data[2] > 0 ? params.data[2] : '',
          color: '#1f2937',
          fontSize: 11,
          fontWeight: 700,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(139, 92, 246, 0.5)',
          },
        },
      }],
    };
  }, [heatmapData]);

  // Heatmap chart option: Kelompok Usia dan Jenjang Pendidikan
  const heatmapUsiaChartOption = useMemo(() => {
    if (!heatmapUsiaData || !heatmapUsiaData.data || heatmapUsiaData.data.length === 0) {
      return {
        series: [{ type: "heatmap", data: [] }]
      };
    }

    return {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const xLabel = heatmapUsiaData.xAxis[params.data[0]];
          const yLabel = heatmapUsiaData.yAxis[params.data[1]];
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">Usia ${yLabel} tahun</div>
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">${xLabel}</div>
            <div style="color: #059669; font-size: 20px; font-weight: 700;">${params.data[2]} dosen</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#059669",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      grid: {
        left: '12%',
        right: '10%',
        top: '10%',
        bottom: '20%',
      },
      xAxis: {
        type: 'category',
        data: heatmapUsiaData.xAxis,
        splitArea: { show: true },
        axisLabel: {
          color: "#1f2937",
          fontSize: 10,
          fontWeight: 600,
          interval: 0,
          rotate: 15,
        },
      },
      yAxis: {
        type: 'category',
        data: heatmapUsiaData.yAxis,
        splitArea: { show: true },
        axisLabel: {
          color: "#1f2937",
          fontSize: 11,
          fontWeight: 600,
          formatter: (value: string) => `${value} th`,
        },
      },
      visualMap: {
        min: 0,
        max: heatmapUsiaData.maxValue,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#ecfdf5', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857']
        },
        textStyle: {
          color: '#6b7280',
          fontSize: 10,
        },
      },
      series: [{
        name: 'Jumlah Dosen',
        type: 'heatmap',
        data: heatmapUsiaData.data,
        label: {
          show: true,
          formatter: (params: any) => params.data[2] > 0 ? params.data[2] : '',
          color: '#1f2937',
          fontSize: 11,
          fontWeight: 700,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(5, 150, 105, 0.5)',
          },
        },
      }],
    };
  }, [heatmapUsiaData]);

  // Heatmap chart option: Kelompok Usia dan Jabatan Fungsional
  const heatmapUsiaJabfungChartOption = useMemo(() => {
    if (!heatmapUsiaJabfungData || !heatmapUsiaJabfungData.data || heatmapUsiaJabfungData.data.length === 0) {
      return {
        series: [{ type: "heatmap", data: [] }]
      };
    }

    return {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const xLabel = heatmapUsiaJabfungData.xAxis[params.data[0]];
          const yLabel = heatmapUsiaJabfungData.yAxis[params.data[1]];
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">Usia ${yLabel} tahun</div>
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">${xLabel}</div>
            <div style="color: #ea580c; font-size: 20px; font-weight: 700;">${params.data[2]} dosen</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#ea580c",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      grid: {
        left: '12%',
        right: '10%',
        top: '10%',
        bottom: '20%',
      },
      xAxis: {
        type: 'category',
        data: heatmapUsiaJabfungData.xAxis,
        splitArea: { show: true },
        axisLabel: {
          color: "#1f2937",
          fontSize: 9,
          fontWeight: 600,
          interval: 0,
          rotate: 20,
        },
      },
      yAxis: {
        type: 'category',
        data: heatmapUsiaJabfungData.yAxis,
        splitArea: { show: true },
        axisLabel: {
          color: "#1f2937",
          fontSize: 11,
          fontWeight: 600,
          formatter: (value: string) => `${value} th`,
        },
      },
      visualMap: {
        min: 0,
        max: heatmapUsiaJabfungData.maxValue,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#fff7ed', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c']
        },
        textStyle: {
          color: '#6b7280',
          fontSize: 10,
        },
      },
      series: [{
        name: 'Jumlah Dosen',
        type: 'heatmap',
        data: heatmapUsiaJabfungData.data,
        label: {
          show: true,
          formatter: (params: any) => params.data[2] > 0 ? params.data[2] : '',
          color: '#1f2937',
          fontSize: 10,
          fontWeight: 700,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(234, 88, 12, 0.5)',
          },
        },
      }],
    };
  }, [heatmapUsiaJabfungData]);

  // Heatmap chart option: Ikatan Kerja dan Status Pegawai
  const heatmapIkatanStatusChartOption = useMemo(() => {
    if (!heatmapIkatanStatusData || !heatmapIkatanStatusData.data || heatmapIkatanStatusData.data.length === 0) {
      return {
        series: [{ type: "heatmap", data: [] }]
      };
    }

    return {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const xLabel = heatmapIkatanStatusData.xAxis[params.data[0]];
          const yLabel = heatmapIkatanStatusData.yAxis[params.data[1]];
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${yLabel}</div>
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Status: ${xLabel}</div>
            <div style="color: #0891b2; font-size: 20px; font-weight: 700;">${params.data[2]} dosen</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#0891b2",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      grid: {
        left: '20%',
        right: '15%',
        top: '15%',
        bottom: '25%',
      },
      xAxis: {
        type: 'category',
        data: heatmapIkatanStatusData.xAxis,
        splitArea: { show: true },
        axisLabel: {
          color: "#1f2937",
          fontSize: 12,
          fontWeight: 600,
        },
      },
      yAxis: {
        type: 'category',
        data: heatmapIkatanStatusData.yAxis,
        splitArea: { show: true },
        axisLabel: {
          color: "#1f2937",
          fontSize: 11,
          fontWeight: 600,
        },
      },
      visualMap: {
        min: 0,
        max: heatmapIkatanStatusData.maxValue,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#ecfeff', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490']
        },
        textStyle: {
          color: '#6b7280',
          fontSize: 10,
        },
      },
      series: [{
        name: 'Jumlah Dosen',
        type: 'heatmap',
        data: heatmapIkatanStatusData.data,
        label: {
          show: true,
          formatter: (params: any) => params.data[2] > 0 ? params.data[2] : '',
          color: '#1f2937',
          fontSize: 14,
          fontWeight: 700,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(8, 145, 178, 0.5)',
          },
        },
      }],
    };
  }, [heatmapIkatanStatusData]);

  // Chart 5: Diverging Bar - Sertifikasi per Jabatan Fungsional
  const sertifikasiChartOption = useMemo(() => {
    if (!sertifikasiJabfungData || !sertifikasiJabfungData.data || sertifikasiJabfungData.data.length === 0) {
      return {
        series: [{ type: "bar", data: [] }]
      };
    }

    const jabatanLabels = sertifikasiJabfungData.data.map(item => item.jabatan);
    const sudahData = sertifikasiJabfungData.data.map(item => item.sudah);
    const belumData = sertifikasiJabfungData.data.map(item => -item.belum); // Negative for left side

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const jabatan = params[0].name;
          const sudah = Math.abs(params.find((p: any) => p.seriesName === 'Sudah Sertifikasi')?.value || 0);
          const belum = Math.abs(params.find((p: any) => p.seriesName === 'Belum Sertifikasi')?.value || 0);
          const total = sudah + belum;
          const persenSudah = total > 0 ? ((sudah / total) * 100).toFixed(1) : '0';
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 6px;">${jabatan}</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #059669;">✓ Sudah:</span>
              <span style="font-weight: 700; color: #059669;">${sudah}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #dc2626;">✗ Belum:</span>
              <span style="font-weight: 700; color: #dc2626;">${belum}</span>
            </div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 4px; margin-top: 4px;">
              <span style="color: #6b7280; font-size: 12px;">Tingkat Sertifikasi: ${persenSudah}%</span>
            </div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#6366f1",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      legend: {
        data: ['Sudah Sertifikasi', 'Belum Sertifikasi'],
        bottom: 0,
        textStyle: { fontSize: 11, fontWeight: 600 },
      },
      grid: {
        left: '3%',
        right: '3%',
        top: '5%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => Math.abs(value).toString(),
          color: '#6b7280',
          fontSize: 10,
        },
        splitLine: {
          lineStyle: { color: '#e5e7eb', type: 'dashed' },
        },
      },
      yAxis: {
        type: 'category',
        data: jabatanLabels,
        axisLabel: {
          color: '#1f2937',
          fontSize: 11,
          fontWeight: 600,
        },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          name: 'Sudah Sertifikasi',
          type: 'bar',
          stack: 'total',
          data: sudahData,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#34d399' },
              ],
            },
            borderRadius: [0, 4, 4, 0],
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}',
            color: '#059669',
            fontSize: 10,
            fontWeight: 700,
          },
        },
        {
          name: 'Belum Sertifikasi',
          type: 'bar',
          stack: 'total',
          data: belumData,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#f87171' },
                { offset: 1, color: '#ef4444' },
              ],
            },
            borderRadius: [4, 0, 0, 4],
          },
          label: {
            show: true,
            position: 'left',
            formatter: (params: any) => Math.abs(params.value).toString(),
            color: '#dc2626',
            fontSize: 10,
            fontWeight: 700,
          },
        },
      ],
    };
  }, [sertifikasiJabfungData]);

  // Chart 6: Population Pyramid - Gender & Usia
  const populationPyramidChartOption = useMemo(() => {
    if (!genderUsiaData || !genderUsiaData.data || genderUsiaData.data.length === 0) {
      return {
        series: [{ type: "bar", data: [] }]
      };
    }

    const usiaLabels = genderUsiaData.data.map(item => item.usia);
    const lakiData = genderUsiaData.data.map(item => -item.laki_laki); // Negative for left side
    const perempuanData = genderUsiaData.data.map(item => item.perempuan);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const usia = params[0].name;
          const laki = Math.abs(params.find((p: any) => p.seriesName === 'Laki-laki')?.value || 0);
          const perempuan = params.find((p: any) => p.seriesName === 'Perempuan')?.value || 0;
          const total = laki + perempuan;
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 6px;">Usia ${usia} tahun</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #3b82f6;">👨 Laki-laki:</span>
              <span style="font-weight: 700; color: #3b82f6;">${laki}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #ec4899;">👩 Perempuan:</span>
              <span style="font-weight: 700; color: #ec4899;">${perempuan}</span>
            </div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 4px; margin-top: 4px;">
              <span style="color: #6b7280; font-size: 12px;">Total: ${total} dosen</span>
            </div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#8b5cf6",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      legend: {
        data: ['Laki-laki', 'Perempuan'],
        bottom: 0,
        textStyle: { fontSize: 11, fontWeight: 600 },
      },
      grid: {
        left: '3%',
        right: '3%',
        top: '5%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => Math.abs(value).toString(),
          color: '#6b7280',
          fontSize: 10,
        },
        splitLine: {
          lineStyle: { color: '#e5e7eb', type: 'dashed' },
        },
      },
      yAxis: {
        type: 'category',
        data: usiaLabels,
        axisLabel: {
          color: '#1f2937',
          fontSize: 11,
          fontWeight: 600,
          formatter: (value: string) => `${value} th`,
        },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#9ca3af' } },
      },
      series: [
        {
          name: 'Laki-laki',
          type: 'bar',
          data: lakiData,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#60a5fa' },
              ],
            },
            borderRadius: [4, 0, 0, 4],
          },
          label: {
            show: true,
            position: 'left',
            formatter: (params: any) => Math.abs(params.value).toString(),
            color: '#2563eb',
            fontSize: 10,
            fontWeight: 700,
          },
        },
        {
          name: 'Perempuan',
          type: 'bar',
          data: perempuanData,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#f472b6' },
                { offset: 1, color: '#ec4899' },
              ],
            },
            borderRadius: [0, 4, 4, 0],
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}',
            color: '#db2777',
            fontSize: 10,
            fontWeight: 700,
          },
        },
      ],
    };
  }, [genderUsiaData]);

  // Chart 7: Stacked Bar - Tren Sertifikasi 5 Tahun Terakhir
  const trenSertifikasiChartOption = useMemo(() => {
    if (!trenSertifikasiData || !trenSertifikasiData.data || trenSertifikasiData.data.length === 0) {
      return {
        series: [{ type: "bar", data: [] }]
      };
    }

    const years = trenSertifikasiData.data.map(item => item.tahun);
    const values = trenSertifikasiData.data.map(item => item.jumlah);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = params[0];
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">Tahun ${item.name}</div>
            <div style="color: #059669; font-size: 20px; font-weight: 700;">${item.value} dosen</div>
            <div style="color: #6b7280; font-size: 12px;">mendapat sertifikasi</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#059669",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      grid: {
        left: '3%',
        right: '4%',
        top: '10%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: years,
        axisLabel: {
          color: '#1f2937',
          fontSize: 12,
          fontWeight: 600,
        },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
        },
        splitLine: {
          lineStyle: { color: '#e5e7eb', type: 'dashed' },
        },
      },
      series: [{
        name: 'Sertifikasi',
        type: 'bar',
        data: values.map(value => ({
          value,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#34d399' },
              ],
            },
            borderRadius: [6, 6, 0, 0],
          },
        })),
        barWidth: '50%',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          color: '#059669',
          fontSize: 12,
          fontWeight: 700,
        },
      }],
    };
  }, [trenSertifikasiData]);

  // Chart 8: Stacked Bar - Tren Jabfung 5 Tahun Terakhir
  const trenJabfungChartOption = useMemo(() => {
    if (!trenJabfungData || !trenJabfungData.data || trenJabfungData.data.length === 0) {
      return {
        series: [{ type: "bar", data: [] }]
      };
    }

    const years = trenJabfungData.data.map(item => item.tahun);

    // Colors for each jabatan
    const jabatanColors = {
      asisten_ahli: ['#f59e0b', '#fbbf24'],
      lektor: ['#3b82f6', '#60a5fa'],
      lektor_kepala: ['#8b5cf6', '#a78bfa'],
      profesor: ['#10b981', '#34d399'],
    };

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const year = params[0].name;
          let html = `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">Tahun ${year}</div>`;

          let total = 0;
          params.forEach((item: any) => {
            total += item.value;
            const color = item.color?.colorStops?.[0]?.color || item.color;
            html += `<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: ${color};">${item.seriesName}:</span>
              <span style="font-weight: 700; color: ${color};">${item.value}</span>
            </div>`;
          });

          html += `<div style="border-top: 1px solid #e5e7eb; padding-top: 4px; margin-top: 4px;">
            <span style="color: #6b7280; font-size: 12px;">Total: ${total} kenaikan jabatan</span>
          </div></div>`;

          return html;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#6366f1",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      legend: {
        data: ['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Profesor'],
        bottom: 0,
        textStyle: { fontSize: 10, fontWeight: 600 },
      },
      grid: {
        left: '3%',
        right: '4%',
        top: '10%',
        bottom: '18%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: years,
        axisLabel: {
          color: '#1f2937',
          fontSize: 11,
          fontWeight: 600,
        },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#6b7280',
          fontSize: 10,
        },
        splitLine: {
          lineStyle: { color: '#e5e7eb', type: 'dashed' },
        },
      },
      series: [
        {
          name: 'Asisten Ahli',
          type: 'bar',
          stack: 'total',
          data: trenJabfungData.data.map(item => item.asisten_ahli),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: jabatanColors.asisten_ahli[0] },
                { offset: 1, color: jabatanColors.asisten_ahli[1] },
              ],
            },
          },
        },
        {
          name: 'Lektor',
          type: 'bar',
          stack: 'total',
          data: trenJabfungData.data.map(item => item.lektor),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: jabatanColors.lektor[0] },
                { offset: 1, color: jabatanColors.lektor[1] },
              ],
            },
          },
        },
        {
          name: 'Lektor Kepala',
          type: 'bar',
          stack: 'total',
          data: trenJabfungData.data.map(item => item.lektor_kepala),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: jabatanColors.lektor_kepala[0] },
                { offset: 1, color: jabatanColors.lektor_kepala[1] },
              ],
            },
          },
        },
        {
          name: 'Profesor',
          type: 'bar',
          stack: 'total',
          data: trenJabfungData.data.map(item => item.profesor),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: jabatanColors.profesor[0] },
                { offset: 1, color: jabatanColors.profesor[1] },
              ],
            },
            borderRadius: [6, 6, 0, 0],
          },
        },
      ],
    };
  }, [trenJabfungData]);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="text-center mb-16">
              <div className="animate-pulse">
                <div className="h-10 bg-gray-50 dark:bg-gray-600 rounded-lg w-64 mx-auto mb-4"></div>
                <div className="h-1 w-20 bg-gray-50 dark:bg-gray-600 rounded-full mx-auto mb-3"></div>
                <div className="h-6 bg-gray-50 dark:bg-gray-600 rounded w-96 mx-auto"></div>
              </div>
            </div>

            {/* Quick Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-gray-50 dark:bg-gray-600 rounded-xl p-6 animate-pulse">
                  <div className="h-8 w-8 bg-gray-100 dark:bg-gray-500 rounded-full mb-3"></div>
                  <div className="h-9 bg-gray-100 dark:bg-gray-500 rounded w-20 mb-2"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-500 rounded w-24"></div>
                </div>
              ))}
            </div>

            {/* Charts Grid Skeleton */}
            <div className="grid lg:grid-cols-2 gap-8">
              {[1, 2].map((item) => (
                <div key={item} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 bg-gray-50 dark:bg-gray-600 animate-pulse">
                    <div className="h-6 bg-gray-100 dark:bg-gray-500 rounded w-48"></div>
                  </div>
                  <div className="p-6">
                    <div className="h-[320px] bg-gray-50 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                    <div className="mt-6 space-y-3">
                      {[1, 2, 3, 4].map((row) => (
                        <div key={row} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse">
                          <div className="flex items-center justify-between mb-2">
                            <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-32"></div>
                            <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-12"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sebaran Chart Skeleton */}
            <div className="mt-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-gray-50 dark:bg-gray-600 animate-pulse">
                  <div className="h-6 bg-gray-100 dark:bg-gray-500 rounded w-56"></div>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="h-[450px] bg-gray-50 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Info Box Skeleton */}
            <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-100 dark:border-gray-600 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 bg-gray-100 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-100 dark:bg-gray-600 rounded w-64"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white relative">
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
              Data Dosen
            </h2>
            <div className="flex items-center justify-center mb-2 sm:mb-3">
              <div className="h-0.5 sm:h-1 w-16 sm:w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-3">
              Profil dan distribusi dosen Universitas Lampung berdasarkan kualifikasi dan jabatan
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-10 md:mb-12">
            {[
              { label: "Total Dosen", value: summary.total_dosen.toLocaleString(), icon: "👨‍🏫", gradient: "from-blue-500 to-blue-600" },
              { label: "Guru Besar", value: summary.total_guru_besar.toLocaleString(), icon: "🎓", gradient: "from-emerald-500 to-emerald-600" },
              { label: "Bergelar Doktor", value: summary.total_doktor.toLocaleString(), icon: "📚", gradient: "from-purple-500 to-purple-600" },
              { label: "Rasio Dosen:Mhs", value: summary.rasio_dosen_mahasiswa, icon: "📊", gradient: "from-pink-500 to-pink-600" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`bg-gradient-to-br ${stat.gradient} rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 text-white shadow-lg`}
              >
                <div className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2 md:mb-3">{stat.icon}</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-0.5 sm:mb-1">{stat.value}</div>
                <div className="text-[10px] sm:text-xs md:text-sm font-semibold opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Jenjang Pendidikan Chart */}
            <motion.div variants={itemVariants} className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-blue-600">
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white flex items-center gap-1 sm:gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Jenjang Pendidikan Dosen
                </h3>
              </div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="h-[250px] sm:h-[280px] md:h-[320px]">
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
            <motion.div variants={itemVariants} className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-blue-600">
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white flex items-center gap-1 sm:gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  Jabatan Fungsional Dosen
                </h3>
              </div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="h-[250px] sm:h-[280px] md:h-[320px]">
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

          {/* Sebaran Dosen Per Fakultas/Prodi with Drilldown */}
          <motion.div variants={itemVariants} className="mt-4 sm:mt-6 md:mt-8" id="sebaran-dosen-chart">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-orange-500 to-orange-600">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white flex items-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span className="leading-tight">
                      {drillLevel === 'fakultas'
                        ? 'Sebaran Dosen Per Fakultas'
                        : `Sebaran Dosen Per Prodi - ${selectedFakultas?.nama}`
                      }
                    </span>
                  </h3>
                  {drillLevel === 'prodi' && (
                    <button
                      onClick={handleDrillUp}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold text-xs sm:text-sm shadow-md"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Kembali ke Fakultas
                    </button>
                  )}
                </div>
              </div>
              <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px]">
                  <ReactECharts
                    option={drillLevel === 'fakultas' ? fakultasSebaranChartOption : prodiSebaranChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                    onEvents={{
                      click: (params: any) => {
                        if (drillLevel === 'fakultas') {
                          const fakultas = fakultasSebaranData.find(f => f.nama === params.name);
                          if (fakultas) {
                            handleDrillDown(fakultas.id, fakultas.nama);
                          }
                        }
                      }
                    }}
                  />
                </div>
                {drillLevel === 'fakultas' && (
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="text-lg sm:text-xl md:text-2xl">💡</div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                          <span className="font-bold text-orange-600">Klik pada bar chart</span> untuk melihat detail sebaran dosen per program studi di fakultas tersebut, termasuk rasio dosen:mahasiswa setiap prodi.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Heatmap Grid: 2 Charts Side by Side */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mt-4 sm:mt-6 md:mt-8">
            {/* Heatmap 1: Jenjang Pendidikan dan Jabatan Fungsional */}
            {heatmapData && (
              <motion.div variants={itemVariants}>
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full">
                  <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-purple-500 to-violet-600">
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white flex items-center gap-1 sm:gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                      </svg>
                      Pendidikan dan Jabatan Fungsional
                    </h3>
                  </div>
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="h-[280px] sm:h-[320px] md:h-[350px]">
                      <ReactECharts
                        option={heatmapChartOption}
                        style={{ height: "100%", width: "100%" }}
                        opts={{ renderer: "svg" }}
                      />
                    </div>
                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                      <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                        Korelasi jenjang pendidikan dengan jabatan fungsional dosen.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Heatmap 2: Kelompok Usia dan Jenjang Pendidikan */}
            {heatmapUsiaData && (
              <motion.div variants={itemVariants}>
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full">
                  <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-emerald-500 to-teal-600">
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white flex items-center gap-1 sm:gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Usia dan Jenjang Pendidikan
                    </h3>
                  </div>
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="h-[280px] sm:h-[320px] md:h-[350px]">
                      <ReactECharts
                        option={heatmapUsiaChartOption}
                        style={{ height: "100%", width: "100%" }}
                        opts={{ renderer: "svg" }}
                      />
                    </div>
                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                      <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                        Distribusi jenjang pendidikan berdasarkan kelompok usia dosen.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Heatmap 3: Kelompok Usia dan Jabatan Fungsional */}
            {heatmapUsiaJabfungData && (
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-orange-500 to-amber-600">
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white flex items-center gap-1 sm:gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Usia dan Jabatan Fungsional
                    </h3>
                  </div>
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="h-[300px] sm:h-[350px] md:h-[400px]">
                      <ReactECharts
                        option={heatmapUsiaJabfungChartOption}
                        style={{ height: "100%", width: "100%" }}
                        opts={{ renderer: "svg" }}
                      />
                    </div>
                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                      <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                        Korelasi antara kelompok usia dosen dengan jabatan fungsional. Menunjukkan pola karir akademik berdasarkan usia.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Heatmap 4: Ikatan Kerja dan Status Pegawai */}
          {heatmapIkatanStatusData && (
            <motion.div variants={itemVariants} className="mt-4 sm:mt-6 md:mt-8">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-cyan-500 to-teal-600">
                  <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white flex items-center gap-1 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Ikatan Kerja dan Status Pegawai
                  </h3>
                </div>
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="max-w-xl mx-auto">
                    <div className="h-[250px] sm:h-[280px] md:h-[300px]">
                      <ReactECharts
                        option={heatmapIkatanStatusChartOption}
                        style={{ height: "100%", width: "100%" }}
                        opts={{ renderer: "svg" }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg border border-cyan-100">
                    <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed text-center">
                      Distribusi dosen berdasarkan ikatan kerja (Dosen Tetap/Tidak Tetap) dan status kepegawaian (PNS/Non-PNS).
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chart 5 & 6 Grid */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mt-4 sm:mt-6 md:mt-8">
            {/* Chart 5: Diverging Bar - Sertifikasi per Jabfung */}
            {sertifikasiJabfungData && (
              <motion.div variants={itemVariants}>
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full">
                  <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white flex items-center gap-1 sm:gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Sertifikasi per Jabatan Fungsional
                    </h3>
                  </div>
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="h-[280px] sm:h-[320px] md:h-[350px]">
                      <ReactECharts
                        option={sertifikasiChartOption}
                        style={{ height: "100%", width: "100%" }}
                        opts={{ renderer: "svg" }}
                      />
                    </div>
                    {/* Summary Stats */}
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-100 text-center">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600">{sertifikasiJabfungData.totalSudah}</div>
                        <div className="text-[10px] sm:text-xs text-emerald-700 font-medium">Sudah</div>
                      </div>
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-100 text-center">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{sertifikasiJabfungData.totalBelum}</div>
                        <div className="text-[10px] sm:text-xs text-red-700 font-medium">Belum</div>
                      </div>
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 text-center">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-600">
                          {sertifikasiJabfungData.total > 0 ? ((sertifikasiJabfungData.totalSudah / sertifikasiJabfungData.total) * 100).toFixed(1) : 0}%
                        </div>
                        <div className="text-[10px] sm:text-xs text-indigo-700 font-medium">Tingkat</div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                      <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                        Perbandingan dosen yang sudah dan belum memiliki sertifikasi pendidik berdasarkan jabatan fungsional.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Chart 6: Population Pyramid - Gender & Usia */}
            {genderUsiaData && (
              <motion.div variants={itemVariants}>
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full">
                  <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-pink-500 to-rose-600">
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white flex items-center gap-1 sm:gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      Distribusi Gender & Usia
                    </h3>
                  </div>
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="h-[280px] sm:h-[320px] md:h-[350px]">
                      <ReactECharts
                        option={populationPyramidChartOption}
                        style={{ height: "100%", width: "100%" }}
                        opts={{ renderer: "svg" }}
                      />
                    </div>
                    {/* Summary Stats */}
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg border border-blue-100 text-center">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{genderUsiaData.totalLakiLaki}</div>
                        <div className="text-[10px] sm:text-xs text-blue-700 font-medium">Laki-laki</div>
                      </div>
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg border border-pink-100 text-center">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-pink-600">{genderUsiaData.totalPerempuan}</div>
                        <div className="text-[10px] sm:text-xs text-pink-700 font-medium">Perempuan</div>
                      </div>
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100 text-center">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">{genderUsiaData.total}</div>
                        <div className="text-[10px] sm:text-xs text-purple-700 font-medium">Total</div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                      <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                        Population pyramid menunjukkan distribusi dosen berdasarkan jenis kelamin dan kelompok usia.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Chart 7 & 8 Grid: Tren Charts */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mt-4 sm:mt-6 md:mt-8">
            {/* Chart 7: Tren Sertifikasi 5 Tahun Terakhir */}
            {trenSertifikasiData && (
              <motion.div variants={itemVariants}>
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full">
                  <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-emerald-500 to-green-600">
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white flex items-center gap-1 sm:gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      Tren Sertifikasi (5 Tahun)
                    </h3>
                  </div>
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="h-[250px] sm:h-[280px] md:h-[300px]">
                      <ReactECharts
                        option={trenSertifikasiChartOption}
                        style={{ height: "100%", width: "100%" }}
                        opts={{ renderer: "svg" }}
                      />
                    </div>
                    {/* Summary */}
                    <div className="mt-4 p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] sm:text-xs text-emerald-700 font-medium">Total Sertifikasi (5 Tahun)</div>
                          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-600">{trenSertifikasiData.total}</div>
                        </div>
                        <div className="text-3xl sm:text-4xl">📜</div>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-600 mt-2 leading-relaxed">
                        Jumlah dosen yang memperoleh sertifikasi pendidik dalam 5 tahun terakhir.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Chart 8: Tren Jabfung 5 Tahun Terakhir */}
            {trenJabfungData && (
              <motion.div variants={itemVariants}>
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full">
                  <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-violet-500 to-purple-600">
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white flex items-center gap-1 sm:gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                      Tren Jabatan Fungsional (5 Tahun)
                    </h3>
                  </div>
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="h-[250px] sm:h-[280px] md:h-[300px]">
                      <ReactECharts
                        option={trenJabfungChartOption}
                        style={{ height: "100%", width: "100%" }}
                        opts={{ renderer: "svg" }}
                      />
                    </div>
                    {/* Summary Stats */}
                    <div className="mt-4 grid grid-cols-4 gap-1 sm:gap-2">
                      <div className="p-1.5 sm:p-2 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-amber-100 text-center">
                        <div className="text-sm sm:text-lg md:text-xl font-bold text-amber-600">{trenJabfungData.totals.asisten_ahli}</div>
                        <div className="text-[8px] sm:text-[10px] text-amber-700 font-medium">Asisten Ahli</div>
                      </div>
                      <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg border border-blue-100 text-center">
                        <div className="text-sm sm:text-lg md:text-xl font-bold text-blue-600">{trenJabfungData.totals.lektor}</div>
                        <div className="text-[8px] sm:text-[10px] text-blue-700 font-medium">Lektor</div>
                      </div>
                      <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100 text-center">
                        <div className="text-sm sm:text-lg md:text-xl font-bold text-purple-600">{trenJabfungData.totals.lektor_kepala}</div>
                        <div className="text-[8px] sm:text-[10px] text-purple-700 font-medium">Lektor Kepala</div>
                      </div>
                      <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-100 text-center">
                        <div className="text-sm sm:text-lg md:text-xl font-bold text-emerald-600">{trenJabfungData.totals.profesor}</div>
                        <div className="text-[8px] sm:text-[10px] text-emerald-700 font-medium">Profesor</div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-100">
                      <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                        Kenaikan jabatan fungsional dosen dalam 5 tahun terakhir. Total: <span className="font-bold text-violet-600">{trenJabfungData.grandTotal}</span> kenaikan jabatan.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Additional Info */}
          <motion.div variants={itemVariants} className="mt-4 sm:mt-6 md:mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-blue-100">
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
              <div className="text-xl sm:text-2xl md:text-3xl">📌</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Kualifikasi Dosen Universitas Lampung</h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
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
