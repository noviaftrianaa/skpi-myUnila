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
    {
      id: 1,
      nama: "Tracer Study",
      deskripsi: "Sistem pelacakan alumni dan analisis kebekerjaan lulusan",
      icon: "🎓",
      url: "#",
      kategori: "Alumni",
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      id: 2,
      nama: "Kampus Berdampak",
      deskripsi: "Platform MBKM untuk pengembangan kompetensi mahasiswa",
      icon: "🚀",
      url: "#",
      kategori: "Akademik",
      gradient: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-100",
    },
    {
      id: 3,
      nama: "SPMI",
      deskripsi: "Sistem Penjaminan Mutu Internal institusi",
      icon: "✅",
      url: "#",
      kategori: "Manajemen",
      gradient: "from-emerald-500 to-emerald-600",
      iconBg: "bg-emerald-100",
    },
    {
      id: 4,
      nama: "Siakadu",
      deskripsi: "Sistem Informasi Akademik Universitas terpadu",
      icon: "📚",
      url: "#",
      kategori: "Akademik",
      gradient: "from-indigo-500 to-indigo-600",
      iconBg: "bg-indigo-100",
    },
    {
      id: 5,
      nama: "Siakad Profesi Guru",
      deskripsi: "Sistem akademik khusus program profesi guru",
      icon: "👨‍🏫",
      url: "#",
      kategori: "Akademik",
      gradient: "from-pink-500 to-pink-600",
      iconBg: "bg-pink-100",
    },
    {
      id: 6,
      nama: "Simanila",
      deskripsi: "Sistem Manajemen Universitas Lampung terintegrasi",
      icon: "🏛️",
      url: "#",
      kategori: "Manajemen",
      gradient: "from-cyan-500 to-cyan-600",
      iconBg: "bg-cyan-100",
    },
    {
      id: 7,
      nama: "E-Learning",
      deskripsi: "Platform pembelajaran daring dan kelas virtual",
      icon: "💻",
      url: "#",
      kategori: "Akademik",
      gradient: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-100",
    },
    {
      id: 8,
      nama: "SISTER",
      deskripsi: "Sistem Informasi Sumber Daya Terintegrasi",
      icon: "👥",
      url: "#",
      kategori: "SDM",
      gradient: "from-teal-500 to-teal-600",
      iconBg: "bg-teal-100",
    },
    {
      id: 9,
      nama: "PDDIKTI",
      deskripsi: "Pangkalan Data Pendidikan Tinggi Kemendikbud",
      icon: "📊",
      url: "#",
      kategori: "Data",
      gradient: "from-violet-500 to-violet-600",
      iconBg: "bg-violet-100",
    },
    {
      id: 10,
      nama: "Repositori",
      deskripsi: "Repository karya ilmiah dan tugas akhir mahasiswa",
      icon: "📖",
      url: "#",
      kategori: "Penelitian",
      gradient: "from-rose-500 to-rose-600",
      iconBg: "bg-rose-100",
    },
    {
      id: 11,
      nama: "E-Journal",
      deskripsi: "Jurnal elektronik dan publikasi ilmiah",
      icon: "📄",
      url: "#",
      kategori: "Penelitian",
      gradient: "from-amber-500 to-amber-600",
      iconBg: "bg-amber-100",
    },
    {
      id: 12,
      nama: "Perpustakaan Digital",
      deskripsi: "Koleksi digital buku dan referensi ilmiah",
      icon: "📚",
      url: "#",
      kategori: "Perpustakaan",
      gradient: "from-lime-500 to-lime-600",
      iconBg: "bg-lime-100",
    },
    {
      id: 13,
      nama: "SIMRS",
      deskripsi: "Sistem Informasi Manajemen Rumah Sakit",
      icon: "🏥",
      url: "#",
      kategori: "Layanan",
      gradient: "from-red-500 to-red-600",
      iconBg: "bg-red-100",
    },
    {
      id: 14,
      nama: "PKM",
      deskripsi: "Portal Program Kreativitas Mahasiswa",
      icon: "💡",
      url: "#",
      kategori: "Kemahasiswaan",
      gradient: "from-yellow-500 to-yellow-600",
      iconBg: "bg-yellow-100",
    },
    {
      id: 15,
      nama: "Beasiswa",
      deskripsi: "Sistem pendaftaran dan monitoring beasiswa",
      icon: "💰",
      url: "#",
      kategori: "Kemahasiswaan",
      gradient: "from-green-500 to-green-600",
      iconBg: "bg-green-100",
    },
    {
      id: 16,
      nama: "Portal Dosen",
      deskripsi: "Dashboard dan layanan khusus dosen",
      icon: "🎯",
      url: "#",
      kategori: "SDM",
      gradient: "from-fuchsia-500 to-fuchsia-600",
      iconBg: "bg-fuchsia-100",
    },
    {
      id: 17,
      nama: "Portal Mahasiswa",
      deskripsi: "Dashboard dan layanan khusus mahasiswa",
      icon: "🎒",
      url: "#",
      kategori: "Kemahasiswaan",
      gradient: "from-sky-500 to-sky-600",
      iconBg: "bg-sky-100",
    },
    {
      id: 18,
      nama: "Surat Menyurat",
      deskripsi: "Sistem pengelolaan surat elektronik",
      icon: "✉️",
      url: "#",
      kategori: "Manajemen",
      gradient: "from-slate-500 to-slate-600",
      iconBg: "bg-slate-100",
    },
  ];

  const kategoris = ["Semua", ...Array.from(new Set(aplikasiList.map(app => app.kategori)))];

  const filteredAplikasi = selectedKategori === "Semua"
    ? aplikasiList
    : aplikasiList.filter(app => app.kategori === selectedKategori);

  return (
    <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 pb-1 leading-relaxed">
              Aplikasi Terintegrasi
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Akses berbagai sistem dan layanan digital Universitas Lampung dalam satu platform terpadu
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mb-12">
            {kategoris.map((kategori) => (
              <button
                key={kategori}
                onClick={() => setSelectedKategori(kategori)}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                  selectedKategori === kategori
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:border-blue-300"
                }`}
              >
                {kategori}
              </button>
            ))}
          </motion.div>

          {/* Apps Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredAplikasi.map((app) => (
              <motion.a
                key={app.id}
                href={app.url}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
              >
                {/* Gradient Overlay on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                {/* Content */}
                <div className="relative p-6">
                  {/* Icon */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`w-16 h-16 ${app.iconBg} rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      {app.icon}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Text */}
                  <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                    {app.nama}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {app.deskripsi}
                  </p>

                  {/* Category Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${app.gradient} text-white`}>
                      {app.kategori}
                    </span>
                  </div>
                </div>

                {/* Bottom Accent */}
                <div className={`h-1.5 bg-gradient-to-r ${app.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
              </motion.a>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Aplikasi", value: aplikasiList.length, icon: "🔗", color: "blue" },
              { label: "Kategori", value: kategoris.length - 1, icon: "📁", color: "purple" },
              { label: "Pengguna Aktif", value: "25,000+", icon: "👥", color: "emerald" },
              { label: "Uptime", value: "99.9%", icon: "⚡", color: "amber" },
            ].map((stat, index) => (
              <div key={index} className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100/50 rounded-xl p-6 border border-${stat.color}-200 text-center`}>
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-xs font-semibold text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Info Box */}
          <motion.div variants={itemVariants} className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🔐</div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 mb-2 text-lg">Single Sign-On (SSO)</h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Akses semua aplikasi dengan satu akun myUnila. Sistem terintegrasi dengan keamanan tingkat tinggi
                  menggunakan protokol OAuth 2.0 dan enkripsi end-to-end untuk melindungi data Anda.
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm group"
                >
                  Pelajari lebih lanjut
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
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
