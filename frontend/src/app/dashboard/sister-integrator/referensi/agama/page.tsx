"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import DataTable, { type Column } from "@/shared/components/ui/DataTable";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "@heroui/react";
import {
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiDatabase,
  FiDownload,
  FiArrowLeft,
  FiUser,
} from "react-icons/fi";
import { MdSync, MdCloudDone } from "react-icons/md";
import { RiGovernmentFill } from "react-icons/ri";
import { sisterIntegratorMenuConfig } from "../../config/menuConfig";
import { agamaService, type AgamaData } from "@/lib/services/sisterService";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function AgamaPage() {
  useRequireAuth();
  const { user } = useAuth();

  // State management
  const [agamaList, setAgamaList] = useState<AgamaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncResult, setSyncResult] = useState<{
    totalRecords: number;
    message: string;
  } | null>(null);

  // Fetch agama data on component mount
  useEffect(() => {
    fetchAgamaData();
  }, []);

  const fetchAgamaData = async () => {
    try {
      setIsLoading(true);
      const data = await agamaService.getAll();
      setAgamaList(data);
    } catch (error) {
      console.error("Error fetching agama:", error);
      toast.error("Gagal memuat data agama");
    } finally {
      setIsLoading(false);
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
      const response = await agamaService.sync(user?.username || "system");

      clearInterval(progressInterval);
      setSyncProgress(100);

      // Set sync result
      setSyncResult({
        totalRecords: response.data.total_records,
        message: response.data.message,
      });

      setSyncStatus("success");
      toast.success(`Berhasil sinkronisasi ${response.data.total_records} data agama`);

      // Refresh data after 2 seconds
      setTimeout(async () => {
        await fetchAgamaData();
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Error syncing agama:", error);
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
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Define DataTable columns
  const columns: Column<AgamaData>[] = [
    {
      key: "no",
      label: "NO",
      width: "60px",
      align: "center",
      render: (_item, index) => (
        <span className="font-semibold text-gray-700">{(index ?? 0) + 1}</span>
      ),
    },
    {
      key: "id_agama",
      label: "ID AGAMA",
      width: "100px",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-sm font-semibold text-purple-600 dark:text-purple-400">
          {item.id_agama}
        </span>
      ),
    },
    {
      key: "nama_agama",
      label: "NAMA AGAMA",
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {item.nama_agama}
        </span>
      ),
    },
    {
      key: "last_sync",
      label: "TERAKHIR SYNC",
      width: "200px",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <FiClock className="w-4 h-4 flex-shrink-0" />
          <span>{formatDate(item.last_sync)}</span>
        </div>
      ),
    },
    {
      key: "synced_by",
      label: "SYNCED BY",
      width: "150px",
      render: (item) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {item.synced_by || "System"}
        </span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      width: "120px",
      align: "center",
      render: () => (
        <Chip
          size="sm"
          variant="flat"
          color="success"
          startContent={<FiCheckCircle className="w-3 h-3" />}
        >
          Synced
        </Chip>
      ),
    },
  ];

  return (
    <DashboardLayout
      appName="SISTER Integrator"
      appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
      menuConfig={sisterIntegratorMenuConfig}
      pageTitle="Referensi - Agama"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Data Referensi Agama
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sinkronisasi dan kelola data referensi agama dari SISTER API
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

        {/* Statistics Cards - Compact Horizontal Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Records Card */}
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
                    <p className="text-xs font-medium text-purple-100">Total Records</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Live</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {agamaList.length}
                  </h3>
                  <p className="text-[10px] text-purple-100/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Data agama tersimpan
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Status Card */}
          <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  {agamaList.length > 0 ? (
                    <FiCheckCircle className="w-7 h-7 text-white" />
                  ) : (
                    <FiAlertCircle className="w-7 h-7 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-emerald-100">Sync Status</p>
                    <div className={`px-2 py-0.5 rounded-full backdrop-blur-sm ${agamaList.length > 0 ? 'bg-white/20' : 'bg-white/30'}`}>
                      <span className="text-[10px] font-semibold text-white">
                        {agamaList.length > 0 ? '✓ Active' : '⚠ Pending'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight leading-none mb-1">
                    {agamaList.length > 0 ? "Synced" : "Not Synced"}
                  </h3>
                  <p className="text-[10px] text-emerald-100/80">
                    Kondisi sinkronisasi terkini
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
                    {agamaList.length > 0 && agamaList[0].last_sync
                      ? formatDate(agamaList[0].last_sync)
                      : "Belum pernah"}
                  </h3>
                  <p className="text-[10px] text-blue-100/80">
                    Terakhir sinkronisasi data
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Synced By Card */}
          <Card className="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiUser className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-orange-100">Synced By</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">User</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white leading-tight mb-1 truncate">
                    {agamaList.length > 0 && agamaList[0].synced_by
                      ? agamaList[0].synced_by
                      : "System"}
                  </h3>
                  <p className="text-[10px] text-orange-100/80">
                    Terakhir oleh pengguna ini
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Data Table */}
        {agamaList.length === 0 && !isLoading ? (
          <Card className="border-none shadow-md">
            <CardBody className="p-12">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                  <FiDatabase className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Belum Ada Data
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Klik tombol "Sinkronisasi Data" untuk mengambil data referensi agama dari SISTER API Kemdikbud
                </p>
                <Button
                  color="primary"
                  size="lg"
                  startContent={<MdSync className="w-5 h-5" />}
                  onClick={handleSyncClick}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl"
                >
                  Sinkronisasi Sekarang
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <DataTable
            data={agamaList}
            columns={columns}
            searchable={true}
            searchKeys={["nama_agama", "id_agama"]}
            searchPlaceholder="Cari agama..."
            defaultRowsPerPage={5}
            rowsPerPageOptions={[3, 5, 10, 25, 50, 100]}
            loading={isLoading}
            className="shadow-lg"
          />
        )}
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
                      Data Referensi Agama
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
                          Proses ini akan mengambil data agama terbaru dari SISTER API dan menyimpannya ke database.
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                          <li>Data yang sudah ada akan diperbarui</li>
                          <li>Data baru akan ditambahkan</li>
                          <li>Proses memerlukan waktu beberapa detik</li>
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

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Source</span>
                    <Chip size="sm" variant="flat" color="primary">
                      SISTER API
                    </Chip>
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
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-3">
                      <MdCloudDone className="w-6 h-6 text-green-600 dark:text-green-400" />
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
