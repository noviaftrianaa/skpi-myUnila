"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import ScopeBadge from "@/shared/components/dashboard/ScopeBadge";
import UnitFilter from "@/shared/components/data-unila/UnitFilter";
import { useRoleBasedScope } from "@/lib/hooks/useRoleBasedScope";
import ExportMenu, { type ExportFormat } from "@/shared/components/data-unila/ExportMenu";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import tracerDataService, { type SurveyAtasanItem, type SurveyAtasanStats } from "@/lib/services/data-unila/tracerDataService";
import mahasiswaDataService, { type MahasiswaFilters } from "@/lib/services/data-unila/mahasiswaDataService";
import { StatCardGridSkeleton } from "@/shared/components/data-unila/PageSkeleton";
import EmptyState from "@/shared/components/data-unila/EmptyState";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { FiBriefcase, FiUsers, FiCheckCircle, FiClipboard, FiFilter, FiMail } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { exportToCsv, exportToJson } from "@/lib/utils/exportCsv";
import { exportToPdf } from "@/lib/utils/exportPdf";

const APP_KEY = "data-unila";
const num = (v: unknown) => (typeof v === "number" ? v : parseInt(String(v || 0), 10) || 0);
const fmt = (n: number) => n.toLocaleString("id-ID");

function StatCard({ icon, label, value, gradient, sublabel }: { icon: React.ReactNode; label: string; value: string | number; gradient: string; sublabel?: string }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradient} text-white p-4 shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
          {sublabel && <div className="text-[10px] opacity-80 truncate">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}

