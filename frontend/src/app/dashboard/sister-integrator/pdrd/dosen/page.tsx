"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import SisterDosenTable from "@/shared/components/sister-integrator/SisterDosenTable";
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
} from "@heroui/react";
import {
  FiUsers,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDatabase,
  FiArrowLeft,
  FiAlertCircle,
  FiUser,
} from "react-icons/fi";
import { MdSync } from "react-icons/md";
import { RiGovernmentFill } from "react-icons/ri";
import { sisterIntegratorMenuConfig } from "../../config/menuConfig";
import Link from "next/link";
import { sisterDosenService, type SisterDosenStats } from "@/lib/services/dosenService";
import { toast } from "react-hot-toast";

export default function DosenManagementPage() {
  useRequireAuth();
  const { user } = useAuth();

  // State
  const [stats, setStats] = useState<SisterDosenStats | null>(null);
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

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await sisterDosenService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Gagal memuat statistik dosen");
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
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Call sync API
      const response = await sisterDosenService.syncFromSister(user?.name || "system");

      clearInterval(progressInterval);
      setSyncProgress(100);

      // Set sync result
      setSyncResult({
        totalRecords: response.total_success,
        message: `Berhasil sinkronisasi ${response.total_success} data dosen`,
      });

      setSyncStatus("success");
      toast.success(`Berhasil sinkronisasi ${response.total_success} data dosen`);

      // Refresh data after 2 seconds
      setTimeout(async () => {
        await fetchStats();
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Error syncing dosen:", error);
      setSyncStatus("error");
      toast.error("Gagal melakukan sinkronisasi");
      setTimeout(() => {
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
      }, 2000);
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

  if (isLoadingStats) {
    return (
      <DashboardLayout
        appName="SISTER Integrator"
        appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
        menuConfig={sisterIntegratorMenuConfig}
        pageTitle="Dosen Management"
      >
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" color="primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      appName="SISTER Integrator"
      appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
      menuConfig={sisterIntegratorMenuConfig}
      pageTitle="Dosen Management"
    >
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard/sister-integrator"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 mb-2 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Kembali ke Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Data Dosen & Tendik
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sinkronisasi dan kelola data SDM dosen dan tenaga kependidikan dari SISTER API
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            startContent={<MdSync className="w-5 h-5" />}
            onClick={handleSyncClick}
            isLoading={isSyncing}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
          >
            Sinkronisasi Data
          </Button>
        </div>

        {/* Statistics Cards - Compact Horizontal Layout (Match Referensi Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Dosen Card */}
          <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiDatabase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-purple-100">Total Dosen</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Live</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {stats?.total_dosen.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-purple-100/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Total data dosen
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Dosen Aktif Card */}
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
                    <p className="text-xs font-medium text-emerald-100">Dosen Aktif</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">✓ Active</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {stats?.total_aktif.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-emerald-100/80">
                    {stats ? ((stats.total_aktif / stats.total_dosen) * 100).toFixed(1) : 0}% dari total dosen
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Tidak Aktif Card */}
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
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {stats?.total_tidak_aktif.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-orange-100/80">
                    {stats ? ((stats.total_tidak_aktif / stats.total_dosen) * 100).toFixed(1) : 0}% dari total dosen
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Last Sync Card */}
          <Card className="bg-gradient-to-br from-blue-500 via-cyan-600 to-sky-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiClock className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-blue-100">Last Sync</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Recent</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white leading-tight mb-1 truncate">
                    {formatDate(stats?.last_sync)}
                  </h3>
                  <p className="text-[10px] text-blue-100/80">
                    Terakhir sinkronisasi data
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Data Table using SisterDosenTable Component */}
        <SisterDosenTable />
      </div>

      {/* Confirmation Modal */}
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
                      Data Dosen & Tendik
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Proses ini akan mengambil data dosen terbaru dari SISTER API dan menyimpannya ke database.
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                          <li>Data yang sudah ada akan diperbarui</li>
                          <li>Data baru akan ditambahkan</li>
                          <li>Proses memerlukan waktu beberapa menit</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">User</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.name || "System"}
                    </span>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="light"
                  onPress={onClose}
                  className="text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={handleConfirmSync}
                  startContent={<FiRefreshCw className="w-4 h-4" />}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                >
                  Mulai Sinkronisasi
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Progress Modal */}
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
                  <FiAlertCircle className="w-6 h-6" />
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
                  className="h-2"
                  classNames={{
                    indicator: syncStatus === "syncing" ? "animate-pulse" : "",
                  }}
                />
              </div>

              {syncStatus === "syncing" && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <Spinner size="sm" color="primary" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Mengambil data dari SISTER API...
                  </p>
                </div>
              )}

              {syncStatus === "success" && syncResult && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-3">
                    <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                      {syncResult.message}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Records</span>
                    <span className="font-bold text-green-700 dark:text-green-300">
                      {syncResult.totalRecords}
                    </span>
                  </div>
                </div>
              )}

              {syncStatus === "error" && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Gagal melakukan sinkronisasi. Silakan coba lagi atau hubungi administrator.
                  </p>
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
}
