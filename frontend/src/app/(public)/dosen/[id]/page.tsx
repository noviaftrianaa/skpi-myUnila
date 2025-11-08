"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail, FiUser, FiBookOpen, FiAward,
  FiFileText, FiTrendingUp, FiBook, FiBarChart2,
  FiChevronDown, FiChevronUp, FiSearch
} from "react-icons/fi";
import { HiAcademicCap } from "react-icons/hi";
import { MdSchool, MdWork, MdScience } from "react-icons/md";
import { dosenService, type DosenProfile } from "@/lib/services/dosenService";

type TabType = 'overview' | 'pengajaran' | 'penelitian' | 'publikasi';

// Helper function to generate smart pagination
const generatePaginationRange = (currentPage: number, totalPages: number, maxVisible: number = 7) => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  // Always show first page
  pages.push(1);

  let startPage = Math.max(2, currentPage - halfVisible);
  let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

  // Adjust if we're near the start
  if (currentPage <= halfVisible + 1) {
    endPage = Math.min(totalPages - 1, maxVisible - 1);
  }

  // Adjust if we're near the end
  if (currentPage >= totalPages - halfVisible) {
    startPage = Math.max(2, totalPages - maxVisible + 2);
  }

  // Add ellipsis after first page if needed
  if (startPage > 2) {
    pages.push('...');
  }

  // Add middle pages
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Add ellipsis before last page if needed
  if (endPage < totalPages - 1) {
    pages.push('...');
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
};

