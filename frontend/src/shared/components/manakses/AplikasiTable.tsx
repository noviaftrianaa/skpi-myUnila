"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem } from "@heroui/react";
import { aplikasiService, type Aplikasi, type AplikasiStats } from "@/lib/services/manakses/aplikasiService";

interface AplikasiTableProps {
  onStatsLoaded?: (stats: AplikasiStats) => void;
}

export default function AplikasiTable({ onStatsLoaded }: AplikasiTableProps) {
  const [data, setData] = useState<Aplikasi[]>([]);
  const [stats, setStats] = useState<AplikasiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterJenis, setFilterJenis] = useState<string>("all");

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
        const statsData = await aplikasiService.getStats();
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
        const response = await aplikasiService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          status: filterStatus !== "all" ? (filterStatus as 'aktif' | 'nonaktif') : undefined,
          jenis: filterJenis !== "all" ? (filterJenis as 'internal' | 'external') : undefined,
        });

        setData(response.data);
        setTotalRecords(response.total);
      } catch (error) {
        console.error('Error loading aplikasi:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterStatus, filterJenis]);

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

  const columns: Column<Aplikasi>[] = [
    {
      key: "nm_aplikasi",
      label: "NAMA APLIKASI",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {item.nm_aplikasi}
          </div>
          {item.ket_aplikasi && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {item.ket_aplikasi}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "url",
      label: "URL",
      render: (item) => (
        <div className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate max-w-xs">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {item.url}
            </a>
          ) : (
            "-"
          )}
        </div>
      ),
    },
    {
      key: "teknologi",
      label: "TEKNOLOGI",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
          {item.teknologi || "-"}
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      align: "center",
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.status === "Aktif" ? "success" : "danger"}
        >
          {item.status}
        </Chip>
      ),
    },
    {
      key: "jenis",
      label: "JENIS",
      align: "center",
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.jenis === "Internal" ? "primary" : "warning"}
        >
          {item.jenis}
        </Chip>
      ),
    },
    {
      key: "a_integrasi_cas",
      label: "SSO/CAS",
      align: "center",
      width: "80px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.a_integrasi_cas ? "success" : "default"}
        >
          {item.a_integrasi_cas ? "Ya" : "Tidak"}
        </Chip>
      ),
    },
    {
      key: "last_update",
      label: "TERAKHIR UPDATE",
      align: "center",
      width: "140px",
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.last_update)}
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
          Semua Status ({stats?.total_aplikasi || 0})
        </SelectItem>
        <SelectItem key="aktif" value="aktif" textValue="Aktif">
          Aktif ({stats?.total_aktif || 0})
        </SelectItem>
        <SelectItem key="nonaktif" value="nonaktif" textValue="Tidak Aktif">
          Tidak Aktif ({stats?.total_nonaktif || 0})
        </SelectItem>
      </Select>
      <Select
        aria-label="Filter Jenis"
        placeholder="Semua Jenis"
        selectedKeys={[filterJenis]}
        onChange={(e) => {
          setFilterJenis(e.target.value || "all");
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
          if (!items || items.length === 0) return "Semua Jenis";
          const item = items[0];
          if (item.key === "all") return "Semua Jenis";
          return item.textValue || "Semua Jenis";
        }}
      >
        <SelectItem key="all" value="all" textValue="Semua Jenis">
          Semua Jenis ({stats?.total_aplikasi || 0})
        </SelectItem>
        <SelectItem key="internal" value="internal" textValue="Internal">
          Internal ({stats?.total_internal || 0})
        </SelectItem>
        <SelectItem key="external" value="external" textValue="External">
          External ({stats?.total_external || 0})
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
          searchKeys={["nm_aplikasi", "ket_aplikasi", "url", "teknologi"]}
          searchPlaceholder="Cari nama aplikasi, URL, atau teknologi..."
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
