"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiAward, FiUsers, FiCalendar } from "react-icons/fi";
import tridarmaDataService, { type PrestasiAnggotaResponse } from "@/lib/services/data-unila/tridarmaDataService";

type Props = { idPrestasi: string | null; onClose: () => void };

const PERAN_TONE: Record<string, string> = {
  "Ketua":    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300",
  "Anggota":  "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300",
  "Personal": "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300",
  "Lainnya":  "bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300",
};

export default function PrestasiTimModal({ idPrestasi, onClose }: Props) {
  const [data, setData] = useState<PrestasiAnggotaResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idPrestasi) return;
    setLoading(true);
    tridarmaDataService.getPrestasiAnggota(idPrestasi)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [idPrestasi, onClose]);

  if (!idPrestasi) return null;
  const meta = data?.meta;
  const anggota = data?.anggota || [];

  return (
    <AnimatePresence>
      {idPrestasi && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 12 }} transition={{ duration: 0.18 }}
            className="relative w-full max-w-2xl max-h-[95vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* HERO */}
            <div className="relative bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 pt-6 sm:pt-8 pb-5 sm:pb-6">
              <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                  <FiAward className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-[0.1em]">Detail Tim Prestasi</p>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight line-clamp-3 mt-0.5">{meta?.nama || (loading ? "Memuat..." : "Tidak ditemukan")}</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg w-8 h-8 flex items-center justify-center shrink-0">
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  {meta && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {meta.tahun && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300">
                          <FiCalendar className="w-3 h-3" /> {meta.tahun}
                        </span>
                      )}
                      {meta.tingkat && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300">{meta.tingkat}</span>
                      )}
                      {meta.jenis && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300">{meta.jenis}</span>
                      )}
                      {meta.peringkat && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300">{meta.peringkat}</span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                        <FiUsers className="w-3 h-3" /> {anggota.length} anggota tim
                      </span>
                    </div>
                  )}
                  {meta?.penyelenggara && (
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-2 italic line-clamp-1">{meta.penyelenggara}</p>
                  )}
                </div>
              </div>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-slate-50 dark:bg-gray-950/50">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-white dark:bg-gray-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : anggota.length === 0 ? (
                <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">Tidak ada data tim</div>
              ) : (
                <ul className="space-y-2">
                  {anggota.map((p, idx) => (
                    <li key={p.id_anggota || p.id_pd || idx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg ring-1 ring-slate-200 dark:ring-slate-800">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 shrink-0">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-slate-900 dark:text-white truncate">{p.nama || "—"}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {p.nipd && <span className="font-mono">{p.nipd}</span>}
                          {p.nm_prodi && <> · {p.nm_prodi}</>}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ring-1 ring-inset shrink-0 ${PERAN_TONE[p.peran] || PERAN_TONE["Lainnya"]}`}>
                        {p.peran}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* FOOTER */}
            <div className="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
