"use client";

// NotifBell — icon bell di sidebar + mobile header dengan badge unread count.
// Click → dropdown 5 notif terbaru + link "Lihat semua".

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  FiAtSign, FiBell, FiCheck, FiHeart, FiMessageCircle,
  FiUserPlus, FiCornerDownRight, FiLoader, FiFileText, FiMail,
} from "react-icons/fi";
import { useMarkAllNotifRead, useMarkNotifRead, useNotifList, useUnreadNotifCount } from "@/lib/services/blog-platform";
import type { NotifEntry, NotifType } from "@/lib/services/blog-platform";

const TIPE_LABEL: Record<NotifType, string> = {
  like_post: "menyukai post kamu",
  komentar_post: "berkomentar di post kamu",
  reply_komentar: "membalas komentar kamu",
  follow_blog: "mulai mengikuti blog kamu",
  new_post_from_following: "menerbitkan post baru",
  mention_komentar: "menyebut kamu di komentar",
  mention_post: "menyebut kamu di post",
  coauthor_invite: "mengundang kamu sebagai co-author",
  coauthor_responded: "merespon undangan co-author kamu",
};

const TIPE_ICON: Record<NotifType, React.ComponentType<{ className?: string }>> = {
  like_post: FiHeart,
  komentar_post: FiMessageCircle,
  reply_komentar: FiCornerDownRight,
  follow_blog: FiUserPlus,
  new_post_from_following: FiFileText,
  mention_komentar: FiAtSign,
  mention_post: FiAtSign,
  coauthor_invite: FiMail,
  coauthor_responded: FiMail,
};

const TIPE_COLOR: Record<NotifType, string> = {
  like_post: "text-rose-500 bg-rose-50 dark:bg-rose-950/40",
  komentar_post: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
  reply_komentar: "text-purple-500 bg-purple-50 dark:bg-purple-950/40",
  follow_blog: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
  new_post_from_following: "text-myunila bg-myunila/10 dark:bg-myunila/20",
  mention_komentar: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
  mention_post: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
  coauthor_invite: "text-violet-500 bg-violet-50 dark:bg-violet-950/40",
  coauthor_responded: "text-violet-500 bg-violet-50 dark:bg-violet-950/40",
};

interface Props {
  compact?: boolean; // mobile (icon only, smaller padding)
}

export function NotifBell({ compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: unreadCount = 0 } = useUnreadNotifCount();
  const { data: notifData, isLoading } = useNotifList(false, 5, 0);
  const markRead = useMarkNotifRead();
  const markAllRead = useMarkAllNotifRead();

  const items = notifData?.items ?? [];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleClick = (n: NotifEntry) => {
    if (!n.sudah_dibaca) markRead.mutate(n.id_notifikasi);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifikasi${unreadCount > 0 ? ` (${unreadCount} belum dibaca)` : ""}`}
        className={`relative inline-flex items-center justify-center rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
          compact ? "w-9 h-9" : "w-9 h-9"
        }`}
      >
        <FiBell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-40 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Notifikasi</p>
              {unreadCount > 0 && (
                <p className="text-[11px] text-slate-500">{unreadCount} belum dibaca</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="text-[11px] text-myunila hover:underline disabled:opacity-50 inline-flex items-center gap-1"
              >
                <FiCheck className="w-3 h-3" /> Tandai semua
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <FiLoader className="w-4 h-4 animate-spin mx-auto mb-1" /> Memuat…
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                <FiBell className="w-6 h-6 mx-auto mb-2 opacity-50" />
                Belum ada notifikasi.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((n) => {
                  const Icon = TIPE_ICON[n.tipe];
                  const label = TIPE_LABEL[n.tipe] ?? n.tipe;
                  const url = n.url_target || "/dashboard/blog-platform";
                  return (
                    <li key={n.id_notifikasi}>
                      <Link
                        href={url}
                        onClick={() => handleClick(n)}
                        className={`flex gap-3 px-4 py-3 transition-colors ${
                          n.sudah_dibaca
                            ? "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            : "bg-myunila/5 hover:bg-myunila/10 dark:bg-myunila/10"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${TIPE_COLOR[n.tipe]}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                            <span className="font-semibold">{n.aktor_nama || "Seseorang"}</span>{" "}
                            <span className="text-slate-500">{label}</span>
                          </p>
                          {n.judul_ref && (
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                              &ldquo;{n.judul_ref}&rdquo;
                            </p>
                          )}
                          <p className="mt-0.5 text-[10px] text-slate-400">{relativeTime(n.created_at)}</p>
                        </div>
                        {!n.sudah_dibaca && (
                          <span className="self-center w-2 h-2 rounded-full bg-myunila flex-shrink-0" aria-label="belum dibaca" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/dashboard/blog-platform/notifications"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-center text-xs font-medium text-myunila hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Lihat semua notifikasi →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} mnt lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} hari lalu`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
