'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getBidangIlmuDetail, type BidangIlmuDetail, type DosenItem } from '@/lib/services/public/bidangIlmuService';
import {
  FiUsers,
  FiBook,
  FiAward,
  FiExternalLink,
} from 'react-icons/fi';
import { HiAcademicCap } from 'react-icons/hi2';
import { FaMale, FaFemale } from 'react-icons/fa';

export default function BidangIlmuDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [bidangIlmu, setBidangIlmu] = useState<BidangIlmuDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBidangIlmuDetail();
  }, [id]);

  const loadBidangIlmuDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBidangIlmuDetail(id);

      if (response.success && response.data) {
        setBidangIlmu(response.data);
      } else {
        setError('Bidang ilmu tidak ditemukan');
      }
    } catch (error) {
      console.error('Error loading bidang ilmu detail:', error);
      setError('Gagal memuat detail bidang ilmu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section - Loading */}
        <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl">
            <div className="h-6 bg-white/20 rounded w-32 mb-6 animate-pulse"></div>
            <div className="h-12 bg-white/20 rounded w-2/3 mb-4 animate-pulse"></div>
            <div className="h-6 bg-white/20 rounded w-1/2 animate-pulse"></div>
          </div>
        </section>

        {/* Content - Loading */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded mb-4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !bidangIlmu) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center max-w-md">
          <HiAcademicCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Bidang Ilmu Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/bidang-ilmu')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            Kembali ke Daftar Bidang Ilmu
          </button>
        </div>
      </div>
    );
  }

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
            className="max-w-6xl mx-auto"
          >
            {/* Back Button */}
            <button
              onClick={() => router.push('/bidang-ilmu')}
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Kembali ke Daftar Bidang Ilmu</span>
            </button>

            {/* Main Info */}
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <HiAcademicCap className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                {bidangIlmu.kode_kel_bidang && (
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 mb-3 border border-white/20">
                    <FiBook className="w-4 h-4 text-white" />
                    <span className="font-mono text-white font-semibold">{bidangIlmu.kode_kel_bidang}</span>
                  </div>
                )}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
                  {bidangIlmu.nm_kel_bidang}
                </h1>
                {bidangIlmu.induk_bidang && (
                  <p className="text-blue-100 text-lg">Bagian dari: <span className="font-semibold">{bidangIlmu.induk_bidang}</span></p>
                )}
              </div>
            </div>

            {/* Description */}
            {bidangIlmu.ket_kel_bidang && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mb-6 border border-white/20">
                <p className="text-white/90 leading-relaxed">{bidangIlmu.ket_kel_bidang}</p>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <FiUsers className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">Total Dosen</p>
                    <p className="text-3xl font-bold text-white">{bidangIlmu.statistics.total_dosen}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dosen List Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 rounded-xl">
                  <FiUsers className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Daftar Dosen</h2>
                  <p className="text-sm text-gray-600 mt-0.5">Dosen yang memiliki keahlian di bidang ini</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-sm">
                <FiUsers className="w-4 h-4" />
                <span>{bidangIlmu.statistics.total_dosen} Dosen</span>
              </div>
            </div>

            {/* Dosen Grid */}
            {bidangIlmu.dosen.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum ada dosen</h3>
                <p className="text-gray-500">Belum ada dosen yang terdaftar di bidang ilmu ini</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bidangIlmu.dosen.map((dosen) => (
                  <motion.div
                    key={dosen.id_sdm}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={`/dosen/${dosen.encrypted_id}`}
                      className="group block bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-400 transition-all duration-300"
                    >
                      {/* Dosen Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                          {dosen.jenis_kelamin === 'Laki-laki' ? (
                            <FaMale className="w-6 h-6 text-blue-600" />
                          ) : (
                            <FaFemale className="w-6 h-6 text-pink-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-2 leading-snug">
                            {dosen.nama}
                          </h3>
                          <p className="text-xs text-gray-500 font-mono">
                            NIDN: {dosen.nidn}
                          </p>
                        </div>
                        <FiExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                      </div>

                      {/* Dosen Details */}
                      <div className="space-y-2.5 pt-3 border-t border-gray-100">
                        <div className="flex items-start gap-2">
                          <FiAward className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 line-clamp-2 leading-snug">{dosen.jabatan_fungsional}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <HiAcademicCap className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 line-clamp-2 leading-snug">{dosen.prodi}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiBook className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{dosen.jenjang}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
