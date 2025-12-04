"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem } from "@heroui/react";
import { penggunaService, type Pengguna, type PenggunaStats } from "@/lib/services/manakses/penggunaService";

interface PenggunaTableProps {
  onStatsLoaded?: (stats: PenggunaStats) => void;
}

export default function PenggunaTable({ onStatsLoaded }: PenggunaTableProps) {
  const [data, setData] = useState<Pengguna[]>([]);
  const [stats, setStats] = useState<PenggunaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSso, setFilterSso] = useState<string>("all");

  // Use ref to store callback to avoid infinite loop
  const onStatsLoadedRef = useRef(onStatsLoaded);
  onStatsLoadedRef.current = onStatsLoaded;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Load stats on mount only
  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await penggunaService.getStats();
        setStats(statsData);
        if (onStatsLoadedRef.current) {
          onStatsLoadedRef.current(statsData);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, []); // Empty dependency - only run on mount

  // Load data when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await penggunaService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          status: filterStatus !== "all" ? (filterStatus as 'aktif' | 'nonaktif') : undefined,
          has_sso: filterSso !== "all" ? (filterSso as 'yes' | 'no') : undefined,
        });

        setData(response.data);
        setTotalRecords(response.total);
      } catch (error) {
        console.error('Error loading pengguna:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterStatus, filterSso]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const columns: Column<Pengguna>[] = [
    {
      key: "nm_pengguna",
      label: "NAMA",
      sortable: true,
      render: (item) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {item.nm_pengguna}
        </div>
      ),
    },
    {
      key: "username",
      label: "USERNAME",
      render: (item) => (
        <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
          {item.username}
        </div>
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
      key: "status",
      label: "STATUS",
      align: "center",
      width: "120px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.a_aktif && !item.disable ? "success" : "danger"}
        >
          {item.a_aktif && !item.disable ? "Aktif" : "Tidak Aktif"}
        </Chip>
      ),
    },
    {
      key: "active_role",
      label: "ROLE AKTIF",
      width: "200px",
      render: (item) => (
        <div className="text-sm">
          {item.active_role ? (
            <>
              <div className="font-medium text-gray-900 dark:text-white">
                {item.active_role}
              </div>
              {item.active_organisasi && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.active_organisasi}
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "sumber_data",
      label: "SUMBER DATA",
      align: "center",
      width: "150px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.has_sso ? "primary" : "warning"}
        >
          {item.sumber_data}
        </Chip>
      ),
    },
    {
      key: "last_login_at",
      label: "LAST LOGIN",
      align: "center",
      width: "180px",
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDateTime(item.last_login_at)}
        </div>
      ),
    },
  ];

  // Filter slot
  const filterSlot = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
      <Select
        aria-label="Filter Status"
        placeholder="Semua Status"
        selectedKeys={[filterStatus]}
        onChange={(e) => {
          setFilterStatus(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-full",
          trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-8",
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
          Semua Status ({stats?.total_pengguna || 0})
        </SelectItem>
        <SelectItem key="aktif" value="aktif" textValue="Aktif">
          Aktif ({stats?.total_aktif || 0})
        </SelectItem>
        <SelectItem key="nonaktif" value="nonaktif" textValue="Tidak Aktif">
          Tidak Aktif ({stats?.total_nonaktif || 0})
        </SelectItem>
      </Select>
      <Select
        aria-label="Filter Sumber Data"
        placeholder="Semua Sumber"
        selectedKeys={[filterSso]}
        onChange={(e) => {
          setFilterSso(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-full",
          trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-8",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        size="sm"
        variant="bordered"
        renderValue={(items) => {
          if (!items || items.length === 0) return "Semua Sumber";
          const item = items[0];
          if (item.key === "all") return "Semua Sumber";
          return item.textValue || "Semua Sumber";
        }}
      >
        <SelectItem key="all" value="all" textValue="Semua Sumber">
          Semua Sumber ({stats?.total_pengguna || 0})
        </SelectItem>
        <SelectItem key="yes" value="yes" textValue="SSO Radius">
          SSO Radius ({stats?.total_sso || 0})
        </SelectItem>
        <SelectItem key="no" value="no" textValue="Manajemen Akses">
          Manajemen Akses ({stats?.total_non_sso || 0})
        </SelectItem>
      </Select>
    </div>
  );

  return (
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
          searchKeys={["nm_pengguna", "username", "email"]}
          searchPlaceholder="Cari nama, username, atau email..."
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
      </motion.div>
    </motion.div>
  );
}
