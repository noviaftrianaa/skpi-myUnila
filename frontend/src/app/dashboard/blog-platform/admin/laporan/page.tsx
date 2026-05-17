"use client";

// Admin: Laporan Post — moderation queue.
// Filter status (pending/reviewed/actioned/dismissed) + action buttons.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiCheck, FiClock, FiFlag, FiLoader, FiX, FiExternalLink, FiUser,
} from "react-icons/fi";
import { useState } from "react";
import { useLaporanList, useModerateLaporan } from "@/lib/services/blog-platform";
import type { LaporanEntry, LaporanStatus } from "@/lib/services/blog-platform";

const PAGE_SIZE = 20;
const APEX_HOST = process.env.NEXT_PUBLIC_BLOG_APEX_HOST || "blog.unila.ac.id";

const ALASAN_LABEL: Record<string, string> = {
  spam: "Spam / promosi",
  pornografi: "Pornografi",
  kekerasan: "Kekerasan",
  ujaran_kebencian: "Ujaran kebencian",
  hoax: "Hoax",
  plagiat: "Plagiat",
  hak_cipta: "Hak cipta",
  lainnya: "Lainnya",
};

const STATUS_LABEL: Record<LaporanStatus, string> = {
  pending: "Menunggu Review",
  reviewed: "Sudah Direview",
  actioned: "Ditindaklanjuti",
  dismissed: "Diabaikan",
};

const STATUS_COLOR: Record<LaporanStatus, string> = {
  pending: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 ring-amber-200 dark:ring-amber-900",
  reviewed: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 ring-blue-200 dark:ring-blue-900",
  actioned: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 ring-rose-200 dark:ring-rose-900",
  dismissed: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-slate-200 dark:ring-slate-700",
};

export default function AdminLaporanPage() {
  const [tab, setTab] = useState<LaporanStatus>("pending");
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useLaporanList(tab, PAGE_SIZE, offset);
  const moderate = useModerateLaporan();
  const [actingId, setActingId] = useState<string | null>(null);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const counts = data?.count_status ?? { pending: 0, reviewed: 0, actioned: 0, dismissed: 0 };
  const hasMore = offset + PAGE_SIZE < total;

  const handleModerate = async (l: LaporanEntry, status: Exclude<LaporanStatus, "pending">) => {
    let tindakan: string | undefined;
    if (status === "actioned") {
      const t = prompt("Tindakan yang diambil (max 60 char):\n\nContoh: 'Post di-soft-delete', 'Warning ke author', 'Suspend blog 7 hari'", "");
      if (t === null) return; // cancel
      tindakan = t.slice(0, 60) || undefined;
    } else if (status === "dismissed") {
      const t = prompt("Alasan dismiss (opsional, max 60 char):", "Laporan tidak valid");
      if (t === null) return;
      tindakan = t.slice(0, 60) || undefined;
    }
    setActingId(l.id_laporan_post);
    try {
      await moderate.mutateAsync({ id: l.id_laporan_post, input: { status, tindakan } });
    } catch (e) {
      alert(`Gagal moderate: ${(e as Error).message}`);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Moderation</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiFlag className="w-6 h-6 text-rose-600" /> Laporan Post
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Antrian laporan konten dari pembaca. Pilih tindakan yang sesuai untuk setiap laporan.
          {isLoading && <span className="ml-2 inline-flex items-center gap-1 text-myunila"><FiLoader className="w-3 h-3 animate-spin" /> Memuat…</span>}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
        {(["pending", "reviewed", "actioned", "dismissed"] as LaporanStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => { setTab(s); setOffset(0); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === s
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            {STATUS_LABEL[s]}
            {counts[s] > 0 && (
              <span className={`ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                tab === s ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400" : "bg-slate-100 dark:bg-slate-800 text-slate-600"
              }`}>
                {counts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {!isLoading && items.length === 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <FiFlag className="w-7 h-7" />
            </div>
            <p className="text-sm text-slate-500">
              Tidak ada laporan dengan status &ldquo;{STATUS_LABEL[tab]}&rdquo;.
            </p>
          </CardBody>
        </Card>
      )}

      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((l) => {
            const postUrl = `https://${l.blog_subdomain}.${APEX_HOST}/posts/${l.post_slug}`;
            const acting = actingId === l.id_laporan_post;
            return (
              <Card key={l.id_laporan_post} className="shadow-sm border border-slate-200/60 dark:border-slate-800">
                <CardBody className="p-5 space-y-3">
                  <div className="flex items-start gap-3 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ring-1 ${STATUS_COLOR[l.status]}`}>
                      {STATUS_LABEL[l.status]}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-[11px] font-semibold">
                      <FiFlag className="w-3 h-3" /> {ALASAN_LABEL[l.alasan] || l.alasan}
                    </span>
                    <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {new Date(l.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {l.id_pelapor_pdut && (
                      <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                        <FiUser className="w-3 h-3" />
                        {l.id_pelapor_pdut.slice(0, 8)}…
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <a
                        href={postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-slate-900 dark:text-slate-100 hover:text-myunila transition-colors inline-flex items-center gap-1.5"
                      >
                        {l.post_judul} <FiExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-mono">{l.blog_subdomain}</span> · {l.blog_nama}{" "}
                        <span className={`ml-2 text-[10px] font-semibold uppercase ${
                          l.post_status === "published" ? "text-emerald-600" : "text-amber-600"
                        }`}>· {l.post_status}</span>
                      </p>
                      {l.post_ringkasan && (
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1">
                          &ldquo;{l.post_ringkasan}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {l.detail && (
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Detail dari pelapor</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{l.detail}</p>
                    </div>
                  )}

                  {l.tindakan && (
                    <div className="rounded-lg bg-myunila/5 px-3 py-2 text-xs border border-myunila/20">
                      <p className="text-[10px] uppercase tracking-wider text-myunila mb-0.5">Tindakan diambil</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{l.tindakan}</p>
                      {l.tgl_diputuskan && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(l.tgl_diputuskan).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions — only for pending/reviewed */}
                  {(l.status === "pending" || l.status === "reviewed") && (
                    <div className="flex items-center gap-2 pt-2 flex-wrap">
                      {l.status === "pending" && (
                        <button
                          onClick={() => handleModerate(l, "reviewed")}
                          disabled={acting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 disabled:opacity-50"
                        >
                          <FiCheck className="w-3.5 h-3.5" /> Tandai Direview
                        </button>
                      )}
                      <button
                        onClick={() => handleModerate(l, "actioned")}
                        disabled={acting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                      >
                        <FiFlag className="w-3.5 h-3.5" /> Tindaklanjuti
                      </button>
                      <button
                        onClick={() => handleModerate(l, "dismissed")}
                        disabled={acting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                      >
                        <FiX className="w-3.5 h-3.5" /> Abaikan
                      </button>
                      {acting && <FiLoader className="w-3.5 h-3.5 text-myunila animate-spin" />}
                    </div>
                  )}
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
