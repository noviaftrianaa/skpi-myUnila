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

export default function KeuanganSppMhsTable() {
  const [data, setData] = useState<SppMhsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterNpm, setFilterNpm] = useState<string>("");
  const [filterSemester, setFilterSemester] = useState<string>("");
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

        if (filterNpm) {
          params.append("npm", filterNpm);
        }

        if (filterSemester) {
          params.append("id_smt", filterSemester);
        }

        if (sortBy) {
          params.append("sort_by", sortBy);
          params.append("sort_order", sortOrder);
        }

        const response = await keuanganClient.get(`/spp-mhs?${params.toString()}`);

        if (response.data.success) {
          setData(response.data.data || []);
          setTotalRecords(response.data.total || 0);
        }
      } catch (error) {
        console.error('Error loading spp mhs:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterNpm, filterSemester, sortBy, sortOrder]);

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
              {/* Filter NPM */}
              <div className="flex-1 min-w-[150px] max-w-[200px]">
                <Input
                  aria-label="Filter NPM"
                  placeholder="Filter NPM"
                  value={filterNpm}
                  onValueChange={(value) => {
                    setFilterNpm(value);
                    setCurrentPage(1);
                  }}
                  classNames={{
                    base: "w-full",
                    inputWrapper: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-amber-400 focus:border-amber-500 transition-colors shadow-sm",
                    input: "text-xs font-medium text-gray-700 dark:text-gray-300",
                  }}
                  size="sm"
                  variant="bordered"
                />
              </div>

              {/* Filter Semester */}
              <div className="flex-1 min-w-[150px] max-w-[180px]">
                <Input
                  aria-label="Filter Semester"
                  placeholder="Filter Semester (cth: 20241)"
                  value={filterSemester}
                  onValueChange={(value) => {
                    setFilterSemester(value);
                    setCurrentPage(1);
                  }}
                  classNames={{
                    base: "w-full",
                    inputWrapper: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-amber-400 focus:border-amber-500 transition-colors shadow-sm",
                    input: "text-xs font-medium text-gray-700 dark:text-gray-300",
                  }}
                  size="sm"
                  variant="bordered"
                />
              </div>

              {/* Reset filter button */}
              <div className="flex items-center">
                <Button
                  size="sm"
                  variant="flat"
                  color="default"
                  onPress={() => {
                    setFilterNpm("");
                    setFilterSemester("");
                    setCurrentPage(1);
                  }}
                  className="h-10 px-3 text-xs whitespace-nowrap bg-white hover:bg-gray-100 border border-gray-200"
                  isDisabled={!filterNpm && !filterSemester}
                >
                  Reset
                </Button>
              </div>
            </div>
          }
        />
      </motion.div>
    </motion.div>
  );
}
