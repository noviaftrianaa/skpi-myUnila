"use client";

// Feed page — personalized timeline dari blog yang user follow.
// Setiap card link ke public post page di apex blog (cross-origin).

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiClock, FiEye, FiHeart, FiLoader,
  FiRss, FiUsers,
} from "react-icons/fi";
import { useState } from "react";
import { useFeed } from "@/lib/services/blog-platform";

const PAGE_SIZE = 20;
const APEX_HOST = process.env.NEXT_PUBLIC_BLOG_APEX_HOST || "blog.unila.ac.id";

export default function FeedPage() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useFeed(PAGE_SIZE, offset);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasMore = offset + PAGE_SIZE < total;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiRss className="w-6 h-6 text-myunila" /> Beranda Personal
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Post terbaru dari blog yang kamu ikuti.
          {isLoading && <span className="ml-2 inline-flex items-center gap-1 text-myunila"><FiLoader className="w-3 h-3 animate-spin" /> Memuat…</span>}
          {!isLoading && !error && (
            <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> live data
            </span>
          )}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <FiRss className="w-7 h-7" />
            </div>
            <p className="text-sm text-slate-500">
              Belum ada post dari blog yang kamu ikuti.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Cari blog menarik di{" "}
              <a href={`https://${APEX_HOST}`} target="_blank" rel="noopener noreferrer" className="text-myunila hover:underline">
                {APEX_HOST}
              </a>{" "}
              dan klik tombol <FiUsers className="inline w-3 h-3" /> Follow.
            </p>
          </CardBody>
        </Card>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((p) => {
            const postUrl = `https://${p.subdomain}.${APEX_HOST}/posts/${p.slug}`;
            return (
              <Card key={p.id_post} className="shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                {p.cover_url && (
                  <a href={postUrl} target="_blank" rel="noopener noreferrer" className="aspect-[16/9] relative bg-slate-100 dark:bg-slate-800 block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.cover_url} alt={p.judul} className="w-full h-full object-cover" />
                    {p.kategori_nama && (
                      <span
                        className="absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-semibold text-white"
                        style={{ backgroundColor: p.kategori_warna || "#3B82F6" }}
                      >
                        {p.kategori_nama}
                      </span>
                    )}
                  </a>
                )}
                <CardBody className="p-4 flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {p.blog_avatar_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.blog_avatar_url} alt={p.nm_blog} className="w-5 h-5 rounded-full" />
                    )}
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{p.nm_blog}</span>
                    <span>·</span>
                    <span className="font-mono">{p.subdomain}</span>
                  </div>
                  <a
                    href={postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-myunila transition-colors"
                  >
                    {p.judul}
                  </a>
                  {p.ringkasan && (
                    <p className="text-xs text-slate-500 line-clamp-2">{p.ringkasan}</p>
                  )}
                  <div className="mt-auto pt-2 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1"><FiEye className="w-3 h-3" /> {p.jumlah_view.toLocaleString()}</span>
                      <span className="inline-flex items-center gap-1"><FiHeart className="w-3 h-3" /> {p.jumlah_like.toLocaleString()}</span>
                      <span className="inline-flex items-center gap-1"><FiClock className="w-3 h-3" /> {p.waktu_baca_menit} mnt</span>
                    </div>
                    {p.tgl_terbit && (
                      <span className="text-[11px]">
                        {new Date(p.tgl_terbit).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {(offset > 0 || hasMore) && items.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="tabular-nums">
            {offset + 1}–{Math.min(offset + items.length, total)} dari {total.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
              className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={!hasMore}
              className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      <div className="pt-2">
        <Link
          href="/dashboard/blog-platform"
          className="text-sm text-slate-500 hover:text-myunila inline-flex items-center gap-1"
        >
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
