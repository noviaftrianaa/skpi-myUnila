"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiUsers, FiBookOpen } from "react-icons/fi";
import tridarmaDataService, { type PengajaranPesertaResponse } from "@/lib/services/data-unila/tridarmaDataService";

type Props = { idKls: string | null; onClose: () => void };

function nilaiTone(n: string | null): string {
  if (!n) return "bg-slate-50 text-slate-600 ring-slate-200 dark:bg-slate-500/10";
  if (/^A/.test(n)) return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300";
  if (/^B/.test(n)) return "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300";
  if (/^C/.test(n)) return "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300";
  if (/^[DE]/.test(n)) return "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300";
  return "bg-slate-50 text-slate-600 ring-slate-200 dark:bg-slate-500/10";
}

export default function PengajaranPesertaModal({ idKls, onClose }: Props) {
  const [data, setData] = useState<PengajaranPesertaResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idKls) return;
    setLoading(true);
    tridarmaDataService.getPengajaranPeserta(idKls).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onEsc); };
  }, [idKls, onClose]);

  if (!idKls) return null;
  const meta = data?.meta;
  const peserta = data?.peserta || [];

  return (
    <AnimatePresence>
      {idKls && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ scale: 0.96 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }}
            className="relative w-full max-w-3xl max-h-[95vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 pt-6 pb-5">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                  <FiBookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-[0.1em]">Peserta Kelas</p>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 mt-0.5">{meta?.mata_kuliah || (loading ? "Memuat..." : "Tidak ditemukan")}</h2>
                  {meta && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {meta.kode_mk && <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300">{meta.kode_mk}</span>}
                      {meta.sks_mk && <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300">{meta.sks_mk} SKS</span>}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300">{meta.semester}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                        <FiUsers className="w-3 h-3" /> {peserta.length} peserta
                      </span>
                    </div>
                  )}
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg w-8 h-8 flex items-center justify-center shrink-0">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-slate-50 dark:bg-gray-950/50">
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-white dark:bg-gray-800 rounded-lg animate-pulse" />)}</div>
              ) : peserta.length === 0 ? (
                <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">Belum ada peserta tercatat</div>
              ) : (
                <ul className="space-y-1">
                  {peserta.map((p, idx) => (
                    <li key={p.id_pd || idx} className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-gray-900 rounded-lg ring-1 ring-slate-200 dark:ring-slate-800">
                      <span className="font-mono text-[10px] text-slate-400 w-6 text-right">{idx + 1}</span>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 w-24 shrink-0">{p.nim || "—"}</span>
                      <span className="flex-1 min-w-0 text-sm text-slate-800 dark:text-slate-200 truncate" title={p.nama}>{p.nama || "—"}</span>
                      {p.nm_prodi && <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden md:inline truncate max-w-[140px]" title={p.nm_prodi}>{p.nm_prodi}</span>}
                      {p.nilai_huruf && (
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold ring-1 ring-inset shrink-0 w-10 ${nilaiTone(p.nilai_huruf)}`}>{p.nilai_huruf}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">Tutup</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
