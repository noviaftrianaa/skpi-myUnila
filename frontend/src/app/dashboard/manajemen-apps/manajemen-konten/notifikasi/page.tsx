"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { manajemenKontenMenuConfig } from "../config/menuConfig";
import manajemenKontenService, {
  NotifBroadcast,
  BroadcastPayload,
} from "@/lib/services/manajemen-konten/manajemenKontenService";
import { Toaster, toast } from "react-hot-toast";
import { FiSend, FiBell, FiArrowLeft, FiClock, FiCheck, FiAlertTriangle, FiInfo, FiAlertCircle } from "react-icons/fi";

const APP_KEY = "manajemen-konten";

const SEVERITIES = [
  { value: "info", label: "Info", icon: <FiInfo />, color: "blue" },
  { value: "success", label: "Sukses", icon: <FiCheck />, color: "emerald" },
  { value: "warning", label: "Perhatian", icon: <FiAlertTriangle />, color: "amber" },
  { value: "error", label: "Penting", icon: <FiAlertCircle />, color: "rose" },
];

export default function NotifikasiBroadcastPage() {
  useRequireAuth();
  const [history, setHistory] = useState<NotifBroadcast[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [tipe, setTipe] = useState("system");
  const [judul, setJudul] = useState("");
  const [pesan, setPesan] = useState("");
  const [targetURL, setTargetURL] = useState("");
  const [severity, setSeverity] = useState<"info" | "success" | "warning" | "error">("info");
  const [targetRole, setTargetRole] = useState("all");
  const [expiryAt, setExpiryAt] = useState("");
  const [sending, setSending] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const r = await manajemenKontenService.listBroadcasts({ limit: 30 });
      if (r.success) setHistory(r.data);
    } catch (err: any) {
      toast.error("Gagal memuat: " + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const handleSubmit = async () => {
    if (!judul.trim() || !pesan.trim()) {
      toast.error("Judul dan pesan wajib diisi");
      return;
    }
    setSending(true);
    try {
      const payload: BroadcastPayload = {
        tipe,
        judul: judul.trim(),
        pesan: pesan.trim(),
        target_url: targetURL.trim() || null,
        severity,
        target_role: targetRole,
        expiry_at: expiryAt || null,
      };
      const r = await manajemenKontenService.broadcastNotif(payload);
      toast.success("Broadcast terkirim! ID: " + r.data.id_notif.substring(0, 8));
      // reset form
      setJudul("");
      setPesan("");
      setTargetURL("");
      setExpiryAt("");
      reload();
    } catch (err: any) {
      toast.error("Gagal: " + (err?.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Manajemen Konten"
      appIcon={<FiBell className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={manajemenKontenMenuConfig}
      pageTitle="Broadcast Notifikasi"
    >
      <Toaster position="top-right" />

      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Link href="/dashboard/manajemen-apps/manajemen-konten" className="hover:text-blue-600">
              Manajemen Konten
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">Broadcast Notifikasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Broadcast Notifikasi</h1>
          <p className="text-sm text-gray-600 mt-1">
            Kirim notifikasi langsung ke bell icon portal — pilih severity, target audience, dan kedaluwarsa.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Form composer */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h2 className="text-base font-bold text-gray-800">Kirim Notifikasi Baru</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Severity</label>
              <div className="flex flex-wrap gap-2">
                {SEVERITIES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSeverity(s.value as any)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                      severity === s.value
                        ? `bg-${s.color}-100 text-${s.color}-800 border-${s.color}-400`
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Judul <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value.slice(0, 255))}
                placeholder="Contoh: Maintenance sistem 30 April 22:00"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Pesan <span className="text-red-500">*</span>{" "}
                <span className="text-gray-400 font-normal">(maks 1000 karakter)</span>
              </label>
              <textarea
                value={pesan}
                onChange={(e) => setPesan(e.target.value.slice(0, 1000))}
                rows={4}
                placeholder="Detail pesan yang akan diterima user..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{pesan.length} / 1000</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tipe</label>
                <select
                  value={tipe}
                  onChange={(e) => setTipe(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="system">System</option>
                  <option value="reminder">Reminder</option>
                  <option value="alert">Alert</option>
                  <option value="pengumuman">Pengumuman</option>
                  <option value="berita">Berita</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Target Audience</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Semua user</option>
                  <option value="mahasiswa">Mahasiswa</option>
                  <option value="dosen">Dosen</option>
                  <option value="tendik">Tendik</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Target URL <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={targetURL}
                  onChange={(e) => setTargetURL(e.target.value)}
                  placeholder="/portal/announcements/123"
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Kedaluwarsa <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="date"
                  value={expiryAt}
                  onChange={(e) => setExpiryAt(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setJudul("");
                  setPesan("");
                  setTargetURL("");
                  setExpiryAt("");
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Reset
              </button>
              <button
                onClick={handleSubmit}
                disabled={sending || !judul.trim() || !pesan.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend className="w-4 h-4" /> {sending ? "Mengirim..." : "Kirim Broadcast"}
              </button>
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800">Riwayat Broadcast</h3>
              <span className="text-xs text-gray-500">{history.length} terakhir</span>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Belum ada broadcast</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {history.map((b) => {
                  const sev = SEVERITIES.find((s) => s.value === b.severity) || SEVERITIES[0];
                  return (
                    <div key={b.id_notif} className="border-l-4 border-gray-200 pl-3 py-2 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-800 leading-tight flex-1 truncate" title={b.judul}>
                          {b.judul}
                        </p>
                        <span
                          className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-${sev.color}-100 text-${sev.color}-700`}
                        >
                          {sev.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{b.pesan}</p>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {b.create_date
                          ? new Date(b.create_date).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                          : "—"}
                        {" · target: "}
                        <span className="font-semibold">{b.target_role}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
