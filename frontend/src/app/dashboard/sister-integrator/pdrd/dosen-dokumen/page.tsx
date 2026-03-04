"use client";

import { useState, useEffect, useCallback } from "react";
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
  Input,
  Pagination,
  Chip,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  FiFile,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiDownload,
  FiRefreshCw,
} from "react-icons/fi";
import { RiGovernmentFill } from "react-icons/ri";
import { sisterIntegratorMenuConfig } from "../../config/menuConfig";
import {
  sisterDosenService,
  type SisterDosenDokumenSyncResult,
  type SisterDokumenListItem,
  type SisterDokumenListResult,
} from "@/lib/services/sister/pdrd/dosenService";
import { toast } from "react-hot-toast";
import ScheduleList from "@/shared/components/sister-integrator/ScheduleList";

const APP_KEY = "sister-integrator";

const SISTER_BASE_URL =
  process.env.NEXT_PUBLIC_SISTER_API_URL ||
  "http://localhost:9800/sister-service";

export default function DosenDokumenPage() {
  useRequireAuth();
  const { user } = useAuth();

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [syncResult, setSyncResult] =
    useState<SisterDosenDokumenSyncResult | null>(null);

  // Table state
  const [dokumenData, setDokumenData] =
    useState<SisterDokumenListResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchDokumen = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await sisterDosenService.getDokumenList({
        page,
        limit,
        search,
      });
      setDokumenData(result);
    } catch (error) {
      console.error("Error fetching dokumen:", error);
      toast.error("Gagal memuat data dokumen");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchDokumen();
  }, [fetchDokumen]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

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
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 3;
        });
      }, 2000);

      const response = await sisterDosenService.syncDokumenToMinIO(
        user?.name || "system"
      );

      clearInterval(progressInterval);
      setSyncProgress(100);
      setSyncResult(response);
      setSyncStatus("success");
      toast.success(
        `Berhasil sync ${response.total_success} dokumen (${response.total_skipped} skipped)`
      );

      // Refresh table
      fetchDokumen();

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

  const getFileTypeColor = (
    mediaType: string | null
  ): "primary" | "success" | "warning" | "danger" | "default" => {
    if (!mediaType) return "default";
    if (mediaType.includes("pdf")) return "danger";
    if (mediaType.includes("image")) return "success";
    if (mediaType.includes("word") || mediaType.includes("document"))
      return "primary";
    return "warning";
  };

  const getFileTypeLabel = (mediaType: string | null): string => {
    if (!mediaType) return "?";
    if (mediaType.includes("pdf")) return "PDF";
    if (mediaType.includes("jpeg") || mediaType.includes("jpg")) return "JPG";
    if (mediaType.includes("png")) return "PNG";
    if (mediaType.includes("word") || mediaType.includes("document"))
      return "DOC";
    return mediaType.split("/").pop()?.toUpperCase() || "FILE";
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
              Dokumen Dosen
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Data dokumen dosen dari SISTER API yang tersimpan di MinIO storage
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

        {/* Scheduler */}
        <ScheduleList syncType="dosen_dokumen" />

        {/* Dokumen Table */}
        <Card className="shadow-sm">
          <CardBody className="p-0">
            {/* Table Header / Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Data Dokumen (dok.dok_sdm)
                  </h2>
                  {dokumenData && (
                    <Chip size="sm" variant="flat" color="primary">
                      {dokumenData.total.toLocaleString()} records
                    </Chip>
                  )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Input
                    size="sm"
                    placeholder="Cari nama dosen atau dokumen..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    startContent={
                      <FiSearch className="text-gray-400 w-4 h-4" />
                    }
                    className="w-full sm:w-72"
                  />
                  <Button
                    size="sm"
                    isIconOnly
                    variant="flat"
                    onClick={handleSearch}
                  >
                    <FiSearch className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    isIconOnly
                    variant="flat"
                    onClick={fetchDokumen}
                  >
                    <FiRefreshCw className="w-4 h-4" />
                  </Button>
                  <Select
                    size="sm"
                    selectedKeys={[String(limit)]}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="w-20"
                    aria-label="Per page"
                  >
                    <SelectItem key="10">10</SelectItem>
                    <SelectItem key="20">20</SelectItem>
                    <SelectItem key="50">50</SelectItem>
                    <SelectItem key="100">100</SelectItem>
                  </Select>
                </div>
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner size="lg" color="warning" />
              </div>
            ) : !dokumenData || dokumenData.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                <FiFile className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Belum ada dokumen yang disinkronisasi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
                      <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 w-8">
                        #
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Nama Dosen
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Nama Dokumen
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Jenis
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Tipe
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Tanggal Upload
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                        Last Sync
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 text-center">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {dokumenData.data.map(
                      (doc: SisterDokumenListItem, idx: number) => (
                        <tr
                          key={doc.id_dok}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {(page - 1) * limit + idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 dark:text-white text-xs">
                              {doc.nama_sdm}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono truncate max-w-[180px]">
                              {doc.id_sdm}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-gray-800 dark:text-gray-200 text-xs truncate max-w-[200px]">
                              {doc.nm_dok || doc.file_name || "-"}
                            </div>
                            {doc.file_name && doc.nm_dok !== doc.file_name && (
                              <div className="text-[10px] text-gray-400 truncate max-w-[200px]">
                                {doc.file_name}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {doc.nm_jns_dok || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Chip
                              size="sm"
                              variant="flat"
                              color={getFileTypeColor(doc.media_type)}
                              className="text-[10px]"
                            >
                              {getFileTypeLabel(doc.media_type)}
                            </Chip>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {doc.wkt_unggah || "-"}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {doc.last_sync || "-"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {doc.url && (
                              <Button
                                size="sm"
                                isIconOnly
                                variant="light"
                                color="primary"
                                as="a"
                                href={`${SISTER_BASE_URL}/api/v1/dosen/dokumen/download/${doc.id_dok}`}
                                target="_blank"
                                title="Download"
                              >
                                <FiDownload className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {dokumenData && dokumenData.total_pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Menampilkan {(page - 1) * limit + 1}-
                  {Math.min(page * limit, dokumenData.total)} dari{" "}
                  {dokumenData.total.toLocaleString()}
                </span>
                <Pagination
                  size="sm"
                  total={dokumenData.total_pages}
                  page={page}
                  onChange={setPage}
                  showControls
                  classNames={{
                    cursor: "bg-orange-500 text-white",
                  }}
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onOpenChange={setShowConfirmModal}
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
                          Proses ini akan mengambil dokumen dosen dari SISTER API
                          dan menyimpannya ke MinIO storage.
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                          <li>
                            Dokumen yang sudah ada di MinIO akan di-skip
                          </li>
                          <li>File disimpan di MinIO (bukan di database)</li>
                          <li>
                            Proses dapat memerlukan waktu sangat lama (10-60
                            menit)
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      User
                    </span>
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
                  onPress={handleConfirmSync}
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
                      : "bg-gradient-to-br from-orange-500 to-amber-600"
                }`}
              >
                {syncStatus === "success" ? (
                  <FiCheckCircle className="w-6 h-6" />
                ) : syncStatus === "error" ? (
                  <FiAlertCircle className="w-6 h-6" />
                ) : (
                  <FiFile className="w-6 h-6 animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {syncStatus === "success"
                    ? "Sinkronisasi Dokumen Berhasil!"
                    : syncStatus === "error"
                      ? "Sinkronisasi Dokumen Gagal"
                      : "Sedang Sinkronisasi Dokumen..."}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                  {syncStatus === "syncing" &&
                    "Mengunduh dokumen dari SISTER ke MinIO storage"}
                  {syncStatus === "success" &&
                    syncResult &&
                    `${syncResult.total_success} baru, ${syncResult.total_skipped} sudah ada`}
                  {syncStatus === "error" &&
                    "Terjadi kesalahan saat sinkronisasi dokumen"}
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
                  className="h-2"
                  classNames={{
                    indicator: syncStatus === "syncing" ? "animate-pulse" : "",
                  }}
                />
              </div>
              {syncStatus === "syncing" && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                  <Spinner size="sm" color="warning" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Mengunduh dan mengunggah dokumen dosen ke MinIO storage...
                  </p>
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
                    {(
                      [
                        [
                          "Total Dosen",
                          syncResult.total_dosen,
                          "text-gray-700 dark:text-gray-300",
                        ],
                        [
                          "Total Dokumen",
                          syncResult.total_dokumen,
                          "text-gray-700 dark:text-gray-300",
                        ],
                        [
                          "Berhasil Upload",
                          syncResult.total_success,
                          "text-green-700 dark:text-green-300",
                        ],
                        [
                          "Sudah Ada (Skip)",
                          syncResult.total_skipped,
                          "text-blue-700 dark:text-blue-300",
                        ],
                        [
                          "Gagal",
                          syncResult.total_failed,
                          "text-red-700 dark:text-red-300",
                        ],
                      ] as [string, number, string][]
                    ).map(([label, value, cls]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600 dark:text-gray-400">
                          {label}
                        </span>
                        <span className={`font-bold ${cls}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {syncStatus === "error" && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Gagal melakukan sinkronisasi dokumen. Silakan coba lagi.
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
