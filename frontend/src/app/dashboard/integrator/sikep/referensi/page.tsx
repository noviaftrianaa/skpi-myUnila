"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";

const APP_KEY = "myunila-integrator";
import {
  Card,
  CardBody,
  Chip,
  Spinner,
  Button,
  Input,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
} from "@heroui/react";
import { MdSchool, MdSelectAll, MdSync } from "react-icons/md";
import {
  FiBookOpen,
  FiDatabase,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiActivity,
  FiRefreshCw,
  FiXCircle,
  FiAlertCircle,
  FiEye,
} from "react-icons/fi";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";
import {
  sikepReferensiService,
  SikepReferensiMetadata,
  SikepBatchSyncResponse,
} from "@/lib/services/sikep/referensiService";
import { toast } from "react-hot-toast";


export default function SikepReferensiPage() {
  useRequireAuth();
  const { user } = useAuth();

  const [metadata, setMetadata] = useState<SikepReferensiMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncResult, setSyncResult] = useState<SikepBatchSyncResponse | null>(null);

  // Modal for viewing raw data
  const [showDataModal, setShowDataModal] = useState(false);
  const [selectedDataKey, setSelectedDataKey] = useState<string>("");
  const [selectedDataName, setSelectedDataName] = useState<string>("");
  const [dataModalContent, setDataModalContent] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Modal pagination and search state
  const [modalPage, setModalPage] = useState(1);
  const [modalTotalPages, setModalTotalPages] = useState(1);
  const [modalTotalRecords, setModalTotalRecords] = useState(0);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [modalSearchInput, setModalSearchInput] = useState("");
  const rowsPerPage = 10;

  const fetchMetadata = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await sikepReferensiService.getMetadata();
      setMetadata(data);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      toast.error("Gagal memuat metadata referensi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  const handleCheckboxChange = (key: string) => {
    setSelectedEndpoints((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const filteredData = metadata.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.key.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  const handleSelectAll = () => {
    if (selectedEndpoints.length === filteredData.length) {
      setSelectedEndpoints([]);
    } else {
      setSelectedEndpoints(filteredData.map((item) => item.key));
    }
  };

  const handleSyncClick = () => {
    if (selectedEndpoints.length === 0) {
      toast.error("Pilih minimal satu endpoint untuk disinkronkan");
      return;
    }
    setShowSyncModal(true);
  };

  const handleConfirmSync = async () => {
    setShowSyncModal(false);
    setShowProgressModal(true);
    setIsSyncing(true);
    setSyncStatus("syncing");
    setSyncProgress(0);
    setSyncResult(null);

    try {
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 10;
        });
      }, 500);

      const response = await sikepReferensiService.batchSync(selectedEndpoints);

      clearInterval(progressInterval);

      setSyncProgress(100);
      setSyncStatus("success");
      setSyncResult(response);

      if (response.total_failed === 0) {
        toast.success(`Berhasil sinkronisasi ${response.total_success} endpoint!`);
      } else {
        toast.success(
          `Sinkronisasi selesai: ${response.total_success} berhasil, ${response.total_failed} gagal`
        );
      }

      setTimeout(async () => {
        await fetchMetadata();
        setSelectedEndpoints([]);
      }, 2000);
    } catch (error: any) {
      console.error("Error syncing:", error);
      setSyncStatus("error");
      toast.error(error.response?.data?.message || "Gagal melakukan sinkronisasi");

      setTimeout(() => {
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
      }, 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch paginated data for modal
  const fetchModalData = useCallback(async (key: string, page: number, search: string) => {
    setIsLoadingData(true);
    try {
      const response = await sikepReferensiService.getEndpointDataPaginated(key, page, rowsPerPage, search);
      setDataModalContent(response.data);
      setModalTotalPages(response.meta.total_pages);
      setModalTotalRecords(response.meta.total);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data");
      setDataModalContent([]);
      setModalTotalPages(1);
      setModalTotalRecords(0);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const handleViewData = async (key: string, name: string) => {
    setSelectedDataKey(key);
    setSelectedDataName(name);
    setModalPage(1);
    setModalSearchQuery("");
    setModalSearchInput("");
    setShowDataModal(true);
    await fetchModalData(key, 1, "");
  };

  // Handle modal page change
  const handleModalPageChange = (page: number) => {
    setModalPage(page);
    fetchModalData(selectedDataKey, page, modalSearchQuery);
  };

  // Handle modal search
  const handleModalSearch = () => {
    setModalSearchQuery(modalSearchInput);
    setModalPage(1);
    fetchModalData(selectedDataKey, 1, modalSearchInput);
  };

  // Handle search input key press (Enter to search)
  const handleModalSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleModalSearch();
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

  const totalRecords = metadata.reduce((sum, item) => sum + item.total_records, 0);
  const syncedCount = metadata.filter((item) => item.total_records > 0).length;

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Referensi SIKEP"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Referensi Data SIKEP
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola dan sinkronisasi data referensi dari SIKEP UNILA
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="bordered"
              startContent={<MdSelectAll className="w-5 h-5" />}
              onClick={handleSelectAll}
              className="border-blue-600 text-blue-600 font-semibold"
            >
              {selectedEndpoints.length === filteredData.length ? "Deselect All" : "Select All"}
            </Button>
            <Button
              color="primary"
              size="lg"
              startContent={<MdSync className="w-5 h-5" />}
              isDisabled={selectedEndpoints.length === 0}
              isLoading={isSyncing}
              onClick={handleSyncClick}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
            >
              Sync Selected ({selectedEndpoints.length})
            </Button>
          </div>
        </div>

        {/* Summary Cards - 4 Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Endpoints */}
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiBookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-100 mb-1">Total Endpoints</p>
                  {isLoading ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">{metadata.length}</h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Synced */}
          <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiCheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-emerald-100 mb-1">Synced</p>
                  {isLoading ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
                      {syncedCount}/{metadata.length}
                    </h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Records */}
          <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiDatabase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-purple-100 mb-1">Total Records</p>
                  {isLoading ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    <h3 className="text-3xl font-bold text-white tracking-tight leading-none">{totalRecords.toLocaleString()}</h3>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Selected */}
          <Card className="bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative rounded-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10 group-hover:scale-125 transition-transform duration-700" />
            <CardBody className="p-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiActivity className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-100 mb-1">Selected</p>
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none">{selectedEndpoints.length}</h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Search Section */}
        <Card
          className={`shadow-md hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-900 ${
            searchQuery ? "mb-2" : ""
          }`}
        >
          <CardBody className="p-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <Input
                  isClearable
                  placeholder="Ketik untuk mencari referensi..."
                  startContent={
                    <FiSearch className="text-gray-400 dark:text-gray-500 w-5 h-5 mr-2" />
                  }
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  onClear={() => setSearchQuery("")}
                  classNames={{
                    base: "w-full",
                    mainWrapper: "h-full",
                    input: "text-base",
                    inputWrapper:
                      "h-11 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 focus-within:!border-blue-500 dark:focus-within:!border-blue-500 transition-colors rounded-lg",
                  }}
                  size="lg"
                />
              </div>

              {searchQuery && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {filteredData.length} / {metadata.length}
                  </span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Referensi Cards */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredData.map((item) => (
              <Card
                key={item.key}
                className={`group relative overflow-hidden transition-all duration-300 cursor-pointer ${
                  selectedEndpoints.includes(item.key)
                    ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30"
                    : "hover:shadow-xl hover:scale-[1.02] shadow-md"
                }`}
                isPressable
                onPress={() => handleViewData(item.key, item.name)}
              >
                {selectedEndpoints.includes(item.key) && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-blue-50/40 to-transparent dark:from-blue-900/20 dark:via-blue-900/10 dark:to-transparent pointer-events-none" />
                )}

                <CardBody className="p-5 relative z-10">
                  {/* Header with checkbox and title */}
                  <div className="flex items-start gap-4 mb-4">
                    <Checkbox
                      isSelected={selectedEndpoints.includes(item.key)}
                      onValueChange={() => handleCheckboxChange(item.key)}
                      color="primary"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 mr-1"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-3" />

                  {/* Info section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiDatabase className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Records</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {item.total_records.toLocaleString()}
                        </span>
                        {item.total_records > 0 && (
                          <Chip
                            size="sm"
                            color="success"
                            variant="flat"
                            className="shrink-0"
                            startContent={<FiCheckCircle className="w-3 h-3" />}
                          >
                            Synced
                          </Chip>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Last Sync</span>
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                        {formatDate(item.last_sync)}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-gray-800 border-none">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <FiBookOpen className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Tentang Data Referensi SIKEP
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Data referensi adalah data master yang digunakan sebagai acuan dalam sistem SIKEP
                  UNILA. Data ini mencakup unit organisasi, jabatan fungsional, jabatan struktural,
                  golongan PNS/PPPK, dan tingkat pendidikan yang diperlukan untuk pengelolaan data
                  pegawai.
                </p>
              </div>
            </div>
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
          base: "bg-white dark:bg-gray-800 rounded-2xl",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <MdSync className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Konfirmasi Sinkronisasi
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                      Data Referensi SIKEP
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="w-full">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          Proses ini akan mengambil data referensi terbaru dari SIKEP dan
                          menyimpannya ke database.
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                          <li>Data yang sudah ada akan diperbarui</li>
                          <li>Data baru akan ditambahkan</li>
                          <li>Sinkronisasi dilakukan secara paralel</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                      <FiDatabase className="w-4 h-4 text-emerald-600" />
                      Endpoint yang akan disinkronkan ({selectedEndpoints.length}):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEndpoints.map((key) => {
                        const item = metadata.find((m) => m.key === key);
                        return (
                          <Chip key={key} size="sm" variant="flat" color="primary">
                            {item?.name || key}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
                <Button variant="light" onPress={onClose} className="font-medium rounded-xl">
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    onClose();
                    handleConfirmSync();
                  }}
                  startContent={<MdSync className="w-4 h-4" />}
                  className="font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl"
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
        isDismissable={syncStatus !== "syncing"}
        hideCloseButton={syncStatus === "syncing"}
        onOpenChange={setShowProgressModal}
        size="lg"
        backdrop="blur"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-gray-800 rounded-2xl",
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
                    : "bg-gradient-to-br from-blue-500 to-indigo-600"
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
                  {syncStatus === "success" &&
                    syncResult &&
                    `${syncResult.total_success} endpoint berhasil disinkronkan`}
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
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
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
                  className="mb-2"
                  size="md"
                  classNames={{
                    track: "rounded-full",
                    indicator: "rounded-full",
                  }}
                />
              </div>

              {syncStatus === "success" && syncResult && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-3">
                      <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          Berhasil: {syncResult.total_success}, Gagal: {syncResult.total_failed}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Durasi: {syncResult.duration}
                        </p>
                      </div>
                    </div>

                    {/* Result details */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {syncResult.results.map((result) => (
                        <div
                          key={result.endpoint}
                          className={`p-2 rounded-lg flex items-center justify-between ${
                            result.success
                              ? "bg-green-100 dark:bg-green-800/30"
                              : "bg-red-100 dark:bg-red-800/30"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {result.success ? (
                              <FiCheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <FiXCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {result.endpoint}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {result.success
                              ? `${result.total_records} records`
                              : result.error || "Error"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {syncStatus === "error" && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <FiXCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Terjadi kesalahan saat melakukan sinkronisasi. Silakan coba lagi.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          {syncStatus !== "syncing" && (
            <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
              <Button
                color="primary"
                onPress={() => setShowProgressModal(false)}
                className="font-medium rounded-xl"
              >
                Tutup
              </Button>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>

      {/* Data View Modal */}
      <Modal
        isOpen={showDataModal}
        onOpenChange={setShowDataModal}
        size="5xl"
        backdrop="blur"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-gray-800 rounded-2xl",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <FiEye className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      Data {selectedDataName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                      Total {modalTotalRecords.toLocaleString()} records
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-4">
                {/* Search Input */}
                <div className="flex items-center gap-2 mb-4">
                  <Input
                    placeholder="Cari data..."
                    value={modalSearchInput}
                    onValueChange={setModalSearchInput}
                    onKeyDown={handleModalSearchKeyPress}
                    startContent={<FiSearch className="text-gray-400 w-4 h-4" />}
                    classNames={{
                      base: "flex-1",
                      inputWrapper: "h-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg",
                    }}
                    size="sm"
                  />
                  <Button
                    color="primary"
                    size="sm"
                    onPress={handleModalSearch}
                    className="h-10 px-4"
                  >
                    Cari
                  </Button>
                </div>

                {isLoadingData ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                  </div>
                ) : dataModalContent.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    {modalSearchQuery ? "Tidak ada data yang cocok dengan pencarian" : "Tidak ada data"}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <Table
                        aria-label={`Data ${selectedDataName}`}
                        classNames={{
                          base: "max-h-[350px] overflow-auto",
                          table: "min-w-full",
                          th: "bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase",
                          td: "text-sm text-gray-700 dark:text-gray-300",
                        }}
                        isStriped
                      >
                        <TableHeader>
                          {Object.keys(dataModalContent[0] || {}).map((key) => (
                            <TableColumn key={key}>
                              {key.replace(/_/g, " ")}
                            </TableColumn>
                          ))}
                        </TableHeader>
                        <TableBody>
                          {dataModalContent.map((item, index) => (
                            <TableRow key={index}>
                              {Object.values(item).map((value, cellIndex) => (
                                <TableCell key={cellIndex}>
                                  {value === null || value === undefined
                                    ? "-"
                                    : typeof value === "object"
                                    ? JSON.stringify(value)
                                    : String(value)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {modalTotalPages > 1 && (
                      <div className="flex items-center justify-between px-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Menampilkan {((modalPage - 1) * rowsPerPage) + 1} - {Math.min(modalPage * rowsPerPage, modalTotalRecords)} dari {modalTotalRecords.toLocaleString()} data
                        </span>
                        <Pagination
                          total={modalTotalPages}
                          page={modalPage}
                          onChange={handleModalPageChange}
                          showControls
                          size="sm"
                          classNames={{
                            cursor: "bg-blue-600 text-white",
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="light"
                  onPress={onClose}
                  className="font-medium rounded-xl"
                >
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DashboardLayoutWithDynamicMenu>
  );
}
