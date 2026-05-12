"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

/**
 * Modal popup pengumuman saat user buka portal pertama kali.
 *
 * Trigger: pengumuman dgn `is_pinned=true` + `status=published` + belum expired.
 * Behavior:
 *   - Single pinned: tampil 1 card spotlight
 *   - Multiple pinned (≤ MAX_PINNED): list view scrollable, masing-masing punya
 *     dismiss button + "Baca" link
 *   - Global checkbox "Jangan tampilkan semua lagi" — dismiss all permanent
 *   - Cooldown 30 menit (kalau cuma tutup tanpa ceklist) → muncul lagi
 *   - On logout: cooldown tracking di-clear (lihat AuthContext.logout)
 */
interface PopupItem {
  id_pengumuman: string;
  slug?: string;
  judul: string;
  ringkasan?: string;
  isi?: string;
  banner_url?: string;
  nama_kategori?: string;
  tgl_terbit?: string;
  author?: string;
  is_pinned?: boolean;
  is_featured?: boolean;
}

const MAX_PINNED = 5;
const COOLDOWN_MS = 30 * 60 * 1000;

export default function PengumumanPopupModal({
  items,
}: {
  items: PopupItem[];
}) {
  const [open, setOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Eligible: pinned + tidak permanently dismissed + cooldown sudah lewat.
  // Limit ke MAX_PINNED supaya gak overwhelming kalau banyak pinned.
  const eligible = useMemo(() => {
    if (typeof window === "undefined") return [];
    return items
      .filter((it) => it.is_pinned)
      .filter((it) => {
        // Permanent dismiss (checkbox) → skip selamanya
        if (localStorage.getItem(`pengumuman_dismissed_${it.id_pengumuman}`)) return false;
        // Permanent dismiss "all pinned" — global flag
        if (localStorage.getItem("pengumuman_dismissed_all_pinned")) return false;
        // Cooldown
        const lastShown = localStorage.getItem(`pengumuman_last_shown_${it.id_pengumuman}`);
        if (lastShown) {
          const elapsed = Date.now() - parseInt(lastShown, 10);
          if (elapsed < COOLDOWN_MS) return false;
        }
        return true;
      })
      .slice(0, MAX_PINNED);
  }, [items]);

  // Filter ke item yang belum di-dismiss session ini (handle close per-item)
  const visible = useMemo(
    () => eligible.filter((it) => !dismissedIds.includes(it.id_pengumuman)),
    [eligible, dismissedIds]
  );

  useEffect(() => {
    if (eligible.length === 0) return;
    const t = setTimeout(() => {
      setOpen(true);
      // Set last shown timestamp utk SEMUA eligible item
      eligible.forEach((it) => {
        localStorage.setItem(`pengumuman_last_shown_${it.id_pengumuman}`, String(Date.now()));
      });
    }, 800);
    return () => clearTimeout(t);
  }, [eligible]);

  if (!open || visible.length === 0) return null;

  return (
    <PopupView
      items={visible}
      isMultiple={eligible.length > 1}
      onClose={(dontShowAll: boolean) => {
        if (dontShowAll) {
          localStorage.setItem("pengumuman_dismissed_all_pinned", "1");
        }
        setOpen(false);
      }}
      onDismissOne={(id) => {
        // Hide dari list (session-only). Cooldown 30mnt sudah ke-set di useEffect.
        setDismissedIds((prev) => [...prev, id]);
      }}
    />
  );
}

function PopupView({
  items,
  isMultiple,
  onClose,
  onDismissOne,
}: {
  items: PopupItem[];
  isMultiple: boolean;
  onClose: (dontShowAll: boolean) => void;
  onDismissOne: (id: string) => void;
}) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // ESC key support
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(dontShowAgain);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onClose(dontShowAgain)}
        aria-label="Tutup popup"
      />
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 dark:bg-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header — compact, single accent color */}
        <div className="relative bg-indigo-600 px-4 py-3 text-white flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon icon="heroicons:megaphone" className="w-5 h-5 flex-shrink-0" />
              <h2 className="text-base font-semibold leading-none">
                Informasi Penting
                {isMultiple && <span className="ml-1.5 text-xs font-normal opacity-80">({items.length})</span>}
              </h2>
            </div>
            <button
              onClick={() => onClose(dontShowAgain)}
              className="flex-shrink-0 rounded-md p-1 hover:bg-white/15 transition-colors"
              aria-label="Tutup"
            >
              <Icon icon="heroicons:x-mark" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4 bg-gray-50 dark:bg-slate-900/50">
          {items.map((item) => (
            <PinnedCard key={item.id_pengumuman} item={item} onDismiss={() => onDismissOne(item.id_pengumuman)} />
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-slate-700 p-3 sm:p-4 bg-white dark:bg-slate-800 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Jangan tampilkan {isMultiple ? "semua " : ""}lagi</span>
            </label>
            <button
              onClick={() => onClose(dontShowAgain)}
              className="px-5 py-2 text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PinnedCard({ item, onDismiss }: { item: PopupItem; onDismiss: () => void }) {
  const preview = item.ringkasan ||
    (item.isi ? String(item.isi).replace(/<[^>]+>/g, "").substring(0, 200) : "");

  const tanggal = item.tgl_terbit
    ? new Date(item.tgl_terbit).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 ring-1 ring-gray-200 dark:ring-slate-700 p-4 hover:shadow-md transition-shadow group">
      <div className="flex gap-3">
        {item.banner_url ? (
          <img
            src={item.banner_url}
            alt={item.judul}
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0 border border-gray-100"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        ) : (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex-shrink-0 flex items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
            <Icon icon="heroicons:megaphone" className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              {item.nama_kategori && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {item.nama_kategori}
                </span>
              )}
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                <Icon icon="heroicons:bookmark" className="w-2.5 h-2.5" />
                Pinned
              </span>
            </div>
            <button
              onClick={onDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Sembunyikan dari sesi ini"
              aria-label="Sembunyikan"
            >
              <Icon icon="heroicons:x-mark" className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-snug mb-1 line-clamp-2">
            {item.judul}
          </h3>

          {preview && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-2">
              {preview}
              {preview.length >= 200 && "..."}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-500">
              {tanggal}
              {item.author && <span> · {item.author}</span>}
            </p>
            <Link
              href={`/portal/pengumuman/${item.slug || item.id_pengumuman}`}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Baca Selengkapnya
              <Icon icon="heroicons:arrow-right" className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
