"use client";

// Admin: Klaim Subdomain — moderation queue.
// Setiap successful claim di-log oleh subdomain handler. Admin bisa override status.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiCheck, FiClock, FiInfo, FiLoader, FiUser, FiX,
} from "react-icons/fi";
import { useState } from "react";
import { useAdminKlaimList, useModerateKlaim } from "@/lib/services/blog-platform";
import type { KlaimEntry, KlaimStatus } from "@/lib/services/blog-platform";

const STATUS_TABS: { value: "" | KlaimStatus; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "auto_approved", label: "Auto-Approved" },
  { value: "manual_review", label: "Manual Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_PILL: Record<KlaimStatus, string> = {
  pending: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  auto_approved: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
  manual_review: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",
  approved: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",
  rejected: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400",
};

const PAGE_SIZE = 30;
const APEX_HOST = process.env.NEXT_PUBLIC_BLOG_APEX_HOST || "blog.unila.ac.id";

export default function AdminKlaimPage() {
  const [tab, setTab] = useState<"" | KlaimStatus>("");
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useAdminKlaimList(tab || undefined, PAGE_SIZE, offset);
  const moderateMut = useModerateKlaim();
  const [actingId, setActingId] = useState<string | null>(null);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const counts = data?.count_status ?? { pending: 0, auto_approved: 0, manual_review: 0, approved: 0, rejected: 0 };
  const hasMore = offset + PAGE_SIZE < total;

  const handleModerate = async (k: KlaimEntry, newStatus: KlaimStatus) => {
    let catatan: string | undefined;
    if (newStatus === "rejected") {
      const c = prompt("Alasan reject klaim ini (opsional):", "");
      if (c === null) return;
      catatan = c.trim() || undefined;
    }
    setActingId(k.id_klaim_subdomain);
    try {
      await moderateMut.mutateAsync({ id: k.id_klaim_subdomain, input: { status: newStatus, catatan } });
    } catch (e) {
      alert(`Gagal: ${(e as Error).message}`);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Moderation</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiCheck className="w-6 h-6 text-myunila" /> Klaim Subdomain
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Setiap successful subdomain claim di-log di sini. Override status untuk flag suspicious atau audit purposes.
          {isLoading && <span className="ml-2 inline-flex items-center gap-1 text-myunila"><FiLoader className="w-3 h-3 animate-spin" /> Memuat…</span>}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-hide">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value || "all"}
            onClick={() => { setTab(t.value); setOffset(0); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === t.value ? "border-myunila text-myunila" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            {t.label}
            {t.value && counts[t.value as KlaimStatus] > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600">
                {counts[t.value as KlaimStatus]}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500 tabular-nums px-3 py-2.5">{total} entries</span>
      </div>

      {!isLoading && items.length === 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <FiInfo className="w-7 h-7" />
            </div>
            <p className="text-sm text-slate-500">
              {tab === "" ? "Belum ada klaim tercatat. Setelah user claim subdomain via dashboard, entry akan muncul di sini." : `Tidak ada klaim dengan status ${tab}.`}
            </p>
          </CardBody>
        </Card>
      )}

      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((k) => {
            const acting = actingId === k.id_klaim_subdomain;
            return (
              <Card key={k.id_klaim_subdomain} className="shadow-sm border border-slate-200/60 dark:border-slate-800">
                <CardBody className="p-5 space-y-3">
                  <div className="flex items-start gap-3 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${STATUS_PILL[k.status]}`}>
                      {k.status}
                    </span>
                    {k.role_kode && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {k.role_kode}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {new Date(k.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {k.id_pengguna_pdut && (
                      <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                        <FiUser className="w-3 h-3" /> {k.id_pengguna_pdut.slice(0, 8)}…
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <a
                        href={`https://${k.subdomain_diminta}.${APEX_HOST}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-base font-semibold text-myunila hover:underline"
                      >
                        {k.subdomain_diminta}.{APEX_HOST}
                      </a>
                      {k.alasan_subdomain && (
                        <p className="mt-1 text-xs text-slate-500 italic">Alasan user: &ldquo;{k.alasan_subdomain}&rdquo;</p>
                      )}
                    </div>
                  </div>

                  {k.validasi_json && Object.keys(k.validasi_json).length > 0 && (
                    <details className="text-[11px]">
                      <summary className="cursor-pointer text-slate-500 hover:text-myunila inline-flex items-center gap-1">
                        <FiInfo className="w-3 h-3" /> Hasil 4-Layer Validation
                      </summary>
                      <pre className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2 font-mono text-slate-700 dark:text-slate-300 overflow-x-auto max-w-full whitespace-pre-wrap border border-slate-100 dark:border-slate-700">
                        {JSON.stringify(k.validasi_json, null, 2)}
                      </pre>
                    </details>
                  )}

                  {k.catatan_moderator && (
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-xs border border-amber-200 dark:border-amber-900/40">
                      <p className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-0.5">Catatan Moderator</p>
                      <p className="text-amber-900 dark:text-amber-200">{k.catatan_moderator}</p>
                      {k.tgl_diputuskan && (
                        <p className="text-[10px] text-amber-600 mt-1">
                          {new Date(k.tgl_diputuskan).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {k.status !== "manual_review" && (
                      <button
                        onClick={() => handleModerate(k, "manual_review")}
                        disabled={acting}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 disabled:opacity-50"
                      >
                        <FiAlertCircle className="w-3.5 h-3.5" /> Flag for review
                      </button>
                    )}
                    {k.status !== "approved" && (
                      <button
                        onClick={() => handleModerate(k, "approved")}
                        disabled={acting}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <FiCheck className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {k.status !== "rejected" && (
                      <button
                        onClick={() => handleModerate(k, "rejected")}
                        disabled={acting}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                      >
                        <FiX className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                    {acting && <FiLoader className="w-3.5 h-3.5 text-myunila animate-spin" />}
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
        <Link href="/dashboard/blog-platform" className="text-sm text-slate-500 hover:text-myunila inline-flex items-center gap-1">
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
