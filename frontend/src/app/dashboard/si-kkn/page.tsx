"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "./config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody } from "@heroui/react";
import { FiUsers, FiGrid, FiMapPin, FiUser, FiClipboard, FiBookOpen, FiArrowRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { dummyDashboardStatsKkn, dummyTrendData, dummyRecentActivity } from "@/lib/services/si-kkn/dummyData";

const statusColorMap: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function SiKknDashboardPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();
  const [stats] = useState(dummyDashboardStatsKkn);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Peserta KKN", value: stats.total_peserta, icon: <FiUsers className="w-6 h-6" />, gradient: "from-blue-500 to-blue-600" },
    { label: "Kelompok Aktif", value: stats.kelompok_aktif, icon: <FiGrid className="w-6 h-6" />, gradient: "from-emerald-500 to-green-600" },
    { label: "Lokasi", value: stats.total_lokasi, icon: <FiMapPin className="w-6 h-6" />, gradient: "from-cyan-500 to-teal-500" },
    { label: "DPL", value: stats.total_dpl, icon: <FiUser className="w-6 h-6" />, gradient: "from-violet-500 to-purple-600" },
    { label: "Pendaftaran Baru", value: stats.pendaftar_baru, icon: <FiClipboard className="w-6 h-6" />, gradient: "from-amber-500 to-orange-500" },
  ];

  const quickActions = [
    { title: "Daftar KKN", desc: "Pendaftaran Kuliah Kerja Nyata", icon: <FiClipboard className="w-8 h-8" />, href: "/dashboard/si-kkn/pendaftaran", color: "from-blue-500 to-indigo-600" },
    { title: "Kelompok Saya", desc: "Lihat kelompok dan anggota", icon: <FiUsers className="w-8 h-8" />, href: "/dashboard/si-kkn/kelompok-saya", color: "from-violet-500 to-purple-600" },
    { title: "Logbook Harian", desc: "Catat kegiatan harian KKN", icon: <FiBookOpen className="w-8 h-8" />, href: "/dashboard/si-kkn/logbook", color: "from-amber-500 to-orange-600" },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI KKN"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="e-kkn"
      fallbackMenus={siKknMenuConfig}
      pageTitle="Dashboard SI KKN"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard SI KKN
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Sistem Informasi Kuliah Kerja Nyata — LPPM Universitas Lampung
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map((card) => (
            <Card key={card.label} className={`border-none shadow-lg rounded-xl overflow-hidden bg-gradient-to-br ${card.gradient}`}>
              <CardBody className="p-4 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow">
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-medium text-white/80 uppercase tracking-wide">{card.label}</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {card.value.toLocaleString("id-ID")}
                    </h3>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Trend Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Kelulusan Rate */}
          <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
            <CardBody className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Tingkat Kelulusan</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="10" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke="url(#kknGradient)" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${(stats.tingkat_kelulusan / 100) * 327} 327`} />
                    <defs>
                      <linearGradient id="kknGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tingkat_kelulusan}%</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Lulus</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                Rata-rata Nilai: {stats.rata_rata_nilai} &middot; Logbook Hari Ini: {stats.logbook_hari_ini}
              </p>
            </CardBody>
          </Card>

          {/* Trend Chart per Periode */}
          <Card className="lg:col-span-2 border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
            <CardBody className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Trend Peserta per Periode</h3>
              <div className="flex items-end gap-2 sm:gap-4 h-40">
                {dummyTrendData.map((item) => {
                  const maxVal = 550;
                  return (
                    <div key={item.periode} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.peserta}</span>
                      <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: `${(item.peserta / maxVal) * 100}%` }}>
                        <div className="bg-blue-500 rounded-t-sm" style={{ height: `${(item.peserta / item.peserta) * 60}%` }} />
                        <div className="bg-emerald-500 rounded-sm" style={{ height: `${(item.kelompok / item.peserta) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{item.periode.replace("KKN ", "")}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Peserta</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Kelompok</span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Aksi Cepat</h3>
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => router.push(action.href)}
                className={`w-full p-4 rounded-xl bg-gradient-to-r ${action.color} text-white text-left transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{action.title}</p>
                    <p className="text-xs text-white/70 mt-0.5">{action.desc}</p>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-white/60 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>

          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
            <CardBody className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Aktivitas Terbaru</h3>
              <div className="space-y-3">
                {dummyRecentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className={`mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColorMap[item.tipe]}`}>
                      {item.tipe === "success" ? "OK" : item.tipe === "warning" ? "REV" : item.tipe === "danger" ? "NO" : "NEW"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">{item.aksi}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.aktor} &middot; {item.waktu}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
