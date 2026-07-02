"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Aplikasi {
  id: number;
  nama: string;
  deskripsi: string;
  icon: string;
  url: string;
  kategori: string;
  gradient: string;
  iconBg: string;
}

export default function AplikasiTerintegrasi() {
  const [selectedKategori, setSelectedKategori] = useState<string>("Semua");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const aplikasiList: Aplikasi[] = [
    // Akademik & Kemahasiswaan
    { id: 1, nama: "Siakadu Reguler", deskripsi: "Sistem Informasi Akademik untuk program reguler", icon: "🎓", url: "#", kategori: "Akademik", gradient: "from-blue-500 to-blue-600", iconBg: "bg-blue-100" },
    { id: 2, nama: "Siakad Profesi Guru", deskripsi: "Sistem akademik khusus program profesi guru", icon: "👨‍🏫", url: "#", kategori: "Akademik", gradient: "from-indigo-500 to-indigo-600", iconBg: "bg-indigo-100" },
    { id: 3, nama: "Siakad Profesi Dokter", deskripsi: "Sistem akademik khusus program profesi dokter", icon: "👨‍⚕️", url: "#", kategori: "Akademik", gradient: "from-teal-500 to-teal-600", iconBg: "bg-teal-100" },
    { id: 4, nama: "E-Learning", deskripsi: "Platform pembelajaran daring dan kelas virtual", icon: "💻", url: "#", kategori: "Akademik", gradient: "from-purple-500 to-purple-600", iconBg: "bg-purple-100" },
    { id: 5, nama: "Kampus Berdampak / MBKM", deskripsi: "Platform MBKM untuk pengembangan kompetensi mahasiswa", icon: "🚀", url: "#", kategori: "Akademik", gradient: "from-orange-500 to-orange-600", iconBg: "bg-orange-100" },
    { id: 6, nama: "E-KKN", deskripsi: "Sistem Kuliah Kerja Nyata online", icon: "🏘️", url: "#", kategori: "Akademik", gradient: "from-emerald-500 to-emerald-600", iconBg: "bg-emerald-100" },
    { id: 7, nama: "Perpustakaan Digital", deskripsi: "Koleksi digital buku dan referensi ilmiah", icon: "📚", url: "#", kategori: "Akademik", gradient: "from-cyan-500 to-cyan-600", iconBg: "bg-cyan-100" },
    { id: 8, nama: "SKPI", deskripsi: "Surat Keterangan Pendamping Ijazah", icon: "📜", url: "/dashboard/skpi/admin/validasi", kategori: "Akademik", gradient: "from-amber-500 to-amber-600", iconBg: "bg-amber-100" },
    { id: 9, nama: "SI Prestasi", deskripsi: "Sistem Informasi Prestasi Mahasiswa", icon: "🏆", url: "#", kategori: "Akademik", gradient: "from-yellow-500 to-yellow-600", iconBg: "bg-yellow-100" },
    { id: 10, nama: "Asesmen Online BK", deskripsi: "Asesmen online bimbingan konseling", icon: "📋", url: "#", kategori: "Akademik", gradient: "from-pink-500 to-pink-600", iconBg: "bg-pink-100" },
    { id: 11, nama: "Tracer Study", deskripsi: "Sistem pelacakan alumni dan analisis kebekerjaan", icon: "🎯", url: "#", kategori: "Akademik", gradient: "from-rose-500 to-rose-600", iconBg: "bg-rose-100" },

    // Manajemen
    { id: 12, nama: "SPMI", deskripsi: "Sistem Penjaminan Mutu Internal", icon: "✅", url: "#", kategori: "Manajemen", gradient: "from-green-500 to-green-600", iconBg: "bg-green-100" },
    { id: 13, nama: "Sistem Administrasi Surat", deskripsi: "Pengelolaan surat menyurat elektronik", icon: "✉️", url: "#", kategori: "Manajemen", gradient: "from-slate-500 to-slate-600", iconBg: "bg-slate-100" },
    { id: 14, nama: "Manajemen Aset", deskripsi: "Sistem pengelolaan aset universitas", icon: "🏛️", url: "#", kategori: "Manajemen", gradient: "from-gray-500 to-gray-600", iconBg: "bg-gray-100" },
    { id: 15, nama: "Dashboard IKU", deskripsi: "Dashboard Indikator Kinerja Utama", icon: "📊", url: "#", kategori: "Manajemen", gradient: "from-blue-600 to-indigo-600", iconBg: "bg-blue-100" },
    { id: 16, nama: "Dashboard Pimpinan", deskripsi: "Dashboard khusus untuk pimpinan universitas", icon: "📈", url: "#", kategori: "Manajemen", gradient: "from-violet-500 to-violet-600", iconBg: "bg-violet-100" },

    // Kepegawaian
    { id: 17, nama: "SIKEP", deskripsi: "Sistem Informasi Kepegawaian", icon: "👥", url: "#", kategori: "Kepegawaian", gradient: "from-teal-500 to-cyan-600", iconBg: "bg-teal-100" },
    { id: 18, nama: "SIRANDU", deskripsi: "Sistem Presensi dan Cuti pegawai", icon: "⏰", url: "#", kategori: "Kepegawaian", gradient: "from-indigo-500 to-purple-600", iconBg: "bg-indigo-100" },

    // Keuangan
    { id: 19, nama: "REMUN", deskripsi: "Sistem Remunerasi Dosen dan Tendik", icon: "💰", url: "#", kategori: "Keuangan", gradient: "from-emerald-500 to-green-600", iconBg: "bg-emerald-100" },
    { id: 20, nama: "SIMPONILA", deskripsi: "Sistem Informasi PNBP Online", icon: "💳", url: "#", kategori: "Keuangan", gradient: "from-blue-500 to-cyan-600", iconBg: "bg-blue-100" },
    { id: 21, nama: "SIKEBAS", deskripsi: "Sistem Keringanan dan Bebas UKT", icon: "🎓", url: "#", kategori: "Keuangan", gradient: "from-amber-500 to-orange-600", iconBg: "bg-amber-100" },

    // Penelitian & Pengabdian
    { id: 22, nama: "SILEMLIT21", deskripsi: "Sistem Layanan Penelitian dan Pengabdian Masyarakat", icon: "🔬", url: "#", kategori: "Penelitian", gradient: "from-purple-500 to-fuchsia-600", iconBg: "bg-purple-100" },

    // Data & Pelaporan
    { id: 23, nama: "Integrator Feeder/PDDIKTI", deskripsi: "Integrasi data ke Pangkalan Data Dikti", icon: "🔗", url: "#", kategori: "Data", gradient: "from-sky-500 to-blue-600", iconBg: "bg-sky-100" },
    { id: 24, nama: "Integrator SISTER", deskripsi: "Integrasi Sistem Informasi Sumber Daya", icon: "🔄", url: "#", kategori: "Data", gradient: "from-cyan-500 to-teal-600", iconBg: "bg-cyan-100" },
    { id: 25, nama: "myUnila Web Service", deskripsi: "Layanan web service untuk integrasi sistem", icon: "🌐", url: "#", kategori: "Data", gradient: "from-indigo-500 to-blue-600", iconBg: "bg-indigo-100" },

    // Layanan Umum
    { id: 26, nama: "Marketlab", deskripsi: "Marketplace Laboratorium", icon: "🧪", url: "#", kategori: "Layanan", gradient: "from-rose-500 to-pink-600", iconBg: "bg-rose-100" },
    { id: 27, nama: "PMB Mandiri Simanila", deskripsi: "Penerimaan Mahasiswa Baru Mandiri", icon: "📝", url: "#", kategori: "Layanan", gradient: "from-green-500 to-emerald-600", iconBg: "bg-green-100" },
    { id: 28, nama: "Helpdesk TIK", deskripsi: "Layanan bantuan teknologi informasi", icon: "🆘", url: "#", kategori: "Layanan", gradient: "from-red-500 to-orange-600", iconBg: "bg-red-100" },
    { id: 29, nama: "Hummas dan Informasi", deskripsi: "Portal informasi dan humas universitas", icon: "📢", url: "#", kategori: "Layanan", gradient: "from-yellow-500 to-amber-600", iconBg: "bg-yellow-100" },
    { id: 30, nama: "Blog Resmi UNILA", deskripsi: "Blog resmi Universitas Lampung", icon: "📰", url: "#", kategori: "Layanan", gradient: "from-slate-500 to-gray-600", iconBg: "bg-slate-100" },
  ];

  const kategoris = ["Semua", ...Array.from(new Set(aplikasiList.map(app => app.kategori))).sort()];

  const filteredAplikasi = selectedKategori === "Semua"
    ? aplikasiList
    : aplikasiList.filter(app => app.kategori === selectedKategori);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 sm:mb-3 pb-1 leading-relaxed px-2">
              Aplikasi Terintegrasi
            </h2>
            <div className="flex items-center justify-center mb-2 sm:mb-3">
              <div className="h-0.5 sm:h-1 w-16 sm:w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-3">
              Akses berbagai sistem dan layanan digital Universitas Lampung dalam satu platform terpadu
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 md:mb-12 px-2">
            {kategoris.map((kategori) => (
              <button
                key={kategori}
                onClick={() => setSelectedKategori(kategori)}
                className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 ${
                  selectedKategori === kategori
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-blue-300"
                }`}
              >
                {kategori}
              </button>
            ))}
          </motion.div>

          {/* Apps Grid - Mobile: Horizontal Scroll with 2 Rows, Desktop: Standard Grid */}
          <div className="lg:hidden" key={`mobile-${selectedKategori}`}>
            <motion.div
              key={`mobile-grid-${selectedKategori}`}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {/* Create groups of 2 items for 2-row layout */}
              {Array.from({ length: Math.ceil(filteredAplikasi.length / 2) }).map((_, groupIndex) => (
                <div key={groupIndex} className="flex flex-col gap-3 snap-start flex-shrink-0">
                  {filteredAplikasi.slice(groupIndex * 2, groupIndex * 2 + 2).map((app) => (
                    <motion.a
                      key={app.id}
                      href={app.url}
                      variants={itemVariants}
                      whileTap={{ scale: 0.98 }}
                      className="group relative bg-white rounded-xl shadow-md active:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 active:border-blue-200 w-[280px]"
                    >
                      {/* Gradient Overlay on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-active:opacity-5 transition-opacity duration-300`}></div>

                      {/* Content */}
                      <div className="relative p-4">
                        {/* Icon */}
                        <div className="mb-3 flex items-center justify-between">
                          <div className={`w-12 h-12 ${app.iconBg} rounded-xl flex items-center justify-center text-2xl shadow-sm group-active:scale-110 transition-transform duration-300`}>
                            {app.icon}
                          </div>
                          <div className="opacity-0 group-active:opacity-100 transition-opacity duration-300">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>

                        {/* Text */}
                        <h3 className="text-base font-bold text-gray-800 mb-1.5 group-active:text-blue-600 transition-colors duration-300">
                          {app.nama}
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-2">
                          {app.deskripsi}
                        </p>

                        {/* Category Badge */}
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r ${app.gradient} text-white`}>
                            {app.kategori}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Accent */}
                      <div className={`h-1 bg-gradient-to-r ${app.gradient} transform scale-x-0 group-active:scale-x-100 transition-transform duration-300 origin-left`}></div>
                    </motion.a>
                  ))}
                </div>
              ))}
            </motion.div>
            {/* Scroll Indicator */}
            <div className="flex justify-center mt-2 gap-1">
              <svg className="w-4 h-4 text-gray-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-xs text-gray-500">Geser untuk melihat lebih banyak</span>
            </div>
          </div>

          {/* Desktop Grid */}
          <motion.div
            key={`desktop-grid-${selectedKategori}`}
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
          >
            {filteredAplikasi.map((app) => (
              <motion.a
                key={app.id}
                href={app.url}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
              >
                {/* Gradient Overlay on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                {/* Content */}
                <div className="relative p-4 sm:p-5 md:p-6">
                  {/* Icon */}
                  <div className="mb-3 sm:mb-4 flex items-center justify-between">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${app.iconBg} rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-2xl md:text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      {app.icon}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Text */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1.5 sm:mb-2 group-hover:text-blue-600 transition-colors duration-300">
                    {app.nama}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-2 sm:mb-3">
                    {app.deskripsi}
                  </p>

                  {/* Category Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-gradient-to-r ${app.gradient} text-white`}>
                      {app.kategori}
                    </span>
                  </div>
                </div>

                {/* Bottom Accent */}
                <div className={`h-1 sm:h-1.5 bg-gradient-to-r ${app.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
              </motion.a>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="mt-8 sm:mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {[
              { label: "Total Aplikasi", value: aplikasiList.length, icon: "🔗", color: "blue" },
              { label: "Kategori", value: kategoris.length - 1, icon: "📁", color: "purple" },
              { label: "Pengguna Aktif", value: "25,000+", icon: "👥", color: "emerald" },
              { label: "Uptime", value: "99.9%", icon: "⚡", color: "amber" },
            ].map((stat, index) => (
              <div key={index} className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-${stat.color}-200 text-center`}>
                <div className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">{stat.icon}</div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-0.5 sm:mb-1">{stat.value}</div>
                <div className="text-[10px] sm:text-xs font-semibold text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Info Box */}
          <motion.div variants={itemVariants} className="mt-6 sm:mt-8 md:mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-100">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="text-2xl sm:text-3xl md:text-4xl">🔐</div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">Single Sign-On (SSO)</h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 sm:mb-4">
                  Akses semua aplikasi dengan satu akun myUnila. Sistem terintegrasi dengan keamanan tingkat tinggi
                  menggunakan protokol OAuth 2.0 dan enkripsi end-to-end untuk melindungi data Anda.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-xs sm:text-sm group"
                >
                  Pelajari lebih lanjut
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
