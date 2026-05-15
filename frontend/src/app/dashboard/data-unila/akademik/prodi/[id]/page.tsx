"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiArrowLeft, FiAward, FiBookOpen, FiUsers, FiLayers, FiCalendar, FiAlertCircle, FiCheckCircle, FiFileText,
} from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { dataUnilaMenuConfig } from "../../../config/menuConfig";
import akademikDataService, { type ProdiDetail } from "@/lib/services/data-unila/akademikDataService";
import DosenProfileModal from "@/shared/components/data-unila/DosenProfileModal";
import { StatCardGridSkeleton, CardSkeleton } from "@/shared/components/data-unila/PageSkeleton";
import EmptyState from "@/shared/components/data-unila/EmptyState";

const APP_KEY = "data-unila";

function fmt(n: number | string | null | undefined): string {
  if (n == null || n === "") return "—";
  const v = typeof n === "number" ? n : parseInt(String(n), 10);
  if (Number.isNaN(v)) return String(n);
  return v.toLocaleString("id-ID");
}

function tone(rank: string | null | undefined): string {
  if (!rank) return "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700 dark:text-gray-300";
  if (/Unggul|^A$/.test(rank)) return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300";
  if (/Baik Sekali|^B$/.test(rank)) return "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300";
  if (/Baik|^C$/.test(rank)) return "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300";
  return "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700 dark:text-gray-300";
}

