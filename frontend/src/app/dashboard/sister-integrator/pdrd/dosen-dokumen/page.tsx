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
  FiFile,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { RiGovernmentFill } from "react-icons/ri";
import { sisterIntegratorMenuConfig } from "../../config/menuConfig";
import {
  sisterDosenService,
  type SisterDosenDokumenSyncResult,
} from "@/lib/services/sister/pdrd/dosenService";
import { toast } from "react-hot-toast";
import ScheduleList from "@/shared/components/sister-integrator/ScheduleList";

const APP_KEY = "sister-integrator";

export default function DosenDokumenPage() {
  useRequireAuth();
  const { user } = useAuth();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncResult, setSyncResult] = useState<SisterDosenDokumenSyncResult | null>(null);

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
          if (prev >= 85) { clearInterval(progressInterval); return 85; }
          return prev + 3;
        });
      }, 2000);

      const response = await sisterDosenService.syncDokumenToMinIO(user?.name || "system");

      clearInterval(progressInterval);
      setSyncProgress(100);
      setSyncResult(response);
      setSyncStatus("success");
      toast.success(`Berhasil sync ${response.total_success} dokumen (${response.total_skipped} skipped)`);

      setTimeout(() => {
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
        setSyncResult(null);
      }, 4000);
    } catch (error) {
      console.error("Error syncing dokumen:", error);
      setSyncStatus("error");
      toast.error("Gagal melakukan sinkronisasi dokumen");
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
      pageTitle="Dokumen Dosen"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Sinkronisasi Dokumen Dosen
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Mengunduh dokumen dosen dari SISTER API dan menyimpannya ke MinIO storage
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            startContent={<FiFile className="w-5 h-5" />}
            onClick={handleSyncClick}
            isLoading={isSyncing}
            className="bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
          >
            Sinkronisasi Dokumen
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <FiFile className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">Cara Kerja</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Dokumen diambil dari SISTER API untuk setiap dosen aktif</li>
                  <li>File disimpan di MinIO storage (bukan di database)</li>
                  <li>Dokumen yang sudah ada akan di-skip (tidak diunduh ulang)</li>
                  <li>Proses dapat memerlukan waktu sangat lama (10-60 menit)</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Scheduler */}
        <ScheduleList syncType="dosen_dokumen" />
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg">
                    <FiFile className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Konfirmasi Sinkronisasi Dokumen</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">Dokumen Dosen dari SISTER ke MinIO</p>
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
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || "System"}</span>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
                <Button variant="light" onPress={onClose} className="text-gray-600 hover:bg-gray-100">Batal</Button>
                <Button color="warning" onPress={handleConfirmSync} startContent={<FiFile className="w-4 h-4" />} className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
                  Mulai Sinkronisasi Dokumen
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
                  : "bg-gradient-to-br from-orange-500 to-amber-600"
              }`}>
                {syncStatus === "success" ? <FiCheckCircle className="w-6 h-6" />
                  : syncStatus === "error" ? <FiAlertCircle className="w-6 h-6" />
                  : <FiFile className="w-6 h-6 animate-pulse" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {syncStatus === "success" ? "Sinkronisasi Dokumen Berhasil!"
                    : syncStatus === "error" ? "Sinkronisasi Dokumen Gagal"
                    : "Sedang Sinkronisasi Dokumen..."}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                  {syncStatus === "syncing" && "Mengunduh dokumen dari SISTER ke MinIO storage"}
                  {syncStatus === "success" && syncResult && `${syncResult.total_success} baru, ${syncResult.total_skipped} sudah ada`}
                  {syncStatus === "error" && "Terjadi kesalahan saat sinkronisasi dokumen"}
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{syncProgress}%</span>
                </div>
                <Progress
                  value={syncProgress}
                  color={syncStatus === "success" ? "success" : syncStatus === "error" ? "danger" : "warning"}
                  className="h-2"
                  classNames={{ indicator: syncStatus === "syncing" ? "animate-pulse" : "" }}
                />
              </div>
              {syncStatus === "syncing" && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                  <Spinner size="sm" color="warning" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">Mengunduh dan mengunggah dokumen dosen ke MinIO storage...</p>
                </div>
              )}
              {syncStatus === "success" && syncResult && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-3">
                    <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                      Sinkronisasi dokumen selesai ({syncResult.duration})
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[
                      ["Total Dosen", syncResult.total_dosen, "text-gray-700 dark:text-gray-300"],
                      ["Total Dokumen", syncResult.total_dokumen, "text-gray-700 dark:text-gray-300"],
                      ["Berhasil Upload", syncResult.total_success, "text-green-700 dark:text-green-300"],
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
                  <p className="text-sm text-red-700 dark:text-red-300">Gagal melakukan sinkronisasi dokumen. Silakan coba lagi.</p>
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </DashboardLayoutWithDynamicMenu>
  );
}
