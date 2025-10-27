'use client';

import { useEffect, useState } from 'react';
import { FaUserGraduate, FaBriefcase, FaMoneyBillWave, FaClock, FaChartBar, FaBuilding } from 'react-icons/fa';
import { dashboardService } from '@/lib/services/dashboardService';
import type { TracerStudyData } from '@/lib/types/dashboardTypes';

interface TracerStudySectionProps {
  programStudiId: string;
}

export default function TracerStudySection({ programStudiId }: TracerStudySectionProps) {
  const [data, setData] = useState<TracerStudyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracerStudy = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardService.getTracerStudyByProgramStudi(programStudiId);

        if (response.success && response.data) {
          setData(response.data);
        } else {
          setError(response.message || 'Data tidak tersedia');
        }
      } catch (err) {
        console.error('Error fetching tracer study:', err);
        setError('Gagal memuat data tracer study');
      } finally {
        setLoading(false);
      }
    };

    if (programStudiId) {
      fetchTracerStudy();
    }
  }, [programStudiId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-yellow-700 font-medium">{error || 'Data tracer study tidak tersedia'}</p>
      </div>
    );
  }

  if (data.total_alumni === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h4 className="font-bold text-gray-800 mb-2">Belum Ada Data Alumni</h4>
        <p className="text-gray-600 text-sm">Data tracer study alumni untuk program studi ini belum tersedia</p>
      </div>
    );
  }

  // Format currency
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate percentages for status lulusan
  const totalStatus = data.status_lulusan.bekerja + data.status_lulusan.wiraswasta +
                      data.status_lulusan.kuliah_lanjut + data.status_lulusan.belum_bekerja;

  const statusPercentages = {
    bekerja: totalStatus > 0 ? (data.status_lulusan.bekerja / totalStatus * 100).toFixed(1) : '0',
    wiraswasta: totalStatus > 0 ? (data.status_lulusan.wiraswasta / totalStatus * 100).toFixed(1) : '0',
    kuliah_lanjut: totalStatus > 0 ? (data.status_lulusan.kuliah_lanjut / totalStatus * 100).toFixed(1) : '0',
    belum_bekerja: totalStatus > 0 ? (data.status_lulusan.belum_bekerja / totalStatus * 100).toFixed(1) : '0',
  };

  return (
    <div className="space-y-6">
      {/* Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Alumni */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <FaUserGraduate className="text-2xl" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{data.total_alumni.toLocaleString()}</div>
              <div className="text-xs text-blue-100 mt-1">Total Alumni</div>
            </div>
          </div>
          <div className="text-xs text-blue-100">Yang terdata dalam tracer study</div>
        </div>

        {/* Avg Waktu Tunggu */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <FaClock className="text-2xl" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{data.avg_waktu_tunggu}</div>
              <div className="text-xs text-purple-100 mt-1">Bulan</div>
            </div>
          </div>
          <div className="text-xs text-purple-100">Rata-rata waktu tunggu kerja</div>
        </div>

        {/* Avg Income */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <FaMoneyBillWave className="text-2xl" />
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{formatRupiah(data.avg_income)}</div>
              <div className="text-xs text-green-100 mt-1">Per Bulan</div>
            </div>
          </div>
          <div className="text-xs text-green-100">Rata-rata pendapatan</div>
        </div>

        {/* Bekerja Sebelum Lulus */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <FaBriefcase className="text-2xl" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{data.persentase_bekerja_sebelum_lulus}%</div>
              <div className="text-xs text-orange-100 mt-1">{data.bekerja_sebelum_lulus} Alumni</div>
            </div>
          </div>
          <div className="text-xs text-orange-100">Bekerja sebelum lulus</div>
        </div>
      </div>

      {/* Status Lulusan */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaChartBar className="text-blue-600" />
          Status Lulusan
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-800">{data.status_lulusan.bekerja}</div>
              <div className="text-xs text-blue-600 mt-1">({statusPercentages.bekerja}%)</div>
              <div className="text-sm text-blue-700 font-medium mt-2">Bekerja</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-800">{data.status_lulusan.wiraswasta}</div>
              <div className="text-xs text-green-600 mt-1">({statusPercentages.wiraswasta}%)</div>
              <div className="text-sm text-green-700 font-medium mt-2">Wiraswasta</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-800">{data.status_lulusan.kuliah_lanjut}</div>
              <div className="text-xs text-purple-600 mt-1">({statusPercentages.kuliah_lanjut}%)</div>
              <div className="text-sm text-purple-700 font-medium mt-2">Kuliah Lanjut</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-2 border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{data.status_lulusan.belum_bekerja}</div>
              <div className="text-xs text-gray-600 mt-1">({statusPercentages.belum_bekerja}%)</div>
              <div className="text-sm text-gray-700 font-medium mt-2">Belum Bekerja</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Kesesuaian Bidang Kerja */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaChartBar className="text-indigo-600" />
            Kesesuaian Bidang Kerja
          </h3>
          <div className="space-y-3">
            {data.kesesuaian_bidang.map((item, index) => {
              const total = data.kesesuaian_bidang.reduce((sum, i) => sum + i.jumlah, 0);
              const percentage = total > 0 ? (item.jumlah / total * 100).toFixed(1) : 0;
              const colors = [
                'bg-green-500',
                'bg-blue-500',
                'bg-yellow-500',
                'bg-red-500',
                'bg-gray-500'
              ];
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="text-sm font-bold text-gray-900">{item.jumlah} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${colors[index % colors.length]} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level Perusahaan */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaBuilding className="text-cyan-600" />
            Level Perusahaan
          </h3>
          <div className="space-y-3">
            {data.level_perusahaan.map((item, index) => {
              const total = data.level_perusahaan.reduce((sum, i) => sum + i.jumlah, 0);
              const percentage = total > 0 ? (item.jumlah / total * 100).toFixed(1) : 0;
              const colors = [
                'bg-purple-500',
                'bg-pink-500',
                'bg-indigo-500',
                'bg-cyan-500'
              ];
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.level}</span>
                    <span className="text-sm font-bold text-gray-900">{item.jumlah} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${colors[index % colors.length]} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trend Waktu Tunggu */}
      {data.waktu_tunggu_trend.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaClock className="text-orange-600" />
            Trend Waktu Tunggu Kerja (5 Tahun Terakhir)
          </h3>
          <div className="overflow-x-auto">
            <div className="flex items-end justify-between gap-2 min-w-max px-4" style={{ height: '250px' }}>
              {data.waktu_tunggu_trend.map((item, index) => {
                const maxValue = Math.max(...data.waktu_tunggu_trend.map(i => i.avg_waktu_tunggu));
                const heightPercentage = maxValue > 0 ? (item.avg_waktu_tunggu / maxValue * 100) : 0;

                return (
                  <div key={index} className="flex flex-col items-center flex-1 min-w-[80px]">
                    <div className="text-center mb-2">
                      <div className="text-lg font-bold text-gray-900">{item.avg_waktu_tunggu}</div>
                      <div className="text-xs text-gray-500">bulan</div>
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg transition-all duration-500 hover:from-orange-600 hover:to-orange-500"
                      style={{ height: `${heightPercentage}%`, minHeight: '20px' }}
                    ></div>
                    <div className="mt-2 text-center">
                      <div className="text-sm font-bold text-gray-800">{item.tahun}</div>
                      <div className="text-xs text-gray-500">{item.jumlah} alumni</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
