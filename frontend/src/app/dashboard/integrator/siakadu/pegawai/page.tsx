"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import ScheduleList from "@/shared/components/myunila-integrator/ScheduleList";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";
import { myunilaClient } from "@/lib/api/myunilaClient";

const APP_KEY = "myunila-integrator";

import {
  FiUsers,
  FiDatabase,
  FiClock,
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { MdSync, MdSchool } from "react-icons/md";
import { Progress } from "@heroui/react";
import { toast } from "react-hot-toast";

interface Pegawai {
  id_pegawai: string;
  nm_pegawai: string;
  nip?: string;
  nidn?: string;
  jk?: string;
  jns_pegawai?: string;
  jns_tenaga?: string;
  nama_org2?: string;
  nama_org3?: string;
  status?: string;
  last_sync?: string;
}

interface StatsData {
  total_pegawai: number;
  total_dosen_aktif: number;
  total_tendik_aktif: number;
  last_sync?: string;
}

interface PegawaiFilterOptions {
  jns_tenaga: string[];
  fakultas: { id: string; nama: string }[];
  status: string[];
}

export default function SiakaduPegawaiPage() {
  useRequireAuth();

  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [data, setData] = useState<Pegawai[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [filterOptions, setFilterOptions] = useState<PegawaiFilterOptions | null>(null);
  const [selectedJenisTenaga, setSelectedJenisTenaga] = useState("");
  const [selectedFakultas, setSelectedFakultas] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Sync
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState("nm_pegawai");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const response = await myunilaClient.get("/sikep/pegawai/stats");
      setStats(response.data?.data);
    } catch (e) {
      console.error("Error fetching stats:", e);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchFilters = useCallback(async () => {
    try {
      const response = await myunilaClient.get("/sikep/pegawai/filters");
      if (response.data?.success) setFilterOptions(response.data.data);
    } catch (e) {
      console.error("Error fetching filters:", e);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const response = await myunilaClient.get("/sikep/pegawai", {
        params: {
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          jns_tenaga: selectedJenisTenaga || undefined,
          fakultas: selectedFakultas || undefined,
          status: selectedStatus || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        },
      });
      const r = response.data;
      if (r.success) {
        setData(r.data || []);
        setTotalRecords(r.meta?.total || 0);
      }
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentPage, rowsPerPage, searchQuery, selectedJenisTenaga, selectedFakultas, selectedStatus, sortBy, sortOrder]);

  const handleSync = async () => {
    setShowSyncConfirm(false);
    setShowProgressModal(true);
    setIsSyncing(true);
    setSyncStatus("syncing");
    setSyncProgress(0);
    setSyncMessage("");
    try {
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => { if (prev >= 85) { clearInterval(progressInterval); return 85; } return prev + 5; });
      }, 1000);
      const response = await myunilaClient.post("/sikep/pegawai/sync", {});
      clearInterval(progressInterval);
      const r = response.data;
      if (r.success) {
        setSyncProgress(100);
        setSyncStatus("success");
        setSyncMessage(`Inserted: ${r.data?.total_inserted || 0}, Updated: ${r.data?.total_updated || 0}`);
        toast.success("Sync pegawai berhasil!");
        setTimeout(async () => { await fetchStats(); await fetchData(); setShowProgressModal(false); setSyncProgress(0); setSyncStatus("idle"); }, 3000);
      } else { throw new Error(r.message); }
    } catch (error: any) {
      setSyncStatus("error");
      setSyncMessage(error.response?.data?.message || error.message || "Gagal sync");
      toast.error("Sync gagal");
      setTimeout(() => { setShowProgressModal(false); setSyncProgress(0); setSyncStatus("idle"); }, 4000);
    } finally { setIsSyncing(false); }
  };

  useEffect(() => { fetchStats(); fetchFilters(); }, [fetchStats, fetchFilters]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const clearFilters = () => {
    setSelectedJenisTenaga(""); setSelectedFakultas(""); setSelectedStatus("");
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedJenisTenaga || selectedFakultas || selectedStatus;
  const activeFilterCount = [selectedJenisTenaga, selectedFakultas, selectedStatus].filter(Boolean).length;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Belum pernah";
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const columns: Column<Pegawai>[] = [
    {
      key: "nm_pegawai", label: "Nama Pegawai", sortable: true,
      render: (item) => <span className="font-medium text-gray-900 dark:text-white">{item.nm_pegawai?.trim() || "-"}</span>,
    },
    {
      key: "nip", label: "NIP", sortable: true,
      render: (item) => <span className="font-mono text-sm">{item.nip?.trim() || "-"}</span>,
    },
    {
      key: "nidn", label: "NIDN",
      render: (item) => <span className="font-mono text-sm">{item.nidn?.trim() || "-"}</span>,
    },
    {
      key: "jk", label: "JK", align: "center",
      render: (item) => <span className="text-sm">{item.jk?.trim() || "-"}</span>,
    },
    {
      key: "jns_tenaga", label: "Jenis", sortable: true,
      render: (item) => <span className="text-sm">{item.jns_tenaga || "-"}</span>,
    },
    {
      key: "nama_org3", label: "Fakultas",
      render: (item) => (
        <div className="max-w-[180px]">
          <p className="text-sm truncate" title={item.nama_org3 || "-"}>{item.nama_org3 || "-"}</p>
        </div>
      ),
    },
    {
      key: "nama_org2", label: "Unit",
      render: (item) => (
        <div className="max-w-[180px]">
          <p className="text-sm truncate" title={item.nama_org2 || "-"}>{item.nama_org2 || "-"}</p>
        </div>
      ),
    },
    {
      key: "status", label: "Status", align: "center",
      render: (item) => {
        const status = item.status || "-";
        const isAktif = status.toLowerCase() === "aktif";
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isAktif
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          }`}>
            {status}
          </span>
        );
      },
    },
  ];

  const statCards = [
    { label: "Total Pegawai", value: stats?.total_pegawai ?? 0, icon: <FiUsers className="w-6 h-6 text-white" />, gradient: "from-blue-500 via-blue-600 to-indigo-600" },
    { label: "Dosen Aktif", value: stats?.total_dosen_aktif ?? 0, icon: <FiUsers className="w-6 h-6 text-white" />, gradient: "from-emerald-500 to-teal-600" },
    { label: "Tendik Aktif", value: stats?.total_tendik_aktif ?? 0, icon: <FiUsers className="w-6 h-6 text-white" />, gradient: "from-purple-500 to-indigo-600" },
    { label: "Last Sync", value: null, icon: <FiClock className="w-6 h-6 text-white" />, gradient: "from-amber-500 to-orange-600" },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Data Pegawai (SIKEP)"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Data Pegawai / Dosen
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Data pegawai dari SIKEP
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <div key={i} className={`bg-gradient-to-br ${s.gradient} rounded-xl shadow-lg p-5`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs font-medium text-white/80">{s.label}</p>
                  {isLoadingStats ? (
                    <div className="h-7 w-16 bg-white/20 rounded animate-pulse" />
                  ) : s.value !== null ? (
                    <h3 className="text-2xl font-bold text-white">{s.value.toLocaleString("id-ID")}</h3>
                  ) : (
                    <p className="text-sm font-bold text-white truncate">{formatDate(stats?.last_sync)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scheduled Syncs */}
        <ScheduleList syncType={"pegawai" as any} />

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-left"
          >
            <div className="flex items-center gap-2">
              <FiFilter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter</span>
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {showFilters ? <FiChevronUp className="w-4 h-4 text-gray-400" /> : <FiChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {showFilters && (
            <div className="px-5 pb-4 border-t border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                {/* Jenis Tenaga */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Jenis Tenaga</label>
                  <select
                    value={selectedJenisTenaga}
                    onChange={(e) => { setSelectedJenisTenaga(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Semua Jenis</option>
                    {(filterOptions?.jns_tenaga || []).map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>

                {/* Fakultas */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Fakultas</label>
                  <select
                    value={selectedFakultas}
                    onChange={(e) => { setSelectedFakultas(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Semua Fakultas</option>
                    {(filterOptions?.fakultas || []).map((f) => (
                      <option key={f.id} value={f.id}>{f.nama}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Semua Status</option>
                    {(filterOptions?.status || []).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <FiX className="w-3 h-3" /> Hapus Semua Filter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <DataTable
            data={data}
            columns={columns}
            searchable
            searchPlaceholder="Cari nama atau NIP..."
            loading={isLoadingData}
            serverSide
            totalRecords={totalRecords}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
            onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
            onSortChange={(key, order) => { setSortBy(key); setSortOrder(order); setCurrentPage(1); }}
            defaultRowsPerPage={rowsPerPage}
          />
        </div>
      </div>

      {/* Sync Confirm */}
      {showSyncConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowSyncConfirm(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <MdSync className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sinkronisasi Pegawai</h3>
                <p className="text-sm text-gray-500">Dari SIKEP API</p>
              </div>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">Proses ini akan mengambil data pegawai terbaru dari SIKEP dan menyimpannya ke database.</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowSyncConfirm(false)} className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Batal</button>
              <button onClick={handleSync} className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">Ya, Sinkronkan</button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${syncStatus === "success" ? "bg-green-100" : syncStatus === "error" ? "bg-red-100" : "bg-blue-100"}`}>
                {syncStatus === "success" ? <FiCheckCircle className="w-6 h-6 text-green-600" /> : syncStatus === "error" ? <FiXCircle className="w-6 h-6 text-red-600" /> : <FiRefreshCw className="w-6 h-6 text-blue-600 animate-spin" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{syncStatus === "success" ? "Berhasil" : syncStatus === "error" ? "Gagal" : "Sedang Sync..."}</h3>
              </div>
            </div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-600 font-medium">Progress</span>
              <span className="font-bold text-blue-600">{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} color={syncStatus === "success" ? "success" : syncStatus === "error" ? "danger" : "primary"} size="md" classNames={{ track: "rounded-full", indicator: "rounded-full" }} />
            {syncMessage && (
              <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${syncStatus === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{syncMessage}</div>
            )}
          </div>
        </div>
      )}
    </DashboardLayoutWithDynamicMenu>
  );
}
