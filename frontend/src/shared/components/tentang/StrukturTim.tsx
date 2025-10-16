"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardBody } from "@heroui/react";

export default function StrukturTim() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const pimpinan = [
    {
      nama: "Prof. Dr. Ir. Lusmeilia Afriani, D.E.A.IPM, ASEAN Eng.",
      jabatan: "Rektor Universitas Lampung",
      foto: "/assets/images/tim/ibu-rektor.jpg",
      gradient: "from-blue-500 to-blue-600",
      urutan: 1,
    },
    {
      nama: "Prof. Dr. Ayi Ahadiat, S.E., M.B.A.",
      jabatan: "Wakil Rektor Bidang Perencanaan, Kerja Sama, dan Sistem Informasi",
      foto: "/assets/images/tim/wakil-rektor-4.jpg",
      gradient: "from-indigo-500 to-indigo-600",
      urutan: 2,
    },
    {
      nama: "Dr. Eng. Mardiana, S.T., M.T.",
      jabatan: "Kepala UPA TIK",
      foto: "/assets/images/tim/kepala-upa.jpg",
      gradient: "from-purple-500 to-purple-600",
      urutan: 3,
    },
  ];

  const penanggungJawab = [
    {
      nama: "Mahendra Pratama, S.T., M.Eng.",
      jabatan: "Pj. Tim Manajemen dan Integrasi Sistem Teknologi Informasi",
      foto: "/assets/images/tim/pj-tim-dev.jpg",
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      nama: "Muhammad Ikhsan, S.Kom., M.Cs.",
      jabatan: "Pj. Tim Sumber Daya Sistem Informasi",
      foto: "/assets/images/tim/ikhsan.jpg",
      gradient: "from-teal-500 to-teal-600",
    },
  ];

  const timPengembang = {
    fullstack: [
      {
        nama: "Mizar Zulmi Ramadhan, S.Kom.",
        role: "Fullstack Developer",
        foto: "/assets/images/tim/mizar.jpg",
        skills: ["PHP", "Vue.js", "MySQL"],
      },
      {
        nama: "Kholiq Farizal, S.Kom.",
        role: "Fullstack Developer",
        foto: "/assets/images/tim/kholik.jpg",
        skills: ["Next.js", "Node.js", "API"],
      },
      {
        nama: "Atika Istiqomah, S.Kom., M.T.",
        role: "Fullstack Developer",
        foto: "/assets/images/tim/atika.jpg",
        skills: ["React", "Laravel", "PostgreSQL"],
      },
    ],
    qa: [
      {
        nama: "Zuliana Nur Fadlillah, S.Kom.",
        role: "Quality Assurance",
        foto: "/assets/images/tim/zul.jpg",
        skills: ["Testing", "QA Process", "Bug Tracking"],
      },
      {
        nama: "Aprily Ayu Anbar, S.T.",
        role: "Quality Assurance",
        foto: "/assets/images/tim/aprily.jpg",
        skills: ["Manual Testing", "API Testing", "Documentation"],
      },
    ],
    systemAnalyst: [
      {
        nama: "Rika Ningtias Azhari, S.Kom., M.Kom.",
        role: "System Analyst",
        foto: "/assets/images/tim/rika.jpg",
        skills: ["System Design", "Requirements Analysis", "Documentation"],
      },
    ],
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
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
              Struktur Organisasi & Tim
            </h2>
            <div className="flex items-center justify-center mb-3">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Tim profesional yang berdedikasi dalam pengembangan myUnila
            </p>
          </motion.div>

          {/* Organizational Chart dengan Struktur Hierarki Vertikal */}
          <motion.div variants={itemVariants} className="mb-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Struktur Organisasi</h3>

            <div className="relative max-w-3xl mx-auto">
              {/* Container untuk cards */}
              <div className="space-y-6 relative">
                {pimpinan.map((person, index) => {
                  const borderColors = {
                    'from-blue-500 to-blue-600': 'border-blue-200',
                    'from-indigo-500 to-indigo-600': 'border-indigo-200',
                    'from-purple-500 to-purple-600': 'border-purple-200',
                    'from-emerald-500 to-emerald-600': 'border-emerald-200',
                  };
                  const ringColors = {
                    'from-blue-500 to-blue-600': 'ring-blue-100',
                    'from-indigo-500 to-indigo-600': 'ring-indigo-100',
                    'from-purple-500 to-purple-600': 'ring-purple-100',
                    'from-emerald-500 to-emerald-600': 'ring-emerald-100',
                  };
                  const lineColors = [
                    'from-blue-400 to-indigo-400',
                    'from-indigo-400 to-purple-400',
                    'from-purple-400 to-emerald-400',
                  ];

                  return (
                    <div key={index} className="relative">
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -3, scale: 1.01 }}
                        className="relative"
                      >
                        <Card className={`shadow-lg border-2 ${borderColors[person.gradient as keyof typeof borderColors]} hover:shadow-xl transition-all max-w-2xl mx-auto bg-white`}>
                          <CardBody className="p-6">
                            <div className="flex items-center gap-5">
                              {/* Foto */}
                              <div className={`relative w-24 h-24 flex-shrink-0 ring-4 ${ringColors[person.gradient as keyof typeof ringColors]} rounded-xl overflow-hidden`}>
                                <Image
                                  src={person.foto}
                                  alt={person.nama}
                                  fill
                                  className="object-cover object-top"
                                  sizes="96px"
                                />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base md:text-lg text-gray-800 mb-2 leading-tight">
                                  {person.nama}
                                </h4>
                                <p className={`text-sm md:text-base font-semibold bg-gradient-to-r ${person.gradient} bg-clip-text text-transparent`}>
                                  {person.jabatan}
                                </p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </motion.div>

                      {/* Garis Penghubung ke Card Berikutnya - Di tengah card */}
                      {index < pimpinan.length - 1 && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full hidden md:block z-0">
                          <div className={`w-0.5 h-12 bg-gradient-to-b ${lineColors[index]}`}></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Penanggung Jawab - 2 Kolom Sejajar */}
          <motion.div variants={itemVariants} className="mb-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Penanggung Jawab</h3>

            <div className="relative max-w-5xl mx-auto">
              {/* Grid 2 Kolom untuk 2 Pj */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {penanggungJawab.map((pj, index) => {
                  const borderColors = {
                    'from-emerald-500 to-emerald-600': 'border-emerald-200',
                    'from-teal-500 to-teal-600': 'border-teal-200',
                  };
                  const ringColors = {
                    'from-emerald-500 to-emerald-600': 'ring-emerald-100',
                    'from-teal-500 to-teal-600': 'ring-teal-100',
                  };

                  return (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ y: -3, scale: 1.01 }}
                    >
                      <Card className={`shadow-lg border-2 ${borderColors[pj.gradient as keyof typeof borderColors]} hover:shadow-xl transition-all bg-white`}>
                        <CardBody className="p-6">
                          <div className="flex items-center gap-5">
                            {/* Foto */}
                            <div className={`relative w-24 h-24 flex-shrink-0 ring-4 ${ringColors[pj.gradient as keyof typeof ringColors]} rounded-xl overflow-hidden`}>
                              <Image
                                src={pj.foto}
                                alt={pj.nama}
                                fill
                                className="object-cover object-top"
                                sizes="96px"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-base md:text-lg text-gray-800 mb-2 leading-tight">
                                {pj.nama}
                              </h4>
                              <p className={`text-sm md:text-base font-semibold bg-gradient-to-r ${pj.gradient} bg-clip-text text-transparent`}>
                                {pj.jabatan}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Tim Pengembang - Layout 1 Baris Sejajar dengan Garis */}
          <motion.div variants={itemVariants} className="relative">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">Tim Pengembang</h3>
            <p className="text-center text-gray-600 mb-12">1 System Analyst, 3 Fullstack Developers & 2 Quality Assurance</p>

            {/* Container */}
            <div className="relative max-w-7xl mx-auto">
              {/* Grid 6 Kolom - 1 Baris */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* System Analyst */}
                {timPengembang.systemAnalyst.map((analyst, index) => (
                  <motion.div
                    key={`analyst-${index}`}
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="col-span-1"
                  >
                    <Card className="shadow-lg hover:shadow-xl transition-all border-2 border-amber-100 h-full">
                      <CardBody className="p-4 text-center">
                        <div className="relative w-full aspect-square mx-auto mb-3 ring-4 ring-amber-100 rounded-xl overflow-hidden">
                          <Image
                            src={analyst.foto}
                            alt={analyst.nama}
                            fill
                            className="object-cover object-top"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 180px"
                          />
                        </div>
                        <h5 className="font-bold text-gray-800 mb-2 text-xs leading-tight">{analyst.nama}</h5>
                        <p className="text-[10px] text-amber-600 font-semibold">{analyst.role}</p>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}

                {/* Fullstack Developers */}
                {timPengembang.fullstack.map((dev, index) => (
                  <motion.div
                    key={`fullstack-${index}`}
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="col-span-1"
                  >
                    <Card className="shadow-lg hover:shadow-xl transition-all border-2 border-blue-100 h-full">
                      <CardBody className="p-4 text-center">
                        <div className="relative w-full aspect-square mx-auto mb-3 ring-4 ring-blue-100 rounded-xl overflow-hidden">
                          <Image
                            src={dev.foto}
                            alt={dev.nama}
                            fill
                            className="object-cover object-top"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 180px"
                          />
                        </div>
                        <h5 className="font-bold text-gray-800 mb-2 text-xs leading-tight">{dev.nama}</h5>
                        <p className="text-[10px] text-blue-600 font-semibold">{dev.role}</p>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}

                {/* QA Engineers */}
                {timPengembang.qa.map((qa, index) => (
                  <motion.div
                    key={`qa-${index}`}
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="col-span-1"
                  >
                    <Card className="shadow-lg hover:shadow-xl transition-all border-2 border-emerald-100 h-full">
                      <CardBody className="p-4 text-center">
                        <div className="relative w-full aspect-square mx-auto mb-3 ring-4 ring-emerald-100 rounded-xl overflow-hidden">
                          <Image
                            src={qa.foto}
                            alt={qa.nama}
                            fill
                            className="object-cover object-top"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 180px"
                          />
                        </div>
                        <h5 className="font-bold text-gray-800 mb-2 text-xs leading-tight">{qa.nama}</h5>
                        <p className="text-[10px] text-emerald-600 font-semibold">{qa.role}</p>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="mt-16">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg border border-blue-100">
              <CardBody className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Ingin Bergabung Magang dengan Tim?</h3>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  Kami selalu mencari talenta terbaik untuk bergabung dalam pengembangan myUnila.
                  Jika Anda tertarik, silakan hubungi kami!
                </p>
                <a
                  href="mailto:myunila@unila.ac.id"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Hubungi Kami
                </a>
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
