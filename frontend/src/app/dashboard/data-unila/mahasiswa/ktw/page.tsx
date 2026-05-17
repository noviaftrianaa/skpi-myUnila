"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import Dropdown, { type DropdownOption } from "@/shared/components/data-unila/Dropdown";
import ExportMenu, { type ExportFormat } from "@/shared/components/data-unila/ExportMenu";
import MahasiswaProfileModal from "@/shared/components/data-unila/MahasiswaProfileModal";
import mahasiswaDataService from "@/lib/services/data-unila/mahasiswaDataService";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import { MdSchool } from "react-icons/md";
import {
  FiUsers, FiClock, FiAward, FiTrendingUp, FiFilter, FiRotateCcw, FiX,
  FiCalendar, FiDatabase, FiInfo,
} from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import {
  ktwDataService,
  type KtwMahasiswaFlatRow,
  type KtwRekapFakultasRow,
  type KtwRekapProdiRow,
  type JenjangKode,
} from "@/lib/services/data-unila/ktwDataService";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { exportToCsv, exportToJson } from "@/lib/utils/exportCsv";
import { exportToPdf } from "@/lib/utils/exportPdf";

const APP_KEY = "data-unila";

const JENJANG_OPTIONS: JenjangKode[] = ["D3", "D4", "S1", "S2", "S3"];
const MASA_MAP: Record<JenjangKode, number> = { D3: 3, D4: 4, S1: 4, S2: 2, S3: 3 };

function defaultCohort(j: JenjangKode): number {
  return new Date().getFullYear() - MASA_MAP[j] - 1;
}

