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
  Select,
  SelectItem,
} from "@heroui/react";
import {
  FiFile,
  FiCheckCircle,
  FiAlertCircle,
  FiDatabase,
  FiClock,
  FiUsers,
  FiEye,
  FiLayers,
} from "react-icons/fi";
import { RiGovernmentFill } from "react-icons/ri";
import { sisterIntegratorMenuConfig } from "../../config/menuConfig";
import {
  sisterDosenService,
  type SisterDokumenListItem,
  type SisterDokumenStats,
  type SisterDosenDokumenSyncResult,
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

  // Stats state
  const [dokumenStats, setDokumenStats] = useState<SisterDokumenStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Table state
  const [data, setData] = useState<SisterDokumenListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterJenisDok, setFilterJenisDok] = useState<number>(0);
  const [jenisDokList, setJenisDokList] = useState<Array<{ id_jns_dok: number; nm_jns_dok: string; total: number }>>([]);

  // Preview state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncResult, setSyncResult] = useState<SisterDosenDokumenSyncResult | null>(null);

  // Fetch stats and jenis dokumen on mount
  useEffect(() => {
    fetchStats();
    fetchJenisDokumen();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, searchQuery, filterJenisDok]);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await sisterDosenService.getDokumenStats();
      setDokumenStats(data);
    } catch (error) {
      console.error("Error fetching dokumen stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchJenisDokumen = async () => {
    try {
      const list = await sisterDosenService.getJenisDokumenList();
      setJenisDokList(list);
    } catch (error) {
      console.error("Error fetching jenis dokumen:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await sisterDosenService.getDokumenList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        id_jns_dok: filterJenisDok || undefined,
      });
      setData(response.data);
      setTotalRecords(response.total);
    } catch (error) {
      console.error("Error loading dokumen:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (doc: SisterDokumenListItem) => {
    setPreviewUrl(`${SISTER_BASE_URL}/api/v1/dosen/dokumen/preview/${doc.id_dok}`);
    setPreviewTitle(doc.nm_dok || doc.file_name || "Dokumen");
    setShowPreviewModal(true);
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
          if (prev >= 85) { clearInterval(progressInterval); return 85; }
          return prev + 3;
        });
      }, 2000);

      const response = await sisterDosenService.syncDokumenToMinIO(user?.name || "system");

      clearInterval(progressInterval);
      setSyncProgress(100);
      setSyncResult(response);
      setSyncStatus("success");
      toast.success(`Berhasil sync ${response.total_success} dokumen`);

      fetchStats();
      fetchData();

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

  const getFileTypeColor = (mediaType: string | null): "primary" | "success" | "warning" | "danger" | "default" => {
    if (!mediaType) return "default";
    if (mediaType.includes("pdf")) return "danger";
    if (mediaType.includes("image")) return "success";
    if (mediaType.includes("word") || mediaType.includes("document")) return "primary";
    return "warning";
  };

  const getFileTypeLabel = (mediaType: string | null): string => {
    if (!mediaType) return "?";
    if (mediaType.includes("pdf")) return "PDF";
    if (mediaType.includes("jpeg") || mediaType.includes("jpg")) return "JPG";
    if (mediaType.includes("png")) return "PNG";
    if (mediaType.includes("word") || mediaType.includes("document")) return "DOC";
    return mediaType.split("/").pop()?.toUpperCase() || "FILE";
  };

  const columns: Column<SisterDokumenListItem>[] = [
    {
      key: "nama_sdm",
      label: "NAMA DOSEN",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white text-sm">
            {item.nama_sdm}
          </div>
          <div className="text-[10px] text-gray-400 font-mono truncate max-w-[180px]">
            {item.id_sdm}
          </div>
        </div>
      ),
    },
    {
      key: "nm_dok",
      label: "NAMA DOKUMEN",
      render: (item) => (
        <div>
          <div className="text-sm text-gray-800 dark:text-gray-200 truncate max-w-[220px]">
            {item.nm_dok || item.file_name || "-"}
          </div>
          {item.file_name && item.nm_dok !== item.file_name && (
            <div className="text-[10px] text-gray-400 truncate max-w-[220px]">
              {item.file_name}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "nm_jns_dok",
      label: "JENIS DOKUMEN",
      render: (item) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {item.nm_jns_dok || "-"}
        </span>
      ),
    },
    {
      key: "media_type",
      label: "TIPE",
      align: "center",
      width: "80px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={getFileTypeColor(item.media_type)}
          className="text-[10px]"
        >
          {getFileTypeLabel(item.media_type)}
        </Chip>
      ),
    },
    {
      key: "wkt_unggah",
      label: "TANGGAL UPLOAD",
      width: "130px",
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {item.wkt_unggah || "-"}
        </div>
      ),
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      align: "center",
      width: "130px",
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {item.last_sync || "-"}
        </div>
      ),
    },
    {
      key: "actions",
      label: "PREVIEW",
      align: "center",
      width: "80px",
      render: (item) => (
        item.url ? (
          <Button
            size="sm"
            isIconOnly
            variant="light"
            color="primary"
            onClick={() => handlePreview(item)}
            title="Preview Dokumen"
          >
            <FiEye className="w-4 h-4" />
          </Button>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )
      ),
    },
  ];

  // Filter slot for jenis dokumen
  const filterSlot = (
    <div className="w-full max-w-xs">
      <Select
        aria-label="Filter Jenis Dokumen"
        placeholder="Semua Jenis Dokumen"
        selectedKeys={filterJenisDok > 0 ? [filterJenisDok.toString()] : ["0"]}
        onChange={(e) => {
          setFilterJenisDok(parseInt(e.target.value) || 0);
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-full",
          trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-orange-400 focus:border-orange-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-8",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        size="sm"
        variant="bordered"
        renderValue={(items) => {
          if (!items || items.length === 0) return "Semua Jenis Dokumen";
          const item = items[0];
          if (item.key === "0") return "Semua Jenis Dokumen";
          return item.textValue || "Semua Jenis Dokumen";
        }}
      >
        <SelectItem key="0" value="0" textValue="Semua Jenis Dokumen">
          Semua Jenis Dokumen
        </SelectItem>
        {jenisDokList.map((jenis) => (
          <SelectItem
            key={jenis.id_jns_dok.toString()}
            value={jenis.id_jns_dok.toString()}
            textValue={`${jenis.nm_jns_dok} (${jenis.total})`}
          >
            {jenis.nm_jns_dok} ({jenis.total})
          </SelectItem>
        ))}
      </Select>
    </div>
  );

  if (isLoadingStats) {
    return (
      <DashboardLayoutWithDynamicMenu
        appName="SISTER Integrator"
        appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
        fallbackMenus={sisterIntegratorMenuConfig}
        appKey={APP_KEY}
        pageTitle="Dokumen Dosen"
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Dokumen */}
          <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiDatabase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-purple-100">Total Dokumen</p>
                    <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-[10px] font-semibold text-white">Live</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {dokumenStats?.total_dokumen.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-purple-100/80">Seluruh dokumen tersimpan</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Dosen dengan Dokumen */}
          <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiUsers className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-emerald-100 mb-1">Dosen dengan Dokumen</p>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {dokumenStats?.total_dosen_with_dokumen.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-emerald-100/80">Dosen yang memiliki dokumen</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Jenis Dokumen */}
          <Card className="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                  <FiLayers className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-orange-100 mb-1">Jenis Dokumen</p>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">
                    {dokumenStats?.by_jenis_dok?.length.toLocaleString() || "0"}
                  </h3>
                  <p className="text-[10px] text-orange-100/80">Kategori jenis dokumen</p>
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
                    {formatDate(dokumenStats?.last_sync)}
                  </h3>
                  <p className="text-[10px] text-blue-100/80">Terakhir sinkronisasi dokumen</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Scheduled Syncs */}
        <ScheduleList syncType="dosen_dokumen" />

        {/* Data Table with Filter */}
        <DataTable
          data={data}
          columns={columns}
          searchable={true}
          searchKeys={["nama_sdm", "nm_dok", "file_name"]}
          searchPlaceholder="Cari nama dosen atau dokumen..."
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
          filterSlot={filterSlot}
          className="shadow-lg"
        />
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        size="5xl"
        backdrop="blur"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-sm",
          base: "bg-white dark:bg-gray-800 max-h-[90vh]",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg">
                    <FiEye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate max-w-lg">
                      {previewTitle}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                      Preview dokumen
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="p-0">
                <iframe
                  src={previewUrl}
                  className="w-full border-0"
                  style={{ height: "70vh" }}
                  title={previewTitle}
                />
              </ModalBody>
              <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
                <Button variant="light" onPress={onClose}>
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

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
                    {([
                      ["Total Dosen", syncResult.total_dosen, "text-gray-700 dark:text-gray-300"],
                      ["Total Dokumen", syncResult.total_dokumen, "text-gray-700 dark:text-gray-300"],
                      ["Berhasil Upload", syncResult.total_success, "text-green-700 dark:text-green-300"],
                      ["Sudah Ada (Skip)", syncResult.total_skipped, "text-blue-700 dark:text-blue-300"],
                      ["Gagal", syncResult.total_failed, "text-red-700 dark:text-red-300"],
                    ] as [string, number, string][]).map(([label, value, cls]) => (
                      <div key={label} className="flex items-center justify-between text-sm">
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
