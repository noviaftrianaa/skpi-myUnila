"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { syncLogsService, type SyncLog } from "@/lib/services/syncLogsService";
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiClock, FiEye } from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function SyncLogsTable() {
  const [data, setData] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterSyncType, setFilterSyncType] = useState<string>("");

  // Modal for error details
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SyncLog | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Load data when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await syncLogsService.getSyncLogs({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          status: filterStatus || undefined,
          sync_type: filterSyncType || undefined,
        });

        setData(response.data || []);
        setTotalRecords(response.total);
      } catch (error) {
        console.error('Error loading sync logs:', error);
        toast.error('Gagal memuat sync logs');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterStatus, filterSyncType]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "success";
      case "failed":
        return "danger";
      case "partial":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <FiCheckCircle className="w-4 h-4" />;
      case "failed":
        return <FiXCircle className="w-4 h-4" />;
      case "partial":
        return <FiAlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleViewError = (log: SyncLog) => {
    setSelectedLog(log);
    setShowErrorModal(true);
  };

  const columns: Column<SyncLog>[] = [
    {
      key: "endpoint_name",
      label: "ENDPOINT",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white text-sm">
            {item.endpoint_name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {item.endpoint_key}
          </div>
        </div>
      ),
    },
    {
      key: "sync_type",
      label: "TIPE",
      align: "center",
      width: "100px",
      render: (item) => (
        <Chip size="sm" variant="flat" className="capitalize">
          {item.sync_type}
        </Chip>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      align: "center",
      width: "120px",
      render: (item) => (
        <Chip
          size="sm"
          color={getStatusColor(item.status)}
          variant="flat"
          startContent={getStatusIcon(item.status)}
          className="capitalize"
        >
          {item.status}
        </Chip>
      ),
    },
    {
      key: "total_records",
      label: "RECORDS",
      align: "right",
      width: "140px",
      render: (item) => (
        <div className="text-sm space-y-0.5">
          <div className="font-semibold text-gray-900 dark:text-white">
            {item.total_records.toLocaleString()}
          </div>
          {item.inserted_count > 0 && (
            <div className="text-xs text-green-600">
              +{item.inserted_count} insert
            </div>
          )}
          {item.updated_count > 0 && (
            <div className="text-xs text-blue-600">
              {item.updated_count} update
            </div>
          )}
          {item.failed_count > 0 && (
            <div className="text-xs text-red-600">
              {item.failed_count} failed
            </div>
          )}
        </div>
      ),
    },
    {
      key: "duration_ms",
      label: "DURASI",
      align: "center",
      width: "100px",
      render: (item) => (
        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <FiClock className="w-3 h-3" />
          {formatDuration(item.duration_ms)}
        </div>
      ),
    },
    {
      key: "synced_by",
      label: "OLEH",
      width: "120px",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {item.synced_by}
        </div>
      ),
    },
    {
      key: "synced_at",
      label: "WAKTU",
      width: "150px",
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.synced_at)}
        </div>
      ),
    },
    {
      key: "actions",
      label: "AKSI",
      align: "center",
      width: "80px",
      render: (item) => (
        item.status === "failed" || item.error_message ? (
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            onPress={() => handleViewError(item)}
            className="min-w-8 w-8 h-8"
          >
            <FiEye className="w-4 h-4" />
          </Button>
        ) : null
      ),
    },
  ];

  // Filter slot - aligned with search (no labels)
  const filterSlot = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
      <Select
        aria-label="Filter Status"
        placeholder="Semua Status"
        selectedKeys={filterStatus ? [filterStatus] : [""]}
        onChange={(e) => {
          setFilterStatus(e.target.value);
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-full",
          trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-purple-400 focus:border-purple-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-8",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        size="sm"
        variant="bordered"
        renderValue={(items) => {
          if (!items || items.length === 0 || items[0].key === "") return "Semua Status";
          return items[0].textValue || "Semua Status";
        }}
      >
        <SelectItem key="" value="" textValue="Semua Status">
          Semua Status
        </SelectItem>
        <SelectItem key="success" value="success" textValue="Success">
          Success
        </SelectItem>
        <SelectItem key="failed" value="failed" textValue="Failed">
          Failed
        </SelectItem>
        <SelectItem key="partial" value="partial" textValue="Partial">
          Partial
        </SelectItem>
      </Select>

      <Select
        aria-label="Filter Sync Type"
        placeholder="Semua Tipe"
        selectedKeys={filterSyncType ? [filterSyncType] : [""]}
        onChange={(e) => {
          setFilterSyncType(e.target.value);
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-full",
          trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-purple-400 focus:border-purple-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-8",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        size="sm"
        variant="bordered"
        renderValue={(items) => {
          if (!items || items.length === 0 || items[0].key === "") return "Semua Tipe";
          return items[0].textValue || "Semua Tipe";
        }}
      >
        <SelectItem key="" value="" textValue="Semua Tipe">
          Semua Tipe
        </SelectItem>
        <SelectItem key="manual" value="manual" textValue="Manual">
          Manual
        </SelectItem>
        <SelectItem key="batch" value="batch" textValue="Batch">
          Batch
        </SelectItem>
        <SelectItem key="scheduled" value="scheduled" textValue="Scheduled">
          Scheduled
        </SelectItem>
      </Select>
    </div>
  );

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <DataTable
            data={data}
            columns={columns}
            searchable={true}
            searchPlaceholder="Cari endpoint..."
            onSearchChange={setSearchQuery}
            filterSlot={filterSlot}
            loading={loading}
            serverSide={true}
            totalRecords={totalRecords}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(value) => {
              setRowsPerPage(value);
              setCurrentPage(1);
            }}
            defaultRowsPerPage={10}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </motion.div>
      </motion.div>

      {/* Error Detail Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setSelectedLog(null);
        }}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "!bg-white dark:!bg-gray-900",
          header: "!bg-white dark:!bg-gray-900 border-b border-gray-200 dark:border-gray-700",
          body: "!bg-white dark:!bg-gray-900",
          footer: "!bg-white dark:!bg-gray-900 border-t border-gray-200 dark:border-gray-700",
        }}
      >
        <ModalContent className="!bg-white dark:!bg-gray-900">
          <ModalHeader className="flex flex-col gap-1 !bg-white dark:!bg-gray-900">
            <div className="flex items-center gap-2">
              <FiXCircle className="w-5 h-5 text-red-500" />
              <span>Error Details</span>
            </div>
          </ModalHeader>
          <ModalBody className="!bg-white dark:!bg-gray-900">
            {selectedLog && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Endpoint
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedLog.endpoint_name} ({selectedLog.endpoint_key})
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Synced At
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(selectedLog.synced_at)}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Error Message
                  </h4>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-700 dark:text-red-400 font-mono whitespace-pre-wrap">
                      {selectedLog.error_message}
                    </p>
                  </div>
                </div>

                {selectedLog.error_details && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Error Details
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-64 overflow-y-auto">
                      <p className="text-xs text-gray-700 dark:text-gray-400 font-mono whitespace-pre-wrap">
                        {selectedLog.error_details}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 mb-1">Total Records</h4>
                    <p className="text-sm font-medium">{selectedLog.total_records}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 mb-1">Failed Count</h4>
                    <p className="text-sm font-medium text-red-600">{selectedLog.failed_count}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 mb-1">Duration</h4>
                    <p className="text-sm font-medium">{formatDuration(selectedLog.duration_ms)}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 mb-1">Synced By</h4>
                    <p className="text-sm font-medium">{selectedLog.synced_by}</p>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="!bg-white dark:!bg-gray-900">
            <Button
              color="danger"
              variant="light"
              onPress={() => {
                setShowErrorModal(false);
                setSelectedLog(null);
              }}
            >
              Tutup
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
