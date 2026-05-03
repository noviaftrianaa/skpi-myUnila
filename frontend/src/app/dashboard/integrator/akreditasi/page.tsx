"use client";

/**
 * Manajemen Akreditasi — integrator (myunila-service).
 * Sumber data: BAN-PT (https://banpt.or.id) — fetch via /myunila-service/v1/akreditasi/sync.
 *
 * Pattern preview-then-apply:
 *   1. Tombol "Sinkronisasi Sekarang" → dialog konfirmasi → POST /sync mode=preview
 *   2. Tampilkan tabel perubahan (insert/update/unchanged/unmatched/error) di modal
 *   3. User review → klik "Konfirmasi & Update DB" → POST /sync mode=apply
 *   4. Refresh stats + tabel
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import ScheduleList from "@/shared/components/myunila-integrator/ScheduleList";
import { myunilaIntegratorMenuConfig } from "../config/menuConfig";
import akreditasiService, {
  type AkreditasiRow,
  type AkreditasiStats,
  type SchedulerConfig,
  type SyncLogDetail,
  type SyncLogRow,
  type SyncResult,
} from "@/lib/services/akreditasi/akreditasiService";
import { Card, CardBody, Button, Tooltip } from "@heroui/react";
import {
  FiAward, FiRefreshCw, FiSearch, FiCheckCircle, FiXCircle, FiAlertTriangle,
  FiClock, FiDatabase, FiEye, FiX, FiInfo, FiExternalLink, FiZap, FiCalendar,
  FiTrendingUp, FiCpu, FiSettings, FiShield, FiPlay, FiFilter, FiChevronDown, FiChevronUp,
} from "react-icons/fi";
import { MdHistory, MdOutlineFactCheck } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";

const APP_KEY = "myunila-integrator";

// ============================================================================
// Helpers
// ============================================================================

const fmtDate = (s?: string | null) => {
  if (!s) return "-";
  try {
    return new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "-";
  }
};

const fmtDateTime = (s?: string | null) => {
  if (!s) return "-";
  try {
    return new Date(s).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "-";
  }
};

const akrColor = (nm?: string | null): string => {
  if (!nm) return "bg-gray-100 text-gray-600";
  switch (nm) {
    case "Unggul": return "bg-emerald-100 text-emerald-700 border-emerald-300";
    case "Baik Sekali":
    case "A":      return "bg-blue-100 text-blue-700 border-blue-300";
    case "Baik":
    case "B":      return "bg-amber-100 text-amber-700 border-amber-300";
    case "C":      return "bg-orange-100 text-orange-700 border-orange-300";
    case "Tidak Terakreditasi": return "bg-rose-100 text-rose-700 border-rose-300";
    default:       return "bg-gray-100 text-gray-600 border-gray-300";
  }
};

const actionColor = (act: string): { bg: string; text: string; label: string } => {
  switch (act) {
    case "insert":    return { bg: "bg-emerald-50", text: "text-emerald-700", label: "+ Baru" };
    case "update":    return { bg: "bg-amber-50", text: "text-amber-700", label: "↻ Update" };
    case "unchanged": return { bg: "bg-gray-50", text: "text-gray-500", label: "= Sama" };
    case "unmatched": return { bg: "bg-orange-50", text: "text-orange-700", label: "? Tidak Cocok" };
    case "skipped":   return { bg: "bg-blue-50", text: "text-blue-700", label: "⊘ Dilewati" };
    case "error":     return { bg: "bg-rose-50", text: "text-rose-700", label: "✗ Error" };
    default:          return { bg: "bg-gray-50", text: "text-gray-500", label: act };
  }
};

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AkreditasiManagementPage() {
  useRequireAuth();

  const [stats, setStats] = useState<AkreditasiStats | null>(null);
  const [rows, setRows] = useState<AkreditasiRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAkred, setFilterAkred] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState(20);
  const [sort, setSort] = useState<{ key: string; order: "asc" | "desc" } | null>(null);
  const [scheduler, setScheduler] = useState<SchedulerConfig | null>(null);

  const [logs, setLogs] = useState<SyncLogRow[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);

  // Sync flow state
  const [syncing, setSyncing] = useState(false);
  const [syncStage, setSyncStage] = useState<"idle" | "previewing" | "preview-ready" | "applying">("idle");
  const [previewResult, setPreviewResult] = useState<SyncResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [s, l, sc] = await Promise.all([
        akreditasiService.stats(),
        akreditasiService.list({ search, id_akred: filterAkred, page, limit, sort_by: sort?.key, order: sort?.order?.toUpperCase() }),
        akreditasiService.schedulerConfig(),
      ]);
      setStats(s);
      setRows(l.data || []);
      setTotal(l.pagination?.total || 0);
      setScheduler(sc);
    } catch (e: any) {
      toast.error(`Gagal memuat data: ${e?.message || "unknown"}`);
    } finally {
      setLoading(false);
    }
  }, [search, filterAkred, page, limit, sort]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const loadLogs = useCallback(async () => {
    try {
      const r = await akreditasiService.listLogs({ page: 1, limit: 30 });
      setLogs(r.data || []);
    } catch (e: any) {
      toast.error(`Gagal memuat log: ${e?.message || "unknown"}`);
    }
  }, []);

  // Trigger preview
  const startPreview = async () => {
    setSyncing(true);
    setSyncStage("previewing");
    const t = toast.loading("Mengambil data BAN-PT (max ~2 menit)...", { duration: 200000 });
    try {
      const r = await akreditasiService.sync("preview");
      toast.dismiss(t);
      if (!r.success) {
        toast.error(`Gagal: ${r.data?.error || r.message || "unknown"}`);
        setSyncStage("idle");
        return;
      }
      setPreviewResult(r.data);
      setSyncStage("preview-ready");
      setShowPreview(true);
      toast.success(`Preview selesai: ${r.data.total_inserted} baru, ${r.data.total_updated} update, ${r.data.total_unchanged} sama`);
    } catch (e: any) {
      toast.dismiss(t);
      toast.error(`Sync gagal: ${e?.message || "unknown"}`);
      setSyncStage("idle");
    } finally {
      setSyncing(false);
    }
  };

  // Confirm apply
  const confirmApply = async () => {
    if (!previewResult) return;
    setSyncing(true);
    setSyncStage("applying");
    const t = toast.loading("Menerapkan ke database...", { duration: 200000 });
    try {
      const r = await akreditasiService.sync("apply");
      toast.dismiss(t);
      if (!r.success) {
        toast.error(`Apply gagal: ${r.data?.error || r.message}`);
      } else {
        toast.success(`✅ Tersimpan: ${r.data.total_inserted} insert, ${r.data.total_updated} update`);
        setShowPreview(false);
        setPreviewResult(null);
        setSyncStage("idle");
        await loadAll();
      }
    } catch (e: any) {
      toast.dismiss(t);
      toast.error(`Apply gagal: ${e?.message || "unknown"}`);
    } finally {
      setSyncing(false);
    }
  };

  const akreditasiColumns: Column<AkreditasiRow>[] = useMemo(() => [
    {
      key: "nm_prodi", label: "Prodi", sortable: true,
      render: (r) => <span className="font-semibold text-gray-800">{r.nm_prodi}</span>,
    },
    {
      key: "nm_jenj_didik", label: "Jenjang", width: "90px", sortable: true,
      render: (r) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
          {r.nm_jenj_didik || "-"}
        </span>
      ),
    },
    {
      key: "nm_fakultas", label: "Fakultas", sortable: true,
      render: (r) => (
        <span className="text-gray-600 block max-w-[200px] truncate" title={r.nm_fakultas || ""}>
          {r.nm_fakultas || "-"}
        </span>
      ),
    },
    {
      key: "nm_akred", label: "Akreditasi", width: "130px", sortable: true,
      render: (r) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold ${akrColor(r.nm_akred)}`}>
          {r.nm_akred || "Belum"}
        </span>
      ),
    },
    { key: "nm_lemb_akred", label: "Lembaga", sortable: true, render: (r) => <span className="text-gray-600">{r.nm_lemb_akred || "-"}</span> },
    {
      key: "sk_akreditasi", label: "SK",
      render: (r) => (
        <span className="font-mono text-[10px] text-gray-600 block max-w-[180px] truncate" title={r.sk_akreditasi || ""}>
          {r.sk_akreditasi || "-"}
        </span>
      ),
    },
    {
      key: "tst_sk", label: "Berlaku s/d", width: "120px", sortable: true,
      render: (r) => {
        const expired = r.tst_sk ? new Date(r.tst_sk) < new Date() : false;
        return (
          <span className={expired ? "text-rose-700 font-semibold" : "text-gray-600"}>
            {fmtDate(r.tst_sk)}
            {expired && <FiAlertTriangle className="inline-block w-3 h-3 ml-1" />}
          </span>
        );
      },
    },
    {
      key: "asal_data", label: "Sumber", width: "80px",
      render: (r) => <span className="text-[10px] font-mono text-gray-500">{r.asal_data || "-"}</span>,
    },
  ], []);

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<FiCpu className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Manajemen Akreditasi"
    >
      <Toaster position="top-right" />

      <div className="space-y-5">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Link href="/dashboard/integrator" className="hover:text-blue-600">Integrator</Link>
              <span>/</span>
              <span className="text-gray-700 font-medium">Akreditasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiAward className="text-amber-500" /> Manajemen Akreditasi
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sinkronisasi data akreditasi prodi dari <span className="font-semibold text-gray-800">BAN-PT</span> (Direktori Akreditasi) ke <code className="px-1.5 py-0.5 rounded bg-gray-100 text-[11px]">pdrd.akreditasi_prodi</code>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setShowLogs(true); loadLogs(); }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
            >
              <MdHistory className="w-4 h-4" />
              Riwayat Sync
            </button>
            <button
              onClick={startPreview}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
            >
              {syncing ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiZap className="w-4 h-4" />}
              {syncing && syncStage === "previewing" ? "Mengambil BAN-PT..." :
               syncing && syncStage === "applying" ? "Menerapkan..." :
               "Sinkronisasi BAN-PT"}
            </button>
          </div>
        </div>

        {/* SOURCE NOTICE */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 dark:border-blue-900/30">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <FiShield className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 text-sm text-blue-900">
            <strong>Sumber data:</strong>{" "}
            <a href="https://banpt.or.id/direktori/prodi/pencarian_prodi.php" target="_blank" rel="noopener noreferrer"
               className="font-semibold underline hover:text-blue-700">
              banpt.or.id/direktori
            </a>{" "}
            (Direktori Akreditasi BAN-PT) — fetch otomatis filter UNILA, normalisasi nama prodi, match ke
            {" "}<code className="px-1 py-0.5 rounded bg-white text-xs">pdrd.sms.id_sms</code>.
            {" "}Hanya admin yang dapat menjalankan sync (manual). Scheduler {" "}
            <span className={scheduler?.enabled ? "text-emerald-700" : "text-gray-500"}>
              {scheduler?.enabled ? "ON" : "OFF"}
            </span>.
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<FiDatabase className="w-5 h-5" />}
            label="Total Prodi"
            value={stats?.total_prodi ?? "—"}
            tone="indigo"
            sub="di pdrd.sms (UNILA)"
          />
          <StatCard
            icon={<FiCheckCircle className="w-5 h-5" />}
            label="Terakreditasi"
            value={stats?.total_terakreditasi ?? "—"}
            tone="emerald"
            sub={stats ? `dari ${stats.total_prodi} prodi` : ""}
          />
          <StatCard
            icon={<FiClock className="w-5 h-5" />}
            label="Akan Kadaluarsa"
            value={stats?.total_akan_kadaluarsa ?? "—"}
            tone="amber"
            sub="≤ 90 hari ke depan"
          />
          <StatCard
            icon={<FiAlertTriangle className="w-5 h-5" />}
            label="Sudah Kadaluarsa"
            value={stats?.total_kadaluarsa ?? "—"}
            tone="rose"
            sub="perlu reakreditasi"
          />
        </div>

        {/* DISTRIBUSI by akreditasi (compact bar) */}
        {stats && Object.keys(stats.by_akreditasi).length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <FiTrendingUp className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-gray-800 dark:text-white">Distribusi Akreditasi</h2>
              <span className="ml-auto text-[11px] text-gray-400">last sync: {fmtDateTime(stats.last_sync_at)}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {["Unggul", "Baik Sekali", "Baik", "A", "B", "C", "Tidak Terakreditasi"].map(name => {
                const cnt = stats.by_akreditasi[name] || 0;
                if (cnt === 0 && !["Unggul", "Baik Sekali", "Baik", "A", "B"].includes(name)) return null;
                const cls = akrColor(name);
                return (
                  <div key={name} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${cls}`}>
                    <span className="text-xs font-semibold">{name}</span>
                    <span className="text-base font-bold">{cnt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SCHEDULER — pakai ScheduleList template (sama seperti /siakadu/mahasiswa).
            Schedule sudah di-seed (Akreditasi BAN-PT Sync Bulanan, default DISABLED).
            Admin bisa toggle ON via UI ini untuk run cron otomatis bulanan. */}
        <ScheduleList syncType={"akreditasi" as any} />

        {/* Filter Bar — collapsible, style mirip /siakadu/mahasiswa */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-left"
          >
            <div className="flex items-center gap-2">
              <FiFilter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter</span>
              {filterAkred && (
                <span className="ml-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full">
                  1
                </span>
              )}
            </div>
            {showFilters ? <FiChevronUp className="w-4 h-4 text-gray-400" /> : <FiChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {showFilters && (
            <div className="px-5 pb-4 border-t border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Peringkat Akreditasi</label>
                  <select
                    value={filterAkred}
                    onChange={(e) => { setFilterAkred(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Semua Peringkat</option>
                    <option value="4">Unggul</option>
                    <option value="5">Baik Sekali</option>
                    <option value="6">Baik</option>
                    <option value="1">A</option>
                    <option value="2">B</option>
                    <option value="3">C</option>
                    <option value="8">Tidak Terakreditasi</option>
                    <option value="9">Belum Terakreditasi</option>
                  </select>
                </div>
              </div>
              {filterAkred && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => { setFilterAkred(""); setPage(1); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <FiX className="w-3 h-3" /> Hapus Filter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DataTable wrapped in Card untuk konsistensi visual */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <DataTable
              data={rows}
              columns={akreditasiColumns as any}
              serverSide
              loading={loading}
              totalRecords={total}
              currentPage={page}
              defaultRowsPerPage={limit}
              rowsPerPageOptions={[10, 20, 50, 100]}
              searchPlaceholder="Cari nama prodi..."
              onSearchChange={(q) => { setSearch(q); setPage(1); }}
              onPageChange={setPage}
              onRowsPerPageChange={(n) => { setLimitState(n); setPage(1); }}
              onSortChange={(key, order) => setSort({ key, order })}
              emptyMessage={<div className="py-10 text-center text-gray-400 text-sm">Tidak ada data</div>}
            />
          </CardBody>
        </Card>
      </div>

      {/* PREVIEW MODAL */}
      {showPreview && previewResult && (
        <PreviewModal
          result={previewResult}
          syncing={syncing}
          onClose={() => { setShowPreview(false); setSyncStage("idle"); }}
          onApply={confirmApply}
        />
      )}

      {/* LOGS MODAL */}
      {showLogs && (
        <LogsModal
          logs={logs}
          onClose={() => setShowLogs(false)}
        />
      )}
    </DashboardLayoutWithDynamicMenu>
  );
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================

function SchedulerInfo({ icon, label, value, mono, status }: {
  icon: React.ReactNode; label: string; value: string; mono?: boolean; status?: string | null;
}) {
  const sCls = status === "success" ? "bg-emerald-100 text-emerald-700"
            : status === "running" ? "bg-blue-100 text-blue-700"
            : status === "failed" ? "bg-rose-100 text-rose-700"
            : "";
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-gray-500 mb-1">
        <span className="text-gray-400">{icon}</span>{label}
      </div>
      <div className="flex items-center gap-2">
        <div className={`text-sm font-semibold text-gray-800 ${mono ? "font-mono" : ""}`}>{value}</div>
        {status && <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${sCls}`}>{status}</span>}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, tone, sub }: {
  icon: React.ReactNode; label: string; value: number | string; tone: "indigo" | "emerald" | "amber" | "rose"; sub?: string;
}) {
  const tones = {
    indigo: "from-indigo-500 to-purple-600",
    emerald: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-500 to-pink-600",
  };
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tones[tone]} text-white p-4 shadow-md hover:shadow-xl transition-all`}>
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
      <div className="relative z-10 flex items-start justify-between mb-2">
        <span className="text-[11px] font-medium uppercase tracking-wide opacity-90">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">{icon}</div>
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-bold leading-none">{typeof value === "number" ? value.toLocaleString("id-ID") : value}</div>
        {sub && <p className="text-[11px] mt-1.5 opacity-80">{sub}</p>}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-3 py-2 font-bold text-gray-700 uppercase text-[10px] tracking-wide">{children}</th>;
}

// ============================================================================
// PREVIEW MODAL — table with filter pills + apply confirm
// ============================================================================

function PreviewModal({
  result, syncing, onClose, onApply,
}: {
  result: SyncResult;
  syncing: boolean;
  onClose: () => void;
  onApply: () => void;
}) {
  // Filter state lokal di Modal supaya 100% sync sama tabel — sebelumnya
  // pakai prop drilling dari parent dan re-render kadang lag.
  const [filter, setFilter] = useState<string>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: result.changes?.length || 0, insert: 0, update: 0, unchanged: 0, unmatched: 0, error: 0 };
    for (const ch of result.changes || []) {
      c[ch.action] = (c[ch.action] || 0) + 1;
    }
    return c;
  }, [result]);

  // Filter changes berdasarkan filter state lokal.
  const visibleChanges = useMemo(() => {
    const all = result.changes || [];
    if (filter === "all") return all;
    return all.filter(c => c.action === filter);
  }, [result, filter]);

  const totalChanges = (result.total_inserted || 0) + (result.total_updated || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MdOutlineFactCheck className="w-5 h-5 text-amber-600" />
              Preview Perubahan Sync BAN-PT
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Fetched {result.total_fetched.toLocaleString("id-ID")} record • Matched {result.total_matched} prodi UNILA
              {" • "}durasi {((result.duration_ms || 0)/1000).toFixed(1)}s
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 px-5 pt-4">
          <SmallStat label="Insert Baru" value={result.total_inserted} color="emerald" />
          <SmallStat label="Update" value={result.total_updated} color="amber" />
          <SmallStat label="Tidak Berubah" value={result.total_unchanged} color="gray" />
          <SmallStat label="Tidak Cocok" value={result.total_unmatched} color="orange" />
          <SmallStat label="Error" value={counts.error || 0} color="rose" />
        </div>

        {/* Filter pills */}
        <div className="px-5 pt-4 flex flex-wrap items-center gap-1.5">
          {(["all", "insert", "update", "unchanged", "unmatched", "error"] as const).map(f => {
            const cnt = counts[f] || 0;
            const sel = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors border ${
                  sel
                    ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {f === "all" ? "Semua" : actionColor(f).label}
                <span className={`px-1.5 py-0.5 rounded font-bold ${sel ? "bg-white/30 text-white" : "bg-gray-100 text-gray-700"}`}>{cnt}</span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <Th>Aksi</Th>
                <Th>Prodi BAN-PT</Th>
                <Th>Jenjang</Th>
                <Th>Match ke pdrd</Th>
                <Th>Akreditasi Lama</Th>
                <Th>Akreditasi Baru</Th>
                <Th>Berlaku s/d</Th>
              </tr>
            </thead>
            <tbody key={filter}>
              {visibleChanges.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-12 text-center text-gray-400">Tidak ada record di filter ini</td></tr>
              ) : visibleChanges.map(c => {
                const ac = actionColor(c.action);
                return (
                  <tr key={c.id_detail || `${c.nm_prodi_external}-${c.action}`} className={`border-t border-gray-50 ${ac.bg}`}>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${ac.text}`}>
                        {ac.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-semibold text-gray-800">{c.nm_prodi_external}</td>
                    <td className="px-3 py-2">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">{c.jenjang_external}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-600 max-w-[200px] truncate">
                      {c.nm_prodi_pdrd || <em className="text-orange-600">tidak ditemukan</em>}
                    </td>
                    <td className="px-3 py-2">
                      {c.old_nm_akred ? (
                        <span className={`inline-flex px-1.5 py-0.5 rounded border text-[10px] font-bold ${akrColor(c.old_nm_akred)}`}>{c.old_nm_akred}</span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-2">
                      {c.new_nm_akred ? (
                        <span className={`inline-flex px-1.5 py-0.5 rounded border text-[10px] font-bold ${akrColor(c.new_nm_akred)}`}>{c.new_nm_akred}</span>
                      ) : "-"}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{fmtDate(c.new_tst_sk)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 flex items-center gap-2">
            <FiInfo className="w-3.5 h-3.5" />
            {totalChanges > 0
              ? <>Mau apply <strong className="text-amber-700">{totalChanges} perubahan</strong> ke <code className="bg-white px-1 rounded">pdrd.akreditasi_prodi</code>?</>
              : <>Tidak ada perubahan — semua prodi sudah sinkron.</>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} disabled={syncing}
              className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-lg disabled:opacity-50">
              Tutup
            </button>
            <button
              onClick={onApply}
              disabled={syncing || totalChanges === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {syncing ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiCheckCircle className="w-3.5 h-3.5" />}
              Konfirmasi & Update DB
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmallStat({ label, value, color }: { label: string; value: number; color: "emerald" | "amber" | "gray" | "orange" | "rose" }) {
  const cls: Record<string, string> = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
  };
  return (
    <div className={`rounded-xl border ${cls[color]} px-3 py-2`}>
      <div className="text-[10px] uppercase font-semibold opacity-70">{label}</div>
      <div className="text-2xl font-bold leading-tight mt-0.5">{value.toLocaleString("id-ID")}</div>
    </div>
  );
}

// ============================================================================
// LOGS MODAL
// ============================================================================

function LogsModal({ logs, onClose }: { logs: SyncLogRow[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <MdHistory className="w-5 h-5 text-blue-600" /> Riwayat Sinkronisasi
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <Th>Tanggal</Th>
                <Th>Mode</Th>
                <Th>Status</Th>
                <Th>Trigger</Th>
                <Th>Fetched</Th>
                <Th>Match</Th>
                <Th>Insert</Th>
                <Th>Update</Th>
                <Th>Durasi</Th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={9} className="px-3 py-12 text-center text-gray-400">Belum ada riwayat sync</td></tr>
              )}
              {logs.map(l => {
                const sCls = l.status === "success" ? "bg-emerald-100 text-emerald-700"
                          : l.status === "running" ? "bg-blue-100 text-blue-700"
                          : "bg-rose-100 text-rose-700";
                return (
                  <tr key={l.id_log} className="border-t border-gray-50">
                    <td className="px-3 py-2">{fmtDateTime(l.started_at)}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${l.mode === "apply" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                        {l.mode}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${sCls}`}>{l.status}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{l.triggered_username || "-"}</td>
                    <td className="px-3 py-2 text-gray-600">{l.total_fetched ?? "-"}</td>
                    <td className="px-3 py-2 text-gray-600">{l.total_matched ?? "-"}</td>
                    <td className="px-3 py-2 text-emerald-700 font-semibold">{l.total_inserted ?? "-"}</td>
                    <td className="px-3 py-2 text-amber-700 font-semibold">{l.total_updated ?? "-"}</td>
                    <td className="px-3 py-2 text-gray-500">{l.duration_ms ? `${(l.duration_ms/1000).toFixed(1)}s` : "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
