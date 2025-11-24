"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import FeederMahasiswaTable from "@/shared/components/feeder-integrator/FeederMahasiswaTable";
import {
  Card,
  CardBody,
  Button,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
  Switch,
} from "@heroui/react";
import {
  FiUsers,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiDatabase,
} from "react-icons/fi";
import { MdSync, MdSchool } from "react-icons/md";
import { feederIntegratorMenuConfig } from "../../config/menuConfig";
import { feederClient } from "@/lib/api/feederClient";
import { toast } from "react-hot-toast";
import ScheduleList from "@/shared/components/feeder-integrator/ScheduleList";

interface MahasiswaStats {
  total_mahasiswa: number;
  total_aktif: number;
  total_tidak_aktif: number;
  last_sync?: string;
}

export default function MahasiswaManagementPage() {
  useRequireAuth();
  const { user } = useAuth();

  // State
  const [stats, setStats] = useState<MahasiswaStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncResult, setSyncResult] = useState<{
    totalRecords: number;
    message: string;
  } | null>(null);
  const [syncFilters, setSyncFilters] = useState<{
    id_prodi?: string;
    angkatan?: string[];
  }>({});
  const [syncFilterLabels, setSyncFilterLabels] = useState<{
    prodi?: string;
    angkatan?: string;
  }>({});
  const [forceSync, setForceSync] = useState(false);

  // Handle filter changes from table
  const handleFilterChange = useCallback((filters: { id_prodi?: string; angkatan?: string[] }) => {
    setSyncFilters(filters);
  }, []);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      // Add cache-busting parameter to force fresh data
      const response = await feederClient.get("/mahasiswa/stats", {
        params: { _t: Date.now() }
      });
      const data = response.data;

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Gagal memuat statistik mahasiswa");
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleSyncClick = () => {
    setShowSyncModal(true);
  };

  const handleConfirmSync = async () => {
    setShowSyncModal(false);
    setShowProgressModal(true);
    setIsSyncing(true);
    setSyncStatus("syncing");
    setSyncProgress(0);

    try {
      // Simulate initial progress
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 20) {
            clearInterval(progressInterval);
            return 20;
          }
          return prev + 5;
        });
      }, 200);

      // Build query params for sync API
      const params = new URLSearchParams();
      params.append("synced_by", user?.name || "system");

      // Add angkatan parameter (required)
      if (syncFilters.angkatan && syncFilters.angkatan.length > 0) {
        params.append("angkatan", syncFilters.angkatan.join(","));
      } else {
        // If no angkatan filter, sync all recent angkatan (last 5 years)
        const currentYear = new Date().getFullYear();
        const defaultAngkatan = [];
        for (let i = 0; i < 5; i++) {
          defaultAngkatan.push((currentYear - i).toString());
        }
        params.append("angkatan", defaultAngkatan.join(","));
      }

      // Add id_prodi parameter (optional)
      if (syncFilters.id_prodi) {
        params.append("id_prodi", syncFilters.id_prodi);
      }

      // Add force_sync parameter (optional)
      if (forceSync) {
        params.append("force_sync", "true");
      }

      // Call sync API with query parameters
      const response = await feederClient.post(`/mahasiswa/sync?${params.toString()}`);

      clearInterval(progressInterval);

      if (response.data.success) {
        setSyncProgress(100);
        setSyncStatus("success");

        // Set result from API response
        setSyncResult({
          totalRecords: response.data.data?.total_records || 0,
          message: response.data.message || "Data mahasiswa berhasil disinkronkan"
        });

        toast.success("Sinkronisasi berhasil!");

        // Refresh stats after 2 seconds
        setTimeout(async () => {
          await fetchStats();
          setShowProgressModal(false);
          setSyncProgress(0);
          setSyncStatus("idle");
        }, 2000);
      } else {
        throw new Error(response.data.message || "Sinkronisasi gagal");
      }
    } catch (error: any) {
      console.error("Error syncing mahasiswa:", error);
      setSyncStatus("error");

      const errorMessage = error.response?.data?.message || error.message || "Gagal melakukan sinkronisasi";
      toast.error(errorMessage);

      setSyncResult({
        totalRecords: 0,
        message: errorMessage
      });

      setTimeout(() => {
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
      }, 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Belum pernah";
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout
      appName="Feeder Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      menuConfig={feederIntegratorMenuConfig}
      pageTitle="Data Mahasiswa"
    >
      <div className="space-y-6">
        {/* Header with Title and Sync Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Data Mahasiswa
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Data mahasiswa terdaftar di sistem Neo Feeder PDDIKTI
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            startContent={<MdSync className="w-5 h-5" />}
            onPress={handleSyncClick}
            isLoading={isSyncing}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
          >
            Sinkronisasi Data
          </Button>
        </div>

        {/* Statistics Cards - Compact Horizontal Layout (Match Sister Dosen Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Mahasiswa Card */}
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiDatabase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-blue-100">Total Mahasiswa</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Live</span>
                    </div>
                  </div>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <>
                      <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                        {stats?.total_mahasiswa.toLocaleString() || "0"}
                      </h3>
                      <p className="text-[10px] text-blue-100/80 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                        Total seluruh mahasiswa
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Mahasiswa Aktif Card */}
          <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiCheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-emerald-100">Mahasiswa Aktif</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">✓ Active</span>
                    </div>
                  </div>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <>
                      <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                        {stats?.total_aktif.toLocaleString() || "0"}
                      </h3>
                      <p className="text-[10px] text-emerald-100/80">
                        Status aktif kuliah
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Mahasiswa Tidak Aktif Card */}
          <Card className="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiXCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-orange-100">Tidak Aktif</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/30 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">⚠ Inactive</span>
                    </div>
                  </div>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <>
                      <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                        {stats?.total_tidak_aktif.toLocaleString() || "0"}
                      </h3>
                      <p className="text-[10px] text-orange-100/80">
                        {stats ? ((stats.total_tidak_aktif / stats.total_mahasiswa) * 100).toFixed(1) : 0}% dari total mahasiswa
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Last Sync Card */}
          <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiClock className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-purple-100">Last Sync</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Recent</span>
                    </div>
                  </div>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <>
                      <h3 className="text-base font-bold text-white leading-tight mb-1 truncate">
                        {formatDate(stats?.last_sync)}
                      </h3>
                      <p className="text-[10px] text-purple-100/80">
                        Terakhir sinkronisasi data
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Scheduled Syncs Section */}
        <ScheduleList syncType={"mahasiswa" as any} />

        {/* Data Table */}
        <FeederMahasiswaTable onFilterChange={handleFilterChange} />
      </div>

      {/* Sync Confirmation Modal */}
      <Modal
        isOpen={showSyncModal}
        onOpenChange={setShowSyncModal}
        size="md"
        backdrop="blur"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-gray-800",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <MdSync className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Konfirmasi Sinkronisasi
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                      Data Mahasiswa Neo Feeder
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="w-full">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Proses ini akan mengambil data mahasiswa terbaru dari Neo Feeder PDDIKTI dan menyimpannya ke database.
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                          <li>Data yang sudah ada akan diperbarui</li>
                          <li>Data baru akan ditambahkan</li>
                          <li>Proses memerlukan waktu beberapa menit</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Filter Info */}
                  {(syncFilters.id_prodi || (syncFilters.angkatan && syncFilters.angkatan.length > 0)) && (
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                        Filter yang Diterapkan:
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {syncFilters.id_prodi && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">• Prodi:</span>
                            <span>{syncFilterLabels.prodi || "Prodi terpilih"}</span>
                          </div>
                        )}
                        {syncFilters.angkatan && syncFilters.angkatan.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">• Angkatan:</span>
                            <span>{syncFilters.angkatan.join(", ")}</span>
                          </div>
                        )}
                        {!syncFilters.id_prodi && (!syncFilters.angkatan || syncFilters.angkatan.length === 0) && (
                          <p className="text-sm italic">Semua data mahasiswa aktif</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Force Sync Option */}
                  <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
                          Paksa Sinkronisasi Ulang
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Aktifkan untuk men-sync ulang data yang sudah pernah di-sync bulan ini. Data yang gagal sync akan dicoba lagi.
                        </p>
                      </div>
                      <Switch
                        isSelected={forceSync}
                        onValueChange={setForceSync}
                        size="sm"
                        classNames={{
                          wrapper: forceSync ? "bg-yellow-500 border-0" : "bg-gray-300 border-0",
                        }}
                      />
                    </div>
                    {forceSync && (
                      <div className="mt-2 p-2 rounded bg-yellow-100 dark:bg-yellow-900/30">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
                          <FiAlertCircle className="flex-shrink-0" />
                          <span>Mode paksa sync aktif - akan melewati pengecekan "sudah sync bulan ini"</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="light"
                  onPress={onClose}
                  className="font-medium"
                >
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onClose();
                    handleConfirmSync();
                  }}
                  startContent={<MdSync className="w-4 h-4" />}
                  className="font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                >
                  Ya, Sinkronkan Sekarang
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Sync Progress Modal */}
      <Modal
        isOpen={showProgressModal}
        isDismissable={false}
        hideCloseButton
        size="md"
        backdrop="blur"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-gray-800",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${
                  syncStatus === "success"
                    ? "bg-gradient-to-br from-green-500 to-green-600"
                    : syncStatus === "error"
                    ? "bg-gradient-to-br from-red-500 to-red-600"
                    : "bg-gradient-to-br from-purple-500 to-indigo-600"
                }`}
              >
                {syncStatus === "success" ? (
                  <FiCheckCircle className="w-6 h-6" />
                ) : syncStatus === "error" ? (
                  <FiXCircle className="w-6 h-6" />
                ) : (
                  <FiRefreshCw className="w-6 h-6 animate-spin" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {syncStatus === "success"
                    ? "Sinkronisasi Berhasil!"
                    : syncStatus === "error"
                    ? "Sinkronisasi Gagal"
                    : "Sedang Melakukan Sinkronisasi..."}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                  {syncStatus === "syncing" && "Mohon tunggu sebentar"}
                  {syncStatus === "success" && syncResult && `${syncResult.totalRecords} data berhasil disinkronkan`}
                  {syncStatus === "error" && "Terjadi kesalahan saat sinkronisasi"}
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Progress
                  </span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
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
                  className="mb-2"
                  size="md"
                />
              </div>

              {syncStatus === "success" && syncResult && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {syncResult.message}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Total: {syncResult.totalRecords} data mahasiswa
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {syncStatus === "error" && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <FiXCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Terjadi kesalahan saat melakukan sinkronisasi. Silakan coba lagi.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
}
