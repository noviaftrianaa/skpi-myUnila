"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserContext } from "@/contexts/UserContextContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "./config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip } from "@heroui/react";
import { FiFileText, FiClock, FiCheckCircle, FiXCircle, FiTrendingUp, FiClipboard, FiUsers, FiArrowRight, FiAlertCircle, FiAlertTriangle, FiEye } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { getDashboardOverview, getDashboardSla, getDashboardTrends, getDashboardActivity, getMyPengajuan, getMyProfile } from "@/lib/services/sim-bak/simBakService";
// dummy data removed — dashboard uses real API only
import type { DashboardStats, Pengajuan } from "@/lib/services/sim-bak/types";
import { StatusBadge } from "./components";

// ============================
// Helper: Detect if user is mahasiswa
// ============================
function isMahasiswaRole(nmPeran?: string | null): boolean {
  if (!nmPeran) return true; // default to mahasiswa view if unknown
  const lower = nmPeran.toLowerCase();
  return lower.includes("mahasiswa") || lower === "student";
}

// ============================
// Main Page: Route to correct dashboard
// ============================
export default function SimBakDashboardPage() {
  const { user } = useAuth();
  const { activeContext } = useUserContext();

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;
  }

  const isMahasiswa = isMahasiswaRole(activeContext?.nm_peran);

  return isMahasiswa ? <MahasiswaDashboard /> : <AdminDashboard />;
}

