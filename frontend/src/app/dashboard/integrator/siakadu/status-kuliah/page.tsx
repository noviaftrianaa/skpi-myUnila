"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import ScheduleList from "@/shared/components/myunila-integrator/ScheduleList";
import siakaduService, {
  SiakaduStatusKuliah,
  KuliahFilterOptions,
} from "@/lib/services/siakadu/siakaduService";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";

const APP_KEY = "myunila-integrator";

import { Card, CardBody, Spinner, Progress } from "@heroui/react";
import {
  FiActivity,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { MdSync, MdSchool } from "react-icons/md";
import { toast } from "react-hot-toast";

interface StatsData {
  total_records: number;
  last_sync: string | null;
}

/** Format raw id_smt like "20241" into "2024/2025 Ganjil" */
function formatSemester(idSmt?: string | null): string {
  if (!idSmt || idSmt.length < 5) return idSmt || "-";
  const year = parseInt(idSmt.substring(0, 4), 10);
  const term = idSmt.charAt(4);
  const yearLabel = `${year}/${year + 1}`;
  if (term === "1") return `${yearLabel} Ganjil`;
  if (term === "2") return `${yearLabel} Genap`;
  if (term === "3") return `${yearLabel} Pendek`;
  return `${yearLabel} (${term})`;
}

/** Map status char(1) code to readable label */
function statusLabel(code?: string | null): string {
  if (!code) return "-";
  const map: Record<string, string> = {
    A: "Aktif",
    C: "Cuti",
    D: "Drop Out",
    K: "Keluar",
    L: "Lulus",
    N: "Non-Aktif",
    G: "Double Degree",
    M: "Mutasi",
    W: "Wafat",
  };
  return map[code] || code;
}

export default function SiakaduStatusKuliahPage() {
  useRequireAuth();
  const { user } = useAuth();

  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [data, setData] = useState<SiakaduStatusKuliah[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [filterOptions, setFilterOptions] =
    useState<KuliahFilterOptions | null>(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedProdi, setSelectedProdi] = useState("");
  const [selectedAngkatan, setSelectedAngkatan] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState("nim");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Sync
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [syncMessage, setSyncMessage] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const response = await siakaduService.getStatusKuliahStats();
      if (response.success) setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchFilters = useCallback(async () => {
    try {
      const response = await siakaduService.getStatusKuliahFilters();
      if (response.success) setFilterOptions(response.data);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const response = await siakaduService.getStatusKuliahList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        id_smt: selectedSemester || undefined,
        id_unit: selectedProdi || undefined,
        angkatan: selectedAngkatan || undefined,
        status: selectedStatus || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      if (response.success) {
        setData(response.data || []);
        setTotalRecords(response.meta?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, [
    currentPage,
    rowsPerPage,
    searchQuery,
    selectedSemester,
    selectedProdi,
    selectedAngkatan,
    selectedStatus,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchStats();
    fetchFilters();
  }, [fetchStats, fetchFilters]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 5;
        });
      }, 800);

      const response = await siakaduService.syncStatusKuliah(
        selectedSemester ? { id_semester: selectedSemester } : undefined,
        user?.name || "system"
      );
      clearInterval(progressInterval);

      if (response.success) {
        setSyncProgress(100);
        setSyncStatus("success");
        setSyncMessage(
          `Inserted: ${response.data?.total_inserted || 0}, Updated: ${response.data?.total_updated || 0}, Duration: ${response.data?.duration || ""}`
        );
        toast.success("Sinkronisasi status kuliah berhasil!");
        setTimeout(async () => {
          await fetchStats();
          await fetchData();
          setShowProgressModal(false);
          setSyncProgress(0);
          setSyncStatus("idle");
        }, 3000);
      } else {
        throw new Error(response.message || "Sinkronisasi gagal");
      }
    } catch (error: any) {
      setSyncStatus("error");
      setSyncMessage(
        error.response?.data?.message || error.message || "Gagal melakukan sinkronisasi"
      );
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

  const clearFilters = () => {
    setSelectedSemester("");
    setSelectedProdi("");
    setSelectedAngkatan("");
    setSelectedStatus("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedSemester || selectedProdi || selectedAngkatan || selectedStatus;
  const activeFilterCount = [
    selectedSemester,
    selectedProdi,
    selectedAngkatan,
    selectedStatus,
  ].filter(Boolean).length;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Belum pernah";
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (code?: string | null) => {
    if (!code) return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    const c = code.toUpperCase();
    if (c === "A" || c === "AKTIF")
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (c === "L" || c === "LULUS")
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    if (c === "C" || c === "CUTI")
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    if (c === "D" || c === "DROP OUT" || c === "K" || c === "KELUAR")
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (c === "N" || c === "NON-AKTIF")
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  };

  const columns: Column<SiakaduStatusKuliah>[] = [
    {
      key: "nim",
      label: "NIM",
      sortable: true,
      render: (item) => <span className="font-mono text-sm">{item.nim}</span>,
    },
    {
      key: "nama_mahasiswa",
      label: "Nama",
      render: (item) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {item.nama_mahasiswa?.trim() || "-"}
        </span>
      ),
    },
    {
      key: "nm_prodi",
      label: "Prodi",
      render: (item) => (
        <div className="max-w-[200px]">
          <p className="text-sm truncate" title={item.nm_prodi || "-"}>
            {item.nm_prodi || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "angkatan",
      label: "Angkatan",
      align: "center",
      render: (item) => (
        <span className="font-mono text-sm">{item.angkatan || "-"}</span>
      ),
    },
    {
      key: "id_semester",
      label: "Semester",
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="text-sm">{formatSemester(item.id_semester)}</span>
      ),
    },
    {
      key: "status_kuliah",
      label: "Status",
      align: "center",
      render: (item) => (
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(item.status_kuliah)}`}
        >
          {statusLabel(item.status_kuliah)}
        </span>
      ),
    },
    {
      key: "ips",
      label: "IPS",
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="font-mono text-sm">
          {item.ips != null ? item.ips.toFixed(2) : "-"}
        </span>
      ),
    },
    {
      key: "ipk",
      label: "IPK",
      sortable: true,
      align: "center",
      render: (item) => (
        <span
          className={`font-mono text-sm font-semibold ${
            (item.ipk || 0) >= 3.5
              ? "text-green-600"
              : (item.ipk || 0) >= 3.0
                ? "text-blue-600"
                : (item.ipk || 0) >= 2.5
                  ? "text-yellow-600"
                  : "text-gray-500"
          }`}
        >
          {item.ipk != null ? item.ipk.toFixed(2) : "-"}
        </span>
      ),
    },
    {
      key: "sks_smt",
      label: "SKS",
      align: "center",
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.sks_smt != null ? item.sks_smt : "-"}/
          {item.total_sks != null ? item.total_sks : "-"}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Status Kuliah SIAKADU"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Status Kuliah
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sinkronisasi data status kuliah per semester dari SIAKADU
            </p>
          </div>
          <button
            onClick={() => setShowSyncConfirm(true)}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSyncing ? (
              <FiRefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <MdSync className="w-5 h-5" />
            )}
            Sinkronisasi Data
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 border-none shadow-lg rounded-xl">
            <CardBody className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <FiActivity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-100">
                    Total Records
                  </p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-2xl font-bold text-white">
                      {(stats?.total_records ?? 0).toLocaleString("id-ID")}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 border-none shadow-lg rounded-xl">
            <CardBody className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <FiClock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-purple-100">
                    Last Sync
                  </p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <p className="text-sm font-bold text-white truncate">
                      {formatDate(stats?.last_sync)}
                    </p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Scheduled Syncs */}
        <ScheduleList syncType={"siakadu_kuliah" as any} />

        {/* Filter Bar - pure Tailwind */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-left"
          >
            <div className="flex items-center gap-2">
              <FiFilter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Filter
              </span>
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            {showFilters ? (
              <FiChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <FiChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showFilters && (
            <div className="px-5 pb-4 border-t border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {/* Semester */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                    Semester
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => {
                      setSelectedSemester(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Semua Semester</option>
                    {(filterOptions?.semester || []).map((s) => (
                      <option key={s} value={s}>
                        {formatSemester(s)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prodi */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                    Program Studi
                  </label>
                  <select
                    value={selectedProdi}
                    onChange={(e) => {
                      setSelectedProdi(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Semua Prodi</option>
                    {(filterOptions?.prodi || []).map((p) => (
                      <option key={p.id_unit} value={p.id_unit}>
                        {p.nm_prodi}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Angkatan */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                    Angkatan
                  </label>
                  <select
                    value={selectedAngkatan}
                    onChange={(e) => {
                      setSelectedAngkatan(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Semua Angkatan</option>
                    {(filterOptions?.angkatan || []).map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Semua Status</option>
                    {(filterOptions?.status || []).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
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
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <DataTable<SiakaduStatusKuliah>
              data={data}
              columns={columns}
              searchable
              searchPlaceholder="Cari NIM atau nama mahasiswa..."
              loading={isLoadingData}
              serverSide
              totalRecords={totalRecords}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={(rows) => {
                setRowsPerPage(rows);
                setCurrentPage(1);
              }}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setCurrentPage(1);
              }}
              onSortChange={(key, order) => {
                setSortBy(key);
                setSortOrder(order);
                setCurrentPage(1);
              }}
              defaultRowsPerPage={rowsPerPage}
            />
          </CardBody>
        </Card>
      </div>

      {/* Sync Confirm Dialog - pure Tailwind */}
      {showSyncConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setShowSyncConfirm(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <MdSync className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Sinkronisasi Data
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status Kuliah SIAKADU
                  </p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Proses ini akan:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Mengambil data status kuliah terbaru dari SIAKADU</li>
                  <li>Data yang sudah ada akan diperbarui</li>
                  <li>Data baru akan ditambahkan</li>
                </ul>
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

      {/* Progress Modal - pure Tailwind */}
      {showProgressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    syncStatus === "success"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : syncStatus === "error"
                        ? "bg-red-100 dark:bg-red-900/30"
                        : "bg-blue-100 dark:bg-blue-900/30"
                  }`}
                >
                  {syncStatus === "success" ? (
                    <FiCheckCircle className="w-6 h-6 text-green-600" />
                  ) : syncStatus === "error" ? (
                    <FiXCircle className="w-6 h-6 text-red-600" />
                  ) : (
                    <FiRefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {syncStatus === "success"
                      ? "Sinkronisasi Berhasil"
                      : syncStatus === "error"
                        ? "Sinkronisasi Gagal"
                        : "Sedang Sinkronisasi..."}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {syncStatus === "syncing" &&
                      "Mohon tunggu, jangan tutup halaman"}
                  </p>
                </div>
              </div>

              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Progress
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {syncProgress}%
                </span>
              </div>
              <Progress
                value={syncProgress}
                color={
                  syncStatus === "success"
                    ? "success"
                    : syncStatus === "error"
                      ? "danger"
                      : "primary"
                }
                size="md"
                classNames={{
                  track: "rounded-full",
                  indicator: "rounded-full",
                }}
              />

              {syncMessage && (
                <div
                  className={`mt-4 p-3 rounded-xl text-sm font-medium ${
                    syncStatus === "success"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                      : syncStatus === "error"
                        ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                        : ""
                  }`}
                >
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
