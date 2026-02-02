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
  kode_pembayaran: string;
  nama_kelas_ukt?: string | null;
  nominal_ukt?: number | null;
  last_sync: string;
}

// Semester type options
const semesterTypeOptions = [
  { key: "", label: "Semua Semester" },
  { key: "ganjil", label: "Ganjil (1)" },
  { key: "genap", label: "Genap (2)" },
];

export default function KeuanganSppMhsTable() {
  const [data, setData] = useState<SppMhsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterSemesterType, setFilterSemesterType] = useState<string>(""); // ganjil/genap
  const [filterIdSmt, setFilterIdSmt] = useState<string>(""); // specific id_smt like "20241"
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

        // Semester type filter (ganjil/genap)
        if (filterSemesterType) {
          params.append("semester_type", filterSemesterType);
        }

        // Specific semester id filter (e.g., "20241")
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
  }, [currentPage, rowsPerPage, searchQuery, filterSemesterType, filterIdSmt, sortBy, sortOrder]);

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
      label: "NOMINAL BAYAR",
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
      key: "tgl_bayar",
      label: "TGL BAYAR",
      sortable: true,
      width: "120px",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(item.tgl_bayar)}
        </div>
      ),
    },
    {
      key: "kode_pembayaran",
      label: "KODE",
      sortable: false,
      width: "100px",
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          {item.kode_pembayaran || "-"}
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
              {/* Filter Semester Type (Ganjil/Genap) */}
              <div className="flex-shrink-0 w-[130px]">
                <Select
                  aria-label="Filter Tipe Semester"
                  placeholder="Tipe Semester"
                  selectedKeys={filterSemesterType ? [filterSemesterType] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFilterSemesterType(selected || "");
                    setCurrentPage(1);
                  }}
                  classNames={{
                    base: "w-full",
                    trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-amber-400 focus:border-amber-500 transition-colors shadow-sm",
                    value: "text-[10px] font-medium text-gray-700 dark:text-gray-300",
                    innerWrapper: "!bg-white dark:!bg-gray-800 pr-8",
                    popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[150px]",
                    listbox: "!bg-white dark:!bg-gray-800",
                    selectorIcon: "right-2",
                  }}
                  size="sm"
                  variant="bordered"
                >
                  {semesterTypeOptions.filter(opt => opt.key !== "").map((opt) => (
                    <SelectItem key={opt.key}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Filter Specific Semester ID */}
              <div className="flex-shrink-0 w-[120px]">
                <Input
                  aria-label="Filter ID Semester"
                  placeholder="ID Smt (20241)"
                  value={filterIdSmt}
                  onValueChange={(value) => {
                    setFilterIdSmt(value);
                    setCurrentPage(1);
                  }}
                  classNames={{
                    base: "w-full",
                    inputWrapper: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-amber-400 focus:border-amber-500 transition-colors shadow-sm",
                    input: "text-[10px] font-medium text-gray-700 dark:text-gray-300",
                  }}
                  size="sm"
                  variant="bordered"
                />
              </div>

              {/* Reset filter button */}
              <div className="flex items-center flex-shrink-0">
                <Button
                  size="sm"
                  variant="flat"
                  color="default"
                  onPress={() => {
                    setFilterSemesterType("");
                    setFilterIdSmt("");
                    setCurrentPage(1);
                  }}
                  className="h-10 px-3 text-[10px] whitespace-nowrap bg-white hover:bg-gray-100 border border-gray-200"
                  isDisabled={!filterSemesterType && !filterIdSmt}
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
