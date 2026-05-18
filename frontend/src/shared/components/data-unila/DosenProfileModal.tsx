"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiX, FiUser, FiAward, FiBookOpen, FiCalendar, FiMail, FiPhone, FiInfo, FiHome, FiBriefcase,
} from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import dosenDataService, { type DosenDetail } from "@/lib/services/data-unila/dosenDataService";
import toast from "react-hot-toast";

type Props = {
  idSdm: string | null;
  onClose: () => void;
};

// Relative URL fallback → browser resolve ke same-origin (Kong/nginx proxy
// `/myunila-storage/*`). LAN IP `http://192.168.120.47:9000` tidak accessible
// dari browser internet, jangan dipakai sebagai default.
const MINIO_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_MINIO_URL) || "";

function fotoUrl(idSdm: string): string {
  return `${MINIO_BASE}/myunila-storage/photos/sdm/${idSdm}.jpg`;
}

function initials(nm?: string): string {
  if (!nm) return "?";
  const parts = nm.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ idSdm, nama }: { idSdm: string | null; nama: string }) {
  const [error, setError] = useState(false);
  const url = idSdm ? fotoUrl(idSdm) : null;
  return (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-lg sm:text-2xl font-bold shrink-0 overflow-hidden">
      {url && !error ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={nama}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center top" }}
          onError={() => setError(true)}
        />
      ) : (
        <span className="tracking-wider">{initials(nama)}</span>
      )}
    </div>
  );
}

