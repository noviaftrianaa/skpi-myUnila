"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "./config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody } from "@heroui/react";
import { FiFileText, FiClock, FiCheckCircle, FiXCircle, FiTrendingUp, FiClipboard, FiUsers, FiArrowRight, FiAlertCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { getDashboardOverview, getDashboardSla, getDashboardTrends, getDashboardActivity } from "@/lib/services/sim-bak/simBakService";
import { dummyDashboardStats, dummyTrendData, dummyRecentActivity } from "@/lib/services/sim-bak/dummyData";
import type { DashboardStats } from "@/lib/services/sim-bak/types";

const statusColorMap: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function SimBakDashboardPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>(dummyDashboardStats);
  const [slaPercent, setSlaPercent] = useState(0);
  const [trendData, setTrendData] = useState(dummyTrendData);
  const [recentActivity, setRecentActivity] = useState(dummyRecentActivity);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [statsData, slaData, trendsData, activityData] = await Promise.allSettled([
          getDashboardOverview(),
          getDashboardSla(),
          getDashboardTrends(),
          getDashboardActivity(10),
        ]);

        if (statsData.status === 'fulfilled') setStats(statsData.value);
        if (slaData.status === 'fulfilled') setSlaPercent(slaData.value.percentage);
        if (trendsData.status === 'fulfilled' && trendsData.value.length > 0) {
          setTrendData(trendsData.value.map(t => ({
            bulan: t.bulan,
            surat_mandiri: Number(t.surat_mandiri) || 0,
            permohonan: Number(t.permohonan) || 0,
            batch: Number(t.batch) || 0,
          })));
        }
        if (activityData.status === 'fulfilled' && activityData.value.length > 0) {
          setRecentActivity(activityData.value.map((a, i) => ({
            id: a.id_riwayat || String(i),
            aksi: `${a.nm_tahapan} — ${a.nomor_permohonan || ''}`,
            aktor: a.nm_aktor || 'Sistem',
            waktu: a.created_at ? new Date(a.created_at).toLocaleString('id-ID') : '',
            tipe: a.status_ke === 'terbit' || a.status_ke === 'disetujui' ? 'success'
              : a.status_ke === 'ditolak' ? 'danger'
              : a.status_ke === 'perlu_perbaikan' ? 'warning' : 'info',
          })));
        }
      } catch {
        // Fallback to dummy data — already set as default
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Pengajuan", value: stats.total_pengajuan ?? stats.total ?? 0, icon: <FiFileText className="w-6 h-6" />, gradient: "from-blue-500 to-blue-600" },
    { label: "Baru", value: stats.pengajuan_baru ?? stats.draft ?? 0, icon: <FiClock className="w-6 h-6" />, gradient: "from-amber-500 to-orange-500" },
    { label: "Dalam Proses", value: stats.pengajuan_proses ?? stats.proses ?? 0, icon: <FiTrendingUp className="w-6 h-6" />, gradient: "from-cyan-500 to-teal-500" },
    { label: "Selesai", value: stats.pengajuan_selesai ?? stats.selesai ?? 0, icon: <FiCheckCircle className="w-6 h-6" />, gradient: "from-emerald-500 to-green-600" },
    { label: "Ditolak", value: stats.pengajuan_ditolak ?? stats.ditolak ?? 0, icon: <FiXCircle className="w-6 h-6" />, gradient: "from-rose-500 to-red-600" },
  ];

  const quickActions = [
    { title: "Surat Mandiri", desc: "LOA, KTM, PKKMB, Herregistrasi", icon: <FiFileText className="w-8 h-8" />, href: "/dashboard/sim-bak/surat-mandiri", color: "from-blue-500 to-indigo-600" },
    { title: "Permohonan Akademik", desc: "Cuti, Undur Diri, Alih Program", icon: <FiClipboard className="w-8 h-8" />, href: "/dashboard/sim-bak/permohonan", color: "from-violet-500 to-purple-600" },
    { title: "Batch Administrasi", desc: "HMM, Putus Studi", icon: <FiUsers className="w-8 h-8" />, href: "/dashboard/sim-bak/batch", color: "from-amber-500 to-orange-600" },
  ];

  const slaValue = slaPercent || (stats as Record<string, number>).sla_compliance || 0;

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI MBAK"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="sim-bak"
      fallbackMenus={simBakMenuConfig}
      pageTitle="Dashboard SI MBAK"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard SI MBAK
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Sistem Informasi Manajemen BAK — Layanan Administrasi Kemahasiswaan
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
                      {typeof card.value === 'number' ? card.value.toLocaleString("id-ID") : card.value}
                    </h3>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* SLA + Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* SLA Card */}
          <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
            <CardBody className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">SLA Compliance</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="10" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke="url(#slaGradient)" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${(slaValue / 100) * 327} 327`} />
                    <defs>
                      <linearGradient id="slaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{slaValue}%</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Tepat Waktu</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                Target: Surat Mandiri 3 hari, Permohonan 14 hari
              </p>
            </CardBody>
          </Card>

          {/* Trend Chart */}
          <Card className="lg:col-span-2 border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
            <CardBody className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Trend Pengajuan (6 Bulan Terakhir)</h3>
              {trendData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500">
                  <FiAlertCircle className="w-8 h-8 mb-2" />
                  <p className="text-sm">Belum ada data trend</p>
                </div>
              ) : (
                <>
                  <div className="flex items-end gap-2 sm:gap-4 h-40">
                    {trendData.map((item) => {
                      const total = item.surat_mandiri + item.permohonan + item.batch;
                      const maxVal = Math.max(...trendData.map(t => t.surat_mandiri + t.permohonan + t.batch), 1);
                      return (
                        <div key={item.bulan} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{total}</span>
                          <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: `${(total / maxVal) * 100}%`, minHeight: total > 0 ? '4px' : '0' }}>
                            <div className="bg-blue-500 rounded-t-sm" style={{ height: `${total > 0 ? (item.surat_mandiri / total) * 100 : 0}%` }} />
                            <div className="bg-violet-500 rounded-sm" style={{ height: `${total > 0 ? (item.permohonan / total) * 100 : 0}%` }} />
                            {item.batch > 0 && <div className="bg-amber-500 rounded-sm" style={{ height: `${(item.batch / total) * 100}%` }} />}
                          </div>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.bulan.includes('-') ? item.bulan.split('-')[1] : item.bulan.split(' ')[0]?.slice(0, 3)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Surat Mandiri</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-violet-500" /> Permohonan</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Batch</span>
                  </div>
                </>
              )}
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
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                  <FiAlertCircle className="w-8 h-8 mb-2" />
                  <p className="text-sm">Belum ada aktivitas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((item) => (
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
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
