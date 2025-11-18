"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiBookOpen, FiCalendar, FiBarChart2 } from "react-icons/fi";
import { HiAcademicCap } from "react-icons/hi";
import { MdSchool } from "react-icons/md";
import { mahasiswaService, type MahasiswaProfile } from "@/lib/services/mahasiswaService";

const SISTER_API_URL = process.env.NEXT_PUBLIC_SISTER_API_URL
  ? `${process.env.NEXT_PUBLIC_SISTER_API_URL}/public/api/v1`
  : 'http://localhost:9800/sister-service/public/api/v1';

type TabType = 'overview' | 'status-semester' | 'mata-kuliah';

export default function MahasiswaProfilePage() {
  const params = useParams();
  const router = useRouter();
  const mahasiswaId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mahasiswa, setMahasiswa] = useState<MahasiswaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMahasiswaProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await mahasiswaService.getProfile(mahasiswaId);

        if (response.success && response.data) {
          setMahasiswa(response.data);
        } else {
          setError(response.message || 'Data mahasiswa tidak ditemukan');
        }
      } catch (err: any) {
        console.error('Error fetching mahasiswa profile:', err);
        setError(err?.response?.data?.message || 'Gagal memuat profil mahasiswa');
      } finally {
        setLoading(false);
      }
    };

    if (mahasiswaId) {
      fetchMahasiswaProfile();
    }
  }, [mahasiswaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat profil mahasiswa...</p>
        </div>
      </div>
    );
  }

  if (error || !mahasiswa) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error || 'Profil mahasiswa tidak ditemukan'}</p>
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

  // Tabs configuration
  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: FiBarChart2 },
    { id: 'status-semester' as TabType, label: 'Status Semester', icon: FiCalendar, badge: mahasiswa.status_semester.length },
    { id: 'mata-kuliah' as TabType, label: 'Mata Kuliah', icon: FiBookOpen, badge: mahasiswa.statistics.total_mata_kuliah },
  ];

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

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              {mahasiswa.nama}
            </h1>

            {/* 3 Kolom: Avatar, Info Dasar, Homebase */}
            <div className="grid md:grid-cols-12 gap-4">
              {/* Kolom 1: Avatar - 2 cols (~17%) */}
              <div className="md:col-span-2 flex items-center justify-center md:justify-start">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 inline-block">
                  <div className="w-40 h-52 rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={`${SISTER_API_URL}/mahasiswa/photo/${mahasiswa.id_pd}`}
                    alt={mahasiswa.nama}
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

              {/* Kolom 2: Info Dasar (NIM, Status, Jenis Kelamin) - 5 cols (~42%) */}
              <div className="md:col-span-5 space-y-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-lg shrink-0">
                      <FiUser className="text-lg text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-white/70 mb-0.5">NIM</div>
                      <div className="font-bold text-white text-base">{mahasiswa.nim}</div>
                    </div>
                  </div>
                </div>
                <div className={`backdrop-blur-sm rounded-xl p-4 border border-white/20 ${
                  mahasiswa.status === 'Aktif'
                    ? 'bg-green-500/20'
                    : mahasiswa.status === 'Lulus'
                    ? 'bg-blue-500/20'
                    : 'bg-red-500/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-lg shrink-0">
                      <HiAcademicCap className="text-lg text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-white/70 mb-0.5">Status</div>
                      <div className="font-bold text-white text-base">{mahasiswa.status}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2.5 rounded-lg shrink-0">
                      <FiUser className="text-lg text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-white/70 mb-0.5">Jenis Kelamin</div>
                      <div className="font-bold text-white text-base">{mahasiswa.jenis_kelamin}</div>
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
                  {mahasiswa.homebase.fakultas && (
                    <div>
                      <p className="text-xs text-white/70 mb-1">Fakultas</p>
                      <p className="font-semibold text-white text-sm leading-tight">{mahasiswa.homebase.fakultas}</p>
                    </div>
                  )}
                  {mahasiswa.homebase.jurusan && (
                    <div>
                      <p className="text-xs text-white/70 mb-1">Jurusan</p>
                      <p className="font-medium text-white text-sm leading-tight">{mahasiswa.homebase.jurusan}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-white/70 mb-1">Program Studi</p>
                    <p className="font-medium text-white text-sm leading-tight">{mahasiswa.homebase.prodi}</p>
                    <p className="text-xs text-white/60 mt-0.5">({mahasiswa.homebase.jenjang})</p>
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
                  {/* Homebase Information */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <HiAcademicCap className="w-6 h-6 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">Informasi Homebase</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      {mahasiswa.homebase.fakultas && (
                        <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                          <p className="text-sm text-gray-600 mb-2">Fakultas</p>
                          <p className="font-semibold text-gray-900 text-lg">{mahasiswa.homebase.fakultas}</p>
                        </div>
                      )}
                      {mahasiswa.homebase.jurusan && (
                        <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                          <p className="text-sm text-gray-600 mb-2">Jurusan</p>
                          <p className="font-semibold text-gray-900 text-lg">{mahasiswa.homebase.jurusan}</p>
                        </div>
                      )}
                      <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                        <p className="text-sm text-gray-600 mb-2">Program Studi</p>
                        <p className="font-semibold text-gray-900 text-lg">{mahasiswa.homebase.prodi}</p>
                      </div>
                      <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                        <p className="text-sm text-gray-600 mb-2">Jenjang</p>
                        <p className="font-semibold text-gray-900 text-lg">{mahasiswa.homebase.jenjang}</p>
                      </div>
                      <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                        <p className="text-sm text-gray-600 mb-2">Semester Masuk</p>
                        <p className="font-semibold text-gray-900 text-lg">{mahasiswa.homebase.semester_masuk}</p>
                      </div>
                      <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                        <p className="text-sm text-gray-600 mb-2">Tanggal Masuk</p>
                        <p className="font-semibold text-gray-900 text-lg">
                          {new Date(mahasiswa.homebase.tanggal_masuk).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                          <FiCalendar className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <div className="text-3xl font-bold">{mahasiswa.statistics.total_semester}</div>
                          <div className="text-sm opacity-90 font-medium">Total Semester</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                          <FiBookOpen className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <div className="text-3xl font-bold">{mahasiswa.statistics.total_mata_kuliah}</div>
                          <div className="text-sm opacity-90 font-medium">Total Mata Kuliah</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-lg">
                          <FiBookOpen className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <div className="text-3xl font-bold">
                            {mahasiswa.status_semester.length > 0 ? mahasiswa.status_semester[0].total_sks : 0}
                          </div>
                          <div className="text-sm opacity-90 font-medium">Total SKS Diambil</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STATUS SEMESTER TAB */}
              {activeTab === 'status-semester' && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <FiCalendar className="w-6 h-6 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">Status Semester</h2>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg px-6 py-3 shadow-lg">
                      <div className="text-xs font-medium opacity-90">Total SKS Keseluruhan</div>
                      <div className="text-2xl font-bold">
                        {mahasiswa.status_semester.length > 0 ? mahasiswa.status_semester[0].total_sks : 0} SKS
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    {mahasiswa.status_semester.map((semester) => {
                      return (
                        <div
                          key={semester.id_smt}
                          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 hover:border-green-300 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900 mb-3">{semester.semester}</h3>
                              <div className="grid sm:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">Status:</span>
                                  <span className="font-semibold text-gray-900">{semester.status}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">SKS Semester:</span>
                                  <span className="font-semibold text-blue-600">{semester.sks_diambil} SKS</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">Total SKS:</span>
                                  <span className="font-semibold text-green-600">{semester.total_sks} SKS</span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg px-4 py-2 font-bold text-lg shadow-md">
                              {semester.id_smt}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MATA KULIAH TAB */}
              {activeTab === 'mata-kuliah' && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <FiBookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Mata Kuliah yang Diambil</h2>
                  </div>

                  {/* Two-column grid layout for semester cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {mahasiswa.mata_kuliah.map((semesterData, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200 hover:border-purple-300 hover:shadow-lg transition-all"
                      >
                        {/* Semester Header */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-200">
                          <h3 className="font-bold text-lg text-gray-900">{semesterData.semester}</h3>
                          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {semesterData.mata_kuliah.length} MK
                          </span>
                        </div>

                        {/* Mata Kuliah List */}
                        <div className="space-y-3">
                          {semesterData.mata_kuliah.map((mk, mkIndex) => (
                            <div
                              key={mkIndex}
                              className="bg-white rounded-lg p-4 border border-purple-100 hover:border-purple-300 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 mb-1">{mk.nama_mk}</p>
                                  <p className="text-sm text-gray-600">{mk.kode_mk}</p>
                                </div>
                                <div className="flex-shrink-0">
                                  <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                                    {mk.sks} SKS
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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
