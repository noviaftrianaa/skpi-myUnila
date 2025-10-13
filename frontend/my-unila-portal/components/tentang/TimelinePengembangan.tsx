"use client";

import { motion } from "framer-motion";

export default function TimelinePengembangan() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  const timeline = [
    {
      year: "2021",
      title: "Perencanaan & Desain",
      description: "Inisiasi proyek myUnila, analisis kebutuhan, dan perancangan arsitektur sistem terintegrasi",
      icon: "📋",
      color: "blue",
      status: "Selesai",
    },
    {
      year: "2022",
      title: "Pengembangan Fase 1",
      description: "Pembangunan core system, SSO authentication, dan integrasi 20 sistem prioritas",
      icon: "⚙️",
      color: "indigo",
      status: "Selesai",
    },
    {
      year: "2023",
      title: "Pengembangan Fase 2",
      description: "Ekspansi integrasi ke 50+ sistem, implementasi dashboard analytics, dan mobile responsive",
      icon: "🚀",
      color: "purple",
      status: "Selesai",
    },
    {
      year: "2024",
      title: "Pengembangan Fase 3",
      description: "Integrasi 70+ sistem, AI-powered features, advanced analytics, dan performance optimization",
      icon: "🎯",
      color: "emerald",
      status: "Berlangsung",
    },
    {
      year: "2025",
      title: "Penyempurnaan & Scale-Up",
      description: "Fine-tuning sistem, penambahan fitur berbasis feedback, dan persiapan untuk ekspansi nasional",
      icon: "✨",
      color: "amber",
      status: "Direncanakan",
    },
  ];

  return (
    <section className="py-20 bg-white relative">
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
              Timeline Pengembangan
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Perjalanan pengembangan myUnila sejak 2021 hingga saat ini
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-amber-200"></div>

            {/* Timeline Items */}
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  } flex-col md:gap-8`}
                >
                  {/* Content */}
                  <div className={`w-full md:w-5/12 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -5 }}
                      className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100/50 rounded-2xl p-6 border border-${item.color}-200 shadow-lg hover:shadow-xl transition-all`}
                    >
                      <div className={`flex items-center gap-2 mb-3 ${index % 2 === 0 ? "md:justify-end" : "md:justify-start"}`}>
                        <span className={`px-3 py-1 text-xs font-bold bg-${item.color}-600 text-white rounded-full`}>
                          {item.status}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2 justify-center md:justify-start">
                        <span className="text-3xl">{item.icon}</span>
                        <span>{item.title}</span>
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </motion.div>
                  </div>

                  {/* Center Circle */}
                  <div className="hidden md:flex w-2/12 justify-center items-center my-4 md:my-0">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`w-16 h-16 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-white z-10`}
                    >
                      {item.year}
                    </motion.div>
                  </div>

                  {/* Mobile Year Badge */}
                  <div className="md:hidden mb-2">
                    <div className={`inline-block px-4 py-2 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-full text-white font-bold`}>
                      {item.year}
                    </div>
                  </div>

                  {/* Empty Space for Alternating Layout */}
                  <div className="hidden md:block w-5/12"></div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Current Status */}
          <motion.div
            variants={itemVariants}
            className="mt-16 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8 border border-emerald-100"
          >
            <div className="flex items-start gap-4">
              <div className="text-5xl">🎉</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Status Pengembangan Saat Ini</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  myUnila saat ini berada di <span className="font-bold text-emerald-600">Fase 3 Pengembangan (2024)</span> dengan
                  lebih dari <span className="font-bold">70 sistem terintegrasi</span> dan terus berkembang.
                  Tim pengembangan aktif menambahkan fitur-fitur baru dan melakukan optimalisasi performa untuk memberikan
                  pengalaman terbaik bagi pengguna.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-white px-4 py-2 rounded-lg border border-emerald-200 text-sm font-semibold text-gray-700">
                    ✅ 70+ Sistem Aktif
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-emerald-200 text-sm font-semibold text-gray-700">
                    🔄 Continuous Development
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-emerald-200 text-sm font-semibold text-gray-700">
                    📈 Monthly Updates
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
