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
      description: "Perancangan kamus data, repositori data, dan database Satu Data UNILA sebagai fondasi integrasi sistem informasi",
      icon: "📋",
      color: "blue",
      status: "Selesai",
    },
    {
      year: "2022",
      title: "Pengembangan Core System",
      description: "Pembangunan core system, SSO authentication, Web Service API, dan integrator layanan eksternal UNILA",
      icon: "⚙️",
      color: "indigo",
      status: "Selesai",
    },
    {
      year: "2023",
      title: "Implementasi Dashboard OneData",
      description: "Launching dashboard pimpinan versi 1.0 OneData dan pengembangan sistem pendukungnya",
      icon: "📊",
      color: "purple",
      status: "Selesai",
    },
    {
      year: "2024",
      title: "Soft Launching myUnila",
      description: "Peluncuran soft dashboard myUnila dan integrasi SISTER serta Feeder PDDIKTI untuk sinkronisasi data nasional",
      icon: "🎯",
      color: "emerald",
      status: "Selesai",
    },
    {
      year: "2025-2026",
      title: "Super App myUnila v2.0",
      description: "Transformasi ke arsitektur microservice modern dengan API Gateway, service mesh, dan containerization untuk skalabilitas tinggi",
      icon: "✨",
      color: "sky",
      status: "Berlangsung",
    },
    {
      year: "2027",
      title: "Ekspansi & Inovasi",
      description: "Optimalisasi infrastruktur cloud, implementasi AI/ML untuk analytics predictive, dan ekspansi fitur menuju World Class University",
      icon: "🚀",
      color: "violet",
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
            className="mt-16 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-100"
          >
            <div className="flex items-start gap-4">
              <div className="text-5xl">🚀</div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Status Pengembangan Saat Ini</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  myUnila sedang berada pada <span className="font-bold text-indigo-600">tahap pengembangan microservice</span> yang
                  mengintegrasikan sistem layanan UNILA ke dalam satu portal terpadu. Dengan pendekatan <span className="font-semibold">Super App myUnila versi 2.0</span>,
                  kami membangun arsitektur microservice yang scalable, resilient, dan mudah dikembangkan untuk mendukung
                  <span className="font-bold"> lebih dari 70+ sistem informasi</span> yang ada di lingkungan Universitas Lampung.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-white px-4 py-2 rounded-lg border border-indigo-200 text-sm font-semibold text-gray-700">
                    ✅ 70+ Sistem Terintegrasi
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-indigo-200 text-sm font-semibold text-gray-700">
                    🔄 Microservice Architecture
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-indigo-200 text-sm font-semibold text-gray-700">
                    🚀 Continuous Integration
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border border-indigo-200 text-sm font-semibold text-gray-700">
                    📊 API Gateway Ready
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
