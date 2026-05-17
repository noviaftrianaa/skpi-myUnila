"use client";

// ContinueReading — dashboard widget showing posts the user started but
// hasn't finished. Rendered inside the dashboard landing page below the
// hero stats. Auto-hides when the user has nothing in progress.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import { FiArrowRight, FiBookOpen, FiClock, FiLoader } from "react-icons/fi";
import { useContinueReading } from "@/lib/services/blog-platform";

const APEX_HOST = process.env.NEXT_PUBLIC_BLOG_APEX_HOST || "blog.unila.ac.id";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = diff / 3_600_000;
  if (hours < 1) return `${Math.max(1, Math.round(diff / 60_000))} mnt lalu`;
  if (hours < 24) return `${Math.round(hours)} jam lalu`;
  const days = hours / 24;
  if (days < 7) return `${Math.round(days)} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function ContinueReading() {
  const { data: items = [], isLoading } = useContinueReading(6);

  // Hide entirely when there's nothing in progress — no point showing an
  // empty widget on a fresh user's first dashboard visit.
  if (!isLoading && items.length === 0) return null;

  return (
    <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
      <CardBody className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 inline-flex items-center gap-1.5">
              <FiBookOpen className="w-3.5 h-3.5" /> Lanjutkan Baca
              {isLoading && <FiLoader className="w-3 h-3 animate-spin text-myunila" />}
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {items.length} bacaan belum selesai
            </p>
          </div>
        </div>

        <ul className="space-y-2.5">
          {items.map((p) => (
            <li key={p.id_post}>
              <a
                href={`https://${p.subdomain}.${APEX_HOST}/posts/${p.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {p.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.cover_url}
                    alt={p.judul}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-slate-100"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center text-slate-400">
                    <FiBookOpen className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-myunila line-clamp-1">
                    {p.judul}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <FiClock className="w-2.5 h-2.5" />
                      {timeAgo(p.last_seen_at)}
                    </span>
                    <span>·</span>
                    <span>@{p.subdomain}</span>
                    <span>·</span>
                    <span>{p.waktu_baca_menit} mnt baca</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-myunila to-blue-500"
                        style={{ width: `${p.progress_pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-myunila tabular-nums">{p.progress_pct}%</span>
                  </div>
                </div>
                <FiArrowRight className="w-4 h-4 text-slate-300 group-hover:text-myunila flex-shrink-0 transition-colors" />
              </a>
            </li>
          ))}
        </ul>

        <div className="pt-1 text-right">
          <Link href="/dashboard/blog-platform/reading-history" className="text-[11px] text-slate-500 hover:text-myunila inline-flex items-center gap-1">
            Lihat riwayat baca →
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
