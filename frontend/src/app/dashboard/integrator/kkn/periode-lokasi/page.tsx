"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import ScheduleList from "@/shared/components/myunila-integrator/ScheduleList";
import kknService, { KKNStats, PeriodeKKN, LokasiKKN } from "@/lib/services/kkn/kknService";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";

import {
  FiMapPin,
  FiCalendar,
  FiDatabase,
  FiRefreshCw,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { MdSync, MdSchool } from "react-icons/md";
import { toast } from "react-hot-toast";

const APP_KEY = "myunila-integrator";

export default function KKNPeriodeLokasiPage() {
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

  // DataTable state — Periode
  const [activeTab, setActiveTab] = useState<"periode" | "lokasi">("periode");
  const [periodeData, setPeriodeData] = useState<PeriodeKKN[]>([]);
  const [periodeTotal, setPeriodeTotal] = useState(0);
  const [periodePage, setPeriodePage] = useState(1);
  const [periodeLimit, setPeriodeLimit] = useState(10);
  const [periodeSearch, setPeriodeSearch] = useState("");
  const [periodeLoading, setPeriodeLoading] = useState(false);

  // DataTable state — Lokasi
  const [lokasiData, setLokasiData] = useState<LokasiKKN[]>([]);
  const [lokasiTotal, setLokasiTotal] = useState(0);
  const [lokasiPage, setLokasiPage] = useState(1);
  const [lokasiLimit, setLokasiLimit] = useState(10);
  const [lokasiSearch, setLokasiSearch] = useState("");
  const [lokasiLoading, setLokasiLoading] = useState(false);

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

  const fetchPeriode = useCallback(async () => {
    try {
      setPeriodeLoading(true);
      const res = await kknService.listPeriode({ page: periodePage, limit: periodeLimit, search: periodeSearch || undefined });
      if (res.success) { setPeriodeData(res.data || []); setPeriodeTotal(res.meta?.total || 0); }
    } catch (e) { console.error("Error fetching periode:", e); }
    finally { setPeriodeLoading(false); }
  }, [periodePage, periodeLimit, periodeSearch]);

  const fetchLokasi = useCallback(async () => {
    try {
      setLokasiLoading(true);
      const res = await kknService.listLokasi({ page: lokasiPage, limit: lokasiLimit, search: lokasiSearch || undefined });
      if (res.success) { setLokasiData(res.data || []); setLokasiTotal(res.meta?.total || 0); }
    } catch (e) { console.error("Error fetching lokasi:", e); }
    finally { setLokasiLoading(false); }
  }, [lokasiPage, lokasiLimit, lokasiSearch]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (activeTab === "periode") fetchPeriode(); }, [fetchPeriode, activeTab]);
  useEffect(() => { if (activeTab === "lokasi") fetchLokasi(); }, [fetchLokasi, activeTab]);

  const getCount = (table: string) =>
    stats?.sqlserver_stats?.find((s) => s.table === table || s.table === `kkn.${table}`)?.count || 0;

  const periodeColumns: Column<PeriodeKKN>[] = [
    { key: "nm_periode", label: "Nama Periode", render: (r) => <span className="font-medium">{r.nm_periode}</span> },
    { key: "tahun_akademik", label: "Tahun Akademik" },
    { key: "gelombang", label: "Gel.", align: "center" },
    { key: "tgl_pelaksanaan_mulai", label: "Pelaksanaan", render: (r) => r.tgl_pelaksanaan_mulai && r.tgl_pelaksanaan_selesai ? `${r.tgl_pelaksanaan_mulai} s/d ${r.tgl_pelaksanaan_selesai}` : "-" },
    { key: "durasi_hari", label: "Durasi", align: "center", render: (r) => r.durasi_hari ? `${r.durasi_hari} hari` : "-" },
    { key: "kuota_total", label: "Kuota", align: "center" },
    { key: "a_aktif", label: "Status", align: "center", render: (r) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.a_aktif ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
        {r.a_aktif ? "Aktif" : "Nonaktif"}
      </span>
    )},
  ];

  const lokasiColumns: Column<LokasiKKN>[] = [
    { key: "kode_lokasi", label: "Kode", minWidth: "80px" },
    { key: "nm_desa", label: "Desa/Kelurahan", render: (r) => <span className="font-medium">{r.nm_desa}</span> },
    { key: "nm_kecamatan", label: "Kecamatan" },
    { key: "nm_kabupaten", label: "Kabupaten/Kota" },
    { key: "nm_provinsi", label: "Provinsi" },
    { key: "a_aktif", label: "Status", align: "center", render: (r) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.a_aktif ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
        {r.a_aktif ? "Aktif" : "Nonaktif"}
      </span>
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
          return prev + 5;
        });
      }, 1000);

      await kknService.syncGroup("referensi", user?.name || "system");
      setSyncProgress(50);
      const response = await kknService.syncGroup("lokasi", user?.name || "system");
      clearInterval(progressInterval);

      if (response.success) {
        setSyncProgress(100);
        setSyncStatus("success");
        setSyncMessage(`Selesai: ${response.data.inserted} baru, ${response.data.updated} diperbarui`);
        toast.success("Sinkronisasi berhasil!");
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

  const periodeCount = getCount("periode_kkn");
  const lokasiCount = getCount("lokasi_kkn");
  const refCount = getCount("ref_jenis_kkn") + getCount("ref_golongan_kkn") + getCount("ref_nilai_kkn");
  const totalCount = periodeCount + lokasiCount + refCount;

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Periode & Lokasi KKN"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Periode & Lokasi KKN
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Data periode KKN dan lokasi penempatan
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
                <FiCalendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-100">Periode KKN</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{formatNumber(periodeCount)}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiMapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-100">Lokasi KKN</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{formatNumber(lokasiCount)}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiRefreshCw className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-orange-100">Referensi</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{formatNumber(refCount)}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FiDatabase className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-purple-100">Total Data</p>
                {isLoadingStats ? (
                  <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{formatNumber(totalCount)}</h3>
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
              <button
                onClick={() => setActiveTab("periode")}
                className={`px-6 py-3 text-sm font-semibold transition-colors ${activeTab === "periode" ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
              >
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" />
                  Periode KKN ({formatNumber(periodeTotal || getCount("periode_kkn"))})
                </div>
              </button>
              <button
                onClick={() => setActiveTab("lokasi")}
                className={`px-6 py-3 text-sm font-semibold transition-colors ${activeTab === "lokasi" ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
              >
                <div className="flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  Lokasi KKN ({formatNumber(lokasiTotal || getCount("lokasi_kkn"))})
                </div>
              </button>
            </div>
          </div>

          <div className="p-4">
            {activeTab === "periode" ? (
              <DataTable<PeriodeKKN>
                data={periodeData}
                columns={periodeColumns}
                searchable
                searchPlaceholder="Cari periode (nama, kode, tahun)..."
                loading={periodeLoading}
                serverSide
                totalRecords={periodeTotal}
                currentPage={periodePage}
                onPageChange={(p) => setPeriodePage(p)}
                onRowsPerPageChange={(r) => { setPeriodeLimit(r); setPeriodePage(1); }}
                onSearchChange={(q) => { setPeriodeSearch(q); setPeriodePage(1); }}
                emptyMessage="Belum ada data periode KKN"
              />
            ) : (
              <DataTable<LokasiKKN>
                data={lokasiData}
                columns={lokasiColumns}
                searchable
                searchPlaceholder="Cari lokasi (desa, kecamatan, kabupaten)..."
                loading={lokasiLoading}
                serverSide
                totalRecords={lokasiTotal}
                currentPage={lokasiPage}
                onPageChange={(p) => setLokasiPage(p)}
                onRowsPerPageChange={(r) => { setLokasiLimit(r); setLokasiPage(1); }}
                onSearchChange={(q) => { setLokasiSearch(q); setLokasiPage(1); }}
                emptyMessage="Belum ada data lokasi KKN"
              />
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sinkronisasi Periode & Lokasi</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sync data referensi & lokasi KKN</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Proses ini akan:</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Fetch data referensi (jenis KKN, golongan, nilai)</li>
                  <li>Fetch data periode & lokasi KKN</li>
                  <li>Upsert ke SQL Server schema kkn</li>
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
