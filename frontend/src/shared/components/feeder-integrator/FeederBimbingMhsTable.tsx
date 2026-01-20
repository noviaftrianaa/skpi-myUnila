"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button } from "@heroui/react";
import { bimbingMhsService, BimbingMhsListItem, ProdiOption } from "@/lib/services/feeder/pdrd/bimbingMhsService";

interface FeederBimbingMhsTableProps {
  onFilterChange?: (filters: { id_prodi?: string }) => void;
}

export default function FeederBimbingMhsTable({ onFilterChange }: FeederBimbingMhsTableProps) {
  const [data, setData] = useState<BimbingMhsListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterProdi, setFilterProdi] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Options for filters
  const [prodiOptions, setProdiOptions] = useState<ProdiOption[]>([]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Load filter options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const prodiList = await bimbingMhsService.getProdiList();
        setProdiOptions(prodiList);
      } catch (error) {
        console.error("Error loading prodi options:", error);
      }
    };
    loadOptions();
  }, []);

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
        const response = await bimbingMhsService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          id_prodi: filterProdi || undefined,
          order_by: sortBy || undefined,
          order_dir: sortOrder,
        });

        if (response.success) {
          setData(response.data?.data || []);
          setTotalRecords(response.data?.total || 0);
        }
      } catch (error) {
        console.error("Error loading bimbing mhs:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterProdi, sortBy, sortOrder]);

  // Notify parent about filter changes for sync
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        id_prodi: filterProdi || undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterProdi]);

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

  const getPembimbingKeLabel = (urutan: number) => {
    if (urutan === 1) return "Pembimbing 1";
    if (urutan === 2) return "Pembimbing 2";
    if (urutan === 3) return "Pembimbing 3";
    return `Pembimbing ${urutan}`;
  };

  const getPembimbingKeColor = (urutan: number): "primary" | "secondary" | "success" | "warning" | "default" => {
    if (urutan === 1) return "primary";
    if (urutan === 2) return "secondary";
    if (urutan === 3) return "success";
    return "default";
  };

  const columns: Column<BimbingMhsListItem>[] = [
    {
      key: "nidn",
      label: "NIDN",
      sortable: true,
      width: "110px",
      render: (item) => (
        <div className="font-mono text-sm text-gray-900 dark:text-white">
          {item.nidn || "-"}
        </div>
      ),
    },
    {
      key: "nama_dosen",
      label: "DOSEN PEMBIMBING",
      sortable: true,
      render: (item) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
            {item.nama_dosen || "-"}
          </div>
        </div>
      ),
    },
    {
      key: "urutan_promotor",
      label: "PEMBIMBING KE",
      sortable: true,
      width: "130px",
      render: (item) => (
        <Chip
          size="sm"
          color={getPembimbingKeColor(item.urutan_promotor)}
          variant="flat"
          className="font-semibold"
        >
          {getPembimbingKeLabel(item.urutan_promotor)}
        </Chip>
      ),
    },
    {
      key: "judul_aktivitas",
      label: "JUDUL AKTIVITAS",
      sortable: true,
      render: (item) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900 dark:text-white line-clamp-2">
            {item.judul_aktivitas || "-"}
          </div>
          {item.jenis_aktivitas && (
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
              {item.jenis_aktivitas}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "nim",
      label: "NIM",
      sortable: true,
      width: "120px",
      render: (item) => (
        <div className="font-mono text-sm text-gray-900 dark:text-white">
          {item.nim || "-"}
        </div>
      ),
    },
    {
      key: "nama_mahasiswa",
      label: "MAHASISWA",
      sortable: true,
      render: (item) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
            {item.nama_mahasiswa || "-"}
          </div>
          {item.nama_prodi && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
              {item.nama_prodi}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      sortable: true,
      width: "110px",
      render: (item) => (
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {formatDate(item.last_sync)}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          serverSide={true}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={setSearchQuery}
          onSortChange={handleSortChange}
          searchPlaceholder="Cari NIDN, nama dosen, NIM, nama mahasiswa, atau judul..."
          defaultRowsPerPage={10}
          filterSlot={
            <div className="flex gap-2 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
                <Select
                  aria-label="Filter Prodi"
                  placeholder="Semua Prodi"
                  selectedKeys={filterProdi ? [filterProdi] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFilterProdi(selected || "");
                    setCurrentPage(1);
                  }}
                  classNames={{
                    base: "w-full",
                    trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm",
                    value: "text-[10px] font-medium text-gray-700 dark:text-gray-300",
                    innerWrapper: "!bg-white dark:!bg-gray-800 pr-8",
                    popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[400px]",
                    listbox: "!bg-white dark:!bg-gray-800",
                    selectorIcon: "right-2",
                  }}
                  size="sm"
                  variant="bordered"
                  renderValue={(items) => {
                    if (!items || items.length === 0) return <span className="text-[10px]">Semua Prodi</span>;
                    const item = items[0];
                    const prodi = prodiOptions.find(p => p.id_sms === item.key);
                    if (!prodi) return <span className="text-[10px]">Semua Prodi</span>;
                    return (
                      <div className="flex items-center gap-1 overflow-hidden">
                        <span className="font-semibold text-blue-600 text-[10px] flex-shrink-0">{prodi.nm_jenj_didik || ''}</span>
                        {prodi.nm_jenj_didik && <span className="text-gray-400 text-[10px]">-</span>}
                        <span className="truncate text-[10px]">{prodi.nama_prodi}</span>
                      </div>
                    );
                  }}
                >
                  {prodiOptions.map((prodi) => (
                    <SelectItem key={prodi.id_sms} textValue={`${prodi.nm_jenj_didik || ''} - ${prodi.nama_prodi}`}>
                      <div className="flex items-center gap-2 py-1">
                        <span className="font-semibold text-blue-600 text-xs flex-shrink-0 min-w-[30px]">{prodi.nm_jenj_didik || '-'}</span>
                        <span className="text-gray-400">-</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300">{prodi.nama_prodi}</span>
                      </div>
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
                    setFilterProdi("");
                    setCurrentPage(1);
                  }}
                  className="h-10 px-3 text-[10px] whitespace-nowrap bg-white hover:bg-gray-100 border border-gray-200"
                  isDisabled={filterProdi === ""}
                >
                  Reset Filter
                </Button>
              </div>
            </div>
          }
        />
      </motion.div>
    </motion.div>
  );
}
