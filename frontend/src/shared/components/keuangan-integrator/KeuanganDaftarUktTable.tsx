"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button } from "@heroui/react";
import { keuanganClient } from "@/lib/api/keuanganClient";

interface DaftarUktItem {
  id_daftar_ukt: string;
  id_prodi_simpedam: string;
  nama_prodi: string;
  tahun: number;
  kode_fakultas: string;
  nama_fakultas: string;
  kode_kelas: string;
  nama_kelas: string;
  nominal: number;
  kode_strata: number;
  id_sms: string | null;
  id_jenj_didik: number | null;
  nama_prodi_myunila?: string | null;
  nama_jenjang?: string | null;
  is_mapped?: number;
  last_sync: string;
}

interface ProdiOption {
  id_prodi_simpedam: string;
  nama_prodi: string;
}

export default function KeuanganDaftarUktTable() {
  const [data, setData] = useState<DaftarUktItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterTahun, setFilterTahun] = useState<string>("");
  const [filterProdi, setFilterProdi] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Options for filters
  const [prodiOptions, setProdiOptions] = useState<ProdiOption[]>([]);

  // Generate tahun options (current year to 5 years back)
  const currentYear = new Date().getFullYear();
  const tahunOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

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
        const prodiRes = await keuanganClient.get("/daftar-ukt/prodi");
        if (prodiRes.data.success) {
          setProdiOptions(prodiRes.data.data || []);
        }
      } catch (error) {
        console.error('Error loading options:', error);
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
          params.append("tahun", filterTahun);
        }

        if (filterProdi) {
          params.append("id_prodi_simpedam", filterProdi);
        }

        if (sortBy) {
          params.append("sort_by", sortBy);
          params.append("sort_order", sortOrder);
        }

        const response = await keuanganClient.get(`/daftar-ukt?${params.toString()}`);

        if (response.data.success) {
          setData(response.data.data.data || []);
          setTotalRecords(response.data.data.total || 0);
        }
      } catch (error) {
        console.error('Error loading daftar ukt:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterTahun, filterProdi, sortBy, sortOrder]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStrataLabel = (kode: number) => {
    switch (kode) {
      case 3:
        return "D3";
      case 4:
        return "S1 Reg";
      case 7:
        return "S1 Non-Reg";
      default:
        return `Kode ${kode}`;
    }
  };

  const getStrataColor = (kode: number): "primary" | "success" | "warning" | "default" => {
    switch (kode) {
      case 3:
        return "warning";
      case 4:
        return "success";
      case 7:
        return "primary";
      default:
        return "default";
    }
  };

  const columns: Column<DaftarUktItem>[] = [
    {
      key: "nama_prodi",
      label: "PROGRAM STUDI",
      sortable: true,
      render: (item) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
            {item.nama_prodi}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {item.nama_fakultas}
          </div>
        </div>
      ),
    },
    {
      key: "tahun",
      label: "TAHUN",
      sortable: true,
      width: "90px",
      render: (item) => (
        <div className="text-center">
          <span className="font-semibold text-gray-900 dark:text-white">
            {item.tahun}
          </span>
        </div>
      ),
    },
    {
      key: "kode_strata",
      label: "JENJANG",
      sortable: true,
      width: "110px",
      render: (item) => (
        <div className="flex items-center justify-center">
          <Chip
            size="sm"
            variant="flat"
            color={getStrataColor(item.kode_strata)}
            className="font-semibold"
          >
            {getStrataLabel(item.kode_strata)}
          </Chip>
        </div>
      ),
    },
    {
      key: "nama_kelas",
      label: "KELAS UKT",
      sortable: true,
      width: "110px",
      render: (item) => (
        <div className="text-center">
          <div className="font-semibold text-blue-600 dark:text-blue-400">
            {item.nama_kelas}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {item.kode_kelas}
          </div>
        </div>
      ),
    },
    {
      key: "nominal",
      label: "NOMINAL",
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
      key: "is_mapped",
      label: "MAPPING",
      sortable: false,
      width: "120px",
      render: (item) => (
        <div className="flex flex-col gap-1">
          <Chip
            size="sm"
            variant="flat"
            color={item.id_sms ? "success" : "warning"}
            className="text-xs"
          >
            {item.id_sms ? "Mapped" : "Unmapped"}
          </Chip>
          {item.nama_prodi_myunila && (
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]" title={item.nama_prodi_myunila}>
              {item.nama_prodi_myunila}
            </span>
          )}
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
          searchPlaceholder="Cari nama prodi..."
          defaultRowsPerPage={10}
          filterSlot={
            <div className="flex flex-wrap gap-2 w-full">
              {/* Filter Tahun */}
              <div className="flex-1 min-w-[120px] max-w-[150px]">
                <Select
                  aria-label="Filter Tahun"
                  placeholder="Semua Tahun"
                  selectedKeys={filterTahun ? [filterTahun] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFilterTahun(selected || "");
                    setCurrentPage(1);
                  }}
                  classNames={{
                    base: "w-full",
                    trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-emerald-400 focus:border-emerald-500 transition-colors shadow-sm",
                    value: "text-xs font-medium text-gray-700 dark:text-gray-300",
                    innerWrapper: "!bg-white dark:!bg-gray-800 pr-8",
                    popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200",
                    listbox: "!bg-white dark:!bg-gray-800",
                    selectorIcon: "right-2",
                  }}
                  size="sm"
                  variant="bordered"
                >
                  {tahunOptions.map((tahun) => (
                    <SelectItem key={tahun.toString()}>
                      {tahun.toString()}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Filter Prodi */}
              <div className="flex-1 min-w-[200px]">
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
                    trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-emerald-400 focus:border-emerald-500 transition-colors shadow-sm",
                    value: "text-xs font-medium text-gray-700 dark:text-gray-300",
                    innerWrapper: "!bg-white dark:!bg-gray-800 pr-8",
                    popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[300px]",
                    listbox: "!bg-white dark:!bg-gray-800",
                    selectorIcon: "right-2",
                  }}
                  size="sm"
                  variant="bordered"
                >
                  {prodiOptions.map((prodi) => (
                    <SelectItem key={prodi.id_prodi_simpedam} textValue={prodi.nama_prodi}>
                      <div className="flex items-center gap-2 py-1">
                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{prodi.nama_prodi}</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Reset filter button */}
              <div className="flex items-center">
                <Button
                  size="sm"
                  variant="flat"
                  color="default"
                  onPress={() => {
                    setFilterTahun("");
                    setFilterProdi("");
                    setCurrentPage(1);
                  }}
                  className="h-10 px-3 text-xs whitespace-nowrap bg-white hover:bg-gray-100 border border-gray-200"
                  isDisabled={!filterTahun && !filterProdi}
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
