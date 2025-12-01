"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button } from "@heroui/react";
import { feederClient } from "@/lib/api/feederClient";

interface TranskripNilaiListItem {
  id: string;
  id_reg_pd: string;
  nim: string | null;
  nama_mahasiswa: string | null;
  nama_prodi: string | null;
  nama_jenjang: string | null;
  id_mk: string;
  kode_mk: string | null;
  nama_mk: string | null;
  sks_mk: number;
  nilai_angka: number | null;
  nilai_huruf: string | null;
  nilai_indeks: number | null;
  smt_ke: number;
  id_kls: string | null;
  nama_kelas: string | null;
  id_konversi_aktivitas: string | null;
  id_ekuivalensi: string | null;
  sumber_nilai: string; // "kelas", "konversi", "transfer"
  last_sync: string;
}

interface ProdiOption {
  id_prodi: string;
  nama_prodi: string;
  kode_prodi: string;
  nama_jenjang: string;
}

interface SemesterOption {
  id_semester: string;
  nama_semester: string;
}

interface FeederTranskripNilaiTableProps {
  onFilterChange?: (filters: { id_semester?: string[]; id_prodi?: string }) => void;
}

export default function FeederTranskripNilaiTable({ onFilterChange }: FeederTranskripNilaiTableProps) {
  const [data, setData] = useState<TranskripNilaiListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterProdi, setFilterProdi] = useState<string>("");
  const [filterSumber, setFilterSumber] = useState<string>("");
  const [filterSmtKe, setFilterSmtKe] = useState<string>("");
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
        // Load prodi list
        const prodiRes = await feederClient.get("/transkrip-nilai/helper/prodi");
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

        if (filterProdi) {
          params.append("id_prodi", filterProdi);
        }

        if (filterSumber) {
          params.append("sumber_nilai", filterSumber);
        }

        if (filterSmtKe) {
          params.append("smt_ke", filterSmtKe);
        }

        if (sortBy) {
          params.append("order_by", sortBy);
          params.append("order_dir", sortOrder);
        }

        const response = await feederClient.get(`/transkrip-nilai?${params.toString()}`);

        if (response.data.success) {
          setData(response.data.data || []);
          setTotalRecords(response.data.meta?.total || 0);
        }
      } catch (error) {
        console.error('Error loading transkrip nilai:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterProdi, filterSumber, filterSmtKe, sortBy, sortOrder]);

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

  const getNilaiColor = (nilaiHuruf: string | null) => {
    if (!nilaiHuruf) return "default";
    const nilai = nilaiHuruf.trim().toUpperCase();
    if (nilai === "A" || nilai === "A-") return "success";
    if (nilai === "B+" || nilai === "B" || nilai === "B-") return "primary";
    if (nilai === "C+" || nilai === "C" || nilai === "C-") return "warning";
    if (nilai === "D" || nilai === "E") return "danger";
    return "default";
  };

  const getSumberColor = (sumber: string) => {
    if (sumber === "kelas") return "primary";
    if (sumber === "konversi") return "secondary";
    if (sumber === "transfer") return "warning";
    return "default";
  };

  const getSumberLabel = (sumber: string) => {
    if (sumber === "kelas") return "Kelas";
    if (sumber === "konversi") return "Konversi";
    if (sumber === "transfer") return "Transfer";
    return sumber;
  };

  const columns: Column<TranskripNilaiListItem>[] = [
    {
      key: "sumber_nilai",
      label: "SUMBER",
      sortable: true,
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          color={getSumberColor(item.sumber_nilai)}
          variant="flat"
          className="capitalize"
        >
          {getSumberLabel(item.sumber_nilai)}
        </Chip>
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
              {item.nama_jenjang} - {item.nama_prodi}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "nama_mk",
      label: "MATA KULIAH",
      sortable: true,
      render: (item) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
            {item.nama_mk || "-"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {item.kode_mk && <span className="mr-2">{item.kode_mk}</span>}
            {item.sks_mk && <span>{item.sks_mk} SKS</span>}
          </div>
          {item.nama_kelas && (
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 line-clamp-1">
              Kelas: {item.nama_kelas}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "nilai_huruf",
      label: "NILAI",
      sortable: true,
      width: "130px",
      render: (item) => (
        <div className="flex flex-col items-center gap-1">
          <Chip
            size="sm"
            color={getNilaiColor(item.nilai_huruf)}
            variant="flat"
            className="font-bold min-w-[40px] justify-center"
          >
            {item.nilai_huruf || "-"}
          </Chip>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {item.nilai_angka != null ? item.nilai_angka.toFixed(1) : "-"}
            {item.nilai_indeks != null && (
              <span className="ml-1">({item.nilai_indeks.toFixed(2)})</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "smt_ke",
      label: "SMT",
      sortable: true,
      width: "70px",
      render: (item) => (
        <div className="text-center">
          <span className="font-semibold text-gray-900 dark:text-white">
            {item.smt_ke || "-"}
          </span>
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

  // Generate semester ke options (1-14)
  const smtKeOptions = Array.from({ length: 14 }, (_, i) => i + 1);

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
          searchPlaceholder="Cari NIM, nama mahasiswa, atau mata kuliah..."
          defaultRowsPerPage={10}
          filterSlot={
            <div className="flex gap-2 w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
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
                    const prodi = prodiOptions.find(p => p.id_prodi === item.key);
                    if (!prodi) return <span className="text-[10px]">Semua Prodi</span>;
                    return (
                      <div className="flex items-center gap-1 overflow-hidden">
                        <span className="font-semibold text-blue-600 text-[10px] flex-shrink-0">{prodi.nama_jenjang}</span>
                        <span className="text-gray-400 text-[10px]">-</span>
                        <span className="truncate text-[10px]">{prodi.nama_prodi}</span>
                      </div>
                    );
                  }}
                >
                  {prodiOptions.map((prodi) => (
                    <SelectItem key={prodi.id_prodi} textValue={`${prodi.nama_jenjang} - ${prodi.nama_prodi}`}>
                      <div className="flex items-center gap-2 py-1">
                        <span className="font-semibold text-blue-600 text-xs flex-shrink-0 min-w-[30px]">{prodi.nama_jenjang}</span>
                        <span className="text-gray-400">-</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300">{prodi.nama_prodi}</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  aria-label="Filter Sumber Nilai"
                  placeholder="Semua Sumber"
                  selectedKeys={filterSumber ? [filterSumber] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFilterSumber(selected || "");
                    setCurrentPage(1);
                  }}
                  classNames={{
                    base: "w-full",
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
                  <SelectItem key="kelas" textValue="Nilai Kelas">
                    <span className="text-xs">Nilai Kelas</span>
                  </SelectItem>
                  <SelectItem key="konversi" textValue="Konversi MBKM">
                    <span className="text-xs">Konversi MBKM</span>
                  </SelectItem>
                  <SelectItem key="transfer" textValue="Nilai Transfer">
                    <span className="text-xs">Nilai Transfer</span>
                  </SelectItem>
                </Select>

                <Select
                  aria-label="Filter Semester Ke"
                  placeholder="Semua Semester"
                  selectedKeys={filterSmtKe ? [filterSmtKe] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFilterSmtKe(selected || "");
                    setCurrentPage(1);
                  }}
                  classNames={{
                    base: "w-full",
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
                  {smtKeOptions.map((smt) => (
                    <SelectItem key={smt.toString()} textValue={`Semester ${smt}`}>
                      <span className="text-xs">Semester {smt}</span>
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
                    setFilterSumber("");
                    setFilterSmtKe("");
                    setCurrentPage(1);
                  }}
                  className="h-10 px-3 text-[10px] whitespace-nowrap bg-white hover:bg-gray-100 border border-gray-200"
                  isDisabled={filterProdi === "" && filterSumber === "" && filterSmtKe === ""}
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
