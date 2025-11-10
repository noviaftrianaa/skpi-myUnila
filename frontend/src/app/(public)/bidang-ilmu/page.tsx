'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { searchBidangIlmu, type BidangIlmuSearchItem } from '@/lib/services/bidangIlmuService';
import { FiSearch, FiUsers, FiBook, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { HiAcademicCap } from 'react-icons/hi2';

export default function BidangIlmuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bidangIlmuList, setBidangIlmuList] = useState<BidangIlmuSearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadBidangIlmu();
  }, [currentPage, searchQuery]);

  const loadBidangIlmu = async () => {
    try {
      setLoading(true);
      const response = await searchBidangIlmu(searchQuery, currentPage, 20);

      if (response.success) {
        setBidangIlmuList(response.data);
        setTotalPages(response.pagination.total_pages);
        setTotal(response.pagination.total);
      }
    } catch (error) {
      console.error('Error loading bidang ilmu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    params.set('page', '1');
    router.push(`/bidang-ilmu?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    params.set('page', page.toString());
    router.push(`/bidang-ilmu?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 border border-white/20">
              <HiAcademicCap className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Bidang Ilmu & Keahlian
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
              Jelajahi berbagai bidang ilmu dan keahlian dosen Universitas Lampung
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari bidang ilmu (contoh: Teknik, Kedokteran, Ekonomi)..."
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold whitespace-nowrap flex items-center justify-center gap-2"
              >
                <FiSearch className="w-5 h-5" />
                <span>Cari</span>
              </button>
            </form>
          </div>

          {/* Results Info */}
          {!loading && (
            <div className="flex items-center justify-between mb-6 px-1">
              <p className="text-gray-600">
                Menampilkan <span className="font-bold text-gray-900">{bidangIlmuList.length}</span> dari{' '}
                <span className="font-bold text-gray-900">{total}</span> bidang ilmu
              </p>
              {searchQuery && (
                <div className="text-sm text-gray-500">
                  Hasil pencarian: "<span className="font-semibold text-gray-700">{searchQuery}</span>"
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          ) : bidangIlmuList.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBook className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Tidak ada bidang ilmu ditemukan</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchQuery ? 'Coba gunakan kata kunci pencarian yang berbeda' : 'Belum ada data bidang ilmu tersedia'}
              </p>
            </div>
          ) : (
            <>
              {/* Bidang Ilmu Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {bidangIlmuList.map((bidang, index) => (
                  <motion.div
                    key={bidang.id_kel_bidang}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Link
                      href={`/bidang-ilmu/${bidang.id_kel_bidang}`}
                      className="group block bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl hover:border-blue-400 transition-all duration-300 h-full"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                            <HiAcademicCap className="w-6 h-6 text-blue-600" />
                          </div>
                          {bidang.kode_kel_bidang && (
                            <span className="text-xs font-mono font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                              {bidang.kode_kel_bidang}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug min-h-[3.5rem]">
                        {bidang.nm_kel_bidang}
                      </h3>

                      {/* Description */}
                      {bidang.ket_kel_bidang && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {bidang.ket_kel_bidang}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 rounded-lg">
                            <FiUsers className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            {bidang.total_dosen} <span className="font-normal text-gray-600">Dosen</span>
                          </span>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      {/* Page Info */}
                      <div className="text-sm text-gray-600">
                        Halaman <span className="font-bold text-gray-900">{currentPage}</span> dari <span className="font-bold text-gray-900">{totalPages}</span>
                      </div>

                      {/* Pagination Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-2.5 rounded-lg border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-all"
                          title="Halaman Sebelumnya"
                        >
                          <FiChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>

                        <div className="hidden sm:flex items-center gap-1.5">
                          {[...Array(totalPages)].map((_, i) => {
                            const page = i + 1;
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`min-w-[2.5rem] px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                                    currentPage === page
                                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                                      : 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <span key={page} className="px-2 text-gray-400 font-semibold">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>

                        {/* Mobile: Current Page Display */}
                        <div className="sm:hidden px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-sm">
                          {currentPage}
                        </div>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-2.5 rounded-lg border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-all"
                          title="Halaman Selanjutnya"
                        >
                          <FiChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
