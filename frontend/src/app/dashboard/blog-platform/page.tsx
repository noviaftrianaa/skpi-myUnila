"use client";

// Blog Platform Dashboard — editorial-style overview (inspired by Medium / Substack / Ghost).
// Sprint 6: wired ke real API. Empty state kalau user belum punya blog.

import Link from "next/link";
import Image from "next/image";
import { Card, CardBody } from "@heroui/react";
import {
  FiArrowRight, FiArrowUpRight, FiBookmark, FiCalendar, FiCheck, FiClock,
  FiEdit3, FiExternalLink, FiEye, FiFileText, FiHeart, FiLayers,
  FiMessageCircle, FiSettings, FiStar, FiTrendingUp, FiUsers,
} from "react-icons/fi";
import { ContinueReading } from "./_components/ContinueReading";
import {
  useMyBlog, usePostList, usePostStatusCount,
  useAnalyticsViews, useAuditLog,
} from "@/lib/services/blog-platform";
import type { Blog as APIBlog, PostSummary } from "@/lib/services/blog-platform";

export default function BlogPlatformDashboardPage() {
  const { data: apiBlog, isLoading: loadingBlog, error: blogError } = useMyBlog();
  const blog = apiBlog;
  const idBlog = apiBlog?.id_blog || "";

  const { data: topPostsList } = usePostList({
    id_blog: idBlog,
    status: "published",
    order: "popular",
    limit: 4,
  });
  const topPosts: PostSummary[] = topPostsList?.items ?? [];

  const { data: draftList } = usePostList({
    id_blog: idBlog,
    status: "draft",
    order: "latest",
    limit: 3,
  });
  const recentDraft: PostSummary[] = draftList?.items ?? [];

  const { data: statusCounts } = usePostStatusCount(idBlog);

  // Real analytics views (last 30 days dari interaction.view_post)
  const { data: viewsData } = useAnalyticsViews(30, !!idBlog);
  const views30d = (viewsData ?? []).slice(-30);
  const recent7d = views30d.slice(-7);
  const recent7dTotal = recent7d.reduce((s, d) => s + d.views, 0);
  const prev7d = views30d.slice(-14, -7);
  const prev7dTotal = prev7d.reduce((s, d) => s + d.views, 0);
  const weeklyDelta = prev7dTotal > 0 ? Math.round(((recent7dTotal - prev7dTotal) / prev7dTotal) * 100) : 0;

  // Real activity timeline dari audit.jejak_audit
  const { data: auditEntries } = useAuditLog(4, !!apiBlog);
  const myAudit = (auditEntries ?? []).map(a => {
    const d = a.detail_json as { judul?: string } | null | undefined;
    return {
      id: a.id_jejak_audit,
      tgl: a.created_at,
      pengguna: blog?.nm_tampilan || "—",
      aksi: a.aksi,
      entitas: a.entitas,
      detail: d?.judul ? `${a.aksi.replace(/_/g, " ")} "${d.judul}"` : a.aksi.replace(/_/g, " "),
    };
  });

  // Empty state — user belum punya blog (404 dari API). Tampilkan onboarding hint.
  if (blogError && !loadingBlog) {
    return <NoBlogState />;
  }
  if (loadingBlog || !blog) {
    return (
      <div className="py-16 text-center text-sm text-slate-500 inline-flex items-center gap-2 mx-auto">
        <span className="w-4 h-4 rounded-full border-2 border-myunila border-t-transparent animate-spin" />
        Memuat dashboard…
      </div>
    );
  }

  // Counts mapping untuk status widget
  const counts: Record<string, number> = { published: 0, draft: 0, scheduled: 0, trash: 0 };
  (statusCounts ?? []).forEach(c => { counts[c.status] = c.total; });

  return (
    <div className="space-y-6">
      {/* Editorial greeting hero */}
      <GreetingHero blog={blog} weeklyViews={recent7dTotal} weeklyDelta={weeklyDelta} />

      {/* Stats grid with sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FiFileText}
          label="Total Post"
          value={blog.jumlah_post}
          sub="Published"
          delta="+3 minggu ini"
          color="blue"
          sparkData={[3, 5, 4, 7, 6, 9, 8, 12, 14, 18, 20, 23]}
        />
        <StatCard
          icon={FiEye}
          label="Total Views"
          value={blog.jumlah_view.toLocaleString()}
          sub="Lifetime"
          delta="+12% / 30 hari"
          color="emerald"
          sparkData={views30d.map(d => d.views)}
        />
        <StatCard
          icon={FiHeart}
          label="Total Likes"
          value="—"
          sub="P2 fitur"
          color="rose"
          locked
        />
        <StatCard
          icon={FiUsers}
          label="Followers"
          value={blog.jumlah_follower}
          sub="P2 fitur"
          color="purple"
          locked
        />
      </div>

      {/* Engagement chart + Top Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">Engagement</h2>
                <p className="text-xs text-slate-500 mt-0.5">Trend kunjungan 30 hari terakhir</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-myunila tabular-nums">
                  {views30d.reduce((s, d) => s + d.views, 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">total views</p>
              </div>
            </div>
            <EngagementChart data={views30d} />
          </CardBody>
        </Card>

        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
                  Top Posts
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Paling banyak dibaca</p>
              </div>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-500">
                <FiTrendingUp className="w-4 h-4" />
              </span>
            </div>
            <ul className="space-y-3">
              {topPosts.map((p, idx) => (
                <li key={p.id_post}>
                  <Link
                    href={`/dashboard/blog-platform/posts/${p.id_post}/edit`}
                    className="group flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" :
                      idx === 1 ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300" :
                      idx === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" :
                      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      {idx + 1}
                    </span>
                    {p.cover_url ? (
                      <Image
                        src={p.cover_url}
                        alt={p.judul}
                        width={56}
                        height={56}
                        className="flex-shrink-0 w-14 h-14 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
                      />
                    ) : (
                      <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-300">
                        <FiFileText className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-myunila line-clamp-2 leading-snug">
                        {p.judul}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <FiEye className="w-3 h-3" />{p.jumlah_view.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <FiHeart className="w-3 h-3" />{p.jumlah_like}
                        </span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <FiMessageCircle className="w-3 h-3" />{p.jumlah_komentar}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/blog-platform/posts?status=published"
              className="mt-4 flex items-center justify-center gap-1 w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-myunila/40 hover:text-myunila transition-colors"
            >
              Lihat Semua Post <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardBody>
        </Card>
      </div>

      {/* Drafts (continue writing) + Activity Timeline + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Writing — featured, larger */}
        <Card className="lg:col-span-2 shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
                  <FiEdit3 className="w-4 h-4 text-myunila" /> Lanjutkan Menulis
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Draft yang belum selesai</p>
              </div>
              <Link
                href="/dashboard/blog-platform/posts?status=draft"
                className="text-xs text-myunila font-medium inline-flex items-center gap-1 hover:underline"
              >
                Semua Draft <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {recentDraft.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-500">Tidak ada draft tersimpan.</p>
                <Link
                  href="/dashboard/blog-platform/posts/baru"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-myunila text-white hover:shadow-md transition-shadow"
                >
                  <FiEdit3 className="w-3.5 h-3.5" /> Mulai Tulis Baru
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {recentDraft.map(p => {
                  const progress = Math.min(100, Math.max(15, (p.ringkasan?.length || 30) * 1.8));
                  return (
                    <li key={p.id_post}>
                      <Link
                        href={`/dashboard/blog-platform/posts/${p.id_post}/edit`}
                        className="flex items-center gap-4 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/60 hover:border-myunila/40 transition-all group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-myunila truncate">
                              {p.judul || "(Tanpa judul)"}
                            </p>
                            {p.kategori_nama && (
                              <span
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                                style={{ backgroundColor: `${p.kategori_warna || "#64748B"}15`, color: p.kategori_warna || "#64748B" }}
                              >
                                {p.kategori_nama}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {p.ringkasan || "Belum ada ringkasan…"}
                          </p>
                          {/* Progress bar */}
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-myunila to-blue-500 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium tabular-nums">{progress.toFixed(0)}%</span>
                          </div>
                        </div>
                        <FiArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-myunila group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Status Posts */}
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="p-6">
            <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight mb-4 inline-flex items-center gap-2">
              <FiLayers className="w-4 h-4 text-myunila" /> Status Posts
            </h2>
            <div className="space-y-1.5">
              <StatusRow icon={FiCheck} label="Published" count={counts.published} color="emerald" href="/dashboard/blog-platform/posts?status=published" />
              <StatusRow icon={FiEdit3} label="Draft" count={counts.draft} color="slate" href="/dashboard/blog-platform/posts?status=draft" />
              <StatusRow icon={FiCalendar} label="Scheduled" count={counts.scheduled} color="blue" href="/dashboard/blog-platform/posts?status=scheduled" />
              <StatusRow icon={FiBookmark} label="Trash" count={counts.trash} color="rose" href="/dashboard/blog-platform/posts?status=trash" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Continue Reading widget — auto-hides when empty */}
      <ContinueReading />

      {/* Activity timeline + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
                  <FiClock className="w-4 h-4 text-myunila" /> Aktivitas Terbaru
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Catatan perubahan di blog kamu</p>
              </div>
            </div>
            {myAudit.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">Belum ada aktivitas.</p>
            ) : (
              <ol className="relative space-y-4 pl-5 border-l-2 border-slate-200/60 dark:border-slate-800">
                {myAudit.map(a => (
                  <li key={a.id} className="relative">
                    <span className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full bg-white dark:bg-slate-950 border-2 border-myunila" />
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">{a.detail}</p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap tabular-nums">{formatRelativeTime(a.tgl)}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mr-2">
                        {a.aksi.replace(/_/g, " ")}
                      </span>
                      {a.entitas}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </CardBody>
        </Card>

        {/* Pengaturan Cepat */}
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800 bg-gradient-to-br from-myunila/[0.04] to-transparent">
          <CardBody className="p-6">
            <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight mb-1 inline-flex items-center gap-2">
              <FiSettings className="w-4 h-4 text-myunila" /> Pengaturan Cepat
            </h2>
            <p className="text-xs text-slate-500 mb-4">Tweak tampilan blog kamu</p>
            <div className="space-y-2">
              <QuickLink href="/dashboard/blog-platform/settings/profile" icon={FiSettings} label="Profile" sub="Avatar, bio, sosmed" />
              <QuickLink href="/dashboard/blog-platform/settings/subdomain" icon={FiExternalLink} label="Subdomain" sub="URL blog kamu" />
              <QuickLink href="/dashboard/blog-platform/settings/theme" icon={FiStar} label="Theme" sub="Tampilan reader" />
              <QuickLink href="/dashboard/blog-platform/analytics" icon={FiTrendingUp} label="Analytics" sub="Deep dive metrics" />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// ============================== Components ==============================

// Onboarding state — user belum punya blog di backend (404 dari /me/blog).
// Tampilkan CTA untuk claim subdomain.
function NoBlogState() {
  return (
    <div className="py-12 max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 mx-auto rounded-2xl bg-myunila/10 text-myunila flex items-center justify-center mb-5">
        <FiEdit3 className="w-10 h-10" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
        Selamat datang di Blog Platform myUnila
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
        Kamu belum punya blog. Klaim subdomain pribadi kamu untuk mulai menulis dan berbagi cerita di
        <span className="font-mono"> blog.unila.ac.id</span>.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          href="/dashboard/blog-platform/settings/subdomain"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-myunila to-myunila-700 text-white hover:shadow-md transition-shadow"
        >
          <FiCheck className="w-4 h-4" /> Klaim Subdomain Sekarang
        </Link>
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-myunila/40 hover:text-myunila transition-colors"
        >
          Nanti dulu
        </Link>
      </div>
      <p className="mt-6 text-[11px] text-slate-400">
        Subdomain berbasis NIM/NPP, auto-generated 5 opsi dari profil PDUT — pilih yang paling cocok.
      </p>
    </div>
  );
}

function GreetingHero({ blog, weeklyViews, weeklyDelta }: { blog: APIBlog; weeklyViews: number; weeklyDelta: number }) {
  const greeting = getGreeting();
  const displayName = blog.nm_tampilan || blog.nm_blog || "Penulis";
  const firstName = displayName.split(" ")[0];
  const isPositive = weeklyDelta >= 0;
  return (
    <Card className="overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-sm bg-gradient-to-br from-myunila/[0.03] via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <CardBody className="p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {greeting}, <span className="bg-gradient-to-r from-myunila to-blue-600 bg-clip-text text-transparent">{firstName}</span> 👋
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {blog.jumlah_post > 0 ? (
                <>Kamu sudah menerbitkan <strong className="text-slate-900 dark:text-slate-100 tabular-nums">{blog.jumlah_post}</strong> post. Lanjutkan momentum tulisanmu hari ini.</>
              ) : (
                <>Belum ada post. Tulis post pertama dan mulai berbagi cerita.</>
              )}
            </p>
          </div>
          <div className="flex items-stretch gap-3">
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-3 shadow-sm min-w-[140px]">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Views 7 hari</p>
              <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {weeklyViews.toLocaleString()}
              </p>
              <p className={`text-[11px] font-semibold mt-0.5 inline-flex items-center gap-0.5 ${
                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}>
                {isPositive ? "↑" : "↓"} {Math.abs(weeklyDelta)}% dari minggu lalu
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

const COLORS: Record<string, { bg: string; text: string; gradFrom: string; gradTo: string; spark: string }> = {
  blue:    { bg: "bg-blue-50 dark:bg-blue-950/40",       text: "text-blue-600 dark:text-blue-400",       gradFrom: "from-blue-500/10",    gradTo: "to-transparent", spark: "stroke-blue-500"    },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400", gradFrom: "from-emerald-500/10", gradTo: "to-transparent", spark: "stroke-emerald-500" },
  rose:    { bg: "bg-rose-50 dark:bg-rose-950/40",       text: "text-rose-600 dark:text-rose-400",       gradFrom: "from-rose-500/10",    gradTo: "to-transparent", spark: "stroke-rose-500"    },
  purple:  { bg: "bg-purple-50 dark:bg-purple-950/40",   text: "text-purple-600 dark:text-purple-400",   gradFrom: "from-purple-500/10",  gradTo: "to-transparent", spark: "stroke-purple-500"  },
  slate:   { bg: "bg-slate-100 dark:bg-slate-800",       text: "text-slate-600 dark:text-slate-400",     gradFrom: "from-slate-500/10",   gradTo: "to-transparent", spark: "stroke-slate-500"   },
};

function StatCard({
  icon: Icon, label, value, sub, delta, color, sparkData, locked,
}: {
  icon: typeof FiEye; label: string; value: string | number; sub?: string;
  delta?: string; color: string; sparkData?: number[]; locked?: boolean;
}) {
  const c = COLORS[color] || COLORS.blue;
  return (
    <Card className={`relative overflow-hidden shadow-sm border border-slate-200/60 dark:border-slate-800 bg-gradient-to-br ${c.gradFrom} ${c.gradTo} hover:shadow-md transition-shadow ${locked ? "opacity-80" : ""}`}>
      <CardBody className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
            {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
          </div>
          <div className={`w-9 h-9 rounded-lg ${c.bg} ${c.text} flex items-center justify-center shadow-sm`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums tracking-tight">{value}</p>
        <div className="mt-2 flex items-end justify-between gap-2 min-h-[28px]">
          {delta && !locked && (
            <span className={`text-[11px] font-semibold ${c.text} inline-flex items-center gap-0.5`}>
              ↑ {delta}
            </span>
          )}
          {locked && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Coming Soon
            </span>
          )}
          {sparkData && sparkData.length > 1 && (
            <MiniSparkline data={sparkData} className={c.spark} />
          )}
        </div>
      </CardBody>
    </Card>
  );
}

function MiniSparkline({ data, className }: { data: number[]; className: string }) {
  const w = 64;
  const h = 22;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      />
    </svg>
  );
}

function StatusRow({ icon: Icon, label, count, color, href }: { icon: typeof FiEye; label: string; count: number; color: string; href: string }) {
  const c = COLORS[color] || COLORS.blue;
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <span className={`w-7 h-7 rounded-lg ${c.bg} ${c.text} flex items-center justify-center`}>
          <Icon className="w-3.5 h-3.5" />
        </span>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-myunila">{label}</span>
      </div>
      <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">{count}</span>
    </Link>
  );
}

function QuickLink({ href, icon: Icon, label, sub }: { href: string; icon: typeof FiEye; label: string; sub: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-800/60 hover:shadow-sm border border-transparent hover:border-myunila/20 transition-all group"
    >
      <span className="w-9 h-9 rounded-lg bg-myunila/10 text-myunila flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
        <Icon className="w-4 h-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-myunila">{label}</p>
        <p className="text-[11px] text-slate-500 truncate">{sub}</p>
      </div>
      <FiArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-myunila group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

// SVG Area chart with gradient fill (replaces simple bar chart)
function EngagementChart({ data }: { data: { date: string; views: number }[] }) {
  if (!data || data.length < 2) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-slate-400">
        Belum ada data view. Tunggu pembaca pertama datang!
      </div>
    );
  }
  const w = 560;
  const h = 140;
  const pad = { top: 8, right: 4, bottom: 20, left: 4 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const max = Math.max(...data.map(d => d.views));
  const min = Math.min(...data.map(d => d.views));
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = pad.left + (i / (data.length - 1)) * cw;
    const y = pad.top + ch - ((d.views - min) / range) * ch;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${pad.top + ch} L ${points[0].x.toFixed(1)} ${pad.top + ch} Z`;

  // Tick marks for x-axis (every 5 days)
  const tickIndices = [0, 7, 14, 21, 29].filter(i => i < points.length);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(11, 94, 168)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="rgb(11, 94, 168)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Horizontal gridlines */}
        {[0.25, 0.5, 0.75].map((r, i) => (
          <line
            key={i}
            x1={pad.left}
            x2={w - pad.right}
            y1={pad.top + ch * r}
            y2={pad.top + ch * r}
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="2 4"
            className="text-slate-200 dark:text-slate-800"
          />
        ))}
        {/* Area fill */}
        <path d={areaPath} fill="url(#area-gradient)" />
        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="rgb(11, 94, 168)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* X-axis ticks */}
        {tickIndices.map(i => (
          <text
            key={i}
            x={points[i].x}
            y={h - 4}
            textAnchor="middle"
            className="text-[8px] fill-slate-400"
          >
            {points[i].date.slice(5)}
          </text>
        ))}
        {/* Dots on last point */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="3.5"
          fill="rgb(11, 94, 168)"
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

// ============================== Helpers ==============================

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}h`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
