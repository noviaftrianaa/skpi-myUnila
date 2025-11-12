"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiFileText, FiUsers, FiBarChart2, FiExternalLink, FiCalendar, FiHash, FiAward, FiFlask, FiTag } from "react-icons/fi";
import { HiAcademicCap } from "react-icons/hi";
import { FaMale, FaFemale } from "react-icons/fa";
import { publikasiService, type PublikasiDetail } from "@/lib/services/publikasiService";
import Link from "next/link";

type TabType = 'overview' | 'penulis' | 'mahasiswa';

export default function PublikasiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const publikasiId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [publikasi, setPublikasi] = useState<PublikasiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublikasiDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await publikasiService.getPublikasiDetail(publikasiId);

        if (response.success && response.data) {
          setPublikasi(response.data);
        } else {
          setError(response.message || 'Data publikasi tidak ditemukan');
        }
      } catch (err: any) {
        console.error('Error fetching publikasi detail:', err);
        setError(err?.response?.data?.message || 'Gagal memuat detail publikasi');
      } finally {
        setLoading(false);
      }
    };

    if (publikasiId) {
      fetchPublikasiDetail();
    }
  }, [publikasiId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail publikasi...</p>
        </div>
      </div>
    );
  }

  if (error || !publikasi) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error || 'Detail publikasi tidak ditemukan'}</p>
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
    { id: 'penulis' as TabType, label: 'Penulis', icon: FiUsers, badge: publikasi.statistics.total_penulis },
    { id: 'mahasiswa' as TabType, label: 'Mahasiswa', icon: HiAcademicCap, badge: publikasi.statistics.total_mahasiswa },
  ];

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
                <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Publikasi</p>
                <p className="text-white text-lg font-bold">{publikasi.tahun}</p>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              {publikasi.judul}
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <FiUsers className="w-5 h-5 text-white/80" />
                  <p className="text-white/70 text-sm">Penulis</p>
                </div>
                <p className="text-2xl font-bold text-white">{publikasi.statistics.total_penulis}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <HiAcademicCap className="w-5 h-5 text-white/80" />
                  <p className="text-white/70 text-sm">Mahasiswa</p>
                </div>
                <p className="text-2xl font-bold text-white">{publikasi.statistics.total_mahasiswa}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <FiTag className="w-5 h-5 text-white/80" />
                  <p className="text-white/70 text-sm">Jenis</p>
                </div>
                <p className="text-sm font-bold text-white">{publikasi.jenis_publikasi}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <FiAward className="w-5 h-5 text-white/80" />
                  <p className="text-white/70 text-sm">Kategori</p>
                </div>
                <p className="text-sm font-bold text-white">{publikasi.kategori_capaian}</p>
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
                {/* Informasi Publikasi */}
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FiCalendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Informasi Publikasi</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Terbit</p>
                      <p className="text-base font-semibold text-gray-900">{formatDate(publikasi.tanggal_terbit)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Penerbit</p>
                      <p className="text-base font-semibold text-gray-900">{publikasi.penerbit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Jenis Publikasi</p>
                      <p className="text-base font-semibold text-gray-900">{publikasi.jenis_publikasi}</p>
                    </div>
                    {publikasi.nama_jurnal && (
                      <div>
                        <p className="text-sm text-gray-600">Nama Jurnal</p>
                        <p className="text-base font-semibold text-gray-900">{publikasi.nama_jurnal}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detail Publikasi */}
                <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FiHash className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Detail</h3>
                  </div>
                  <div className="space-y-3">
                    {publikasi.issn && (
                      <div>
                        <p className="text-sm text-gray-600">ISSN</p>
                        <p className="text-base font-semibold text-gray-900">{publikasi.issn}</p>
                      </div>
                    )}
                    {publikasi.volume && (
                      <div>
                        <p className="text-sm text-gray-600">Volume & Nomor</p>
                        <p className="text-base font-semibold text-gray-900">
                          Vol. {publikasi.volume}{publikasi.nomor && `, No. ${publikasi.nomor}`}
                        </p>
                      </div>
                    )}
                    {publikasi.halaman && (
                      <div>
                        <p className="text-sm text-gray-600">Halaman</p>
                        <p className="text-base font-semibold text-gray-900">{publikasi.halaman}</p>
                      </div>
                    )}
                    {publikasi.doi && (
                      <div>
                        <p className="text-sm text-gray-600">DOI</p>
                        <p className="text-base font-semibold text-gray-900">{publikasi.doi}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* URL Publikasi & Laman Jurnal */}
              {(publikasi.url_publikasi || publikasi.laman_jurnal) && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex flex-wrap gap-4">
                    {publikasi.url_publikasi && (
                      <a
                        href={publikasi.url_publikasi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg"
                      >
                        <FiExternalLink className="w-5 h-5" />
                        Lihat Publikasi Online
                      </a>
                    )}
                    {publikasi.laman_jurnal && (
                      <a
                        href={publikasi.laman_jurnal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold shadow-lg"
                      >
                        <FiExternalLink className="w-5 h-5" />
                        Kunjungi Laman Jurnal
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Terkait dengan Penelitian/Pengabdian */}
              {publikasi.litabmas && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiFlask className="w-6 h-6 text-blue-600" />
                    Terkait dengan {publikasi.litabmas.jenis}
                  </h2>

                  <Link
                    href={`/${publikasi.litabmas.jenis.toLowerCase()}/${publikasi.litabmas.id_litabmas}`}
                    className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <FiFlask className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">{publikasi.litabmas.jenis}</p>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {publikasi.litabmas.judul}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </motion.div>
            )}

            {activeTab === 'penulis' && (
            <motion.div
              key="penulis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FiUsers className="w-6 h-6 text-blue-600" />
                    Daftar Penulis
                  </h2>
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                    {publikasi.statistics.total_penulis} Penulis
                  </span>
                </div>

                {publikasi.penulis.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FiUsers className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Belum ada data penulis</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {publikasi.penulis.map((penulis, index) => (
                      <Link
                        key={index}
                        href={`/dosen/${penulis.encrypted_id}`}
                        className="group p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {penulis.jenis_kelamin === 'Laki-laki' ? (
                                <FaMale className="w-6 h-6" />
                              ) : (
                                <FaFemale className="w-6 h-6" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 truncate">
                              {penulis.nama}
                            </h3>
                            <p className="text-sm text-blue-600 font-medium mb-2">{penulis.peran}</p>
                            <div className="space-y-1.5">
                              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                <span className="font-medium">Jabatan:</span>
                                <span className="truncate">{penulis.jabatan_fungsional}</span>
                              </p>
                              {penulis.nidn && (
                                <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                  <span className="font-medium">NIDN:</span>
                                  <span>{penulis.nidn}</span>
                                </p>
                              )}
                              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                <span className="font-medium">Prodi:</span>
                                <span className="truncate">{penulis.prodi} ({penulis.jenjang})</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
            )}

            {activeTab === 'mahasiswa' && (
            <motion.div
              key="mahasiswa"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <HiAcademicCap className="w-6 h-6 text-blue-600" />
                    Daftar Mahasiswa
                  </h2>
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                    {publikasi.statistics.total_mahasiswa} Mahasiswa
                  </span>
                </div>

                {publikasi.mahasiswa.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <HiAcademicCap className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Belum ada data mahasiswa</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {publikasi.mahasiswa.map((mhs) => (
                      <Link
                        key={mhs.id_pd}
                        href={`/mahasiswa/${mhs.encrypted_id}`}
                        className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl flex-shrink-0">
                            {mhs.jenis_kelamin === 'Laki-laki' ? (
                              <FaMale className="w-8 h-8 text-blue-600" />
                            ) : (
                              <FaFemale className="w-8 h-8 text-pink-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                              {mhs.nama}
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
                              <span className="flex items-center gap-1">
                                <span className="font-semibold">NIM:</span> {mhs.nim}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="font-semibold">Peran:</span> {mhs.peran}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <p className="px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                                <span className="truncate">{mhs.prodi} ({mhs.jenjang})</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
