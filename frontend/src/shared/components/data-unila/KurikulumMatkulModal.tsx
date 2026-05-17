"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiBookOpen, FiList } from "react-icons/fi";
import akademikDataService, { type KurikulumMatkulResponse } from "@/lib/services/data-unila/akademikDataService";

type Props = { idKurikulum: string | null; onClose: () => void };

export default function KurikulumMatkulModal({ idKurikulum, onClose }: Props) {
  const [data, setData] = useState<KurikulumMatkulResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idKurikulum) return;
    setLoading(true);
    akademikDataService.getKurikulumMatkul(idKurikulum)
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
  }, [idKurikulum, onClose]);

  if (!idKurikulum) return null;
  const meta = data?.meta;
  const matkul = data?.matkul || [];
  const total = data?.total;

  // Group by semester
  const groups: Record<number, typeof matkul> = {};
  for (const m of matkul) {
    const smt = Number(m.semester_kurikulum || 0);
    if (!groups[smt]) groups[smt] = [];
    groups[smt].push(m);
  }
  const sortedSmt = Object.keys(groups).map(Number).sort((a, b) => a - b);

  return (
    <AnimatePresence>
      {idKurikulum && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 12 }} transition={{ duration: 0.18 }}
            className="relative w-full max-w-4xl max-h-[95vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* HERO */}
            <div className="relative bg-gradient-to-b from-violet-50 to-white dark:from-violet-900/20 dark:to-gray-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 pt-6 pb-5">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                  <FiBookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-[0.1em]">Detail Kurikulum</p>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 mt-0.5">{meta?.nm_kurikulum || (loading ? "Memuat..." : "Tidak ditemukan")}</h2>
                  {meta?.nm_prodi && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{meta.nm_prodi}</p>}
                  {total && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300">
                        <FiList className="w-3 h-3" /> {total.jml_matkul} matkul
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300">{total.sks_total} SKS</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300">Wajib: {total.sks_wajib}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300">Pilihan: {total.sks_pilihan}</span>
                      {meta?.tahun_mulai && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300">Tahun {meta.tahun_mulai}</span>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg w-8 h-8 flex items-center justify-center shrink-0">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-slate-50 dark:bg-gray-950/50">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-white dark:bg-gray-800 rounded-lg animate-pulse" />)}
                </div>
              ) : matkul.length === 0 ? (
                <div className="text-center py-12 text-sm text-gray-500 dark:text-gray-400">Belum ada matkul terdaftar di kurikulum ini</div>
              ) : (
                <div className="space-y-4">
                  {sortedSmt.map((smt) => (
                    <div key={smt}>
                      <div className="sticky top-0 bg-slate-50 dark:bg-gray-950/50 pb-1.5 mb-1.5 border-b border-slate-200 dark:border-slate-800">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Semester {smt > 0 ? smt : "Lainnya"}
                          <span className="ml-1 font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 rounded">{groups[smt].length}</span>
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {groups[smt].map((m) => (
                          <li key={m.id_mk} className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-gray-900 rounded-lg ring-1 ring-slate-200 dark:ring-slate-800">
                            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 w-20 shrink-0">{m.kode_mk || "—"}</span>
                            <span className="flex-1 min-w-0 text-sm text-slate-800 dark:text-slate-200 truncate" title={m.nm_mk}>{m.nm_mk || "—"}</span>
                            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 w-10 text-right">{m.sks_mk} SKS</span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${Number(m.a_wajib) === 1 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
                              {Number(m.a_wajib) === 1 ? "W" : "P"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
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
