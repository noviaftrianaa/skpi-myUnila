'use client';

import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { dashboardService } from '@/lib/services/dashboardService';
import type { MahasiswaTrendItem } from '@/lib/types/dashboardTypes';

interface MahasiswaTrendChartProps {
  programStudiId: string;
}

export default function MahasiswaTrendChart({ programStudiId }: MahasiswaTrendChartProps) {
  const [trendData, setTrendData] = useState<MahasiswaTrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getMahasiswaTrend(programStudiId);

        if (response.success) {
          // Reverse data agar urutan semester dari lama ke baru (untuk chart)
          setTrendData([...response.data].reverse());
        } else {
          setError(response.message);
        }
      } catch (err) {
        console.error('Error fetching mahasiswa trend:', err);
        setError('Gagal memuat data tren mahasiswa');
      } finally {
        setLoading(false);
      }
    };

    if (programStudiId) {
      fetchTrendData();
    }
  }, [programStudiId]);

  if (loading) {
    return (
      <div className="border-2 border-gray-200 rounded-xl p-8 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-sm font-semibold text-gray-700">Memuat data tren...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-red-200 rounded-xl p-8 text-center bg-red-50">
        <div className="text-4xl mb-4">⚠️</div>
        <h4 className="font-bold text-gray-800 mb-2">Gagal Memuat Data</h4>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  if (trendData.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
        <div className="text-5xl mb-4">📊</div>
        <h4 className="font-bold text-gray-800 mb-2">Belum Ada Data</h4>
        <p className="text-sm text-gray-600">
          Belum ada data tren mahasiswa untuk program studi ini
        </p>
      </div>
    );
  }

  // Prepare data untuk chart
  const semesters = trendData.map(item => item.nama_semester);
  const totals = trendData.map(item => item.total_mahasiswa);

  const option = {
    title: {
      text: 'Tren Mahasiswa 5 Semester Terakhir',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
      },
      formatter: (params: any) => {
        const param = params[0];
        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${param.axisValue}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%;"></span>
              <span>Total Mahasiswa: <strong>${param.value}</strong></span>
            </div>
          </div>
        `;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: semesters,
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        interval: 0,
        rotate: 30,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Jumlah Mahasiswa',
      nameTextStyle: {
        color: '#6b7280',
        fontSize: 12,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
      },
    },
    series: [
      {
        name: 'Total Mahasiswa',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#8b5cf6' },
            ],
          },
        },
        itemStyle: {
          color: '#3b82f6',
          borderWidth: 2,
          borderColor: '#fff',
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
        data: totals,
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(59, 130, 246, 0.5)',
          },
        },
      },
    ],
  };

  return (
    <div className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
      <ReactECharts
        option={option}
        style={{ height: '400px', width: '100%' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
}
