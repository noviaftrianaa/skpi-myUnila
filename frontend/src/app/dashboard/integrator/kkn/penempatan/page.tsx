"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import ScheduleList from "@/shared/components/myunila-integrator/ScheduleList";
import kknService, { KKNStats, KelompokKKN, DPLKelompok } from "@/lib/services/kkn/kknService";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";

import {
  FiUsers,
  FiUserCheck,
  FiBriefcase,
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { MdSync, MdSchool } from "react-icons/md";
import { toast } from "react-hot-toast";

const APP_KEY = "myunila-integrator";
const SYNC_GROUP = "penempatan";

export default function KKNPenempatanPage() {
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

  const [activeTab, setActiveTab] = useState<"kelompok" | "dpl">("kelompok");
  const [kelompokData, setKelompokData] = useState<KelompokKKN[]>([]);
  const [kelompokTotal, setKelompokTotal] = useState(0);
  const [kelompokPage, setKelompokPage] = useState(1);
  const [kelompokLimit, setKelompokLimit] = useState(10);
  const [kelompokSearch, setKelompokSearch] = useState("");
  const [kelompokLoading, setKelompokLoading] = useState(false);

  const [dplData, setDplData] = useState<DPLKelompok[]>([]);
  const [dplTotal, setDplTotal] = useState(0);
  const [dplPage, setDplPage] = useState(1);
  const [dplLimit, setDplLimit] = useState(10);
  const [dplSearch, setDplSearch] = useState("");
  const [dplLoading, setDplLoading] = useState(false);

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

  const fetchKelompok = useCallback(async () => {
    try {
      setKelompokLoading(true);
      const res = await kknService.listKelompok({ page: kelompokPage, limit: kelompokLimit, search: kelompokSearch || undefined });
      if (res.success) { setKelompokData(res.data || []); setKelompokTotal(res.meta?.total || 0); }
    } catch (e) { console.error("Error:", e); }
    finally { setKelompokLoading(false); }
  }, [kelompokPage, kelompokLimit, kelompokSearch]);

  const fetchDPL = useCallback(async () => {
    try {
      setDplLoading(true);
      const res = await kknService.listDPL({ page: dplPage, limit: dplLimit, search: dplSearch || undefined });
      if (res.success) { setDplData(res.data || []); setDplTotal(res.meta?.total || 0); }
    } catch (e) { console.error("Error:", e); }
    finally { setDplLoading(false); }
  }, [dplPage, dplLimit, dplSearch]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (activeTab === "kelompok") fetchKelompok(); }, [fetchKelompok, activeTab]);
  useEffect(() => { if (activeTab === "dpl") fetchDPL(); }, [fetchDPL, activeTab]);

  const getCount = (table: string) =>
    stats?.sqlserver_stats?.find((s) => s.table === table || s.table === `kkn.${table}`)?.count || 0;

  const kelompokColumns: Column<KelompokKKN>[] = [
    { key: "kode_kelompok", label: "Kode", render: (r) => <span className="font-mono text-xs">{r.kode_kelompok}</span> },
    { key: "nm_kelompok", label: "Nama Kelompok", render: (r) => <span className="font-medium">{r.nm_kelompok}</span> },
    { key: "nm_periode", label: "Periode" },
    { key: "nm_desa", label: "Lokasi (Desa)" },
    { key: "kuota", label: "Kuota", align: "center" },
    { key: "jumlah_anggota", label: "Anggota", align: "center" },
    { key: "status", label: "Status", align: "center", render: (r) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === "aktif" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>{r.status || "-"}</span>
    )},
  ];

  const dplColumns: Column<DPLKelompok>[] = [
    { key: "nm_dosen", label: "Nama Dosen", render: (r) => <span className="font-medium">{r.nm_dosen}</span> },
    { key: "nidn", label: "NIDN", render: (r) => <span className="font-mono text-xs">{r.nidn || "-"}</span> },
    { key: "nip", label: "NIP", render: (r) => <span className="font-mono text-xs">{r.nip || "-"}</span> },
    { key: "peran", label: "Peran" },
    { key: "nm_kelompok", label: "Kelompok" },
    { key: "a_aktif", label: "Status", align: "center", render: (r) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.a_aktif ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>{r.a_aktif ? "Aktif" : "Nonaktif"}</span>
    )},
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
          return prev + 2;
        });
      }, 3000);

      const response = await kknService.syncGroup(SYNC_GROUP, user?.name || "system");
      clearInterval(progressInterval);

      if (response.success) {
        setSyncProgress(100);
        setSyncStatus("success");
        setSyncMessage(`Selesai: ${response.data.inserted} baru, ${response.data.updated} diperbarui`);
        toast.success("Sinkronisasi penempatan berhasil!");
        setTimeout(async () => {
          await fetchStats();
          fetchKelompok();
          fetchDPL();
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
      pageTitle="Penempatan KKN"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Penempatan KKN
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Data kelompok, anggota, dan DPL KKN
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
                <p className="text-xs font-medium text-blue-100">Kelompok KKN</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{formatNumber(getCount("kelompok_kkn"))}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiUserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-100">Anggota Kelompok</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{formatNumber(getCount("anggota_kelompok"))}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiBriefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-orange-100">DPL Kelompok</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{formatNumber(getCount("dpl_kelompok"))}</h3>
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

        {/* Data Tables with Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="border-b dark:border-gray-700">
            <div className="flex">
              <button onClick={() => setActiveTab("kelompok")} className={`px-6 py-3 text-sm font-semibold transition-colors ${activeTab === "kelompok" ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}>
                Kelompok KKN ({kelompokTotal.toLocaleString("id-ID")})
              </button>
              <button onClick={() => setActiveTab("dpl")} className={`px-6 py-3 text-sm font-semibold transition-colors ${activeTab === "dpl" ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}>
                DPL ({dplTotal.toLocaleString("id-ID")})
              </button>
            </div>
          </div>
          <div className="p-4">
            {activeTab === "kelompok" ? (
              <DataTable<KelompokKKN> data={kelompokData} columns={kelompokColumns} searchable searchPlaceholder="Cari kelompok (kode, nama, desa)..." loading={kelompokLoading} serverSide totalRecords={kelompokTotal} currentPage={kelompokPage} onPageChange={(p) => setKelompokPage(p)} onRowsPerPageChange={(r) => { setKelompokLimit(r); setKelompokPage(1); }} onSearchChange={(q) => { setKelompokSearch(q); setKelompokPage(1); }} emptyMessage="Belum ada data kelompok" />
            ) : (
              <DataTable<DPLKelompok> data={dplData} columns={dplColumns} searchable searchPlaceholder="Cari DPL (nama, NIDN, NIP)..." loading={dplLoading} serverSide totalRecords={dplTotal} currentPage={dplPage} onPageChange={(p) => setDplPage(p)} onRowsPerPageChange={(r) => { setDplLimit(r); setDplPage(1); }} onSearchChange={(q) => { setDplSearch(q); setDplPage(1); }} emptyMessage="Belum ada data DPL" />
            )}
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sinkronisasi Penempatan</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sync data kelompok, anggota & DPL</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Proses ini akan:</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Fetch data kelompok & anggota dari e-KKN API</li>
                  <li>Mapping DPL ke data dosen (pdrd.sdm)</li>
                  <li>Upsert ke SQL Server schema kkn (~60K baris)</li>
                </ul>
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                  ⏱️ Proses memakan waktu 15-25 menit. Mohon tunggu, jangan tutup halaman.
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
