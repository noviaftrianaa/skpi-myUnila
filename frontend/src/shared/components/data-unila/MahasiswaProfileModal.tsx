"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiX, FiUser, FiBookOpen, FiKey, FiUsers, FiTrendingUp, FiInfo,
  FiMail, FiPhone, FiMapPin, FiCalendar, FiAward, FiHome, FiBriefcase,
  FiDownload,
} from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import mahasiswaDataService, {
  type MahasiswaFullProfile,
  type MahasiswaProfileSiakadu,
  type MahasiswaProfilePddikti,
} from "@/lib/services/data-unila/mahasiswaDataService";
import toast from "react-hot-toast";

type Props = {
  idPd: string | null;
  onClose: () => void;
};

const TABS = [
  { key: "identitas", label: "Identitas", icon: <FiUser className="w-3.5 h-3.5" /> },
  { key: "akademik",  label: "Akademik",  icon: <FiBookOpen className="w-3.5 h-3.5" /> },
  { key: "jalur",     label: "Jalur Masuk", icon: <FiKey className="w-3.5 h-3.5" /> },
  { key: "keluarga",  label: "Keluarga",  icon: <FiUsers className="w-3.5 h-3.5" /> },
  { key: "riwayat",   label: "Riwayat",   icon: <FiTrendingUp className="w-3.5 h-3.5" /> },
  { key: "lainnya",   label: "Lainnya",   icon: <FiInfo className="w-3.5 h-3.5" /> },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_DOT: Record<string, string> = {
  Aktif: "bg-emerald-400",
  Lulus: "bg-violet-400",
  Cuti: "bg-amber-400",
  DO: "bg-rose-400",
};

function initials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const MINIO_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_MINIO_URL) ||
  "http://192.168.120.47:9000";

function fotoUrl(idPd: string): string {
  return `${MINIO_BASE}/myunila-storage/photos/pd/${idPd}.jpg`;
}

