"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Select, SelectItem, Button } from "@heroui/react";
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
  nama_prodi_sms: string;
  nama_jenjang: string;
  nama_fakultas_sms: string;
  last_sync: string;
}

interface ProdiOption {
  id_sms: string;
  nama_prodi: string;
  nama_jenjang: string;
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
          params.append("id_sms", filterProdi);
        }

        if (sortBy) {
          params.append("sort_by", sortBy);
          params.append("sort_order", sortOrder);
        }

        const response = await keuanganClient.get(`/daftar-ukt?${params.toString()}`);

        if (response.data.success) {
          setData(response.data.data || []);
          setTotalRecords(response.data.total || 0);
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

  const columns: Column<DaftarUktItem>[] = [
    {
      key: "nama_fakultas",
      label: "FAKULTAS",
      sortable: true,
      width: "180px",
      render: (item) => (
        <div className="max-w-[180px]">
          <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
            {item.nama_fakultas_sms}
          </div>
        </div>
      ),
    },
    {
      key: "nama_prodi",
      label: "PROGRAM STUDI",
      sortable: true,
      render: (item) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
            {item.nama_jenjang ? `${item.nama_jenjang} - ` : ""}{item.nama_prodi_sms}
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

  const hasActiveFilter = filterTahun || filterProdi;

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
          searchPlaceholder="Cari nama prodi/fakultas..."
          defaultRowsPerPage={10}
          filterSlot={
            <div className="flex items-center gap-2">
              {/* Filter Tahun */}
              <Select
                aria-label="Filter Tahun"
                placeholder="Tahun"
                selectedKeys={filterTahun ? [filterTahun] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setFilterTahun(selected || "");
                  setCurrentPage(1);
                }}
                classNames={{
                  base: "w-[90px] flex-shrink-0",
                  trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-emerald-400 focus:border-emerald-500 transition-colors shadow-sm",
                  value: "text-[10px] font-medium text-gray-700 dark:text-gray-300",
                  innerWrapper: "!bg-white dark:!bg-gray-800 pr-8",
                  popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[120px]",
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

              {/* Filter Prodi */}
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
                  base: "flex-1 min-w-0",
                  trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-emerald-400 focus:border-emerald-500 transition-colors shadow-sm",
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
                  const prodi = prodiOptions.find(p => p.id_sms === String(item.key));
                  if (!prodi) return <span className="text-[10px]">Semua Prodi</span>;
                  return (
                    <div className="flex items-center gap-1 overflow-hidden">
                      <span className="font-semibold text-emerald-600 text-[10px] flex-shrink-0">{prodi.nama_jenjang}</span>
                      <span className="text-gray-400 text-[10px]">-</span>
                      <span className="truncate text-[10px]">{prodi.nama_prodi}</span>
                    </div>
                  );
                }}
              >
                {prodiOptions.map((prodi) => (
                  <SelectItem
                    key={prodi.id_sms}
                    textValue={`${prodi.nama_jenjang} - ${prodi.nama_prodi}`}
                  >
                    <div className="flex items-center gap-2 py-1">
                      <span className="font-semibold text-emerald-600 text-xs flex-shrink-0 min-w-[50px]">{prodi.nama_jenjang}</span>
                      <span className="text-gray-400">-</span>
                      <span className="text-xs text-gray-700 dark:text-gray-300">{prodi.nama_prodi}</span>
                    </div>
                  </SelectItem>
                ))}
              </Select>

              {/* Reset filter button - only show when filter active */}
              {hasActiveFilter && (
                <Button
                  size="sm"
                  variant="flat"
                  color="default"
                  isIconOnly
                  onPress={() => {
                    setFilterTahun("");
                    setFilterProdi("");
                    setCurrentPage(1);
                  }}
                  className="h-10 w-10 flex-shrink-0 bg-white hover:bg-gray-100 border border-gray-200"
                  title="Reset Filter"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
            </div>
          }
        />
      </motion.div>
    </motion.div>
  );
}
