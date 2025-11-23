"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiFileText, FiUsers, FiBarChart2, FiAward, FiExternalLink, FiCalendar, FiDollarSign, FiTag } from "react-icons/fi";
import { HiAcademicCap } from "react-icons/hi";
import { FaMale, FaFemale } from "react-icons/fa";
import { sisterPenelitianService, type PenelitianDetail } from "@/lib/services/public/penelitianService";

type TabType = 'overview' | 'anggota-tim' | 'publikasi' | 'luaran-lainnya' | 'mahasiswa';

export default function PenelitianDetailPage() {
  const params = useParams();
  const router = useRouter();
  const penelitianId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [penelitian, setPenelitian] = useState<PenelitianDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPenelitianDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await sisterPenelitianService.getPenelitianDetail(penelitianId);

        if (response.success && response.data) {
          setPenelitian(response.data);
        } else {
          setError(response.message || 'Data penelitian tidak ditemukan');
        }
      } catch (err: any) {
        console.error('Error fetching penelitian detail:', err);
        setError(err?.response?.data?.message || 'Gagal memuat detail penelitian');
      } finally {
        setLoading(false);
      }
    };

    if (penelitianId) {
      fetchPenelitianDetail();
    }
  }, [penelitianId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail penelitian...</p>
        </div>
      </div>
    );
  }

  if (error || !penelitian) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error || 'Detail penelitian tidak ditemukan'}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: FiBarChart2 },
    { id: 'anggota-tim' as TabType, label: 'Anggota Tim', icon: FiUsers, badge: penelitian.statistics.total_anggota_tim },
    { id: 'publikasi' as TabType, label: 'Publikasi', icon: FiFileText, badge: penelitian.statistics.total_publikasi },
    { id: 'luaran-lainnya' as TabType, label: 'Luaran Lainnya', icon: FiAward, badge: penelitian.statistics.total_luaran_lainnya },
    { id: 'mahasiswa' as TabType, label: 'Mahasiswa', icon: HiAcademicCap, badge: penelitian.statistics.total_mahasiswa },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 pt-24 pb-16 overflow-hidden">
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
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Kembali</span>
            </button>

            {/* Year Badge */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/20">
                <FiFileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Penelitian</p>
                <p className="text-white text-lg font-bold">{penelitian.tahun}</p>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              {penelitian.judul}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <FiUsers className="w-5 h-5 text-white/80" />
                  <p className="text-white/70 text-sm">Anggota Tim</p>
                </div>
                <p className="text-2xl font-bold text-white">{penelitian.statistics.total_anggota_tim}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <FiFileText className="w-5 h-5 text-white/80" />
                  <p className="text-white/70 text-sm">Publikasi</p>
                </div>
                <p className="text-2xl font-bold text-white">{penelitian.statistics.total_publikasi}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <FiAward className="w-5 h-5 text-white/80" />
                  <p className="text-white/70 text-sm">Luaran</p>
                </div>
                <p className="text-2xl font-bold text-white">{penelitian.statistics.total_luaran_lainnya}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <HiAcademicCap className="w-5 h-5 text-white/80" />
                  <p className="text-white/70 text-sm">Mahasiswa</p>
                </div>
                <p className="text-2xl font-bold text-white">{penelitian.statistics.total_mahasiswa}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-6 py-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap
                      ${isActive
                        ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-bold
                        ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}
                      `}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FiCalendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Periode Penelitian</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Tanggal Mulai</p>
                        <p className="text-base font-semibold text-gray-900">{formatDate(penelitian.tanggal_mulai)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tanggal Selesai</p>
                        <p className="text-base font-semibold text-gray-900">{formatDate(penelitian.tanggal_selesai)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Lama Kegiatan</p>
                        <p className="text-base font-semibold text-gray-900">{penelitian.lama_kegiatan} bulan</p>
                      </div>
                      {penelitian.lokasi_kegiatan && (
                        <div>
                          <p className="text-sm text-gray-600">Lokasi Kegiatan</p>
                          <p className="text-base font-semibold text-gray-900">{penelitian.lokasi_kegiatan}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <FiDollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Pendanaan</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Total Biaya</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(penelitian.biaya)}</p>
                      </div>
                      <div className="border-t border-green-200 pt-3 space-y-2">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Rincian Sumber Dana</p>
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Dana DIKTI</span>
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(penelitian.dana_dikti || 0)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Dana PT</span>
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(penelitian.dana_pt || 0)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Dana Institusi Lain</span>
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(penelitian.dana_institusi_lain || 0)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-green-200 pt-3">
                        <p className="text-sm text-gray-600">Skim Penelitian</p>
                        <p className="text-base font-semibold text-gray-900">{penelitian.skim}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FiTag className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Bidang Ilmu</h3>
                  </div>
                  <p className="text-base text-gray-700">{penelitian.bidang_ilmu}</p>
                </div>

                {penelitian.abstrak && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <FiFileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Abstrak</h3>
                    </div>
                    <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">{penelitian.abstrak}</p>
                  </div>
                )}

                {penelitian.kata_kunci && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-pink-100 p-2 rounded-lg">
                        <FiTag className="w-5 h-5 text-pink-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Kata Kunci</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {penelitian.kata_kunci.split(',').map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-gradient-to-r from-pink-100 to-purple-100 text-gray-700 rounded-full text-sm font-medium border border-pink-200"
                        >
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {penelitian.url_penelitian && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <a
                      href={penelitian.url_penelitian}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FiExternalLink className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                            Link Penelitian
                          </h3>
                          <p className="text-sm text-gray-500">Klik untuk membuka</p>
                        </div>
                      </div>
                      <FiExternalLink className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </a>
                  </div>
                )}
              </motion.div>
            )}

            {/* Anggota Tim Tab */}
            {activeTab === 'anggota-tim' && (
              <motion.div
                key="anggota-tim"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {penelitian.anggota_tim.length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-12 text-center">
                    <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada data anggota tim</p>
                  </div>
                ) : (
                  penelitian.anggota_tim.map((anggota, index) => (
                    <motion.div
                      key={anggota.id_sdm}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-white rounded-2xl p-6 border-2 shadow-sm hover:shadow-lg transition-all ${
                        anggota.peran === 'Ketua'
                          ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-white'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${
                          anggota.peran === 'Ketua' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {anggota.jenis_kelamin === 'Laki-laki' ? (
                            <FaMale className={`w-8 h-8 ${
                              anggota.peran === 'Ketua' ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          ) : (
                            <FaFemale className={`w-8 h-8 ${
                              anggota.peran === 'Ketua' ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{anggota.nama}</h3>
                            {anggota.peran === 'Ketua' && (
                              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                                KETUA
                              </span>
                            )}
                          </div>
                          <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div>
                              <p className="text-gray-600">NIDN</p>
                              <p className="font-semibold text-gray-900">{anggota.nidn || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">NIP</p>
                              <p className="font-semibold text-gray-900">{anggota.nip || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Jabatan Fungsional</p>
                              <p className="font-semibold text-gray-900">{anggota.jabatan_fungsional}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Program Studi</p>
                              <p className="font-semibold text-gray-900">{anggota.prodi}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Jenjang</p>
                              <p className="font-semibold text-gray-900">{anggota.jenjang}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Peran</p>
                              <p className="font-semibold text-gray-900">{anggota.peran}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {/* Publikasi Tab */}
            {activeTab === 'publikasi' && (
              <motion.div
                key="publikasi"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {penelitian.publikasi.length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-12 text-center">
                    <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada publikasi</p>
                  </div>
                ) : (
                  penelitian.publikasi.map((pub, index) => (
                    <motion.div
                      key={pub.id_publikasi}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-3 rounded-xl">
                          <FiFileText className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-3">{pub.judul}</h3>
                          <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div>
                              <p className="text-gray-600">Jenis Publikasi</p>
                              <p className="font-semibold text-gray-900">{pub.jenis_publikasi}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Tahun Terbit</p>
                              <p className="font-semibold text-gray-900">{pub.tahun}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Penerbit</p>
                              <p className="font-semibold text-gray-900">{pub.penerbit || '-'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">ISSN</p>
                              <p className="font-semibold text-gray-900">{pub.issn || '-'}</p>
                            </div>
                            {pub.volume && (
                              <div>
                                <p className="text-gray-600">Volume</p>
                                <p className="font-semibold text-gray-900">{pub.volume}</p>
                              </div>
                            )}
                            {pub.nomor && (
                              <div>
                                <p className="text-gray-600">Nomor</p>
                                <p className="font-semibold text-gray-900">{pub.nomor}</p>
                              </div>
                            )}
                            {pub.halaman && (
                              <div>
                                <p className="text-gray-600">Halaman</p>
                                <p className="font-semibold text-gray-900">{pub.halaman}</p>
                              </div>
                            )}
                          </div>
                          {pub.url_publikasi && (
                            <a
                              href={pub.url_publikasi}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                            >
                              <FiExternalLink className="w-4 h-4" />
                              Lihat Publikasi
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {/* Luaran Lainnya Tab */}
            {activeTab === 'luaran-lainnya' && (
              <motion.div
                key="luaran-lainnya"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {penelitian.luaran_lainnya.length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-12 text-center">
                    <FiAward className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada luaran lainnya</p>
                  </div>
                ) : (
                  penelitian.luaran_lainnya.map((luaran, index) => (
                    <motion.div
                      key={luaran.id_luaran_lainnya}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-purple-100 p-3 rounded-xl">
                          <FiAward className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-bold text-gray-800">{luaran.judul}</h3>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                              {luaran.tahun}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-gray-600">Jenis Luaran</p>
                              <p className="text-base font-semibold text-gray-900">{luaran.jenis_luaran}</p>
                            </div>
                            {luaran.keterangan && (
                              <div>
                                <p className="text-sm text-gray-600">Keterangan</p>
                                <p className="text-base text-gray-700">{luaran.keterangan}</p>
                              </div>
                            )}
                          </div>
                          {luaran.tautan && (
                            <a
                              href={luaran.tautan}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 mt-4 text-purple-600 hover:text-purple-700 font-semibold text-sm"
                            >
                              <FiExternalLink className="w-4 h-4" />
                              Lihat Luaran
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {/* Mahasiswa Tab */}
            {activeTab === 'mahasiswa' && (
              <motion.div
                key="mahasiswa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {penelitian.mahasiswa.length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-12 text-center">
                    <HiAcademicCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada mahasiswa yang terlibat</p>
                  </div>
                ) : (
                  penelitian.mahasiswa.map((mhs, index) => (
                    <motion.div
                      key={mhs.id_pd}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-indigo-100 p-3 rounded-xl">
                          {mhs.jenis_kelamin === 'Laki-laki' ? (
                            <FaMale className="w-8 h-8 text-indigo-600" />
                          ) : (
                            <FaFemale className="w-8 h-8 text-indigo-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-3">{mhs.nama}</h3>
                          <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div>
                              <p className="text-gray-600">NIM</p>
                              <p className="font-semibold text-gray-900">{mhs.nim}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Program Studi</p>
                              <p className="font-semibold text-gray-900">{mhs.prodi}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Jenjang</p>
                              <p className="font-semibold text-gray-900">{mhs.jenjang}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Peran</p>
                              <p className="font-semibold text-gray-900">{mhs.peran}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
