"use client";

// Komentar moderation page — list pending/approved/spam/rejected + actions.
// Sprint 11: wired to real API via /me/blog/komentar.

import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiBookmark, FiCheck, FiClock, FiLoader, FiMessageSquare, FiTrash2, FiX,
} from "react-icons/fi";
import { useState } from "react";
import {
  useKomentarList, useModerateKomentar, useModerateKomentarBulk, useToggleKomentarPin,
  useKomentarTrash, useSoftDeleteKomentar, useRestoreKomentar, usePermanentDeleteKomentar,
} from "@/lib/services/blog-platform";
import type { ModerationStatus } from "@/lib/services/blog-platform";

type KomentarTab = ModerationStatus | "trash";

const TABS: { value: KomentarTab; label: string; color: string }[] = [
  { value: "pending",  label: "Pending",  color: "amber"   },
  { value: "approved", label: "Approved", color: "emerald" },
  { value: "spam",     label: "Spam",     color: "slate"   },
  { value: "rejected", label: "Rejected", color: "rose"    },
  { value: "trash",    label: "Trash",    color: "rose"    },
];

const TAB_COLOR: Record<string, string> = {
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
};

export default function KomentarPage() {
  const [tab, setTab] = useState<KomentarTab>("pending");
  const isTrash = tab === "trash";
  // Either status-filtered live komentar OR trash list, depending on tab.
  const { data: liveItems = [], isLoading: loadingLive, error: errorLive } =
    useKomentarList(tab as ModerationStatus, !isTrash);
  const { data: trashItems = [], isLoading: loadingTrash, error: errorTrash } =
    useKomentarTrash(isTrash);
  const items = isTrash ? trashItems : liveItems;
  const isLoading = isTrash ? loadingTrash : loadingLive;
  const error = isTrash ? errorTrash : errorLive;

  const moderateMut = useModerateKomentar();
  const bulkMut = useModerateKomentarBulk();
  const pinMut = useToggleKomentarPin();
  const softDeleteMut = useSoftDeleteKomentar();
  const restoreMut = useRestoreKomentar();
  const permaDeleteMut = usePermanentDeleteKomentar();

  const handleSoftDelete = async (id: string) => {
    if (!confirm("Pindah komentar ini ke trash? Bisa di-restore kapan saja.")) return;
    try { await softDeleteMut.mutateAsync(id); }
    catch (e: unknown) { window.alert(`Gagal: ${e instanceof Error ? e.message : "unknown"}`); }
  };
  const handleRestore = async (id: string) => {
    try { await restoreMut.mutateAsync(id); }
    catch (e: unknown) { window.alert(`Gagal restore: ${e instanceof Error ? e.message : "unknown"}`); }
  };
  const handlePermaDelete = async (id: string) => {
    if (!confirm("Hapus permanen komentar ini? TIDAK bisa di-undo.\n\nLike + reply child akan ikut dihapus (cascade).")) return;
    try { await permaDeleteMut.mutateAsync(id); }
    catch (e: unknown) { window.alert(`Gagal: ${e instanceof Error ? e.message : "unknown"}`); }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await pinMut.mutateAsync(id);
    } catch (e: unknown) {
      window.alert(`Gagal pin: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleModerate = async (id: string, newStatus: ModerationStatus) => {
    try {
      await moderateMut.mutateAsync({ id, status: newStatus });
    } catch (e: unknown) {
      window.alert(`Gagal: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id_komentar)));
    }
  };

  const clearSelection = () => setSelected(new Set());

  const handleBulk = async (newStatus: ModerationStatus) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`${newStatus.toUpperCase()} ${ids.length} komentar sekaligus?`)) return;
    try {
      const n = await bulkMut.mutateAsync({ ids, status: newStatus });
      clearSelection();
      // Quick visual feedback dengan alert (toast lib not wired)
      window.alert(`${n} komentar di-${newStatus}.`);
    } catch (e: unknown) {
      window.alert(`Gagal: ${e instanceof Error ? e.message : "unknown"}`);
    }
  };

  // Reset selection saat ganti tab
  const selectTab = (t: KomentarTab) => {
    setTab(t);
    clearSelection();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
            <FiMessageSquare className="w-6 h-6 text-myunila" /> Komentar
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Moderasi komentar yang masuk di post-post kamu.
            {isLoading && <span className="ml-2 inline-flex items-center gap-1 text-myunila"><FiLoader className="w-3 h-3 animate-spin" /> Memuat…</span>}
            {!isLoading && !error && (
              <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> live data
              </span>
            )}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mb-px">
          {TABS.map((t) => {
            const isActive = tab === t.value;
            return (
              <button
                key={t.value}
                onClick={() => selectTab(t.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-myunila text-myunila"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                {t.label}
                {isActive && items.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ${TAB_COLOR[t.color]}`}>
                    {items.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* List */}
      {!isLoading && items.length === 0 && (
        <Card className="shadow-sm border border-slate-200/60 dark:border-slate-800">
          <CardBody className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <FiMessageSquare className="w-7 h-7" />
            </div>
            <p className="text-sm text-slate-500">
              {tab === "pending" && "Tidak ada komentar pending — semua sudah dimoderasi 🎉"}
              {tab === "approved" && "Belum ada komentar approved."}
              {tab === "spam" && "Tidak ada spam."}
              {tab === "rejected" && "Tidak ada komentar rejected."}
              {tab === "trash" && "Trash kosong."}
            </p>
          </CardBody>
        </Card>
      )}

      {/* Bulk action bar — appears when items selected */}
      {items.length > 0 && selected.size > 0 && (
        <div className="sticky top-2 z-20 rounded-xl border border-myunila/30 bg-myunila/10 dark:bg-myunila/20 backdrop-blur p-3 flex items-center gap-3 flex-wrap shadow-md">
          <span className="text-sm font-semibold text-myunila tabular-nums">
            {selected.size} dipilih
          </span>
          <button
            onClick={clearSelection}
            className="text-xs text-slate-600 dark:text-slate-300 hover:underline"
          >
            Clear
          </button>
          <div className="ml-auto flex items-center gap-1.5 flex-wrap">
            {!isTrash && tab !== "approved" && (
              <button
                onClick={() => handleBulk("approved")}
                disabled={bulkMut.isPending}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <FiCheck className="w-3.5 h-3.5" /> Approve {selected.size}
              </button>
            )}
            {!isTrash && tab !== "spam" && (
              <button
                onClick={() => handleBulk("spam")}
                disabled={bulkMut.isPending}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-600 text-white hover:bg-slate-700 disabled:opacity-50"
              >
                <FiTrash2 className="w-3.5 h-3.5" /> Spam {selected.size}
              </button>
            )}
            {!isTrash && tab !== "rejected" && (
              <button
                onClick={() => handleBulk("rejected")}
                disabled={bulkMut.isPending}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
              >
                <FiX className="w-3.5 h-3.5" /> Reject {selected.size}
              </button>
            )}
            {isTrash && (
              <span className="text-xs text-slate-500">Pakai tombol per-baris untuk Restore / Hapus permanen.</span>
            )}
          </div>
        </div>
      )}

      {/* Select-all checkbox */}
      {items.length > 0 && (
        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer hover:text-myunila">
          <input
            type="checkbox"
            checked={selected.size === items.length && items.length > 0}
            onChange={toggleSelectAll}
            className="accent-myunila"
          />
          {selected.size === items.length ? `Unselect semua (${items.length})` : `Select semua (${items.length})`}
        </label>
      )}

      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((k) => (
            <Card key={k.id_komentar} className={`shadow-sm border ${selected.has(k.id_komentar) ? "border-myunila ring-1 ring-myunila/30" : "border-slate-200/60 dark:border-slate-800"}`}>
              <CardBody className="p-4">
                <div className="flex items-start gap-3 flex-wrap">
                  <input
                    type="checkbox"
                    checked={selected.has(k.id_komentar)}
                    onChange={() => toggleSelect(k.id_komentar)}
                    className="mt-1.5 accent-myunila flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {k.nm_komentator || "Anonim"}
                      </span>
                      {k.email_komentator && (
                        <span className="text-slate-400 font-mono">&lt;{k.email_komentator}&gt;</span>
                      )}
                      <span className="text-slate-400 inline-flex items-center gap-1">
                        <FiClock className="w-3 h-3" /> {new Date(k.created_at).toLocaleString("id-ID")}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${TAB_COLOR[TABS.find(t => t.value === k.status_moderasi)?.color || "slate"]}`}>
                        {k.status_moderasi}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {k.isi}
                    </p>
                    <p className="mt-1.5 text-[10px] text-slate-400 font-mono">
                      Post: {k.id_post.slice(0, 8)}…  ·  ID: {k.id_komentar.slice(0, 8)}…
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isTrash ? (
                      <>
                        <button
                          onClick={() => handleRestore(k.id_komentar)}
                          disabled={restoreMut.isPending}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-200 disabled:opacity-50"
                          title="Restore"
                        >
                          <FiCheck className="w-3.5 h-3.5" /> Restore
                        </button>
                        <button
                          onClick={() => handlePermaDelete(k.id_komentar)}
                          disabled={permaDeleteMut.isPending}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                          title="Hapus permanen — tidak bisa di-undo"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </>
                    ) : (
                      <>
                        {tab === "approved" && (
                          <button
                            onClick={() => handleTogglePin(k.id_komentar)}
                            disabled={pinMut.isPending}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 ${
                              k.a_pinned
                                ? "bg-amber-500 text-white hover:bg-amber-600"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 hover:bg-amber-100"
                            }`}
                            title={k.a_pinned ? "Unpin komentar" : "Pin ke atas list public"}
                          >
                            <FiBookmark className={`w-3.5 h-3.5 ${k.a_pinned ? "fill-current" : ""}`} />
                            {k.a_pinned ? "Pinned" : "Pin"}
                          </button>
                        )}
                        {tab !== "approved" && (
                          <button
                            onClick={() => handleModerate(k.id_komentar, "approved")}
                            disabled={moderateMut.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-200 disabled:opacity-50"
                            title="Approve"
                          >
                            <FiCheck className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
                        {tab !== "spam" && (
                          <button
                            onClick={() => handleModerate(k.id_komentar, "spam")}
                            disabled={moderateMut.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 disabled:opacity-50"
                            title="Mark as spam"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" /> Spam
                          </button>
                        )}
                        {tab !== "rejected" && (
                          <button
                            onClick={() => handleModerate(k.id_komentar, "rejected")}
                            disabled={moderateMut.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-200 disabled:opacity-50"
                            title="Reject"
                          >
                            <FiX className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleSoftDelete(k.id_komentar)}
                          disabled={softDeleteMut.isPending}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 disabled:opacity-50"
                          title="Pindah ke trash"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
