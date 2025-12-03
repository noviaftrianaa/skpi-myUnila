"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button } from "@heroui/react";
import { myunilaClient } from "@/lib/api/myunilaClient";

interface PegawaiListItem {
  id_pegawai: string;
  nm_pegawai: string;
  nip: string | null;
  nidn: string | null;
  jk: string | null;
  jns_pegawai: string | null;
  jns_tenaga: string | null;
  nama_golongan: string | null;
  nama_fungsional: string | null;
  id_org1: string | null; // Fakultas ID
  id_org2: string | null; // Jurusan ID
  id_org3: string | null; // Prodi ID
  nama_org1: string | null; // Fakultas Name
  nama_org2: string | null; // Jurusan Name
  nama_org3: string | null; // Prodi Name
  status: string | null;
  last_sync: string | null;
}

interface SikepPegawaiTableProps {
  onFilterChange?: (filters: { jns_tenaga?: string; status?: string }) => void;
}

export default function SikepPegawaiTable({ onFilterChange }: SikepPegawaiTableProps) {
  const [data, setData] = useState<PegawaiListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterJenisTenaga, setFilterJenisTenaga] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("nm_pegawai");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Options for filters
  const jenisTenagaOptions = [
    { value: "Dosen", label: "Dosen" },
    { value: "Non Dosen", label: "Tenaga Kependidikan" },
  ];

  const statusOptions = [
    { value: "Aktif", label: "Aktif" },
    { value: "Pensiun", label: "Pensiun" },
    { value: "Meninggal", label: "Meninggal" },
  ];

  // Handle sort change
  const handleSortChange = (key: string, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
    setCurrentPage(1);
  };

  // Load data when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: rowsPerPage.toString(),
        });

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        if (filterJenisTenaga) {
          params.append("jns_tenaga", filterJenisTenaga);
        }

        if (filterStatus) {
          params.append("status", filterStatus);
        }

        if (sortBy) {
          params.append("sort_by", sortBy);
          params.append("sort_order", sortOrder);
        }

        const response = await myunilaClient.get(`/sikep/pegawai?${params.toString()}`);

        if (response.data.success) {
          setData(response.data.data || []);
          setTotalRecords(response.data.meta?.total || 0);
        }
      } catch (error) {
        console.error('Error loading pegawai:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterJenisTenaga, filterStatus, sortBy, sortOrder]);

  // Notify parent about filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        jns_tenaga: filterJenisTenaga || undefined,
        status: filterStatus || undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterJenisTenaga, filterStatus]);

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

  const cleanString = (str: string | null | undefined): string => {
    if (!str) return "-";
    return str.trim();
  };

  const columns: Column<PegawaiListItem>[] = [
    {
      key: "nip",
      label: "NIP",
      sortable: true,
      width: "180px",
      render: (item) => (
        <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
          {cleanString(item.nip)}
        </div>
      ),
    },
    {
      key: "nm_pegawai",
      label: "NAMA PEGAWAI",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {item.nm_pegawai}
          </div>
          {item.nidn && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              NIDN: {cleanString(item.nidn)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "jk",
      label: "JK",
      align: "center",
      width: "60px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={cleanString(item.jk) === "L" ? "primary" : "secondary"}
        >
          {cleanString(item.jk)}
        </Chip>
      ),
    },
    {
      key: "jns_tenaga",
      label: "JENIS TENAGA",
      sortable: true,
      width: "150px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.jns_tenaga === "Dosen" ? "primary" : "warning"}
        >
          {item.jns_tenaga === "Dosen" ? "Dosen" : "Tendik"}
        </Chip>
      ),
    },
    {
      key: "jns_pegawai",
      label: "JENIS PEGAWAI",
      width: "130px",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {item.jns_pegawai || "-"}
        </div>
      ),
    },
    {
      key: "unit",
      label: "UNIT ORGANISASI",
      width: "200px",
      render: (item) => {
        // Build unit display from nama_org1, nama_org2, nama_org3 (fallback to id if name not available)
        const hasUnit = item.nama_org1 || item.nama_org2 || item.nama_org3 || item.id_org1 || item.id_org2 || item.id_org3;
        if (!hasUnit) {
          return <div className="text-sm text-gray-400">-</div>;
        }
        return (
          <div className="text-xs space-y-0.5">
            {(item.nama_org1 || item.id_org1) && (
              <div className="text-gray-700 dark:text-gray-300 font-medium truncate" title={item.nama_org1 || item.id_org1 || ""}>
                {item.nama_org1 || item.id_org1}
              </div>
            )}
            {(item.nama_org2 || item.id_org2) && (
              <div className="text-gray-500 dark:text-gray-400 truncate" title={item.nama_org2 || item.id_org2 || ""}>
                {item.nama_org2 || item.id_org2}
              </div>
            )}
            {(item.nama_org3 || item.id_org3) && (
              <div className="text-gray-400 dark:text-gray-500 truncate" title={item.nama_org3 || item.id_org3 || ""}>
                {item.nama_org3 || item.id_org3}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "STATUS",
      align: "center",
      width: "120px",
      sortable: true,
      render: (item) => {
        const status = item.status || "";
        let color: "success" | "primary" | "warning" | "danger" | "default" = "default";

        if (status === "Aktif") {
          color = "success";
        } else if (status === "Pensiun") {
          color = "warning";
        } else if (status === "Meninggal") {
          color = "danger";
        }

        return (
          <Chip
            size="sm"
            variant="flat"
            color={color}
          >
            {status || "-"}
          </Chip>
        );
      },
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      align: "center",
      width: "130px",
      sortable: true,
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.last_sync)}
        </div>
      ),
    },
  ];

  // Filter slot
  const filterSlot = (
    <div className="flex gap-2 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
        <Select
          aria-label="Filter Jenis Tenaga"
          placeholder="Semua Jenis Tenaga"
          selectedKeys={filterJenisTenaga ? [filterJenisTenaga] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setFilterJenisTenaga(selected || "");
            setCurrentPage(1);
          }}
          classNames={{
            base: "w-full",
            trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm",
            value: "text-[10px] font-medium text-gray-700 dark:text-gray-300",
            innerWrapper: "!bg-white dark:!bg-gray-800 pr-8",
            popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[180px]",
            listbox: "!bg-white dark:!bg-gray-800",
            selectorIcon: "right-2",
          }}
          size="sm"
          variant="bordered"
        >
          {jenisTenagaOptions.map((option) => (
            <SelectItem key={option.value} textValue={option.label}>
              <span className="text-xs">{option.label}</span>
            </SelectItem>
          ))}
        </Select>

        <Select
          aria-label="Filter Status"
          placeholder="Semua Status"
          selectedKeys={filterStatus ? [filterStatus] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setFilterStatus(selected || "");
            setCurrentPage(1);
          }}
          classNames={{
            base: "w-full",
            trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm",
            value: "text-[10px] font-medium text-gray-700 dark:text-gray-300",
            innerWrapper: "!bg-white dark:!bg-gray-800 pr-8",
            popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[180px]",
            listbox: "!bg-white dark:!bg-gray-800",
            selectorIcon: "right-2",
          }}
          size="sm"
          variant="bordered"
        >
          {statusOptions.map((option) => (
            <SelectItem key={option.value} textValue={option.label}>
              <span className="text-xs">{option.label}</span>
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="flex gap-2 items-center">
        <Button
          size="sm"
          variant="flat"
          color="default"
          onPress={() => {
            setFilterJenisTenaga("");
            setFilterStatus("");
            setCurrentPage(1);
          }}
          className="h-10 px-3 text-[10px] whitespace-nowrap bg-white hover:bg-gray-100 border border-gray-200"
          isDisabled={filterJenisTenaga === "" && filterStatus === ""}
        >
          Reset Filter
        </Button>
      </div>
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
          searchPlaceholder="Cari NIP atau nama pegawai..."
          loading={loading}
          serverSide={true}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(size) => {
            setRowsPerPage(size);
            setCurrentPage(1);
          }}
          onSearchChange={setSearchQuery}
          onSortChange={handleSortChange}
          filterSlot={filterSlot}
          emptyMessage={
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                Tidak ada data pegawai
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Coba ubah filter atau lakukan sinkronisasi dari SIKEP
              </p>
            </div>
          }
        />
      </motion.div>
    </motion.div>
  );
}
