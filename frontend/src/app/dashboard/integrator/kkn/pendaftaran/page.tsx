"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import ScheduleList from "@/shared/components/myunila-integrator/ScheduleList";
import kknService, { KKNStats, RegistrasiKKN } from "@/lib/services/kkn/kknService";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";
import DataTable, { Column } from "@/shared/components/ui/DataTable";

import {
  FiUsers,
  FiFileText,
  FiDatabase,
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { MdSync, MdSchool } from "react-icons/md";
import { toast } from "react-hot-toast";

const APP_KEY = "myunila-integrator";
const SYNC_GROUP = "pendaftaran";

export default function KKNPendaftaranPage() {
  useRequireAuth();
  const { user } = useAuth();

  const [stats, setStats] = useState<KKNStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState("");

  const [tableData, setTableData] = useState<RegistrasiKKN[]>([]);
  const [tableTotal, setTableTotal] = useState(0);
  const [tablePage, setTablePage] = useState(1);
  const [tableLimit, setTableLimit] = useState(10);
  const [tableSearch, setTableSearch] = useState("");
  const [tableLoading, setTableLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const response = await kknService.getStats();
      if (response.success) setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const fetchData = useCallback(async () => {
    try {
      setTableLoading(true);
      const res = await kknService.listRegistrasi({ page: tablePage, limit: tableLimit, search: tableSearch || undefined });
      if (res.success) { setTableData(res.data || []); setTableTotal(res.meta?.total || 0); }
    } catch (e) { console.error("Error fetching registrasi:", e); }
    finally { setTableLoading(false); }
  }, [tablePage, tableLimit, tableSearch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getCount = (table: string) =>
    stats?.sqlserver_stats?.find((s) => s.table === table || s.table === `kkn.${table}`)?.count || 0;

  const registrasiColumns: Column<RegistrasiKKN>[] = [
    { key: "nomor_registrasi", label: "No. Registrasi", render: (r) => <span className="font-mono text-xs">{r.nomor_registrasi || "-"}</span> },
    { key: "npm", label: "NPM", render: (r) => <span className="font-mono text-xs">{r.npm}</span> },
    { key: "nm_mahasiswa", label: "Nama Mahasiswa", render: (r) => <span className="font-medium">{r.nm_mahasiswa}</span> },
    { key: "nm_prodi", label: "Program Studi" },
    { key: "nm_fakultas", label: "Fakultas" },
    { key: "status", label: "Status", align: "center", render: (r) => {
      const colors: Record<string, string> = {
        diterima: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        ditolak: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      };
      const key = (r.status || "").toLowerCase();
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[key] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>{r.status || "-"}</span>;
    }},
    { key: "tgl_diajukan", label: "Tgl Diajukan", render: (r) => r.tgl_diajukan ? new Date(r.tgl_diajukan).toLocaleDateString("id-ID") : "-" },
  ];

  const handleSync = async () => {
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
          return prev + 3;
        });
      }, 2000);

      const response = await kknService.syncGroup(SYNC_GROUP, user?.name || "system");
      clearInterval(progressInterval);

      if (response.success) {
        setSyncProgress(100);
        setSyncStatus("success");
        setSyncMessage(`Selesai: ${response.data.inserted} baru, ${response.data.updated} diperbarui`);
        toast.success("Sinkronisasi berhasil!");
        setTimeout(async () => {
          await fetchStats();
          fetchData();
          setShowProgressModal(false);
          setSyncProgress(0);
          setSyncStatus("idle");
        }, 3000);
      } else {
        throw new Error("Sinkronisasi gagal");
      }
    } catch (error: unknown) {
      setSyncStatus("error");
      setSyncMessage(error instanceof Error ? error.message : "Gagal sinkronisasi");
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

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Pendaftaran KKN"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Pendaftaran KKN
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Data registrasi dan pemohon KKN
            </p>
          </div>
          <button
            onClick={() => setShowSyncConfirm(true)}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSyncing ? <FiRefreshCw className="w-5 h-5 animate-spin" /> : <MdSync className="w-5 h-5" />}
            Sinkronisasi Data
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-100">Registrasi KKN</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{formatNumber(getCount("registrasi_kkn"))}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-100">Data Pemohon</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{formatNumber(getCount("data_pemohon"))}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiDatabase className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-orange-100">Total Data</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{formatNumber(getCount("registrasi_kkn") + getCount("data_pemohon"))}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiClock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-purple-100">Sync Terakhir</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <p className="text-sm font-bold text-white truncate">{formatDate(stats?.last_sync)}</p>
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

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Data Registrasi KKN
            </h3>
          </div>
          <div className="p-4">
            <DataTable<RegistrasiKKN>
              data={tableData}
              columns={registrasiColumns}
              searchable
              searchPlaceholder="Cari registrasi (NPM, nama, prodi)..."
              loading={tableLoading}
              serverSide
              totalRecords={tableTotal}
              currentPage={tablePage}
              onPageChange={(p) => setTablePage(p)}
              onRowsPerPageChange={(r) => { setTableLimit(r); setTablePage(1); }}
              onSearchChange={(q) => { setTableSearch(q); setTablePage(1); }}
              emptyMessage="Belum ada data registrasi KKN"
            />
          </div>
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sinkronisasi Pendaftaran</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sync data registrasi & pemohon KKN</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Proses ini akan:</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Fetch data registrasi mahasiswa KKN dari e-KKN API</li>
                  <li>Fetch data pemohon/biodata pendaftar</li>
                  <li>Upsert ke SQL Server schema kkn (~100K baris)</li>
                </ul>
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                  ⏱️ Mohon tunggu, jangan tutup halaman.
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
