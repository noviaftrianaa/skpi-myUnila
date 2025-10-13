"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function FiturIntegrasi() {
  const [activeTab, setActiveTab] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const fiturCategories = [
    {
      name: "Akademik",
      icon: "🎓",
      color: "blue",
      systems: [
        "Siakadu - Sistem Akademik Universitas",
        "E-Learning - Platform Pembelajaran Daring",
        "Siakad Profesi Guru - Sistem Profesi Guru",
        "Kampus Berdampak / MBKM",
        "Portal Mahasiswa",
        "Portal Dosen",
        "Repositori Tugas Akhir",
        "E-Journal",
        "Perpustakaan Digital",
      ],
    },
    {
      name: "Manajemen",
      icon: "🏛️",
      color: "indigo",
      systems: [
        "Simanila - Sistem Manajemen Unila",
        "SPMI - Penjaminan Mutu Internal",
        "Surat Menyurat Elektronik",
        "Sistem Arsip Digital",
        "Manajemen Aset",
        "Monitoring Kinerja",
        "Dashboard Eksekutif",
      ],
    },
    {
      name: "SDM & Kepegawaian",
      icon: "👥",
      color: "emerald",
      systems: [
        "SISTER - Sumber Daya Terintegrasi",
        "Kepegawaian Online",
        "Presensi & Absensi",
        "Penilaian Kinerja",
        "Pengembangan Karir",
        "Cuti & Izin Online",
      ],
    },
    {
      name: "Keuangan",
      icon: "💰",
      color: "amber",
      systems: [
        "Sistem Pembayaran UKT",
        "Pengelolaan Anggaran",
        "Pelaporan Keuangan",
        "E-Billing",
        "Rekonsiliasi Bank",
      ],
    },
    {
      name: "Penelitian & Pengabdian",
      icon: "🔬",
      color: "purple",
      systems: [
        "Sistem Proposal Penelitian",
        "Monitoring Penelitian",
        "Publikasi & HAKI",
        "Pengabdian Masyarakat",
        "Jurnal Elektronik",
      ],
    },
    {
      name: "Kemahasiswaan",
      icon: "🎒",
      color: "pink",
      systems: [
        "PKM - Program Kreativitas Mahasiswa",
        "Beasiswa Online",
        "UKM & Organisasi",
        "Tracer Study Alumni",
        "Layanan Konseling",
        "Prestasi Mahasiswa",
      ],
    },
    {
      name: "Layanan Umum",
      icon: "🏥",
      color: "rose",
      systems: [
        "SIMRS - Rumah Sakit",
        "Legalisir Online",
        "Penerimaan Mahasiswa Baru",
        "Portal Stakeholder",
        "Pengaduan & Keluhan",
      ],
    },
    {
      name: "Data & Pelaporan",
      icon: "📊",
      color: "cyan",
      systems: [
        "PDDIKTI Integration",
        "Business Intelligence",
        "Data Warehouse",
        "Statistik & Analitik",
        "Pelaporan Otomatis",
      ],
    },
  ];

  const keunggulan = [
    {
      icon: "🔐",
      title: "Single Sign-On (SSO)",
      description: "Satu akun untuk mengakses semua sistem terintegrasi",
      color: "blue",
    },
    {
      icon: "⚡",
      title: "Real-time Synchronization",
      description: "Data tersinkronisasi secara otomatis antar sistem",
      color: "emerald",
    },
    {
      icon: "🛡️",
      title: "Keamanan Terjamin",
      description: "Enkripsi end-to-end dan protokol keamanan tingkat tinggi",
      color: "purple",
    },
    {
      icon: "📱",
      title: "Multi-Platform",
      description: "Akses dari desktop, tablet, dan smartphone",
      color: "amber",
    },
    {
      icon: "🎯",
      title: "User-Friendly",
      description: "Interface intuitif dan mudah digunakan",
      color: "pink",
    },
    {
      icon: "🔄",
      title: "Auto-Update",
      description: "Sistem selalu up-to-date tanpa downtime",
      color: "indigo",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
      <div className="container mx-auto px-6">
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
              Fitur & Sistem Terintegrasi
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              70+ sistem informasi dalam satu platform terpadu
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg text-center">
              <div className="text-4xl font-bold mb-1">70+</div>
              <div className="text-sm font-semibold opacity-90">Sistem Terintegrasi</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg text-center">
              <div className="text-4xl font-bold mb-1">8</div>
              <div className="text-sm font-semibold opacity-90">Kategori Layanan</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg text-center">
              <div className="text-4xl font-bold mb-1">25K+</div>
              <div className="text-sm font-semibold opacity-90">Pengguna Aktif</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg text-center">
              <div className="text-4xl font-bold mb-1">99.9%</div>
              <div className="text-sm font-semibold opacity-90">Uptime</div>
            </div>
          </motion.div>

          {/* Category Tabs */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-12">
            {/* Tab Headers */}
            <div className="bg-gray-50 border-b border-gray-200 overflow-x-auto">
              <div className="flex">
                {fiturCategories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all ${
                      activeTab === index
                        ? `bg-${category.color}-600 text-white`
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="text-4xl">{fiturCategories[activeTab].icon}</span>
                Sistem {fiturCategories[activeTab].name}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fiturCategories[activeTab].systems.map((system, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-gradient-to-br from-${fiturCategories[activeTab].color}-50 to-${fiturCategories[activeTab].color}-100/50 rounded-xl p-4 border border-${fiturCategories[activeTab].color}-200 hover:shadow-md transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 bg-${fiturCategories[activeTab].color}-600 rounded-full`}></div>
                      <span className="text-sm font-semibold text-gray-800">{system}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Keunggulan */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Keunggulan myUnila</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {keunggulan.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100/50 rounded-xl p-6 border border-${item.color}-200 hover:shadow-lg transition-all`}
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
