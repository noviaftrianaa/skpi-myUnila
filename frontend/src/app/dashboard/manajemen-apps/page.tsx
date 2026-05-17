"use client";

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import { FiArrowRight, FiBell, FiBookOpen, FiFileText, FiGrid, FiSend, FiTag, FiUsers } from "react-icons/fi";

const SUB_MODULES = [
  {
    title: "Manajemen Konten",
    description: "CMS untuk pengumuman, berita, dan artikel portal MyUnila.",
    href: "/dashboard/manajemen-apps/manajemen-konten",
    icon: FiFileText,
    color: "blue",
    stats: { active: true, count: "1 modul aktif" },
    children: [
      { label: "Pengumuman", icon: FiBell,     href: "/dashboard/manajemen-apps/manajemen-konten/konten?tipe=pengumuman" },
      { label: "Berita",     icon: FiFileText, href: "/dashboard/manajemen-apps/manajemen-konten/konten?tipe=berita" },
      { label: "Artikel",    icon: FiBookOpen, href: "/dashboard/manajemen-apps/manajemen-konten/konten?tipe=artikel" },
      { label: "Kategori",   icon: FiTag,      href: "/dashboard/manajemen-apps/manajemen-konten/kategori" },
      { label: "Broadcast",  icon: FiSend,     href: "/dashboard/manajemen-apps/manajemen-konten/notifikasi" },
    ],
  },
  {
    title: "Manajemen Pengguna",
    description: "CRUD pengguna, peran, mapping unit (placeholder — akan dirilis berikutnya).",
    href: "#",
    icon: FiUsers,
    color: "purple",
    stats: { active: false, count: "Coming soon" },
    children: [],
  },
  {
    title: "Manajemen Aplikasi",
    description: "Registrasi & monitoring aplikasi MyUnila ekosistem.",
    href: "#",
    icon: FiGrid,
    color: "amber",
    stats: { active: false, count: "Coming soon" },
    children: [],
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue:   { bg: "bg-blue-50 dark:bg-blue-950",     text: "text-blue-600 dark:text-blue-400",     border: "border-blue-200 dark:border-blue-800" },
  purple: { bg: "bg-purple-50 dark:bg-purple-950", text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
  amber:  { bg: "bg-amber-50 dark:bg-amber-950",   text: "text-amber-600 dark:text-amber-400",   border: "border-amber-200 dark:border-amber-800" },
};

export default function ManajemenAppsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">Manajemen Apps</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
            Pusat manajemen seluruh modul aplikasi MyUnila. Pilih sub-modul di bawah untuk mengelola konten, pengguna,
            atau aplikasi tertentu.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            ℹ️ Manajemen Konten kini dipindahkan ke sini sebagai sub-modul. Path lama tetap di-redirect.
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUB_MODULES.map((mod) => {
            const colors = COLOR_MAP[mod.color];
            const Icon = mod.icon;
            const isActive = mod.stats.active;

            const cardInner = (
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}`}>
                    {mod.stats.count}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{mod.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{mod.description}</p>

                {mod.children.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    {mod.children.slice(0, 4).map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                      >
                        <c.icon className="w-4 h-4 text-slate-400" />
                        <span>{c.label}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {isActive && (
                  <div className={`pt-3 border-t border-slate-100 dark:border-slate-800`}>
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${colors.text}`}>
                      Buka modul <FiArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                )}
              </CardBody>
            );

            if (isActive) {
              return (
                <Link key={mod.title} href={mod.href} className="block group">
                  <Card className={`hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 ${colors.border}`}>
                    {cardInner}
                  </Card>
                </Link>
              );
            }

            return (
              <Card key={mod.title} className="opacity-60 cursor-not-allowed border-2 border-slate-200 dark:border-slate-800">
                {cardInner}
              </Card>
            );
          })}
        </div>

        <div className="mt-10 p-6 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">Modul Terkait (di luar Manajemen Apps)</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Beberapa modul memiliki scope sendiri di luar shell ini.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/manajemen-akses" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm hover:bg-slate-200 dark:hover:bg-slate-700">
              🔐 Manajemen Akses
            </Link>
            <Link href="/dashboard/blog-platform" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm hover:bg-slate-200 dark:hover:bg-slate-700">
              📝 Blog Platform
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
