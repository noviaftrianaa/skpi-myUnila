"use client";

// Admin: Banned Users — list active bans + ban form + unban.
// Banned users can still read but POST/PUT/DELETE/PATCH return 403.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiCheck, FiClock, FiLoader, FiPlus, FiSearch, FiSlash,
  FiUser, FiX,
} from "react-icons/fi";
import { useState } from "react";
import {
  useBanList, useCreateBan, useUnban, useBlogBySubdomain,
} from "@/lib/services/blog-platform";
import type { BanEntry } from "@/lib/services/blog-platform";

const PAGE_SIZE = 30;

export default function AdminBannedPage() {
  const [activeOnly, setActiveOnly] = useState(true);
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useBanList(activeOnly, PAGE_SIZE, offset);
  const unbanMut = useUnban();
  const [showCreate, setShowCreate] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasMore = offset + PAGE_SIZE < total;

  const handleUnban = async (b: BanEntry) => {
    const who = b.blog_subdomain ? `@${b.blog_subdomain}` : b.id_pengguna_pdut.slice(0, 8);
    if (!confirm(`Unban ${who}?\n\nAlasan ban: ${b.alasan}`)) return;
    setActingId(b.id_ban);
    try {
      await unbanMut.mutateAsync(b.id_ban);
    } catch (e) {
      alert(`Gagal unban: ${(e as Error).message}`);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Moderation</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiSlash className="w-6 h-6 text-rose-600" /> Banned Users
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Block bad actors dari aksi engagement. Banned users tetap bisa baca konten,
          tapi tidak bisa post / komentar / like / follow.
          {isLoading && <span className="ml-2 inline-flex items-center gap-1 text-myunila"><FiLoader className="w-3 h-3 animate-spin" /> Memuat…</span>}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1">
          {[
            { key: true, label: "Active" },
            { key: false, label: "Semua (incl. expired & unbanned)" },
          ].map((t) => (
            <button
              key={String(t.key)}
              onClick={() => { setActiveOnly(t.key); setOffset(0); }}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeOnly === t.key
                  ? "border-myunila text-myunila"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white"
        >
          <FiPlus className="w-4 h-4" /> Ban User
        </button>
      </div>

      {!isLoading && items.length === 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3">
              <FiCheck className="w-7 h-7" />
            </div>
            <p className="text-sm text-slate-500">
              {activeOnly ? "Tidak ada user yang sedang di-ban." : "Belum ada history ban."}
            </p>
          </CardBody>
        </Card>
      )}

      {items.length > 0 && (
        <ul className="space-y-3">
          {items.map((b) => {
            const expired = b.banned_until && new Date(b.banned_until) <= new Date();
            const isUnbanned = !!b.soft_delete;
            const isActive = !isUnbanned && !expired;
            return (
              <Card key={b.id_ban} className="shadow-sm border border-slate-200/60 dark:border-slate-800">
                <CardBody className="p-5 space-y-3">
                  <div className="flex items-start gap-3 flex-wrap">
                    {b.blog_avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.blog_avatar} alt={b.blog_nm_blog ?? ""} className="w-10 h-10 rounded-full" loading="lazy" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {b.blog_subdomain ? (
                          <a
                            href={`https://${b.blog_subdomain}.${process.env.NEXT_PUBLIC_BLOG_APEX_HOST || "blog.unila.ac.id"}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-sm font-semibold text-myunila hover:underline"
                          >
                            @{b.blog_subdomain}
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-slate-500">
                            {b.id_pengguna_pdut.slice(0, 8)}…
                          </span>
                        )}
                        {b.blog_nm_blog && (
                          <span className="text-xs text-slate-500">· {b.blog_nm_blog}</span>
                        )}
                        {isActive && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400">
                            Active
                          </span>
                        )}
                        {expired && !isUnbanned && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-600">
                            Expired
                          </span>
                        )}
                        {isUnbanned && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                            Unbanned
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-800 dark:text-slate-200">
                        <span className="font-semibold">Alasan:</span> {b.alasan}
                      </p>
                      {b.catatan_internal && (
                        <p className="mt-1 text-xs text-slate-500 italic">
                          Catatan internal: {b.catatan_internal}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          Banned {new Date(b.banned_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {b.banned_until ? (
                          <span>· Sampai {new Date(b.banned_until).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        ) : (
                          <span>· Permanent</span>
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <button
                        onClick={() => handleUnban(b)}
                        disabled={actingId === b.id_ban}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {actingId === b.id_ban ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiCheck className="w-3.5 h-3.5" />}
                        Unban
                      </button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </ul>
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

      {showCreate && <CreateBanModal onClose={() => setShowCreate(false)} />}

      <div className="pt-2">
        <Link href="/dashboard/blog-platform" className="text-sm text-slate-500 hover:text-myunila inline-flex items-center gap-1">
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}

// ============================== Create modal ==============================

function CreateBanModal({ onClose }: { onClose: () => void }) {
  const [subdomain, setSubdomain] = useState("");
  const [alasan, setAlasan] = useState("");
  const [duration, setDuration] = useState<"permanent" | "1d" | "7d" | "30d">("permanent");
  const [catatan, setCatatan] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const trimmedSub = subdomain.trim().toLowerCase();
  const lookup = useBlogBySubdomain(trimmedSub);
  const createMut = useCreateBan();

  const found = lookup.data;

  const submit = async () => {
    if (!found) return;
    setSubmitError(null);
    let until: string | null = null;
    if (duration !== "permanent") {
      const ms = duration === "1d" ? 86400_000 : duration === "7d" ? 7 * 86400_000 : 30 * 86400_000;
      until = new Date(Date.now() + ms).toISOString();
    }
    try {
      await createMut.mutateAsync({
        id_pengguna_pdut: found.id_pengguna_pdut,
        alasan: alasan.trim(),
        banned_until: until,
        catatan_internal: catatan.trim() || null,
      });
      onClose();
    } catch (e) {
      setSubmitError((e as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-base inline-flex items-center gap-2">
            <FiSlash className="w-4 h-4 text-rose-600" /> Ban User
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Subdomain User</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                autoFocus
                placeholder="2117051070-mhs"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-myunila/30"
              />
            </div>
          </div>

          {trimmedSub.length >= 2 && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50">
              {lookup.isLoading && (
                <p className="text-xs text-slate-400 inline-flex items-center gap-1.5">
                  <FiLoader className="w-3 h-3 animate-spin" /> Mencari…
                </p>
              )}
              {lookup.error && (
                <p className="text-xs text-rose-600 inline-flex items-center gap-1.5">
                  <FiAlertCircle className="w-3.5 h-3.5" /> Blog tidak ditemukan
                </p>
              )}
              {found && (
                <div className="flex items-start gap-2">
                  {found.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={found.avatar_url} alt={found.nm_tampilan ?? ""} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{found.nm_tampilan}</p>
                    <p className="text-[11px] text-slate-500">{found.nm_blog} · @{found.subdomain}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {found.id_pengguna_pdut.slice(0, 8)}…
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Alasan *</label>
            <textarea
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              rows={2}
              placeholder="Spam comments + harassment"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Akan ditampilkan ke user sebagai 403 message saat mereka coba aksi engagement.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Durasi</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { v: "1d" as const,        l: "1 hari" },
                { v: "7d" as const,        l: "7 hari" },
                { v: "30d" as const,       l: "30 hari" },
                { v: "permanent" as const, l: "Permanen" },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setDuration(opt.v)}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    duration === opt.v
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-rose-400/40"
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Catatan Internal (opsional)</label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={2}
              placeholder="3 reports last week, evidence in #moderation Slack"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-myunila/30"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Hanya admin yang lihat. User tidak melihat catatan ini.
            </p>
          </div>

          {submitError && (
            <p className="text-xs text-rose-600 inline-flex items-center gap-1.5">
              <FiAlertCircle className="w-3.5 h-3.5" /> {submitError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
          <button onClick={onClose} className="px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
            Batal
          </button>
          <button
            onClick={submit}
            disabled={!found || !alasan.trim() || createMut.isPending}
            className="px-3 py-2 rounded-lg text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {createMut.isPending ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSlash className="w-4 h-4" />}
            Ban
          </button>
        </div>
      </div>
    </div>
  );
}
