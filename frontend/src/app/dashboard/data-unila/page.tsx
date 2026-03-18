"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiUsers, FiBookOpen, FiGlobe, FiTrendingUp, FiDollarSign, FiAward } from "react-icons/fi";
import { dataUnilaMenuConfig } from "./config/menuConfig";
import Link from "next/link";

const APP_KEY = "data-unila";

const MODULES = [
  {
    title: "Data Mahasiswa",
    desc: "187K+ mahasiswa — biodata, status, prodi, angkatan",
    icon: <FiUsers className="w-8 h-8" />,
    href: "/dashboard/data-unila/mahasiswa",
    color: "from-blue-500 to-indigo-600",
    count: "187,218",
  },
  {
    title: "Data Dosen & SDM",
    desc: "2,769 dosen — jabfung, pangkat, sertifikasi, diklat",
    icon: <MdSchool className="w-8 h-8" />,
    href: "/dashboard/data-unila/dosen",
    color: "from-emerald-500 to-teal-600",
    count: "2,769",
    soon: true,
  },
  {
    title: "Data Tridarma",
    desc: "14K penelitian, 38K publikasi, prestasi mahasiswa & dosen",
    icon: <FiAward className="w-8 h-8" />,
    href: "/dashboard/data-unila/tridarma/penelitian",
    color: "from-violet-500 to-purple-600",
    count: "52K+",
    soon: true,
  },
  {
    title: "Data Akademik",
    desc: "481 prodi, akreditasi, kurikulum, 34K mata kuliah",
    icon: <FiBookOpen className="w-8 h-8" />,
    href: "/dashboard/data-unila/akademik/prodi",
    color: "from-amber-500 to-orange-600",
    count: "481 prodi",
    soon: true,
  },
  {
    title: "Data Kerjasama",
    desc: "1,010 MoU, kerjasama internasional & dalam negeri",
    icon: <FiGlobe className="w-8 h-8" />,
    href: "/dashboard/data-unila/kerjasama",
    color: "from-cyan-500 to-blue-600",
    count: "1,010",
    soon: true,
  },
  {
    title: "Tracer Study",
    desc: "21K+ data lulusan, masa tunggu kerja, kepuasan",
    icon: <FiTrendingUp className="w-8 h-8" />,
    href: "/dashboard/data-unila/tracer",
    color: "from-pink-500 to-rose-600",
    count: "21,859",
    soon: true,
  },
  {
    title: "Data Keuangan",
    desc: "UKT 8K+, SPP 411K+ transaksi mahasiswa",
    icon: <FiDollarSign className="w-8 h-8" />,
    href: "/dashboard/data-unila/keuangan/ukt",
    color: "from-green-500 to-emerald-600",
    count: "420K+",
    soon: true,
  },
  {
    title: "Dashboard IKU",
    desc: "Indikator Kinerja Utama — 6 IKU wajib, tren, dan drilldown fakultas",
    icon: <FiTrendingUp className="w-8 h-8" />,
    href: "/dashboard/data-unila/iku",
    color: "from-teal-500 to-cyan-600",
    count: "6 IKU",
  },
];

export default function DataUnilaPage() {
  useRequireAuth();

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={dataUnilaMenuConfig}
      pageTitle="Data Unila"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Data Unila
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Portal raw data Universitas Lampung — IKU, akreditasi, dan pelaporan
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {MODULES.map((mod) => (
            <Link
              key={mod.title}
              href={mod.soon ? "#" : mod.href}
              className={mod.soon ? "cursor-not-allowed" : ""}
            >
              <Card className={`border-none shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 ${mod.soon ? "opacity-60" : "hover:-translate-y-1"}`}>
                <CardBody className={`bg-gradient-to-br ${mod.color} p-5 text-white relative`}>
                  <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-14 -mt-14" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center shadow">
                        {mod.icon}
                      </div>
                      {mod.soon && (
                        <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium">
                          Segera
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-1">{mod.title}</h3>
                    <p className="text-sm text-white/80 mb-3">{mod.desc}</p>
                    <div className="text-2xl font-bold text-white/90">{mod.count}</div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
