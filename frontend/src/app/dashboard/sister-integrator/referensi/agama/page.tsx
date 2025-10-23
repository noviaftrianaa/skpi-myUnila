"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import {
  Card,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Avatar,
} from "@heroui/react";
import {
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiDatabase,
  FiDownload,
  FiArrowLeft,
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

  return (
    <DashboardLayout
      appName="SISTER Integrator"
      appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
      menuConfig={sisterIntegratorMenuConfig}
      pageTitle="Referensi - Agama"
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
              Data Referensi Agama
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sinkronisasi dan kelola data referensi agama dari SISTER API
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              color="primary"
              startContent={<FiRefreshCw className="w-4 h-4" />}
              onClick={handleSyncClick}
              isLoading={isSyncing}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl"
            >
              Sinkronisasi Data
            </Button>
            <Button
              variant="bordered"
              startContent={<FiDatabase className="w-4 h-4" />}
              onClick={fetchAgamaData}
              isLoading={isLoading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-none shadow-md">
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <FiDatabase className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">
                    Total Records
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {agamaList.length}
                  </h3>
                  <p className="text-xs text-gray-400">Data agama tersimpan</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-none shadow-md">
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                  <FiCheckCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">
                    Status
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {agamaList.length > 0 ? "Synced" : "Not Synced"}
                  </h3>
                  <p className="text-xs text-gray-400">Kondisi sinkronisasi</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-none shadow-md">
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                  <FiClock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">
                    Last Sync
                  </p>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                    {agamaList.length > 0 && agamaList[0].last_sync
                      ? formatDate(agamaList[0].last_sync)
                      : "Belum pernah"}
                  </h3>
                  <p className="text-xs text-gray-400">Terakhir sinkronisasi</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="border-none shadow-md">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiDatabase className="w-5 h-5 text-purple-600" />
                Daftar Data Agama
              </h3>
              <Chip size="sm" variant="flat" color="primary">
                {agamaList.length} records
              </Chip>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" color="primary" />
              </div>
            ) : agamaList.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <FiDatabase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Belum Ada Data
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Klik tombol "Sinkronisasi Data" untuk mengambil data dari SISTER API
                </p>
                <Button
                  color="primary"
                  startContent={<FiRefreshCw className="w-4 h-4" />}
                  onClick={handleSyncClick}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  Sinkronisasi Sekarang
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table
                  aria-label="Tabel Data Agama"
                  classNames={{
                    wrapper: "shadow-none",
                    th: "bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 font-semibold",
                  }}
                >
                  <TableHeader>
                    <TableColumn>ID</TableColumn>
                    <TableColumn>NAMA AGAMA</TableColumn>
                    <TableColumn>LAST SYNC</TableColumn>
                    <TableColumn>SYNCED BY</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {agamaList.map((agama) => (
                      <TableRow key={agama.id_agama}>
                        <TableCell>
                          <span className="font-mono text-sm font-semibold text-purple-600">
                            {agama.id_agama}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {agama.nama_agama}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <FiClock className="w-4 h-4" />
                            {formatDate(agama.last_sync)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar
                              size="sm"
                              name={agama.synced_by || "System"}
                              className="w-6 h-6 text-xs"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {agama.synced_by || "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            variant="flat"
                            color="success"
                            startContent={<FiCheckCircle className="w-3 h-3" />}
                          >
                            Synced
                          </Chip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>
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
