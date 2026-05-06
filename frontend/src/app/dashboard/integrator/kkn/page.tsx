"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import ScheduleList from "@/shared/components/myunila-integrator/ScheduleList";
import kknService, { KKNStats, SyncGroup } from "@/lib/services/kkn/kknService";
import { myunilaIntegratorMenuConfig } from "../config/menuConfig";

import {
  FiDatabase,
  FiRefreshCw,
  FiServer,
  FiLayers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { MdSync, MdSchool } from "react-icons/md";
import { toast } from "react-hot-toast";

const APP_KEY = "myunila-integrator";

const API_TO_SQL_MAP: Record<string, string> = {
  "kkn_periode": "kkn.periode_kkn",
  "lokasi_desa": "kkn.lokasi_kkn",
  "mahasiswa_pendaftar": "kkn.registrasi_kkn",
  "mahasiswa_biodata": "kkn.data_pemohon",
  "penempatan_mahasiswa": "kkn.kelompok_kkn",
  "penempatan_dpl": "kkn.dpl_kelompok",
  "nilai_dpl": "kkn.nilai_mahasiswa",
  "mahasiswa_laporan_p": "kkn.laporan_kelompok",
  "mahasiswa_laporan_rk": "kkn.program_kerja",
};

const SQL_TO_API_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(API_TO_SQL_MAP).map(([k, v]) => [v, k])
);

export default function KKNStatsPage() {
  useRequireAuth();
  const { user } = useAuth();

  const [stats, setStats] = useState<KKNStats | null>(null);
  const [groups, setGroups] = useState<SyncGroup[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const [statsRes, groupsRes] = await Promise.all([
        kknService.getStats(),
        kknService.getGroups(),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (groupsRes.success) setGroups(groupsRes.data);
    } catch (error) {
      console.error("Error fetching KKN stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSyncAll = async () => {
    setShowSyncConfirm(false);
    setShowProgressModal(true);
    setIsSyncing(true);
    setSyncStatus("syncing");
    setSyncProgress(0);
    setSyncMessage("");

    try {
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 85) { clearInterval(progressInterval); return 85; }
          return prev + 1;
        });
      }, 5000);

      const response = await kknService.syncAll(user?.name || "system");
      clearInterval(progressInterval);

      if (response.success) {
        setSyncProgress(100);
        setSyncStatus("success");
        const s = response.summary;
        setSyncMessage(
          `Selesai: ${s?.total_inserted || 0} baru, ${s?.total_updated || 0} diperbarui, ${s?.total_failed || 0} gagal`
        );
        toast.success("Sinkronisasi KKN berhasil!");
        setTimeout(async () => {
          await fetchStats();
          setShowProgressModal(false);
          setSyncProgress(0);
          setSyncStatus("idle");
        }, 3000);
      } else {
        throw new Error("Sinkronisasi gagal");
      }
    } catch (error: unknown) {
      setSyncStatus("error");
      const msg = error instanceof Error ? error.message : "Gagal melakukan sinkronisasi";
      setSyncMessage(msg);
      toast.error("Sinkronisasi gagal");
      setTimeout(() => {
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
      }, 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Belum pernah";
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const formatNumber = (num: number) => num.toLocaleString("id-ID");

  const totalSQLServer = stats?.sqlserver_stats?.reduce((sum, s) => sum + s.count, 0) || 0;

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Statistik Data KKN"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Data KKN
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sinkronisasi data e-KKN (MySQL) ke SQL Server MyUnila
            </p>
          </div>
          <button
            onClick={() => setShowSyncConfirm(true)}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSyncing ? <FiRefreshCw className="w-5 h-5 animate-spin" /> : <MdSync className="w-5 h-5" />}
            Sinkronisasi Semua
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiDatabase className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-100">Tabel API (MySQL)</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{stats?.total_tables || 0}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiLayers className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-100">Total Baris API</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{formatNumber(stats?.total_rows || 0)}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiServer className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-orange-100">Total SQL Server</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{formatNumber(totalSQLServer)}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiRefreshCw className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-purple-100">Sync Grup</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{groups.length}</h3>
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
        <ScheduleList syncType="kkn" showCreateButton={false} />

        {/* Sync Groups */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Grup Sinkronisasi</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">6 grup tabel yang disinkronisasi dari e-KKN</p>
          </div>
          <div className="divide-y dark:divide-gray-700">
            {groups.map((g) => (
              <div key={g.group} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{g.group}</p>
                  <p className="text-xs text-gray-500">{g.tables.join(", ")}</p>
                </div>
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{g.count} tabel</span>
              </div>
            ))}
          </div>
        </div>

        {/* Table Stats Comparison */}
        {stats && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Perbandingan Data API vs SQL Server
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Tabel</th>
                    <th className="text-right p-3 font-medium text-gray-600 dark:text-gray-400">API (MySQL)</th>
                    <th className="text-right p-3 font-medium text-gray-600 dark:text-gray-400">SQL Server</th>
                    <th className="text-right p-3 font-medium text-gray-600 dark:text-gray-400">Coverage</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {stats.sqlserver_stats?.map((sql) => {
                    const mappedApiTable = SQL_TO_API_MAP[sql.table];
                    const api = mappedApiTable
                      ? stats.table_stats?.find((t) => t.table === mappedApiTable)
                      : undefined;
                    const apiCount = api?.count || 0;
                    const pct = apiCount > 0 ? Math.round((sql.count / apiCount) * 100) : 0;
                    return (
                      <tr key={sql.table} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-3 font-mono text-xs">{sql.table}</td>
                        <td className="p-3 text-right">{apiCount > 0 ? formatNumber(apiCount) : "-"}</td>
                        <td className="p-3 text-right font-medium">{formatNumber(sql.count)}</td>
                        <td className="p-3 text-right">
                          {apiCount > 0 ? (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                              pct >= 90 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                              pct >= 50 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}>{pct}%</span>
                          ) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sinkronisasi KKN</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sync semua data e-KKN</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Proses ini akan:</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Fetch semua data dari e-KKN API (23 tabel)</li>
                  <li>Sinkronisasi 6 grup secara berurutan</li>
                  <li>Upsert data ke SQL Server (idempotent)</li>
                </ul>
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                  ⏱️ Proses memakan waktu 30-60 menit. Mohon tunggu, jangan tutup halaman.
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
                  onClick={handleSyncAll}
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