export default function DosenProfilePage() {
  const params = useParams();
  const router = useRouter();
  const dosenId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [publikasiExpanded, setPublikasiExpanded] = useState<string[]>(['jurnal']);
  const [pengajaranPage, setPengajaranPage] = useState(1);
  const [penelitianPage, setPenelitianPage] = useState(1);
  const [dosen, setDosen] = useState<DosenProfile | null>(null);
  const [bidangKeahlian, setBidangKeahlian] = useState<Array<{
    id_sdm: string;
    nama_dosen: string;
    nidn: string;
    id_kel_bidang: string;
    kode_bidang: string;
    nama_bidang: string;
    urutan: string;
    last_sync: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDosenProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dosenService.getProfile(dosenId);

        if (response.success && response.data) {
          setDosen(response.data);

          // Fetch bidang keahlian from dashboard-service
          try {
            const bidangResponse = await fetch(`http://localhost:9800/dashboard-service/public/api/v1/dosen/bidang-ilmu/${response.data.id_sdm}`);

            if (bidangResponse.ok) {
              const bidangData = await bidangResponse.json();

              if (bidangData.success && bidangData.data) {
                setBidangKeahlian(bidangData.data);
              }
            }
          } catch (bidangErr) {
            // Don't set error (bidang keahlian is optional)
          }
        } else {
          setError(response.message || 'Data dosen tidak ditemukan');
        }
      } catch (err: any) {
        console.error('Error fetching dosen profile:', err);
        setError(err?.response?.data?.message || 'Gagal memuat profil dosen');
      } finally {
        setLoading(false);
      }
    };

    if (dosenId) {
      fetchDosenProfile();
    }
  }, [dosenId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat profil dosen...</p>
        </div>
      </div>
    );
  }

  if (error || !dosen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error || 'Profil dosen tidak ditemukan'}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Use stats from API
  const totalPenelitian = dosen.statistics.total_penelitian;
  const totalPengabdian = dosen.statistics.total_pengabdian;
  const totalPublikasi = dosen.statistics.total_publikasi;
  const totalMataKuliah = dosen.statistics.total_mata_kuliah;

  // Tabs configuration
  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: FiBarChart2 },
    { id: 'pengajaran' as TabType, label: 'Pengajaran', icon: FiBook, badge: totalMataKuliah },
    { id: 'penelitian' as TabType, label: 'Penelitian & Pengabdian', icon: MdScience, badge: totalPenelitian + totalPengabdian },
    { id: 'publikasi' as TabType, label: 'Publikasi', icon: FiFileText, badge: totalPublikasi },
  ];

  // Toggle publikasi accordion
  const togglePublikasi = (type: string) => {
    setPublikasiExpanded(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Pagination for pengajaran
  const paginatedPengajaran = dosen.riwayat_pengajaran.slice(
    (pengajaranPage - 1) * itemsPerPage,
    pengajaranPage * itemsPerPage
  );
  const totalPengajaranPages = Math.ceil(dosen.riwayat_pengajaran.length / itemsPerPage);

  // Pagination for penelitian
  const paginatedPenelitian = dosen.penelitian_pengabdian.slice(
    (penelitianPage - 1) * itemsPerPage,
    penelitianPage * itemsPerPage
  );
  const totalPenelitianPages = Math.ceil(dosen.penelitian_pengabdian.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
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

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              {dosen.nama}
            </h1>

            {/* 3 Kolom: Avatar, Info Dasar, Homebase */}
            <div className="grid md:grid-cols-12 gap-4">
              {/* Kolom 1: Avatar - 2 cols (~17%) */}
              <div className="md:col-span-2 flex items-center justify-center md:justify-start">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 inline-block">
                  <div className="w-40 h-52 rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={`http://localhost:9800/sister-service/dosen/photo/${dosen.id_sdm}`}
                    alt={dosen.nama}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to SVG avatar if photo fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                          <svg class="w-32 h-32 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      `;
                    }}
                  />
                </div>
                </div>
              </div>

              {/* Kolom 2: Info Dasar (NIDN, NIP, Email) - 5 cols (~42%) */}
              <div className="md:col-span-5 space-y-3">
                {dosen.nidn && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2.5 rounded-lg shrink-0">
                        <FiUser className="text-lg text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-white/70 mb-0.5">NIDN</div>
                        <div className="font-bold text-white text-base">{dosen.nidn}</div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-lg shrink-0">
                      <FiUser className="text-lg text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-white/70 mb-0.5">NIP</div>
                      <div className="font-bold text-white text-base">{dosen.nip}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-lg shrink-0">
                      <FiMail className="text-lg text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-white/70 mb-0.5">Email</div>
                      <a href={`mailto:${dosen.email}`} className="font-bold text-white text-sm hover:underline truncate block">
                        {dosen.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom 3: Homebase - 5 cols (~42%) */}
              <div className="md:col-span-5 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/20">
                  <MdSchool className="w-5 h-5 text-white" />
                  <p className="text-xs text-white/90 uppercase tracking-wider font-semibold">Homebase</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-white/70 mb-1">Fakultas</p>
                    <p className="font-semibold text-white text-sm leading-tight">{dosen.homebase.fakultas}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/70 mb-1">Jurusan</p>
                    <p className="font-medium text-white text-sm leading-tight">{dosen.homebase.jurusan}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/70 mb-1">Program Studi</p>
                    <p className="font-medium text-white text-sm leading-tight">{dosen.homebase.prodi}</p>
                    <p className="text-xs text-white/60 mt-0.5">({dosen.homebase.jenjang})</p>
                  </div>
                </div>
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                          <MdScience className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <div className="text-2xl font-bold">{totalPenelitian}</div>
                          <div className="text-sm opacity-90 font-medium">Penelitian</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                          <FiAward className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <div className="text-2xl font-bold">{totalPengabdian}</div>
                          <div className="text-sm opacity-90 font-medium">Pengabdian</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                          <FiFileText className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <div className="text-2xl font-bold">{totalPublikasi}</div>
                          <div className="text-sm opacity-90 font-medium">Publikasi</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                          <FiBook className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <div className="text-2xl font-bold">{totalMataKuliah}</div>
                          <div className="text-sm opacity-90 font-medium">Mata Kuliah</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bidang Keahlian */}
                  {bidangKeahlian.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-teal-100 p-3 rounded-lg">
                          <FiBookOpen className="w-6 h-6 text-teal-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Bidang Keahlian</h2>
                      </div>
                      <div className="grid gap-4">
                        {bidangKeahlian.map((bidang, index) => {
                          // Parse nama_bidang untuk memisahkan kode dan hierarki
                          const namaBidang = bidang.nama_bidang || '';
                          // Hilangkan kode di awal (format: [kode] text)
                          const cleanName = namaBidang.replace(/^\[\d+\]\s*/, '');
                          // Pisahkan hierarki berdasarkan ' -- ' atau ' - '
                          const hierarchy = cleanName.split(/\s+--\s+|\s+-\s+/).filter(Boolean);

                          return (
                            <div key={index} className="group p-5 bg-gradient-to-br from-teal-50 to-cyan-50/30 rounded-xl border border-teal-200/50 hover:border-teal-300 hover:shadow-md transition-all duration-200">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg group-hover:shadow-xl transition-shadow">
                                  {bidang.urutan}
                                </div>
                                <div className="flex-1 space-y-3">
                                  {/* Main expertise */}
                                  <div className="text-lg font-bold text-gray-800">
                                    {hierarchy[hierarchy.length - 1] || cleanName}
                                  </div>

                                  {/* Breadcrumb tags */}
                                  {hierarchy.length > 1 && (
                                    <div className="flex flex-wrap gap-2">
                                      {hierarchy.slice(0, -1).map((level, idx) => (
                                        <span
                                          key={idx}
                                          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 text-teal-700 border border-teal-200/50 shadow-sm"
                                        >
                                          {level.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Riwayat Pendidikan */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <HiAcademicCap className="w-6 h-6 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">Riwayat Pendidikan</h2>
                    </div>
                    <div className="space-y-4">
                      {dosen.riwayat_pendidikan.map((edu, index) => (
                        <div key={index} className="flex gap-4 items-start p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                          <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-md">
                            {edu.tahun_lulus}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-lg text-gray-900 mb-1">
                              {edu.jenjang}
                              {edu.gelar && <span className="ml-2 text-blue-600">({edu.gelar})</span>}
                            </div>
                            <div className="text-gray-700 font-medium mb-1">{edu.program_studi}</div>
                            {edu.bidang_studi && (
                              <div className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Bidang Studi:</span> {edu.bidang_studi}
                              </div>
                            )}
                            {edu.judul_tesis && (
                              <div className="text-sm text-gray-600 italic mb-2 pl-3 border-l-2 border-blue-300">
                                "{edu.judul_tesis}"
                              </div>
                            )}
                            <div className="text-sm text-gray-500">{edu.universitas}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Riwayat Jabatan Fungsional */}
                  {dosen.riwayat_fungsional.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-purple-100 p-3 rounded-lg">
                          <FiAward className="w-6 h-6 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Riwayat Jabatan Fungsional</h2>
                      </div>
                      <div className="space-y-4">
                        {dosen.riwayat_fungsional.map((item, index) => (
                          <div key={index} className="flex gap-4 items-start p-4 bg-purple-50/50 rounded-lg border border-purple-100">
                            <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-md">
                              {new Date(item.tmt).getFullYear()}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-lg text-gray-900 mb-2">{item.jabatan}</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500">TMT:</span>
                                  <span className="ml-2 font-medium text-gray-700">{new Date(item.tmt).toLocaleDateString('id-ID')}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">No. SK:</span>
                                  <span className="ml-2 font-medium text-gray-700">{item.no_sk || '-'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Riwayat Kepangkatan */}
                  {dosen.riwayat_kepangkatan.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-amber-100 p-3 rounded-lg">
                          <FiTrendingUp className="w-6 h-6 text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Riwayat Kepangkatan</h2>
                      </div>
                      <div className="space-y-4">
                        {dosen.riwayat_kepangkatan.map((item, index) => (
                          <div key={index} className="flex gap-4 items-start p-4 bg-amber-50/50 rounded-lg border border-amber-100">
                            <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-md">
                              {new Date(item.tmt).getFullYear()}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-lg text-gray-900 mb-2">{item.pangkat}</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500">TMT:</span>
                                  <span className="ml-2 font-medium text-gray-700">{new Date(item.tmt).toLocaleDateString('id-ID')}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">No. SK:</span>
                                  <span className="ml-2 font-medium text-gray-700">{item.no_sk || '-'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Riwayat Jabatan Struktural */}
                  {dosen.riwayat_struktural.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-emerald-100 p-3 rounded-lg">
                          <MdWork className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Riwayat Jabatan Struktural</h2>
                      </div>
                      <div className="space-y-4">
                        {dosen.riwayat_struktural.map((item, index) => (
                          <div key={index} className="flex gap-4 items-start p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                            <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-md">
                              {new Date(item.tmt).getFullYear()}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-lg text-gray-900 mb-2">{item.jabatan}</div>
                              {item.deskripsi && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {item.deskripsi}
                                </p>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500">TMT:</span>
                                  <span className="ml-2 font-medium text-gray-700">{new Date(item.tmt).toLocaleDateString('id-ID')}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">No. SK:</span>
                                  <span className="ml-2 font-medium text-gray-700">{item.no_sk || '-'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tugas Tambahan */}
                  {dosen.tugas_tambahan && dosen.tugas_tambahan.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-violet-100 p-3 rounded-lg">
                          <MdWork className="w-6 h-6 text-violet-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Tugas Tambahan</h2>
                      </div>
                      <div className="space-y-3">
                        {dosen.tugas_tambahan.slice(0, 3).map((item, index) => (
                          <div key={index} className="group relative overflow-hidden rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-5 hover:border-violet-300 hover:shadow-lg transition-all duration-200">
                            <div className="flex items-center gap-4">
                              {/* Icon Badge */}
                              <div className="flex-shrink-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                  <MdWork className="w-7 h-7 text-white" />
                                </div>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                                  {item.jabatan}
                                </h3>
                                {item.deskripsi && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    {item.deskripsi}
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                  <div className="flex items-center gap-1.5 text-violet-700">
                                    <span className="inline-block w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
                                    <span className="font-medium">TMT: {new Date(item.tmt).toLocaleDateString('id-ID')}</span>
                                  </div>
                                  {item.no_sk && (
                                    <div className="flex items-center gap-1.5 text-gray-600">
                                      <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                      <span>SK: {item.no_sk}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Year Badge */}
                              <div className="hidden sm:block">
                                <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-violet-200 shadow-sm">
                                  <div className="text-xs text-gray-500 font-medium">Tahun</div>
                                  <div className="text-lg font-bold text-violet-700">
                                    {new Date(item.tmt).getFullYear()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Riwayat Sertifikasi */}
                  {dosen.riwayat_sertifikasi.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-indigo-100 p-3 rounded-lg">
                          <FiAward className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Riwayat Sertifikasi</h2>
                      </div>
                      <div className="space-y-4">
                        {dosen.riwayat_sertifikasi.map((item, index) => (
                          <div key={index} className="flex gap-4 items-start p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                            <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                              {item.tahun}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-lg text-gray-900 mb-1">{item.jenjang_sertifikasi}</div>
                              <div className="text-gray-700 font-medium mb-3">{item.bidang_studi || '-'}</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500">No. Sertifikat:</span>
                                  <span className="ml-2 font-medium text-gray-700">{item.no_sertifikat || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">No. Registrasi:</span>
                                  <span className="ml-2 font-medium text-gray-700">{item.no_registrasi || '-'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PENGAJARAN TAB */}
              {activeTab === 'pengajaran' && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 p-3 rounded-lg">
                        <FiBook className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Riwayat Pengajaran</h2>
                        <p className="text-sm text-gray-600">Total {totalMataKuliah} mata kuliah</p>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tahun Ajaran</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mata Kuliah</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Program Studi</th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">SKS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedPengajaran.map((mk, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mk.tahun_ajaran}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{mk.mata_kuliah}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{mk.program_studi}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                                {mk.sks} SKS
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPengajaranPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-600">
                        Menampilkan {((pengajaranPage - 1) * itemsPerPage) + 1} - {Math.min(pengajaranPage * itemsPerPage, totalMataKuliah)} dari {totalMataKuliah} data
                      </div>
                      <div className="flex gap-2 items-center flex-wrap justify-center">
                        <button
                          onClick={() => setPengajaranPage(p => Math.max(1, p - 1))}
                          disabled={pengajaranPage === 1}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Sebelumnya
                        </button>
                        <div className="flex gap-1">
                          {generatePaginationRange(pengajaranPage, totalPengajaranPages).map((page, idx) => (
                            page === '...' ? (
                              <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-400">...</span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => setPengajaranPage(page as number)}
                                className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  pengajaranPage === page
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            )
                          ))}
                        </div>
                        <button
                          onClick={() => setPengajaranPage(p => Math.min(totalPengajaranPages, p + 1))}
                          disabled={pengajaranPage === totalPengajaranPages}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Selanjutnya
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PENELITIAN TAB */}
              {activeTab === 'penelitian' && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-3 rounded-lg">
                        <MdScience className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Penelitian & Pengabdian</h2>
                        <p className="text-sm text-gray-600">Total {totalPenelitian + totalPengabdian} kegiatan</p>
                      </div>
                    </div>
                  </div>

                  {/* Cards Grid with Pagination */}
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      {paginatedPenelitian.map((item, index) => (
                        <div key={index} className="border-2 border-gray-200 rounded-xl p-5 hover:border-emerald-400 hover:shadow-md transition-all">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                                {item.tahun}
                              </div>
                              <div>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  item.jenis === 'Penelitian'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {item.jenis}
                                </span>
                              </div>
                            </div>
                          </div>
                          <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{item.judul}</h4>
                          <p className="text-sm text-gray-600">{item.skema}</p>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPenelitianPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          Menampilkan {((penelitianPage - 1) * itemsPerPage) + 1} - {Math.min(penelitianPage * itemsPerPage, totalPenelitian + totalPengabdian)} dari {totalPenelitian + totalPengabdian} data
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPenelitianPage(p => Math.max(1, p - 1))}
                            disabled={penelitianPage === 1}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Sebelumnya
                          </button>
                          <div className="flex gap-1">
                            {Array.from({ length: totalPenelitianPages }, (_, i) => i + 1).map(page => (
                              <button
                                key={page}
                                onClick={() => setPenelitianPage(page)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                  penelitianPage === page
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => setPenelitianPage(p => Math.min(totalPenelitianPages, p + 1))}
                            disabled={penelitianPage === totalPenelitianPages}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Selanjutnya
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PUBLIKASI TAB */}
              {activeTab === 'publikasi' && (
                <div className="space-y-4">
                  {/* Jurnal Accordion */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => togglePublikasi('jurnal')}
                      className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FiFileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-gray-800">Publikasi Jurnal</h3>
                          <p className="text-sm text-gray-600">{dosen.publikasi.jurnal.length} publikasi</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                          {dosen.publikasi.jurnal.length}
                        </span>
                        {publikasiExpanded.includes('jurnal') ? (
                          <FiChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    </button>
                    {publikasiExpanded.includes('jurnal') && (
                      <div className="p-6 border-t border-gray-200">
                        <div className="space-y-4">
                          {dosen.publikasi.jurnal.map((pub, index) => (
                            <div key={index} className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 mb-1">{pub.judul}</h4>
                                  <p className="text-sm text-gray-700 mb-2">{pub.nama_jurnal}</p>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                      {pub.quartile}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                      ISSN: {pub.issn}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4 flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                                  {pub.tahun}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* HaKI Accordion */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => togglePublikasi('haki')}
                      className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <FiAward className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-gray-800">HaKI (Hak Kekayaan Intelektual)</h3>
                          <p className="text-sm text-gray-600">{dosen.publikasi.haki.length} HaKI</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-bold">
                          {dosen.publikasi.haki.length}
                        </span>
                        {publikasiExpanded.includes('haki') ? (
                          <FiChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    </button>
                    {publikasiExpanded.includes('haki') && (
                      <div className="p-6 border-t border-gray-200">
                        <div className="space-y-4">
                          {dosen.publikasi.haki.map((haki, index) => (
                            <div key={index} className="p-4 bg-purple-50/50 rounded-lg border border-purple-100">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 mb-1">{haki.judul}</h4>
                                  <p className="text-sm text-gray-700 mb-2">{haki.jenis}</p>
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                    No: {haki.nomor_pendaftaran}
                                  </span>
                                </div>
                                <div className="ml-4 flex-shrink-0 w-16 h-16 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">
                                  {haki.tahun}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Buku Accordion */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => togglePublikasi('buku')}
                      className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg">
                          <FiBook className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-gray-800">Buku</h3>
                          <p className="text-sm text-gray-600">{dosen.publikasi.buku.length} buku</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-amber-600 text-white rounded-full text-sm font-bold">
                          {dosen.publikasi.buku.length}
                        </span>
                        {publikasiExpanded.includes('buku') ? (
                          <FiChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                    </button>
                    {publikasiExpanded.includes('buku') && (
                      <div className="p-6 border-t border-gray-200">
                        <div className="space-y-4">
                          {dosen.publikasi.buku.map((buku, index) => (
                            <div key={index} className="p-4 bg-amber-50/50 rounded-lg border border-amber-100">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 mb-1">{buku.judul}</h4>
                                  <p className="text-sm text-gray-700 mb-2">{buku.penerbit}</p>
                                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                                    ISBN: {buku.isbn}
                                  </span>
                                </div>
                                <div className="ml-4 flex-shrink-0 w-16 h-16 bg-amber-600 text-white rounded-lg flex items-center justify-center font-bold">
                                  {buku.tahun}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
