'use client';

import { useEffect, useState, useCallback } from 'react';
import { FaSearch, FaUserGraduate, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { dashboardService } from '@/lib/services/public/dashboardService';
import type { MahasiswaItem } from '@/lib/types/dashboardTypes';

interface MahasiswaTableProps {
  programStudiId: string;
}

export default function MahasiswaTable({ programStudiId }: MahasiswaTableProps) {
  const [mahasiswaData, setMahasiswaData] = useState<MahasiswaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchMahasiswa = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardService.getMahasiswaByProgramStudi(programStudiId, {
        search: debouncedSearch || undefined,
        page: currentPage,
        per_page: 10,
      });

      if (response.success) {
        setMahasiswaData(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Gagal memuat data mahasiswa');
      }
    } catch (err) {
      console.error('Error fetching mahasiswa:', err);
      setError('Gagal memuat data mahasiswa');
    } finally {
      setLoading(false);
    }
  }, [programStudiId, debouncedSearch, currentPage]);

  useEffect(() => {
    if (programStudiId) {
      fetchMahasiswa();
    }
  }, [fetchMahasiswa, programStudiId]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.last_page) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const totalPages = pagination.last_page;
    const current = currentPage;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (current >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'aktif':
        return 'bg-green-100 text-green-800';
      case 'cuti':
        return 'bg-yellow-100 text-yellow-800';
      case 'non-aktif':
      case 'tidak aktif':
        return 'bg-red-100 text-red-800';
      case 'lulus':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-8">
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FaUserGraduate className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Daftar Mahasiswa</h3>
            <p className="text-sm text-gray-500">
              Total: {pagination.total.toLocaleString()} mahasiswa aktif
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari nama atau NPM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-sm hover:border-gray-300"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600">Memuat data mahasiswa...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-center">
            <div>
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        ) : mahasiswaData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-center">
            <div>
              <div className="text-5xl mb-3">📋</div>
              <h4 className="font-semibold text-gray-800 mb-1">Tidak Ada Data</h4>
              <p className="text-sm text-gray-500">
                {search ? 'Tidak ditemukan mahasiswa dengan kriteria pencarian' : 'Belum ada data mahasiswa'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      NPM
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Angkatan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mahasiswaData.map((mhs, index) => (
                    <tr key={`${mhs.npm}-${index}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {pagination.from + index}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{mhs.npm}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{mhs.nama}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{mhs.angkatan}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mhs.status)}`}>
                          {mhs.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {mahasiswaData.map((mhs, index) => (
                <div key={`${mhs.npm}-${index}`} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{mhs.nama}</p>
                      <p className="text-sm text-gray-500">{mhs.npm}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(mhs.status)}`}>
                      {mhs.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Angkatan: {mhs.angkatan}</p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-gray-600">
                    Menampilkan {pagination.from} - {pagination.to} dari {pagination.total} data
                  </p>

                  <div className="flex items-center gap-1">
                    {/* Previous */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>

                    {/* Page Numbers */}
                    {getPageNumbers().map((page, idx) => (
                      <button
                        key={idx}
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        disabled={page === '...'}
                        className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : page === '...'
                            ? 'cursor-default text-gray-400'
                            : 'hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Next */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.last_page}
                      className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