export default function SurveyAtasanPage() {
  useRequireAuth();
  const [data, setData] = useState<SurveyAtasanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SurveyAtasanStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [orgFilters, setOrgFilters] = useState<MahasiswaFilters | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("tgl_pengisian");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const scope = useRoleBasedScope();
  const forcedFak = scope.forcedFakultas || "";
  const forcedJur = scope.forcedJurusan || "";
  const forcedProdi = scope.forcedProdi || "";
  const [unitItems, setUnitItems] = useState<string[]>([]);
  const unitFilterStr = unitItems.join(",");

  useEffect(() => { mahasiswaDataService.getFilters({}).then(setOrgFilters).catch(console.error); }, []);

  useEffect(() => {
    setLoadingStats(true);
    tracerDataService.getSurveyAtasanStats({ unit_filter: unitFilterStr || undefined })
      .then(setStats).catch(console.error).finally(() => setLoadingStats(false));
  }, [unitFilterStr]);

  useEffect(() => {
    setLoading(true);
    tracerDataService.getSurveyAtasanList({
      page, limit,
      search: search || undefined,
      sort_by: sortBy, sort_order: sortOrder,
      unit_filter: unitFilterStr || undefined,
    })
      .then((r: { data: SurveyAtasanItem[]; total: number }) => { setData(r.data); setTotal(r.total); })
      .catch(() => toast.error("Gagal memuat data survey atasan"))
      .finally(() => setLoading(false));
  }, [page, limit, search, sortBy, sortOrder, unitFilterStr]);

  const handleSort = useCallback((k: string, o: "asc" | "desc") => { setSortBy(k); setSortOrder(o); setPage(1); }, []);

  const EXPORT_HEADERS = {
    nama_lulusan: "Nama Alumni",
    nim: "NIM",
    nm_prodi: "Program Studi",
    nm_fakultas: "Fakultas",
    nm_atasan: "Nama Atasan",
    email_atasan: "Email Atasan",
    jabatan_atasan: "Jabatan",
    nm_tmpt_bekerja: "Tempat Kerja",
    bidang_tempat_bekerja: "Bidang Kerja",
    kepuasan_terhadap_alumni: "Kepuasan",
    kompetensi_perusahaan: "Kompetensi",
    saran: "Saran",
    harapan: "Harapan",
    tgl_pengisian: "Tgl Pengisian",
  } as const;

  const handleExport = (fmtType: ExportFormat) => {
    if (fmtType === "csv-server") { toast("Server export belum tersedia"); return; }
    if (!data.length) { toast.error("Tidak ada data"); return; }
    const baseName = "survey-atasan";
    if (fmtType === "excel") exportToExcel(data as unknown as Record<string, unknown>[], baseName, "Survey Atasan", EXPORT_HEADERS);
    else if (fmtType === "csv-client") exportToCsv(data as unknown as Record<string, unknown>[], baseName, EXPORT_HEADERS);
    else if (fmtType === "pdf") exportToPdf(data as unknown as Record<string, unknown>[], baseName, { title: "Survey Atasan Universitas Lampung", headers: EXPORT_HEADERS, orientation: "landscape" });
    else if (fmtType === "json") exportToJson(data, baseName);
    toast.success(`${fmtType.toUpperCase()} berhasil di-download`);
  };

  const columns: Column<SurveyAtasanItem>[] = [
    { key: "nama_lulusan", label: "ALUMNI", sortable: true, render: (i) => (
      <div>
        <div className="font-medium text-gray-900 dark:text-white text-sm">{i.nama_lulusan}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{i.nim}</div>
        <div className="text-xs text-gray-500 line-clamp-1">{i.nm_prodi}</div>
      </div>
    )},
    { key: "nm_atasan", label: "ATASAN/EMPLOYER", render: (i) => (
      <div>
        <div className="text-sm text-gray-900 dark:text-white">{i.nm_atasan || "—"}</div>
        {i.jabatan_atasan && <div className="text-xs text-gray-500 dark:text-gray-400">{i.jabatan_atasan}</div>}
        {i.email_atasan && (
          <a href={`mailto:${i.email_atasan}`} className="inline-flex items-center gap-0.5 text-[11px] text-blue-600 dark:text-blue-400 hover:underline mt-0.5">
            <FiMail className="w-2.5 h-2.5" /> {i.email_atasan}
          </a>
        )}
      </div>
    )},
    { key: "nm_tmpt_bekerja", label: "TEMPAT KERJA", render: (i) => (
      <div>
        <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{i.nm_tmpt_bekerja || "—"}</div>
        {i.bidang_tempat_bekerja && <div className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">{i.bidang_tempat_bekerja}</div>}
      </div>
    )},
    { key: "kepuasan_terhadap_alumni", label: "KEPUASAN", width: "140px", render: (i) => i.kepuasan_terhadap_alumni ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300">{i.kepuasan_terhadap_alumni}</span>
    ) : <span className="text-xs text-gray-400">—</span>},
    { key: "tgl_pengisian", label: "TGL PENGISIAN", width: "110px", sortable: true, render: (i) => (
      <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{i.tgl_pengisian || "—"}</span>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="Data Unila" appIcon={<MdSchool className="w-6 h-6 text-white" />} appKey={APP_KEY} fallbackMenus={dataUnilaMenuConfig} pageTitle="Survey Atasan">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Survey Atasan</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Survei pengguna lulusan (atasan/employer) — kepuasan, kompetensi & metode pembelajaran (tracer.hasil_tracer_atasan)</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2"><div className="flex-1 min-w-0"><ScopeBadge /></div></div>

        {loadingStats ? (
          <StatCardGridSkeleton count={4} />
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={<FiClipboard className="w-5 h-5" />} label="Total Survey" value={fmt(num(stats.total))} gradient="from-violet-500 to-purple-600" sublabel={`${fmt(num(stats.total_tracer))} tracer total`} />
            <StatCard icon={<FiCheckCircle className="w-5 h-5" />} label="Coverage" value={`${stats.coverage_pct}%`} gradient="from-emerald-500 to-teal-600" sublabel="atasan terisi" />
            <StatCard icon={<FiBriefcase className="w-5 h-5" />} label="Employer Unik" value={fmt(num(stats.total_employer))} gradient="from-blue-500 to-indigo-600" />
            <StatCard icon={<FiUsers className="w-5 h-5" />} label="Prodi Terwakili" value={fmt(num(stats.total_prodi))} gradient="from-amber-500 to-orange-600" />
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden border border-gray-200/50 dark:border-gray-800">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="p-4 sm:p-5 space-y-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <FiFilter className="w-3.5 h-3.5" /> Filter Data
                </span>
                <ExportMenu onExport={handleExport} disabled={{ "csv-server": true }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <UnitFilter
                  data={orgFilters}
                  value={unitItems}
                  onChange={(next) => { setUnitItems(next); setPage(1); }}
                  forcedFakultas={forcedFak || undefined}
                  forcedJurusan={forcedJur || undefined}
                  forcedProdi={forcedProdi || undefined}
                />
              </div>
            </div>

            {!loading && data.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  variant="folder"
                  title="Belum ada survey atasan terisi"
                  description={stats && stats.total_tracer > 0
                    ? `Dari ${fmt(num(stats.total_tracer))} responden tracer study, belum ada yang mengisi survey atasan. Survey ini opsional di-fill oleh atasan/employer alumni.`
                    : "Tabel tracer.hasil_tracer_atasan masih kosong. Survey akan terisi seiring pengisian oleh employer alumni."}
                />
              </div>
            ) : (
              <DataTable columns={columns} data={data} loading={loading} serverSide totalRecords={total}
                currentPage={page} pageSize={limit} pageSizeOptions={[10, 20, 50, 100]}
                onPageChange={setPage} onPageSizeChange={setLimit}
                sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort}
                onSearchChange={(q) => { setSearch(q); setPage(1); }} searchValue={search}
                searchPlaceholder="Cari nama alumni / atasan / employer..." />
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
