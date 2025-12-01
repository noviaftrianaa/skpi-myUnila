"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import FeederTranskripNilaiTable from "@/shared/components/feeder-integrator/FeederTranskripNilaiTable";
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
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiUsers,
  FiRefreshCw,
  FiFileText,
} from "react-icons/fi";
import { MdSync, MdSchool, MdClass } from "react-icons/md";
import { feederIntegratorMenuConfig } from "../../config/menuConfig";
import { feederClient } from "@/lib/api/feederClient";
import { toast } from "react-hot-toast";
import ScheduleList from "@/shared/components/feeder-integrator/ScheduleList";

interface TranskripNilaiStats {
  total_transkrip: number;
  total_mahasiswa: number;
  total_prodi: number;
  total_nilai_kelas: number;
  total_konversi: number;
  total_transfer: number;
  last_sync?: string;
}

export default function TranskripNilaiManagementPage() {
  useRequireAuth();
  const { user } = useAuth();

  // State
  const [stats, setStats] = useState<TranskripNilaiStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncResult, setSyncResult] = useState<{
    totalFetched: number;
    totalSynced: number;
    message: string;
  } | null>(null);
  const [syncFilters, setSyncFilters] = useState<{
    id_prodi?: string;
    id_semester?: string[];
  }>({});
  const [syncFilterLabels, setSyncFilterLabels] = useState<{
    prodi?: string;
    semester?: string;
  }>({});
  const [forceSync, setForceSync] = useState(false);

  // Handle filter changes from table
  const handleFilterChange = useCallback(
    (filters: { id_semester?: string[]; id_prodi?: string }) => {
      setSyncFilters(filters);
      if (filters.id_semester) {
        setSyncFilterLabels((prev) => ({
          ...prev,
          semester: filters.id_semester?.join(", "),
        }));
      }
    },
    []
  );

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await feederClient.get("/transkrip-nilai/stats", {
        params: { _t: Date.now() },
      });
      const data = response.data;

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Gagal memuat statistik transkrip nilai");
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
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 20) {
            clearInterval(progressInterval);
            return 20;
          }
          return prev + 5;
        });
      }, 200);

      const params = new URLSearchParams();
      params.append("synced_by", user?.name || "system");

      if (syncFilters.id_semester && syncFilters.id_semester.length > 0) {
        params.append("id_semester", syncFilters.id_semester.join(","));
      }

      if (syncFilters.id_prodi) {
        params.append("id_prodi", syncFilters.id_prodi);
      }

      if (forceSync) {
        params.append("force_sync", "true");
      }

      const response = await feederClient.post(
        `/transkrip-nilai/sync?${params.toString()}`
      );

      clearInterval(progressInterval);

      if (response.data.success) {
        setSyncProgress(100);
        setSyncStatus("success");

        setSyncResult({
          totalFetched: response.data.data?.total_fetched || 0,
          totalSynced: response.data.data?.total_synced || 0,
          message:
            response.data.data?.message ||
            response.data.message ||
            "Data transkrip nilai berhasil disinkronkan",
        });

        toast.success("Sinkronisasi berhasil!");

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
      console.error("Error syncing transkrip nilai:", error);
      setSyncStatus("error");

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal melakukan sinkronisasi";
      toast.error(errorMessage);

      setSyncResult({
        totalFetched: 0,
        totalSynced: 0,
        message: errorMessage,
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
      pageTitle="Transkrip Nilai"
    >
      <div className="space-y-6">
        {/* Header with Title and Sync Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Transkrip Nilai Mahasiswa
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Data transkrip nilai mahasiswa dari Neo Feeder PDDIKTI
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            startContent={<MdSync className="w-5 h-5" />}
            onPress={handleSyncClick}
            isLoading={isSyncing}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
          >
            Sinkronisasi Data
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Transkrip Card */}
          <Card className="bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiFileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-cyan-100">
                      Total Transkrip
                    </p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">
                        Live
                      </span>
                    </div>
                  </div>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <>
                      <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                        {stats?.total_transkrip.toLocaleString() || "0"}
                      </h3>
                      <p className="text-[10px] text-cyan-100/80 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                        Total record transkrip
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Mahasiswa Card */}
          <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiUsers className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-emerald-100">
                      Mahasiswa
                    </p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">
                        Active
                      </span>
                    </div>
                  </div>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <>
                      <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                        {stats?.total_mahasiswa.toLocaleString() || "0"}
                      </h3>
                      <p className="text-[10px] text-emerald-100/80">
                        Mahasiswa dengan transkrip
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Breakdown Card - Nilai Kelas / Konversi / Transfer */}
          <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <MdClass className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-purple-100">
                      Breakdown Sumber
                    </p>
                  </div>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-purple-100">Kelas:</span>
                        <span className="font-semibold text-white">{stats?.total_nilai_kelas.toLocaleString() || "0"}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-purple-100">Konversi:</span>
                        <span className="font-semibold text-white">{stats?.total_konversi.toLocaleString() || "0"}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-purple-100">Transfer:</span>
                        <span className="font-semibold text-white">{stats?.total_transfer.toLocaleString() || "0"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Last Sync Card */}
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiClock className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-blue-100">
                      Last Sync
                    </p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">
                        Recent
                      </span>
                    </div>
                  </div>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <>
                      <h3 className="text-base font-bold text-white leading-tight mb-1 truncate">
                        {formatDate(stats?.last_sync)}
                      </h3>
                      <p className="text-[10px] text-blue-100/80">
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
        <ScheduleList syncType={"transkrip_nilai" as any} />

        {/* Data Table */}
        <FeederTranskripNilaiTable onFilterChange={handleFilterChange} />
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                    <MdSync className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Konfirmasi Sinkronisasi
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                      Data Transkrip Nilai Neo Feeder
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
                          Proses ini akan mengambil data transkrip nilai terbaru dari Neo Feeder PDDIKTI.
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                          <li>Nilai dari kelas kuliah</li>
                          <li>Nilai konversi MBKM</li>
                          <li>Nilai transfer dari PT lain</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Filter Info */}
                  {(syncFilters.id_prodi ||
                    (syncFilters.id_semester &&
                      syncFilters.id_semester.length > 0)) && (
                    <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                        Filter yang Diterapkan:
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {syncFilters.id_semester &&
                          syncFilters.id_semester.length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Semester:</span>
                              <span>{syncFilters.id_semester.join(", ")}</span>
                            </div>
                          )}
                        {syncFilters.id_prodi && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Prodi:</span>
                            <span>
                              {syncFilterLabels.prodi || "Prodi terpilih"}
                            </span>
                          </div>
                        )}
                        {!syncFilters.id_prodi &&
                          (!syncFilters.id_semester ||
                            syncFilters.id_semester.length === 0) && (
                            <p className="text-sm italic">
                              Tidak ada filter - akan sync semua data
                            </p>
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
                          Aktifkan untuk men-sync ulang data yang sudah pernah di-sync.
                        </p>
                      </div>
                      <Switch
                        isSelected={forceSync}
                        onValueChange={setForceSync}
                        size="sm"
                        classNames={{
                          wrapper: forceSync
                            ? "bg-yellow-500 border-0"
                            : "bg-gray-300 border-0",
                        }}
                      />
                    </div>
                    {forceSync && (
                      <div className="mt-2 p-2 rounded bg-yellow-100 dark:bg-yellow-900/30">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
                          <FiAlertCircle className="flex-shrink-0" />
                          <span>
                            Mode paksa sync aktif - akan melewati pengecekan cache
                          </span>
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
                  className="font-medium bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
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
                    : "bg-gradient-to-br from-cyan-500 to-blue-600"
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
                  {syncStatus === "success" &&
                    syncResult &&
                    `Fetched: ${syncResult.totalFetched}, Synced: ${syncResult.totalSynced}`}
                  {syncStatus === "error" &&
                    "Terjadi kesalahan saat sinkronisasi"}
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
                  <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
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
                        Fetched: {syncResult.totalFetched}, Synced: {syncResult.totalSynced}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {syncStatus === "error" && syncResult && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <FiXCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {syncResult.message}
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
