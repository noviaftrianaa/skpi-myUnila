"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import { publikasiService, PublikasiStatistics } from "@/lib/services/publikasiService";
import { penelitianService, PenelitianStatistics } from "@/lib/services/penelitianService";

// Import ECharts dynamically to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/api/v1';

export default function PenelitianPublikasi() {
  const [publikasiData, setPublikasiData] = useState<PublikasiStatistics | null>(null);
  const [penelitianData, setPenelitianData] = useState<PenelitianStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  // State for publikasi drilldown
  const [publikasiFakultasSebaranData, setPublikasiFakultasSebaranData] = useState<any[]>([]);
  const [publikasiProdiSebaranData, setPublikasiProdiSebaranData] = useState<any[]>([]);
  const [publikasiDrillLevel, setPublikasiDrillLevel] = useState<'fakultas' | 'prodi'>('fakultas');
  const [publikasiSelectedFakultas, setPublikasiSelectedFakultas] = useState<{id: string, nama: string} | null>(null);

  // State for penelitian drilldown
  const [penelitianFakultasSebaranData, setPenelitianFakultasSebaranData] = useState<any[]>([]);
  const [penelitianProdiSebaranData, setPenelitianProdiSebaranData] = useState<any[]>([]);
  const [penelitianDrillLevel, setPenelitianDrillLevel] = useState<'fakultas' | 'prodi'>('fakultas');
  const [penelitianSelectedFakultas, setPenelitianSelectedFakultas] = useState<{id: string, nama: string} | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pubData, penData] = await Promise.all([
          publikasiService.getStatistics(),
          penelitianService.getStatistics(),
        ]);
        setPublikasiData(pubData);
        setPenelitianData(penData);

        // Fetch publikasi sebaran fakultas data
        const publikasiSebaranResponse = await fetch(`${API_URL}/publikasi-sebaran/fakultas`);
        const publikasiSebaranJson = await publikasiSebaranResponse.json();

        if (publikasiSebaranJson.success) {
          const fakData = publikasiSebaranJson.data.data.map((item: any) => ({
            id: item.id_fakultas,
            nama: item.nama_fakultas,
            jumlah: item.jumlah,
          }));
          setPublikasiFakultasSebaranData(fakData);
        }

        // Fetch penelitian sebaran fakultas data
        const penelitianSebaranResponse = await fetch(`${API_URL}/penelitian-sebaran/fakultas`);
        const penelitianSebaranJson = await penelitianSebaranResponse.json();

        if (penelitianSebaranJson.success) {
          const fakData = penelitianSebaranJson.data.data.map((item: any) => ({
            id_fakultas: item.id_fakultas,
            nama_fakultas: item.nama_fakultas,
            jumlah_penelitian: item.jumlah_penelitian,
            jumlah_pengabdian: item.jumlah_pengabdian,
            jumlah_total: item.jumlah_total,
          }));
          setPenelitianFakultasSebaranData(fakData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
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

  // Drilldown functions for publikasi sebaran
  const handlePublikasiDrillDown = async (fakultasId: string, fakultasNama: string) => {
    try {
      setLoading(true);
      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetch(`${API_URL}/publikasi-sebaran/fakultas/${fakultasId}/prodi${cacheBuster}`);
      const data = await response.json();

      if (data.success) {
        setPublikasiProdiSebaranData(data.data.data || []);
        setPublikasiSelectedFakultas({ id: fakultasId, nama: fakultasNama });

        setTimeout(() => {
          setPublikasiDrillLevel('prodi');
          const chartElement = document.getElementById('publikasi-sebaran-chart');
          if (chartElement) {
            chartElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      }
    } catch (err) {
      console.error('Error drilling down publikasi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublikasiDrillUp = () => {
    setPublikasiDrillLevel('fakultas');
    setPublikasiSelectedFakultas(null);
    setPublikasiProdiSebaranData([]);

    setTimeout(() => {
      const chartElement = document.getElementById('publikasi-sebaran-chart');
      if (chartElement) {
        chartElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  // Drilldown functions for penelitian sebaran
  const handlePenelitianDrillDown = async (fakultasId: string, fakultasNama: string) => {
    try {
      setLoading(true);
      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetch(`${API_URL}/penelitian-sebaran/fakultas/${fakultasId}/prodi${cacheBuster}`);
      const data = await response.json();

      if (data.success) {
        setPenelitianProdiSebaranData(data.data.data || []);
        setPenelitianSelectedFakultas({ id: fakultasId, nama: fakultasNama });

        setTimeout(() => {
          setPenelitianDrillLevel('prodi');
          const chartElement = document.getElementById('penelitian-sebaran-chart');
          if (chartElement) {
            chartElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      }
    } catch (err) {
      console.error('Error drilling down penelitian:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePenelitianDrillUp = () => {
    setPenelitianDrillLevel('fakultas');
    setPenelitianSelectedFakultas(null);
    setPenelitianProdiSebaranData([]);

    setTimeout(() => {
      const chartElement = document.getElementById('penelitian-sebaran-chart');
      if (chartElement) {
        chartElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  // Chart configuration untuk publikasi (per jenis)
  const publikasiJenisChartOption = useMemo(() => {
    if (!publikasiData) return {};

    // Ambil top 10 jenis publikasi
    const topJenis = publikasiData.by_jenis.slice(0, 10);

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} publikasi ({d}%)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#3b82f6",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      legend: {
        bottom: "0%",
        left: "center",
        type: "scroll",
        textStyle: {
          fontSize: 10,
          fontWeight: 600,
        },
      },
      series: [
        {
          name: "Jenis Publikasi",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "40%"],
          itemStyle: {
            borderRadius: 8,
            borderColor: "#fff",
            borderWidth: 3,
          },
          label: {
            show: true,
            position: "outside",
            formatter: "{b}\n{c}",
            fontSize: 10,
            fontWeight: 600,
          },
          emphasis: {
            scale: true,
            scaleSize: 8,
          },
          data: topJenis.map((item, index) => ({
            value: item.jumlah,
            name: item.jenis.length > 25 ? item.jenis.substring(0, 25) + '...' : item.jenis,
            itemStyle: {
              color: [
                "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
                "#06b6d4", "#ec4899", "#6366f1", "#84cc16", "#f97316"
              ][index % 10],
            },
          })),
        },
      ],
    };
  }, [publikasiData]);

  // Chart configuration untuk publikasi per tahun
  const publikasiTahunChartOption = useMemo(() => {
    if (!publikasiData) return {};

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
        data: publikasiData.by_year.map(item => item.tahun.toString()),
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
          name: "Publikasi",
          type: "bar",
          data: publikasiData.by_year.map(item => item.jumlah),
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
      ],
    };
  }, [publikasiData]);

  // Chart configuration untuk publikasi by kategori capaian
  const publikasiKategoriCapaianChartOption = useMemo(() => {
    if (!publikasiData || !publikasiData.by_kategori_capaian) return {};

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} publikasi ({d}%)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#3b82f6",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      legend: {
        bottom: "0%",
        left: "center",
        type: "scroll",
        textStyle: {
          fontSize: 10,
          fontWeight: 600,
        },
      },
      series: [
        {
          name: "Kategori Capaian",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "40%"],
          itemStyle: {
            borderRadius: 8,
            borderColor: "#fff",
            borderWidth: 3,
          },
          label: {
            show: true,
            position: "outside",
            formatter: "{b}\n{c}",
            fontSize: 10,
            fontWeight: 600,
          },
          emphasis: {
            scale: true,
            scaleSize: 8,
          },
          data: publikasiData.by_kategori_capaian.map((item, index) => ({
            value: item.jumlah,
            name: item.kategori,
            itemStyle: {
              color: [
                "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1"
              ][index % 6],
            },
          })),
        },
      ],
    };
  }, [publikasiData]);

  // Chart configuration untuk publikasi by peran
  const publikasiPeranChartOption = useMemo(() => {
    if (!publikasiData || !publikasiData.by_peran) return {};

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
        data: publikasiData.by_peran.map(item => item.peran),
        axisLabel: {
          color: "#1f2937",
          fontSize: 12,
          fontWeight: 600,
          rotate: 0,
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
          name: "Jumlah",
          type: "bar",
          data: publikasiData.by_peran.map(item => item.jumlah),
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
            fontWeight: 600,
          },
          barMaxWidth: 60,
        },
      ],
    };
  }, [publikasiData]);

  // Chart configuration untuk publikasi per fakultas (drilldown level: fakultas)
  const publikasiFakultasSebaranChartOption = useMemo(() => {
    if (!publikasiFakultasSebaranData || publikasiFakultasSebaranData.length === 0) {
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
          const value = params[0].value.toLocaleString('id-ID');
          return `<div style="padding: 10px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 6px;">${params[0].axisValue}</div>
            <div style="color: #10b981; font-size: 20px; font-weight: 700; margin-bottom: 4px;">${value} publikasi</div>
            <div style="color: #6b7280; font-size: 12px; font-style: italic;">Klik untuk melihat detail per prodi</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#10b981",
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
        data: publikasiFakultasSebaranData.map(item => item.nama),
        axisLabel: {
          color: "#1f2937",
          fontSize: 10,
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
          type: "bar",
          data: publikasiFakultasSebaranData.map((item) => ({
            value: item.jumlah,
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "#10b981" },
                  { offset: 1, color: "#047857" },
                ],
              },
              borderRadius: [6, 6, 0, 0],
            },
          })),
          label: {
            show: true,
            position: "top",
            formatter: "{c}",
            color: "#1f2937",
            fontSize: 11,
            fontWeight: 700,
          },
          barMaxWidth: 80,
          cursor: 'pointer',
        },
      ],
    };
  }, [publikasiFakultasSebaranData]);

  // Chart configuration untuk publikasi per prodi (drilldown level: prodi)
  const publikasiProdiSebaranChartOption = useMemo(() => {
    if (!publikasiProdiSebaranData || publikasiProdiSebaranData.length === 0) {
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
          const item = publikasiProdiSebaranData.find(d => d.nama_prodi === params[0].name);
          const value = params[0].value.toLocaleString('id-ID');
          return `<div style="padding: 10px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 6px;">${params[0].axisValue}</div>
            <div style="color: #6b7280; font-size: 11px; margin-bottom: 4px;">${item?.jenjang || 'Umum'}</div>
            <div style="color: #10b981; font-size: 20px; font-weight: 700;">${value} publikasi</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#10b981",
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
        data: publikasiProdiSebaranData.map(item => item.nama_prodi),
        axisLabel: {
          color: "#1f2937",
          fontSize: 9,
          fontWeight: 600,
          rotate: 25,
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
          type: "bar",
          data: publikasiProdiSebaranData.map((item) => ({
            value: item.jumlah,
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "#10b981" },
                  { offset: 1, color: "#047857" },
                ],
              },
              borderRadius: [6, 6, 0, 0],
            },
          })),
          label: {
            show: true,
            position: "top",
            formatter: "{c}",
            color: "#1f2937",
            fontSize: 10,
            fontWeight: 700,
          },
          barMaxWidth: 60,
        },
      ],
    };
  }, [publikasiProdiSebaranData]);

  // Chart configuration untuk penelitian (per kategori)
  const penelitianKategoriChartOption = useMemo(() => {
    if (!penelitianData || !penelitianData.by_kategori) return {};

    // Ambil top 10 kategori penelitian
    const topKategori = penelitianData.by_kategori.slice(0, 10);

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} penelitian ({d}%)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#8b5cf6",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      legend: {
        bottom: "0%",
        left: "center",
        type: "scroll",
        textStyle: {
          fontSize: 10,
          fontWeight: 600,
        },
      },
      series: [
        {
          name: "Kategori Penelitian",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "40%"],
          itemStyle: {
            borderRadius: 8,
            borderColor: "#fff",
            borderWidth: 3,
          },
          label: {
            show: true,
            position: "outside",
            formatter: "{b}\n{c}",
            fontSize: 10,
            fontWeight: 600,
          },
          emphasis: {
            scale: true,
            scaleSize: 8,
          },
          data: topKategori.map((item, index) => ({
            value: item.jumlah,
            name: item.kategori.length > 25 ? item.kategori.substring(0, 25) + '...' : item.kategori,
            itemStyle: {
              color: [
                "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
                "#06b6d4", "#ec4899", "#6366f1", "#84cc16", "#f97316"
              ][index % 10],
            },
          })),
        },
      ],
    };
  }, [penelitianData]);

  // Chart configuration untuk penelitian per tahun
  const penelitianTahunChartOption = useMemo(() => {
    if (!penelitianData || !penelitianData.by_year) return {};

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#8b5cf6",
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
        data: penelitianData.by_year.map(item => item.tahun.toString()),
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
          name: "Penelitian",
          type: "bar",
          data: penelitianData.by_year.map(item => item.jumlah),
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
      ],
    };
  }, [penelitianData]);

  // Chart configuration untuk penelitian dana per tahun (stacked bar)
  const penelitianFundingChartOption = useMemo(() => {
    if (!penelitianData || !penelitianData.by_funding) return {};

    // Helper function untuk format rupiah
    const formatRupiah = (value: number): string => {
      if (value >= 1000000000) {
        return `Rp ${(value / 1000000000).toFixed(1)} M`; // Miliar
      } else if (value >= 1000000) {
        return `Rp ${(value / 1000000).toFixed(1)} Jt`; // Juta
      } else if (value >= 1000) {
        return `Rp ${(value / 1000).toFixed(0)} Rb`; // Ribu
      }
      return `Rp ${value.toLocaleString('id-ID')}`;
    };

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: (params: any) => {
          const formatRupiah = (value: number): string => {
            if (value >= 1000000000) {
              // Miliar
              return `Rp ${(value / 1000000000).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Miliar`;
            } else if (value >= 1000000) {
              // Juta
              return `Rp ${(value / 1000000).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Juta`;
            } else if (value >= 1000) {
              // Ribu
              return `Rp ${(value / 1000).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Ribu`;
            }
            return `Rp ${value.toLocaleString('id-ID')}`;
          };

          let result = `<b>Tahun ${params[0].axisValue}</b><br/>`;
          let total = 0;
          params.forEach((item: any) => {
            if (item.value > 0) {
              result += `${item.marker} ${item.seriesName}: <b>${formatRupiah(item.value)}</b><br/>`;
            }
            total += item.value;
          });
          result += `<br/><b>Total: ${formatRupiah(total)}</b>`;
          return result;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#8b5cf6",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      legend: {
        data: ["Dana Dikti", "Dana PT", "Dana Institusi Lain"],
        bottom: "0%",
        textStyle: {
          fontSize: 10,
          fontWeight: 600,
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        top: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: penelitianData.by_funding.map(item => item.tahun.toString()),
        axisLabel: {
          color: "#1f2937",
          fontSize: 12,
          fontWeight: 600,
        },
      },
      yAxis: {
        type: "value",
        name: "Dana (Miliar Rupiah)",
        axisLabel: {
          formatter: (value: number) => {
            const inBillion = value / 1000000000;
            return `${inBillion.toFixed(0)}`;
          },
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
          name: "Dana Dikti",
          type: "bar",
          stack: "total",
          data: penelitianData.by_funding.map(item => item.dana_dikti),
          itemStyle: {
            color: "#8b5cf6",
          },
          barMinHeight: 3,
          label: {
            show: false,
          },
        },
        {
          name: "Dana PT",
          type: "bar",
          stack: "total",
          data: penelitianData.by_funding.map(item => item.dana_pt),
          itemStyle: {
            color: "#a78bfa",
          },
          barMinHeight: 3,
          label: {
            show: false,
          },
        },
        {
          name: "Dana Institusi Lain",
          type: "bar",
          stack: "total",
          data: penelitianData.by_funding.map(item => item.dana_institusi_lain),
          itemStyle: {
            color: "#c4b5fd",
          },
          barMinHeight: 3,
          label: {
            show: false,
          },
        },
      ],
    };
  }, [penelitianData]);

  // Chart configuration untuk penelitian by kelompok bidang (pie chart)
  const penelitianKelompokBidangChartOption = useMemo(() => {
    if (!penelitianData || !penelitianData.by_kelompok_bidang) return {};

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} penelitian ({d}%)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#8b5cf6",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      legend: {
        bottom: "0%",
        left: "center",
        type: "scroll",
        textStyle: {
          fontSize: 10,
          fontWeight: 600,
        },
      },
      series: [
        {
          name: "Kelompok Bidang",
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "40%"],
          itemStyle: {
            borderRadius: 8,
            borderColor: "#fff",
            borderWidth: 3,
          },
          label: {
            show: true,
            position: "outside",
            formatter: "{b}\n{c}",
            fontSize: 10,
            fontWeight: 600,
          },
          emphasis: {
            scale: true,
            scaleSize: 8,
          },
          data: penelitianData.by_kelompok_bidang.map((item, index) => ({
            value: item.jumlah,
            name: item.kelompok_bidang.length > 25 ? item.kelompok_bidang.substring(0, 25) + '...' : item.kelompok_bidang,
            itemStyle: {
              color: [
                "#8b5cf6", "#a78bfa", "#c4b5fd", "#e0e7ff", "#6366f1",
                "#818cf8", "#a5b4fc", "#c7d2fe", "#ec4899", "#f472b6"
              ][index % 10],
            },
          })),
        },
      ],
    };
  }, [penelitianData]);

  // Chart configuration untuk penelitian per fakultas (drilldown level: fakultas)
  const penelitianFakultasSebaranChartOption = useMemo(() => {
    if (!penelitianFakultasSebaranData || penelitianFakultasSebaranData.length === 0) {
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
          const fakultas = params[0].axisValue;
          const penelitian = params[0].value;
          const pengabdian = params[1]?.value || 0;
          const total = penelitian + pengabdian;
          return `<div style="padding: 10px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">${fakultas}</div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <div style="width: 12px; height: 12px; background: linear-gradient(180deg, #8b5cf6 0%, #6366f1 100%); border-radius: 2px;"></div>
              <span style="color: #6b7280; font-size: 13px;">Penelitian:</span>
              <span style="color: #8b5cf6; font-size: 15px; font-weight: 700;">${penelitian.toLocaleString('id-ID')}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 12px; height: 12px; background: linear-gradient(180deg, #10b981 0%, #059669 100%); border-radius: 2px;"></div>
              <span style="color: #6b7280; font-size: 13px;">Pengabdian:</span>
              <span style="color: #10b981; font-size: 15px; font-weight: 700;">${pengabdian.toLocaleString('id-ID')}</span>
            </div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 6px; margin-top: 6px;">
              <span style="color: #6b7280; font-size: 12px;">Total: </span>
              <span style="color: #1f2937; font-size: 16px; font-weight: 700;">${total.toLocaleString('id-ID')}</span>
            </div>
            <div style="color: #6b7280; font-size: 11px; font-style: italic; margin-top: 6px;">Klik untuk melihat detail per prodi</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#8b5cf6",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      legend: {
        data: ['Penelitian', 'Pengabdian'],
        top: 10,
        textStyle: {
          fontSize: 12,
          fontWeight: 600,
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: penelitianFakultasSebaranData.map(item => item.nama_fakultas),
        axisLabel: {
          color: "#1f2937",
          fontSize: 10,
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
          name: 'Penelitian',
          type: "bar",
          data: penelitianFakultasSebaranData.map((item) => ({
            value: item.jumlah_penelitian,
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "#8b5cf6" },
                  { offset: 1, color: "#6366f1" },
                ],
              },
              borderRadius: [6, 6, 0, 0],
            },
          })),
          label: {
            show: true,
            position: "top",
            formatter: "{c}",
            color: "#1f2937",
            fontSize: 10,
            fontWeight: 600,
          },
          barMaxWidth: 40,
          cursor: 'pointer',
        },
        {
          name: 'Pengabdian',
          type: "bar",
          data: penelitianFakultasSebaranData.map((item) => ({
            value: item.jumlah_pengabdian,
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "#10b981" },
                  { offset: 1, color: "#059669" },
                ],
              },
              borderRadius: [6, 6, 0, 0],
            },
          })),
          label: {
            show: true,
            position: "top",
            formatter: "{c}",
            color: "#1f2937",
            fontSize: 10,
            fontWeight: 600,
          },
          barMaxWidth: 40,
          cursor: 'pointer',
        },
      ],
    };
  }, [penelitianFakultasSebaranData]);

  // Chart configuration untuk penelitian per prodi (drilldown level: prodi)
  const penelitianProdiSebaranChartOption = useMemo(() => {
    if (!penelitianProdiSebaranData || penelitianProdiSebaranData.length === 0) {
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
          const item = penelitianProdiSebaranData.find(d => d.nama_prodi === params[0].name);
          const penelitian = params[0].value;
          const pengabdian = params[1]?.value || 0;
          const total = penelitian + pengabdian;
          return `<div style="padding: 10px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 6px;">${params[0].axisValue}</div>
            <div style="color: #6b7280; font-size: 11px; margin-bottom: 6px;">${item?.jenjang || 'Umum'}</div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <div style="width: 12px; height: 12px; background: linear-gradient(180deg, #8b5cf6 0%, #6366f1 100%); border-radius: 2px;"></div>
              <span style="color: #6b7280; font-size: 12px;">Penelitian:</span>
              <span style="color: #8b5cf6; font-size: 14px; font-weight: 700;">${penelitian.toLocaleString('id-ID')}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 12px; height: 12px; background: linear-gradient(180deg, #10b981 0%, #059669 100%); border-radius: 2px;"></div>
              <span style="color: #6b7280; font-size: 12px;">Pengabdian:</span>
              <span style="color: #10b981; font-size: 14px; font-weight: 700;">${pengabdian.toLocaleString('id-ID')}</span>
            </div>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 6px; margin-top: 6px;">
              <span style="color: #6b7280; font-size: 11px;">Total: </span>
              <span style="color: #1f2937; font-size: 15px; font-weight: 700;">${total.toLocaleString('id-ID')}</span>
            </div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#8b5cf6",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      legend: {
        data: ['Penelitian', 'Pengabdian'],
        top: 10,
        textStyle: {
          fontSize: 11,
          fontWeight: 600,
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: penelitianProdiSebaranData.map(item => item.nama_prodi),
        axisLabel: {
          color: "#1f2937",
          fontSize: 9,
          fontWeight: 600,
          rotate: 25,
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
          name: 'Penelitian',
          type: "bar",
          data: penelitianProdiSebaranData.map((item) => ({
            value: item.jumlah_penelitian,
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "#8b5cf6" },
                  { offset: 1, color: "#6366f1" },
                ],
              },
              borderRadius: [6, 6, 0, 0],
            },
          })),
          label: {
            show: true,
            position: "top",
            formatter: "{c}",
            color: "#1f2937",
            fontSize: 9,
            fontWeight: 600,
          },
          barMaxWidth: 30,
        },
        {
          name: 'Pengabdian',
          type: "bar",
          data: penelitianProdiSebaranData.map((item) => ({
            value: item.jumlah_pengabdian,
            itemStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "#10b981" },
                  { offset: 1, color: "#059669" },
                ],
              },
              borderRadius: [6, 6, 0, 0],
            },
          })),
          label: {
            show: true,
            position: "top",
            formatter: "{c}",
            color: "#1f2937",
            fontSize: 9,
            fontWeight: 600,
          },
          barMaxWidth: 30,
        },
      ],
    };
  }, [penelitianProdiSebaranData]);

  if (loading) {
    return (
      <>
        {/* Publikasi Section Skeleton */}
        <section className="py-20 bg-white relative">
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

              {/* Highlights Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-gray-50 dark:bg-gray-600 rounded-xl p-6 animate-pulse">
                    <div className="h-8 w-8 bg-gray-100 dark:bg-gray-500 rounded-full mb-3"></div>
                    <div className="h-9 bg-gray-100 dark:bg-gray-500 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-500 rounded w-32"></div>
                  </div>
                ))}
              </div>

              {/* Charts Grid Skeleton (2x2) */}
              <div className="grid lg:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 bg-gray-50 dark:bg-gray-600 animate-pulse">
                      <div className="h-6 bg-gray-100 dark:bg-gray-500 rounded w-48"></div>
                    </div>
                    <div className="p-6">
                      <div className="h-[400px] bg-gray-50 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Full Width Chart Skeleton */}
              <div className="mt-8">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 bg-gray-50 dark:bg-gray-600 animate-pulse">
                    <div className="h-6 bg-gray-100 dark:bg-gray-500 rounded w-56"></div>
                  </div>
                  <div className="p-6">
                    <div className="h-[450px] bg-gray-50 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Penelitian Section Skeleton */}
        <section className="py-20 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              {/* Header Skeleton */}
              <div className="text-center mb-16">
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-50 dark:bg-gray-600 rounded-lg w-48 mx-auto mb-4"></div>
                  <div className="h-1 w-20 bg-gray-50 dark:bg-gray-600 rounded-full mx-auto mb-3"></div>
                  <div className="h-6 bg-gray-50 dark:bg-gray-600 rounded w-80 mx-auto"></div>
                </div>
              </div>

              {/* Highlights Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-gray-50 dark:bg-gray-600 rounded-xl p-6 animate-pulse">
                    <div className="h-8 w-8 bg-gray-100 dark:bg-gray-500 rounded-full mb-3"></div>
                    <div className="h-9 bg-gray-100 dark:bg-gray-500 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-500 rounded w-32"></div>
                  </div>
                ))}
              </div>

              {/* Charts Grid Skeleton */}
              <div className="grid lg:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 bg-gray-50 dark:bg-gray-600 animate-pulse">
                      <div className="h-6 bg-gray-100 dark:bg-gray-500 rounded w-48"></div>
                    </div>
                    <div className="p-6">
                      <div className="h-[400px] bg-gray-50 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Full Width Chart Skeleton */}
              <div className="mt-8">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-5 bg-gray-50 dark:bg-gray-600 animate-pulse">
                    <div className="h-6 bg-gray-100 dark:bg-gray-500 rounded w-56"></div>
                  </div>
                  <div className="p-6">
                    <div className="h-[450px] bg-gray-50 dark:bg-gray-600 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Publikasi Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
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
                Publikasi Ilmiah
              </h2>
              <div className="flex items-center justify-center mb-3">
                <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Produktivitas publikasi ilmiah dosen Universitas Lampung
              </p>
            </motion.div>

            {/* Highlights */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="text-3xl mb-3">📄</div>
                <div className="text-3xl font-bold mb-1">{publikasiData?.total.toLocaleString() || 0}</div>
                <div className="text-sm font-semibold opacity-90">Total Publikasi</div>
              </motion.div>

              {publikasiData?.by_year && publikasiData.by_year.length > 0 && (
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg"
                >
                  <div className="text-3xl mb-3">📅</div>
                  <div className="text-3xl font-bold mb-1">{publikasiData.by_year[0].jumlah.toLocaleString()}</div>
                  <div className="text-sm font-semibold opacity-90">Publikasi {publikasiData.by_year[0].tahun}</div>
                </motion.div>
              )}

              {publikasiData?.by_jenis && publikasiData.by_jenis.length > 0 && (
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg"
                >
                  <div className="text-3xl mb-3">🌍</div>
                  <div className="text-3xl font-bold mb-1">{publikasiData.by_jenis.find(j => j.jenis.toLowerCase().includes('internasional bereputasi'))?.jumlah.toLocaleString() || 0}</div>
                  <div className="text-sm font-semibold opacity-90">Jurnal Internasional Bereputasi</div>
                </motion.div>
              )}
            </motion.div>

            {/* Charts Grid - 2x2 layout */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Publikasi Per Jenis Chart */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-blue-600">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    Distribusi Jenis Publikasi
                  </h3>
                </div>
                <div className="p-6">
                  <div className="h-[400px]">
                    <ReactECharts
                      option={publikasiJenisChartOption}
                      style={{ height: "100%", width: "100%" }}
                      opts={{ renderer: "svg" }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Publikasi Per Tahun Chart */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-blue-600">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Tren Publikasi per Tahun
                  </h3>
                </div>
                <div className="p-6">
                  <div className="h-[400px]">
                    <ReactECharts
                      option={publikasiTahunChartOption}
                      style={{ height: "100%", width: "100%" }}
                      opts={{ renderer: "svg" }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Publikasi Per Kategori Capaian Chart */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-indigo-600">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Kategori Capaian Luaran
                  </h3>
                </div>
                <div className="p-6">
                  <div className="h-[400px]">
                    <ReactECharts
                      option={publikasiKategoriCapaianChartOption}
                      style={{ height: "100%", width: "100%" }}
                      opts={{ renderer: "svg" }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Publikasi Per Peran Chart */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-indigo-600">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    Publikasi per Peran
                  </h3>
                </div>
                <div className="p-6">
                  <div className="h-[400px]">
                    <ReactECharts
                      option={publikasiPeranChartOption}
                      style={{ height: "100%", width: "100%" }}
                      opts={{ renderer: "svg" }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Publikasi per Fakultas Chart - Full Width with Drilldown */}
            <motion.div variants={itemVariants} className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" id="publikasi-sebaran-chart">
              <div className="px-6 py-5 bg-emerald-600 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  {publikasiDrillLevel === 'fakultas'
                    ? 'Sebaran Publikasi Per Fakultas'
                    : `Sebaran Publikasi Per Prodi - ${publikasiSelectedFakultas?.nama}`
                  }
                </h3>
                {publikasiDrillLevel === 'prodi' && (
                  <button
                    onClick={handlePublikasiDrillUp}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-semibold text-sm shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali ke Fakultas
                  </button>
                )}
              </div>
              <div className="p-6">
                <div className="h-[450px]">
                  <ReactECharts
                    option={publikasiDrillLevel === 'fakultas' ? publikasiFakultasSebaranChartOption : publikasiProdiSebaranChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                    onEvents={{
                      click: (params: any) => {
                        if (publikasiDrillLevel === 'fakultas') {
                          const fakultas = publikasiFakultasSebaranData.find(f => f.nama === params.name);
                          if (fakultas) {
                            handlePublikasiDrillDown(fakultas.id, fakultas.nama);
                          }
                        }
                      }
                    }}
                  />
                </div>
                {publikasiDrillLevel === 'fakultas' && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">💡</div>
                      <div>
                        <div className="text-sm font-semibold text-emerald-900 mb-1">
                          Tips Navigasi
                        </div>
                        <div className="text-xs text-emerald-700">
                          Klik pada bar chart untuk melihat detail publikasi per program studi di fakultas tersebut
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Penelitian Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-pink-50 relative">
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
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 pb-1 leading-relaxed">
                Penelitian dan Pengabdian
              </h2>
              <div className="flex items-center justify-center mb-3">
                <div className="h-1 w-20 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full"></div>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Kegiatan penelitian dan pengabdian dosen Universitas Lampung
              </p>
            </motion.div>

            {/* Highlights */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
              >
                <div className="text-3xl mb-3">🔬</div>
                <div className="text-3xl font-bold mb-1">{penelitianData?.total.toLocaleString() || 0}</div>
                <div className="text-sm font-semibold opacity-90">Total Penelitian & Pengabdian (5 Tahun)</div>
              </motion.div>

              {penelitianData?.by_year && penelitianData.by_year.length > 0 && (
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg"
                >
                  <div className="text-3xl mb-3">📅</div>
                  <div className="text-3xl font-bold mb-1">{penelitianData.by_year[0].jumlah.toLocaleString()}</div>
                  <div className="text-sm font-semibold opacity-90">Penelitian & Pengabdian {penelitianData.by_year[0].tahun}</div>
                </motion.div>
              )}

              {penelitianData?.by_funding && penelitianData.by_funding.length > 0 && (() => {
                const totalDana = penelitianData.by_funding.reduce((sum, item) => sum + item.total_dana, 0);
                let displayValue = '';

                if (totalDana >= 1000000000000) {
                  // Triliun
                  displayValue = `Rp ${(totalDana / 1000000000000).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} T`;
                } else if (totalDana >= 1000000000) {
                  // Miliar
                  displayValue = `Rp ${(totalDana / 1000000000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Miliar`;
                } else if (totalDana >= 1000000) {
                  // Juta
                  displayValue = `Rp ${(totalDana / 1000000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Juta`;
                } else {
                  displayValue = `Rp ${totalDana.toLocaleString('id-ID')}`;
                }

                return (
                  <motion.div
                    variants={itemVariants}
                    className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg"
                  >
                    <div className="text-3xl mb-3">💰</div>
                    <div className="text-2xl font-bold mb-1">
                      {displayValue}
                    </div>
                    <div className="text-sm font-semibold opacity-90">Total Dana Penelitian (5 Tahun)</div>
                  </motion.div>
                );
              })()}
            </motion.div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Penelitian Per Kategori Chart */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-purple-600">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Distribusi Kategori Penelitian
                  </h3>
                </div>
                <div className="p-6">
                  <div className="h-[400px]">
                    <ReactECharts
                      option={penelitianKategoriChartOption}
                      style={{ height: "100%", width: "100%" }}
                      opts={{ renderer: "svg" }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Penelitian Per Tahun Chart */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-purple-600">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Tren Penelitian per Tahun
                  </h3>
                </div>
                <div className="p-6">
                  <div className="h-[400px]">
                    <ReactECharts
                      option={penelitianTahunChartOption}
                      style={{ height: "100%", width: "100%" }}
                      opts={{ renderer: "svg" }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Dana Penelitian per Tahun Chart */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-pink-600">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    Dana Penelitian per Tahun
                  </h3>
                </div>
                <div className="p-6">
                  <div className="h-[400px]">
                    <ReactECharts
                      option={penelitianFundingChartOption}
                      style={{ height: "100%", width: "100%" }}
                      opts={{ renderer: "svg" }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Penelitian per Kelompok Bidang Chart */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-pink-600">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    Kelompok Bidang Penelitian
                  </h3>
                </div>
                <div className="p-6">
                  <div className="h-[400px]">
                    <ReactECharts
                      option={penelitianKelompokBidangChartOption}
                      style={{ height: "100%", width: "100%" }}
                      opts={{ renderer: "svg" }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Penelitian per Fakultas Chart - Full Width with Drilldown */}
            <motion.div variants={itemVariants} className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" id="penelitian-sebaran-chart">
              <div className="px-6 py-5 bg-purple-600 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  {penelitianDrillLevel === 'fakultas'
                    ? 'Sebaran Penelitian dan Pengabdian Per Fakultas'
                    : `Sebaran Penelitian dan Pengabdian Per Prodi - ${penelitianSelectedFakultas?.nama}`
                  }
                </h3>
                {penelitianDrillLevel === 'prodi' && (
                  <button
                    onClick={handlePenelitianDrillUp}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold text-sm shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali ke Fakultas
                  </button>
                )}
              </div>
              <div className="p-6">
                <div className="h-[450px]">
                  <ReactECharts
                    option={penelitianDrillLevel === 'fakultas' ? penelitianFakultasSebaranChartOption : penelitianProdiSebaranChartOption}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                    onEvents={{
                      click: (params: any) => {
                        if (penelitianDrillLevel === 'fakultas') {
                          const fakultas = penelitianFakultasSebaranData.find(f => f.nama_fakultas === params.name);
                          if (fakultas) {
                            handlePenelitianDrillDown(fakultas.id_fakultas, fakultas.nama_fakultas);
                          }
                        }
                      }
                    }}
                  />
                </div>
                {penelitianDrillLevel === 'fakultas' && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">💡</div>
                      <div>
                        <div className="text-sm font-semibold text-purple-900 mb-1">
                          Tips Navigasi
                        </div>
                        <div className="text-xs text-purple-700">
                          Klik pada bar chart untuk melihat detail penelitian dan pengabdian per program studi di fakultas tersebut
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
