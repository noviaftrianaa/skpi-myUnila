"use client";

import { motion } from "framer-motion";

export default function CapaianLulusan() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const alumniStats = [
    {
      title: "Waktu Tunggu Kerja",
      data: [
        { label: "< 3 Bulan", value: 68, color: "emerald" },
        { label: "3-6 Bulan", value: 24, color: "blue" },
        { label: "> 6 Bulan", value: 8, color: "amber" },
      ],
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      title: "Kesesuaian Bidang Kerja",
      data: [
        { label: "Sangat Sesuai", value: 72, color: "emerald" },
        { label: "Sesuai", value: 21, color: "blue" },
        { label: "Kurang Sesuai", value: 7, color: "amber" },
      ],
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
        </svg>
      ),
    },
  ];

  const highlights = [
    {
      label: "Range Gaji Lulusan",
      value: "Rp 4-8 Jt",
      subtext: "Per Bulan",
      icon: "💰",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      label: "Tingkat Wirausaha",
      value: "15%",
      subtext: "Alumni",
      icon: "🚀",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      label: "Bekerja di BUMN",
      value: "23%",
      subtext: "Alumni",
      icon: "🏢",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      label: "Melanjutkan S2/S3",
      value: "12%",
      subtext: "Alumni",
      icon: "🎓",
      gradient: "from-orange-500 to-red-600",
    },
  ];

  const topEmployers = [
    { name: "PT Pertamina", logo: "🛢️", count: 245 },
    { name: "PT Telkom Indonesia", logo: "📡", count: 198 },
    { name: "Bank Mandiri", logo: "🏦", count: 176 },
    { name: "Kementerian", logo: "🏛️", count: 312 },
    { name: "Perusahaan Swasta", logo: "🏭", count: 1850 },
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
              Capaian Lulusan
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Data tracer study dan pencapaian alumni Universitas Lampung
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {alumniStats.map((stat, statIndex) => (
              <motion.div
                key={statIndex}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                    {stat.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{stat.title}</h3>
                </div>

                <div className="space-y-5">
                  {stat.data.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                        <span className={`text-lg font-bold text-${item.color}-600`}>{item.value}%</span>
                      </div>
                      <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className={`h-3 rounded-full bg-gradient-to-r ${
                            item.color === "emerald" ? "from-emerald-400 to-emerald-600" :
                            item.color === "blue" ? "from-blue-400 to-blue-600" :
                            "from-amber-400 to-amber-600"
                          }`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Highlights */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {highlights.map((item, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${item.gradient} rounded-2xl shadow-lg p-6 text-white hover:scale-105 transition-transform duration-300`}
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="text-sm font-medium text-white/90 mb-1">{item.label}</div>
                <div className="text-3xl font-bold mb-1">{item.value}</div>
                <div className="text-xs text-white/80">{item.subtext}</div>
              </div>
            ))}
          </motion.div>

          {/* Top Employers */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              Top Employers Alumni
            </h3>
            <div className="grid md:grid-cols-5 gap-4">
              {topEmployers.map((employer, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 text-center hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-4xl mb-3">{employer.logo}</div>
                  <div className="text-sm font-semibold text-gray-800 mb-2 min-h-[40px] flex items-center justify-center">
                    {employer.name}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{employer.count}</div>
                  <div className="text-xs text-gray-500 mt-1">Alumni</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottom Note */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-6 py-3">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-blue-800">
                Data dari Tracer Study Alumni 2020-2024
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
