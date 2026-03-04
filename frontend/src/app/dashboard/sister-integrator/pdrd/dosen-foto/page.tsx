"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
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
  FiCamera,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { RiGovernmentFill } from "react-icons/ri";
import { sisterIntegratorMenuConfig } from "../../config/menuConfig";
import {
  sisterDosenService,
  type SisterDosenPhotoSyncResult,
} from "@/lib/services/sister/pdrd/dosenService";
import { toast } from "react-hot-toast";
import ScheduleList from "@/shared/components/sister-integrator/ScheduleList";

const APP_KEY = "sister-integrator";

export default function DosenFotoPage() {
  useRequireAuth();
  const { user } = useAuth();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncResult, setSyncResult] = useState<SisterDosenPhotoSyncResult | null>(null);

  const handleSyncClick = () => setShowConfirmModal(true);

  const handleConfirmSync = async () => {
    setShowConfirmModal(false);
    setShowProgressModal(true);
    setIsSyncing(true);
    setSyncStatus("syncing");
    setSyncProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 90) { clearInterval(progressInterval); return 90; }
          return prev + 5;
        });
      }, 1000);

      const response = await sisterDosenService.syncPhotosToMinIO(user?.name || "system");

      clearInterval(progressInterval);
      setSyncProgress(100);
      setSyncResult(response);
      setSyncStatus("success");
      toast.success(`Berhasil sync ${response.total_success} foto dosen (${response.total_skipped} skipped)`);

      setTimeout(() => {
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
        setSyncResult(null);
      }, 3000);
    } catch (error) {
      console.error("Error syncing photos:", error);
      setSyncStatus("error");
      toast.error("Gagal melakukan sinkronisasi foto");
      setTimeout(() => {
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
      }, 2000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SISTER Integrator"
      appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
      fallbackMenus={sisterIntegratorMenuConfig}
      appKey={APP_KEY}
      pageTitle="Foto Dosen"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Sinkronisasi Foto Dosen
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Mengunduh foto dosen dari SISTER API dan menyimpannya ke MinIO storage
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            startContent={<FiCamera className="w-5 h-5" />}
            onClick={handleSyncClick}
            isLoading={isSyncing}
            className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
          >
            Sinkronisasi Foto
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200 dark:border-teal-800">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <FiCamera className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-teal-800 dark:text-teal-200 mb-1">Cara Kerja</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Foto diambil dari SISTER API untuk setiap dosen aktif</li>
                  <li>Foto yang sudah ada di MinIO akan di-skip (tidak diunduh ulang)</li>
                  <li>Hanya foto baru yang akan diunduh dan diunggah</li>
                  <li>Proses memerlukan waktu 5-15 menit tergantung jumlah foto baru</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Scheduler */}
        <ScheduleList syncType="dosen_foto" />
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        size="md"
        backdrop="blur"
        classNames={{ backdrop: "bg-black/50 backdrop-blur-sm", base: "bg-white dark:bg-gray-800" }}
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
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Konfirmasi Sinkronisasi Foto</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">Foto Dosen dari SISTER ke MinIO</p>
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
                          <li>Proses memerlukan waktu 5-15 menit</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">User</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || "System"}</span>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
                <Button variant="light" onPress={onClose} className="text-gray-600 hover:bg-gray-100">Batal</Button>
                <Button color="primary" onPress={handleConfirmSync} startContent={<FiCamera className="w-4 h-4" />} className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                  Mulai Sinkronisasi Foto
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
        classNames={{ backdrop: "bg-black/50 backdrop-blur-sm", base: "bg-white dark:bg-gray-800" }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${
                syncStatus === "success" ? "bg-gradient-to-br from-green-500 to-green-600"
                  : syncStatus === "error" ? "bg-gradient-to-br from-red-500 to-red-600"
                  : "bg-gradient-to-br from-teal-500 to-cyan-600"
              }`}>
                {syncStatus === "success" ? <FiCheckCircle className="w-6 h-6" />
                  : syncStatus === "error" ? <FiAlertCircle className="w-6 h-6" />
                  : <FiCamera className="w-6 h-6 animate-pulse" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {syncStatus === "success" ? "Sinkronisasi Foto Berhasil!"
                    : syncStatus === "error" ? "Sinkronisasi Foto Gagal"
                    : "Sedang Sinkronisasi Foto..."}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                  {syncStatus === "syncing" && "Mengunduh foto dari SISTER API ke MinIO"}
                  {syncStatus === "success" && syncResult && `${syncResult.total_success} foto baru, ${syncResult.total_skipped} sudah ada`}
                  {syncStatus === "error" && "Terjadi kesalahan saat sinkronisasi foto"}
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{syncProgress}%</span>
                </div>
                <Progress
                  value={syncProgress}
                  color={syncStatus === "success" ? "success" : syncStatus === "error" ? "danger" : "primary"}
                  className="h-2"
                  classNames={{ indicator: syncStatus === "syncing" ? "animate-pulse" : "" }}
                />
              </div>
              {syncStatus === "syncing" && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20">
                  <Spinner size="sm" color="primary" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">Mengunduh dan mengunggah foto dosen ke MinIO storage...</p>
                </div>
              )}
              {syncStatus === "success" && syncResult && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-3">
                    <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                      Sinkronisasi foto selesai ({syncResult.duration})
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[
                      ["Total Diproses", syncResult.total_processed, "text-gray-700 dark:text-gray-300"],
                      ["Foto Baru", syncResult.total_success, "text-green-700 dark:text-green-300"],
                      ["Sudah Ada (Skip)", syncResult.total_skipped, "text-blue-700 dark:text-blue-300"],
                      ["Gagal", syncResult.total_failed, "text-red-700 dark:text-red-300"],
                    ].map(([label, value, cls]) => (
                      <div key={String(label)} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{label}</span>
                        <span className={`font-bold ${cls}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {syncStatus === "error" && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">Gagal melakukan sinkronisasi foto. Silakan coba lagi.</p>
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </DashboardLayoutWithDynamicMenu>
  );
}
