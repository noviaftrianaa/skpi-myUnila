"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";

const APP_KEY = "myunila-integrator";
import ScheduleList from "@/shared/components/myunila-integrator/ScheduleList";
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
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiDollarSign,
  FiUsers,
} from "react-icons/fi";
import { MdSync, MdSchool } from "react-icons/md";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";
import { keuanganClient } from "@/lib/api/keuanganClient";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import KeuanganSppMhsTable from "@/shared/components/keuangan-integrator/KeuanganSppMhsTable";

interface SppMhsStats {
  total_spp_mhs: number;
  total_mahasiswa: number;
  total_bayar: number;
  last_sync?: string;
}

export default function SppMhsManagementPage() {
  useRequireAuth();
  const { user } = useAuth();

  // State
  const [stats, setStats] = useState<SppMhsStats | null>(null);
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
  const [forceSync, setForceSync] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await keuanganClient.get("/spp-mhs/stats", {
        params: { _t: Date.now() }
      });
      const data = response.data;

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Set default stats if API fails
      setStats({
        total_spp_mhs: 0,
        total_mahasiswa: 0,
        total_bayar: 0,
        last_sync: undefined,
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleSyncClick = () => {
    if (!selectedSemester) {
      Swal.fire({
        icon: "warning",
        title: "Semester Belum Dipilih",
        text: "Pilih semester terlebih dahulu pada filter tabel sebelum melakukan sinkronisasi.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }
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

      // Build request body for sync API
      const requestBody: {
        id_smt: string;
        force_sync: boolean;
        synced_by: string;
      } = {
        id_smt: selectedSemester,
        force_sync: forceSync,
        synced_by: user?.name || "system",
      };

      // Call sync API with JSON body
      const response = await keuanganClient.post(`/spp-mhs/sync`, requestBody);

      clearInterval(progressInterval);

      if (response.data.success) {
        setSyncProgress(100);
        setSyncStatus("success");

        // Set result from API response
        setSyncResult({
          totalRecords: response.data.data?.total_processed || response.data.data?.total_inserted + response.data.data?.total_updated || 0,
          message: response.data.message || "Data SPP Mahasiswa berhasil disinkronkan"
        });

        toast.success("Sinkronisasi berhasil!");

        // Refresh stats and table after 2 seconds
        setTimeout(async () => {
          await fetchStats();
          setRefreshKey(prev => prev + 1); // Trigger table refresh
          setShowProgressModal(false);
          setSyncProgress(0);
          setSyncStatus("idle");
        }, 2000);
      } else {
        throw new Error(response.data.message || "Sinkronisasi gagal");
      }
    } catch (error: any) {
      console.error("Error syncing spp mhs:", error);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="SPP Mahasiswa"
    >
      <div className="space-y-6">
        {/* Header with Title and Sync Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              SPP Mahasiswa
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Data pembayaran SPP mahasiswa dari SIMPEDAM
            </p>
          </div>
          <Button
            color="warning"
            size="lg"
            startContent={<MdSync className="w-5 h-5" />}
            onPress={handleSyncClick}
            isLoading={isSyncing}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
          >
            Sinkronisasi Data
          </Button>
        </div>

        {/* Statistics Cards - 4 Cards Only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total SPP Card */}
          <Card className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiDollarSign className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-100 mb-1">Total SPP</p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
                      {(stats?.total_spp_mhs ?? 0).toLocaleString("id-ID")}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Mahasiswa Card */}
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiUsers className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-100 mb-1">Total Mahasiswa</p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
                      {(stats?.total_mahasiswa ?? 0).toLocaleString("id-ID")}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Bayar Card */}
          <Card className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiCheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-100 mb-1">Total Bayar</p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-lg font-bold text-white tracking-tight leading-none">
                      {formatCurrency(stats?.total_bayar ?? 0)}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Last Sync Card */}
          <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiClock className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-purple-100 mb-1">Last Sync</p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-base font-bold text-white leading-tight truncate">
                      {formatDate(stats?.last_sync)}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Scheduled Syncs Section */}
        <ScheduleList syncType="spp_mhs" />

        {/* Data Table */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <KeuanganSppMhsTable key={refreshKey} onSemesterChange={setSelectedSemester} />
          </CardBody>
        </Card>
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                    <MdSync className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Konfirmasi Sinkronisasi
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                      Data SPP Mahasiswa SIMPEDAM
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-4">
                  {/* Sync Info */}
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="w-full">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
                          Semester: {selectedSemester}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Data pembayaran SPP akan diambil dari SIMPEDAM untuk semester ini.
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                          <li>Data yang sudah ada akan diperbarui</li>
                          <li>Data baru akan ditambahkan</li>
                          <li>Mapping mahasiswa diterapkan otomatis</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Force Sync Option */}
                  <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
                          Paksa Sinkronisasi Ulang
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Aktifkan untuk men-sync ulang semua data, termasuk yang sudah pernah di-sync.
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
                  color="warning"
                  onPress={() => {
                    onClose();
                    handleConfirmSync();
                  }}
                  startContent={<MdSync className="w-4 h-4" />}
                  className="font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white"
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
                    : "bg-gradient-to-br from-amber-500 to-orange-600"
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
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
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
                      : "warning"
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
                        Total: {syncResult.totalRecords} data SPP mahasiswa
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
                      {syncResult?.message || "Terjadi kesalahan saat melakukan sinkronisasi. Silakan coba lagi."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </DashboardLayoutWithDynamicMenu>
  );
}
