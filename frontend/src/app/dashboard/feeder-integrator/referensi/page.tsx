"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { feederIntegratorMenuConfig } from "../config/menuConfig";
import {
  Card,
  CardBody,
  Chip,
  Spinner,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  useDisclosure,
  addToast,
  Progress,
} from "@heroui/react";
import { MdSchool, MdSelectAll, MdRefresh, MdSync } from "react-icons/md";
import { FiBookOpen, FiDatabase, FiCheckCircle, FiClock, FiSearch, FiActivity, FiRefreshCw, FiAlertCircle } from "react-icons/fi";
import ScheduleList from "@/shared/components/feeder-integrator/ScheduleList";
import { referensiService, REFERENSI_ENDPOINTS, type ReferensiStats } from "@/lib/services/feeder/referensi/referensiService";
import { useAuth } from "@/contexts/AuthContext";

interface ReferensiItemWithStats {
  key: string;
  name: string;
  description: string;
  records: number;
  lastSync?: string;
}

export default function ReferensiPage() {
  useRequireAuth();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);
  const [referensiItems, setReferensiItems] = useState<ReferensiItemWithStats[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync confirmation & progress modal state
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncResult, setSyncResult] = useState<{ total_records: number; endpoint_keys: string[] } | null>(null);

  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedReferensi, setSelectedReferensi] = useState<{ key: string; name: string } | null>(null);
  const [modalData, setModalData] = useState<Record<string, unknown>[]>([]);
  const [modalColumns, setModalColumns] = useState<{ key: string; label: string }[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const [modalTotal, setModalTotal] = useState(0);
  const [modalSearch, setModalSearch] = useState("");
  const modalLimit = 10;

  // Load stats on mount
  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await referensiService.getAllReferensiStats();

      if (response.success && response.data) {
        const statsMap = new Map<string, ReferensiStats>();
        response.data.referensi_list?.forEach((stat) => {
          statsMap.set(stat.endpoint_key, stat);
        });

        const items: ReferensiItemWithStats[] = REFERENSI_ENDPOINTS.map((ep) => {
          const stat = statsMap.get(ep.key);
          return {
            key: ep.key,
            name: ep.name,
            description: ep.description,
            records: stat?.total_records || 0,
            lastSync: stat?.last_sync,
          };
        });
        setReferensiItems(items);
      } else {
        // Fallback to static data if API fails
        setReferensiItems(
          REFERENSI_ENDPOINTS.map((ep) => ({
            key: ep.key,
            name: ep.name,
            description: ep.description,
            records: 0,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
      // Fallback to static data
      setReferensiItems(
        REFERENSI_ENDPOINTS.map((ep) => ({
          key: ep.key,
          name: ep.name,
          description: ep.description,
          records: 0,
        }))
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleCheckboxChange = (key: string) => {
    setSelectedEndpoints((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Filter data based on search query
  const filteredData = referensiItems.filter((item) => {
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

  // Show sync confirmation modal
  const handleSyncClick = () => {
    if (selectedEndpoints.length === 0) {
      addToast({
        title: "Pilih Endpoint",
        description: "Pilih minimal 1 endpoint untuk sync",
        color: "warning",
      });
      return;
    }
    setShowSyncModal(true);
  };

  // Confirm and execute sync
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

      const response = await referensiService.syncReferensi({
        endpoint_keys: selectedEndpoints,
        synced_by: user?.name || user?.email || "system",
      });

      clearInterval(progressInterval);
      setSyncProgress(100);

      if (response.success) {
        setSyncResult({
          total_records: response.data?.total_records || 0,
          endpoint_keys: selectedEndpoints,
        });
        setSyncStatus("success");
        addToast({
          title: "Sync Berhasil",
          description: `${response.data?.total_records || 0} records berhasil disinkronisasi`,
          color: "success",
        });

        // Reload stats and close modal after 2 seconds
        setTimeout(async () => {
          await loadStats();
          setShowProgressModal(false);
          setSyncProgress(0);
          setSyncStatus("idle");
          setSelectedEndpoints([]);
        }, 2000);
      } else {
        setSyncStatus("error");
        addToast({
          title: "Sync Gagal",
          description: response.message || "Terjadi kesalahan saat sync",
          color: "danger",
        });
        setTimeout(() => {
          setShowProgressModal(false);
          setSyncProgress(0);
          setSyncStatus("idle");
        }, 2000);
      }
    } catch (error) {
      console.error("Sync error:", error);
      setSyncStatus("error");
      addToast({
        title: "Sync Gagal",
        description: "Terjadi kesalahan saat sync",
        color: "danger",
      });
      setTimeout(() => {
        setShowProgressModal(false);
        setSyncProgress(0);
        setSyncStatus("idle");
      }, 2000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Open modal to view data (called when card is clicked)
  const handleViewData = async (item: ReferensiItemWithStats) => {
    setSelectedReferensi({ key: item.key, name: item.name });
    setModalPage(1);
    setModalSearch("");
    onOpen();
    await loadModalData(item.key, 1, "");
  };

  // Generate dynamic columns from data
  const generateColumns = (data: Record<string, unknown>[]) => {
    if (data.length === 0) return [];

    // Get all keys from first item
    const keys = Object.keys(data[0]);

    // Filter out technical/metadata fields and generate labels
    const excludeFields = ['last_sync', 'create_date', 'last_update', 'a_ref_pddikti', 'a_ref_unila'];

    return keys
      .filter((key) => !excludeFields.includes(key))
      .map((key) => ({
        key,
        label: key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .replace(/^Id /, 'ID ')
          .replace(/^Nm /, 'Nama ')
          .replace(/^Ket /, 'Keterangan '),
      }));
  };

  // Load modal data
  const loadModalData = async (key: string, page: number, search: string) => {
    try {
      setModalLoading(true);
      const response = await referensiService.getReferensiByKey(key, {
        page,
        limit: modalLimit,
        search: search || undefined,
      });

      if (response.success && response.data) {
        const dataArray = (response.data.data || []) as Record<string, unknown>[];
        setModalData(dataArray);
        setModalColumns(generateColumns(dataArray));
        setModalTotal(response.data.total || 0);
      } else {
        setModalData([]);
        setModalColumns([]);
        setModalTotal(0);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      setModalData([]);
      setModalColumns([]);
      setModalTotal(0);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle modal pagination
  const handleModalPageChange = (page: number) => {
    setModalPage(page);
    if (selectedReferensi) {
      loadModalData(selectedReferensi.key, page, modalSearch);
    }
  };

  // Handle modal search
  const handleModalSearch = (value: string) => {
    setModalSearch(value);
    setModalPage(1);
    if (selectedReferensi) {
      loadModalData(selectedReferensi.key, 1, value);
    }
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Belum sync";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const totalRecords = referensiItems.reduce((sum, item) => sum + item.records, 0);
  const syncedCount = referensiItems.filter((item) => item.records > 0).length;

  return (
    <DashboardLayout
      appName="Feeder Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      menuConfig={feederIntegratorMenuConfig}
      pageTitle="Referensi"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Referensi Data Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola dan sinkronisasi semua data referensi dari Neo Feeder PDDIKTI
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="bordered"
              startContent={<MdRefresh className="w-5 h-5" />}
              onClick={loadStats}
              isDisabled={isLoading}
              className="border-gray-300 text-gray-600 font-semibold"
            >
              Refresh
            </Button>
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
              startContent={isSyncing ? <Spinner size="sm" color="white" /> : <FiDatabase className="w-5 h-5" />}
              isDisabled={selectedEndpoints.length === 0 || isSyncing}
              onPress={handleSyncClick}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
            >
              {isSyncing ? "Syncing..." : `Sync Selected (${selectedEndpoints.length})`}
            </Button>
          </div>
        </div>

        {/* Summary Cards - 4 Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Endpoints */}
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiBookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-100">Total Endpoints</p>
                  <h3 className="text-3xl font-bold text-white">{referensiItems.length}</h3>
                  <p className="text-[10px] text-blue-100/80">Endpoint referensi</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Synced */}
          <Card className="bg-gradient-to-br from-green-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiCheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-green-100">Synced</p>
                  <h3 className="text-3xl font-bold text-white">
                    {syncedCount}/{referensiItems.length}
                  </h3>
                  <p className="text-[10px] text-green-100/80">Tersinkronisasi</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Records */}
          <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiDatabase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-purple-100">Total Records</p>
                  <h3 className="text-3xl font-bold text-white">{totalRecords.toLocaleString()}</h3>
                  <p className="text-[10px] text-purple-100/80">Total data tersimpan</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Selected */}
          <Card className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiActivity className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-orange-100">Selected</p>
                  <h3 className="text-3xl font-bold text-white">{selectedEndpoints.length}</h3>
                  <p className="text-[10px] text-orange-100/80">Endpoint dipilih</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Scheduled Syncs Section */}
        <ScheduleList syncType="referensi" />

        {/* Search & Filter Section */}
        <Card className={`shadow-md hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-900 ${searchQuery ? 'mb-2' : ''}`}>
          <CardBody className="p-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Input */}
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
                    inputWrapper: "h-11 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 focus-within:!border-blue-500 dark:focus-within:!border-blue-500 transition-colors rounded-lg",
                  }}
                  size="lg"
                />
              </div>

              {/* Search Stats Badge */}
              {searchQuery && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {filteredData.length} / {referensiItems.length}
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
                onPress={() => handleViewData(item)}
              >
                {/* Gradient overlay for selected state */}
                {selectedEndpoints.includes(item.key) && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-blue-50/40 to-transparent dark:from-blue-900/20 dark:via-blue-900/10 dark:to-transparent pointer-events-none" />
                )}

                <CardBody className="p-5 relative z-10">
                  {/* Header with checkbox and title */}
                  <div className="flex items-start gap-3 mb-4">
                    <input
                      type="checkbox"
                      checked={selectedEndpoints.includes(item.key)}
                      onChange={() => handleCheckboxChange(item.key)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer flex-shrink-0"
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
                          {item.records.toLocaleString()}
                        </span>
                        {item.records > 0 && (
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
                        {formatDate(item.lastSync)}
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
                  Tentang Data Referensi
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Data referensi adalah data master yang digunakan sebagai acuan dalam sistem Neo Feeder PDDIKTI.
                  Data ini mencakup jalur masuk, jenis evaluasi, semester, dan referensi lainnya yang diperlukan
                  untuk pengelolaan data mahasiswa.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Data View Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="5xl"
        backdrop="opaque"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/80 backdrop-blur-md",
          base: "bg-white dark:bg-gray-900",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FiDatabase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedReferensi?.name}</h3>
                <p className="text-sm text-gray-500 font-normal">
                  Data referensi dari Neo Feeder PDDIKTI
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {/* Search in Modal */}
            <div className="mb-4">
              <Input
                isClearable
                placeholder="Cari data..."
                startContent={<FiSearch className="w-4 h-4 text-gray-400" />}
                value={modalSearch}
                onValueChange={handleModalSearch}
                onClear={() => handleModalSearch("")}
                size="sm"
                classNames={{
                  inputWrapper: "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
                }}
              />
            </div>

            {/* Table */}
            {modalLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : modalData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada data
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table
                  aria-label="Referensi data table"
                  classNames={{
                    wrapper: "bg-white dark:bg-gray-800 shadow-none min-w-full",
                    th: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 whitespace-nowrap",
                    td: "text-gray-700 dark:text-gray-300",
                  }}
                >
                  <TableHeader>
                    {modalColumns.map((col) => (
                      <TableColumn key={col.key}>{col.label}</TableColumn>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {modalData.map((item, index) => (
                      <TableRow key={String(item[modalColumns[0]?.key] || index)}>
                        {modalColumns.map((col) => (
                          <TableCell key={col.key}>
                            {item[col.key] != null ? String(item[col.key]) : "-"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {modalTotal > modalLimit && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(modalTotal / modalLimit)}
                  page={modalPage}
                  onChange={handleModalPageChange}
                  showControls
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Tutup
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Sync Confirmation Modal */}
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
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    <MdSync className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Konfirmasi Sync</h3>
                    <p className="text-sm text-gray-500 font-normal">
                      {selectedEndpoints.length} endpoint dipilih
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
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside max-h-48 overflow-y-auto">
                      {selectedEndpoints.map((key) => {
                        const item = referensiItems.find((r) => r.key === key);
                        return item ? <li key={key}>{item.name}</li> : null;
                      })}
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Synced by: <span className="font-semibold">{user?.name || user?.email || "System"}</span>
                    </span>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onCloseModal}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={handleConfirmSync}
                  startContent={<FiRefreshCw className="w-4 h-4" />}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  Mulai Sync
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
                    : "bg-gradient-to-br from-blue-500 to-indigo-600"
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
                    ? "Sync Berhasil!"
                    : syncStatus === "error"
                    ? "Sync Gagal"
                    : "Sedang Melakukan Sync..."}
                </h3>
                {syncResult && syncStatus === "success" && (
                  <p className="text-xs text-gray-500">
                    {syncResult.total_records.toLocaleString()} records berhasil di-sync
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
                  <span className="text-sm font-bold text-blue-600">{syncProgress}%</span>
                </div>
                <Progress
                  value={syncProgress}
                  color={syncStatus === "success" ? "success" : syncStatus === "error" ? "danger" : "primary"}
                  className="h-2"
                />
              </div>

              {syncStatus === "syncing" && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <Spinner size="sm" color="primary" />
                  <div>
                    <p className="text-sm font-semibold">Menyinkronkan data dari Neo Feeder...</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Memproses {selectedEndpoints.length} endpoint(s)
                    </p>
                  </div>
                </div>
              )}

              {syncStatus === "success" && syncResult && (
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                      {syncResult.total_records.toLocaleString()} records berhasil disinkronisasi
                    </p>
                  </div>
                </div>
              )}

              {syncStatus === "error" && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <FiAlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                      Terjadi kesalahan saat sync. Silakan coba lagi.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
}