const TABS = [
  { key: "identitas", label: "Identitas", icon: <FiUser className="w-3.5 h-3.5" /> },
  { key: "akademik",  label: "Akademik",  icon: <FiBookOpen className="w-3.5 h-3.5" /> },
  { key: "fungsional", label: "Riwayat Jabfung", icon: <FiAward className="w-3.5 h-3.5" /> },
  { key: "kepangkatan", label: "Riwayat Kepangkatan", icon: <FiAward className="w-3.5 h-3.5" /> },
  { key: "tugas_tambahan", label: "Tugas Tambahan", icon: <FiBriefcase className="w-3.5 h-3.5" /> },
  { key: "diklat", label: "Diklat", icon: <FiCalendar className="w-3.5 h-3.5" /> },
  { key: "pekerjaan", label: "Pekerjaan", icon: <FiBriefcase className="w-3.5 h-3.5" /> },
  { key: "pendidikan", label: "Pendidikan",  icon: <MdSchool className="w-3.5 h-3.5" /> },
  { key: "sertifikasi", label: "Sertifikasi", icon: <FiAward className="w-3.5 h-3.5" /> },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function fmtDate(s?: string | null): string {
  if (!s) return "—";
  try {
    const d = new Date(s.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  } catch { return s; }
}

export default function DosenProfileModal({ idSdm, onClose }: Props) {
  const [data, setData] = useState<DosenDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("identitas");

  useEffect(() => {
    if (!idSdm) return;
    setLoading(true);
    setData(null);
    setTab("identitas");
    dosenDataService.getDetail(idSdm)
      .then(setData)
      .catch(() => toast.error("Gagal memuat profil dosen"))
      .finally(() => setLoading(false));
  }, [idSdm]);

  useEffect(() => {
    if (!idSdm) return;
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [idSdm, onClose]);

  const b = data?.biodata;
  const nama = b?.nm_sdm || "—";
  const nidn = b?.nidn || "—";
  const nip = b?.nip || "—";
  const prodi = b?.nm_prodi;
  const fakultas = b?.nm_fakultas;
  const jabfung = b?.jabatan_fungsional;
  const jenis = b?.jenis_sdm;
  const status = b?.status;

  return (
    <AnimatePresence>
      {idSdm && (
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
            className="relative w-full max-w-4xl max-h-[95vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* HERO — subtle slate gradient (selaras dgn MahasiswaProfileModal) */}
            <div className="relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-gray-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 pt-8 sm:pt-10 pb-5 sm:pb-6">
              <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                <Avatar idSdm={idSdm} nama={nama} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-tight truncate">{nama}</h2>
                      <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-mono truncate">
                        NIDN: {nidn} {nip !== "—" && `· NIP: ${nip}`}
                      </p>
                      <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {jabfung || "—"}
                        {prodi && <span> · {prodi}</span>}
                        {fakultas && <span className="hidden sm:inline"> · {fakultas}</span>}
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg w-8 h-8 flex items-center justify-center shrink-0"
                      aria-label="Tutup"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <StatPill label="Status" value={status || "—"} tone="slate" />
                    <StatPill label="Jenis SDM" value={jenis || "—"} tone="indigo" />
                    <StatPill label="Jabfung" value={data?.riwayat_fungsional?.length || 0} tone="emerald" />
                    <StatPill label="Sertifikasi" value={data?.sertifikasi?.length || 0} tone="amber" />
                  </div>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-slate-800 pt-3 overflow-x-auto overflow-y-hidden scrollbar-hide [-webkit-overflow-scrolling:touch]">
              <div className="inline-flex flex-nowrap items-end gap-1 px-4 sm:px-6 min-w-full">
                {TABS.map((t) => {
                  const active = tab === t.key;
                  const badge =
                    t.key === "fungsional" ? data?.riwayat_fungsional.length :
                    t.key === "pendidikan" ? data?.riwayat_pendidikan.length :
                    t.key === "sertifikasi" ? data?.sertifikasi.length :
                    t.key === "kepangkatan" ? data?.riwayat_kepangkatan?.length :
                    t.key === "tugas_tambahan" ? data?.tugas_tambahan?.length :
                    t.key === "diklat" ? data?.riwayat_diklat?.length :
                    t.key === "pekerjaan" ? data?.riwayat_pekerjaan?.length :
                    undefined;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={`px-3 py-2.5 text-[11px] sm:text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5
                        ${active
                          ? "border-slate-900 text-slate-900 dark:text-white dark:border-white"
                          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                    >
                      {t.icon}
                      {t.label}
                      {badge != null && badge > 0 && (
                        <span className={`ml-1 px-1.5 py-0.5 text-[10px] rounded ${active ? "bg-slate-100 dark:bg-slate-800" : "bg-slate-50 dark:bg-slate-900"}`}>
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-5 pb-5 sm:pt-6 sm:pb-6 bg-slate-50 dark:bg-gray-950/50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Memuat profil...</p>
                </div>
              ) : !data ? (
                <Empty label="Profil tidak ditemukan" />
              ) : (
                <>
                  {tab === "identitas" && <TabIdentitas b={data.biodata} />}
                  {tab === "akademik" && <TabAkademik b={data.biodata} />}
                  {tab === "fungsional" && <TabFungsional data={data.riwayat_fungsional} />}
                  {tab === "kepangkatan" && <TabKepangkatan data={data.riwayat_kepangkatan || []} />}
                  {tab === "tugas_tambahan" && <TabTugasTambahan data={data.tugas_tambahan || []} />}
                  {tab === "diklat" && <TabDiklat data={data.riwayat_diklat || []} />}
                  {tab === "pekerjaan" && <TabPekerjaan data={data.riwayat_pekerjaan || []} />}
                  {tab === "pendidikan" && <TabPendidikan data={data.riwayat_pendidikan} />}
                  {tab === "sertifikasi" && <TabSertifikasi data={data.sertifikasi} />}
                </>
              )}
            </div>

            {/* FOOTER */}
            <div className="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type StatPillTone = "indigo" | "emerald" | "amber" | "slate";
const PILL_TONES: Record<StatPillTone, { bg: string; border: string; labelText: string; valueText: string }> = {
  indigo:  { bg: "bg-indigo-50 dark:bg-indigo-500/10",   border: "border-indigo-200 dark:border-indigo-500/30",   labelText: "text-indigo-600 dark:text-indigo-300",   valueText: "text-indigo-900 dark:text-indigo-100" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/30", labelText: "text-emerald-600 dark:text-emerald-300", valueText: "text-emerald-900 dark:text-emerald-100" },
  amber:   { bg: "bg-amber-50 dark:bg-amber-500/10",     border: "border-amber-200 dark:border-amber-500/30",     labelText: "text-amber-600 dark:text-amber-300",     valueText: "text-amber-900 dark:text-amber-100" },
  slate:   { bg: "bg-slate-50 dark:bg-slate-800/50",     border: "border-slate-200 dark:border-slate-700",         labelText: "text-slate-500 dark:text-slate-400",     valueText: "text-slate-900 dark:text-slate-100" },
};

function StatPill({ label, value, tone = "slate" }: { label: string; value: string | number; tone?: StatPillTone }) {
  const t = PILL_TONES[tone];
  const display = typeof value === "number" ? value.toLocaleString("id-ID") : String(value);
  return (
    <div className={`rounded-lg px-2.5 py-1.5 border ${t.bg} ${t.border}`}>
      <div className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] ${t.labelText}`}>{label}</div>
      <div className={`text-sm sm:text-base font-semibold leading-tight mt-0.5 truncate ${t.valueText}`}>{display}</div>
    </div>
  );
}

function Section({ title, icon, children, columns = 2 }: { title: string; icon?: React.ReactNode; children: React.ReactNode; columns?: 1 | 2 }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-3">
      <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
        <h3 className="flex items-center gap-2 text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {icon && <span className="text-gray-400">{icon}</span>}
          {title}
        </h3>
      </div>
      <dl className={`p-4 grid grid-cols-1 ${columns === 2 ? "sm:grid-cols-2" : ""} gap-x-6 gap-y-2.5`}>
        {children}
      </dl>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) {
  const empty = value == null || value === "" || value === 0;
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5 border-b border-dashed border-gray-100 dark:border-gray-800 last:border-0">
      <dt className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 shrink-0">{label}</dt>
      <dd className={`text-xs sm:text-sm text-right break-words ${mono ? "font-mono" : ""}
        ${empty ? "text-gray-400 italic" : "text-gray-900 dark:text-gray-100 font-medium"}`}>
        {empty ? "—" : value}
      </dd>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
        <FiInfo className="w-6 h-6" />
      </div>
      <p className="mt-3 text-sm text-gray-500">{label}</p>
    </div>
  );
}

function TabIdentitas({ b }: { b: DosenDetail["biodata"] }) {
  return (
    <>
      <Section title="Identitas Diri" icon={<FiUser className="w-3.5 h-3.5" />}>
        <Row label="Nama Lengkap" value={b.nm_sdm} />
        <Row label="Jenis Kelamin" value={b.jk === "L" ? "Laki-laki" : b.jk === "P" ? "Perempuan" : b.jk} />
        <Row label="Tempat Lahir" value={b.tmpt_lahir} />
        <Row label="Tanggal Lahir" value={fmtDate(b.tgl_lahir)} />
        <Row label="Agama" value={b.nm_agama} />
        <Row label="NIK" value={b.nik} mono />
        <Row label="NIDN" value={b.nidn} mono />
        <Row label="NIP" value={b.nip} mono />
        <Row label="NPWP" value={b.npwp} mono />
      </Section>

      <Section title="Kontak & Alamat" icon={<FiMail className="w-3.5 h-3.5" />} columns={1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          <Row label="Email" value={b.email} />
          <Row label="No HP" value={b.no_hp} mono />
        </div>
        <Row label="Alamat" value={b.jln} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          <Row label="Desa/Kel" value={b.ds_kel} />
          <Row label="Kode Pos" value={b.kode_pos} mono />
        </div>
      </Section>
    </>
  );
}

function TabAkademik({ b }: { b: DosenDetail["biodata"] }) {
  return (
    <Section title="Penempatan & Kepegawaian" icon={<FiHome className="w-3.5 h-3.5" />}>
      <Row label="Jenis SDM" value={b.jenis_sdm} />
      <Row label="Status" value={b.status} />
      <Row label="Fakultas" value={b.nm_fakultas} />
      <Row label="Program Studi" value={b.nm_prodi} />
      <Row label="Jabatan Fungsional" value={b.jabatan_fungsional} />
    </Section>
  );
}

function TabFungsional({ data }: { data: DosenDetail["riwayat_fungsional"] }) {
  if (!data.length) return <Empty label="Belum ada riwayat jabatan fungsional" />;
  return (
    <div className="space-y-2.5">
      {data.map((r, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{r.nm_jabfung || "—"}</h4>
              <p className="text-[11px] text-gray-500 font-mono mt-0.5">{r.sk_jabfung || "—"}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] text-gray-500">TMT SK</div>
              <div className="text-xs font-mono text-gray-700 dark:text-gray-300">{fmtDate(r.tmt_sk_jabfung)}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-[11px] text-gray-500">Angka Kredit:</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 font-mono">{r.angka_kredit || "—"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabPendidikan({ data }: { data: DosenDetail["riwayat_pendidikan"] }) {
  if (!data.length) return <Empty label="Belum ada riwayat pendidikan formal" />;
  return (
    <div className="space-y-2.5">
      {data.map((r, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {r.jenjang ? r.jenjang.charAt(0) : "—"}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{r.gelar || "—"}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{r.bidang_studi || "—"}</p>
              <p className="text-[11px] text-gray-500 mt-1">{r.institusi || "—"} {r.thn_lulus && `· ${r.thn_lulus.substring(0, 4)}`}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabSertifikasi({ data }: { data: DosenDetail["sertifikasi"] }) {
  if (!data.length) return <Empty label="Belum ada riwayat sertifikasi" />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {data.map((s, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiAward className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Tahun {s.thn_sert || "—"}</span>
          </div>
          <dl className="space-y-0.5">
            <Row label="No SK" value={s.no_sert} mono />
            <Row label="NRG" value={s.nrg} mono />
            <Row label="Bidang Studi" value={s.bidang_studi} />
          </dl>
        </div>
      ))}
    </div>
  );
}

function TabKepangkatan({ data }: { data: NonNullable<DosenDetail["riwayat_kepangkatan"]> }) {
  if (!data.length) return <Empty label="Belum ada riwayat kepangkatan" />;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30">
              <th className="px-3 py-2 font-semibold">Golongan</th>
              <th className="px-3 py-2 font-semibold">Pangkat</th>
              <th className="px-3 py-2 font-semibold">SK Pangkat</th>
              <th className="px-3 py-2 font-semibold">Tgl SK</th>
              <th className="px-3 py-2 font-semibold">TMT</th>
              <th className="px-3 py-2 font-semibold text-right">Masa Kerja</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="px-3 py-2 font-mono text-gray-700 dark:text-gray-300">{r.golongan || "—"}</td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.pangkat || "—"}</td>
                <td className="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-400">{r.sk_pangkat || "—"}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.tgl_sk_pangkat || "—"}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.tmt_sk_pangkat || "—"}</td>
                <td className="px-3 py-2 text-right font-mono text-xs">
                  {(r.masa_kerja_gol_thn ?? 0)}th {(r.masa_kerja_gol_bln ?? 0)}bln
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabTugasTambahan({ data }: { data: NonNullable<DosenDetail["tugas_tambahan"]> }) {
  if (!data.length) return <Empty label="Belum ada tugas tambahan" />;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30">
              <th className="px-3 py-2 font-semibold">Jabatan</th>
              <th className="px-3 py-2 font-semibold">Unit</th>
              <th className="px-3 py-2 font-semibold">SK Tugas</th>
              <th className="px-3 py-2 font-semibold">TMT Mulai</th>
              <th className="px-3 py-2 font-semibold">TMT Selesai</th>
              <th className="px-3 py-2 font-semibold text-right">Jml Jam</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">{r.jabatan_tambahan || "—"}</td>
                <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">{r.unit || "—"}</td>
                <td className="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-400">{r.sk_tugas || "—"}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.tmt_mulai || "—"}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.tmt_selesai || "—"}</td>
                <td className="px-3 py-2 text-right font-mono text-xs">{r.jml_jam ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabDiklat({ data }: { data: NonNullable<DosenDetail["riwayat_diklat"]> }) {
  if (!data.length) return <Empty label="Belum ada riwayat diklat" />;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30">
              <th className="px-3 py-2 font-semibold">Jenis</th>
              <th className="px-3 py-2 font-semibold">Nama Diklat</th>
              <th className="px-3 py-2 font-semibold">Tempat</th>
              <th className="px-3 py-2 font-semibold">Periode</th>
              <th className="px-3 py-2 font-semibold text-right">Jam</th>
              <th className="px-3 py-2 font-semibold">Sertifikat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.jenis || "—"}</td>
                <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">{r.nama_diklat || "—"}</td>
                <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">{r.tempat || "—"}</td>
                <td className="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-400">
                  {r.tgl_mulai || "—"}
                  {r.tgl_selesai ? <> &rarr; {r.tgl_selesai}</> : null}
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs">{r.jml_jam ?? "—"}</td>
                <td className="px-3 py-2 font-mono text-[11px] text-gray-600 dark:text-gray-400">{r.no_sert || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabPekerjaan({ data }: { data: NonNullable<DosenDetail["riwayat_pekerjaan"]> }) {
  if (!data.length) return <Empty label="Belum ada riwayat pekerjaan" />;
  const isLN = (v: number | boolean | null | undefined): boolean => {
    if (v == null) return false;
    if (typeof v === "boolean") return v;
    return Number(v) === 1;
  };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30">
              <th className="px-3 py-2 font-semibold">Jabatan</th>
              <th className="px-3 py-2 font-semibold">Instansi</th>
              <th className="px-3 py-2 font-semibold">Divisi</th>
              <th className="px-3 py-2 font-semibold">Periode</th>
              <th className="px-3 py-2 font-semibold">Lokasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">
                  {r.jabatan || "—"}
                  {r.jenis_pekerjaan && (
                    <div className="text-[10px] text-gray-400 font-normal mt-0.5">{r.jenis_pekerjaan}</div>
                  )}
                </td>
                <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.instansi || "—"}</td>
                <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">{r.divisi || "—"}</td>
                <td className="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-400">
                  {r.mulai_bekerja || "—"}
                  {r.selesai_bekerja ? <> &rarr; {r.selesai_bekerja}</> : <> &rarr; sekarang</>}
                </td>
                <td className="px-3 py-2">
                  {isLN(r.luar_negeri) ? (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                      Luar Negeri
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Dalam Negeri
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

void FiPhone;