/* ---------- helpers ---------- */
function num(v?: string | number | null): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isNaN(n) ? 0 : n;
}
function fmt(n: number): string {
  return n.toLocaleString("id-ID");
}
function pct(part: number, total: number): string {
  if (!total) return "—";
  return `${((part / total) * 100).toFixed(1)}%`;
}
function fmtDate(s?: string | null): string {
  if (!s) return "—";
  try {
    const d = new Date(s.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return s; }
}
function fmtTahunBulan(masaMukimTahun?: number | null): string {
  if (masaMukimTahun == null || masaMukimTahun <= 0) return "—";
  const tahun = Math.floor(masaMukimTahun);
  const bulan = Math.round((masaMukimTahun - tahun) * 12);
  if (tahun === 0) return `${bulan} bln`;
  if (bulan === 0) return `${tahun} thn`;
  return `${tahun} thn ${bulan} bln`;
}

/* ---------- StatCard ---------- */
function StatCard({
  icon, label, value, gradient, subtext,
}: {
  icon: React.ReactNode; label: string; value: string | number; gradient: string; subtext?: string;
}) {
  const display = typeof value === "number" ? fmt(value) : value;
  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br ${gradient}`}>
      <div className="absolute -top-10 -right-8 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10 flex items-center gap-3 p-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-inset ring-white/25 flex items-center justify-center text-white shadow-inner">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-white/80 uppercase tracking-[0.1em]">{label}</p>
          <h3 className="text-2xl font-extrabold text-white tabular-nums leading-tight">{display}</h3>
          {subtext && <p className="text-[11px] text-white/70 mt-0.5">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */

export default function KtwRawDataPage() {
  useRequireAuth();
  const scope = useRoleBasedScope();
  const forcedFak = scope.forcedFakultas || "";
  const forcedProdi = scope.forcedProdi || "";

  const [jenjang, setJenjang] = useState<JenjangKode>("S1");
  const [cohort, setCohort] = useState<number>(defaultCohort("S1"));
  const [cutoff, setCutoff] = useState<string>("");
  const [idFakultas, setIdFakultas] = useState<string>(forcedFak);
  const [idProdi, setIdProdi] = useState<string>(forcedProdi);
  const [statusKeluar, setStatusKeluar] = useState<string>("");
  const [search, setSearch] = useState("");

  const [data, setData] = useState<KtwMahasiswaFlatRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  const [fakultasList, setFakultasList] = useState<KtwRekapFakultasRow[]>([]);
  const [prodiList, setProdiList] = useState<KtwRekapProdiRow[]>([]);
  const [presets, setPresets] = useState<Array<{ group: string; label: string; value: string }>>([]);
  const [selectedIdPd, setSelectedIdPd] = useState<string | null>(null);

  const handleOpenProfile = useCallback(async (nim: string) => {
    try {
      const idPd = await mahasiswaDataService.resolveByNim(nim);
      if (!idPd) { toast.error("Mahasiswa tidak ditemukan"); return; }
      setSelectedIdPd(idPd);
    } catch { toast.error("Gagal memuat profil"); }
  }, []);

  const cohortOptions = useMemo(() => {
    const max = new Date().getFullYear() - MASA_MAP[jenjang];
    return Array.from({ length: 12 }, (_, i) => max - i);
  }, [jenjang]);

  useEffect(() => { setIdFakultas(forcedFak); }, [forcedFak]);
  useEffect(() => { setIdProdi(forcedProdi); }, [forcedProdi]);

  // Fetch rekap (fak + prodi list)
  const fetchRekap = useCallback(async () => {
    try {
      const [fak, prd] = await Promise.all([
        ktwDataService.getFakultasRekap({ cohort, jenjang, cutoff: cutoff || undefined }),
        ktwDataService.getProdiRekap({
          cohort, jenjang,
          cutoff: cutoff || undefined,
          id_fakultas: idFakultas || undefined,
        }),
      ]);
      setFakultasList(fak);
      setProdiList(prd);
    } catch { /* ignore */ }
  }, [cohort, jenjang, cutoff, idFakultas]);

  // Fetch mahasiswa flat list
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const r = await ktwDataService.getMahasiswaFlat({
        cohort, jenjang,
        cutoff: cutoff || undefined,
        id_fakultas: idFakultas || undefined,
        id_prodi: idProdi || undefined,
        status_keluar: statusKeluar || undefined,
        search: search || undefined,
        page, per_page: limit,
      });
      setData(r.data);
      setTotal(r.pagination.total);
    } catch {
      toast.error("Gagal memuat daftar mahasiswa");
    } finally {
      setLoading(false);
    }
  }, [cohort, jenjang, cutoff, idFakultas, idProdi, statusKeluar, search, page, limit]);

  useEffect(() => {
    ktwDataService.getPresets().then(setPresets).catch(() => setPresets([]));
  }, []);
  useEffect(() => { fetchRekap(); }, [fetchRekap]);
  useEffect(() => { fetchList(); }, [fetchList]);

  /* ---------- Aggregates ---------- */
  const aggregate = useMemo(() => {
    const totalMaba = fakultasList.reduce((a, f) => a + f.maba, 0);
    const totalLulus = fakultasList.reduce((a, f) => a + f.sudah_lulus, 0);
    const totalKtw = fakultasList.reduce((a, f) => a + f.ktw_strict, 0);
    const totalKtwTol = fakultasList.reduce((a, f) => a + f.ktw_tolerant, 0);
    return {
      totalMaba,
      totalLulus,
      totalKtw,
      totalKtwTol,
      pctKtw: totalMaba > 0 ? (totalKtw / totalMaba) * 100 : 0,
      pctSurvival: totalMaba > 0 ? (totalLulus / totalMaba) * 100 : 0,
    };
  }, [fakultasList]);

  /* ---------- Filter options ---------- */
  const fakOptions: DropdownOption[] = fakultasList
    .filter((f) => f.id_fakultas)
    .map((f) => ({ value: f.id_fakultas as string, label: f.nm_fakultas }));
  const prodiOptions: DropdownOption[] = prodiList
    .filter((p) => p.id_prodi)
    .map((p) => ({ value: p.id_prodi as string, label: p.nm_prodi, sublabel: p.kode_dikti || undefined }));
  const cohortOpts: DropdownOption[] = cohortOptions.map((y) => ({ value: String(y), label: String(y) }));
  const jenjangOpts: DropdownOption[] = JENJANG_OPTIONS.map((j) => ({ value: j, label: j }));
  const statusOpts: DropdownOption[] = [
    { value: "aktif", label: "Aktif" },
    { value: "1", label: "Lulus" },
    { value: "2", label: "Mutasi" },
    { value: "3", label: "Dikeluarkan" },
    { value: "4", label: "Mengundurkan Diri" },
    { value: "5", label: "Putus Studi" },
    { value: "6", label: "Wafat" },
    { value: "7", label: "Hilang" },
  ];

  const activeChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (idFakultas && !forcedFak) {
    const f = fakOptions.find((o) => o.value === idFakultas);
    if (f) activeChips.push({ key: "fak", label: f.label, clear: () => { setIdFakultas(""); setIdProdi(""); setPage(1); } });
  }
  if (idProdi && !forcedProdi) {
    const p = prodiOptions.find((o) => o.value === idProdi);
    if (p) activeChips.push({ key: "prd", label: p.label, clear: () => { setIdProdi(""); setPage(1); } });
  }
  if (statusKeluar) activeChips.push({ key: "stat", label: `Status: ${statusOpts.find((s) => s.value === statusKeluar)?.label || statusKeluar}`, clear: () => { setStatusKeluar(""); setPage(1); } });
  if (cutoff) activeChips.push({ key: "cut", label: `Cutoff: ${cutoff}`, clear: () => { setCutoff(""); setPage(1); } });

  const hasFilter = activeChips.length > 0 || cohort !== defaultCohort(jenjang);

  const handleReset = () => {
    setStatusKeluar("");
    setCutoff("");
    if (!forcedFak) setIdFakultas("");
    if (!forcedProdi) setIdProdi("");
    setCohort(defaultCohort(jenjang));
    setPage(1);
  };

  /* ---------- Export ---------- */
  const EXPORT_HEADERS_MHS = {
    nim: "NIM",
    nama: "Nama",
    jenis_kelamin: "JK",
    angkatan: "Angkatan",
    nm_prodi: "Program Studi",
    nm_fakultas: "Fakultas",
    nm_jenjang: "Jenjang",
    nm_jalur_daftar: "Jalur Daftar",
    tgl_masuk_sp: "Tgl Masuk",
    tgl_keluar: "Tgl Keluar",
    ipk: "IPK",
    masa_mukim: "Masa Studi",
    status_keluar: "Status",
    ktw_strict: "KTW Strict",
    ktw_tolerant: "KTW Tolerant",
  } as const;

  const dataForExport = useMemo(
    () => data.map((d) => ({
      ...d,
      ipk: d.ipk != null ? Number(d.ipk).toFixed(2) : "",
      masa_mukim: fmtTahunBulan(d.masa_mukim_tahun),
      ktw_strict: d.is_ktw_strict ? "Ya" : "Tidak",
      ktw_tolerant: d.is_ktw_tolerant ? "Ya" : "Tidak",
    })),
    [data]
  );

  const buildSubtitle = () => {
    const parts: string[] = [`Jenjang: ${jenjang}`, `Angkatan: ${cohort}`];
    if (cutoff) parts.push(`Cutoff: ${cutoff}`);
    if (idFakultas) {
      const f = fakOptions.find((o) => o.value === idFakultas);
      if (f) parts.push(`Fakultas: ${f.label}`);
    }
    if (idProdi) {
      const p = prodiOptions.find((o) => o.value === idProdi);
      if (p) parts.push(`Prodi: ${p.label}`);
    }
    return parts.join("  •  ");
  };

  const handleExport = async (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") {
      // Server-side = pull semua data (max 2000 rows)
      try {
        const r = await ktwDataService.getMahasiswaFlat({
          cohort, jenjang,
          cutoff: cutoff || undefined,
          id_fakultas: idFakultas || undefined,
          id_prodi: idProdi || undefined,
          status_keluar: statusKeluar || undefined,
          search: search || undefined,
          page: 1, per_page: 2000,
        });
        if (!r.data.length) { toast.error("Tidak ada data"); return; }
        const flat = r.data.map((d) => ({
          ...d,
          ipk: d.ipk != null ? Number(d.ipk).toFixed(2) : "",
          masa_mukim: fmtTahunBulan(d.masa_mukim_tahun),
          ktw_strict: d.is_ktw_strict ? "Ya" : "Tidak",
          ktw_tolerant: d.is_ktw_tolerant ? "Ya" : "Tidak",
        }));
        exportToCsv(flat as unknown as Record<string, unknown>[], `ktw-mahasiswa-${jenjang}-${cohort}`, EXPORT_HEADERS_MHS);
        toast.success(`Berhasil export ${flat.length} mahasiswa`);
      } catch {
        toast.error("Gagal export semua data");
      }
      return;
    }

    if (!data.length) { toast.error("Tidak ada data untuk diexport"); return; }
    const baseName = `ktw-${jenjang}-${cohort}`;
    if (fmtType === "excel") {
      exportToExcel(dataForExport as unknown as Record<string, unknown>[], baseName, "KTW Mahasiswa", EXPORT_HEADERS_MHS);
      toast.success("Excel berhasil di-download");
    } else if (fmtType === "csv-client") {
      exportToCsv(dataForExport as unknown as Record<string, unknown>[], baseName, EXPORT_HEADERS_MHS);
      toast.success("CSV berhasil di-download");
    } else if (fmtType === "pdf") {
      exportToPdf(dataForExport as unknown as Record<string, unknown>[], baseName, {
        title: `Data KTW — ${jenjang} Angkatan ${cohort}`,
        subtitle: buildSubtitle(),
        headers: EXPORT_HEADERS_MHS,
        orientation: "landscape",
      });
      toast.success("PDF berhasil di-download");
    } else if (fmtType === "json") {
      exportToJson(dataForExport, baseName);
      toast.success("JSON berhasil di-download");
    }
  };

  const handleExportRekap = (which: "fakultas" | "prodi") => {
    if (which === "fakultas") {
      if (!fakultasList.length) { toast.error("Tidak ada data rekap fakultas"); return; }
      exportToExcel(
        fakultasList as unknown as Record<string, unknown>[],
        `ktw-rekap-fakultas-${jenjang}-${cohort}`,
        "Rekap KTW Fakultas",
        {
          nm_fakultas: "Fakultas",
          maba: "Maba",
          sudah_lulus: "Sudah Lulus",
          ktw_strict: "KTW (Strict)",
          ktw_tolerant: "KTW (Tolerant)",
          pct_ktw_strict: "% KTW Strict",
          pct_ktw_tolerant: "% KTW Tolerant",
          pct_survival: "% Survival",
        }
      );
      toast.success("Rekap Fakultas exported");
    } else {
      if (!prodiList.length) { toast.error("Tidak ada data rekap prodi"); return; }
      const enriched = prodiList.map((p) => ({
        ...p,
        nm_fakultas: fakultasList.find((f) => f.id_fakultas === p.id_fakultas)?.nm_fakultas ?? "-",
      }));
      exportToExcel(
        enriched as unknown as Record<string, unknown>[],
        `ktw-rekap-prodi-${jenjang}-${cohort}${idFakultas ? "-filtered" : ""}`,
        "Rekap KTW Prodi",
        {
          nm_prodi: "Program Studi",
          kode_dikti: "Kode DIKTI",
          nm_fakultas: "Fakultas",
          maba: "Maba",
          sudah_lulus: "Sudah Lulus",
          ktw_strict: "KTW (Strict)",
          ktw_tolerant: "KTW (Tolerant)",
          pct_ktw_strict: "% KTW Strict",
          pct_ktw_tolerant: "% KTW Tolerant",
          pct_survival: "% Survival",
        }
      );
      toast.success("Rekap Prodi exported");
    }
  };

  /* ---------- Columns ---------- */
  const columns: Column<KtwMahasiswaFlatRow>[] = [
    {
      key: "nim", label: "NIM", width: "130px",
      render: (i) => <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{i.nim}</span>,
    },
    {
      key: "nama", label: "NAMA MAHASISWA",
      render: (i) => (
        <button type="button" onClick={() => handleOpenProfile(i.nim)} className="text-left group">
          <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{i.nama}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {i.jenis_kelamin === "L" ? "Laki-laki" : i.jenis_kelamin === "P" ? "Perempuan" : i.jenis_kelamin}
          </div>
        </button>
      ),
    },
    {
      key: "nm_prodi", label: "PROGRAM STUDI",
      render: (i) => (
        <div>
          <div className="text-sm text-gray-800 dark:text-gray-200">{i.nm_prodi}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{i.nm_fakultas} · {i.nm_jenjang}</div>
        </div>
      ),
    },
    {
      key: "nm_jalur_daftar", label: "JALUR", width: "120px",
      render: (i) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 max-w-[110px] truncate" title={i.nm_jalur_daftar}>
          {i.nm_jalur_daftar}
        </span>
      ),
    },
    {
      key: "tgl_masuk_sp", label: "TGL MASUK", width: "110px",
      render: (i) => <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{fmtDate(i.tgl_masuk_sp)}</span>,
    },
    {
      key: "tgl_keluar", label: "TGL KELUAR", width: "110px",
      render: (i) => <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{fmtDate(i.tgl_keluar)}</span>,
    },
    {
      key: "masa_mukim_tahun", label: "MASA STUDI", width: "120px", align: "center" as const,
      render: (i) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap
          ${i.is_ktw_strict
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
            : "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300"}`}>
          {fmtTahunBulan(i.masa_mukim_tahun)}
        </span>
      ),
    },
    {
      key: "ipk", label: "IPK", width: "70px", align: "center" as const,
      render: (i) => {
        const v = i.ipk != null ? Number(i.ipk) : null;
        if (v == null || Number.isNaN(v)) return <span className="text-xs text-gray-400">—</span>;
        const tone =
          v >= 3.5 ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
          : v >= 3.0 ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300"
          : v >= 2.5 ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300"
          : "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300";
        return (
          <span className={`inline-flex items-center justify-center min-w-[42px] px-1.5 py-0.5 rounded-md text-xs font-bold font-mono ring-1 ring-inset ${tone}`}>
            {v.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: "status_keluar", label: "STATUS", width: "90px", align: "center" as const,
      render: (i) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset
          ${i.status_keluar === "Lulus" ? "bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300"
          : i.status_keluar === "Aktif" ? "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}>
          {i.status_keluar}
        </span>
      ),
    },
    {
      key: "is_ktw_strict", label: "KTW", width: "70px", align: "center" as const,
      render: (i) => (
        i.is_ktw_strict
          ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300" title="Tepat Waktu (Strict)">✓</span>
          : i.is_ktw_tolerant
            ? <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300" title="Tolerant (selisih 1 thn)">~</span>
            : <span className="text-gray-300">—</span>
      ),
    },
  ];

  const isFiltered = Boolean(idFakultas || idProdi || statusKeluar || cutoff || cohort !== defaultCohort(jenjang));

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={dataUnilaMenuConfig}
      pageTitle="Data KTW"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Data KTW — Kelulusan Tepat Waktu</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Raw data per angkatan dengan flag KTW: jalur, IPK, tgl masuk/keluar, masa studi, status
            </p>
          </div>
          {isFiltered && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/30">
              <FiFilter className="w-3.5 h-3.5" />
              {jenjang} · Angkatan {cohort}
            </span>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            icon={<FiUsers className="w-6 h-6" />}
            label="Maba Angkatan"
            value={aggregate.totalMaba}
            gradient="from-blue-500 to-cyan-600"
            subtext={`${jenjang} · ${cohort}`}
          />
          <StatCard
            icon={<FiAward className="w-6 h-6" />}
            label="Sudah Lulus"
            value={aggregate.totalLulus}
            gradient="from-violet-500 to-purple-600"
            subtext={`Survival ${aggregate.pctSurvival.toFixed(1)}%`}
          />
          <StatCard
            icon={<FiClock className="w-6 h-6" />}
            label="KTW Strict"
            value={aggregate.totalKtw}
            gradient="from-emerald-500 to-teal-600"
            subtext={`${aggregate.pctKtw.toFixed(1)}% dari maba`}
          />
          <StatCard
            icon={<FiClock className="w-6 h-6" />}
            label="KTW Tolerant"
            value={aggregate.totalKtwTol}
            gradient="from-amber-500 to-orange-500"
            subtext={`+1 tahun toleransi`}
          />
          <StatCard
            icon={<FiTrendingUp className="w-6 h-6" />}
            label="Masa Normatif"
            value={`${MASA_MAP[jenjang]} thn`}
            gradient="from-pink-500 to-rose-600"
            subtext={`Cutoff: ${cutoff || "—"}`}
          />
        </div>

        {/* Scope + Source */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-0">
            <ScopeBadge />
          </div>
          <div className="inline-flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200 dark:border-gray-700 text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <FiDatabase className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold">Sumber:</span>
              <span>public-service /ktw/* (pdrd real-time)</span>
            </span>
          </div>
        </div>

        {/* Data Table + Filter */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden border border-gray-200/50 dark:border-gray-800">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Filter bar */}
            <div className="p-4 sm:p-5 space-y-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <FiFilter className="w-3.5 h-3.5" /> Filter Data
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportRekap("fakultas")}
                    className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm"
                  >
                    Rekap Fakultas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportRekap("prodi")}
                    className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                  >
                    Rekap Prodi
                  </button>
                  <ExportMenu onExport={handleExport} serverCsvLabel="CSV Lengkap (semua filter)" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <Dropdown
                  label="Jenjang"
                  value={jenjang}
                  onChange={(v) => { const j = v as JenjangKode; setJenjang(j); setCohort(defaultCohort(j)); setPage(1); }}
                  options={jenjangOpts}
                  placeholder="Pilih Jenjang"
                />
                <Dropdown
                  label="Angkatan"
                  value={String(cohort)}
                  onChange={(v) => { setCohort(Number(v) || defaultCohort(jenjang)); setPage(1); }}
                  options={cohortOpts}
                  placeholder="Pilih Angkatan"
                />
                {!forcedProdi && (
                  <Dropdown
                    label="Fakultas"
                    value={idFakultas}
                    onChange={(v) => { setIdFakultas(v); setIdProdi(""); setPage(1); }}
                    options={fakOptions}
                    placeholder="Semua Fakultas"
                    searchable
                    disabled={!!forcedFak}
                  />
                )}
                {!forcedProdi && (
                  <Dropdown
                    label="Program Studi"
                    value={idProdi}
                    onChange={(v) => { setIdProdi(v); setPage(1); }}
                    options={prodiOptions}
                    placeholder="Semua Prodi"
                    searchable
                  />
                )}
                <Dropdown
                  label="Status"
                  value={statusKeluar}
                  onChange={(v) => { setStatusKeluar(v); setPage(1); }}
                  options={statusOpts}
                  placeholder="Semua Status"
                />
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">Cutoff</label>
                  <div className="flex gap-1">
                    <input
                      type="date"
                      value={cutoff}
                      onChange={(e) => { setCutoff(e.target.value); setPage(1); }}
                      className="flex-1 h-10 px-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                    {presets.length > 0 && (
                      <select
                        value=""
                        onChange={(e) => { if (e.target.value) { setCutoff(e.target.value); setPage(1); } }}
                        className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-[10px] cursor-pointer"
                        title="Preset kalender akademik"
                      >
                        <option value="">⚡</option>
                        {Array.from(new Set(presets.map((p) => p.group))).map((group) => (
                          <optgroup key={group} label={group}>
                            {presets.filter((p) => p.group === group).map((p) => (
                              <option key={p.value + p.label} value={p.value}>{p.label}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktif</span>
                  {activeChips.map((c) => (
                    <span key={c.key} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200 rounded-full dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/30">
                      {c.label}
                      <button type="button" onClick={c.clear} className="ml-0.5 w-4 h-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-400/20 flex items-center justify-center" aria-label={`Hapus filter ${c.label}`}>
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <DataTable
              columns={columns}
              data={data}
              loading={loading}
              serverSide
              totalRecords={total}
              onPageChange={setPage}
              onRowsPerPageChange={(n) => { setLimit(n); setPage(1); }}
              onSearchChange={(q) => { setSearch(q); setPage(1); }}
              searchPlaceholder="Cari NIM atau nama..."
              defaultRowsPerPage={10}
            />
          </motion.div>
        </div>

        {/* Footer info */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-900/40 p-4 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
          <p className="flex items-start gap-2">
            <FiInfo className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />
            <span>
              <strong>Formula KTW Strict:</strong> <code className="rounded bg-white dark:bg-gray-800 px-1 font-mono">DATEDIFF(DAY, tgl_masuk_sp, tgl_keluar) / 365.25 ≤ masa_normatif</code>
              {" "}(S1=4 th, D3=3 th, D4=4 th, S2=2 th, S3=3 th)
            </span>
          </p>
          <p className="flex items-start gap-2">
            <FiCalendar className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />
            <span>Hanya Peserta Didik Baru angkatan Gasal (id_jns_daftar=1, MONTH(tgl_masuk_sp) ≥ 7). Transfer / pindahan tidak dihitung.</span>
          </p>
        </div>
      </div>
      <MahasiswaProfileModal idPd={selectedIdPd} onClose={() => setSelectedIdPd(null)} />
    </DashboardLayoutWithDynamicMenu>
  );
}
