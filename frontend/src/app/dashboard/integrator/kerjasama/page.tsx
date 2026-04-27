"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import ScheduleList from "@/shared/components/myunila-integrator/ScheduleList";
import kerjasamaService, { MouListItem, MouStats } from "@/lib/services/kerjasama/kerjasamaService";
import { myunilaIntegratorMenuConfig } from "../config/menuConfig";

import {
  FiBriefcase,
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiCalendar,
} from "react-icons/fi";
import { MdSync, MdHandshake } from "react-icons/md";
import { toast } from "react-hot-toast";

const APP_KEY = "myunila-integrator";

export default function KerjasamaMouPage() {
  useRequireAuth();
  const { user } = useAuth();

  const [stats, setStats] = useState<MouStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [data, setData] = useState<MouListItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const r = await kerjasamaService.getMouStats();
      if (r.success) setStats(r.data);
    } catch (e) {
      console.error("Error fetching kerjasama stats:", e);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const r = await kerjasamaService.getMouList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
      });
      if (r.success) {
        setData(r.data || []);
        setTotalRecords(r.meta?.total || 0);
      }
    } catch (e) {
      console.error("Error fetching mou:", e);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentPage, rowsPerPage, searchQuery]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSync = async () => {
    setShowSyncConfirm(false);
    setShowProgressModal(true);
    setIsSyncing(true);
    setSyncStatus("syncing");
    setSyncProgress(0);
    setSyncMessage("");

    try {
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => (prev >= 85 ? 85 : prev + 3));
      }, 1500);

      const r = await kerjasamaService.syncKerjasama();
      clearInterval(progressInterval);

      if (r.success) {
        setSyncProgress(100);
        setSyncStatus("success");
        const d = r.data;
        setSyncMessage(
          `Unit OK: ${d?.unit_processed || 0} / ${d?.unit_total || 0}, MoU upserted: ${d?.mou_upserted || 0}, Mitra: ${d?.mitra_upserted || 0}, durasi: ${Math.round((d?.duration_ms || 0) / 1000)}s`
        );
        toast.success("Sinkronisasi SIKERMA berhasil");
        setTimeout(async () => {
          await fetchStats();
          await fetchData();
          setShowProgressModal(false);
          setSyncProgress(0);
          setSyncStatus("idle");
        }, 4000);
      } else {
        throw new Error(r.message || "Sinkronisasi gagal");
      }
    } catch (e: any) {
      setSyncStatus("error");
      setSyncMessage(e.response?.data?.message || e.message || "Gagal melakukan sinkronisasi");
      toast.error("Sinkronisasi gagal");
      setTimeout(() => {
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
      }, 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (s?: string | null) => {
    if (!s) return "Belum pernah";
    return new Date(s).toLocaleString("id-ID", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const columns: Column<MouListItem>[] = [
    {
      key: "id_sikerma",
      label: "ID SIKERMA",
      align: "center",
      render: (it) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
          {it.id_sikerma ?? "-"}
        </span>
      ),
    },
    {
      key: "id_jenis_dokumen",
      label: "Jenis",
      align: "center",
      render: (it) => (
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
          {it.id_jenis_dokumen || "-"}
        </span>
      ),
    },
    {
      key: "judul_mou",
      label: "Judul MoU",
      render: (it) => (
        <div className="max-w-[360px]">
          <p className="font-medium text-gray-900 dark:text-white truncate" title={it.judul_mou || ""}>
            {it.judul_mou || "-"}
          </p>
          <p className="text-xs text-gray-500 truncate" title={it.sk_mou || ""}>
            {it.sk_mou || ""}
          </p>
        </div>
      ),
    },
    {
      key: "nm_dudi",
      label: "Mitra",
      render: (it) => (
        <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[220px] block">
          {it.nm_dudi || "-"}
        </span>
      ),
    },
    {
      key: "tgl_mulai",
      label: "Berlaku",
      align: "center",
      render: (it) => (
        <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
          {it.tgl_mulai || "-"} → {it.tgl_selesai || "-"}
        </span>
      ),
    },
    {
      key: "last_sync",
      label: "Last Sync",
      align: "center",
      render: (it) => (
        <span className="text-xs text-gray-500">{formatDate(it.last_sync)}</span>
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdHandshake className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Data Kerjasama (SIKERMA)"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Data Kerjasama (SIKERMA)
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sinkronisasi MoU/MoA/IA dari SIKERMA Unila ke pdut.kerjasama
            </p>
          </div>
          <button
            onClick={() => setShowSyncConfirm(true)}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSyncing ? <FiRefreshCw className="w-5 h-5 animate-spin" /> : <MdSync className="w-5 h-5" />}
            Sinkronisasi Semua Unit
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiBriefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-100">Total MoU</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{stats?.total_mou?.toLocaleString("id-ID") || 0}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-100">Aktif</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{stats?.total_aktif?.toLocaleString("id-ID") || 0}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-orange-100">Expired</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{stats?.total_expired?.toLocaleString("id-ID") || 0}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-purple-100">Total Mitra</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{stats?.total_mitra?.toLocaleString("id-ID") || 0}</h3>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Last Sync indicator */}
        {stats?.last_sync && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <FiClock className="w-4 h-4" />
            <span>Last sync: <span className="font-medium">{formatDate(stats.last_sync)}</span></span>
          </div>
        )}

        {/* Scheduled Syncs */}
        <ScheduleList syncType={"kerjasama" as any} />

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <DataTable<MouListItem>
            data={data}
            columns={columns}
            searchable
            searchPlaceholder="Cari judul MoU, mitra, atau nomor SK..."
            loading={isLoadingData}
            serverSide
            totalRecords={totalRecords}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
            onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
            defaultRowsPerPage={rowsPerPage}
          />
        </div>
      </div>

      {/* Sync Confirm Dialog */}
      {showSyncConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowSyncConfirm(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <MdSync className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sinkronisasi SIKERMA</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sync semua unit kerja & MoU</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Proses ini akan:</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Fetch list unit-kerja dari SIKERMA Unila (~110 unit)</li>
                  <li>Untuk setiap unit, fetch daftar kerjasama-nya</li>
                  <li>Upsert MoU ke <code>kerjasama.mou</code> (idempotent by id_sikerma)</li>
                  <li>Upsert mitra ke <code>pdrd.dudi</code> & link ke <code>sms_kerjasama</code></li>
                </ul>
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                  ⏱️ Proses bisa memakan waktu beberapa menit. Jangan tutup halaman.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSyncConfirm(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSync}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all"
                >
                  Ya, Sinkronkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  syncStatus === "success" ? "bg-green-100 dark:bg-green-900/30" :
                  syncStatus === "error" ? "bg-red-100 dark:bg-red-900/30" :
                  "bg-blue-100 dark:bg-blue-900/30"
                }`}>
                  {syncStatus === "success" ? <FiCheckCircle className="w-6 h-6 text-green-600" /> :
                   syncStatus === "error" ? <FiXCircle className="w-6 h-6 text-red-600" /> :
                   <FiRefreshCw className="w-6 h-6 text-blue-600 animate-spin" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {syncStatus === "success" ? "Sinkronisasi Berhasil" : syncStatus === "error" ? "Sinkronisasi Gagal" : "Sedang Sinkronisasi..."}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {syncStatus === "syncing" && "Mohon tunggu, jangan tutup halaman"}
                  </p>
                </div>
              </div>

              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Progress</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{syncProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    syncStatus === "success" ? "bg-green-500" : syncStatus === "error" ? "bg-red-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${syncProgress}%` }}
                />
              </div>

              {syncMessage && (
                <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${
                  syncStatus === "success" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300" :
                  syncStatus === "error" ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300" : ""
                }`}>
                  {syncMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayoutWithDynamicMenu>
  );
}
