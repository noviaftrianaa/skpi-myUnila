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
  Checkbox,
  Input,
} from "@heroui/react";
import {
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiSearch,
  FiClock,
  FiDatabase,
  FiArrowLeft,
  FiPackage,
  FiActivity,
} from "react-icons/fi";
import { MdSync, MdCloudDone, MdSelectAll } from "react-icons/md";
import { RiGovernmentFill } from "react-icons/ri";
import { sisterIntegratorMenuConfig } from "../config/menuConfig";
import {
  referensiService,
  type ReferensiMetadata,
  type BatchSyncResponse,
} from "@/lib/services/referensiService";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function ReferensiDashboardPage() {
  useRequireAuth();
  const { user } = useAuth();

  // State management
  const [metadata, setMetadata] = useState<ReferensiMetadata[]>([]);
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ReferensiMetadata | null>(null);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncResult, setSyncResult] = useState<BatchSyncResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch metadata on mount
  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      setIsLoading(true);
      const data = await referensiService.getMetadata();
      setMetadata(data);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      toast.error("Gagal memuat metadata referensi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (key: string) => {
    setSelectedEndpoints((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Filter metadata based on search query
  const filteredMetadata = metadata.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.key.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  const handleSelectAll = () => {
    if (selectedEndpoints.length === filteredMetadata.length) {
      setSelectedEndpoints([]);
    } else {
      setSelectedEndpoints(filteredMetadata.map((m) => m.key));
    }
  };

  const handleBatchSyncClick = () => {
    if (selectedEndpoints.length === 0) {
      toast.error("Pilih minimal 1 endpoint untuk sync");
      return;
    }
    setShowSyncModal(true);
  };

  const handleConfirmBatchSync = async () => {
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

      // Call batch sync API
      const response = await referensiService.batchSync(selectedEndpoints);

      clearInterval(progressInterval);
      setSyncProgress(100);
      setSyncResult(response);
      setSyncStatus("success");
      toast.success(
        `Berhasil sync ${response.total_success}/${response.total_requested} endpoints`
      );

      // Refresh metadata after 2 seconds
      setTimeout(async () => {
        await fetchMetadata();
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
        setSelectedEndpoints([]);
      }, 3000);
    } catch (error) {
      console.error("Error batch syncing:", error);
      setSyncStatus("error");
      toast.error("Gagal melakukan batch sync");
      setTimeout(() => {
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
      }, 2000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleViewDetail = async (item: ReferensiMetadata) => {
    try {
      setSelectedDetail(item);
      setShowDetailModal(true);
      const data = await referensiService.getEndpointData(item.key);

      // Pre-process data to format dates properly
      const processedData = data.map((row: any) => {
        const processed: any = {};
        for (const key in row) {
          if (key === "last_sync" || key === "expired_date") {
            processed[key] = formatDate(row[key]);
          } else {
            processed[key] = row[key];
          }
        }
        return processed;
      });

      setDetailData(processedData);
    } catch (error) {
      console.error("Error fetching detail data:", error);
      toast.error(`Gagal memuat data ${item.name}`);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";

    try {
      // Database already stores time in WIB, just parse and format without timezone conversion
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return "-";

      // Extract time components directly (database time is already WIB)
      const year = date.getUTCFullYear();
      const month = date.toLocaleString("id-ID", { month: "short", timeZone: "UTC" });
      const day = date.getUTCDate();
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");

      return `${day} ${month} ${year}, ${hours}.${minutes}`;
    } catch (error) {
      return "-";
    }
  };

  const totalRecords = metadata.reduce((sum, m) => sum + m.total_records, 0);
  const syncedCount = metadata.filter((m) => m.total_records > 0).length;

  return (
    <DashboardLayout
      appName="SISTER Integrator"
      appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
      menuConfig={sisterIntegratorMenuConfig}
      pageTitle="Referensi Dashboard"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Referensi Data Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola dan sinkronisasi semua data referensi dari SISTER API
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="bordered"
              startContent={<MdSelectAll className="w-5 h-5" />}
              onClick={handleSelectAll}
              className="border-purple-600 text-purple-600 font-semibold"
            >
              {selectedEndpoints.length === filteredMetadata.length ? "Deselect All" : "Select All"}
            </Button>
            <Button
              color="primary"
              size="lg"
              startContent={<MdSync className="w-5 h-5" />}
              onClick={handleBatchSyncClick}
              isLoading={isSyncing}
              isDisabled={selectedEndpoints.length === 0}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
            >
              Sync Selected ({selectedEndpoints.length})
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 border-none shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FiPackage className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-purple-100">Total Endpoints</p>
                  <h3 className="text-3xl font-bold text-white">{metadata.length}</h3>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-none shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-100">Synced</p>
                  <h3 className="text-3xl font-bold text-white">
                    {syncedCount}/{metadata.length}
                  </h3>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 border-none shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FiDatabase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-100">Total Records</p>
                  <h3 className="text-3xl font-bold text-white">{totalRecords.toLocaleString()}</h3>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-amber-600 border-none shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FiActivity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-orange-100">Selected</p>
                  <h3 className="text-3xl font-bold text-white">{selectedEndpoints.length}</h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Search & Filter Section */}
        <Card className={`shadow-md hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-900 ${searchQuery ? 'mb-2' : ''}`}>
          <CardBody className="p-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Input */}
              <div className="flex-1">
                <Input
                  isClearable
                  placeholder="Ketik untuk mencari endpoint..."
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
                    inputWrapper: "h-11 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 focus-within:!border-purple-500 dark:focus-within:!border-purple-500 transition-colors rounded-lg",
                  }}
                  size="lg"
                />
              </div>

              {/* Search Stats Badge */}
              {searchQuery && (
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    {filteredMetadata.length} / {metadata.length}
                  </span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Endpoint Cards Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" color="primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredMetadata.length === 0 ? (
              <div className="col-span-full">
                <Card className="border border-dashed border-gray-300 dark:border-gray-700">
                  <CardBody className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <FiSearch className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Tidak ada endpoint ditemukan
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Pencarian "<span className="font-medium text-purple-600 dark:text-purple-400">{searchQuery}</span>" tidak cocok dengan endpoint manapun
                    </p>
                    <Button
                      size="sm"
                      variant="flat"
                      color="secondary"
                      startContent={<FiRefreshCw className="w-4 h-4" />}
                      onClick={() => setSearchQuery("")}
                    >
                      Reset Pencarian
                    </Button>
                  </CardBody>
                </Card>
              </div>
            ) : (
              filteredMetadata.map((item) => (
              <Card
                key={item.key}
                className={`group relative overflow-hidden transition-all duration-300 cursor-pointer ${
                  selectedEndpoints.includes(item.key)
                    ? "ring-2 ring-purple-500 ring-offset-2 shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30"
                    : "hover:shadow-xl hover:scale-[1.02] shadow-md"
                }`}
                isPressable
                onPress={() => handleViewDetail(item)}
              >
                {/* Gradient overlay for selected state */}
                {selectedEndpoints.includes(item.key) && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-purple-50/40 to-transparent dark:from-purple-900/20 dark:via-purple-900/10 dark:to-transparent pointer-events-none" />
                )}

                <CardBody className="p-5 relative z-10">
                  {/* Header with checkbox and title */}
                  <div className="flex items-start gap-3.5 mb-4">
                    <Checkbox
                      isSelected={selectedEndpoints.includes(item.key)}
                      onValueChange={() => handleCheckboxChange(item.key)}
                      color="secondary"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
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
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
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
              ))
            )}
          </div>
        )}
      </div>

      {/* Batch Sync Confirmation Modal */}
      <Modal
        isOpen={showSyncModal}
        onOpenChange={setShowSyncModal}
        size="md"
        backdrop="opaque"
        classNames={{
          backdrop: "bg-black/80 backdrop-blur-md",
          base: "bg-white dark:bg-gray-900",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                    <MdSync className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Batch Sync Confirmation</h3>
                    <p className="text-sm text-gray-500 font-normal">
                      {selectedEndpoints.length} endpoints selected
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Endpoints yang akan di-sync:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                      {selectedEndpoints.map((key) => {
                        const item = metadata.find((m) => m.key === key);
                        return item ? <li key={key}>{item.name}</li> : null;
                      })}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Synced by: <span className="font-semibold">{user?.name || "System"}</span>
                    </span>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={handleConfirmBatchSync}
                  startContent={<FiRefreshCw className="w-4 h-4" />}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  Mulai Batch Sync
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
        backdrop="opaque"
        classNames={{
          backdrop: "bg-black/80 backdrop-blur-md",
          base: "bg-white dark:bg-gray-900",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
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
                <h3 className="text-lg font-bold">
                  {syncStatus === "success"
                    ? "Batch Sync Berhasil!"
                    : syncStatus === "error"
                    ? "Batch Sync Gagal"
                    : "Sedang Melakukan Batch Sync..."}
                </h3>
                {syncResult && (
                  <p className="text-xs text-gray-500">
                    {syncResult.total_success}/{syncResult.total_requested} endpoints berhasil
                    ({syncResult.duration})
                  </p>
                )}
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Progress</span>
                  <span className="text-sm font-bold text-purple-600">{syncProgress}%</span>
                </div>
                <Progress
                  value={syncProgress}
                  color={syncStatus === "success" ? "success" : syncStatus === "error" ? "danger" : "primary"}
                  className="h-2"
                />
              </div>

              {syncStatus === "syncing" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                    <Spinner size="sm" color="primary" />
                    <div>
                      <p className="text-sm font-semibold">Sync parallel menggunakan goroutines...</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Memproses {selectedEndpoints.length} endpoint(s)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {syncStatus === "success" && syncResult && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      Total: {syncResult.results.reduce((sum, r) => sum + r.total_records, 0).toLocaleString()} records berhasil di-sync
                    </p>
                  </div>
                  {syncResult.results.map((result) => (
                    <div
                      key={result.endpoint}
                      className={`p-3 rounded-lg border ${
                        result.success
                          ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                          : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <FiCheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <FiAlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="font-semibold text-sm">
                            {metadata.find((m) => m.key === result.endpoint)?.name || result.endpoint}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {result.total_records.toLocaleString()} records
                        </span>
                      </div>
                      <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">{result.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Detail Data Modal */}
      <Modal
        isOpen={showDetailModal}
        onOpenChange={setShowDetailModal}
        size="5xl"
        backdrop="opaque"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/80 backdrop-blur-md",
          base: "bg-white dark:bg-gray-900",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <FiDatabase className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedDetail?.name}</h3>
                    <p className="text-sm text-gray-500 font-normal">
                      {selectedDetail?.description}
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                {detailData.length > 0 ? (
                  <DataTable
                    data={detailData}
                    columns={Object.keys(detailData[0])
                      .filter((key) => !key.startsWith('id_')) // Filter out UUID columns that start with 'id_'
                      .map((key) => ({
                        key,
                        label: key.toUpperCase().replace(/_/g, " "),
                        sortable: true,
                      }))}
                    searchable={true}
                    searchKeys={Object.keys(detailData[0]).filter((key) => !key.startsWith('id_'))}
                    defaultRowsPerPage={5}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                  />
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-600">Belum ada data</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
}
