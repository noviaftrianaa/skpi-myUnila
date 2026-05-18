"use client";

// Banned Commenter — per-blog ban management (Phase BF).
// Beda dengan /admin/banned (global engagement ban Phase AO): di sini owner
// block specific user dari komentar di blog miliknya saja.

import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiClock, FiLoader, FiRotateCcw, FiSlash, FiUser,
} from "react-icons/fi";
import Image from "next/image";
import { useState } from "react";
import {
  useBannedCommenterList, useBanCommenter, useUnbanCommenter,
} from "@/lib/services/blog-platform";

export default function BannedCommenterPage() {
  const { data, isLoading, error } = useBannedCommenterList(100, 0);
  const banMut = useBanCommenter();
  const unbanMut = useUnbanCommenter();

  const [form, setForm] = useState({ id_pengguna_pdut: "", alasan: "" });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id_pengguna_pdut.trim() || !form.alasan.trim()) {
      window.alert("Isi UUID user dan alasan dulu.");
      return;
    }
    try {
      await banMut.mutateAsync({
        id_pengguna_pdut: form.id_pengguna_pdut.trim(),
        alasan: form.alasan.trim(),
      });
      setForm({ id_pengguna_pdut: "", alasan: "" });
    } catch (e: unknown) {
      window.alert(`Gagal: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };

  const handleUnban = async (id: string, label: string) => {
    if (!confirm(`Cabut ban untuk ${label}?`)) return;
    try {
      await unbanMut.mutateAsync(id);
    } catch (e: unknown) {
      window.alert(`Gagal: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiSlash className="w-6 h-6 text-rose-600" /> Banned Commenter
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Block user dari komentar di blog kamu. User tetap bisa komentar di blog lain.
          {isLoading && <span className="ml-2 inline-flex items-center gap-1 text-myunila"><FiLoader className="w-3 h-3 animate-spin" /> Memuat…</span>}
          {!isLoading && !error && (
            <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {total} user di-ban
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

      {/* Quick add form */}
      <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
        <CardBody className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <FiSlash className="w-4 h-4 text-rose-500" /> Tambah Ban Manual
          </div>
          <form onSubmit={handleAdd} className="grid sm:grid-cols-[1fr,1fr,auto] gap-2">
            <input
              type="text"
              placeholder="id_pengguna_pdut (UUID)"
              value={form.id_pengguna_pdut}
              onChange={(e) => setForm({ ...form, id_pengguna_pdut: e.target.value })}
              className="font-mono text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-myunila focus:ring-1 focus:ring-myunila outline-none"
            />
            <input
              type="text"
              placeholder="Alasan (wajib)"
              value={form.alasan}
              onChange={(e) => setForm({ ...form, alasan: e.target.value })}
              className="text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-myunila focus:ring-1 focus:ring-myunila outline-none"
            />
            <button
              type="submit"
              disabled={banMut.isPending}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <FiSlash className="w-4 h-4" />
              {banMut.isPending ? "Banning…" : "Ban"}
            </button>
          </form>
          <p className="text-[11px] text-slate-400">
            Cara paling gampang: dari halaman <a href="/dashboard/blog-platform/komentar" className="text-myunila hover:underline">Moderasi Komentar</a>,
            klik tombol Ban di sebelah komentar yang nakal — UUID auto-terisi.
          </p>
        </CardBody>
      </Card>

      {/* List */}
      {!isLoading && items.length === 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <FiSlash className="w-7 h-7" />
            </div>
            <p className="text-sm text-slate-500">
              Belum ada user yang di-ban dari blog ini.
            </p>
          </CardBody>
        </Card>
      )}

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((bc) => {
            const label = bc.nm_komentator || bc.blog_subdomain || bc.id_pengguna_pdut.slice(0, 8) + "…";
            return (
              <Card key={bc.id_banned_commenter} className="shadow-sm border border-slate-200/60 dark:border-slate-800">
                <CardBody className="p-4 flex items-start gap-3 flex-wrap">
                  {bc.blog_avatar ? (
                    <Image src={bc.blog_avatar} alt={label} width={40} height={40} className="rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <FiUser className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{label}</span>
                      {bc.blog_subdomain && (
                        <a
                          href={`https://${bc.blog_subdomain}.blog.unila.ac.id`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-myunila hover:underline"
                        >
                          @{bc.blog_subdomain}
                        </a>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Alasan: </span>{bc.alasan}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400 inline-flex items-center gap-1">
                      <FiClock className="w-3 h-3" /> {new Date(bc.dibanned_pada).toLocaleString("id-ID")}
                      <span className="font-mono ml-2">{bc.id_pengguna_pdut.slice(0, 8)}…</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnban(bc.id_banned_commenter, label)}
                    disabled={unbanMut.isPending}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-200 disabled:opacity-50"
                    title="Cabut ban"
                  >
                    <FiRotateCcw className="w-3.5 h-3.5" /> Unban
                  </button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
