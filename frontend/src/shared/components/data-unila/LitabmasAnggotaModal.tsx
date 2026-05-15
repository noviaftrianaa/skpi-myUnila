"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiUsers, FiUser, FiBookOpen, FiAward } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import toast from "react-hot-toast";
import tridarmaDataService, {
  type LitabmasAnggotaResponse,
} from "@/lib/services/data-unila/tridarmaDataService";

type Props = {
  idLitabmas: string | null;
  onClose: () => void;
};

type TabKey = "dosen" | "mahasiswa";

const PAGE_SIZE = 50;

export default function LitabmasAnggotaModal({ idLitabmas, onClose }: Props) {
  const [data, setData] = useState<LitabmasAnggotaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("dosen");
  const [mhsOffset, setMhsOffset] = useState(0);

  // Reset state on new ID
  useEffect(() => {
    if (!idLitabmas) return;
    setData(null);
    setTab("dosen");
    setMhsOffset(0);
  }, [idLitabmas]);

  // Fetch
  useEffect(() => {
    if (!idLitabmas) return;
    setLoading(true);
    tridarmaDataService
      .getLitabmasAnggota(idLitabmas, { limit: PAGE_SIZE, offset: mhsOffset })
      .then(setData)
      .catch(() => toast.error("Gagal memuat tim anggota litabmas"))
      .finally(() => setLoading(false));
  }, [idLitabmas, mhsOffset]);

  // Lock body scroll + ESC
  useEffect(() => {
    if (!idLitabmas) return;
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [idLitabmas, onClose]);

  const meta = data?.meta;
  const dosen = data?.dosen ?? [];
  const mahasiswa = data?.mahasiswa ?? [];
  const mhsTotal = data?.mahasiswa_total ?? 0;
  const mhsPages = mhsTotal > 0 ? Math.ceil(mhsTotal / PAGE_SIZE) : 0;
  const mhsCurrentPage = Math.floor(mhsOffset / PAGE_SIZE) + 1;

  return (
    <AnimatePresence>
      {idLitabmas && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-3xl max-h-[92vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* HERO */}
            <div className="relative bg-gradient-to-b from-violet-50 to-white dark:from-violet-950/40 dark:to-gray-900 border-b border-violet-200/60 dark:border-violet-800/40 px-4 sm:px-6 pt-6 pb-5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <FiUsers className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-300 uppercase tracking-wider mb-0.5">
                        Tim Anggota Litabmas
                      </p>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {meta?.judul || (loading ? "Memuat..." : "—")}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {meta?.jenis && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 font-medium">
                            <FiAward className="w-3 h-3" /> {meta.jenis}
                          </span>
                        )}
                        {meta?.tahun && <span>Tahun {meta.tahun}</span>}
                        {meta?.skim && <span>· {meta.skim}</span>}
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg w-8 h-8 flex items-center justify-center shrink-0"
                      aria-label="Tutup"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  {/* counters */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-white dark:bg-slate-800/60 ring-1 ring-slate-200 dark:ring-slate-700 px-3 py-2">
                      <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Tim Dosen</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{dosen.length}</p>
                    </div>
                    <div className="rounded-lg bg-white dark:bg-slate-800/60 ring-1 ring-slate-200 dark:ring-slate-700 px-3 py-2">
                      <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Anggota Mahasiswa</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                        {mhsTotal.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div className="border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6">
              <div className="flex gap-1">
                <TabButton
                  active={tab === "dosen"}
                  onClick={() => setTab("dosen")}
                  icon={<FiUser className="w-3.5 h-3.5" />}
                  label="Tim Dosen"
                  count={dosen.length}
                />
                <TabButton
                  active={tab === "mahasiswa"}
                  onClick={() => setTab("mahasiswa")}
                  icon={<MdSchool className="w-3.5 h-3.5" />}
                  label="Anggota Mahasiswa"
                  count={mhsTotal}
                />
              </div>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              {loading && !data ? (
                <SkeletonList />
              ) : tab === "dosen" ? (
                <DosenList items={dosen} />
              ) : (
                <>
                  <MahasiswaList items={mahasiswa} loading={loading} />
                  {mhsPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Halaman {mhsCurrentPage} dari {mhsPages} · {mhsTotal.toLocaleString("id-ID")} mahasiswa
                      </p>
                      <div className="flex gap-1">
                        <button
                          disabled={mhsOffset === 0 || loading}
                          onClick={() => setMhsOffset(Math.max(0, mhsOffset - PAGE_SIZE))}
                          className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          ← Prev
                        </button>
                        <button
                          disabled={mhsOffset + PAGE_SIZE >= mhsTotal || loading}
                          onClick={() => setMhsOffset(mhsOffset + PAGE_SIZE)}
                          className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
        active
          ? "border-violet-600 text-violet-700 dark:text-violet-300"
          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
      }`}
    >
      {icon}
      <span>{label}</span>
      <span
        className={`ml-1 inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-[10px] rounded-full ${
          active
            ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200"
            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        {count.toLocaleString("id-ID")}
      </span>
    </button>
  );
}

function DosenList({ items }: { items: Array<{ id_sdm: string; nama: string; nidn: string | null; nip: string | null; peran: string; peran_code: string }> }) {
  if (items.length === 0) {
    return <EmptyState icon={<FiUser />} label="Tidak ada dosen anggota tercatat untuk litabmas ini." />;
  }
  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
      {items.map((d) => (
        <li key={d.id_sdm} className="py-3 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-300 text-xs font-bold shrink-0">
            {d.nama?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{d.nama}</p>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  d.peran_code === "K"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                }`}
              >
                {d.peran}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              {d.nidn ? `NIDN: ${d.nidn}` : ""}
              {d.nidn && d.nip ? " · " : ""}
              {d.nip ? `NIP: ${d.nip}` : ""}
              {!d.nidn && !d.nip ? "—" : ""}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function MahasiswaList({
  items,
  loading,
}: {
  items: Array<{ id_pd_ang_litabmas: string; nama: string | null; nipd: string | null; peran: string; peran_code: string; prodi: string | null }>;
  loading: boolean;
}) {
  if (loading) return <SkeletonList />;
  if (items.length === 0) {
    return <EmptyState icon={<MdSchool />} label="Tidak ada mahasiswa anggota tercatat untuk litabmas ini." />;
  }
  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
      {items.map((m) => (
        <li key={m.id_pd_ang_litabmas} className="py-3 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xs font-bold shrink-0">
            {m.nama?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{m.nama || "—"}</p>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  m.peran_code === "K"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                }`}
              >
                {m.peran}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="font-mono">{m.nipd || "—"}</span>
              {m.prodi && <span className="ml-2"><FiBookOpen className="inline w-3 h-3 mr-1" />{m.prodi}</span>}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-2 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xl mb-3">
        {icon}
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{label}</p>
    </div>
  );
}
