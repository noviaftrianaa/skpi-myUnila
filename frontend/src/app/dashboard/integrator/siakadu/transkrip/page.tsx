"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import siakaduService, {
  SiakaduTranskrip,
  TranskripFilterOptions,
} from "@/lib/services/siakadu/siakaduService";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";

const APP_KEY = "myunila-integrator";

import { Card, CardBody, Spinner, Progress } from "@heroui/react";
import {
  FiFileText,
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

export default function SiakaduTranskripPage() {
  useRequireAuth();
  const { user } = useAuth();

  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [data, setData] = useState<SiakaduTranskrip[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [filterOptions, setFilterOptions] =
    useState<TranskripFilterOptions | null>(null);
  const [selectedProdi, setSelectedProdi] = useState("");
  const [selectedAngkatan, setSelectedAngkatan] = useState("");
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
      const response = await siakaduService.getTranskripStats();
      if (response.success) setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchFilters = useCallback(async () => {
    try {
      const response = await siakaduService.getTranskripFilters();
      if (response.success) setFilterOptions(response.data);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const response = await siakaduService.getTranskripList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        id_unit: selectedProdi || undefined,
        angkatan: selectedAngkatan || undefined,
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
    selectedProdi,
    selectedAngkatan,
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

      const response = await siakaduService.syncTranskrip(
        undefined,
        user?.name || "system"
      );
      clearInterval(progressInterval);

      if (response.success) {
        setSyncProgress(100);
        setSyncStatus("success");
        setSyncMessage(
          `Inserted: ${response.data?.total_inserted || 0}, Updated: ${response.data?.total_updated || 0}, Duration: ${response.data?.duration || ""}`
        );
        toast.success("Sinkronisasi transkrip berhasil!");
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
    setSelectedProdi("");
    setSelectedAngkatan("");
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedProdi || selectedAngkatan;
  const activeFilterCount = [selectedProdi, selectedAngkatan].filter(
    Boolean
  ).length;

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

  const columns: Column<SiakaduTranskrip>[] = [
    {
      key: "nim",
      label: "NIM",
      sortable: true,
      render: (item) => <span className="font-mono text-sm">{item.nim}</span>,
    },
    {
      key: "nama_mahasiswa",
      label: "Nama",
      sortable: true,
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
      key: "kode_mk",
      label: "Kode MK",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-sm">{item.kode_mk || "-"}</span>
      ),
    },
    {
      key: "nama_mk",
      label: "Nama MK",
      sortable: true,
      render: (item) => (
        <div className="max-w-[220px]">
          <p className="text-sm truncate" title={item.nama_mk || "-"}>
            {item.nama_mk || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "sks_mk",
      label: "SKS",
      align: "center",
      render: (item) => (
        <span className="text-sm">{item.sks_mk != null ? item.sks_mk : "-"}</span>
      ),
    },
    {
      key: "nilai_huruf",
      label: "Nilai Huruf",
      sortable: true,
      align: "center",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${
            item.nilai_huruf === "A"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : item.nilai_huruf === "B"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : item.nilai_huruf === "C"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : item.nilai_huruf === "D"
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                    : item.nilai_huruf === "E"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {item.nilai_huruf || "-"}
        </span>
      ),
    },
    {
      key: "nilai_index",
      label: "Nilai Index",
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="font-mono text-sm">
          {item.nilai_index != null ? item.nilai_index.toFixed(2) : "-"}
        </span>
      ),
    },
    {
      key: "smt_ke",
      label: "Semester",
      sortable: true,
      align: "center",
      render: (item) => (
        <span className="text-sm">{item.smt_ke != null ? item.smt_ke : "-"}</span>
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Transkrip SIAKADU"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Data Transkrip
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sinkronisasi data transkrip nilai dari SIAKADU
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
                  <FiFileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-100">
                    Total Transkrip
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

        {/* Filter Bar */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
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
            <DataTable<SiakaduTranskrip>
              data={data}
              columns={columns}
              searchable
              searchPlaceholder="Cari NIM, nama, atau mata kuliah..."
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

      {/* Sync Confirm Dialog */}
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
                    Transkrip Nilai SIAKADU
                  </p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Proses ini akan:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Mengambil data transkrip terbaru dari SIAKADU</li>
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

      {/* Progress Modal */}
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
