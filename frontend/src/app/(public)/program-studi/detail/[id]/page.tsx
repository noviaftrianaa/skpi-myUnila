'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaCalendar,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaAward,
  FaBuilding,
  FaUsers,
  FaChartLine,
  FaFileAlt,
  FaInfoCircle,
  FaBook,
  FaLaptop,
  FaTrophy,
  FaHandshake,
} from 'react-icons/fa';
import { dashboardService } from '@/lib/services/dashboardService';
import type { ProgramStudiDetail } from '@/lib/types/dashboardTypes';
import {
  DosenTable,
  MahasiswaTrendChart,
  KurikulumList,
  TracerStudySection,
} from '../_components';

type TabType = 'profile' | 'dosen' | 'mahasiswa' | 'kurikulum' | 'alumni';

export default function ProgramStudiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [detail, setDetail] = useState<ProgramStudiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 2;

    const fetchDetail = async () => {
      // Get the ID from params
      const id = params.id as string;

      // Validate ID exists and is not empty
      if (!id || id === '' || id === 'undefined' || id === 'null') {
        console.error('Invalid ID:', id);
        if (isMounted) {
          setError('ID program studi tidak valid');
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        const response = await dashboardService.getProgramStudiDetail(id);

        if (!isMounted) return;

        if (response.success && response.data) {
          setDetail(response.data);
          setError(null);
        } else {
          // Retry if no data and we haven't exceeded max retries
          if (!response.data && retryCount < maxRetries) {
            retryCount++;
            setTimeout(() => fetchDetail(), 500);
            return;
          }

          setDetail(null);
          setError(response.message || 'Data tidak ditemukan');
        }
      } catch (err: any) {
        console.error('[DetailPage] Error fetching program studi detail:', err);

        if (!isMounted) return;

        // Retry on network error if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(() => fetchDetail(), 500);
          return;
        }

        setDetail(null);
        setError(err?.response?.data?.message || err?.message || 'Gagal memuat detail program studi');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail program studi...</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error || 'Program studi tidak ditemukan'}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Get akreditasi color
  const getAkreditasiColor = (akreditasi: string) => {
    const colors: Record<string, string> = {
      'Unggul': 'bg-green-500',
      'Baik Sekali': 'bg-blue-500',
      'Baik': 'bg-yellow-500',
      'A': 'bg-purple-500',
      'B': 'bg-pink-500',
      'C': 'bg-orange-500',
      'Tidak Terakreditasi': 'bg-red-500',
      'Belum Akreditasi': 'bg-gray-500',
    };
    return colors[akreditasi] || 'bg-gray-500';
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profil & Info', icon: FaInfoCircle },
    { id: 'dosen' as TabType, label: 'Daftar Dosen', icon: FaChalkboardTeacher },
    { id: 'mahasiswa' as TabType, label: 'Statistik Mahasiswa', icon: FaUserGraduate },
    { id: 'kurikulum' as TabType, label: 'Kurikulum', icon: FaBook },
    { id: 'alumni' as TabType, label: 'Capaian Alumni', icon: FaTrophy },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 pt-24 pb-32 overflow-hidden">
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
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.back()}
              className="mb-6 flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Kembali ke Daftar Program Studi</span>
            </motion.button>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-xs sm:text-sm font-semibold text-white bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/30">
                {detail.jenjang}
              </span>
              <span className={`text-xs sm:text-sm font-semibold text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${getAkreditasiColor(detail.akreditasi)} shadow-lg`}>
                Akreditasi {detail.akreditasi}
              </span>
              <span className={`text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${
                detail.status === 'Aktif'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-400 text-white'
              } shadow-lg`}>
                {detail.status}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              {detail.nama}
            </h1>

            {/* Meta Info Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2.5 rounded-lg shrink-0">
                    <FaFileAlt className="text-lg text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-white/70 mb-0.5">Kode Program Studi</div>
                    <div className="font-bold text-white text-base truncate">{detail.kode}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2.5 rounded-lg shrink-0">
                    <FaCalendar className="text-lg text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-white/70 mb-0.5">Tanggal Berdiri</div>
                    <div className="font-bold text-white text-base truncate">
                      {new Date(detail.tanggal_berdiri).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fakultas & Jurusan */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2.5 rounded-lg shrink-0">
                    <FaBuilding className="text-xl text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-white/70 mb-0.5">Fakultas</div>
                    <div className="font-bold text-white text-sm sm:text-base line-clamp-2">
                      {detail.organisasi.fakultas.nama || 'Tidak ada data'}
                    </div>
                  </div>
                </div>
              </div>
              {detail.organisasi.jurusan.nama && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-lg shrink-0">
                      <FaBuilding className="text-xl text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-white/70 mb-0.5">Jurusan</div>
                      <div className="font-bold text-white text-sm sm:text-base line-clamp-2">
                        {detail.organisasi.jurusan.nama}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Navigation Tabs - Improved Responsive Design */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden md:flex justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-6 lg:px-8 py-4 font-semibold text-sm whitespace-nowrap border-b-3 transition-all duration-300 relative ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
                  }`}
                >
                  <Icon className={`text-lg transition-transform duration-300 ${
                    activeTab === tab.id ? 'scale-110' : ''
                  }`} />
                  <span className="hidden lg:inline">{tab.label}</span>
                  <span className="lg:hidden">{tab.label.split(' ')[0]}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Navigation - Horizontal Scroll */}
          <div className="md:hidden overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 py-2 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex flex-col items-center justify-center gap-1 px-4 py-2.5 rounded-lg font-medium text-xs whitespace-nowrap transition-all duration-300 min-w-[70px] ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className={`text-base ${
                      activeTab === tab.id ? 'animate-bounce' : ''
                    }`} />
                    <span className="text-[10px] font-semibold leading-tight text-center">
                      {tab.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto py-6">

          {/* Profile & Info Umum Section */}
          {activeTab === 'profile' && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FaInfoCircle className="text-blue-600 text-xl" />
                </div>
                Profil & Informasi Umum
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-600 pl-4">
                    <div className="text-sm text-gray-500 mb-1">Fakultas</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {detail.organisasi.fakultas.nama || 'Tidak ada data'}
                    </div>
                  </div>
                  {detail.organisasi.jurusan.nama && (
                    <div className="border-l-4 border-purple-600 pl-4">
                      <div className="text-sm text-gray-500 mb-1">Jurusan</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {detail.organisasi.jurusan.nama}
                      </div>
                    </div>
                  )}
                  <div className="border-l-4 border-green-600 pl-4">
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <div className="text-lg font-semibold text-gray-900">{detail.status}</div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="border-l-4 border-yellow-600 pl-4">
                    <div className="text-sm text-gray-500 mb-1">Akreditasi</div>
                    <div className="text-lg font-semibold text-gray-900">{detail.akreditasi}</div>
                  </div>
                  <div className="border-l-4 border-indigo-600 pl-4">
                    <div className="text-sm text-gray-500 mb-1">SK Penyelenggara</div>
                    <div className="text-sm font-mono text-gray-700 bg-gray-50 rounded p-2">
                      {detail.sk_penyelenggara.trim()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visi, Misi, Tujuan */}
              {(detail.profil.visi || detail.profil.misi || detail.profil.tujuan || detail.profil.capaian_belajar) && (
                <div className="mt-6 space-y-4">
                  {/* Visi */}
                  {detail.profil.visi && (
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl shrink-0">🎯</div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-bold text-gray-800 mb-3 text-lg">Visi</h4>
                          <div
                            className="prose prose-sm max-w-none text-gray-700 [&>p]:mb-2 [&>ul]:ml-4 [&>ol]:ml-4"
                            dangerouslySetInnerHTML={{ __html: detail.profil.visi }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Misi */}
                  {detail.profil.misi && (
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl shrink-0">🚀</div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-bold text-gray-800 mb-3 text-lg">Misi</h4>
                          <div
                            className="prose prose-sm max-w-none text-gray-700 [&>p]:mb-2 [&>ul]:ml-4 [&>ol]:ml-4"
                            dangerouslySetInnerHTML={{ __html: detail.profil.misi }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tujuan */}
                  {detail.profil.tujuan && (
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl shrink-0">📌</div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-bold text-gray-800 mb-3 text-lg">Tujuan</h4>
                          <div
                            className="prose prose-sm max-w-none text-gray-700 [&>p]:mb-2 [&>ul]:ml-4 [&>ol]:ml-4"
                            dangerouslySetInnerHTML={{ __html: detail.profil.tujuan }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Capaian Belajar / Sasaran */}
                  {detail.profil.capaian_belajar && (
                    <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl shrink-0">✨</div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-bold text-gray-800 mb-3 text-lg">Sasaran & Strategi Pencapaian</h4>
                          <div
                            className="prose prose-sm max-w-none text-gray-700 [&>p]:mb-2 [&>ul]:ml-4 [&>ol]:ml-4"
                            dangerouslySetInnerHTML={{ __html: detail.profil.capaian_belajar }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Placeholder jika tidak ada data profil */}
              {!detail.profil.visi && !detail.profil.misi && !detail.profil.tujuan && !detail.profil.capaian_belajar && (
                <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">📋</div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Deskripsi Program Studi</h4>
                      <p className="text-sm text-gray-600 italic">
                        Informasi deskripsi, visi, dan misi program studi akan segera tersedia.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </section>
          )}

          {/* Daftar Dosen Section */}
          {activeTab === 'dosen' && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FaChalkboardTeacher className="text-green-600 text-xl" />
                </div>
                Daftar Dosen
              </h2>

              {/* Statistik Dosen */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                  <div className="text-xs text-green-700 mb-1">Dosen Tetap</div>
                  <div className="text-2xl font-bold text-green-800">{detail.sdm.dosen.tetap}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="text-xs text-blue-700 mb-1">Tidak Tetap</div>
                  <div className="text-2xl font-bold text-blue-800">{detail.sdm.dosen.tidak_tetap}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                  <div className="text-xs text-purple-700 mb-1">Dosen PNS</div>
                  <div className="text-2xl font-bold text-purple-800">{detail.sdm.dosen.pns}</div>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4">
                  <div className="text-xs text-pink-700 mb-1">Non-PNS</div>
                  <div className="text-2xl font-bold text-pink-800">{detail.sdm.dosen.non_pns}</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">Total Dosen</span>
                  <span className="text-3xl font-bold text-indigo-800">{detail.sdm.dosen.total}</span>
                </div>
              </div>

              {/* Dosen Table */}
              <DosenTable programStudiId={detail.id} />
            </motion.div>
          </section>
          )}

          {/* Statistik Mahasiswa Section */}
          {activeTab === 'mahasiswa' && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FaUserGraduate className="text-blue-600 text-xl" />
                </div>
                Statistik Mahasiswa
              </h2>

              {/* Current Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="text-sm text-blue-100 mb-2">Total Mahasiswa Aktif</div>
                  <div className="text-4xl font-bold">{detail.mahasiswa.total}</div>
                  <div className="text-xs text-blue-100 mt-2">Periode: {detail.periode}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="text-sm text-purple-100 mb-2">Rasio Dosen:Mahasiswa</div>
                  <div className="text-4xl font-bold">{detail.rasio_dosen_mahasiswa}</div>
                  <div className="text-xs text-purple-100 mt-2">Ideal: 1:20 - 1:30</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
                  <div className="text-sm text-indigo-100 mb-2">Total Dosen</div>
                  <div className="text-4xl font-bold">{detail.sdm.dosen.total}</div>
                  <div className="text-xs text-indigo-100 mt-2">Pengajar Aktif</div>
                </div>
              </div>

              {/* Mahasiswa Trend Chart */}
              <MahasiswaTrendChart programStudiId={detail.id} />
            </motion.div>
          </section>
          )}

          {/* Kurikulum Section */}
          {activeTab === 'kurikulum' && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <FaBook className="text-amber-600 text-xl" />
                </div>
                Kurikulum
              </h2>
              <KurikulumList programStudiId={detail.id} />
            </motion.div>
          </section>
          )}

          {/* Capaian Alumni Section */}
          {activeTab === 'alumni' && (
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <FaTrophy className="text-yellow-600 text-xl" />
                  </div>
                  Capaian Alumni (Tracer Study)
                </h2>
                <p className="text-gray-600 mt-2 ml-14">
                  Statistik dan informasi alumni berdasarkan hasil tracer study
                </p>
              </div>
              <TracerStudySection programStudiId={detail.id} />
            </motion.div>
          </section>
          )}

        </div>
      </div>
    </>
  );
}
