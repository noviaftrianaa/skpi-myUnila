'use client';

import { useEffect, useState } from 'react';
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
  FaFileAlt
} from 'react-icons/fa';
import { dashboardService } from '@/lib/services/dashboard.service';
import type { ProgramStudiDetail } from '@/lib/types/dashboard.types';

export default function ProgramStudiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [detail, setDetail] = useState<ProgramStudiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getProgramStudiDetail(params.id as string);

        if (response.success) {
          setDetail(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        console.error('Error fetching program studi detail:', err);
        setError('Gagal memuat detail program studi');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchDetail();
    }
  }, [params.id]);

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

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 pt-32 pb-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto"
          >
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.back()}
              className="mb-8 flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Kembali ke Daftar Program Studi</span>
            </motion.button>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-sm font-semibold text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                {detail.jenjang}
              </span>
              <span className={`text-sm font-semibold text-white px-4 py-2 rounded-full ${getAkreditasiColor(detail.akreditasi)} shadow-lg`}>
                Akreditasi {detail.akreditasi}
              </span>
              <span className={`text-sm font-semibold px-4 py-2 rounded-full ${
                detail.status === 'Aktif'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-400 text-white'
              } shadow-lg`}>
                {detail.status}
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {detail.nama}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <FaFileAlt className="text-xl" />
                </div>
                <div>
                  <div className="text-sm text-white/70">Kode Program Studi</div>
                  <div className="font-bold text-lg">{detail.kode}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                  <FaCalendar className="text-xl" />
                </div>
                <div>
                  <div className="text-sm text-white/70">Tanggal Berdiri</div>
                  <div className="font-bold text-lg">
                    {new Date(detail.tanggal_berdiri).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Fakultas & Jurusan */}
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <div className="flex items-center gap-3">
                  <FaBuilding className="text-3xl text-white/80" />
                  <div>
                    <div className="text-sm text-white/70">Fakultas</div>
                    <div className="font-bold text-white text-lg">
                      {detail.organisasi.fakultas.nama || 'Tidak ada data'}
                    </div>
                  </div>
                </div>
              </div>
              {detail.organisasi.jurusan.nama && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-3">
                    <FaBuilding className="text-3xl text-white/80" />
                    <div>
                      <div className="text-sm text-white/70">Jurusan</div>
                      <div className="font-bold text-white text-lg">
                        {detail.organisasi.jurusan.nama}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Organisasi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaBuilding className="text-blue-600" />
                Struktur Organisasi
              </h2>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-600 pl-4">
                  <div className="text-sm text-gray-500">Fakultas</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {detail.organisasi.fakultas.nama || 'Tidak ada data'}
                  </div>
                </div>
                {detail.organisasi.jurusan.nama && (
                  <div className="border-l-4 border-purple-600 pl-4">
                    <div className="text-sm text-gray-500">Jurusan</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {detail.organisasi.jurusan.nama}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* SDM - Dosen */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaChalkboardTeacher className="text-green-600" />
                Sumber Daya Manusia
              </h2>

              {/* Dosen Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                  <div className="text-sm text-green-700 mb-1">Dosen Tetap</div>
                  <div className="text-3xl font-bold text-green-800">{detail.sdm.dosen.tetap}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="text-sm text-blue-700 mb-1">Dosen Tidak Tetap</div>
                  <div className="text-3xl font-bold text-blue-800">{detail.sdm.dosen.tidak_tetap}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                  <div className="text-sm text-purple-700 mb-1">Dosen PNS</div>
                  <div className="text-3xl font-bold text-purple-800">{detail.sdm.dosen.pns}</div>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4">
                  <div className="text-sm text-pink-700 mb-1">Dosen Non-PNS</div>
                  <div className="text-3xl font-bold text-pink-800">{detail.sdm.dosen.non_pns}</div>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Total Dosen</div>
                    <div className="text-2xl font-bold text-gray-900">{detail.sdm.dosen.total}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Tenaga Kependidikan</div>
                    <div className="text-2xl font-bold text-gray-900">{detail.sdm.tendik}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Mahasiswa */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <FaUserGraduate className="text-2xl" />
                </div>
                <div>
                  <div className="text-sm text-blue-100">Total Mahasiswa</div>
                  <div className="text-3xl font-bold">{detail.mahasiswa.total}</div>
                </div>
              </div>
              <div className="text-sm text-blue-100">
                Periode: {detail.periode}
              </div>
            </motion.div>

            {/* Rasio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <FaChartLine className="text-2xl" />
                </div>
                <div>
                  <div className="text-sm text-purple-100">Rasio Dosen:Mahasiswa</div>
                  <div className="text-3xl font-bold">{detail.rasio_dosen_mahasiswa}</div>
                </div>
              </div>
              <div className="text-sm text-purple-100">
                Ideal: 1:20 - 1:30
              </div>
            </motion.div>

            {/* Akreditasi Detail */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaAward className="text-yellow-600" />
                Akreditasi
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nilai</span>
                  <span className={`font-bold text-white px-3 py-1 rounded-lg ${getAkreditasiColor(detail.akreditasi)}`}>
                    {detail.akreditasi}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* SK Penyelenggara */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-3">SK Penyelenggara</h2>
              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 font-mono">
                {detail.sk_penyelenggara.trim()}
              </div>
            </motion.div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
