"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem } from "@heroui/react";
import { sisterDosenService, type SisterDosen, type SisterDosenStats } from "@/lib/services/dosenService";

export default function SisterDosenTable() {
  const [data, setData] = useState<SisterDosen[]>([]);
  const [stats, setStats] = useState<SisterDosenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterJenisSDM, setFilterJenisSDM] = useState<number>(0);
  const [filterStatusAktif, setFilterStatusAktif] = useState<number>(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Load stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await sisterDosenService.getStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, []);

  // Load data when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await sisterDosenService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          id_jns_sdm: filterJenisSDM || undefined,
          id_stat_aktif: filterStatusAktif || undefined,
        });

        setData(response.data);
        setTotalRecords(response.total);
      } catch (error) {
        console.error('Error loading dosen:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterJenisSDM, filterStatusAktif]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Belum sync";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Belum sync";
    }
  };

  const columns: Column<SisterDosen>[] = [
    {
      key: "nama_sdm",
      label: "NAMA",
      sortable: true,
      render: (item) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {item.nama_sdm}
        </div>
      ),
    },
    {
      key: "nidn",
      label: "NIDN / NIP",
      render: (item) => (
        <div className="text-sm">
          <div className="font-mono text-gray-700 dark:text-gray-300">
            {item.nidn || "-"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {item.nip || "-"}
          </div>
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
      key: "jenis_kelamin",
      label: "JENIS KELAMIN",
      align: "center",
      width: "140px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.jenis_kelamin === "L" ? "primary" : "secondary"}
        >
          {item.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
        </Chip>
      ),
    },
    {
      key: "no_hp",
      label: "NO HP",
      render: (item) => (
        <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
          {item.no_hp || "-"}
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
          {formatDate(item.last_sync)}
        </div>
      ),
    },
  ];

  // Filter slot - aligned with search (no labels)
  const filterSlot = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
      <Select
        aria-label="Filter Jenis SDM"
        placeholder="Semua Jenis SDM"
        selectedKeys={filterJenisSDM > 0 ? [filterJenisSDM.toString()] : ["0"]}
        onChange={(e) => {
          setFilterJenisSDM(parseInt(e.target.value) || 0);
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
          if (!items || items.length === 0) return "Semua Jenis SDM";
          const item = items[0];
          if (item.key === "0") return "Semua Jenis SDM";
          return item.textValue || "Semua Jenis SDM";
        }}
      >
        <SelectItem key="0" value="0" textValue="Semua Jenis SDM">
          Semua Jenis SDM
        </SelectItem>
        {stats?.by_jenis_sdm
          .filter((j) => j.total > 0)
          .map((jenis) => (
            <SelectItem
              key={jenis.id_jns_sdm.toString()}
              value={jenis.id_jns_sdm.toString()}
              textValue={`${jenis.nm_jns_sdm} (${jenis.total})`}
            >
              {jenis.nm_jns_sdm} ({jenis.total})
            </SelectItem>
          ))}
      </Select>
      <Select
        aria-label="Filter Status Aktif"
        placeholder="Semua Status"
        selectedKeys={filterStatusAktif > 0 ? [filterStatusAktif.toString()] : ["0"]}
        onChange={(e) => {
          setFilterStatusAktif(parseInt(e.target.value) || 0);
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
          if (!items || items.length === 0) return "Semua Status";
          const item = items[0];
          if (item.key === "0") return "Semua Status";
          return item.textValue || "Semua Status";
        }}
      >
        <SelectItem key="0" value="0" textValue="Semua Status">
          Semua Status
        </SelectItem>
        {stats?.by_status_aktif
          .filter((s) => s.total > 0)
          .map((status) => (
            <SelectItem
              key={status.id_stat_aktif.toString()}
              value={status.id_stat_aktif.toString()}
              textValue={`${status.nm_stat_aktif.trim()} (${status.total})`}
            >
              {status.nm_stat_aktif.trim()} ({status.total})
            </SelectItem>
          ))}
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
          searchKeys={["nama_sdm", "nidn", "nip", "email"]}
          searchPlaceholder="Cari nama, NIDN, NIP, atau email..."
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
