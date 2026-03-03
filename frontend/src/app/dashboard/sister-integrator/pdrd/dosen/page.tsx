"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
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
  FiCamera,
  FiFile,
} from "react-icons/fi";
import { MdSync } from "react-icons/md";
import { RiGovernmentFill } from "react-icons/ri";
import { sisterIntegratorMenuConfig } from "../../config/menuConfig";
import Link from "next/link";
import { sisterDosenService, type SisterDosenStats, type SisterDosenPhotoSyncResult, type SisterDosenDokumenSyncResult } from "@/lib/services/sister/pdrd/dosenService";
import { toast } from "react-hot-toast";
import ScheduleList from "@/shared/components/sister-integrator/ScheduleList";

const APP_KEY = "sister-integrator";

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

  // Photo Sync State
  const [isSyncingPhotos, setIsSyncingPhotos] = useState(false);
  const [showPhotoSyncModal, setShowPhotoSyncModal] = useState(false);
  const [showPhotoProgressModal, setShowPhotoProgressModal] = useState(false);
  const [photoSyncProgress, setPhotoSyncProgress] = useState(0);
  const [photoSyncStatus, setPhotoSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [photoSyncResult, setPhotoSyncResult] = useState<SisterDosenPhotoSyncResult | null>(null);

  // Dokumen Sync State
  const [isSyncingDokumen, setIsSyncingDokumen] = useState(false);
  const [showDokumenSyncModal, setShowDokumenSyncModal] = useState(false);
  const [showDokumenProgressModal, setShowDokumenProgressModal] = useState(false);
  const [dokumenSyncProgress, setDokumenSyncProgress] = useState(0);
  const [dokumenSyncStatus, setDokumenSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [dokumenSyncResult, setDokumenSyncResult] = useState<SisterDosenDokumenSyncResult | null>(null);

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

  const handlePhotoSyncClick = () => {
    setShowPhotoSyncModal(true);
  };

  const handleConfirmPhotoSync = async () => {
    setShowPhotoSyncModal(false);
    setShowPhotoProgressModal(true);
    setIsSyncingPhotos(true);
    setPhotoSyncStatus("syncing");
    setPhotoSyncProgress(0);

    try {
      // Simulate progress (photo sync takes longer)
      const progressInterval = setInterval(() => {
        setPhotoSyncProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 1000);

      // Call photo sync API
      const response = await sisterDosenService.syncPhotosToMinIO(user?.name || "system");

      clearInterval(progressInterval);
      setPhotoSyncProgress(100);
      setPhotoSyncResult(response);
      setPhotoSyncStatus("success");
      toast.success(`Berhasil sync ${response.total_success} foto dosen (${response.total_skipped} skipped)`);

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setShowPhotoProgressModal(false);
        setPhotoSyncProgress(0);
        setPhotoSyncStatus("idle");
        setPhotoSyncResult(null);
      }, 3000);
    } catch (error) {
      console.error("Error syncing photos:", error);
      setPhotoSyncStatus("error");
      toast.error("Gagal melakukan sinkronisasi foto");
      setTimeout(() => {
        setShowPhotoProgressModal(false);
        setPhotoSyncProgress(0);
        setPhotoSyncStatus("idle");
      }, 2000);
    } finally {
      setIsSyncingPhotos(false);
    }
  };

  const handleDokumenSyncClick = () => {
    setShowDokumenSyncModal(true);
  };

  const handleConfirmDokumenSync = async () => {
    setShowDokumenSyncModal(false);
    setShowDokumenProgressModal(true);
    setIsSyncingDokumen(true);
    setDokumenSyncStatus("syncing");
    setDokumenSyncProgress(0);

    try {
      // Simulate slow progress (dokumen sync takes very long)
      const progressInterval = setInterval(() => {
        setDokumenSyncProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 3;
        });
      }, 2000);

      const response = await sisterDosenService.syncDokumenToMinIO(user?.name || "system");

      clearInterval(progressInterval);
      setDokumenSyncProgress(100);
      setDokumenSyncResult(response);
      setDokumenSyncStatus("success");
      toast.success(
        `Berhasil sync ${response.total_success} dokumen (${response.total_skipped} skipped)`
      );

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setShowDokumenProgressModal(false);
        setDokumenSyncProgress(0);
        setDokumenSyncStatus("idle");
        setDokumenSyncResult(null);
      }, 4000);
    } catch (error) {
      console.error("Error syncing dokumen:", error);
      setDokumenSyncStatus("error");
      toast.error("Gagal melakukan sinkronisasi dokumen");
      setTimeout(() => {
        setShowDokumenProgressModal(false);
        setDokumenSyncProgress(0);
        setDokumenSyncStatus("idle");
      }, 2000);
    } finally {
      setIsSyncingDokumen(false);
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
      <DashboardLayoutWithDynamicMenu
        appName="SISTER Integrator"
        appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
        fallbackMenus={sisterIntegratorMenuConfig}
        appKey={APP_KEY}
        pageTitle="Dosen"
      >
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" color="primary" />
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SISTER Integrator"
      appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
      fallbackMenus={sisterIntegratorMenuConfig}
      appKey={APP_KEY}
      pageTitle="Dosen"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Data Dosen & Tendik
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Data SDM aktif di homebase Unila pada periode tahun ajaran 2025
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              color="primary"
              size="lg"
              startContent={<FiFile className="w-5 h-5" />}
              onClick={handleDokumenSyncClick}
              isLoading={isSyncingDokumen}
              className="bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
            >
              Sinkronisasi Dokumen
            </Button>
            <Button
              color="primary"
              size="lg"
              startContent={<FiCamera className="w-5 h-5" />}
              onClick={handlePhotoSyncClick}
              isLoading={isSyncingPhotos}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
            >
              Sinkronisasi Foto
            </Button>
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
                    <p className="text-xs font-medium text-purple-100">Total Dosen & Tendik</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Live</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {stats?.total_dosen.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-purple-100/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    Total seluruh SDM
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
                    Dengan keaktifan tahun 2025
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

        {/* Scheduled Syncs Section */}
        <ScheduleList syncType="dosen" />
        <ScheduleList syncType="dosen_foto" />
        <ScheduleList syncType="dosen_dokumen" />

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
      {/* Photo Sync Confirmation Modal */}
      <Modal
        isOpen={showPhotoSyncModal}
        onOpenChange={setShowPhotoSyncModal}
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-lg">
                    <FiCamera className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Konfirmasi Sinkronisasi Foto
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                      Foto Dosen dari SISTER ke MinIO
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
                          Proses ini akan mengambil foto dosen dari SISTER API dan menyimpannya ke MinIO storage.
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                          <li>Foto yang sudah ada di MinIO akan di-skip</li>
                          <li>Hanya foto baru yang akan diunduh</li>
                          <li>Proses memerlukan waktu lebih lama (5-15 menit)</li>
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
                  onPress={handleConfirmPhotoSync}
                  startContent={<FiCamera className="w-4 h-4" />}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
                >
                  Mulai Sinkronisasi Foto
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Photo Sync Progress Modal */}
      <Modal
        isOpen={showPhotoProgressModal}
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
                  photoSyncStatus === "success"
                    ? "bg-gradient-to-br from-green-500 to-green-600"
                    : photoSyncStatus === "error"
                    ? "bg-gradient-to-br from-red-500 to-red-600"
                    : "bg-gradient-to-br from-teal-500 to-cyan-600"
                }`}
              >
                {photoSyncStatus === "success" ? (
                  <FiCheckCircle className="w-6 h-6" />
                ) : photoSyncStatus === "error" ? (
                  <FiAlertCircle className="w-6 h-6" />
                ) : (
                  <FiCamera className="w-6 h-6 animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {photoSyncStatus === "success"
                    ? "Sinkronisasi Foto Berhasil!"
                    : photoSyncStatus === "error"
                    ? "Sinkronisasi Foto Gagal"
                    : "Sedang Sinkronisasi Foto..."}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                  {photoSyncStatus === "syncing" && "Mengunduh foto dari SISTER API ke MinIO"}
                  {photoSyncStatus === "success" && photoSyncResult &&
                    `${photoSyncResult.total_success} foto baru, ${photoSyncResult.total_skipped} sudah ada`}
                  {photoSyncStatus === "error" && "Terjadi kesalahan saat sinkronisasi foto"}
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
                  <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                    {photoSyncProgress}%
                  </span>
                </div>
                <Progress
                  value={photoSyncProgress}
                  color={
                    photoSyncStatus === "success"
                      ? "success"
                      : photoSyncStatus === "error"
                      ? "danger"
                      : "primary"
                  }
                  className="h-2"
                  classNames={{
                    indicator: photoSyncStatus === "syncing" ? "animate-pulse" : "",
                  }}
                />
              </div>

              {photoSyncStatus === "syncing" && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20">
                  <Spinner size="sm" color="primary" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Mengunduh dan mengunggah foto dosen ke MinIO storage...
                  </p>
                </div>
              )}

              {photoSyncStatus === "success" && photoSyncResult && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-3">
                    <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                      Sinkronisasi foto selesai ({photoSyncResult.duration})
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Diproses</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {photoSyncResult.total_processed}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Foto Baru</span>
                      <span className="font-bold text-green-700 dark:text-green-300">
                        {photoSyncResult.total_success}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sudah Ada (Skip)</span>
                      <span className="font-bold text-blue-700 dark:text-blue-300">
                        {photoSyncResult.total_skipped}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Gagal</span>
                      <span className="font-bold text-red-700 dark:text-red-300">
                        {photoSyncResult.total_failed}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {photoSyncStatus === "error" && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Gagal melakukan sinkronisasi foto. Silakan coba lagi atau hubungi administrator.
                  </p>
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* Dokumen Sync Confirmation Modal */}
      <Modal
        isOpen={showDokumenSyncModal}
        onOpenChange={setShowDokumenSyncModal}
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg">
                    <FiFile className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Konfirmasi Sinkronisasi Dokumen
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                      Dokumen Dosen dari SISTER ke MinIO
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-start gap-3">
                      <FiAlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Proses ini akan mengambil dokumen dosen dari SISTER API dan menyimpannya ke MinIO storage.
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                          <li>Dokumen yang sudah ada di MinIO akan di-skip</li>
                          <li>File disimpan di MinIO (bukan di database)</li>
                          <li>Proses dapat memerlukan waktu sangat lama (10-60 menit)</li>
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
                  color="warning"
                  onPress={handleConfirmDokumenSync}
                  startContent={<FiFile className="w-4 h-4" />}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                >
                  Mulai Sinkronisasi Dokumen
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Dokumen Sync Progress Modal */}
      <Modal
        isOpen={showDokumenProgressModal}
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
                  dokumenSyncStatus === "success"
                    ? "bg-gradient-to-br from-green-500 to-green-600"
                    : dokumenSyncStatus === "error"
                    ? "bg-gradient-to-br from-red-500 to-red-600"
                    : "bg-gradient-to-br from-orange-500 to-amber-600"
                }`}
              >
                {dokumenSyncStatus === "success" ? (
                  <FiCheckCircle className="w-6 h-6" />
                ) : dokumenSyncStatus === "error" ? (
                  <FiAlertCircle className="w-6 h-6" />
                ) : (
                  <FiFile className="w-6 h-6 animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {dokumenSyncStatus === "success"
                    ? "Sinkronisasi Dokumen Berhasil!"
                    : dokumenSyncStatus === "error"
                    ? "Sinkronisasi Dokumen Gagal"
                    : "Sedang Sinkronisasi Dokumen..."}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                  {dokumenSyncStatus === "syncing" && "Mengunduh dokumen dari SISTER ke MinIO storage"}
                  {dokumenSyncStatus === "success" && dokumenSyncResult &&
                    `${dokumenSyncResult.total_success} baru, ${dokumenSyncResult.total_skipped} sudah ada`}
                  {dokumenSyncStatus === "error" && "Terjadi kesalahan saat sinkronisasi dokumen"}
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
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {dokumenSyncProgress}%
                  </span>
                </div>
                <Progress
                  value={dokumenSyncProgress}
                  color={
                    dokumenSyncStatus === "success"
                      ? "success"
                      : dokumenSyncStatus === "error"
                      ? "danger"
                      : "warning"
                  }
                  className="h-2"
                  classNames={{
                    indicator: dokumenSyncStatus === "syncing" ? "animate-pulse" : "",
                  }}
                />
              </div>

              {dokumenSyncStatus === "syncing" && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                  <Spinner size="sm" color="warning" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Mengunduh dan mengunggah dokumen dosen ke MinIO storage...
                  </p>
                </div>
              )}

              {dokumenSyncStatus === "success" && dokumenSyncResult && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-3">
                    <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                      Sinkronisasi dokumen selesai ({dokumenSyncResult.duration})
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Dosen</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {dokumenSyncResult.total_dosen}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Dokumen</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        {dokumenSyncResult.total_dokumen}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Berhasil Upload</span>
                      <span className="font-bold text-green-700 dark:text-green-300">
                        {dokumenSyncResult.total_success}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sudah Ada (Skip)</span>
                      <span className="font-bold text-blue-700 dark:text-blue-300">
                        {dokumenSyncResult.total_skipped}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Gagal</span>
                      <span className="font-bold text-red-700 dark:text-red-300">
                        {dokumenSyncResult.total_failed}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {dokumenSyncStatus === "error" && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Gagal melakukan sinkronisasi dokumen. Silakan coba lagi atau hubungi administrator.
                  </p>
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </DashboardLayoutWithDynamicMenu>
  );
}
