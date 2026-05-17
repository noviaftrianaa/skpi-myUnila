"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import {
  FiX, FiFilter, FiRotateCcw, FiChevronDown, FiCheck, FiSliders,
} from "react-icons/fi";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { exportToCsv, exportToJson } from "@/lib/utils/exportCsv";
import { exportToPdf } from "@/lib/utils/exportPdf";
import ExportMenu, { type ExportFormat } from "./ExportMenu";
import MahasiswaProfileModal from "./MahasiswaProfileModal";
import UnitFilter from "./UnitFilter";
import mahasiswaDataService, {
  type MahasiswaItem, type MahasiswaFilters,
} from "@/lib/services/data-unila/mahasiswaDataService";
import toast from "react-hot-toast";

export interface MahasiswaActiveFilters {
  status: string;
  id_fakultas?: string;
  id_prodi?: string;
  id_jurusan?: string;
  id_jalur_daftar?: string;
  angkatan?: string;
  search?: string;
  ipk_min?: string;
  ipk_max?: string;
  unit_filter?: string;
}

interface MahasiswaDataTableProps {
  orgFilter?: { id_prodi?: string; id_fakultas?: string; id_jurusan?: string };
  onFiltersChange?: (filters: MahasiswaActiveFilters) => void;
}

const STATUS_OPTIONS = [
  { value: "aktif",  label: "Aktif",  className: "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30" },
  { value: "lulus",  label: "Lulus",  className: "bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/30" },
  { value: "cuti",   label: "Cuti",   className: "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30" },
  { value: "do",     label: "DO",     className: "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/30" },
  { value: "mutasi", label: "Mutasi", className: "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/30" },
];

const STATUS_BADGE_CLASS: Record<string, string> = {
  Aktif:           "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300",
  Lulus:           "bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300",
  Cuti:            "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300",
  Mutasi:          "bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300",
  Dikeluarkan:     "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300",
  "Putus Studi":   "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300",
  "Mengajukan pengunduran diri": "bg-orange-100 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300",
  "Meninggal dunia": "bg-slate-200 text-slate-700 ring-slate-300 dark:bg-slate-500/10 dark:text-slate-300",
  Hilang:          "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-400",
  "Selesai Pendidikan Non Gelar": "bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-500/10 dark:text-violet-300",
  Lainnya:         "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-500/10 dark:text-gray-300",
};

/** Searchable single-select dropdown (Tailwind only). */
type Opt = { value: string; label: string; sublabel?: string };

