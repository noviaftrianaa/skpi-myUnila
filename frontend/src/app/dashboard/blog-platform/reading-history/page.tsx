"use client";

// Reading History — posts the user has finished (completed_at IS NOT NULL).
// Companion to the Continue Reading widget on the dashboard landing.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiBookOpen, FiCheck, FiClock, FiExternalLink, FiLoader,
} from "react-icons/fi";
import { useReadingHistory } from "@/lib/services/blog-platform";

const APEX_HOST = process.env.NEXT_PUBLIC_BLOG_APEX_HOST || "blog.unila.ac.id";

export default function ReadingHistoryPage() {
  const { data: items = [], isLoading } = useReadingHistory(50);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Aktivitas Pribadi</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiBookOpen className="w-6 h-6 text-myunila" /> Riwayat Baca
          {isLoading && <FiLoader className="w-4 h-4 animate-spin text-myunila" />}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Post yang sudah kamu baca sampai selesai (90%+). Disimpan otomatis saat kamu scroll.
        </p>
      </div>

      {!isLoading && items.length === 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-12 text-center">
            <FiCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Belum ada bacaan selesai.</p>
            <p className="mt-1 text-xs text-slate-400">
              Mulai baca artikel di{" "}
              <a href={`https://${APEX_HOST}`} className="text-myunila hover:underline" target="_blank" rel="noopener noreferrer">
                blog.unila.ac.id
              </a>
              {" — "}progress kamu dilacak otomatis.
            </p>
          </CardBody>
        </Card>
      )}

      {items.length > 0 && (
        <ul className="space-y-3">
          {items.map((p) => (
            <li key={p.id_post}>
              <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800 hover:border-myunila/30 transition-colors">
                <CardBody className="p-4">
                  <a
                    href={`https://${p.subdomain}.${APEX_HOST}/posts/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4"
                  >
                    {p.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.cover_url}
                        alt={p.judul}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0 bg-slate-100"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center text-slate-400">
                        <FiBookOpen className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 group-hover:text-myunila line-clamp-2">
                        {p.judul}
                      </h2>
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                        <span className="font-medium">{p.nm_tampilan || p.nm_blog}</span>
                        <span>·</span>
                        <span>@{p.subdomain}</span>
                        <span>·</span>
                        <span>{p.waktu_baca_menit} mnt baca</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <FiCheck className="w-3 h-3" />
                          Selesai dibaca {p.completed_at && new Date(p.completed_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <FiClock className="w-3 h-3" />
                          Pertama dibuka {new Date(p.last_seen_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                    <FiExternalLink className="w-4 h-4 text-slate-300 group-hover:text-myunila flex-shrink-0 mt-1 transition-colors" />
                  </a>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <div className="pt-2">
        <Link href="/dashboard/blog-platform" className="text-sm text-slate-500 hover:text-myunila inline-flex items-center gap-1">
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
