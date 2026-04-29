"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { manajemenKontenMenuConfig } from "./config/menuConfig";
import manajemenKontenService, { Konten, KontenTipe } from "@/lib/services/manajemen-konten/manajemenKontenService";
import { FiBell, FiFileText, FiBookOpen, FiArrowRight, FiPlus, FiClock } from "react-icons/fi";
import { MdEdit } from "react-icons/md";

const APP_KEY = "manajemen-konten";

interface TipeStats {
  tipe: KontenTipe;
  label: string;
  description: string;
  total: number;
  published: number;
  draft: number;
  recent: Konten[];
  icon: React.ReactNode;
  gradient: string;
  bg: string;
  ring: string;
}

export default function ManajemenKontenLandingPage() {
  useRequireAuth();
  const [stats, setStats] = useState<TipeStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tipes: { tipe: KontenTipe; label: string; description: string; icon: React.ReactNode; gradient: string; bg: string; ring: string }[] = [
      {
        tipe: "pengumuman",
        label: "Pengumuman",
        description: "Pesan singkat & cepat untuk warga Unila",
        icon: <FiBell className="w-7 h-7" />,
        gradient: "from-amber-500 to-orange-600",
        bg: "bg-amber-50",
        ring: "ring-amber-200",
      },
      {
        tipe: "berita",
        label: "Berita",
        description: "Liputan kegiatan & informasi resmi",
        icon: <FiFileText className="w-7 h-7" />,
        gradient: "from-blue-500 to-indigo-600",
        bg: "bg-blue-50",
        ring: "ring-blue-200",
      },
      {
        tipe: "artikel",
        label: "Artikel",
        description: "Tulisan panjang & opini akademik",
        icon: <FiBookOpen className="w-7 h-7" />,
        gradient: "from-emerald-500 to-teal-600",
        bg: "bg-emerald-50",
        ring: "ring-emerald-200",
      },
    ];

    const load = async () => {
      try {
        const results = await Promise.all(
          tipes.map(async (t) => {
            const [allList, published, draft] = await Promise.all([
              manajemenKontenService.listKonten({ tipe: t.tipe, limit: 5 }),
              manajemenKontenService.listKonten({ tipe: t.tipe, status: "published", limit: 1 }),
              manajemenKontenService.listKonten({ tipe: t.tipe, status: "draft", limit: 1 }),
            ]);
            return {
              ...t,
              total: allList.meta?.total || 0,
              published: published.meta?.total || 0,
              draft: draft.meta?.total || 0,
              recent: allList.data || [],
            };
          })
        );
        setStats(results);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Manajemen Konten"
      appIcon={<FiFileText className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={manajemenKontenMenuConfig}
      pageTitle="Dashboard Manajemen Konten"
    >
      <div className="space-y-7">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-6 py-8 sm:px-10 sm:py-10 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live di portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Manajemen Konten
            </h1>
            <p className="text-sm sm:text-base text-blue-100 mt-2 max-w-2xl">
              Pusat kelola pengumuman, berita, dan artikel untuk portal myUnila — siapkan konten yang tampil di semua aplikasi & dashboard pengguna.
            </p>
            {!loading && stats.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-3 text-white/90 text-sm">
                <div className="inline-flex items-center gap-1.5">
                  <span className="text-2xl font-bold">{stats.reduce((a, s) => a + s.total, 0)}</span>
                  <span className="text-xs text-blue-100">Total Konten</span>
                </div>
                <div className="text-blue-200/40">·</div>
                <div className="inline-flex items-center gap-1.5">
                  <span className="text-2xl font-bold text-emerald-300">{stats.reduce((a, s) => a + s.published, 0)}</span>
                  <span className="text-xs text-blue-100">Published</span>
                </div>
                <div className="text-blue-200/40">·</div>
                <div className="inline-flex items-center gap-1.5">
                  <span className="text-2xl font-bold text-amber-200">{stats.reduce((a, s) => a + s.draft, 0)}</span>
                  <span className="text-xs text-blue-100">Draft</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3 tipe konten cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(loading ? [...Array(3)] : stats).map((s, idx) => (
            <div
              key={s?.tipe || idx}
              className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden ${
                loading ? "animate-pulse" : ""
              }`}
            >
              {loading ? (
                <div className="p-6">
                  <div className="h-14 w-14 bg-gray-200 rounded-xl mb-4" />
                  <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-48 bg-gray-100 rounded" />
                </div>
              ) : (
                <>
                  <div className={`bg-gradient-to-br ${s.gradient} px-6 py-5`}>
                    <div className="flex items-center gap-3 text-white">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        {s.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">{s.label}</h3>
                        <p className="text-xs text-white/80">{s.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-xl font-bold text-gray-800">{s.total}</p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600">Published</p>
                        <p className="text-xl font-bold text-emerald-600">{s.published}</p>
                      </div>
                      <div>
                        <p className="text-xs text-amber-600">Draft</p>
                        <p className="text-xl font-bold text-amber-600">{s.draft}</p>
                      </div>
                    </div>

                    {s.recent.length > 0 && (
                      <div className="space-y-1.5 mb-4 pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Terbaru</p>
                        {s.recent.slice(0, 3).map((k) => (
                          <Link
                            key={k.id_pengumuman}
                            href={`/dashboard/manajemen-konten/konten/${k.id_pengumuman}`}
                            className="block text-sm text-gray-700 hover:text-blue-600 truncate"
                          >
                            <span className="text-xs text-gray-400 mr-1">•</span> {k.judul}
                          </Link>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/manajemen-konten/konten?tipe=${s.tipe}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Kelola <FiArrowRight className="w-3 h-3" />
                      </Link>
                      <Link
                        href={`/dashboard/manajemen-konten/konten/baru?tipe=${s.tipe}`}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r ${s.gradient} rounded-lg shadow-sm hover:opacity-90 transition-opacity`}
                      >
                        <FiPlus className="w-3.5 h-3.5" /> Buat
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-bold text-gray-800 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/dashboard/manajemen-konten/konten"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <FiFileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Semua Konten</span>
            </Link>
            <Link
              href="/dashboard/manajemen-konten/konten/baru"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FiPlus className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Tulis Konten Baru</span>
            </Link>
            <Link
              href="/dashboard/manajemen-konten/kategori"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <MdEdit className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Kelola Kategori</span>
            </Link>
            <Link
              href="/dashboard/manajemen-konten/konten?status=draft"
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <FiClock className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Draft Tertunda</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