function Avatar({ idPd, nama }: { idPd: string | null; nama: string }) {
  const [error, setError] = useState(false);
  const url = idPd ? fotoUrl(idPd) : null;
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

function fmtDate(s?: string | null): string {
  if (!s) return "—";
  try {
    const d = new Date(s.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  } catch { return s; }
}

export default function MahasiswaProfileModal({ idPd, onClose }: Props) {
  const [data, setData] = useState<MahasiswaFullProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("identitas");

  useEffect(() => {
    if (!idPd) return;
    setLoading(true);
    setData(null);
    setTab("identitas");
    mahasiswaDataService
      .getFullProfile(idPd)
      .then(setData)
      .catch(() => toast.error("Gagal memuat profil mahasiswa"))
      .finally(() => setLoading(false));
  }, [idPd]);

  // Lock body + ESC
  useEffect(() => {
    if (!idPd) return;
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [idPd, onClose]);

  // SIAKADU sudah dihapus dari backend (data.siakadu = null) — semua dari pdrd schema.
  // Kita gunakan PDDikti sebagai sumber utama, fallback ke siakadu (backward compat kalau-kalau).
  // Cast `s` ke pddikti so existing field accessors (s.jk, s.tmpt_lahir, dst) tetap bekerja.
  const p: Partial<MahasiswaProfilePddikti> = data?.pddikti || {};
  const s: Partial<MahasiswaProfileSiakadu> = (data?.siakadu || p) as Partial<MahasiswaProfileSiakadu>;
  const nama = s.nama || p.nama || "—";
  const nim = s.nim || p.nim || "—";
  const prodi = s.nm_prodi || p.nm_prodi;
  const fakultas = s.nm_fakultas || p.nm_fakultas;
  const status = (p.status || s.status_mahasiswa || "—") as string;
  const ipk = s.ipk || p.ipk;

  return (
    <AnimatePresence>
      {idPd && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={onClose} />

          {/* Panel */}
          <motion.div
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-4xl max-h-[95vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* HERO — subtle slate gradient, profesional. Padding atas 8/10 untuk napas longgar */}
            <div className="relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-gray-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 pt-8 sm:pt-10 pb-5 sm:pb-6">
              <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                <Avatar idPd={idPd} nama={nama} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-tight truncate">
                        {s.gelar_depan ? `${s.gelar_depan} ` : ""}
                        {nama}
                        {s.gelar_belakang ? `, ${s.gelar_belakang}` : ""}
                      </h2>
                      <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        <span className="font-mono">{nim}</span>
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

                  {/* Stat pills — subtle pastel per kategori (indigo/emerald/amber/slate+dot) */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <StatPill label="IPK" value={normalizeIpk(ipk)} tone="indigo" />
                    <StatPill
                      label="SKS"
                      value={
                        s.sks_total || s.sks_lulus
                          ? `${fmtSks(s.sks_lulus)}/${fmtSks(s.sks_total)}`
                          : "—"
                      }
                      tone="emerald"
                    />
                    <StatPill
                      label="Semester"
                      value={
                        s.semester ? String(s.semester) : (data?.riwayat_semester?.length ? String(data.riwayat_semester.length) : "—")
                      }
                      tone="amber"
                    />
                    <StatPill
                      label="Status"
                      value={status}
                      statusDot={STATUS_DOT[status]}
                      tone="slate"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TABS — spacing dari hero + body via padding atas/bawah */}
            <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-slate-800 pt-3 overflow-x-auto overflow-y-hidden scrollbar-hide [-webkit-overflow-scrolling:touch]">
              <div className="inline-flex flex-nowrap items-end gap-1 px-4 sm:px-6 min-w-full">
                {TABS.map((t) => {
                  const active = tab === t.key;
                  const badge = t.key === "keluarga" ? data?.keluarga.length : t.key === "riwayat" ? data?.riwayat_semester.length : undefined;
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

            {/* BODY — pt-5 buat napas dari tab divider */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-5 pb-5 sm:pt-6 sm:pb-6 bg-slate-50 dark:bg-gray-950/50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Memuat profil...</p>
                </div>
              ) : !data ? (
                <SectionEmpty icon={<FiUser className="w-6 h-6" />} label="Profil tidak ditemukan" />
              ) : (
                <>
                  {tab === "identitas" && <TabIdentitas s={s} p={p} />}
                  {tab === "akademik" && <TabAkademik s={s} p={p} />}
                  {tab === "jalur" && <TabJalur s={s} p={p} />}
                  {tab === "keluarga" && <TabKeluarga data={data.keluarga} />}
                  {tab === "riwayat" && <TabRiwayat data={data.riwayat_semester} />}
                  {tab === "lainnya" && <TabLainnya s={s} />}
                </>
              )}
            </div>

            {/* FOOTER */}
            <div className="px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                {(s.last_sync || p.last_sync) && (
                  <span>Sync terakhir: <span className="font-mono">{(s.last_sync || p.last_sync)}</span></span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
 * STAT PILL (hero)
 * ============================================================ */

type StatPillTone = "indigo" | "emerald" | "amber" | "slate";

const PILL_TONES: Record<StatPillTone, { bg: string; border: string; labelText: string; valueText: string }> = {
  indigo:  { bg: "bg-indigo-50 dark:bg-indigo-500/10",  border: "border-indigo-200 dark:border-indigo-500/30",  labelText: "text-indigo-600 dark:text-indigo-300",   valueText: "text-indigo-900 dark:text-indigo-100" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/30", labelText: "text-emerald-600 dark:text-emerald-300", valueText: "text-emerald-900 dark:text-emerald-100" },
  amber:   { bg: "bg-amber-50 dark:bg-amber-500/10",   border: "border-amber-200 dark:border-amber-500/30",   labelText: "text-amber-600 dark:text-amber-300",     valueText: "text-amber-900 dark:text-amber-100" },
  slate:   { bg: "bg-slate-50 dark:bg-slate-800/50",   border: "border-slate-200 dark:border-slate-700",       labelText: "text-slate-500 dark:text-slate-400",     valueText: "text-slate-900 dark:text-slate-100" },
};

function StatPill({
  label, value, tone = "slate", statusDot,
}: { label: string; value: string | number; tone?: StatPillTone; statusDot?: string }) {
  const t = PILL_TONES[tone];
  return (
    <div className={`rounded-lg px-2.5 py-1.5 border ${t.bg} ${t.border}`}>
      <div className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] ${t.labelText}`}>
        {label}
      </div>
      <div className={`flex items-center gap-1.5 text-sm sm:text-base font-semibold leading-tight tabular-nums mt-0.5 ${t.valueText}`}>
        {statusDot && <span className={`w-2 h-2 rounded-full ${statusDot} shrink-0`} />}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

// Normalize IPK: '.00' or 0 → '—' agar tidak misleading
function normalizeIpk(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (!Number.isFinite(n) || n <= 0) return "—";
  return n.toFixed(2);
}

// SKS — integer (tidak ada .00), null/0 → 0
function fmtSks(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "0";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (!Number.isFinite(n)) return "0";
  return String(Math.round(n));
}

// IPS/IPK row format — keep 2 decimals; show "—" untuk null/0
function fmtIpk(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (!Number.isFinite(n) || n <= 0) return "—";
  return n.toFixed(2);
}

/* ============================================================
 * SHARED PRIMITIVES
 * ============================================================ */

function ProfileSection({
  title, icon, columns = 2, children,
}: { title: string; icon?: React.ReactNode; columns?: 1 | 2; children: React.ReactNode }) {
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

function Row({
  label, value, mono,
}: { label: string; value?: string | number | null; mono?: boolean }) {
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

function SectionEmpty({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <p className="mt-3 text-sm text-gray-500">{label}</p>
    </div>
  );
}

/* ============================================================
 * TAB CONTENTS
 * ============================================================ */

function TabIdentitas({
  s, p,
}: { s: Partial<MahasiswaProfileSiakadu>; p: Partial<MahasiswaProfilePddikti> }) {
  const jk = s.jk || p.jk;
  const tmpt = s.tmpt_lahir || p.tmpt_lahir;
  const tgl = s.tgl_lahir || p.tgl_lahir;
  const agama = s.nama_agama || p.nama_agama;
  const nik = s.nik || p.nik;
  const nisn = s.nisn || p.nisn;
  const email = s.email || p.email;
  const emailKampus = s.email_kampus;
  const hp = s.hp || p.hp;
  const alamat = s.alamat || p.alamat;

  return (
    <>
      <ProfileSection title="Identitas Diri" icon={<FiUser className="w-3.5 h-3.5" />}>
        <Row label="Jenis Kelamin" value={jk === "L" ? "Laki-laki" : jk === "P" ? "Perempuan" : jk} />
        <Row label="Tempat Lahir" value={tmpt} />
        <Row label="Tanggal Lahir" value={fmtDate(tgl)} />
        <Row label="Status Nikah" value={s.status_nikah} />
        <Row label="Agama" value={agama} />
        <Row label="Gol. Darah" value={s.gol_darah} />
        <Row label="NIK" value={nik} mono />
        <Row label="NISN" value={nisn} mono />
        <Row label="NUPN" value={s.nupn} mono />
        <Row label="No. KK" value={s.nokk} mono />
      </ProfileSection>

      <ProfileSection title="Kontak" icon={<FiMail className="w-3.5 h-3.5" />}>
        <Row label="Email Pribadi" value={email} />
        <Row label="Email Kampus" value={emailKampus} />
        <Row label="Email Ortu" value={s.email_ortu} />
        <Row label="HP" value={hp} mono />
        <Row label="HP Cadangan" value={s.hp2} mono />
        <Row label="Telepon" value={s.telepon} mono />
      </ProfileSection>

      <ProfileSection title="Alamat" icon={<FiMapPin className="w-3.5 h-3.5" />} columns={1}>
        <Row label="Alamat" value={alamat} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2.5">
          <Row label="RT" value={s.rt} />
          <Row label="RW" value={s.rw} />
          <Row label="Kode Pos" value={s.kode_pos} mono />
          <Row label="Dusun" value={s.dusun} />
        </div>
        <Row label="Desa/Kel" value={s.desa} />
        <Row label="Kecamatan" value={s.kecamatan} />
        <Row label="Kota" value={s.nama_kota} />
        <Row label="Wilayah (PDDikti)" value={p.nama_wilayah} />
      </ProfileSection>
    </>
  );
}

function TabAkademik({
  s, p,
}: { s: Partial<MahasiswaProfileSiakadu>; p: Partial<MahasiswaProfilePddikti> }) {
  const prodi = s.nm_prodi || p.nm_prodi;
  const fak = s.nm_fakultas || p.nm_fakultas;
  return (
    <>
      <ProfileSection title="Program Studi" icon={<MdSchool className="w-3.5 h-3.5" />}>
        <Row label="Fakultas" value={fak} />
        <Row label="Jurusan" value={s.nm_jurusan} />
        <Row label="Program Studi" value={prodi} />
        <Row label="Bidang Studi" value={s.nm_bidang_studi} />
        <Row label="Angkatan" value={p.angkatan} />
        <Row label="Semester Masuk" value={p.semester_masuk} mono />
        <Row label="Periode Terakhir" value={s.periode_terakhir} />
        <Row label="Kelas" value={s.nama_kelas} />
      </ProfileSection>

      <ProfileSection title="Progress Akademik" icon={<FiAward className="w-3.5 h-3.5" />}>
        <Row label="IPK Total" value={s.ipk || p.ipk} mono />
        <Row label="Semester Aktif" value={s.semester} />
        <Row label="SKS Total" value={s.sks_total != null ? fmtSks(s.sks_total) : null} />
        <Row label="SKS Lulus" value={s.sks_lulus != null ? fmtSks(s.sks_lulus) : null} />
        <Row label="Status" value={s.status_mahasiswa || p.status} />
        <Row label="Kategori UKT" value={s.kategori_ukt} />
      </ProfileSection>

      {p.tgl_keluar && (
        <ProfileSection title="Keluar" icon={<FiCalendar className="w-3.5 h-3.5" />}>
          <Row label="Tanggal Keluar" value={fmtDate(p.tgl_keluar)} />
        </ProfileSection>
      )}
    </>
  );
}

function TabJalur({
  s, p,
}: { s: Partial<MahasiswaProfileSiakadu>; p: Partial<MahasiswaProfilePddikti> }) {
  return (
    <>
      <ProfileSection title="Jalur Pendaftaran" icon={<FiKey className="w-3.5 h-3.5" />}>
        <Row label="Jalur Pendaftaran" value={s.jalur_pendaftaran || p.jalur_masuk} />
        <Row label="Jenis Pendaftaran" value={p.jenis_pendaftaran} />
        <Row label="Gelombang" value={s.gelombang} />
        <Row label="Tanggal Daftar" value={fmtDate(s.tgl_daftar)} />
        <Row label="Beasiswa" value={s.is_beasiswa ? "Ya" : "Tidak"} />
      </ProfileSection>

      {(s.nilai_tpa || s.nilai_kesehatan || s.nilai_psikotes || s.nilai_wawancara) && (
        <ProfileSection title="Nilai Seleksi" icon={<FiAward className="w-3.5 h-3.5" />}>
          <Row label="TPA" value={s.nilai_tpa} mono />
          <Row label="Kesehatan" value={s.nilai_kesehatan} mono />
          <Row label="Psikotes" value={s.nilai_psikotes} mono />
          <Row label="Wawancara" value={s.nilai_wawancara} mono />
        </ProfileSection>
      )}

      {(s.is_transfer || s.univ_asal) && (
        <ProfileSection title="Mahasiswa Pindahan" icon={<FiBriefcase className="w-3.5 h-3.5" />}>
          <Row label="Pindahan" value={s.is_transfer ? "Ya" : "Tidak"} />
          <Row label="Jenis Transfer" value={s.jenis_transfer} />
          <Row label="Tanggal Transfer" value={fmtDate(s.tgl_transfer)} />
          <Row label="NIM Lama" value={s.nim_lama} mono />
          <Row label="Universitas Asal" value={s.univ_asal} />
          <Row label="Prodi Asal" value={s.prodi_asal} />
          <Row label="IPK Asal" value={s.ipk_asal} mono />
          <Row label="SKS Asal" value={s.sks_asal} />
          <Row label="Instansi" value={s.instansi} />
        </ProfileSection>
      )}

      {(s.asal_smu || s.no_ijazah_smu) && (
        <ProfileSection title="Sekolah Asal (SMA/SMK)" icon={<FiHome className="w-3.5 h-3.5" />}>
          <Row label="Nama Sekolah" value={s.asal_smu} />
          <Row label="Jurusan" value={s.jurusan_sekolah} />
          <Row label="Tahun Lulus" value={s.thn_lulus_sekolah} />
          <Row label="NEM/UN" value={s.nem} mono />
          <Row label="No. Ijazah" value={s.no_ijazah_smu} mono />
          <Row label="Alamat" value={s.alamat_smu} />
          <Row label="Telp Sekolah" value={s.telp_smu} mono />
        </ProfileSection>
      )}
    </>
  );
}

function TabKeluarga({ data }: { data: MahasiswaFullProfile["keluarga"] }) {
  if (!data.length) {
    return <SectionEmpty icon={<FiUsers className="w-6 h-6" />} label="Data keluarga tidak tersedia" />;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {data.map((k, idx) => {
        const badge =
          k.status_keluarga === "Ayah" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
          : k.status_keluarga === "Ibu" ? "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300"
          : "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300";
        return (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-full ring-1 ring-inset ${badge}`}>
                {k.status_keluarga}
              </span>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">{k.nama || "—"}</h4>
              <dl className="mt-3 space-y-0.5">
                <Row label="NIK" value={k.nik} mono />
                <Row label="Tgl Lahir" value={fmtDate(k.tgl_lahir)} />
                <Row label="Pekerjaan" value={k.pekerjaan} />
                <Row label="Penghasilan" value={k.penghasilan} />
                <Row label="Pendidikan" value={k.pendidikan_terakhir} />
                <Row label="No HP" value={k.no_hp} mono />
                <Row label="Alamat" value={k.alamat} />
              </dl>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TabRiwayat({ data }: { data: MahasiswaFullProfile["riwayat_semester"] }) {
  if (!data.length) {
    return <SectionEmpty icon={<FiTrendingUp className="w-6 h-6" />} label="Riwayat semester tidak tersedia" />;
  }

  // IPK trend chart
  const points = data
    .filter((d) => d.ipk != null && d.ipk !== "")
    .map((d) => ({ semester: d.semester || d.id_smt, ipk: parseFloat(String(d.ipk)) }))
    .filter((d) => !Number.isNaN(d.ipk));

  return (
    <>
      {points.length >= 2 && <IpkChart data={points} />}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden mt-3">
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
          <h3 className="flex items-center gap-2 text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            <FiTrendingUp className="w-3.5 h-3.5 text-gray-400" />
            Tabel Riwayat Semester
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30">
                <th className="px-3 py-2 font-semibold text-center w-12">Smt</th>
                <th className="px-3 py-2 font-semibold">Semester</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold text-right">SKS</th>
                <th className="px-3 py-2 font-semibold text-right">Total</th>
                <th className="px-3 py-2 font-semibold text-right">IPS</th>
                <th className="px-3 py-2 font-semibold text-right">IPK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {[...data].reverse().map((d, i) => {
                // Smt number: original asc position + 1 (1, 2, ..., N). Table sorted desc.
                const smtNo = data.length - i;
                return (
                  <tr key={d.id_smt + "-" + i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-3 py-2 text-center font-mono font-semibold text-slate-900 dark:text-slate-100">{smtNo}</td>
                    <td className="px-3 py-2 font-mono text-gray-700 dark:text-gray-300">{d.semester || d.id_smt}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{d.status || "—"}</td>
                    <td className="px-3 py-2 text-right font-mono">{fmtSks(d.sks_semester)}</td>
                    <td className="px-3 py-2 text-right font-mono">{fmtSks(d.total_sks)}</td>
                    <td className="px-3 py-2 text-right font-mono">{fmtIpk(d.ips)}</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">{fmtIpk(d.ipk)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function IpkChart({ data }: { data: Array<{ semester: string; ipk: number }> }) {
  const max = 4.0;
  // Horizontal padding agar label "2.89" / "Ganjil" tidak kepotong di edge
  const padX = 40;
  const padTop = 20;
  const padBottom = 24;
  const w = 600, h = 120;
  const innerW = w - padX * 2;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
  const pts = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = padTop + (h - (Math.min(d.ipk, max) / max) * h);
    return { x, y, d };
  });
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const baseline = padTop + h;
  const area = `${padX},${baseline} ${polyline} ${w - padX},${baseline}`;

  // viewBox preserveAspectRatio default (meet) — chart scale proportional, label tidak gepeng
  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Trend IPK
        </h3>
        <span className="text-[10px] text-gray-500 dark:text-gray-400">
          Skala 0.0 – 4.0
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h + padTop + padBottom}`} className="w-full h-auto block">
        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1={padX} x2={w - padX} y1={padTop + h * t} y2={padTop + h * t}
            className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="0.5" strokeDasharray="4 4" />
        ))}
        {/* Area fill */}
        <polygon points={area} className="fill-slate-400/15 dark:fill-slate-300/10" />
        {/* Line */}
        <polyline points={polyline}
          className="fill-none stroke-slate-700 dark:stroke-slate-200" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Points + labels */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3"
              className="fill-white stroke-slate-700 dark:stroke-slate-200" strokeWidth="1.5" />
            <text x={p.x} y={p.y - 8} textAnchor="middle"
              className="text-[10px] fill-gray-700 dark:fill-gray-200 font-mono font-bold">
              {p.d.ipk.toFixed(2)}
            </text>
            <text x={p.x} y={baseline + 16} textAnchor="middle"
              className="text-[9px] fill-gray-500 dark:fill-gray-400">
              {p.d.semester.length > 6 ? p.d.semester.slice(-6) : p.d.semester}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function TabLainnya({ s }: { s: Partial<MahasiswaProfileSiakadu> }) {
  return (
    <>
      <ProfileSection title="Data Fisik" icon={<FiUser className="w-3.5 h-3.5" />}>
        <Row label="Berat Badan" value={s.berat_badan ? `${s.berat_badan} kg` : null} />
        <Row label="Tinggi Badan" value={s.tinggi_badan ? `${s.tinggi_badan} cm` : null} />
        <Row label="Gol. Darah" value={s.gol_darah} />
      </ProfileSection>

      <ProfileSection title="Minat & Hobi" icon={<FiInfo className="w-3.5 h-3.5" />}>
        <Row label="Hobi" value={s.nama_hobi} />
        <Row label="Minat" value={s.nama_minat} />
        <Row label="Suku" value={s.nama_suku} />
        <Row label="Negara" value={s.nama_negara} />
        <Row label="Jenis Tinggal" value={s.jenis_tinggal} />
        <Row label="Transportasi" value={s.nama_transport} />
      </ProfileSection>

      <ProfileSection title="Latar Belakang Ekonomi" icon={<FiBriefcase className="w-3.5 h-3.5" />}>
        <Row label="Pekerjaan" value={s.nama_pekerjaan} />
        <Row label="Penghasilan" value={s.nama_penghasilan} />
      </ProfileSection>
    </>
  );
}

// Silence unused-import warnings
void FiDownload;
void FiPhone;