// ============================
// DASHBOARD MAHASISWA
// ============================
function MahasiswaDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [myStats, setMyStats] = useState({ total: 0, draft: 0, proses: 0, selesai: 0, ditolak: 0, perbaikan: 0 });
  const [recentPengajuan, setRecentPengajuan] = useState<Pengajuan[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [profileData, pengajuanData] = await Promise.allSettled([
          getMyProfile(),
          getMyPengajuan({ page: 1, limit: 5 }),
        ]);

        if (profileData.status === "fulfilled") setProfile(profileData.value);
        if (pengajuanData.status === "fulfilled") {
          const data = pengajuanData.value.data ?? [];
          setRecentPengajuan(data);
          setMyStats({
            total: data.length,
            draft: data.filter(p => p.status === "draft").length,
            proses: data.filter(p => ["diajukan", "diverifikasi", "menunggu_persetujuan"].includes(p.status)).length,
            selesai: data.filter(p => ["disetujui", "terbit"].includes(p.status)).length,
            ditolak: data.filter(p => p.status === "ditolak").length,
            perbaikan: data.filter(p => p.status === "perlu_perbaikan").length,
          });
        }
      } catch { /* fallback */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const quickActions = [
    { title: "Permohonan Surat", desc: "LOA, KTM, PKKMB, Herregistrasi", icon: <FiFileText className="w-7 h-7" />, href: "/dashboard/sim-bak/surat-mandiri", color: "from-blue-500 to-indigo-600" },
    { title: "Permohonan Akademik", desc: "Cuti, Undur Diri, Alih Program", icon: <FiClipboard className="w-7 h-7" />, href: "/dashboard/sim-bak/permohonan", color: "from-violet-500 to-purple-600" },
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Dashboard SI MBAK">
      <div className="space-y-6">
        {/* Header + Profile */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Halo, {String(profile?.nm_mahasiswa ?? user?.name ?? "Mahasiswa")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Selamat datang di Layanan Administrasi Kemahasiswaan BAK
            </p>
          </div>
          {profile && profile._pdut_connected && (
            <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>{String(profile.nm_prodi ?? "")}</span>
              <span>&middot;</span>
              <span>Semester {String(profile.semester_aktif ?? "-")}</span>
              <span>&middot;</span>
              <span>IPK {String(profile.ipk ?? "-")}</span>
            </div>
          )}
        </div>

        {/* Alert: Perlu Perbaikan */}
        {myStats.perbaikan > 0 && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <FiAlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {myStats.perbaikan} pengajuan perlu diperbaiki
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Periksa catatan dari admin dan lengkapi dokumen yang diminta
              </p>
            </div>
            <button onClick={() => router.push("/dashboard/sim-bak/riwayat")}
              className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline flex-shrink-0">
              Lihat
            </button>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Pengajuan", value: myStats.total, icon: <FiFileText className="w-5 h-5" />, gradient: "from-blue-500 to-blue-600" },
            { label: "Dalam Proses", value: myStats.proses, icon: <FiClock className="w-5 h-5" />, gradient: "from-amber-500 to-orange-500" },
            { label: "Selesai", value: myStats.selesai, icon: <FiCheckCircle className="w-5 h-5" />, gradient: "from-emerald-500 to-green-600" },
            { label: "Ditolak", value: myStats.ditolak, icon: <FiXCircle className="w-5 h-5" />, gradient: "from-rose-500 to-red-600" },
          ].map(card => (
            <Card key={card.label} className="border-none shadow-md rounded-xl overflow-hidden dark:bg-gray-800">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${card.gradient} text-white`}>{card.icon}</div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Ajukan Layanan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map(action => (
              <button key={action.title} onClick={() => router.push(action.href)}
                className={`w-full p-5 rounded-xl bg-gradient-to-r ${action.color} text-white text-left transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base">{action.title}</p>
                    <p className="text-sm text-white/70 mt-0.5">{action.desc}</p>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-white/60 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pengajuan Terakhir */}
        <Card className="border-none shadow-md rounded-xl dark:bg-gray-800">
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pengajuan Terakhir</h3>
              {recentPengajuan.length > 0 && (
                <button onClick={() => router.push("/dashboard/sim-bak/riwayat")}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  Lihat Semua
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentPengajuan.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
                  <FiFileText className="w-7 h-7 text-gray-300 dark:text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Belum ada pengajuan</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Mulai dengan permohonan surat atau permohonan akademik</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentPengajuan.map(p => (
                  <div key={p.id_pengajuan}
                    onClick={() => router.push(`/dashboard/sim-bak/riwayat/${p.id_pengajuan}`)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <FiFileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {p.nm_layanan || p.kode_layanan}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {p.nomor_permohonan} &middot; {p.tgl_diajukan ? new Date(p.tgl_diajukan).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "Draft"}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                    <FiEye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}

// ============================
// DASHBOARD ADMIN (existing)
// ============================
const statusColorMap: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({ total_pengajuan: 0, pengajuan_baru: 0, pengajuan_proses: 0, pengajuan_selesai: 0, pengajuan_ditolak: 0 } as DashboardStats);
  const [slaPercent, setSlaPercent] = useState(0);
  const [trendData, setTrendData] = useState<Array<{ bulan: string; surat_mandiri: number; permohonan: number; batch: number }>>([]);
  const [recentActivity, setRecentActivity] = useState<Array<{ id: string; aksi: string; aktor: string; waktu: string; tipe: string }>>([]);
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
      } catch { /* fallback */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const statCards = [
    { label: "Total Pengajuan", value: stats.total_pengajuan ?? stats.total ?? 0, icon: <FiFileText className="w-6 h-6" />, gradient: "from-blue-500 to-blue-600" },
    { label: "Baru", value: stats.pengajuan_baru ?? stats.draft ?? 0, icon: <FiClock className="w-6 h-6" />, gradient: "from-amber-500 to-orange-500" },
    { label: "Dalam Proses", value: stats.pengajuan_proses ?? stats.proses ?? 0, icon: <FiTrendingUp className="w-6 h-6" />, gradient: "from-cyan-500 to-teal-500" },
    { label: "Selesai", value: stats.pengajuan_selesai ?? stats.selesai ?? 0, icon: <FiCheckCircle className="w-6 h-6" />, gradient: "from-emerald-500 to-green-600" },
    { label: "Ditolak", value: stats.pengajuan_ditolak ?? stats.ditolak ?? 0, icon: <FiXCircle className="w-6 h-6" />, gradient: "from-rose-500 to-red-600" },
  ];

  const quickActions = [
    { title: "Permohonan Surat", desc: "LOA, KTM, PKKMB, Herregistrasi", icon: <FiFileText className="w-8 h-8" />, href: "/dashboard/sim-bak/surat-mandiri", color: "from-blue-500 to-indigo-600" },
    { title: "Permohonan Akademik", desc: "Cuti, Undur Diri, Alih Program", icon: <FiClipboard className="w-8 h-8" />, href: "/dashboard/sim-bak/permohonan", color: "from-violet-500 to-purple-600" },
    { title: "Evaluasi Studi", desc: "Habis Masa Mukim, Putus Studi", icon: <FiUsers className="w-8 h-8" />, href: "/dashboard/sim-bak/batch", color: "from-amber-500 to-orange-600" },
  ];

  const slaValue = slaPercent || (stats as Record<string, number>).sla_compliance || 0;

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Dashboard SI MBAK">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard SI MBAK</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sistem Informasi Manajemen BAK — Layanan Administrasi Kemahasiswaan</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map((card) => (
            <Card key={card.label} className={`border-none shadow-lg rounded-xl overflow-hidden bg-gradient-to-br ${card.gradient}`}>
              <CardBody className="p-4 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow">{card.icon}</div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-medium text-white/80 uppercase tracking-wide">{card.label}</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{typeof card.value === 'number' ? card.value.toLocaleString("id-ID") : card.value}</h3>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* SLA + Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
            <CardBody className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">SLA Compliance</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="10" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke="url(#slaGradient)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(slaValue / 100) * 327} 327`} />
                    <defs><linearGradient id="slaGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#059669" /></linearGradient></defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{slaValue}%</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Tepat Waktu</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">Target: Permohonan Surat 3 hari, Permohonan Akademik 14 hari</p>
            </CardBody>
          </Card>

          <Card className="lg:col-span-2 border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
            <CardBody className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Trend Pengajuan (6 Bulan Terakhir)</h3>
              {trendData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400"><FiAlertCircle className="w-8 h-8 mb-2" /><p className="text-sm">Belum ada data trend</p></div>
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
                          <span className="text-[10px] text-gray-500 whitespace-nowrap">{item.bulan.includes('-') ? item.bulan.split('-')[1] : item.bulan.split(' ')[0]?.slice(0, 3)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Permohonan Surat</span>
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
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Aksi Cepat</h3>
            {quickActions.map((action) => (
              <button key={action.title} onClick={() => router.push(action.href)}
                className={`w-full p-4 rounded-xl bg-gradient-to-r ${action.color} text-white text-left transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">{action.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{action.title}</p>
                    <p className="text-xs text-white/70 mt-0.5">{action.desc}</p>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-white/60 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>

          <Card className="lg:col-span-2 border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
            <CardBody className="p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Aktivitas Terbaru</h3>
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400"><FiAlertCircle className="w-8 h-8 mb-2" /><p className="text-sm">Belum ada aktivitas</p></div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className={`mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColorMap[item.tipe]}`}>
                        {item.tipe === "success" ? "OK" : item.tipe === "warning" ? "REV" : item.tipe === "danger" ? "NO" : "NEW"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">{item.aksi}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.aktor} &middot; {item.waktu}</p>
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
