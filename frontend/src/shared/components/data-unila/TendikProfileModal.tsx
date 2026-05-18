"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiUser, FiHome, FiAward, FiInfo, FiMail, FiCalendar } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import type { TendikItem } from "@/lib/services/data-unila/tendikDataService";

type Props = { item: TendikItem | null; onClose: () => void };

// Relative URL fallback → browser resolve ke same-origin (Kong/nginx proxy
// `/myunila-storage/*`). LAN IP tidak accessible dari browser internet.
const MINIO_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_MINIO_URL) || "";

function fotoUrl(uuid: string): string {
  return `${MINIO_BASE}/myunila-storage/photos/pegawai/${uuid.toLowerCase()}.jpg`;
}

function initials(nm?: string): string {
  if (!nm) return "?";
  const parts = nm.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fmtDate(s?: string | null): string {
  if (!s) return "—";
  try {
    const d = new Date(s.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  } catch { return s; }
}

const TABS = [
  { key: "identitas", label: "Identitas", icon: <FiUser className="w-3.5 h-3.5" /> },
  { key: "kepegawaian", label: "Kepegawaian", icon: <FiAward className="w-3.5 h-3.5" /> },
  { key: "organisasi", label: "Unit Kerja", icon: <FiHome className="w-3.5 h-3.5" /> },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function Avatar({ uuid, nama }: { uuid: string | null; nama: string }) {
  const [error, setError] = useState(false);
  const url = uuid ? fotoUrl(uuid) : null;
  return (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-lg sm:text-2xl font-bold shrink-0 overflow-hidden">
      {url && !error ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={nama} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center top" }} onError={() => setError(true)} />
      ) : (
        <span className="tracking-wider">{initials(nama)}</span>
      )}
    </div>
  );
}

export default function TendikProfileModal({ item, onClose }: Props) {
  const [tab, setTab] = useState<TabKey>("identitas");

  useEffect(() => {
    if (!item) return;
    setTab("identitas");
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <AnimatePresence>
      {item && (
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
            className="relative w-full max-w-3xl max-h-[95vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* HERO — subtle slate gradient */}
            <div className="relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-gray-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 pt-8 sm:pt-10 pb-5 sm:pb-6">
              <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                <Avatar uuid={item.uuid_pegawai} nama={item.nm_pegawai} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-tight truncate">{item.nm_pegawai}</h2>
                      <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-mono truncate">
                        NIP: {item.nip || "—"} · ID: {item.id_pegawai}
                      </p>
                      <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {item.jns_pegawai || "—"}
                        {item.nm_org1 && <span> · {item.nm_org1}</span>}
                      </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg w-8 h-8 flex items-center justify-center shrink-0">
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <StatPill label="Status" value={item.status || "—"} tone="slate" />
                    <StatPill label="Golongan" value={item.golongan || "—"} tone="indigo" />
                    <StatPill label="Pendidikan" value={item.pendidikan_terakhir || "—"} tone="emerald" />
                    <StatPill label="Jabatan" value={item.nm_jabfung || item.nm_jabstruk || "—"} tone="amber" />
                  </div>
                </div>
              </div>
            </div>

            {/* TABS */}
            <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-slate-800 pt-3 overflow-x-auto overflow-y-hidden scrollbar-hide [-webkit-overflow-scrolling:touch]">
              <div className="inline-flex flex-nowrap items-end gap-1 px-4 sm:px-6 min-w-full">
                {TABS.map((t) => {
                  const active = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={`px-3 py-2.5 text-[11px] sm:text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5
                        ${active
                          ? "border-slate-900 text-slate-900 dark:text-white dark:border-white"
                          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                    >
                      {t.icon} {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-5 pb-5 sm:pt-6 sm:pb-6 bg-slate-50 dark:bg-gray-950/50">
              {tab === "identitas" && (
                <>
                  <Section title="Identitas Diri" icon={<FiUser className="w-3.5 h-3.5" />}>
                    <Row label="Nama" value={item.nm_pegawai} />
                    <Row label="Jenis Kelamin" value={item.jk === "L" ? "Laki-laki" : item.jk === "P" ? "Perempuan" : item.jk} />
                    <Row label="Tempat Lahir" value={item.tmp_lahir} />
                    <Row label="Tanggal Lahir" value={fmtDate(item.tgl_lahir)} />
                    <Row label="ID Pegawai" value={item.id_pegawai} mono />
                    <Row label="NIP" value={item.nip} mono />
                    <Row label="Pendidikan Terakhir" value={item.pendidikan_terakhir} />
                  </Section>
                </>
              )}
              {tab === "kepegawaian" && (
                <>
                  <Section title="Status Kepegawaian" icon={<FiAward className="w-3.5 h-3.5" />}>
                    <Row label="Jenis Pegawai" value={item.jns_pegawai} />
                    <Row label="Jenis Tenaga" value={item.jns_tenaga || "Tendik"} />
                    <Row label="Status" value={item.status} />
                    <Row label="Golongan" value={item.golongan} />
                    <Row label="Pangkat" value={item.pangkat} />
                    <Row label="TMT CPNS" value={fmtDate(item.tmt_cpns)} />
                    <Row label="TMT PNS" value={fmtDate(item.tmt_pns)} />
                    <Row label="TMT Pensiun" value={fmtDate(item.tmt_pensiun)} />
                  </Section>
                  <Section title="Jabatan" icon={<FiAward className="w-3.5 h-3.5" />}>
                    <Row label="Jabatan Fungsional" value={item.nm_jabfung} />
                    <Row label="Jabatan Struktural" value={item.nm_jabstruk} />
                  </Section>
                </>
              )}
              {tab === "organisasi" && (
                <Section title="Unit Kerja (Hierarki)" icon={<FiHome className="w-3.5 h-3.5" />} columns={1}>
                  <Row label="Unit Org 1 (Fakultas/Lembaga)" value={item.nm_org1} />
                  <Row label="Unit Org 2 (Jurusan/Bagian)" value={item.nm_org2} />
                  <Row label="Unit Org 3 (Prodi/Sub Bagian)" value={item.nm_org3} />
                </Section>
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

type StatPillTone = "indigo" | "emerald" | "amber" | "slate";
const PILL_TONES: Record<StatPillTone, { bg: string; border: string; labelText: string; valueText: string }> = {
  indigo:  { bg: "bg-indigo-50 dark:bg-indigo-500/10",   border: "border-indigo-200 dark:border-indigo-500/30",   labelText: "text-indigo-600 dark:text-indigo-300",   valueText: "text-indigo-900 dark:text-indigo-100" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/30", labelText: "text-emerald-600 dark:text-emerald-300", valueText: "text-emerald-900 dark:text-emerald-100" },
  amber:   { bg: "bg-amber-50 dark:bg-amber-500/10",     border: "border-amber-200 dark:border-amber-500/30",     labelText: "text-amber-600 dark:text-amber-300",     valueText: "text-amber-900 dark:text-amber-100" },
  slate:   { bg: "bg-slate-50 dark:bg-slate-800/50",     border: "border-slate-200 dark:border-slate-700",         labelText: "text-slate-500 dark:text-slate-400",     valueText: "text-slate-900 dark:text-slate-100" },
};

function StatPill({ label, value, tone = "slate" }: { label: string; value: string; tone?: StatPillTone }) {
  const t = PILL_TONES[tone];
  return (
    <div className={`rounded-lg px-2.5 py-1.5 border ${t.bg} ${t.border}`}>
      <div className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] ${t.labelText}`}>{label}</div>
      <div className={`text-sm sm:text-base font-semibold leading-tight mt-0.5 truncate ${t.valueText}`}>{value}</div>
    </div>
  );
}

function Section({ title, icon, children, columns = 2 }: { title: string; icon?: React.ReactNode; children: React.ReactNode; columns?: 1 | 2 }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-3">
      <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
        <h3 className="flex items-center gap-2 text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          {icon && <span className="text-gray-400">{icon}</span>} {title}
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

void FiInfo; void FiMail; void FiCalendar; void MdSchool;
