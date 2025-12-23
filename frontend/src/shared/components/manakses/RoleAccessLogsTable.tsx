"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Input } from "@heroui/react";
import { FiEye, FiCalendar } from "react-icons/fi";
import { loggerService, type RoleAccessLog } from "@/lib/services/manakses/loggerService";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "@heroui/react";

export default function RoleAccessLogsTable() {
  const [data, setData] = useState<RoleAccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("waktu_akses");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await loggerService.getRoleAccessLogs({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          a_berhasil: filterStatus !== "all" ? (filterStatus === "berhasil" ? "true" : "false") : undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          sort_by: sortBy as 'waktu_akses' | 'menu_akses' | 'method' | 'username' | 'nm_pengguna',
          sort_order: sortOrder,
        });

        if (isMounted) {
          setData(response.data);
          setTotalRecords(response.total);
        }
      } catch (error: unknown) {
        // Ignore aborted requests (happens in React Strict Mode)
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNABORTED') return;
        console.error('Error loading role access logs:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [currentPage, rowsPerPage, searchQuery, filterStatus, dateFrom, dateTo, sortBy, sortOrder]);

  const columns: Column<RoleAccessLog>[] = [
    {
      key: "waktu_akses",
      label: "Waktu Akses",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {format(new Date(row.waktu_akses), "dd MMM yyyy", { locale: localeId })}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {format(new Date(row.waktu_akses), "HH:mm:ss", { locale: localeId })}
          </span>
        </div>
      ),
    },
    {
      key: "username",
      label: "Pengguna",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {row.nm_pengguna}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            @{row.username}
          </span>
          {row.email && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {row.email}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "nm_peran",
      label: "Role",
      sortable: false,
      render: (row) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {row.nm_peran}
        </span>
      ),
    },
    {
      key: "method",
      label: "Method",
      sortable: true,
      render: (row) => (
        <Chip
          size="sm"
          variant="flat"
          color={
            row.method === "GET"
              ? "success"
              : row.method === "POST"
              ? "primary"
              : row.method === "PUT"
              ? "warning"
              : row.method === "DELETE"
              ? "danger"
              : "default"
          }
        >
          {row.method}
        </Chip>
      ),
    },
    {
      key: "menu_akses",
      label: "Endpoint",
      sortable: true,
      render: (row) => (
        <div className="max-w-xs">
          <span className="text-sm text-gray-700 dark:text-gray-300 font-mono truncate block">
            {row.menu_akses}
          </span>
        </div>
      ),
    },
    {
      key: "a_berhasil",
      label: "Status",
      sortable: false,
      render: (row) => (
        <div className="flex flex-col gap-1">
          <Chip
            size="sm"
            variant="flat"
            color={row.a_berhasil ? "success" : "danger"}
            startContent={
              row.a_berhasil ? (
                <span className="text-xs">✓</span>
              ) : (
                <span className="text-xs">✗</span>
              )
            }
          >
            {row.a_berhasil ? "Berhasil" : "Gagal"}
          </Chip>
          {row.ket && (
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {row.ket}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "ip_address",
      label: "IP & Device",
      sortable: false,
      render: (row) => (
        <div className="flex flex-col">
          {row.ip_address && (
            <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
              {row.ip_address}
            </span>
          )}
          {row.browser && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {row.browser}
            </span>
          )}
          {row.os && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {row.os}
            </span>
          )}
        </div>
      ),
    },
  ];

  const filterSlot = (
    <div className="flex items-center gap-2">
      <Select
        aria-label="Filter Status"
        placeholder="Semua Status"
        selectedKeys={filterStatus !== "all" ? [filterStatus] : []}
        onChange={(e) => {
          setFilterStatus(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-36",
          trigger: "h-9 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-6",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        size="sm"
        variant="bordered"
        renderValue={(items) => {
          if (!items || items.length === 0) return "Semua Status";
          const item = items[0];
          if (item.key === "all") return "Semua Status";
          return item.textValue || "Semua Status";
        }}
      >
        <SelectItem key="all" value="all" textValue="Semua Status">
          Semua Status
        </SelectItem>
        <SelectItem key="berhasil" value="berhasil" textValue="Berhasil">
          Berhasil
        </SelectItem>
        <SelectItem key="gagal" value="gagal" textValue="Gagal">
          Gagal
        </SelectItem>
      </Select>
    </div>
  );

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Data Table */}
      <motion.div variants={itemVariants}>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchable={true}
          searchKeys={["username", "nm_pengguna", "nm_peran", "menu_akses"]}
          searchPlaceholder="Cari pengguna, role, endpoint..."
          defaultRowsPerPage={10}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          serverSide={true}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(newRowsPerPage) => {
            setRowsPerPage(newRowsPerPage);
            setCurrentPage(1);
          }}
          onSearchChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
          onSortChange={(key, order) => {
            setSortBy(key);
            setSortOrder(order);
          }}
          filterSlot={filterSlot}
          className="shadow-lg"
        />
      </motion.div>
    </motion.div>
  );
}
