"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { Card, CardBody, Spinner } from "@heroui/react";
import dashboardService from "@/lib/services/public/dashboardService";
import { getSebaranStatistics } from "@/lib/services/public/mahasiswaSebaranService";
import type {
  MahasiswaTrendYearItem,
  JenjangDistributionItem,
  StatusDistributionItem,
  JenisKelaminDistributionItem,
  JalurDaftarDistributionItem,
  JenisPendaftaranDistributionItem,
  PembiayaanDistributionItem,
  MahasiswaAsingNegaraItem,
  LokalVsAsingItem,
  MahasiswaStatisticsSummary,
} from "@/lib/types/dashboardTypes";

// Import ECharts dynamically (same as SebaranMahasiswa)
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_PUBLIC_API_URL}`
  : 'http://localhost:9800/public-service/api/v1';

interface FakultasDataItem {
  id: string;
  nama: string;
  jumlah: number;
  persentase: number;
}

interface KabupatenDataItem {
  provinsi: string;
  jumlah: number;
  persentase: number;
}

interface SebaranStatistics {
  mahasiswa_lokal_persen: number;
  mahasiswa_luar_daerah_persen: number;
  total_provinsi: number;
  total_kabupaten: number;
}

export default function StatistikMahasiswaAktif() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<MahasiswaStatisticsSummary | null>(null);
  const [showPeriodInfo, setShowPeriodInfo] = useState(false);
  const [trendData, setTrendData] = useState<MahasiswaTrendYearItem[]>([]);
  const [jenjangData, setJenjangData] = useState<JenjangDistributionItem[]>([]);
  const [statusData, setStatusData] = useState<StatusDistributionItem[]>([]);
  // Filter semester untuk chart status mhs (default null = semester aktif)
  const [statusSemester, setStatusSemester] = useState<string>("");
  const [availableSemesters, setAvailableSemesters] = useState<{ id_smt: string; nm_smt: string }[]>([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [jenisKelaminData, setJenisKelaminData] = useState<JenisKelaminDistributionItem[]>([]);
  const [jalurDaftarData, setJalurDaftarData] = useState<JalurDaftarDistributionItem[]>([]);
  const [jenisPendaftaranData, setJenisPendaftaranData] = useState<JenisPendaftaranDistributionItem[]>([]);
  const [pembiayaanData, setPembiayaanData] = useState<PembiayaanDistributionItem[]>([]);
  const [mahasiswaAsingData, setMahasiswaAsingData] = useState<MahasiswaAsingNegaraItem[]>([]);
  const [lokalVsAsingData, setLokalVsAsingData] = useState<LokalVsAsingItem[]>([]);

  // Sebaran data states
  const [fakultasData, setFakultasData] = useState<FakultasDataItem[]>([]);
  const [kabupatenData, setKabupatenData] = useState<KabupatenDataItem[]>([]);
  const [sebaranStatistics, setSebaranStatistics] = useState<SebaranStatistics | null>(null);
  const [activeSebaranView, setActiveSebaranView] = useState<'fakultas' | 'kabupaten'>('fakultas');

  // Drilldown states for prodi
  const [prodiData, setProdiData] = useState<{id: string; nama: string; jenjang: string; jumlah: number; persentase: number}[]>([]);
  const [drillLevel, setDrillLevel] = useState<'fakultas' | 'prodi'>('fakultas');
  const [selectedFakultas, setSelectedFakultas] = useState<{id: string; nama: string} | null>(null);
  const [loadingProdi, setLoadingProdi] = useState(false);

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
      setLoadingProdi(true);
      const response = await fetch(`${API_URL}/mahasiswa-sebaran/fakultas/${fakultasId}/prodi`);
      const data = await response.json();

      if (data.success) {
        const prodiDataFormatted = data.data.data.map((item: any) => ({
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
      setLoadingProdi(false);
    }
  };

  // Function to drill up back to fakultas
  const handleDrillUp = () => {
    setDrillLevel('fakultas');
    setSelectedFakultas(null);
    setProdiData([]);
  };

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch statistics data
        const response = await dashboardService.getMahasiswaAllStatistics();

        if (response.success && response.data) {
          setSummary(response.data.summary);
          setTrendData(response.data.trend.data);
          setJenjangData(response.data.jenjang.data);
          setStatusData(response.data.status.data);
          setJenisKelaminData(response.data.jenis_kelamin.data);
          setJalurDaftarData(response.data.jalur_daftar.data);
          setJenisPendaftaranData(response.data.jenis_pendaftaran?.data || []);
          setPembiayaanData(response.data.pembiayaan?.data || []);
          setMahasiswaAsingData(response.data.mahasiswa_asing.data);
          setLokalVsAsingData(response.data.mahasiswa_asing.lokal_vs_asing);
        }

        // Fetch sebaran data (kabupaten)
        const sebaranResponse = await getSebaranStatistics();
        if (sebaranResponse.success) {
          const kabData = sebaranResponse.data.kabupaten.data.slice(0, 10).map((item: any) => ({
            provinsi: item.nama_kabupaten,
            jumlah: item.jumlah_mahasiswa,
            persentase: parseFloat(item.persentase.toFixed(1)),
          }));
          setKabupatenData(kabData);
          setSebaranStatistics(sebaranResponse.data.statistics);
        }

        // Fetch fakultas data
        const fakultasResponse = await fetch(`${API_URL}/mahasiswa-sebaran/fakultas`);
        const fakultasJson = await fakultasResponse.json();
        if (fakultasJson.success) {
          const fakData = fakultasJson.data.data.map((item: any) => ({
            id: item.id_fakultas,
            nama: item.nama_fakultas,
            jumlah: item.jumlah_mahasiswa,
            persentase: parseFloat(item.persentase.toFixed(1)),
          }));
          setFakultasData(fakData);
        }
      } catch (err) {
        console.error('Error fetching mahasiswa statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Fetch list semester available untuk dropdown filter chart status
    dashboardService.getAvailableSemesters()
      .then(r => setAvailableSemesters(r.success ? r.data : []))
      .catch(() => setAvailableSemesters([]));
  }, []);

  // Re-fetch chart status when statusSemester filter changes
  useEffect(() => {
    if (!statusSemester) return; // empty = semester aktif default, sudah dimuat di fetchData
    setStatusLoading(true);
    dashboardService.getSebaranMahasiswaByStatus(statusSemester)
      .then(r => { if (r.success) setStatusData(r.data.data); })
      .catch(err => console.error('Error refetch status:', err))
      .finally(() => setStatusLoading(false));
  }, [statusSemester]);

  // Helper function to get tahun ajaran from periode
  const getTahunAjaran = (periode: string) => {
    if (!periode) return "";
    const year = periode.substring(0, 4);
    return year;
  };

  // 1. Line Chart - 5 Tahun Terakhir Mahasiswa Aktif (Enhanced)
  const trendChartOptions = useMemo(() => {
    if (!trendData || trendData.length === 0) {
      return { xAxis: { type: "category", data: [] }, yAxis: { type: "value" }, series: [] };
    }

    // Calculate min/max for better Y-axis scaling
    const values = trendData.map(item => item.jumlah_mahasiswa);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const padding = (maxValue - minValue) * 0.15;

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          crossStyle: { color: "#999" },
          lineStyle: { color: "#6366f1", width: 1, type: "dashed" },
        },
        formatter: (params: any) => {
          const item = params[0];
          const prevIndex = trendData.findIndex(d => d.tahun === item.name) - 1;
          const prevValue = prevIndex >= 0 ? trendData[prevIndex].jumlah_mahasiswa : null;
          const change = prevValue ? ((item.value - prevValue) / prevValue * 100).toFixed(1) : null;
          const changeColor = change && parseFloat(change) >= 0 ? "#10b981" : "#ef4444";
          const changeIcon = change && parseFloat(change) >= 0 ? "▲" : "▼";

          return `<div style="padding: 12px; min-width: 180px;">
            <div style="font-weight: 700; color: #1f2937; margin-bottom: 8px; font-size: 14px;">
              Tahun Ajaran ${item.name}
            </div>
            <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px;">
              <span style="color: #6366f1; font-size: 24px; font-weight: 800;">${item.value.toLocaleString()}</span>
              <span style="color: #6b7280; font-size: 12px;">mahasiswa</span>
            </div>
            ${change ? `<div style="color: ${changeColor}; font-size: 12px; font-weight: 600;">
              ${changeIcon} ${Math.abs(parseFloat(change))}% dari tahun sebelumnya
            </div>` : ''}
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        borderColor: "#6366f1",
        borderWidth: 2,
        extraCssText: "box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2); border-radius: 12px;",
      },
      grid: {
        left: "3%",
        right: "5%",
        bottom: "12%",
        top: "8%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: trendData.map(item => item.tahun),
        axisLabel: {
          color: "#374151",
          fontSize: 13,
          fontWeight: 600,
          margin: 12,
        },
        axisLine: {
          lineStyle: { color: "#e5e7eb", width: 2 }
        },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        min: Math.floor((minValue - padding) / 1000) * 1000,
        max: Math.ceil((maxValue + padding) / 1000) * 1000,
        axisLabel: {
          color: "#6b7280",
          fontSize: 12,
          fontWeight: 500,
          formatter: (value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString(),
        },
        splitLine: {
          lineStyle: {
            color: "#f3f4f6",
            type: "solid",
            width: 1,
          }
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          name: "Mahasiswa Aktif",
          type: "line",
          data: trendData.map(item => item.jumlah_mahasiswa),
          smooth: 0.4,
          symbol: "circle",
          symbolSize: 12,
          lineStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: "#6366f1" },
                { offset: 0.5, color: "#8b5cf6" },
                { offset: 1, color: "#a855f7" },
              ],
            },
            width: 4,
            shadowColor: "rgba(99, 102, 241, 0.4)",
            shadowBlur: 10,
            shadowOffsetY: 8,
          },
          itemStyle: {
            color: "#6366f1",
            borderWidth: 4,
            borderColor: "#fff",
            shadowColor: "rgba(99, 102, 241, 0.5)",
            shadowBlur: 8,
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(99, 102, 241, 0.35)" },
                { offset: 0.5, color: "rgba(139, 92, 246, 0.15)" },
                { offset: 1, color: "rgba(168, 85, 247, 0.02)" },
              ],
            },
          },
          emphasis: {
            focus: "series",
            itemStyle: {
              color: "#6366f1",
              borderColor: "#fff",
              borderWidth: 4,
              shadowBlur: 20,
              shadowColor: "rgba(99, 102, 241, 0.6)",
              scale: true,
            },
          },
          label: {
            show: true,
            position: "top",
            distance: 12,
            formatter: (params: any) => params.value.toLocaleString(),
            color: "#374151",
            fontSize: 12,
            fontWeight: 700,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: [4, 8],
            borderRadius: 4,
            shadowColor: "rgba(0, 0, 0, 0.1)",
            shadowBlur: 4,
          },
        },
      ],
      animationDuration: 1500,
      animationEasing: "cubicInOut",
    };
  }, [trendData]);

  // 2. Pie Chart - Jenjang Pendidikan
  const jenjangChartOptions = useMemo(() => {
    if (!jenjangData || jenjangData.length === 0) {
      return { series: [] };
    }

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    return {
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${params.name}</div>
            <div style="color: ${params.color}; font-size: 18px; font-weight: 700;">${params.value.toLocaleString()}</div>
            <div style="color: #6b7280; font-size: 12px;">${params.percent}%</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      legend: {
        orient: "horizontal",
        bottom: "0%",
        textStyle: { color: "#6b7280", fontSize: 11 },
      },
      series: [
        {
          type: "pie",
          radius: ["0%", "70%"],
          center: ["50%", "45%"],
          data: jenjangData.map((item, index) => ({
            name: item.jenjang,
            value: item.jumlah_mahasiswa,
            itemStyle: { color: colors[index % colors.length] },
          })),
          label: {
            show: true,
            formatter: "{b}\n{d}%",
            fontSize: 10,
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
  }, [jenjangData]);

  // 3. Donut Chart - Status Mahasiswa
  const statusChartOptions = useMemo(() => {
    if (!statusData || statusData.length === 0) {
      return { series: [] };
    }

    const colors = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899'];

    return {
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${params.name}</div>
            <div style="color: ${params.color}; font-size: 18px; font-weight: 700;">${params.value.toLocaleString()}</div>
            <div style="color: #6b7280; font-size: 12px;">${params.percent}%</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      legend: {
        orient: "horizontal",
        bottom: "0%",
        textStyle: { color: "#6b7280", fontSize: 11 },
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "45%"],
          data: statusData.map((item, index) => ({
            name: item.status,
            value: item.jumlah_mahasiswa,
            itemStyle: { color: colors[index % colors.length] },
          })),
          label: {
            show: true,
            formatter: "{b}\n{d}%",
            fontSize: 10,
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
  }, [statusData]);

  // 4. Pie Chart - Jenis Kelamin
  const jenisKelaminChartOptions = useMemo(() => {
    if (!jenisKelaminData || jenisKelaminData.length === 0) {
      return { series: [] };
    }

    const colors = ['#3b82f6', '#ec4899', '#6b7280'];

    return {
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${params.name}</div>
            <div style="color: ${params.color}; font-size: 18px; font-weight: 700;">${params.value.toLocaleString()}</div>
            <div style="color: #6b7280; font-size: 12px;">${params.percent}%</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      legend: {
        orient: "horizontal",
        bottom: "0%",
        textStyle: { color: "#6b7280", fontSize: 11 },
      },
      series: [
        {
          type: "pie",
          radius: ["0%", "70%"],
          center: ["50%", "45%"],
          data: jenisKelaminData.map((item, index) => ({
            name: item.jenis_kelamin,
            value: item.jumlah_mahasiswa,
            itemStyle: { color: colors[index % colors.length] },
          })),
          label: {
            show: true,
            formatter: "{b}\n{d}%",
            fontSize: 11,
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
  }, [jenisKelaminData]);

  // 5. Horizontal Bar Chart - Jalur Daftar (karena banyak kategori)
  const jalurDaftarChartOptions = useMemo(() => {
    if (!jalurDaftarData || jalurDaftarData.length === 0) {
      return { xAxis: { type: "value" }, yAxis: { type: "category", data: [] }, series: [] };
    }

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

    // Sort data by jumlah_mahasiswa descending
    const sortedData = [...jalurDaftarData].sort((a, b) => a.jumlah_mahasiswa - b.jumlah_mahasiswa);

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: any) => {
          const item = params[0];
          const total = jalurDaftarData.reduce((sum, d) => sum + d.jumlah_mahasiswa, 0);
          const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${item.name}</div>
            <div style="color: #6366f1; font-size: 18px; font-weight: 700;">${item.value.toLocaleString()}</div>
            <div style="color: #6b7280; font-size: 12px;">${percent}%</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#6366f1",
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
          color: "#6b7280",
          fontSize: 10,
          formatter: (value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString(),
        },
        splitLine: { lineStyle: { type: "dashed", color: "#e5e7eb" } },
      },
      yAxis: {
        type: "category",
        data: sortedData.map((item) => item.jalur_daftar),
        axisLabel: {
          color: "#374151",
          fontSize: 10,
          width: 150,
          overflow: "truncate",
          ellipsis: "...",
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: sortedData.map((item, index) => ({
            value: item.jumlah_mahasiswa,
            itemStyle: {
              color: colors[index % colors.length],
              borderRadius: [0, 4, 4, 0],
            },
          })),
          barWidth: "60%",
          label: {
            show: true,
            position: "right",
            formatter: "{c}",
            fontSize: 10,
            color: "#374151",
          },
        },
      ],
    };
  }, [jalurDaftarData]);

  // 6. Horizontal Bar Chart - Jenis Pendaftaran
  const jenisPendaftaranChartOptions = useMemo(() => {
    if (!jenisPendaftaranData || jenisPendaftaranData.length === 0) {
      return { xAxis: { type: "value" }, yAxis: { type: "category", data: [] }, series: [] };
    }

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    const sortedData = [...jenisPendaftaranData].sort((a, b) => a.jumlah_mahasiswa - b.jumlah_mahasiswa);

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: any) => {
          const item = params[0];
          const total = jenisPendaftaranData.reduce((sum, d) => sum + d.jumlah_mahasiswa, 0);
          const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${item.name}</div>
            <div style="color: #10b981; font-size: 18px; font-weight: 700;">${item.value.toLocaleString()}</div>
            <div style="color: #6b7280; font-size: 12px;">${percent}%</div>
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
      xAxis: {
        type: "value",
        axisLabel: {
          color: "#6b7280",
          fontSize: 10,
          formatter: (value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString(),
        },
        splitLine: { lineStyle: { type: "dashed", color: "#e5e7eb" } },
      },
      yAxis: {
        type: "category",
        data: sortedData.map((item) => item.jenis_pendaftaran),
        axisLabel: {
          color: "#374151",
          fontSize: 10,
          width: 150,
          overflow: "truncate",
          ellipsis: "...",
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: sortedData.map((item, index) => ({
            value: item.jumlah_mahasiswa,
            itemStyle: {
              color: colors[index % colors.length],
              borderRadius: [0, 4, 4, 0],
            },
          })),
          barWidth: "60%",
          label: {
            show: true,
            position: "right",
            formatter: "{c}",
            fontSize: 10,
            color: "#374151",
          },
        },
      ],
    };
  }, [jenisPendaftaranData]);

  // 7. Pie Chart - Pembiayaan
  const pembiayaanChartOptions = useMemo(() => {
    if (!pembiayaanData || pembiayaanData.length === 0) {
      return { series: [] };
    }

    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];

    return {
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${params.name}</div>
            <div style="color: ${params.color}; font-size: 18px; font-weight: 700;">${params.value.toLocaleString()}</div>
            <div style="color: #6b7280; font-size: 12px;">${params.percent}%</div>
          </div>`;
        },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;",
      },
      legend: {
        orient: "horizontal",
        bottom: "0%",
        textStyle: { color: "#6b7280", fontSize: 11 },
      },
      series: [
        {
          type: "pie",
          radius: ["0%", "70%"],
          center: ["50%", "45%"],
          data: pembiayaanData.map((item, index) => ({
            name: item.pembiayaan,
            value: item.jumlah_mahasiswa,
            itemStyle: { color: colors[index % colors.length] },
          })),
          label: {
            show: true,
            formatter: "{b}\n{d}%",
            fontSize: 10,
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
  }, [pembiayaanData]);

  // 8. Bar Chart - Mahasiswa Asing per Negara (tambahan untuk section sebaran)
  const mahasiswaAsingChartOptions = useMemo(() => {
    if (!mahasiswaAsingData || mahasiswaAsingData.length === 0) {
      return { xAxis: { type: "category", data: [] }, yAxis: { type: "value" }, series: [] };
    }

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: any) => {
          const item = params[0];
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${item.name}</div>
            <div style="color: #8b5cf6; font-size: 18px; font-weight: 700;">${item.value.toLocaleString()}</div>
            <div style="color: #6b7280; font-size: 12px;">mahasiswa</div>
          </div>`;
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
        top: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: mahasiswaAsingData.map(item => item.negara),
        axisLabel: {
          color: "#6b7280",
          fontSize: 10,
          rotate: 45,
        },
        axisLine: { lineStyle: { color: "#e5e7eb" } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#6b7280", fontSize: 11 },
        splitLine: { lineStyle: { color: "#e5e7eb", type: "dashed" } },
      },
      series: [
        {
          type: "bar",
          data: mahasiswaAsingData.map(item => item.jumlah_mahasiswa),
          itemStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: "#8b5cf6" },
                { offset: 1, color: "#a78bfa" },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: "60%",
        },
      ],
    };
  }, [mahasiswaAsingData]);

  // 9. Horizontal Bar Chart - Sebaran Per Fakultas
  const fakultasChartOptions = useMemo(() => {
    if (!fakultasData || fakultasData.length === 0) {
      return { xAxis: { type: "value" }, yAxis: { type: "category", data: [] }, series: [] };
    }

    const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f97316', '#10b981', '#14b8a6', '#06b6d4'];

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: any) => {
          const item = params[0];
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${item.name}</div>
            <div style="color: #3b82f6; font-size: 18px; font-weight: 700;">${item.value.toLocaleString()}</div>
            <div style="color: #6b7280; font-size: 12px;">mahasiswa (${item.data.persentase}%)</div>
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
      xAxis: {
        type: "value",
        axisLabel: {
          color: "#6b7280",
          fontSize: 10,
          formatter: (value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString(),
        },
        splitLine: { lineStyle: { type: "dashed", color: "#e5e7eb" } },
      },
      yAxis: {
        type: "category",
        data: fakultasData.map(item => item.nama),
        axisLabel: {
          color: "#374151",
          fontSize: 11,
          fontWeight: 600,
        },
        axisLine: { show: false },
        axisTick: { show: false },
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
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: colors[index % colors.length] },
                  { offset: 1, color: colors[(index + 1) % colors.length] },
                ],
              },
              borderRadius: [0, 6, 6, 0],
            },
          })),
          barWidth: "70%",
          label: {
            show: true,
            position: "right",
            formatter: (params: any) => `${params.data.persentase}%`,
            color: "#374151",
            fontSize: 11,
            fontWeight: 600,
          },
        },
      ],
    };
  }, [fakultasData]);

  // 10. Horizontal Bar Chart - Sebaran Per Prodi (Drilldown from Fakultas)
  const prodiChartOptions = useMemo(() => {
    if (!prodiData || prodiData.length === 0) {
      return { xAxis: { type: "value" }, yAxis: { type: "category", data: [] }, series: [] };
    }

    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#6366f1'];

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: any) => {
          const item = params[0];
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${item.name}</div>
            <div style="color: #10b981; font-size: 18px; font-weight: 700;">${item.value.toLocaleString()}</div>
            <div style="color: #6b7280; font-size: 12px;">mahasiswa (${item.data.persentase}%)</div>
            <div style="color: #9ca3af; font-size: 11px; margin-top: 4px;">Jenjang: ${item.data.jenjang}</div>
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
      xAxis: {
        type: "value",
        axisLabel: {
          color: "#6b7280",
          fontSize: 10,
          formatter: (value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString(),
        },
        splitLine: { lineStyle: { type: "dashed", color: "#e5e7eb" } },
      },
      yAxis: {
        type: "category",
        data: prodiData.map(item => item.nama),
        axisLabel: {
          color: "#374151",
          fontSize: 10,
          fontWeight: 600,
          width: 180,
          overflow: "truncate",
          ellipsis: "...",
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: prodiData.map((item, index) => ({
            value: item.jumlah,
            persentase: item.persentase,
            jenjang: item.jenjang,
            itemStyle: {
              color: {
                type: "linear",
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: colors[index % colors.length] },
                  { offset: 1, color: colors[(index + 1) % colors.length] },
                ],
              },
              borderRadius: [0, 6, 6, 0],
            },
          })),
          barWidth: "60%",
          label: {
            show: true,
            position: "right",
            formatter: (params: any) => `${params.data.persentase}%`,
            color: "#374151",
            fontSize: 10,
            fontWeight: 600,
          },
        },
      ],
    };
  }, [prodiData]);

  // 11. Horizontal Bar Chart - Sebaran Per Kabupaten
  const kabupatenChartOptions = useMemo(() => {
    if (!kabupatenData || kabupatenData.length === 0) {
      return { xAxis: { type: "value" }, yAxis: { type: "category", data: [] }, series: [] };
    }

    const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#94a3b8', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'];

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: any) => {
          const item = params[0];
          return `<div style="padding: 8px;">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${item.name}</div>
            <div style="color: #3b82f6; font-size: 18px; font-weight: 700;">${item.value.toLocaleString()}</div>
            <div style="color: #6b7280; font-size: 12px;">mahasiswa (${item.data.persentase}%)</div>
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
      xAxis: {
        type: "value",
        axisLabel: {
          color: "#6b7280",
          fontSize: 10,
          formatter: (value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString(),
        },
        splitLine: { lineStyle: { type: "dashed", color: "#e5e7eb" } },
      },
      yAxis: {
        type: "category",
        data: kabupatenData.map(item => item.provinsi),
        axisLabel: {
          color: "#374151",
          fontSize: 11,
          fontWeight: 600,
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: kabupatenData.map((item, index) => ({
            value: item.jumlah,
            persentase: item.persentase,
            itemStyle: {
              color: {
                type: "linear",
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: colors[index % colors.length] },
                  { offset: 1, color: colors[(index + 1) % colors.length] },
                ],
              },
              borderRadius: [0, 6, 6, 0],
            },
          })),
          barWidth: "60%",
          label: {
            show: true,
            position: "right",
            formatter: (params: any) => `${params.data.persentase}%`,
            color: "#374151",
            fontSize: 11,
            fontWeight: 600,
          },
        },
      ],
    };
  }, [kabupatenData]);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" label="Memuat data statistik..." />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="statistik-mahasiswa-aktif" className="py-12 sm:py-16 md:py-20 bg-white relative">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        {/* Section Header */}
        <motion.div className="text-center mb-8 sm:mb-10" variants={itemVariants}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 sm:mb-3 pb-1 leading-relaxed px-2">
            Statistik Mahasiswa Aktif
          </h2>
          <div className="flex items-center justify-center mb-2 sm:mb-3">
            <div className="h-1 w-16 sm:w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
            Tahun Ajaran {summary?.periode ? getTahunAjaran(summary.periode) : ""}
          </p>

          {/* Badge: Periode + Last Update + Info tooltip */}
          {summary && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 font-medium">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
                Periode: {summary.periode_nama ?? summary.periode}
              </span>

              {summary.last_update && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 font-medium">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                  Terakhir diupdate: {new Date(summary.last_update).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              )}

              {summary.last_feeder_sync && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 font-medium" title="Sync terakhir feeder PDDIKTI ke registrasi mahasiswa">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/></svg>
                  Feeder sync: {new Date(summary.last_feeder_sync).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              )}

              <button
                type="button"
                onClick={() => setShowPeriodInfo(v => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 font-medium hover:bg-amber-200 dark:hover:bg-amber-800/60 transition-colors"
                title="Info sumber data"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-.293V10a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
                Info sumber
              </button>
            </div>
          )}

          {summary && showPeriodInfo && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 mx-auto max-w-2xl text-left text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-2"
            >
              <p><strong>Sumber:</strong> {summary.sumber ?? "pdut (pdrd.kuliah_mhs)"}</p>
              {summary.formula && <p><strong>Formula:</strong> <code className="text-[11px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">{summary.formula}</code></p>}
              {summary.note && <p className="text-slate-600 dark:text-slate-400 italic">{summary.note}</p>}
              <p className="text-slate-500 dark:text-slate-400">
                Semester berjalan berikutnya akan ditampilkan secara otomatis setelah data registrasi pdut lengkap (admin pdut flip <code>ref.semester.a_periode_aktif</code>).
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Summary Cards - 2 Cards: Total Seluruh & Total Aktif */}
        {summary && (
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-xl hover:shadow-2xl transition-shadow">
              <CardBody className="p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <svg className="w-8 h-8 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <p className="text-base font-medium opacity-90">Total Mahasiswa Terdaftar</p>
                </div>
                <p className="text-4xl font-bold">{(summary.total_mahasiswa_aktif + (statusData.find(s => s.status === "NON-AKTIF")?.jumlah_mahasiswa || 0)).toLocaleString()}</p>
              </CardBody>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl hover:shadow-2xl transition-shadow">
              <CardBody className="p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <svg className="w-8 h-8 text-emerald-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-base font-medium opacity-90">Total Mahasiswa Aktif</p>
                </div>
                <p className="text-4xl font-bold">{summary.total_mahasiswa_aktif.toLocaleString()}</p>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Row 1: Trend 5 Tahun Terakhir (Full Width) */}
        <motion.div variants={itemVariants} className="mb-6">
          <Card className="shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden rounded-2xl">
            <CardBody className="p-0">
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Trend Mahasiswa Aktif 5 Tahun Terakhir
                </h3>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900">
                <div className="h-[380px]">
                  <ReactECharts
                    option={trendChartOptions}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Row 2: Mahasiswa Asing Berdasarkan Negara (Full Width) - TEMPORARILY DISABLED */}
        {/* TODO: Enable when backend data is ready
        <motion.div variants={itemVariants} className="mb-6">
          <Card className="shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden rounded-2xl">
            <CardBody className="p-0">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  Mahasiswa Asing Berdasarkan Negara
                </h3>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900">
                {mahasiswaAsingData.length > 0 ? (
                  <div className="h-[300px]">
                    <ReactECharts
                      option={mahasiswaAsingChartOptions}
                      style={{ height: "100%", width: "100%" }}
                      opts={{ renderer: "svg" }}
                    />
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <p>Tidak ada data mahasiswa asing</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>
        */}

        {/* Row 3: Jenjang (Pie) & Status (Donut) - 2 Columns */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Jenjang Pendidikan - Pie Chart */}
          <Card className="shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden rounded-2xl">
            <CardBody className="p-0">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                  </svg>
                  Berdasarkan Jenjang Pendidikan
                </h3>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900">
                <div className="h-[300px]">
                  <ReactECharts
                    option={jenjangChartOptions}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Status Mahasiswa - Donut Chart */}
          <Card className="shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden rounded-2xl">
            <CardBody className="p-0">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Berdasarkan Status Mahasiswa
                  </h3>
                  {/* Semester filter — status mhs berubah per semester, jadi user bisa lihat snapshot semester lain */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Semester:</label>
                    <select
                      value={statusSemester}
                      onChange={(e) => setStatusSemester(e.target.value)}
                      className="text-xs font-medium rounded-lg border border-orange-300 bg-white px-2.5 py-1.5 text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-orange-700 dark:bg-gray-800 dark:text-gray-100"
                    >
                      <option value="">Aktif (default)</option>
                      {availableSemesters.map(s => (
                        <option key={s.id_smt} value={s.id_smt}>{s.nm_smt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900">
                <div className="h-[300px] relative">
                  {statusLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 z-10">
                      <div className="text-sm text-orange-600 dark:text-orange-400">Memuat...</div>
                    </div>
                  )}
                  <ReactECharts
                    option={statusChartOptions}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Row 4: Jenis Kelamin (Pie) & Pembiayaan (Pie) - 2 Columns */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Jenis Kelamin - Pie Chart */}
          <Card className="shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden rounded-2xl">
            <CardBody className="p-0">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Berdasarkan Jenis Kelamin
                </h3>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900">
                <div className="h-[300px]">
                  <ReactECharts
                    option={jenisKelaminChartOptions}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Pembiayaan - Pie Chart */}
          <Card className="shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden rounded-2xl">
            <CardBody className="p-0">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M6 10a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2H6zm5 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Berdasarkan Pembiayaan
                </h3>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900">
                <div className="h-[300px]">
                  <ReactECharts
                    option={pembiayaanChartOptions}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Row 5: Jalur Daftar & Jenis Pendaftaran - 2 Columns Horizontal Bar Charts */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Jalur Daftar - Horizontal Bar Chart */}
          <Card className="shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden rounded-2xl">
            <CardBody className="p-0">
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Berdasarkan Jalur Daftar
                </h3>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900">
                <div style={{ height: `${Math.max(300, jalurDaftarData.length * 35)}px` }}>
                  <ReactECharts
                    option={jalurDaftarChartOptions}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Jenis Pendaftaran - Horizontal Bar Chart */}
          <Card className="shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden rounded-2xl">
            <CardBody className="p-0">
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                  </svg>
                  Berdasarkan Jenis Pendaftaran
                </h3>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900">
                <div style={{ height: `${Math.max(300, jenisPendaftaranData.length * 35)}px` }}>
                  <ReactECharts
                    option={jenisPendaftaranChartOptions}
                    style={{ height: "100%", width: "100%" }}
                    opts={{ renderer: "svg" }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Row 6: Sebaran Mahasiswa - Full Width with Tab Switcher */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden rounded-2xl">
            <CardBody className="p-0">
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Sebaran Mahasiswa
                  </h3>
                  {/* Tab Switcher */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActiveSebaranView('fakultas');
                        handleDrillUp(); // Reset drilldown when switching tabs
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                        activeSebaranView === 'fakultas'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      Per Fakultas
                    </button>
                    <button
                      onClick={() => {
                        setActiveSebaranView('kabupaten');
                        handleDrillUp(); // Reset drilldown when switching tabs
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                        activeSebaranView === 'kabupaten'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      Per Kabupaten/Kota
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Chart Section */}
                  <div>
                    {/* Header with back button when in prodi view */}
                    <h4 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      {activeSebaranView === 'fakultas' && drillLevel === 'prodi' && selectedFakultas ? (
                        <>
                          <button
                            onClick={handleDrillUp}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                          </svg>
                          Program Studi - {selectedFakultas.nama}
                        </>
                      ) : activeSebaranView === 'fakultas' ? (
                        <>
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                          </svg>
                          Sebaran Per Fakultas
                          <span className="text-xs font-normal text-gray-500 ml-2">(klik untuk detail prodi)</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          Top 10 Kabupaten/Kota
                        </>
                      )}
                    </h4>

                    {/* Chart content */}
                    {loadingProdi ? (
                      <div className="flex items-center justify-center h-[350px]">
                        <Spinner size="lg" label="Memuat data program studi..." />
                      </div>
                    ) : (
                      <div style={{
                        height: activeSebaranView === 'fakultas'
                          ? drillLevel === 'prodi'
                            ? `${Math.max(350, prodiData.length * 35)}px`
                            : `${Math.max(350, fakultasData.length * 40)}px`
                          : '400px'
                      }}>
                        {activeSebaranView === 'fakultas' && drillLevel === 'prodi' ? (
                          <ReactECharts
                            option={prodiChartOptions}
                            style={{ height: "100%", width: "100%" }}
                            opts={{ renderer: "svg" }}
                          />
                        ) : activeSebaranView === 'fakultas' ? (
                          <ReactECharts
                            option={fakultasChartOptions}
                            style={{ height: "100%", width: "100%", cursor: "pointer" }}
                            opts={{ renderer: "svg" }}
                            onEvents={{
                              click: (params: any) => {
                                if (params.componentType === 'series') {
                                  const dataIndex = params.dataIndex;
                                  const fakultas = fakultasData[dataIndex];
                                  if (fakultas) {
                                    handleDrillDown(fakultas.id, fakultas.nama);
                                  }
                                }
                              }
                            }}
                          />
                        ) : (
                          <ReactECharts
                            option={kabupatenChartOptions}
                            style={{ height: "100%", width: "100%" }}
                            opts={{ renderer: "svg" }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Detail Section */}
                  <div>
                    <h4 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                      {activeSebaranView === 'fakultas' && drillLevel === 'prodi'
                        ? `Detail Program Studi`
                        : 'Detail Sebaran'}
                    </h4>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {activeSebaranView === 'fakultas' && drillLevel === 'prodi'
                        ? prodiData.map((item, index) => (
                            <div key={index} className="group">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-1 min-w-0 mr-4 truncate">
                                  {item.nama}
                                  <span className="text-xs font-normal text-gray-500 ml-1">({item.jenjang})</span>
                                </span>
                                <span className="text-sm font-bold text-emerald-600">{item.jumlah.toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                <motion.div
                                  className={`h-2.5 rounded-full ${
                                    index === 0 ? "bg-emerald-500" :
                                    index === 1 ? "bg-teal-500" :
                                    index === 2 ? "bg-cyan-500" :
                                    index === 3 ? "bg-blue-500" :
                                    index === 4 ? "bg-indigo-500" :
                                    "bg-slate-400"
                                  }`}
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${item.persentase}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 1, delay: index * 0.05 }}
                                />
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.persentase}% dari fakultas</div>
                            </div>
                          ))
                        : activeSebaranView === 'fakultas'
                        ? fakultasData.map((item, index) => (
                            <div
                              key={index}
                              className="group cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg p-2 -m-2 transition-colors"
                              onClick={() => handleDrillDown(item.id, item.nama)}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-1 min-w-0 mr-4 truncate group-hover:text-blue-600 transition-colors">
                                  {item.nama}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-blue-600">{item.jumlah.toLocaleString()}</span>
                                  <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
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
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.persentase}% dari total mahasiswa</div>
                            </div>
                          ))
                        : kabupatenData.map((item, index) => (
                            <div key={index} className="group">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-1 min-w-0 mr-4 truncate">
                                  {item.provinsi}
                                </span>
                                <span className="text-sm font-bold text-blue-600">{item.jumlah.toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
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
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.persentase}% dari total mahasiswa</div>
                            </div>
                          ))
                      }
                    </div>
                  </div>
                </div>

                {/* Quick Stats - Only for Kabupaten view */}
                {activeSebaranView === 'kabupaten' && sebaranStatistics && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <div className="text-2xl mb-1">🏠</div>
                        <div className="text-xl font-bold text-gray-800 dark:text-white">{sebaranStatistics.mahasiswa_lokal_persen}%</div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Mahasiswa Lokal</div>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/30 dark:to-indigo-800/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-700">
                        <div className="text-2xl mb-1">✈️</div>
                        <div className="text-xl font-bold text-gray-800 dark:text-white">{sebaranStatistics.mahasiswa_luar_daerah_persen}%</div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Luar Daerah</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                        <div className="text-2xl mb-1">🗺️</div>
                        <div className="text-xl font-bold text-gray-800 dark:text-white">{sebaranStatistics.total_provinsi}+</div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Provinsi Asal</div>
                      </div>
                      <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 dark:from-pink-900/30 dark:to-pink-800/20 rounded-xl p-4 border border-pink-200 dark:border-pink-700">
                        <div className="text-2xl mb-1">🌟</div>
                        <div className="text-xl font-bold text-gray-800 dark:text-white">{sebaranStatistics.total_kabupaten}+</div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Kabupaten Asal</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>
      </div>
    </section>
  );
}
