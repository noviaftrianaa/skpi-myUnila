'use client';

import { useEffect, useState } from 'react';
import { FaBook } from 'react-icons/fa';
import { dashboardService } from '@/lib/services/dashboardService';
import type { Kurikulum, SemesterMataKuliah } from '@/lib/types/dashboardTypes';

interface KurikulumListProps {
  programStudiId: string;
}

export default function KurikulumList({ programStudiId }: KurikulumListProps) {
  const [kurikulumList, setKurikulumList] = useState<Kurikulum[]>([]);
  const [selectedKurikulumId, setSelectedKurikulumId] = useState<string>('');
  const [mataKuliahData, setMataKuliahData] = useState<SemesterMataKuliah[]>([]);
  const [loadingKurikulum, setLoadingKurikulum] = useState(true);
  const [loadingMataKuliah, setLoadingMataKuliah] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKurikulum = async () => {
      try {
        setLoadingKurikulum(true);
        setError(null);
        const response = await dashboardService.getKurikulumByProgramStudi(programStudiId);

        if (response.success && response.data.length > 0) {
          setKurikulumList(response.data);
          // Auto-select first kurikulum
          const firstId = response.data[0].id;
          setSelectedKurikulumId(firstId);
          fetchMataKuliah(firstId);
        } else {
          setError(response.message || 'Tidak ada data kurikulum');
        }
      } catch (err) {
        console.error('Error fetching kurikulum:', err);
        setError('Gagal memuat data kurikulum');
      } finally {
        setLoadingKurikulum(false);
      }
    };

    if (programStudiId) {
      fetchKurikulum();
    }
  }, [programStudiId]);

  const fetchMataKuliah = async (kurikulumId: string) => {
    try {
      setLoadingMataKuliah(true);
      const response = await dashboardService.getMataKuliahByKurikulum(kurikulumId);

      if (response.success) {
        setMataKuliahData(response.data);
      } else {
        setMataKuliahData([]);
      }
    } catch (err) {
      console.error('Error fetching mata kuliah:', err);
      setMataKuliahData([]);
    } finally {
      setLoadingMataKuliah(false);
    }
  };

  const handleKurikulumChange = (kurikulumId: string) => {
    setSelectedKurikulumId(kurikulumId);
    fetchMataKuliah(kurikulumId);
  };

  const selectedKurikulum = kurikulumList.find(k => k.id === selectedKurikulumId);

  if (loadingKurikulum) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  if (kurikulumList.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h4 className="font-bold text-gray-800 mb-2">Belum Ada Data Kurikulum</h4>
        <p className="text-gray-600 text-sm">Data kurikulum untuk program studi ini belum tersedia</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kurikulum Selector */}
      <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Pilih Kurikulum:
        </label>
        <select
          value={selectedKurikulumId}
          onChange={(e) => handleKurikulumChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium text-base"
        >
          {kurikulumList.map((kurikulum) => (
            <option key={kurikulum.id} value={kurikulum.id}>
              {kurikulum.nama} - {kurikulum.semester.nama} ({kurikulum.sks_lulus} SKS)
            </option>
          ))}
        </select>

        {/* Selected Kurikulum Info */}
        {selectedKurikulum && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                {selectedKurikulum.jenjang.nama}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                {selectedKurikulum.semester.nama}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-700 mb-1">Total SKS Lulus</div>
                <div className="text-2xl font-bold text-blue-800">{selectedKurikulum.sks_lulus}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xs text-green-700 mb-1">SKS Wajib</div>
                <div className="text-2xl font-bold text-green-800">{selectedKurikulum.sks_wajib}</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <div className="text-xs text-amber-700 mb-1">SKS Pilihan</div>
                <div className="text-2xl font-bold text-amber-800">{selectedKurikulum.sks_pilihan}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-xs text-purple-700 mb-1">Jumlah Semester</div>
                <div className="text-2xl font-bold text-purple-800">{selectedKurikulum.jumlah_semester_normal}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mata Kuliah Per Semester */}
      {loadingMataKuliah ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : mataKuliahData.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-gray-600">Belum ada data mata kuliah untuk kurikulum ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mataKuliahData.map((semester) => (
            <div key={semester.semester_ke} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
              {/* Semester Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h3 className="text-lg font-bold">Semester {semester.semester_ke}</h3>
                    <p className="text-xs text-indigo-100 mt-0.5">
                      {semester.jumlah_matkul} MK • {semester.total_sks} SKS
                    </p>
                  </div>
                  <div className="flex gap-3 text-right">
                    <div>
                      <div className="text-[10px] text-indigo-100">Wajib</div>
                      <div className="text-sm font-bold">{semester.total_sks_wajib}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-indigo-100">Pilihan</div>
                      <div className="text-sm font-bold">{semester.total_sks_pilihan}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mata Kuliah Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">No</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Kode</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Nama Mata Kuliah</th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-700 uppercase tracking-wider">SKS</th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {semester.mata_kuliah.map((matkul, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5 text-xs text-gray-600 font-medium">{index + 1}</td>
                        <td className="px-3 py-2.5">
                          <code className="text-[10px] bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded font-mono font-semibold">
                            {matkul.kode}
                          </code>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="text-xs font-semibold text-gray-900">{matkul.nama}</div>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
                            {matkul.sks}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            matkul.is_wajib
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-green-100 text-green-800 border border-green-200'
                          }`}>
                            {matkul.status_wajib}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
