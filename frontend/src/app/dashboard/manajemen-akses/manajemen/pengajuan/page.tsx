"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { MdSecurity } from "react-icons/md";
import { manajemenAksesMenuConfig } from "../../config/menuConfig";
import {
  pengajuanAksesService,
  type PengajuanAkses,
  type StatusPengajuan,
  type QueueCount,
} from "@/lib/services/manakses/pengajuanAksesService";

const APP_KEY = "manajemen-akses";

const STATUS_META: Record<StatusPengajuan, { label: string; chip: string; icon: string }> = {
  pending:   { label: "Menunggu",    chip: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",   icon: "heroicons:clock" },
  approved:  { label: "Disetujui",   chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", icon: "heroicons:check-circle" },
  rejected:  { label: "Ditolak",     chip: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",         icon: "heroicons:x-circle" },
  cancelled: { label: "Dibatalkan",  chip: "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300",      icon: "heroicons:no-symbol" },
  expired:   { label: "Kadaluarsa",  chip: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300", icon: "heroicons:archive-box" },
};

export default function PengajuanAksesQueuePage() {
  useRequireAuth();

  const [filterStatus, setFilterStatus] = useState<StatusPengajuan | "all">("pending");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<PengajuanAkses[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState<QueueCount>({ pending: 0, approved: 0, rejected: 0, cancelled: 0, expired: 0, total: 0 });

  const [actioning, setActioning] = useState<string | null>(null);
  const [showReject, setShowReject] = useState<PengajuanAkses | null>(null);
  const [rejectAlasan, setRejectAlasan] = useState("");
  const [showPreview, setShowPreview] = useState<PengajuanAkses | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, cnt] = await Promise.all([
        pengajuanAksesService.index({ status: filterStatus, search: search || undefined, limit: 50 }),
        pengajuanAksesService.queueCount(),
      ]);
      setData(list.data);
      setCount(cnt);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Setujui pengajuan ini? Akses akan langsung aktif.")) return;
    setActioning(id);
    try {
      await pengajuanAksesService.approve(id);
      toast.success("Pengajuan disetujui, akses aktif");
      loadData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal approve");
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async () => {
    if (!showReject) return;
    if (rejectAlasan.trim().length < 10) {
      toast.error("Alasan tolak minimal 10 karakter");
      return;
    }
    setActioning(showReject.id_pengajuan);
    try {
      await pengajuanAksesService.reject(showReject.id_pengajuan, rejectAlasan);
      toast.success("Pengajuan ditolak");
      setShowReject(null);
      setRejectAlasan("");
      loadData();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal reject");
    } finally {
      setActioning(null);
    }
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Manajemen Akses"
      appIcon={<MdSecurity className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={manajemenAksesMenuConfig}
      pageTitle="Pengajuan Akses"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <nav className="mb-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
            <Link href="/dashboard/manajemen-akses" className="hover:text-blue-600">Manajemen Akses</Link>
            <Icon icon="heroicons:chevron-right" className="h-3 w-3" />
            <span className="text-gray-700 dark:text-slate-300">Pengajuan Akses</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Pengajuan Akses</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Kelola pengajuan akses aplikasi dari civitas — review, approve, atau reject.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(["pending", "approved", "rejected", "cancelled", "expired"] as StatusPengajuan[]).map((s) => {
            const meta = STATUS_META[s];
            const value = count[s];
            const isActive = filterStatus === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={`rounded-xl border p-3 text-left transition ${
                  isActive
                    ? "border-indigo-300 bg-indigo-50 shadow-sm ring-2 ring-indigo-300 dark:border-indigo-700 dark:bg-indigo-900/20"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-slate-700 dark:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon icon={meta.icon} className="h-5 w-5 text-gray-400" />
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.chip}`}>{meta.label}</span>
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
              </button>
            );
          })}
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <div className="relative min-w-[280px] flex-1">
            <Icon icon="heroicons:magnifying-glass" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, NIP, atau aplikasi…"
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Icon icon="heroicons:funnel" className="h-4 w-4" />
            Filter
          </button>
        </form>

        {/* List */}
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500" />
            <p className="mt-3 text-sm text-gray-500">Memuat pengajuan…</p>
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
            <Icon icon="heroicons:inbox" className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-700 dark:text-slate-300">Tidak ada pengajuan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((r) => (
              <PengajuanAdminCard
                key={r.id_pengajuan}
                item={r}
                actioning={actioning === r.id_pengajuan}
                onApprove={() => handleApprove(r.id_pengajuan)}
                onReject={() => { setShowReject(r); setRejectAlasan(""); }}
                onPreview={() => setShowPreview(r)}
              />
            ))}
          </div>
        )}

        {/* Modal Reject */}
        {showReject && (
          <Modal onClose={() => setShowReject(null)} title="Tolak Pengajuan">
            <div className="space-y-4 p-5">
              <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-slate-700/50 dark:text-slate-300">
                Pengajuan: <strong>{showReject.nm_aplikasi} — {showReject.nm_peran}</strong> oleh {showReject.nama_pemohon}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300">
                  Alasan Penolakan <span className="text-red-500">*</span> (min 10 karakter)
                </label>
                <textarea
                  rows={4}
                  value={rejectAlasan}
                  onChange={(e) => setRejectAlasan(e.target.value)}
                  placeholder="Jelaskan alasan penolakan supaya pemohon paham…"
                  className="block w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white"
                />
                <div className="mt-1 text-right text-xs text-gray-500">{rejectAlasan.length}/1000</div>
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-200 pt-3 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowReject(null)}
                  disabled={!!actioning}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={!!actioning || rejectAlasan.trim().length < 10}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  {actioning ? <span className="h-3 w-3 animate-spin rounded-full border-b-2 border-white" /> : <Icon icon="heroicons:x-mark" className="h-4 w-4" />}
                  Tolak Pengajuan
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal SK Preview */}
        {showPreview && (
          <Modal onClose={() => setShowPreview(null)} title="Preview SK Penugasan" size="xl">
            <div className="p-2">
              <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs dark:bg-slate-700/50">
                <div>
                  <strong>{showPreview.sk_filename}</strong> · {(showPreview.sk_filesize ?? 0) > 0 ? `${((showPreview.sk_filesize ?? 0) / 1024).toFixed(1)} KB` : "—"}
                </div>
                <a
                  href={pengajuanAksesService.previewSkUrl(showPreview.id_pengajuan)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                >
                  <Icon icon="heroicons:arrow-top-right-on-square" className="h-3 w-3" />
                  Buka di tab baru
                </a>
              </div>
              <iframe
                src={pengajuanAksesService.previewSkUrl(showPreview.id_pengajuan)}
                className="h-[70vh] w-full rounded-lg border border-gray-200 dark:border-slate-700"
                title="SK Preview"
              />
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}

// ============================================================================
// Admin Card
// ============================================================================
function PengajuanAdminCard({
  item, actioning, onApprove, onReject, onPreview,
}: {
  item: PengajuanAkses;
  actioning: boolean;
  onApprove: () => void;
  onReject: () => void;
  onPreview: () => void;
}) {
  const initials = (item.nama_pemohon || "?").split(" ").slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");
  const meta = STATUS_META[item.status];
  const hasBlocking = item.auto_flags?.some((f) => f.level === "block");
  const hasWarning = item.auto_flags?.some((f) => f.level === "warning");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-start gap-4">
        {/* Avatar */}
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
          {initials || "?"}
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.chip}`}>
              <Icon icon={meta.icon} className="h-3 w-3" />
              {meta.label}
            </span>
            <span className="text-xs text-gray-500">{new Date(item.tgl_create).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            {hasBlocking && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">🔴 Blocked</span>}
            {hasWarning && !hasBlocking && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">⚠️ Warning</span>}
          </div>

          <div className="mt-1.5 text-sm">
            <div className="font-semibold text-gray-900 dark:text-white">
              {item.nama_pemohon}
              {item.nip_pemohon && <span className="ml-2 text-xs font-normal text-gray-500">NIP {item.nip_pemohon}</span>}
            </div>
            <div className="text-xs text-gray-600 dark:text-slate-400">
              {item.homebase_pemohon || "—"}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-700 dark:text-slate-300">
            <span><Icon icon="heroicons:rectangle-stack" className="mr-1 inline h-4 w-4 text-gray-400" />{item.nm_aplikasi}</span>
            <span><Icon icon="heroicons:identification" className="mr-1 inline h-4 w-4 text-gray-400" />{item.nm_peran}</span>
            <span><Icon icon="heroicons:building-office" className="mr-1 inline h-4 w-4 text-gray-400" />{item.nm_organisasi}</span>
          </div>

          {item.no_sk && (
            <div className="mt-1 text-xs text-gray-500">
              SK: {item.no_sk} · Berlaku s/d {new Date(item.tgl_kadaluarsa).toLocaleDateString("id-ID")}
            </div>
          )}

          {item.auto_flags && item.auto_flags.length > 0 && (
            <div className="mt-2 space-y-1">
              {item.auto_flags.map((f, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-1.5 rounded-md px-2 py-1 text-xs ${
                    f.level === "block"
                      ? "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                      : "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
                  }`}
                >
                  <Icon
                    icon={f.level === "block" ? "heroicons:x-circle" : "heroicons:exclamation-triangle"}
                    className="mt-0.5 h-3 w-3 flex-shrink-0"
                  />
                  <span>
                    <strong className="font-semibold">{f.code}:</strong> {f.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {item.catatan_pemohon && (
            <div className="mt-2 rounded-md bg-gray-50 px-3 py-2 text-xs italic text-gray-700 dark:bg-slate-700/50 dark:text-slate-300">
              "{item.catatan_pemohon}"
            </div>
          )}

          {item.status === "rejected" && item.alasan_tolak && (
            <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-800 dark:bg-red-900/20 dark:text-red-200">
              <strong>Alasan tolak:</strong> {item.alasan_tolak}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {item.sk_url && (
            <button
              onClick={onPreview}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            >
              <Icon icon="heroicons:document-magnifying-glass" className="h-4 w-4" />
              Preview SK
            </button>
          )}
          {item.status === "pending" && (
            <>
              <button
                onClick={onApprove}
                disabled={actioning}
                className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {actioning ? <span className="h-3 w-3 animate-spin rounded-full border-b-2 border-white" /> : <Icon icon="heroicons:check" className="h-4 w-4" />}
                Setujui
              </button>
              <button
                onClick={onReject}
                disabled={actioning}
                className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:shadow-md disabled:opacity-50"
              >
                <Icon icon="heroicons:x-mark" className="h-4 w-4" />
                Tolak
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Modal({ onClose, title, children, size = "md" }: { onClose: () => void; title: string; children: React.ReactNode; size?: "md" | "lg" | "xl" }) {
  const sizeCls = size === "xl" ? "max-w-4xl" : size === "lg" ? "max-w-2xl" : "max-w-lg";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeCls} rounded-2xl bg-white shadow-2xl dark:bg-slate-800`}>
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3 dark:border-slate-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700">
            <Icon icon="heroicons:x-mark" className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
