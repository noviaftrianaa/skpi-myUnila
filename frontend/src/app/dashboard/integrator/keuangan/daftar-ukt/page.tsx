"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";

const APP_KEY = "myunila-integrator";
import KeuanganDaftarUktTable from "@/shared/components/keuangan-integrator/KeuanganDaftarUktTable";
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
  Select,
  SelectItem,
} from "@heroui/react";
import {
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiDatabase,
  FiList,
} from "react-icons/fi";
import { MdSync, MdSchool } from "react-icons/md";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";
import { keuanganClient } from "@/lib/api/keuanganClient";
import { toast } from "react-hot-toast";

interface DaftarUktStats {
  total_daftar_ukt: number;
  total_prodi: number;
  total_mapped: number;
  total_unmapped: number;
  last_sync?: string;
}

export default function DaftarUktManagementPage() {
  useRequireAuth();
  const { user } = useAuth();

  // State
  const [stats, setStats] = useState<DaftarUktStats | null>(null);
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
  const [selectedTahun, setSelectedTahun] = useState<string>(new Date().getFullYear().toString());
  const [forceSync, setForceSync] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Generate tahun options (current year to 5 years back)
  const currentYear = new Date().getFullYear();
  const tahunOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await keuanganClient.get("/daftar-ukt/stats", {
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
        total_daftar_ukt: 0,
        total_prodi: 0,
        total_mapped: 0,
        total_unmapped: 0,
        last_sync: undefined,
      });
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

      // Build request body for sync API (include synced_by in body to avoid CORS header issues)
      const requestBody = {
        tahun: parseInt(selectedTahun),
        force_sync: forceSync,
        synced_by: user?.name || "system",
      };

      // Call sync API with JSON body
      const response = await keuanganClient.post(`/daftar-ukt/sync`, requestBody);

      clearInterval(progressInterval);

      if (response.data.success) {
        setSyncProgress(100);
        setSyncStatus("success");

        // Set result from API response
        setSyncResult({
          totalRecords: response.data.data?.total_records || response.data.data?.total_inserted + response.data.data?.total_updated || 0,
          message: response.data.message || "Data Daftar UKT berhasil disinkronkan"
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
      console.error("Error syncing daftar ukt:", error);
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
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Daftar UKT"
    >
      <div className="space-y-6">
        {/* Header with Title and Sync Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Daftar UKT
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Data kelas UKT per prodi per tahun dari SIMPEDAM
            </p>
          </div>
          <Button
            color="success"
            size="lg"
            startContent={<MdSync className="w-5 h-5" />}
            onPress={handleSyncClick}
            isLoading={isSyncing}
            className="bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
          >
            Sinkronisasi Data
          </Button>
        </div>

        {/* Statistics Cards - 4 Cards Only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Daftar UKT Card */}
          <Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiList className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-emerald-100 mb-1">Total Daftar UKT</p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
                      {(stats?.total_daftar_ukt ?? 0).toLocaleString("id-ID")}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Prodi Card */}
          <Card className="bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiDatabase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-teal-100 mb-1">Total Prodi</p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
                      {(stats?.total_prodi ?? 0).toLocaleString("id-ID")}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Prodi Mapped Card */}
          <Card className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiCheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-100 mb-1">Mapped</p>
                  {isLoadingStats ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
                      {(stats?.total_mapped ?? 0).toLocaleString("id-ID")}
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
        <ScheduleList syncType="daftar_ukt" />

        {/* Data Table */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <KeuanganDaftarUktTable key={refreshKey} />
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                    <MdSync className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Konfirmasi Sinkronisasi
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                      Data Daftar UKT SIMPEDAM
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-start gap-3">
                      <FiAlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div className="w-full">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Proses ini akan mengambil data daftar UKT terbaru dari SIMPEDAM dan menyimpannya ke database.
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                          <li>Data yang sudah ada akan diperbarui</li>
                          <li>Data baru akan ditambahkan</li>
                          <li>Mapping prodi akan diterapkan otomatis</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Tahun Selection */}
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                      Pilih Tahun Akademik
                    </h4>
                    <Select
                      label="Tahun"
                      placeholder="Pilih tahun"
                      selectedKeys={[selectedTahun]}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        if (selected) setSelectedTahun(selected);
                      }}
                      classNames={{
                        trigger: "bg-white dark:bg-gray-800",
                      }}
                    >
                      {tahunOptions.map((tahun) => (
                        <SelectItem key={tahun.toString()}>
                          {tahun.toString()}
                        </SelectItem>
                      ))}
                    </Select>
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
                    {forceSync && (
                      <div className="mt-2 p-2 rounded bg-yellow-100 dark:bg-yellow-900/30">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
                          <FiAlertCircle className="flex-shrink-0" />
                          <span>Mode paksa sync aktif - akan memperbarui semua data</span>
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
                  color="success"
                  onPress={() => {
                    onClose();
                    handleConfirmSync();
                  }}
                  startContent={<MdSync className="w-4 h-4" />}
                  className="font-medium bg-gradient-to-r from-emerald-600 to-green-600 text-white"
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
                    : "bg-gradient-to-br from-emerald-500 to-green-600"
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
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
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
                      : "success"
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
                        Total: {syncResult.totalRecords} data daftar UKT
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
