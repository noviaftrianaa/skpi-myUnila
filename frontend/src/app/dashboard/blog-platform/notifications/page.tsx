"use client";

// Notifications page — full list dengan tabs (semua / belum dibaca).
// Click row → mark read + redirect ke url_target.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiAtSign, FiBell, FiBellOff, FiCheck, FiHeart, FiMail, FiMessageCircle, FiSmartphone,
  FiUserPlus, FiCornerDownRight, FiLoader, FiAlertCircle, FiFileText,
  FiSettings, FiChevronDown, FiChevronUp,
} from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import {
  ALL_NOTIF_TIPES,
  useMarkAllNotifRead, useMarkNotifRead, useNotifList, useUnreadNotifCount,
  useNotifPreferences, useUpdateNotifPreferences,
  pushService, isPushSupported, pushPermission, type PushSubscriptionRow,
} from "@/lib/services/blog-platform";
import type { NotifEntry, NotifType } from "@/lib/services/blog-platform";

const PAGE_SIZE = 30;

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
  weekly_digest: "digest email mingguan",
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
  weekly_digest: FiMail,
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
  weekly_digest: "text-myunila bg-myunila/10 dark:bg-myunila/20",
};

type Tab = "all" | "unread";

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [offset, setOffset] = useState(0);
  const [showPrefs, setShowPrefs] = useState(false);
  const { data, isLoading, error } = useNotifList(tab === "unread", PAGE_SIZE, offset);
  const { data: unreadCount = 0 } = useUnreadNotifCount();
  const { data: prefs } = useNotifPreferences();
  const updatePrefs = useUpdateNotifPreferences();
  const markRead = useMarkNotifRead();
  const markAllRead = useMarkAllNotifRead();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasMore = offset + PAGE_SIZE < total;

  // Local draft state untuk toggle switches (sync dari server, debounce save).
  const [draft, setDraft] = useState<Set<NotifType>>(new Set());
  useEffect(() => {
    if (prefs) setDraft(new Set(prefs.muted_tipes));
  }, [prefs]);

  const isMuted = (t: NotifType) => draft.has(t);
  const toggleTipe = (t: NotifType) => {
    const next = new Set(draft);
    if (next.has(t)) next.delete(t); else next.add(t);
    setDraft(next);
    updatePrefs.mutate(Array.from(next));
  };

  const mutedCount = useMemo(() => draft.size, [draft]);

  const handleClick = (n: NotifEntry) => {
    if (!n.sudah_dibaca) markRead.mutate(n.id_notifikasi);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiBell className="w-6 h-6 text-myunila" /> Notifikasi
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Update tentang post, komentar, dan follower kamu.
          {unreadCount > 0 && <span className="ml-2 inline-flex items-center gap-1 text-rose-600 text-xs font-semibold">{unreadCount} belum dibaca</span>}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      {/* Phase BA — Web Push subscription panel */}
      <PushSubscriptionPanel />

      {/* Preferences panel */}
      <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
        <CardBody className="p-0">
          <button
            onClick={() => setShowPrefs((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <FiSettings className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Pengaturan Notifikasi</p>
                <p className="text-xs text-slate-500">
                  {mutedCount === 0
                    ? "Semua tipe notifikasi aktif"
                    : `${mutedCount} tipe di-mute · ${ALL_NOTIF_TIPES.length - mutedCount} aktif`}
                </p>
              </div>
            </div>
            {showPrefs ? <FiChevronUp className="w-4 h-4 text-slate-400" /> : <FiChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {showPrefs && (
            <div className="border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {ALL_NOTIF_TIPES.map((t) => {
                const Icon = TIPE_ICON[t.value];
                const muted = isMuted(t.value);
                return (
                  <div key={t.value} className="flex items-center gap-3 px-5 py-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${muted ? "bg-slate-100 dark:bg-slate-800 text-slate-400" : TIPE_COLOR[t.value]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${muted ? "text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>{t.label}</p>
                      <p className="text-xs text-slate-500">{t.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleTipe(t.value)}
                      disabled={updatePrefs.isPending}
                      role="switch"
                      aria-checked={!muted}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 disabled:opacity-50 ${
                        muted ? "bg-slate-200 dark:bg-slate-700" : "bg-myunila"
                      }`}
                      title={muted ? "Klik untuk aktifkan" : "Klik untuk mute"}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          muted ? "translate-x-0.5" : "translate-x-5"
                        }`}
                      />
                    </button>
                    {muted && (
                      <FiBellOff className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" aria-label="muted" />
                    )}
                  </div>
                );
              })}
              <div className="px-5 py-2.5 text-[11px] text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
                Perubahan tersimpan otomatis. Notifikasi yang sudah masuk tidak terpengaruh oleh pengaturan baru.
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Tabs + actions */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1">
          {([
            { key: "all", label: "Semua" },
            { key: "unread", label: `Belum dibaca${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
          ] as { key: Tab; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setOffset(0); }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-myunila text-myunila"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-xs text-myunila hover:underline disabled:opacity-50 inline-flex items-center gap-1"
          >
            <FiCheck className="w-3 h-3" /> Tandai semua sudah dibaca
          </button>
        )}
      </div>

      {isLoading && (
        <div className="py-12 text-center text-slate-400 text-sm">
          <FiLoader className="w-5 h-5 animate-spin mx-auto mb-2" /> Memuat notifikasi…
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <FiBell className="w-7 h-7" />
            </div>
            <p className="text-sm text-slate-500">
              {tab === "unread" ? "Tidak ada notifikasi yang belum dibaca." : "Belum ada notifikasi."}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Kamu akan terima notif saat ada yang like, comment, atau follow.
            </p>
          </CardBody>
        </Card>
      )}

      {items.length > 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="p-0">
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
                      className={`flex gap-3 px-5 py-3.5 transition-colors ${
                        n.sudah_dibaca
                          ? "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          : "bg-myunila/5 hover:bg-myunila/10 dark:bg-myunila/10"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${TIPE_COLOR[n.tipe]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">
                          <span className="font-semibold">{n.aktor_nama || "Seseorang"}</span>{" "}
                          <span className="text-slate-500">{label}</span>
                        </p>
                        {n.judul_ref && (
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                            &ldquo;{n.judul_ref}&rdquo;
                          </p>
                        )}
                        <p className="mt-1 text-[11px] text-slate-400">
                          {new Date(n.created_at).toLocaleString("id-ID", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {!n.sudah_dibaca && (
                        <span className="self-center w-2 h-2 rounded-full bg-myunila flex-shrink-0" aria-label="belum dibaca" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
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

// =============================================================================
// PushSubscriptionPanel — Phase BA web push enable/disable UI.
//
// - Hidden saat browser tidak support service worker / push (Safari iOS lama dst).
// - Render status: granted/default/denied + jumlah device aktif + tombol toggle.
// - Test send tombol untuk verify push masuk ke browser ini.
// =============================================================================
function PushSubscriptionPanel() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subs, setSubs] = useState<PushSubscriptionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported(isPushSupported());
    setPermission(pushPermission());
    if (isPushSupported()) {
      pushService.list().then(setSubs).catch(() => setSubs([]));
    }
  }, []);

  if (!supported) {
    return (
      <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
        <CardBody className="p-4 flex items-start gap-3">
          <FiSmartphone className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-500">
            Browser ini tidak support push notification. Pakai Chrome/Edge/Firefox terbaru di desktop atau Android.
          </div>
        </CardBody>
      </Card>
    );
  }

  const handleEnable = async () => {
    setLoading(true); setError(null);
    try {
      const sub = await pushService.subscribe();
      if (!sub) {
        setError("Permission ditolak. Buka settings browser → site permissions → notifications → Allow.");
        setPermission(pushPermission());
      } else {
        const fresh = await pushService.list();
        setSubs(fresh);
        setPermission("granted");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal enable push");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm("Matikan push notification di device ini?")) return;
    setLoading(true); setError(null);
    try {
      await pushService.unsubscribe();
      const fresh = await pushService.list();
      setSubs(fresh);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal disable push");
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setError(null);
    try {
      const r = await pushService.testSend();
      window.alert(`Test push terkirim: ${r.sent} device.${r.deleted_stale > 0 ? ` (${r.deleted_stale} stale di-cleanup)` : ""}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Test send gagal");
    }
  };

  const handleRemoveDevice = async (id: string) => {
    if (!confirm("Hapus device ini dari daftar push?")) return;
    try {
      await pushService.unsubscribeByID(id);
      setSubs(await pushService.list());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal hapus device");
    }
  };

  const hasActive = subs.length > 0 && permission === "granted";

  return (
    <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
      <CardBody className="p-4 space-y-3">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="w-9 h-9 rounded-full bg-myunila/10 flex items-center justify-center text-myunila flex-shrink-0">
            <FiSmartphone className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Push Notification</p>
              {hasActive && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  Aktif · {subs.length} device
                </span>
              )}
              {permission === "denied" && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                  Diblokir
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Notif real-time ke browser ini saat ada like/komentar/follower baru — walau dashboard tidak open.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {hasActive ? (
              <>
                <button
                  onClick={handleTest}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-myunila/10 text-myunila hover:bg-myunila/20 disabled:opacity-50"
                >
                  Test
                </button>
                <button
                  onClick={handleDisable}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-200 disabled:opacity-50"
                >
                  Disable
                </button>
              </>
            ) : (
              <button
                onClick={handleEnable}
                disabled={loading || permission === "denied"}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-myunila text-white hover:bg-myunila/90 disabled:opacity-50"
                title={permission === "denied" ? "Browser memblokir notifikasi — atur di settings browser dulu" : ""}
              >
                {loading ? "Menyiapkan…" : "Enable"}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-2.5 text-xs text-rose-900 dark:text-rose-300 flex items-start gap-2">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {subs.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Device terdaftar</p>
            {subs.map((s) => (
              <div key={s.id_subscription} className="flex items-center gap-2 text-xs">
                <FiSmartphone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="flex-1 truncate text-slate-600 dark:text-slate-400" title={s.user_agent || ""}>
                  {s.user_agent || "Unknown device"}
                </span>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(s.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </span>
                <button
                  onClick={() => handleRemoveDevice(s.id_subscription)}
                  className="text-[10px] text-rose-500 hover:underline"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
