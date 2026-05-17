"use client";

// Admin: Audit Log — cross-user activity timeline.
// Filter by aksi (action) + entitas. Pagination 50/page.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiActivity, FiAlertCircle, FiClock, FiCode, FiLoader, FiUser,
} from "react-icons/fi";
import { useState } from "react";
import { useAdminAuditList } from "@/lib/services/blog-platform";
import type { AdminAuditEntry } from "@/lib/services/blog-platform";

const PAGE_SIZE = 50;

const AKSI_META: Record<string, { label: string; color: string }> = {
  create_post:         { label: "Create Post",         color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" },
  publish_post:        { label: "Publish Post",        color: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400" },
  delete_post:         { label: "Delete Post",         color: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400" },
  update_blog_profile: { label: "Update Blog Profile", color: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400" },
  curate_post:         { label: "Curate Post",         color: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400" },
  claim_subdomain:     { label: "Claim Subdomain",     color: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400" },
};

function aksiMeta(aksi: string) {
  return AKSI_META[aksi] || { label: aksi, color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" };
}

export default function AdminAuditPage() {
  const [aksi, setAksi] = useState("");
  const [entitas, setEntitas] = useState("");
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error } = useAdminAuditList({
    aksi: aksi || undefined,
    entitas: entitas || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const counts = data?.count_aksi ?? {};
  const hasMore = offset + PAGE_SIZE < total;

  const topAksi = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Monitoring</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiActivity className="w-6 h-6 text-myunila" /> Audit Log
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Forensic timeline semua aksi pengguna. Setiap mutation dari handler backend log otomatis ke <code className="font-mono text-myunila">audit.jejak_audit</code>.
          {isLoading && <span className="ml-2 inline-flex items-center gap-1 text-myunila"><FiLoader className="w-3 h-3 animate-spin" /> Memuat…</span>}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      {topAksi.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 uppercase tracking-wider mr-1">30 hari terakhir:</span>
          <button
            onClick={() => { setAksi(""); setOffset(0); }}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              aksi === "" ? "border-myunila bg-myunila/10 text-myunila" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            Semua ({Object.values(counts).reduce((a, b) => a + b, 0)})
          </button>
          {topAksi.map(([a, n]) => {
            const meta = aksiMeta(a);
            return (
              <button
                key={a}
                onClick={() => { setAksi(a); setOffset(0); }}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  aksi === a ? "border-myunila bg-myunila/10 text-myunila" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {meta.label} <span className="text-slate-400">·</span> <span className="tabular-nums">{n}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={entitas}
          onChange={(e) => { setEntitas(e.target.value); setOffset(0); }}
          className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
        >
          <option value="">Semua Entitas</option>
          <option value="post">Post</option>
          <option value="blog">Blog</option>
          <option value="komentar">Komentar</option>
          <option value="tag">Tag</option>
          <option value="kategori">Kategori</option>
          <option value="laporan">Laporan</option>
        </select>
        {(aksi || entitas) && (
          <button
            onClick={() => { setAksi(""); setEntitas(""); setOffset(0); }}
            className="text-xs text-slate-500 hover:text-myunila underline"
          >
            Reset filter
          </button>
        )}
        <span className="ml-auto text-xs text-slate-500 tabular-nums">{total.toLocaleString()} entries</span>
      </div>

      <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Aksi</th>
                  <th className="px-4 py-3">Entitas</th>
                  <th className="px-4 py-3">Pelaku</th>
                  <th className="px-4 py-3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {!isLoading && items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                      Tidak ada entry audit yang cocok filter.
                    </td>
                  </tr>
                )}
                {items.map((e: AdminAuditEntry) => {
                  const meta = aksiMeta(e.aksi);
                  return (
                    <tr key={e.id_jejak_audit} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        <FiClock className="inline w-3 h-3 mr-1" />
                        {new Date(e.created_at).toLocaleString("id-ID", {
                          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${meta.color}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="font-mono text-slate-700 dark:text-slate-300">{e.entitas}</span>
                        {e.id_entitas && (
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{e.id_entitas.slice(0, 8)}…</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {e.id_pengguna_pdut ? (
                          <span className="inline-flex items-center gap-1 font-mono text-slate-600 dark:text-slate-400">
                            <FiUser className="w-3 h-3" />
                            {e.id_pengguna_pdut.slice(0, 8)}…
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">system</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <DetailCell detail={e.detail_json} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

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

function DetailCell({ detail }: { detail: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const keys = Object.keys(detail || {});
  if (keys.length === 0) return <span className="text-slate-300 dark:text-slate-600">—</span>;

  const preview = keys
    .map((k) => {
      const v = detail[k];
      if (Array.isArray(v)) return `${k}: [${v.length}]`;
      if (typeof v === "object" && v !== null) return `${k}: {…}`;
      const s = String(v);
      return `${k}: ${s.length > 40 ? s.slice(0, 40) + "…" : s}`;
    })
    .join(" · ");

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-left text-xs text-slate-600 dark:text-slate-400 hover:text-myunila inline-flex items-center gap-1 max-w-md truncate"
      >
        <FiCode className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{preview}</span>
      </button>
      {open && (
        <pre className="mt-2 p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono overflow-x-auto max-w-md">
          {JSON.stringify(detail, null, 2)}
        </pre>
      )}
    </div>
  );
}
