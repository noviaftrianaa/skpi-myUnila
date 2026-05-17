"use client";

// ReportPostButton — flag inappropriate content.
// Auth required; anonymous → redirect ke dashboard /login.
// Dedup di backend: kalau user sudah report dalam 24h, server return already_reported=true.

import { useEffect, useState } from "react";
import { Flag, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BLOG_API || "http://127.0.0.1:8091";
const DASHBOARD = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3000";

const ALASAN_LABEL: Record<string, string> = {
  spam: "Spam atau promosi",
  pornografi: "Pornografi",
  kekerasan: "Kekerasan / mengancam",
  ujaran_kebencian: "Ujaran kebencian / SARA",
  hoax: "Hoax / informasi menyesatkan",
  plagiat: "Plagiat / mencuri konten",
  hak_cipta: "Pelanggaran hak cipta",
  lainnya: "Lainnya (jelaskan)",
};

interface Props {
  idPost: string;
}

export function ReportPostButton({ idPost }: Props) {
  const [open, setOpen] = useState(false);
  const [alasan, setAlasan] = useState<string>("spam");
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | "ok" | "duplicate">(null);
  const [alasanList, setAlasanList] = useState<string[]>(Object.keys(ALASAN_LABEL));

  const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem("auth_access_token"));

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/laporan/alasan`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d?.data) && setAlasanList(d.data))
      .catch(() => {});
  }, []);

  const handleOpen = () => {
    if (!getToken()) {
      alert("Login dulu di dashboard untuk melapor 🙏");
      window.location.href = `${DASHBOARD}/login?redirect=${encodeURIComponent(window.location.href)}`;
      return;
    }
    setOpen(true);
    setDone(null);
  };

  const handleSubmit = async () => {
    const token = getToken();
    if (!token) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/posts/${idPost}/report`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ alasan, detail: detail.trim() || undefined }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `${res.status}`);
      }
      const json = await res.json();
      setDone(json?.already_reported ? "duplicate" : "ok");
    } catch (e) {
      alert(`Gagal kirim laporan: ${(e as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 transition-colors"
        title="Laporkan konten ini"
      >
        <Flag className="w-3 h-3" /> Laporkan
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-display font-bold text-lg inline-flex items-center gap-2 text-rose-600">
                <Flag className="w-5 h-5" /> Laporkan Konten
              </h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {done ? (
              <div className="px-5 py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                  <Flag className="w-6 h-6" />
                </div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {done === "duplicate" ? "Laporan kamu sebelumnya sudah tercatat" : "Terima kasih atas laporanmu"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {done === "duplicate"
                    ? "Tim moderasi sedang meninjau laporan kamu untuk post ini (dalam 24 jam terakhir)."
                    : "Tim moderasi akan meninjau laporan dalam waktu dekat. Konten yang melanggar akan ditindaklanjuti."}
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-5 px-4 py-2 rounded-lg bg-myunila text-white text-sm font-medium hover:bg-myunila-700"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <div className="px-5 py-4 space-y-4">
                <p className="text-xs text-slate-500">
                  Pilih alasan paling tepat. Laporan kamu bersifat rahasia dari penulis.
                </p>

                <div className="space-y-1">
                  {alasanList.map((a) => (
                    <label
                      key={a}
                      className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                        alasan === a
                          ? "bg-rose-50 dark:bg-rose-950/40 ring-1 ring-rose-200 dark:ring-rose-900"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <input
                        type="radio"
                        name="alasan"
                        value={a}
                        checked={alasan === a}
                        onChange={(e) => setAlasan(e.target.value)}
                        className="mt-1 accent-rose-600"
                      />
                      <span className="text-sm text-slate-800 dark:text-slate-200">
                        {ALASAN_LABEL[a] || a}
                      </span>
                    </label>
                  ))}
                </div>

                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value.slice(0, 1000))}
                  rows={3}
                  placeholder="Detail (opsional, max 1000 char) — bantu moderator memahami konteks."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setOpen(false)}
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    {submitting ? "Mengirim…" : "Kirim Laporan"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
