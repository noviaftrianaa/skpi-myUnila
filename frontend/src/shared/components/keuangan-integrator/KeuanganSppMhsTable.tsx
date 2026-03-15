"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button, Input } from "@heroui/react";
import { keuanganClient } from "@/lib/api/keuanganClient";

interface SppMhsItem {
  id_spp_mhs: string;
  id_smt: string;
  npm: string;
  nama_mahasiswa: string;
  nama_prodi: string;
  tgl_bayar: string;
  nominal: number;
  total_tagihan: number;
  jumlah_spi: number;
  jumlah_denda: number;
  jumlah_lainnya: number;
  sisa_tagihan: number;
  kode_pembayaran: string;
  nama_kelas_ukt?: string | null;
  nominal_ukt?: number | null;
  flag_by: string;
  last_sync: string;
}

interface SemesterOption {
  id_smt: string;
  nm_smt: string;
}

interface KeuanganSppMhsTableProps {
  onSemesterChange?: (idSmt: string) => void;
}

export default function KeuanganSppMhsTable({ onSemesterChange }: KeuanganSppMhsTableProps) {
  const [data, setData] = useState<SppMhsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterIdSmt, setFilterIdSmt] = useState<string>(""); // semester filter
  const [semesters, setSemesters] = useState<SemesterOption[]>([]); // available semesters
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Handle sort change
  const handleSortChange = (key: string, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
    setCurrentPage(1);
  };

  // Load available semesters on mount
  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const response = await keuanganClient.get('/spp-mhs/semesters/all');
        if (response.data.success) {
          setSemesters(response.data.data || []);
        }
      } catch (error) {
        console.error('Error loading semesters:', error);
      }
    };
    loadSemesters();
  }, []);

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

        // Semester filter
        if (filterIdSmt) {
          params.append("id_smt", filterIdSmt);
        }

        if (sortBy) {
          params.append("sort_by", sortBy);
          params.append("sort_order", sortOrder);
        }

        const response = await keuanganClient.get(`/spp-mhs?${params.toString()}`);
        console.log('[KeuanganSppMhsTable] API Response:', response.data);

        if (response.data.success) {
          const items = response.data.data || [];
          console.log('[KeuanganSppMhsTable] Setting data:', items.length, 'items, total:', response.data.total);
          setData(items);
          setTotalRecords(response.data.total || 0);
        } else {
          console.warn('[KeuanganSppMhsTable] API returned success=false');
        }
      } catch (error) {
        console.error('Error loading spp mhs:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterIdSmt, sortBy, sortOrder]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns: Column<SppMhsItem>[] = [
    {
      key: "nama_mahasiswa",
      label: "MAHASISWA",
      sortable: true,
      render: (item) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
            {item.nama_mahasiswa}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
            {item.npm}
          </div>
        </div>
      ),
    },
    {
      key: "nama_prodi",
      label: "PROGRAM STUDI",
      sortable: true,
      render: (item) => (
        <div className="max-w-[200px]">
          <div className="text-sm text-gray-900 dark:text-white line-clamp-2">
            {item.nama_prodi}
          </div>
        </div>
      ),
    },
    {
      key: "id_smt",
      label: "SEMESTER",
      sortable: true,
      width: "110px",
      render: (item) => (
        <div className="text-center">
          <span className="font-semibold text-gray-900 dark:text-white">
            {item.id_smt}
          </span>
        </div>
      ),
    },
    {
      key: "nama_kelas_ukt",
      label: "KELAS UKT",
      sortable: false,
      width: "110px",
      render: (item) => (
        <div className="text-center">
          {item.nama_kelas_ukt ? (
            <Chip size="sm" variant="flat" color="primary" className="font-semibold">
              {item.nama_kelas_ukt}
            </Chip>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "nominal",
      label: "NOMINAL UKT",
      sortable: true,
      width: "150px",
      render: (item) => (
        <div className="text-right">
          <div className="font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(item.nominal)}
          </div>
        </div>
      ),
    },
    {
      key: "total_tagihan",
      label: "TOTAL TAGIHAN",
      sortable: true,
      width: "150px",
      render: (item) => (
        <div className="text-right">
          <div className="font-semibold text-gray-900 dark:text-white">
            {item.total_tagihan ? formatCurrency(item.total_tagihan) : "-"}
          </div>
          {item.sisa_tagihan > 0 && (
            <div className="text-xs text-red-500 mt-0.5">
              Sisa: {formatCurrency(item.sisa_tagihan)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "jumlah_spi",
      label: "SPI",
      sortable: true,
      width: "120px",
      render: (item) => (
        <div className="text-right">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {item.jumlah_spi ? formatCurrency(item.jumlah_spi) : "-"}
          </div>
        </div>
      ),
    },
    {
      key: "jumlah_denda",
      label: "DENDA",
      sortable: true,
      width: "120px",
      render: (item) => (
        <div className="text-right">
          <div className={`text-sm ${item.jumlah_denda > 0 ? "text-red-500 font-semibold" : "text-gray-700 dark:text-gray-300"}`}>
            {item.jumlah_denda ? formatCurrency(item.jumlah_denda) : "-"}
          </div>
        </div>
      ),
    },
    {
      key: "jumlah_lainnya",
      label: "LAINNYA",
      sortable: true,
      width: "120px",
      render: (item) => (
        <div className="text-right">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {item.jumlah_lainnya ? formatCurrency(item.jumlah_lainnya) : "-"}
          </div>
        </div>
      ),
    },
    {
      key: "sisa_tagihan",
      label: "SISA",
      sortable: true,
      width: "130px",
      render: (item) => (
        <div className="text-right">
          <div className={`font-semibold ${item.sisa_tagihan > 0 ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
            {formatCurrency(item.sisa_tagihan || 0)}
          </div>
        </div>
      ),
    },
    {
      key: "flag_by",
      label: "STATUS",
      sortable: false,
      width: "100px",
      render: (item) => (
        <div className="text-center">
          <Chip
            size="sm"
            variant="flat"
            color={item.flag_by === "LUNAS" ? "success" : "warning"}
            className="font-semibold"
          >
            {item.flag_by || "-"}
          </Chip>
        </div>
      ),
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      sortable: true,
      width: "120px",
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
          searchPlaceholder="Cari nama/NPM mahasiswa..."
          defaultRowsPerPage={10}
          filterSlot={
            <div className="flex flex-wrap gap-2 w-full">
              {/* Filter Semester */}
              <div className="flex-shrink-0 w-[200px]">
                <Select
                  aria-label="Filter Semester"
                  placeholder="Pilih Semester"
                  selectedKeys={filterIdSmt ? [filterIdSmt] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFilterIdSmt(selected || "");
                    setCurrentPage(1);
                    onSemesterChange?.(selected || "");
                  }}
                  classNames={{
                    base: "w-full",
                    trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-amber-400 focus:border-amber-500 transition-colors shadow-sm",
                    value: "text-[10px] font-medium text-gray-700 dark:text-gray-300",
                    innerWrapper: "!bg-white dark:!bg-gray-800 pr-8",
                    popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[200px]",
                    listbox: "!bg-white dark:!bg-gray-800",
                    selectorIcon: "right-2",
                  }}
                  size="sm"
                  variant="bordered"
                >
                  {semesters.map((sem) => (
                    <SelectItem key={sem.id_smt}>
                      {sem.nm_smt || sem.id_smt}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Reset filter button */}
              <div className="flex items-center flex-shrink-0">
                <Button
                  size="sm"
                  variant="flat"
                  color="default"
                  onPress={() => {
                    setFilterIdSmt("");
                    setCurrentPage(1);
                    onSemesterChange?.("");
                  }}
                  className="h-10 px-3 text-[10px] whitespace-nowrap bg-white hover:bg-gray-100 border border-gray-200"
                  isDisabled={!filterIdSmt}
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
