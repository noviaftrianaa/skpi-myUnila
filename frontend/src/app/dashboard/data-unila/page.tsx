"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, Chip } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiUsers, FiBookOpen, FiGlobe, FiTrendingUp, FiDollarSign, FiAward, FiInfo } from "react-icons/fi";
import { dataUnilaMenuConfig } from "./config/menuConfig";
import Link from "next/link";
import overviewDataService, { type OverviewTotals } from "@/lib/services/data-unila/overviewDataService";

const APP_KEY = "data-unila";

type ModuleDef = {
  key: keyof OverviewTotals | "tridarma" | "akademik" | "iku" | "keuangan";
  title: string;
  desc: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  soon?: boolean;
  // Hard-coded fallback untuk modul yang belum punya total endpoint (Tridarma, Akademik, dst).
  staticCount?: string;
};

const MODULES: ModuleDef[] = [
  {
    key: "mahasiswa",
    title: "Data Mahasiswa",
    desc: "Biodata, status, prodi, angkatan",
    icon: <FiUsers className="w-8 h-8" />,
    href: "/dashboard/data-unila/mahasiswa",
    color: "from-blue-500 to-indigo-600",
  },
  {
    key: "dosen",
    title: "Data Dosen & SDM",
    desc: "Jabfung, pangkat, sertifikasi, diklat",
    icon: <MdSchool className="w-8 h-8" />,
    href: "/dashboard/data-unila/dosen",
    color: "from-emerald-500 to-teal-600",
  },
  {
    key: "tridarma",
    title: "Data Tridarma",
    desc: "Penelitian, publikasi, prestasi mahasiswa & dosen",
    icon: <FiAward className="w-8 h-8" />,
    href: "/dashboard/data-unila/tridarma/penelitian",
    color: "from-violet-500 to-purple-600",
    soon: true,
    staticCount: "52K+",
  },
  {
    key: "akademik",
    title: "Data Akademik",
    desc: "Prodi, akreditasi, kurikulum, mata kuliah",
    icon: <FiBookOpen className="w-8 h-8" />,
    href: "/dashboard/data-unila/akademik/prodi",
    color: "from-amber-500 to-orange-600",
    soon: true,
    staticCount: "481 prodi",
  },
  {
    key: "kerjasama",
    title: "Data Kerjasama",
    desc: "MoU, kerjasama internasional & dalam negeri",
    icon: <FiGlobe className="w-8 h-8" />,
    href: "/dashboard/data-unila/kerjasama",
    color: "from-cyan-500 to-blue-600",
  },
  {
    key: "tracer",
    title: "Tracer Study",
    desc: "Data lulusan, masa tunggu kerja, kepuasan",
    icon: <FiTrendingUp className="w-8 h-8" />,
    href: "/dashboard/data-unila/tracer",
    color: "from-pink-500 to-rose-600",
  },
  {
    key: "keuangan",
    title: "Data Keuangan",
    desc: "UKT & SPP — transaksi mahasiswa",
    icon: <FiDollarSign className="w-8 h-8" />,
    href: "/dashboard/data-unila/keuangan/ukt",
    color: "from-green-500 to-emerald-600",
    soon: true,
    staticCount: "420K+",
  },
  {
    key: "iku",
    title: "Dashboard IKU",
    desc: "Indikator Kinerja Utama — 6 IKU wajib & drilldown",
    icon: <FiTrendingUp className="w-8 h-8" />,
    href: "/dashboard/data-unila/iku",
    color: "from-teal-500 to-cyan-600",
    staticCount: "6 IKU",
  },
];

function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return Math.floor(n).toLocaleString("id-ID");
}

export default function DataUnilaPage() {
  useRequireAuth();
  const [totals, setTotals] = useState<OverviewTotals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    overviewDataService
      .getTotals()
      .then(setTotals)
      .catch(() => setTotals(null))
      .finally(() => setLoading(false));
  }, []);

  const getCount = (mod: ModuleDef): string => {
    if (loading) return "…";
    if (mod.staticCount && !totals) return mod.staticCount;
    if (!totals) return mod.staticCount || "—";

    switch (mod.key) {
      case "mahasiswa":
        return fmt(totals.mahasiswa?.total);
      case "dosen":
        return fmt(totals.dosen?.total);
      case "kerjasama":
        return fmt(totals.kerjasama?.total);
      case "tracer":
        return fmt(totals.tracer?.total);
      default:
        return mod.staticCount || "—";
    }
  };

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

        {/* Banner: konteks universitas. Beranda sengaja universal sebagai navigasi/overview;
            modul detail di bawah akan ter-filter sesuai peran/unit aktif user. */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/40 dark:bg-blue-900/20 px-4 py-3 flex items-start gap-3">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex-shrink-0 mt-0.5">
            <FiInfo className="w-4 h-4 text-blue-700 dark:text-blue-300" />
          </span>
          <div className="text-xs sm:text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
            <strong>Data Universitas Lampung</strong> — Angka pada halaman ini menampilkan total
            keseluruhan universitas. Saat Anda membuka modul di bawah (Data Mahasiswa, Dosen, dst),
            data akan otomatis ter-filter sesuai peran/unit aktif Anda.
          </div>
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
                        <Chip size="sm" className="bg-white/20 text-white font-medium text-xs border-none">
                          Segera
                        </Chip>
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-1">{mod.title}</h3>
                    <p className="text-xs text-white/80 mb-3 line-clamp-2">{mod.desc}</p>
                    <div className="text-2xl font-bold text-white/90">{getCount(mod)}</div>
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
