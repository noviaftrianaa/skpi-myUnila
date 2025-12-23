"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Input, Select, SelectItem } from "@heroui/react";
import { FiEye, FiCalendar } from "react-icons/fi";
import { loggerService, type JwtLog } from "@/lib/services/manakses/loggerService";
import { aplikasiService, type Aplikasi } from "@/lib/services/manakses/aplikasiService";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "@heroui/react";
import JwtLogDetailModal from "./JwtLogDetailModal";

export default function JwtLogsTable() {
  const [data, setData] = useState<JwtLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterAplikasi, setFilterAplikasi] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("waktu_create");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Aplikasi options
  const [aplikasiOptions, setAplikasiOptions] = useState<Aplikasi[]>([]);

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Load aplikasi options on mount
  useEffect(() => {
    let isMounted = true;
    const loadAplikasi = async () => {
      try {
        const response = await aplikasiService.getList({ page: 1, limit: 1000 });
        if (isMounted) {
          setAplikasiOptions(response.data);
        }
      } catch (error) {
        console.error('Error loading aplikasi:', error);
      }
    };
    loadAplikasi();
    return () => { isMounted = false; };
  }, []);

  // Load data when filters change
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await loggerService.getJwtLogs({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          id_aplikasi: filterAplikasi !== "all" ? filterAplikasi : undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          sort_by: sortBy as 'waktu_create' | 'waktu_expired' | 'username' | 'nm_pengguna' | 'nm_aplikasi',
          sort_order: sortOrder,
        });

        if (isMounted) {
          setData(response.data);
          setTotalRecords(response.total);
        }
      } catch (error: unknown) {
        // Ignore aborted requests (happens in React Strict Mode)
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNABORTED') return;
        console.error('Error loading JWT logs:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [currentPage, rowsPerPage, searchQuery, filterAplikasi, dateFrom, dateTo, sortBy, sortOrder]);

  const handleViewDetail = (logId: string) => {
    setSelectedLogId(logId);
    setDetailModalOpen(true);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy HH:mm", { locale: localeId });
    } catch {
      return dateString;
    }
  };

  const columns: Column<JwtLog>[] = [
    {
      key: "username",
      label: "Username",
      sortable: true,
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-gray-900 dark:text-white">
            {item.username}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {item.nm_pengguna}
          </span>
        </div>
      ),
    },
    {
      key: "nm_aplikasi",
      label: "Aplikasi",
      sortable: true,
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-gray-900 dark:text-white">
            {item.nm_aplikasi}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {item.app_key}
          </span>
        </div>
      ),
    },
    {
      key: "token_value",
      label: "Token",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate max-w-[200px]" title={item.token_value}>
            {item.token_value.substring(0, 20)}...
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {item.ip_address}
          </span>
        </div>
      ),
    },
    {
      key: "waktu_create",
      label: "Waktu Dibuat",
      sortable: true,
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-900 dark:text-white">
            {formatDateTime(item.waktu_create)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Exp: {formatDateTime(item.waktu_expired)}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.is_expired ? "danger" : "success"}
          className="capitalize"
        >
          {item.status}
        </Chip>
      ),
    },
    {
      key: "actions",
      label: "Aksi",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="primary"
            onPress={() => handleViewDetail(item.id_log_jwt)}
            className="min-w-unit-8 w-8 h-8"
          >
            <FiEye className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <JwtLogDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        logId={selectedLogId}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full"
      >
      <motion.div variants={itemVariants} className="mb-4">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari username, nama, aplikasi, token..."
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(key, order) => {
            setSortBy(key);
            setSortOrder(order);
          }}
          filterSlot={
            <div className="flex items-center gap-2">
              <Select
                aria-label="Filter Aplikasi"
                placeholder="Semua Aplikasi"
                selectedKeys={filterAplikasi !== "all" ? [filterAplikasi] : []}
                onChange={(e) => {
                  setFilterAplikasi(e.target.value || "all");
                  setCurrentPage(1);
                }}
                classNames={{
                  base: "w-40",
                  trigger: "h-9 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
                  value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-6",
                  innerWrapper: "!bg-white dark:!bg-gray-800",
                  popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200",
                  listbox: "!bg-white dark:!bg-gray-800",
                }}
                size="sm"
                variant="bordered"
                renderValue={(items) => {
                  if (!items || items.length === 0) return "Semua Aplikasi";
                  const item = items[0];
                  if (item.key === "all") return "Semua Aplikasi";
                  return item.textValue || "Semua Aplikasi";
                }}
              >
                <SelectItem key="all" value="all" textValue="Semua Aplikasi">
                  Semua Aplikasi
                </SelectItem>
                {aplikasiOptions.map((app) => (
                  <SelectItem key={app.id_aplikasi} value={app.id_aplikasi} textValue={app.nm_aplikasi}>
                    {app.nm_aplikasi}
                  </SelectItem>
                ))}
              </Select>
            </div>
          }
        />
      </motion.div>
      </motion.div>
    </>
  );
}
