"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button } from "@heroui/react";
import { feederClient } from "@/lib/api/feederClient";

interface PrestasiListItem {
  id_prestasi: string;
  id_pd: string;
  nim: string | null;
  nama_mahasiswa: string | null;
  nama_prodi: string | null;
  id_jenis_prestasi: number;
  nama_jenis_prestasi: string | null;
  id_tkt_prestasi: number;
  nama_tingkat_prestasi: string | null;
  nm_prestasi: string;
  thn_prestasi: number;
  penyelenggara: string | null;
  peringkat: number | null;
  id_akt_mhs: string | null;
  last_sync: string | null;
}

interface TahunOption {
  tahun_prestasi: number;
}

interface FeederPrestasiTableProps {
  onFilterChange?: (filters: { tahun_prestasi?: number }) => void;
}

export default function FeederPrestasiTable({ onFilterChange }: FeederPrestasiTableProps) {
  const [data, setData] = useState<PrestasiListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterTahun, setFilterTahun] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Options for filters
  const [tahunOptions, setTahunOptions] = useState<TahunOption[]>([]);

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
        // Load tahun list
        const tahunRes = await feederClient.get("/prestasi/tahun");
        if (tahunRes.data.success) {
          setTahunOptions(tahunRes.data.data || []);
        }
      } catch (error) {
        console.error('Error loading tahun options:', error);
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
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: rowsPerPage.toString(),
          _t: Date.now().toString(),
        });

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        if (filterTahun) {
          params.append("tahun_prestasi", filterTahun);
        }

        if (sortBy) {
          params.append("order_by", sortBy);
          params.append("order_dir", sortOrder);
        }

        const response = await feederClient.get(`/prestasi?${params.toString()}`);

        if (response.data.success) {
          setData(response.data.data || []);
          setTotalRecords(response.data.meta?.total || 0);
        }
      } catch (error) {
        console.error('Error loading prestasi:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterTahun, sortBy, sortOrder]);

  // Notify parent about filter changes for sync
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        tahun_prestasi: filterTahun ? parseInt(filterTahun) : undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTahun]);

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

  const getTingkatColor = (tingkat: string | null) => {
    if (!tingkat) return "default";
    const t = tingkat.toLowerCase();
    if (t.includes("internasional")) return "secondary";
    if (t.includes("nasional")) return "primary";
    if (t.includes("provinsi") || t.includes("regional")) return "success";
    if (t.includes("kabupaten") || t.includes("kota")) return "warning";
    return "default";
  };

  const getPeringkatLabel = (peringkat: number | null) => {
    if (!peringkat) return "-";
    if (peringkat === 1) return "Juara 1";
    if (peringkat === 2) return "Juara 2";
    if (peringkat === 3) return "Juara 3";
    return `Peringkat ${peringkat}`;
  };

  const getPeringkatColor = (peringkat: number | null): "warning" | "default" | "secondary" | "success" => {
    if (!peringkat) return "default";
    if (peringkat === 1) return "warning"; // gold
    if (peringkat === 2) return "default"; // silver
    if (peringkat === 3) return "success"; // bronze
    return "secondary";
  };

  const columns: Column<PrestasiListItem>[] = [
    {
      key: "thn_prestasi",
      label: "TAHUN",
      sortable: true,
      width: "80px",
      render: (item) => (
        <div className="text-center">
          <span className="font-semibold text-gray-900 dark:text-white">
            {item.thn_prestasi}
          </span>
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
      key: "nm_prestasi",
      label: "PRESTASI",
      sortable: true,
      render: (item) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900 dark:text-white line-clamp-2">
            {item.nm_prestasi}
          </div>
          {item.nama_jenis_prestasi && (
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
              {item.nama_jenis_prestasi}
            </div>
          )}
          {item.penyelenggara && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
              Penyelenggara: {item.penyelenggara}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "nama_tingkat_prestasi",
      label: "TINGKAT",
      sortable: true,
      width: "140px",
      render: (item) => (
        <Chip
          size="sm"
          color={getTingkatColor(item.nama_tingkat_prestasi)}
          variant="flat"
          className="capitalize"
        >
          {item.nama_tingkat_prestasi || "-"}
        </Chip>
      ),
    },
    {
      key: "peringkat",
      label: "PERINGKAT",
      sortable: true,
      width: "110px",
      render: (item) => (
        <Chip
          size="sm"
          color={getPeringkatColor(item.peringkat)}
          variant="flat"
          className="font-semibold"
        >
          {getPeringkatLabel(item.peringkat)}
        </Chip>
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
          searchPlaceholder="Cari NIM, nama mahasiswa, atau nama prestasi..."
          defaultRowsPerPage={10}
          filterSlot={
            <div className="flex gap-2 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
                <Select
                  aria-label="Filter Tahun Prestasi"
                  placeholder="Semua Tahun"
                  selectedKeys={filterTahun ? [filterTahun] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFilterTahun(selected || "");
                    setCurrentPage(1);
                  }}
                  classNames={{
                    base: "w-full max-w-[200px]",
                    trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm",
                    value: "text-[10px] font-medium text-gray-700 dark:text-gray-300",
                    innerWrapper: "!bg-white dark:!bg-gray-800 pr-8",
                    popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[150px]",
                    listbox: "!bg-white dark:!bg-gray-800",
                    selectorIcon: "right-2",
                  }}
                  size="sm"
                  variant="bordered"
                >
                  {tahunOptions.map((tahun) => (
                    <SelectItem key={tahun.tahun_prestasi.toString()} textValue={`Tahun ${tahun.tahun_prestasi}`}>
                      <span className="text-xs">{tahun.tahun_prestasi}</span>
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
                    setFilterTahun("");
                    setCurrentPage(1);
                  }}
                  className="h-10 px-3 text-[10px] whitespace-nowrap bg-white hover:bg-gray-100 border border-gray-200"
                  isDisabled={filterTahun === ""}
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
