"use client";

// Followers list — pembaca yang follow blog kamu.
// id_pengguna_pdut hanya UUID — full profile lookup belum cross-DB ke pdut.man_akses.pengguna.

import { Card, CardBody } from "@heroui/react";
import { FiAlertCircle, FiLoader, FiUserCheck, FiUsers } from "react-icons/fi";
import { useState } from "react";
import { useFollowerList, useMyBlog } from "@/lib/services/blog-platform";

const PAGE_SIZE = 50;

export default function FollowersPage() {
  const { data: blog } = useMyBlog();
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error } = useFollowerList(PAGE_SIZE, offset, !!blog);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasMore = offset + PAGE_SIZE < total;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiUsers className="w-6 h-6 text-myunila" /> Followers
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Pembaca yang follow blog <strong>{blog?.subdomain || "kamu"}</strong>.
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

      {/* Stat summary */}
      <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800 bg-gradient-to-br from-myunila/5 to-transparent">
        <CardBody className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-myunila/10 text-myunila flex items-center justify-center">
              <FiUserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">{total.toLocaleString()}</p>
              <p className="text-xs text-slate-500">total followers</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* List */}
      {!isLoading && items.length === 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <FiUsers className="w-7 h-7" />
            </div>
            <p className="text-sm text-slate-500">
              Belum ada follower. Bagikan link blog kamu di media sosial untuk dapat pembaca pertama!
            </p>
            {blog && (
              <a
                href={`https://${blog.subdomain}.blog.unila.ac.id`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-myunila hover:underline"
              >
                {blog.subdomain}.blog.unila.ac.id →
              </a>
            )}
          </CardBody>
        </Card>
      )}

      {items.length > 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((f) => (
                <li key={f.id_follower} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-myunila/10 text-myunila flex items-center justify-center font-semibold">
                    {f.id_pengguna_pdut.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-slate-900 dark:text-slate-100 truncate">
                      User {f.id_pengguna_pdut.slice(0, 8)}…
                    </p>
                    <p className="text-xs text-slate-500">
                      Follow sejak {new Date(f.tgl_follow).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            {(offset > 0 || hasMore) && (
              <div className="border-t border-slate-200 dark:border-slate-800 px-5 py-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 tabular-nums">
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
          </CardBody>
        </Card>
      )}

      <div className="rounded-lg border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 p-4 text-xs text-amber-900 dark:text-amber-300">
        <strong>Catatan:</strong> Saat ini hanya ID follower yang ditampilkan. Resolve nama & avatar penuh perlu cross-DB
        lookup ke <code className="font-mono">pdut.man_akses.pengguna</code> (Phase 2 — dual connection).
      </div>
    </div>
  );
}