function StatTile({ icon, label, value, gradient, sub }: { icon: React.ReactNode; label: string; value: string | number; gradient: string; sub?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br ${gradient}`}>
      <div className="absolute -top-10 -right-8 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10 flex items-center gap-3 p-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 ring-1 ring-inset ring-white/25 flex items-center justify-center text-white shadow-inner">{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-white/80 uppercase tracking-[0.1em]">{label}</p>
          <h3 className="text-2xl font-extrabold text-white tabular-nums leading-tight">{typeof value === "number" ? fmt(value) : value}</h3>
          {sub && <p className="text-[11px] text-white/70 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default function ProdiDetailPage() {
  useRequireAuth();
  const params = useParams<{ id: string }>();
  const idSms = (params?.id ?? "") as string;

  const [detail, setDetail] = useState<ProdiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDosenId, setOpenDosenId] = useState<string | null>(null);

  useEffect(() => {
    if (!idSms) return;
    setLoading(true);
    setError(null);
    akademikDataService
      .getProdiDetail(idSms)
      .then((d) => setDetail(d))
      .catch((e) => {
        const msg = e?.response?.data?.message || e?.message || "Gagal memuat detail prodi";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [idSms]);

  const akrCurrent = detail?.info?.akreditasi_terkini;
  const expSoon = useMemo(() => {
    if (!akrCurrent?.tgl_expired) return false;
    const exp = new Date(akrCurrent.tgl_expired).getTime();
    const now = Date.now();
    const diffDays = (exp - now) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 90;
  }, [akrCurrent?.tgl_expired]);

  const expired = useMemo(() => {
    if (!akrCurrent?.tgl_expired) return false;
    return new Date(akrCurrent.tgl_expired).getTime() < Date.now();
  }, [akrCurrent?.tgl_expired]);

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={dataUnilaMenuConfig}
      pageTitle="Detail Prodi"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/data-unila/akademik/prodi"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600"
          >
            <FiArrowLeft className="w-4 h-4" /> Kembali ke Program Studi
          </Link>
        </div>

        {loading && (
          <div className="space-y-6">
            <CardSkeleton lines={5} />
            <StatCardGridSkeleton count={4} />
            <CardSkeleton lines={6} />
          </div>
        )}

        {!loading && error && (
          <EmptyState
            variant="search"
            title="Gagal memuat detail prodi"
            description={error}
            action={{ label: "Coba lagi", onClick: () => location.reload() }}
          />
        )}

        {!loading && !error && detail && (
          <>
            {/* HERO */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-700 text-white p-6 shadow-xl"
            >
              <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-blue-100 text-xs uppercase tracking-wider">
                    <FiBookOpen className="w-4 h-4" />
                    Program Studi {detail.info.jenjang}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">{detail.info.nm_prodi}</h1>
                  <p className="text-blue-100 mt-1 text-sm">{detail.info.nm_fakultas || "—"}</p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  {akrCurrent ? (
                    <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 min-w-[220px]">
                      <p className="text-[10px] uppercase tracking-wider text-blue-100">Akreditasi Terkini</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset ${tone(akrCurrent.peringkat)}`}>
                          {akrCurrent.peringkat}
                        </span>
                        {expired && <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-100 font-semibold">EXPIRED</span>}
                        {!expired && expSoon && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-100 font-semibold">≤90 HARI</span>}
                      </div>
                      <p className="text-xs text-blue-100 mt-2">
                        Berlaku s/d <span className="font-semibold text-white">{akrCurrent.tgl_expired ?? "—"}</span>
                      </p>
                      <p className="text-[11px] text-blue-200 mt-0.5">{akrCurrent.lembaga || "—"}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-blue-100 italic">Belum ada akreditasi tercatat</span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* STAT TILES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile
                icon={<FiUsers className="w-6 h-6" />}
                label="Dosen Homebase"
                value={detail.dosen_homebase.total}
                gradient="from-violet-500 to-purple-600"
                sub="Dosen tetap di prodi ini"
              />
              <StatTile
                icon={<FiUsers className="w-6 h-6" />}
                label="Mahasiswa Aktif"
                value={detail.mahasiswa_aktif}
                gradient="from-blue-500 to-indigo-600"
                sub="Belum keluar / lulus"
              />
              <StatTile
                icon={<FiBookOpen className="w-6 h-6" />}
                label="Mata Kuliah"
                value={detail.matkul_count}
                gradient="from-emerald-500 to-teal-600"
              />
              <StatTile
                icon={<FiLayers className="w-6 h-6" />}
                label="SKS Kurikulum"
                value={detail.kurikulum_aktif?.total_sks ?? 0}
                gradient="from-amber-500 to-orange-500"
                sub={detail.kurikulum_aktif?.nama || "—"}
              />
            </div>

            {/* SECTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Akreditasi History */}
              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FiAward className="text-emerald-600" /> Riwayat Akreditasi
                  </h2>
                  <span className="text-xs text-gray-500">{detail.akreditasi_history.length} entri</span>
                </div>
                {detail.akreditasi_history.length === 0 ? (
                  <EmptyState title="Belum ada riwayat akreditasi" description="Data akreditasi prodi belum tercatat di pdrd.akreditasi_prodi." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800/50 text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        <tr>
                          <th className="px-4 py-2 text-left">Peringkat</th>
                          <th className="px-4 py-2 text-left">Tgl SK</th>
                          <th className="px-4 py-2 text-left">Tgl Expired</th>
                          <th className="px-4 py-2 text-left">Lembaga</th>
                          <th className="px-4 py-2 text-left">No SK</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {detail.akreditasi_history.map((h) => (
                          <tr key={h.id} className={h.a_aktif ? "bg-emerald-50/30 dark:bg-emerald-500/5" : ""}>
                            <td className="px-4 py-2.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ring-1 ring-inset ${tone(h.peringkat)}`}>
                                {h.peringkat}
                              </span>
                              {h.a_aktif === 1 && (
                                <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                                  <FiCheckCircle className="w-3 h-3" /> Aktif
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 font-mono text-xs">{h.tgl_sk ?? "—"}</td>
                            <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 font-mono text-xs">{h.tgl_expired ?? "—"}</td>
                            <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400 text-xs">{h.lembaga || "—"}</td>
                            <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400 text-xs">
                              <span className="inline-flex items-center gap-1">
                                <FiFileText className="w-3 h-3 text-gray-400" />
                                {h.no_sk || "—"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Dosen Homebase */}
              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FiUsers className="text-violet-600" /> Dosen Homebase
                  </h2>
                  <span className="text-xs text-gray-500">
                    Menampilkan {detail.dosen_homebase.list.length} dari {detail.dosen_homebase.total}
                  </span>
                </div>
                {detail.dosen_homebase.list.length === 0 ? (
                  <EmptyState title="Belum ada dosen homebase aktif" description="Belum ada SDM dengan reg_ptk aktif di prodi ini." />
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {detail.dosen_homebase.list.map((d) => (
                      <li key={d.id_sdm}>
                        <button
                          type="button"
                          onClick={() => setOpenDosenId(d.id_sdm)}
                          className="w-full text-left px-4 sm:px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{d.nm_sdm}</p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                NIDN: <span className="font-mono">{d.nidn || "—"}</span> · NIP: <span className="font-mono">{d.nip || "—"}</span>
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[11px] text-gray-700 dark:text-gray-300 font-medium block">{d.jabatan_fungsional}</span>
                              <span className={`inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded ${d.status === "Aktif" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                                {d.status}
                              </span>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {detail.dosen_homebase.total > detail.dosen_homebase.list.length && (
                  <div className="p-3 border-t border-gray-100 dark:border-gray-800 text-center">
                    <Link
                      href={`/dashboard/data-unila/dosen?id_prodi=${encodeURIComponent(detail.info.id_sms)}`}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Lihat semua dosen di prodi ini →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Kurikulum + Info Tambahan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                  <FiCalendar className="text-amber-600" /> Kurikulum Aktif
                </h2>
                {detail.kurikulum_aktif ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nama Kurikulum</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200 text-right max-w-[60%]">{detail.kurikulum_aktif.nama}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Semester Berlaku</span>
                      <span className="font-mono text-gray-800 dark:text-gray-200">{detail.kurikulum_aktif.smt_berlaku ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total SKS Lulus</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{fmt(detail.kurikulum_aktif.total_sks)}</span>
                    </div>
                  </div>
                ) : (
                  <EmptyState title="Belum ada kurikulum aktif" description="Tidak ada baris pdrd.kurikulum_sp dengan a_digunakan=1." />
                )}
              </div>

              <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                  <FiAlertCircle className="text-rose-500" /> Status Prodi
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID SMS</span>
                    <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{detail.info.id_sms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Jenjang</span>
                    <span className="text-gray-800 dark:text-gray-200">{detail.info.jenjang || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status Prodi</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${detail.info.stat_prodi === "A" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
                      {detail.info.stat_prodi === "A" ? "Aktif" : (detail.info.stat_prodi || "—")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <DosenProfileModal idSdm={openDosenId} onClose={() => setOpenDosenId(null)} />
    </DashboardLayoutWithDynamicMenu>
  );
}
