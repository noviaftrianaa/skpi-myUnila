"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
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
  Chip,
  Image,
} from "@heroui/react";
import {
  FiCamera,
  FiCheckCircle,
  FiAlertCircle,
  FiDatabase,
  FiClock,
  FiImage,
  FiXCircle,
} from "react-icons/fi";
import { RiGovernmentFill } from "react-icons/ri";
import { sisterIntegratorMenuConfig } from "../../config/menuConfig";
import {
  sisterDosenService,
  type SisterDosen,
  type SisterPhotoStats,
  type SisterDosenPhotoSyncResult,
} from "@/lib/services/sister/pdrd/dosenService";
import { toast } from "react-hot-toast";
import ScheduleList from "@/shared/components/sister-integrator/ScheduleList";

const APP_KEY = "sister-integrator";

// Default fallback pakai RELATIVE URL (`/myunila-storage/...`) — browser auto-resolve ke
// same-origin: di prod via Kong route, di staging via nginx route. Internal LAN IP
// `http://192.168.120.47:9000` tidak accessible dari browser internet, jangan dipakai
// sebagai fallback default. NEXT_PUBLIC_MINIO_URL override kalau di-set di build env.
const MINIO_PHOTO_BASE = process.env.NEXT_PUBLIC_MINIO_URL
  ? `${process.env.NEXT_PUBLIC_MINIO_URL}/myunila-storage/photos/sdm`
  : "/myunila-storage/photos/sdm";

export default function DosenFotoPage() {
  useRequireAuth();
  const { user } = useAuth();

  // Stats state
  const [photoStats, setPhotoStats] = useState<SisterPhotoStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Table state
  const [data, setData] = useState<SisterDosen[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncResult, setSyncResult] = useState<SisterDosenPhotoSyncResult | null>(null);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch dosen list when filters change
  useEffect(() => {
    fetchDosenList();
  }, [currentPage, rowsPerPage, searchQuery]);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await sisterDosenService.getPhotoStats();
      setPhotoStats(data);
    } catch (error) {
      console.error("Error fetching photo stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchDosenList = async () => {
    setLoading(true);
    try {
      const response = await sisterDosenService.getList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
      });
      setData(response.data);
      setTotalRecords(response.total);
    } catch (error) {
      console.error("Error loading dosen:", error);
    } finally {
      setLoading(false);
    }
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
          if (prev >= 90) { clearInterval(progressInterval); return 90; }
          return prev + 5;
        });
      }, 1000);

      const response = await sisterDosenService.syncPhotosToMinIO(user?.name || "system");

      clearInterval(progressInterval);
      setSyncProgress(100);
      setSyncResult(response);
      setSyncStatus("success");
      toast.success(`Berhasil sync ${response.total_success} foto dosen`);

      fetchStats();

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

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Belum pernah";
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns: Column<SisterDosen>[] = [
    {
      key: "photo",
      label: "FOTO",
      align: "center",
      width: "80px",
      render: (item) => (
        <div className="flex justify-center">
          <Image
            src={`${MINIO_PHOTO_BASE}/${item.id_sdm}.jpg`}
            alt={item.nama_sdm}
            width={48}
            height={48}
            className="rounded-lg object-cover"
            fallbackSrc="/images/avatar-placeholder.png"
          />
        </div>
      ),
    },
    {
      key: "nama_sdm",
      label: "NAMA",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {item.nama_sdm}
          </div>
          <div className="text-xs text-gray-400 font-mono truncate max-w-[200px]">
            {item.id_sdm}
          </div>
        </div>
      ),
    },
    {
      key: "nidn",
      label: "NIDN / NUPTK",
      render: (item) => (
        <div className="text-sm">
          <div className="font-mono text-gray-700 dark:text-gray-300">
            {item.nidn || "-"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {item.nuptk || "-"}
          </div>
        </div>
      ),
    },
    {
      key: "jenis_kelamin",
      label: "JK",
      align: "center",
      width: "80px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.jenis_kelamin === "L" ? "primary" : "secondary"}
        >
          {item.jenis_kelamin === "L" ? "L" : "P"}
        </Chip>
      ),
    },
    {
      key: "email",
      label: "EMAIL",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
          {item.email || "-"}
        </div>
      ),
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      align: "center",
      width: "150px",
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {item.last_sync
            ? new Date(item.last_sync).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Belum sync"}
        </div>
      ),
    },
  ];

  if (isLoadingStats) {
    return (
      <DashboardLayoutWithDynamicMenu
        appName="SISTER Integrator"
        appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
        fallbackMenus={sisterIntegratorMenuConfig}
        appKey={APP_KEY}
        pageTitle="Foto Dosen"
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
      pageTitle="Foto Dosen"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Foto Dosen
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Data foto dosen dari SISTER API yang tersimpan di MinIO storage
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Dosen */}
          <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiDatabase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-purple-100 mb-1">Total Dosen</p>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {photoStats?.total_dosen.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-purple-100/80">Seluruh dosen terdaftar</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Foto */}
          <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiImage className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-emerald-100">Foto Tersedia</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">MinIO</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {photoStats?.total_photos.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-emerald-100/80">
                    {photoStats && photoStats.total_dosen > 0
                      ? `${((photoStats.total_photos / photoStats.total_dosen) * 100).toFixed(1)}% dari total dosen`
                      : "Foto di MinIO storage"}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Foto Belum Ada */}
          <Card className="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiXCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-orange-100">Belum Ada Foto</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/30 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Missing</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {photoStats?.total_missing.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-orange-100/80">
                    {photoStats && photoStats.total_dosen > 0
                      ? `${((photoStats.total_missing / photoStats.total_dosen) * 100).toFixed(1)}% belum sync`
                      : "Perlu sinkronisasi"}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Last Sync */}
          <Card className="bg-gradient-to-br from-blue-500 via-cyan-600 to-sky-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
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
                    {formatDate(photoStats?.last_sync)}
                  </h3>
                  <p className="text-[10px] text-blue-100/80">Terakhir sinkronisasi foto</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Scheduled Syncs */}
        <ScheduleList syncType="dosen_foto" />

        {/* Data Table with Photos */}
        <DataTable
          data={data}
          columns={columns}
          searchable={true}
          searchKeys={["nama_sdm", "nidn", "nuptk", "email"]}
          searchPlaceholder="Cari nama, NIDN, NUPTK, atau email..."
          defaultRowsPerPage={10}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          loading={loading}
          serverSide={true}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setCurrentPage(1);
          }}
          onSearchChange={(query) => {
            setSearchQuery(query);
            setCurrentPage(1);
          }}
          className="shadow-lg"
        />
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
