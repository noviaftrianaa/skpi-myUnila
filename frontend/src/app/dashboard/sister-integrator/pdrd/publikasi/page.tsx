"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
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
  FiDatabase,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { MdSync } from "react-icons/md";
import { RiGovernmentFill } from "react-icons/ri";
import { sisterIntegratorMenuConfig } from "../../config/menuConfig";
import { sisterPublikasiService, type PublikasiStats } from "@/lib/services/publikasiService";
import { toast } from "react-hot-toast";
import ScheduleList from "@/components/sister-integrator/ScheduleList";
import SisterPublikasiTable from "@/shared/components/sister-integrator/SisterPublikasiTable";

export default function PublikasiManagementPage() {
  useRequireAuth();
  const { user } = useAuth();

  // State
  const [stats, setStats] = useState<PublikasiStats | null>(null);
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
      const data = await sisterPublikasiService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Gagal memuat statistik publikasi");
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

      // Call the batch sync API
      const username = user?.username || user?.name || "system";
      const result = await sisterPublikasiService.syncFromSister(username);

      clearInterval(progressInterval);
      setSyncProgress(100);

      // Success!
      setSyncStatus("success");
      setSyncResult({
        totalRecords: result.total_publikasi,
        message: `${result.total_success} dosen berhasil, ${result.total_failed} gagal`,
      });
      toast.success(`Sinkronisasi berhasil! ${result.total_publikasi} publikasi dari ${result.total_success} dosen`);

      // Refresh stats and close modal after 2 seconds
      setTimeout(async () => {
        await fetchStats();
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
        setSyncResult(null);
      }, 2000);
    } catch (error) {
      console.error("Error syncing publikasi:", error);
      setSyncStatus("error");
      toast.error("Gagal melakukan sinkronisasi publikasi");
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
        pageTitle="Publikasi Dosen"
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
      pageTitle="Publikasi Dosen"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Publikasi Dosen
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola dan sinkronisasi data publikasi dosen dari SISTER API
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            startContent={<MdSync className="w-5 h-5" />}
            onClick={handleSyncClick}
            isLoading={isSyncing}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
          >
            Sinkronisasi Data
          </Button>
        </div>

        {/* Statistics Cards - Compact Horizontal Layout (Match Penugasan Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Publikasi Card */}
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiDatabase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-blue-100">Total Publikasi</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Data</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {stats?.total_publikasi.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-blue-100/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Total data publikasi
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Jurnal Internasional Card */}
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
                    <p className="text-xs font-medium text-emerald-100">Jurnal Internasional</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">🌍 Intl</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {stats?.total_jurnal_intl.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-emerald-100/80">
                    Jurnal Internasional
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Prosiding & Buku Card */}
          <Card className="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiCheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-orange-100">Prosiding & Buku</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/30 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">📚 Other</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {((stats?.total_proseeding || 0) + (stats?.total_buku || 0)).toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-orange-100/80">
                    Prosiding & Buku
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Last Sync Card */}
          <Card className="bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
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
                      <span className="text-[10px] font-semibold text-white">Sync</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-white leading-tight">
                    {formatDate(stats?.last_sync)}
                  </p>
                  <p className="text-[10px] text-purple-100/80 mt-1">
                    Terakhir sinkronisasi
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Scheduled Syncs Section */}
        <ScheduleList syncType="publikasi" />

        {/* Data Table */}
        <SisterPublikasiTable />
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg">
                    <MdSync className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Konfirmasi Sinkronisasi
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                      Data Publikasi Dosen
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
                          Sistem akan melakukan sinkronisasi semua data publikasi dosen dari SISTER API.
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Proses ini akan berjalan di background menggunakan 3 worker concurrent untuk performa optimal.
                        </p>
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
                  startContent={<MdSync className="w-5 h-5" />}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold"
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
                    : "bg-gradient-to-br from-blue-500 to-cyan-600"
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
                  {syncStatus === "syncing" && "Mohon tunggu, proses sedang berjalan..."}
                  {syncStatus === "success" && syncResult && `${syncResult.totalRecords} publikasi berhasil disinkronkan`}
                  {syncStatus === "error" && "Terjadi kesalahan saat sinkronisasi"}
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-4">
              {syncStatus === "syncing" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Progress
                    </span>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {syncProgress}%
                    </span>
                  </div>
                  <Progress
                    size="md"
                    value={syncProgress}
                    color="primary"
                    className="max-w-full"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Sedang memproses data publikasi dosen...
                  </p>
                </div>
              )}
              {syncStatus === "success" && syncResult && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300 text-center font-medium">
                    {syncResult.message}
                  </p>
                </div>
              )}
              {syncStatus === "error" && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300 text-center">
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
