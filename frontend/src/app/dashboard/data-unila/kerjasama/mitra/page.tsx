"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import Dropdown, { type DropdownOption } from "@/shared/components/data-unila/Dropdown";
import UnitFilter from "@/shared/components/data-unila/UnitFilter";
import mahasiswaDataService, { type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
import ExportMenu, { type ExportFormat } from "@/shared/components/data-unila/ExportMenu";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import { MdSchool } from "react-icons/md";
import {
  FiGlobe, FiBriefcase, FiFileText, FiUsers, FiFilter, FiX, FiMail, FiPhone, FiExternalLink,
} from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import kerjasamaDataService, {
  type MitraItem, type MitraStats,
} from "@/lib/services/data-unila/kerjasamaDataService";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { exportToCsv, exportToJson } from "@/lib/utils/exportCsv";
import { exportToPdf } from "@/lib/utils/exportPdf";
import { StatCardGridSkeleton } from "@/shared/components/data-unila/PageSkeleton";

const APP_KEY = "data-unila";

function num(v?: string | number | null): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isNaN(n) ? 0 : n;
}
function fmt(n: number): string { return n.toLocaleString("id-ID"); }

function StatCard({
  icon, label, value, gradient, subtext,
}: { icon: React.ReactNode; label: string; value: string | number; gradient: string; subtext?: string }) {
  const display = typeof value === "number" ? fmt(value) : fmt(num(value));
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

export default function MitraPage() {
  useRequireAuth();

  const [data, setData] = useState<MitraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MitraStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("nm_lemb");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [filterJenis, setFilterJenis] = useState("");
  const [filterTahunMou, setFilterTahunMou] = useState("");
  const [filterFak, setFilterFak] = useState("");
  const [filterProdi, setFilterProdi] = useState("");
  const [filterJurusan, setFilterJurusan] = useState("");
  const [unitItems, setUnitItems] = useState<string[]>([]);
  const unitFilterStr = unitItems.join(",");
  const [orgFilters, setOrgFilters] = useState<MahasiswaFilters | null>(null);

  useEffect(() => {
    mahasiswaDataService.getFilters({ id_fakultas: filterFak || undefined, id_jurusan: filterJurusan || undefined })
      .then(setOrgFilters).catch(console.error);
  }, [filterFak, filterJurusan]);

  useEffect(() => {
    setLoadingStats(true);
    kerjasamaDataService.getMitraStats({})
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    kerjasamaDataService.getMitraList({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      jenis: filterJenis || undefined,
      tahun_mou: filterTahunMou || undefined,
      id_fakultas: filterFak || undefined,
      id_prodi: filterProdi || undefined,
      id_jurusan: filterJurusan || undefined,
      unit_filter: unitFilterStr || undefined,
    })
      .then((r: { data: MitraItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data mitra"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, filterJenis, filterTahunMou, filterFak, filterProdi, filterJurusan, unitFilterStr]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => {
    setSortBy(k); setSortOrder(o); setPage(1);
  }, []);

  const jenisOptions: DropdownOption[] = [
    { value: "LembagaIPTEK", label: "Lembaga IPTEK" },
    { value: "DUDI", label: "Dunia Usaha / Industri (DUDI)" },
  ];
  const tahunMouOptions: DropdownOption[] = (stats?.by_tahun_mou || [])
    .map((t) => ({ value: String(t.tahun), label: `${t.tahun} (${t.jumlah})` }));

  const activeChips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (filterJenis) activeChips.push({ key: "jns", label: `Jenis: ${filterJenis === "LembagaIPTEK" ? "Lembaga IPTEK" : "DUDI"}`, clear: () => { setFilterJenis(""); setPage(1); } });
  if (filterTahunMou) activeChips.push({ key: "thn", label: `Tahun MoU ${filterTahunMou}`, clear: () => { setFilterTahunMou(""); setPage(1); } });

  const EXPORT_HEADERS = {
    nm_lemb: "Nama Mitra",
    jenis: "Jenis",
    email: "Email",
    no_tel: "Telepon",
    website: "Website",
    ds_kel: "Desa/Kelurahan",
    mou_count: "Total MoU",
    mou_aktif: "MoU Aktif",
    tahun_mou_terbaru: "Tahun MoU Terbaru",
  } as const;

  const dataForExport = useMemo(() => data, [data]);

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") { toast("Server export belum tersedia"); return; }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    const baseName = `mitra-${filterJenis || "all"}`;
    if (fmtType === "excel") {
      exportToExcel(dataForExport as unknown as Record<string, unknown>[], baseName, "Mitra", EXPORT_HEADERS);
      toast.success("Excel berhasil di-download");
    } else if (fmtType === "csv-client") {
      exportToCsv(dataForExport as unknown as Record<string, unknown>[], baseName, EXPORT_HEADERS);
      toast.success("CSV berhasil di-download");
    } else if (fmtType === "pdf") {
      exportToPdf(dataForExport as unknown as Record<string, unknown>[], baseName, {
        title: "Mitra Riset & Industri Universitas Lampung",
        headers: EXPORT_HEADERS,
        orientation: "landscape",
      });
      toast.success("PDF berhasil di-download");
    } else if (fmtType === "json") {
      exportToJson(dataForExport, baseName);
      toast.success("JSON berhasil di-download");
    }
  };

  const columns: Column<MitraItem>[] = [
    {
      key: "nm_lemb", label: "NAMA MITRA", sortable: true,
      render: (i) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{i.nm_lemb}</div>
          {i.nm_singkat && <div className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wide">{i.nm_singkat}</div>}
        </div>
      ),
    },
    {
      key: "jenis", label: "JENIS", width: "150px", align: "center" as const, sortable: true,
      render: (i) => {
        const tone = i.jenis === "LembagaIPTEK"
          ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300"
          : "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300";
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ring-1 ring-inset ${tone}`}>
            {i.jenis === "LembagaIPTEK" ? "Lembaga IPTEK" : "DUDI"}
          </span>
        );
      },
    },
    {
      key: "kontak", label: "KONTAK", sortable: false,
      render: (i) => (
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
          {i.email && (
            <div className="flex items-center gap-1 truncate max-w-[220px]"><FiMail className="w-3 h-3 shrink-0" /> <span className="truncate">{i.email}</span></div>
          )}
          {i.no_tel && (
            <div className="flex items-center gap-1"><FiPhone className="w-3 h-3 shrink-0" /> {i.no_tel}</div>
          )}
          {i.website && (
            <div className="flex items-center gap-1 truncate max-w-[220px]"><FiExternalLink className="w-3 h-3 shrink-0" /> <span className="truncate">{i.website}</span></div>
          )}
          {!i.email && !i.no_tel && !i.website && <span className="text-gray-400">—</span>}
        </div>
      ),
    },
    {
      key: "ds_kel", label: "ALAMAT", sortable: false,
      render: (i) => (
        <div className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 max-w-[200px]">
          {[i.jln, i.ds_kel, i.kode_pos].filter(Boolean).join(", ") || "—"}
        </div>
      ),
    },
    {
      key: "mou_aktif", label: "MoU AKTIF", width: "100px", align: "center" as const, sortable: true,
      render: (i) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1 ring-inset ${
          i.mou_aktif > 0
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
            : "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-400"
        }`}>
          {i.mou_aktif} / {i.mou_count}
        </span>
      ),
    },
    {
      key: "tahun_mou_terbaru", label: "TAHUN MoU", width: "100px", align: "center" as const, sortable: true,
      render: (i) => i.tahun_mou_terbaru ? (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300">
          {i.tahun_mou_terbaru}
        </span>
      ) : <span className="text-xs text-gray-400">—</span>,
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={dataUnilaMenuConfig}
      pageTitle="Mitra Riset & Industri"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Mitra Riset & Industri</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Lembaga IPTEK + DUDI (Dunia Usaha/Industri) — sumber data PDDikti & SIKERMA</p>
          </div>
        </div>

        {loadingStats ? (
          <StatCardGridSkeleton count={4} />
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={<FiGlobe className="w-6 h-6" />} label="Total Mitra" value={num(stats.total_mitra)} gradient="from-blue-500 to-indigo-600" subtext={`${fmt(num(stats.mitra_ber_mou))} ber-MoU`} />
            <StatCard icon={<FiUsers className="w-6 h-6" />} label="Lembaga IPTEK" value={num(stats.total_lembaga_iptek)} gradient="from-emerald-500 to-teal-600" />
            <StatCard icon={<FiBriefcase className="w-6 h-6" />} label="DUDI" value={num(stats.total_dudi)} gradient="from-violet-500 to-purple-600" />
            <StatCard icon={<FiFileText className="w-6 h-6" />} label="MoU Aktif" value={num(stats.mou_aktif)} gradient="from-amber-500 to-orange-500" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-0"><ScopeBadge /></div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden border border-gray-200/50 dark:border-gray-800">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="p-4 sm:p-5 space-y-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <FiFilter className="w-3.5 h-3.5" /> Filter Data
                </span>
                <div className="flex items-center gap-2">
                  <ExportMenu onExport={handleExport} disabled={{ "csv-server": true }} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <UnitFilter
                  data={orgFilters}
                  value={unitItems}
                  onChange={(next) => { setUnitItems(next); setPage(1); }}
                />
                <Dropdown label="Jenis Mitra" value={filterJenis}
                  onChange={(v) => { setFilterJenis(v); setPage(1); }}
                  options={jenisOptions} placeholder="Semua Jenis" />
                {tahunMouOptions.length > 0 && (
                  <Dropdown label="Tahun MoU" value={filterTahunMou}
                    onChange={(v) => { setFilterTahunMou(v); setPage(1); }}
                    options={tahunMouOptions} placeholder="Semua Tahun" searchable />
                )}
              </div>

              {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aktif</span>
                  {activeChips.map((c) => (
                    <span key={c.key} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 rounded-full dark:bg-emerald-500/10 dark:text-emerald-300">
                      {c.label}
                      <button type="button" onClick={c.clear} className="ml-0.5 w-4 h-4 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-400/20 flex items-center justify-center">
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <DataTable columns={columns} data={data} loading={loading} serverSide totalRecords={total}
              onPageChange={setPage}
              onRowsPerPageChange={(n) => { setLimit(n); setPage(1); }}
              onSearchChange={(q) => { setSearch(q); setPage(1); }}
              onSortChange={handleSort}
              searchPlaceholder="Cari nama mitra..."
              defaultRowsPerPage={20}
            />
          </motion.div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
