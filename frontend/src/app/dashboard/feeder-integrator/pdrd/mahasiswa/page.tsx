"use client";

import { useState, useEffect } from "react";
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
import ScheduleList from "@/components/sister-integrator/ScheduleList";

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

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await feederClient.get("/mahasiswa/stats");
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

      // TODO: Call sync API when implemented
      // const response = await feederClient.post("/mahasiswa/sync", {
      //   synced_by: user?.name || "system"
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      setSyncProgress(100);
      setSyncStatus("success");

      // Mock result
      setSyncResult({
        totalRecords: 1000,
        message: "Data mahasiswa berhasil disinkronkan"
      });

      toast.success("Sinkronisasi berhasil!");

      // Refresh stats after 2 seconds
      setTimeout(async () => {
        await fetchStats();
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
      }, 2000);
    } catch (error: any) {
      console.error("Error syncing mahasiswa:", error);
      setSyncStatus("error");
      toast.error(error.message || "Gagal melakukan sinkronisasi");
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
        <FeederMahasiswaTable />
      </div>

      {/* Sync Confirmation Modal */}
      <Modal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        size="md"
      >
        <ModalContent>
          <ModalHeader className="flex gap-2 items-center">
            <FiAlertCircle className="text-blue-500" />
            Konfirmasi Sinkronisasi
          </ModalHeader>
          <ModalBody>
            <p>
              Apakah Anda yakin ingin melakukan sinkronisasi data mahasiswa dari Neo Feeder PDDIKTI?
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Proses ini akan memperbarui data mahasiswa di sistem dengan data terbaru dari Neo Feeder.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setShowSyncModal(false)}
            >
              Batal
            </Button>
            <Button
              color="primary"
              onPress={handleConfirmSync}
              startContent={<MdSync />}
            >
              Ya, Sinkronkan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Sync Progress Modal */}
      <Modal
        isOpen={showProgressModal}
        isDismissable={false}
        hideCloseButton
        size="md"
      >
        <ModalContent>
          <ModalHeader className="flex gap-2 items-center">
            {syncStatus === "syncing" && <FiRefreshCw className="animate-spin text-blue-500" />}
            {syncStatus === "success" && <FiCheckCircle className="text-green-500" />}
            {syncStatus === "error" && <FiXCircle className="text-red-500" />}
            {syncStatus === "syncing" && "Sedang Sinkronisasi..."}
            {syncStatus === "success" && "Sinkronisasi Berhasil!"}
            {syncStatus === "error" && "Sinkronisasi Gagal"}
          </ModalHeader>
          <ModalBody className="pb-6">
            <Progress
              value={syncProgress}
              color={
                syncStatus === "success"
                  ? "success"
                  : syncStatus === "error"
                  ? "danger"
                  : "primary"
              }
              className="mb-4"
            />
            <p className="text-sm text-center">
              {syncStatus === "syncing" && `Progress: ${syncProgress}%`}
              {syncStatus === "success" && syncResult?.message}
              {syncStatus === "error" && "Terjadi kesalahan saat sinkronisasi"}
            </p>
            {syncStatus === "success" && syncResult && (
              <p className="text-xs text-center text-gray-600 mt-2">
                {syncResult.totalRecords} data berhasil disinkronkan
              </p>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
}
