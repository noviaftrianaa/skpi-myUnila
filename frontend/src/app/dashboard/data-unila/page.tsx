"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiUsers, FiBookOpen, FiGlobe, FiTrendingUp, FiDollarSign, FiAward, FiInfo } from "react-icons/fi";
import { dataUnilaMenuConfig } from "./config/menuConfig";
import Link from "next/link";
import overviewDataService, { type OverviewTotals } from "@/lib/services/data-unila/overviewDataService";

const APP_KEY = "data-unila";

type ModuleDef = {
  key: keyof OverviewTotals;
  title: string;
  desc: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  unit: string;
  source: string;
};

const MODULES: ModuleDef[] = [
  {
    key: "mahasiswa",
    title: "Data Mahasiswa",
    desc: "Biodata, status, prodi, angkatan",
    icon: <FiUsers className="w-7 h-7" />,
    href: "/dashboard/data-unila/mahasiswa",
    color: "from-blue-500 to-indigo-600",
    unit: "Aktif",
    source: "PDDikti / Feeder Neo",
  },
  {
    key: "dosen",
    title: "Data Dosen",
    desc: "Jabfung, pendidikan, sertifikasi dosen",
    icon: <MdSchool className="w-7 h-7" />,
    href: "/dashboard/data-unila/dosen",
    color: "from-emerald-500 to-teal-600",
    unit: "Aktif",
    source: "SISTER",
  },
  {
    key: "tendik",
    title: "Daftar Tendik",
    desc: "PNS, PPPK, honorer",
    icon: <FiUsers className="w-7 h-7" />,
    href: "/dashboard/data-unila/dosen/tendik",
    color: "from-teal-500 to-cyan-600",
    unit: "Aktif",
    source: "SIKEP",
  },
  {
    key: "tridarma",
    title: "Data Tridarma",
    desc: "Pengajaran, penelitian, pengabdian & publikasi",
    icon: <FiAward className="w-7 h-7" />,
    href: "/dashboard/data-unila/tridarma/pengajaran",
    color: "from-violet-500 to-purple-600",
    unit: "Total",
    source: "PDDikti / SISTER",
  },
  {
    key: "prodi",
    title: "Prodi Aktif",
    desc: "Program studi terakreditasi (semua jenjang)",
    icon: <FiBookOpen className="w-7 h-7" />,
    href: "/dashboard/data-unila/akademik/prodi",
    color: "from-amber-500 to-orange-600",
    unit: "Prodi",
    source: "PDDikti",
  },
  {
    key: "kerjasama",
    title: "Data Kerjasama",
    desc: "MoU & kerjasama dalam/luar negeri",
    icon: <FiGlobe className="w-7 h-7" />,
    href: "/dashboard/data-unila/kerjasama",
    color: "from-cyan-500 to-blue-600",
    unit: "MoU",
    source: "Sikerma Unila",
  },
  {
    key: "tracer",
    title: "Tracer Study",
    desc: "Data lulusan, masa tunggu kerja, kepuasan",
    icon: <FiTrendingUp className="w-7 h-7" />,
    href: "/dashboard/data-unila/tracer",
    color: "from-pink-500 to-rose-600",
    unit: "Lulusan",
    source: "Tracer Study",
  },
  {
    key: "keuangan",
    title: "Data Keuangan",
    desc: "UKT & SPP — transaksi mahasiswa",
    icon: <FiDollarSign className="w-7 h-7" />,
    href: "/dashboard/data-unila/keuangan/ukt",
    color: "from-green-500 to-emerald-600",
    unit: "Records",
    source: "Siloket",
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
    if (!totals) return "—";
    return fmt(totals[mod.key]?.total);
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
            Portal raw data Universitas Lampung — akreditasi dan pelaporan
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
            <Link key={mod.title} href={mod.href} className="group">
              <Card className="border-none shadow-md group-hover:shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1">
                <CardBody className={`bg-gradient-to-br ${mod.color} p-0 text-white relative overflow-hidden`}>
                  {/* Soft glow accents — replace harsh circle */}
                  <div className="absolute -top-16 -right-10 w-44 h-44 bg-white/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-black/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10 flex items-stretch min-h-[96px]">
                    {/* Left: icon panel */}
                    <div className="flex items-center justify-center pl-5 pr-1">
                      <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-inset ring-white/25 shadow-inner">
                        {mod.icon}
                      </div>
                    </div>

                    {/* Middle: title + desc + source badge */}
                    <div className="flex-1 min-w-0 px-4 py-4 flex flex-col justify-center">
                      <h3 className="text-base font-bold leading-tight">{mod.title}</h3>
                      <p className="text-[11px] text-white/80 leading-snug line-clamp-2 mt-1">
                        {mod.desc}
                      </p>
                      <span className="inline-flex items-center gap-1 self-start mt-2 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-inset ring-white/25 text-[9px] font-semibold uppercase tracking-wider">
                        <span className="w-1 h-1 rounded-full bg-white/80" />
                        {mod.source}
                      </span>
                    </div>

                    {/* Right: stat column */}
                    <div className="flex flex-col items-end justify-center pl-3 pr-5 py-4 border-l border-white/15 min-w-[104px] bg-white/[0.04]">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/70">
                        {mod.unit}
                      </span>
                      <span className="text-[26px] leading-none font-extrabold tabular-nums mt-1.5 drop-shadow-sm">
                        {getCount(mod)}
                      </span>
                    </div>
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
