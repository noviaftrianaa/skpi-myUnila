"use client";

// Admin Overview — landing page setelah klik /admin dari sidebar.
// Aggregate platform stats + top blogs + quick links ke admin sections.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiActivity, FiAlertCircle, FiAward, FiCheckCircle, FiEye, FiFileText,
  FiFlag, FiHeart, FiLoader, FiShield, FiStar, FiTag, FiUsers, FiX,
} from "react-icons/fi";
import { useAdminStats } from "@/lib/services/blog-platform";

const APEX_HOST = process.env.NEXT_PUBLIC_BLOG_APEX_HOST || "blog.unila.ac.id";

export default function AdminOverviewPage() {
  const { data, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        <FiLoader className="w-5 h-5 animate-spin mx-auto mb-2" /> Memuat stats…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
        <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error)?.message || "Gagal load stats"}</p>
      </div>
    );
  }

  const c = data.counts;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Admin</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiShield className="w-6 h-6 text-myunila" /> Platform Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Quick view kesehatan blog-platform Universitas Lampung.
        </p>
      </div>

      {/* Action alerts (pending laporan / suspended blogs) */}
      {(c.laporan_pending > 0 || c.blog_suspended > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {c.laporan_pending > 0 && (
            <Link href="/dashboard/blog-platform/admin/laporan"
              className="flex items-center gap-3 p-4 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
                <FiFlag className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-rose-900 dark:text-rose-300 text-sm">{c.laporan_pending} laporan menunggu</p>
                <p className="text-xs text-rose-700 dark:text-rose-400">Review konten yang dilaporkan reader →</p>
              </div>
            </Link>
          )}
          {c.blog_suspended > 0 && (
            <Link href="/dashboard/blog-platform/admin/blogs"
              className="flex items-center gap-3 p-4 rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                <FiX className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 dark:text-amber-300 text-sm">{c.blog_suspended} blog suspended</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">Review akun yang di-disable →</p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Blog counts */}
      <section>
        <h2 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Blogs</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total" value={c.blog_total} icon={FiUsers} href="/dashboard/blog-platform/admin/blogs" />
          <StatCard label="Aktif" value={c.blog_aktif} icon={FiCheckCircle} accent="text-emerald-600" />
          <StatCard label="Verified" value={c.blog_verified} icon={FiCheckCircle} accent="text-myunila" />
          <StatCard label="Followers" value={c.total_follower} icon={FiUsers} accent="text-purple-600" />
        </div>
      </section>

      {/* Post counts */}
      <section>
        <h2 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Posts</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total" value={c.post_total} icon={FiFileText} />
          <StatCard label="Published" value={c.post_published} icon={FiCheckCircle} accent="text-emerald-600" />
          <StatCard label="Draft" value={c.post_draft} icon={FiFileText} accent="text-slate-500" />
          <StatCard label="Scheduled" value={c.post_scheduled} icon={FiFileText} accent="text-amber-600" />
        </div>
      </section>

      {/* Engagement */}
      <section>
        <h2 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Engagement</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Views" value={c.total_view} icon={FiEye} accent="text-blue-600" />
          <StatCard label="Total Likes" value={c.total_like} icon={FiHeart} accent="text-rose-600" />
          <StatCard label="Komentar Approved" value={c.komentar_aktif} icon={FiActivity} accent="text-purple-600" />
          <StatCard label="Laporan Pending" value={c.laporan_pending} icon={FiFlag} accent="text-rose-600" href="/dashboard/blog-platform/admin/laporan" />
        </div>
      </section>

      {/* Reference data */}
      <section>
        <h2 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Reference Data</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Kata Terlarang" value={c.kata_terlarang} icon={FiX} href="/dashboard/blog-platform/admin/kata-terlarang" />
          <StatCard label="Templates Aktif" value={c.template_theme} icon={FiStar} accent="text-amber-600" href="/dashboard/blog-platform/admin/templates" />
          <StatCard label="Kategori" value="—" icon={FiTag} href="/dashboard/blog-platform/admin/kategori" textOnly />
          <StatCard label="Tags" value="—" icon={FiTag} href="/dashboard/blog-platform/admin/tags" textOnly />
        </div>
      </section>

      {/* Top blogs */}
      <section>
        <h2 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3 inline-flex items-center gap-2">
          <FiAward className="w-4 h-4 text-amber-500" /> Top Blogs (by views)
        </h2>
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.top_blogs.map((b, idx) => (
                <li key={b.subdomain} className="px-5 py-3 flex items-center gap-3">
                  <span className="text-lg font-display font-bold text-slate-300 dark:text-slate-700 w-7 text-center">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <a
                      href={`https://${b.subdomain}.${APEX_HOST}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-sm text-slate-900 dark:text-slate-100 hover:text-myunila truncate block"
                    >
                      {b.nm_blog}
                    </a>
                    <p className="text-[11px] font-mono text-slate-500">{b.subdomain}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 tabular-nums">
                    <span className="inline-flex items-center gap-1"><FiEye className="w-3 h-3" />{b.jumlah_view.toLocaleString()}</span>
                    <span className="inline-flex items-center gap-1"><FiFileText className="w-3 h-3" />{b.jumlah_post}</span>
                    <span className="inline-flex items-center gap-1"><FiUsers className="w-3 h-3" />{b.jumlah_follower}</span>
                  </div>
                </li>
              ))}
              {data.top_blogs.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-slate-400">Belum ada blog dengan views.</li>
              )}
            </ul>
          </CardBody>
        </Card>
      </section>

      <div className="pt-2">
        <Link href="/dashboard/blog-platform" className="text-sm text-slate-500 hover:text-myunila inline-flex items-center gap-1">
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, accent, href, textOnly,
}: {
  label: string;
  value: number | string;
  icon: typeof FiUsers;
  accent?: string;
  href?: string;
  textOnly?: boolean;
}) {
  const content = (
    <Card className={`shadow-sm border border-slate-200/60 dark:border-slate-800 ${href ? "hover:shadow-md hover:border-myunila/40 transition-all" : ""}`}>
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <Icon className={`w-4 h-4 ${accent || "text-slate-400"}`} />
          {href && <span className="text-[10px] text-slate-400 uppercase tracking-wider">↗</span>}
        </div>
        <p className={`mt-2 text-2xl font-bold tabular-nums ${accent || "text-slate-900 dark:text-slate-100"}`}>
          {textOnly ? "" : typeof value === "number" ? value.toLocaleString() : value}
          {textOnly && <span className="text-slate-300 dark:text-slate-700 text-base">view →</span>}
        </p>
        <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</p>
      </CardBody>
    </Card>
  );
  if (href) return <Link href={href} className="block">{content}</Link>;
  return content;
}