function Dropdown({
  value, onChange, options, placeholder, label, searchable = false, width = "w-full sm:w-56", disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
  placeholder: string;
  label?: string;
  searchable?: boolean;
  width?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const filtered = searchable && q
    ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()))
    : options;

  return (
    <div className={`relative ${width}`} ref={ref}>
      {label && (
        <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`w-full h-10 px-3 pr-9 flex items-center justify-between text-left rounded-lg border text-sm transition-all
          ${disabled
            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700"
            : "bg-white border-gray-300 text-gray-900 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:hover:border-blue-500"}`}
      >
        <span className={`truncate ${!selected ? "text-gray-400 dark:text-gray-500" : ""}`}>
          {selected ? selected.label : placeholder}
        </span>
        <FiChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-30 mt-1.5 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
          >
            {searchable && (
              <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                <input
                  autoFocus
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ketik untuk cari..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:text-white"
                />
              </div>
            )}
            <div className="max-h-64 overflow-y-auto py-1">
              {value && (
                <button
                  type="button"
                  onClick={() => { onChange(""); setOpen(false); setQ(""); }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400 flex items-center gap-2"
                >
                  <FiX className="w-3.5 h-3.5" />
                  Hapus pilihan
                </button>
              )}
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-400 text-center">Tidak ada hasil</div>
              ) : (
                filtered.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => { onChange(o.value); setOpen(false); setQ(""); }}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between gap-2 transition-colors
                      ${o.value === value
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                  >
                    <span className="truncate">
                      {o.label}
                      {o.sublabel && (
                        <span className="ml-1 text-[11px] text-gray-400">— {o.sublabel}</span>
                      )}
                    </span>
                    {o.value === value && <FiCheck className="w-4 h-4 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MahasiswaDataTable({ orgFilter, onFiltersChange }: MahasiswaDataTableProps) {
  const [data, setData] = useState<MahasiswaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState("nm_pd");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [filters, setFilters] = useState<MahasiswaFilters | null>(null);
  const [filterAngkatan, setFilterAngkatan] = useState("");
  const [filterFakultas, setFilterFakultas] = useState(orgFilter?.id_fakultas || "");
  const [filterProdi, setFilterProdi] = useState(orgFilter?.id_prodi || "");
  const [filterJurusan, setFilterJurusan] = useState(orgFilter?.id_jurusan || "");
  const [filterJalurDaftar, setFilterJalurDaftar] = useState("");
  // Multi-select Filter Unit: array of "lvl:id" entries
  const [unitItems, setUnitItems] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("aktif"); // ← default aktif
  const [filterIpkMin, setFilterIpkMin] = useState("");
  const [filterIpkMax, setFilterIpkMax] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // URL param init — deep-link from Pimpinan / external (e.g. ?status=aktif)
  // Runs once on mount. Falls back to default "aktif" if no param present.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const usp = new URLSearchParams(window.location.search);
    const v = usp.get("status");
    if (v) setFilterStatus(v);
  }, []);

  useEffect(() => {
    mahasiswaDataService
      .getFilters({
        id_fakultas: filterFakultas || undefined,
        id_jurusan: filterJurusan || undefined,
      })
      .then(setFilters)
      .catch(console.error);
  }, [filterFakultas, filterJurusan]);

  // Emit filter changes to parent. Deps = primitives ONLY to avoid infinite loop.
  // (orgFilter object identity may change across parent renders.)
  const orgFak = orgFilter?.id_fakultas;
  const orgProdi = orgFilter?.id_prodi;
  const unitFilterStr = unitItems.join(",");
  useEffect(() => {
    if (!onFiltersChange) return;
    onFiltersChange({
      status: filterStatus,
      id_fakultas: filterFakultas || orgFak || undefined,
      id_prodi: filterProdi || orgProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      id_jalur_daftar: filterJalurDaftar || undefined,
      angkatan: filterAngkatan || undefined,
      search: searchQuery || undefined,
      ipk_min: filterIpkMin || undefined,
      ipk_max: filterIpkMax || undefined,
      unit_filter: unitFilterStr || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterFakultas, filterProdi, filterJurusan, filterJalurDaftar, filterAngkatan, searchQuery, filterIpkMin, filterIpkMax, unitFilterStr, orgFak, orgProdi]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await mahasiswaDataService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
          id_fakultas: filterFakultas || orgFilter?.id_fakultas || undefined,
          id_prodi: filterProdi || orgFilter?.id_prodi || undefined,
          id_jurusan: filterJurusan || undefined,
          id_jalur_daftar: filterJalurDaftar || undefined,
          angkatan: filterAngkatan || undefined,
          status: filterStatus || undefined,
          ipk_min: filterIpkMin || undefined,
          ipk_max: filterIpkMax || undefined,
          unit_filter: unitFilterStr || undefined,
        });
        setData(result.data);
        setTotalRecords(result.total);
      } catch (e) {
        console.error(e);
        toast.error("Gagal memuat data mahasiswa");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage, rowsPerPage, searchQuery, sortBy, sortOrder,
    filterAngkatan, filterFakultas, filterProdi, filterJurusan, filterJalurDaftar,
    filterStatus, filterIpkMin, filterIpkMax, unitFilterStr, orgFilter]);

  const handleSortChange = useCallback((key: string, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
    setCurrentPage(1);
  }, []);

  const handleRowClick = (item: MahasiswaItem) => {
    setSelectedId(item.id_pd);
  };

  // Export headers — HANYA kolom yang visible di table (per request user)
  const EXPORT_HEADERS = {
    nipd: "NIM",
    nm_pd: "Nama Mahasiswa",
    nm_prodi: "Program Studi",
    nm_jurusan: "Jurusan",
    nm_fakultas: "Fakultas",
    angkatan: "Angkatan",
    jalur_masuk: "Jalur Masuk",
    semester: "Semester",
    ipk: "IPK",
    status: "Status",
  } as const;

  const buildSubtitle = () => {
    const parts: string[] = [];
    if (filterStatus) parts.push(`Status: ${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}`);
    if (filterAngkatan) parts.push(`Angkatan: ${filterAngkatan}`);
    if (filterProdi) {
      const p = (filters?.prodi || []).find((x) => x.id_sms === filterProdi);
      if (p) parts.push(`Prodi: ${p.nm_prodi}`);
    } else if (filterJurusan) {
      const j = (filters?.jurusan || []).find((x) => x.id_jurusan === filterJurusan);
      if (j) parts.push(`Jurusan: ${j.nm_jurusan}`);
    } else if (filterFakultas) {
      const f = (filters?.fakultas || []).find((x) => x.id_fakultas === filterFakultas);
      if (f) parts.push(`Fakultas: ${f.nm_fakultas}`);
    }
    if (unitItems.length > 0) {
      parts.push(`${unitItems.length} unit dipilih`);
    }
    return parts.join("  •  ") || "Semua data";
  };

  const handleExport = (fmt: ExportFormat) => {
    if (fmt === "csv-server") {
      const url = mahasiswaDataService.getExportUrl({
        search: searchQuery || undefined,
        id_fakultas: filterFakultas || orgFilter?.id_fakultas || undefined,
        id_prodi: filterProdi || orgFilter?.id_prodi || undefined,
        id_jurusan: filterJurusan || undefined,
        id_jalur_daftar: filterJalurDaftar || undefined,
        angkatan: filterAngkatan || undefined,
        status: filterStatus || undefined,
        ipk_min: filterIpkMin || undefined,
        ipk_max: filterIpkMax || undefined,
        unit_filter: unitFilterStr || undefined,
      });
      window.open(url, "_blank");
      return;
    }

    if (!data.length) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    const baseName = `mahasiswa-${filterStatus || "semua"}`;
    if (fmt === "excel") {
      exportToExcel(data as unknown as Record<string, unknown>[], baseName, "Mahasiswa", EXPORT_HEADERS);
      toast.success("Excel berhasil di-download");
    } else if (fmt === "csv-client") {
      exportToCsv(data as unknown as Record<string, unknown>[], baseName, EXPORT_HEADERS);
      toast.success("CSV berhasil di-download");
    } else if (fmt === "pdf") {
      exportToPdf(data as unknown as Record<string, unknown>[], baseName, {
        title: "Data Mahasiswa Universitas Lampung",
        subtitle: buildSubtitle(),
        headers: EXPORT_HEADERS,
        orientation: "landscape",
      });
      toast.success("PDF berhasil di-download");
    } else if (fmt === "json") {
      exportToJson(data, baseName);
      toast.success("JSON berhasil di-download");
    }
  };

  const handleReset = () => {
    setFilterStatus("aktif");
    setFilterAngkatan("");
    setFilterJurusan("");
    setFilterJalurDaftar("");
    setFilterIpkMin("");
    setFilterIpkMax("");
    setUnitItems([]);
    if (!orgFilter?.id_fakultas) setFilterFakultas("");
    if (!orgFilter?.id_prodi) setFilterProdi("");
    setShowAdvanced(false);
    setCurrentPage(1);
  };

  const forcedFak = orgFilter?.id_fakultas || "";
  const forcedJur = orgFilter?.id_jurusan || "";
  const forcedPrd = orgFilter?.id_prodi || "";

  const handleUnitItemsChange = (next: string[]) => {
    setUnitItems(next);
    setCurrentPage(1);
  };

  const jalurDaftarOptions: Opt[] = (filters?.jalur_daftar || []).map((jd) => ({
    value: jd.id_jalur_daftar, label: jd.nm_jalur_daftar,
  }));
  const angkatanOptions: Opt[] = (filters?.angkatan || []).map((a) => ({
    value: a.angkatan, label: a.angkatan,
  }));

  // Active filter chips — Unit-related selection ditampilkan langsung di UnitFilter (pills bawah button),
  // jadi tidak duplikasi di sini.
  const activeChips: Array<{ key: string; label: string; onClear: () => void }> = [];
  if (filterAngkatan) {
    activeChips.push({ key: "ang", label: `Angkatan ${filterAngkatan}`, onClear: () => { setFilterAngkatan(""); setCurrentPage(1); } });
  }
  if (filterJalurDaftar) {
    const jd = jalurDaftarOptions.find((o) => o.value === filterJalurDaftar);
    if (jd) activeChips.push({ key: "jld", label: `Jalur: ${jd.label}`, onClear: () => { setFilterJalurDaftar(""); setCurrentPage(1); } });
  }
  if (filterIpkMin || filterIpkMax) {
    const range = `IPK ${filterIpkMin || "0.00"} – ${filterIpkMax || "4.00"}`;
    activeChips.push({ key: "ipk", label: range, onClear: () => { setFilterIpkMin(""); setFilterIpkMax(""); setCurrentPage(1); } });
  }
  const hasAnyCustomFilter =
    filterStatus !== "aktif" ||
    filterAngkatan ||
    unitItems.length > 0 ||
    filterJalurDaftar ||
    filterIpkMin ||
    filterIpkMax;

  const columns: Column<MahasiswaItem>[] = [
    {
      key: "nipd", label: "NIM", width: "130px", sortable: true,
      render: (i) => <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{i.nipd}</span>,
    },
    {
      key: "nm_pd", label: "NAMA MAHASISWA", sortable: true,
      render: (i) => (
        <button
          type="button"
          onClick={() => handleRowClick(i)}
          className="text-left group"
        >
          <div className="font-medium text-blue-700 dark:text-blue-400 underline decoration-blue-300 decoration-dotted underline-offset-2 group-hover:decoration-solid group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">
            {i.nm_pd}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {i.jk === "L" ? "Laki-laki" : i.jk === "P" ? "Perempuan" : i.jk}
          </div>
        </button>
      ),
    },
    {
      key: "nm_prodi", label: "PROGRAM STUDI", sortable: true,
      render: (i) => (
        <div>
          <div className="text-sm text-gray-800 dark:text-gray-200">{i.nm_prodi}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {i.nm_jurusan ? `${i.nm_jurusan} · ` : ""}{i.nm_fakultas}
          </div>
        </div>
      ),
    },
    {
      key: "angkatan", label: "ANGKATAN", width: "90px", sortable: true, align: "center" as const,
      render: (i) => <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{i.angkatan}</span>,
    },
    {
      key: "jalur_masuk", label: "JALUR MASUK", width: "140px", sortable: true,
      render: (i) => i.jalur_masuk ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/30 max-w-[130px] truncate" title={i.jalur_masuk}>
          {i.jalur_masuk}
        </span>
      ) : <span className="text-xs text-gray-400">—</span>,
    },
    {
      key: "semester", label: "SMT", width: "60px", align: "center" as const, sortable: true,
      render: (i) => <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{i.semester ?? "—"}</span>,
    },
    {
      key: "ipk", label: "IPK", width: "70px", align: "center" as const, sortable: true,
      render: (i) => {
        const v = i.ipk ? parseFloat(String(i.ipk)) : null;
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
      key: "status", label: "STATUS", width: "90px", align: "center" as const,
      render: (i) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${STATUS_BADGE_CLASS[i.status] || STATUS_BADGE_CLASS.Lainnya}`}>
          {i.status}
        </span>
      ),
    },
  ];

  // Status dynamic — semua dari ref.jenis_keluar + Aktif (NULL+master 'A') + Cuti (km latest 'C').
  // Tidak ada bucket gabungan "DO" — Dikeluarkan & Putus Studi dipisah sesuai referensi.
  const statusOptions: Opt[] = [
    { value: "aktif", label: "Aktif" },
    { value: "cuti",  label: "Cuti" },
    ...((filters?.jenis_keluar || [])
      .filter((jk) => jk.id_jns_keluar !== '0') // hide Selesai Pendidikan Non Gelar (rarely used)
      .map((jk) => ({
        value: jk.id_jns_keluar,
        label: jk.nm_jns_keluar,
      }))),
  ];

  const advancedActiveCount =
    (filterJalurDaftar ? 1 : 0) +
    (filterIpkMin || filterIpkMax ? 1 : 0);

  const filterBar = (
    <div className="p-4 sm:p-5 space-y-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Row 1: Title kiri | tombol Advanced + Reset + Export kanan */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <FiFilter className="w-3.5 h-3.5" />
          Filter Data
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => setShowAdvanced((s) => !s)}
            className={`inline-flex items-center gap-1.5 px-3 h-9 text-xs font-medium rounded-lg ring-1 ring-inset transition-colors
              ${showAdvanced || advancedActiveCount > 0
                ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/30"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
          >
            <FiSliders className="w-3.5 h-3.5" />
            Filter Lanjutan
            {advancedActiveCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-blue-600 rounded-full">
                {advancedActiveCount}
              </span>
            )}
            <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          </button>
          <ExportMenu onExport={handleExport} serverCsvLabel="CSV Lengkap (semua filter)" />
        </div>
      </div>

      {/* Row 2: Primary filters — Filter Unit | Angkatan | Status (3 cols)
          • Tanpa peran paksa: tampil tree Fakultas › Jurusan › Prodi
          • Peran fakultas: tampil hanya Jurusan + Prodi dalam scope fakultas tsb
          • Peran prodi: dropdown disabled (sudah terkunci di level paling spesifik) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <UnitFilter
          data={filters}
          value={unitItems}
          onChange={handleUnitItemsChange}
          forcedFakultas={forcedFak || undefined}
          forcedJurusan={forcedJur || undefined}
          forcedProdi={forcedPrd || undefined}
        />

        <Dropdown
          label="Angkatan"
          value={filterAngkatan}
          onChange={(v) => { setFilterAngkatan(v); setCurrentPage(1); }}
          options={angkatanOptions}
          placeholder="Semua Angkatan"
          width="w-full"
        />

        <Dropdown
          label="Status"
          value={filterStatus}
          onChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}
          options={statusOptions}
          placeholder="Semua Status"
          width="w-full"
        />
      </div>

      {/* Row 3: Advanced filters — conditional render (no height animation to avoid dropdown clipping) */}
      {showAdvanced && (
        <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-dashed border-gray-200 dark:border-gray-800">
          <Dropdown
            label="Jalur Masuk"
            value={filterJalurDaftar}
            onChange={(v) => { setFilterJalurDaftar(v); setCurrentPage(1); }}
            options={jalurDaftarOptions}
            placeholder="Semua Jalur"
            searchable
            width="w-full"
          />

          <div className="w-full">
            <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
              IPK Minimum
            </label>
            <input
              type="number"
              min="0"
              max="4"
              step="0.01"
              placeholder="0.00"
              value={filterIpkMin}
              onChange={(e) => { setFilterIpkMin(e.target.value); setCurrentPage(1); }}
              className="w-full h-10 px-3 text-sm rounded-lg bg-white border border-gray-300 text-gray-900 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div className="w-full">
            <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
              IPK Maksimum
            </label>
            <input
              type="number"
              min="0"
              max="4"
              step="0.01"
              placeholder="4.00"
              value={filterIpkMax}
              onChange={(e) => { setFilterIpkMax(e.target.value); setCurrentPage(1); }}
              className="w-full h-10 px-3 text-sm rounded-lg bg-white border border-gray-300 text-gray-900 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Row 4: Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Aktif
          </span>
          {activeChips.map((c) => (
            <span
              key={c.key}
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200 rounded-full dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/30"
            >
              {c.label}
              <button
                type="button"
                onClick={c.onClear}
                className="ml-0.5 w-4 h-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-400/20 flex items-center justify-center"
                aria-label={`Hapus filter ${c.label}`}
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {filterBar}
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          serverSide
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
          onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
          onSortChange={handleSortChange}
          searchPlaceholder="Cari NIM, nama, NIK..."
          defaultRowsPerPage={10}
        />
      </motion.div>

      {/* Detail Modal — comprehensive profile (SIAKADU + PDDikti + keluarga + riwayat) */}
      <MahasiswaProfileModal idPd={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
