"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button } from "@heroui/react";
import { feederClient } from "@/lib/api/feederClient";

interface NilaiKonversiListItem {
  id: string;
  jenis_konversi: string;
  id_reg_pd: string | null;
  nim: string | null;
  nama_mahasiswa: string | null;
  nama_prodi: string | null;
  nama_jenjang: string | null;
  id_mk: string;
  kode_mk: string | null;
  nama_mk: string | null;
  sks_mk: number | null;
  nilai_angka: number | null;
  nilai_huruf: string | null;
  nilai_indeks: number | null;
  kode_mk_asal: string | null;
  nama_mk_asal: string | null;
  sks_asal: number | null;
  nilai_huruf_asal: string | null;
  nama_pt_asal: string | null;
  id_semester: string | null;
  nama_semester: string | null;
  id_akt_mhs: string | null;
  nama_aktivitas: string | null;
  last_sync: string;
}

interface ProdiOption {
  id_sms: string;
  nama_prodi: string;
  kode_prodi: string;
  nm_jenj_didik: string;
}

interface SemesterOption {
  id_smt: string;
  nm_smt: string;
  a_periode_aktif: number;
}

interface FeederNilaiKonversiTableProps {
  onFilterChange?: (filters: { id_semester?: string[]; id_prodi?: string }) => void;
}

export default function FeederNilaiKonversiTable({ onFilterChange }: FeederNilaiKonversiTableProps) {
  const [data, setData] = useState<NilaiKonversiListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterSemester, setFilterSemester] = useState<string[]>([]);
  const [filterProdi, setFilterProdi] = useState<string>("");
  const [filterJenis, setFilterJenis] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Options for filters
  const [semesterOptions, setSemesterOptions] = useState<SemesterOption[]>([]);
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
        // Load semester list from API
        const semesterRes = await feederClient.get("/nilai-konversi/helper/semester");
        if (semesterRes.data.success) {
          setSemesterOptions(semesterRes.data.data || []);
        }

        // Load prodi list
        const prodiRes = await feederClient.get("/nilai-konversi/helper/prodi");
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

        if (filterSemester.length > 0) {
          params.append("id_semester", filterSemester.join(","));
        }

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        if (filterProdi) {
          params.append("id_prodi", filterProdi);
        }

        if (filterJenis) {
          params.append("jenis_konversi", filterJenis);
        }

        if (sortBy) {
          params.append("sort_by", sortBy);
          params.append("sort_order", sortOrder);
        }

        const response = await feederClient.get(`/nilai-konversi?${params.toString()}`);

        if (response.data.success) {
          setData(response.data.data.data || []);
          setTotalRecords(response.data.data.total || 0);
        }
      } catch (error) {
        console.error('Error loading nilai konversi:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterSemester, filterProdi, filterJenis, sortBy, sortOrder]);

  // Notify parent about filter changes for sync
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        id_semester: filterSemester.length > 0 ? filterSemester : undefined,
        id_prodi: filterProdi || undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterProdi, filterSemester]);

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

  const getJenisColor = (jenis: string) => {
    if (jenis === "konversi") return "secondary";
    if (jenis === "transfer") return "warning";
    return "default";
  };

  const columns: Column<NilaiKonversiListItem>[] = [
    {
      key: "jenis_konversi",
      label: "JENIS",
      sortable: true,
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          color={getJenisColor(item.jenis_konversi)}
          variant="flat"
          className="capitalize"
        >
          {item.jenis_konversi}
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
          {item.jenis_konversi === "transfer" && item.nama_mk_asal && (
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-0.5 line-clamp-1">
              Asal: {item.nama_mk_asal} ({item.kode_mk_asal})
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
          {item.jenis_konversi === "transfer" && item.nilai_huruf_asal && (
            <div className="text-xs text-orange-600 dark:text-orange-400">
              Asal: {item.nilai_huruf_asal}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "id_semester",
      label: "SEMESTER",
      sortable: true,
      width: "150px",
      render: (item) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">
            {item.nama_semester || item.id_semester || "-"}
          </div>
          {item.id_semester && item.nama_semester && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {item.id_semester}
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
          searchPlaceholder="Cari NIM, nama mahasiswa, atau mata kuliah..."
          defaultRowsPerPage={10}
          filterSlot={
            <div className="flex gap-2 w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                <Select
                  aria-label="Filter Semester"
                  placeholder="Semua Semester"
                  selectionMode="multiple"
                  selectedKeys={new Set(filterSemester)}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys) as string[];
                    setFilterSemester(selected);
                    setCurrentPage(1);
                  }}
                  classNames={{
                    base: "w-full",
                    trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm",
                    value: "text-[10px] font-medium text-gray-700 dark:text-gray-300",
                    innerWrapper: "!bg-white dark:!bg-gray-800 pr-8",
                    popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[200px]",
                    listbox: "!bg-white dark:!bg-gray-800",
                    selectorIcon: "right-2",
                  }}
                  size="sm"
                  variant="bordered"
                  renderValue={(items) => {
                    if (!items || items.length === 0) return <span className="text-[10px]">Semua Semester</span>;
                    const count = Array.from(items).length;
                    if (count === semesterOptions.length) return <span className="text-[10px]">Semua Semester</span>;
                    return <span className="text-[10px]">{count} Semester</span>;
                  }}
                >
                  {semesterOptions.map((sem) => (
                    <SelectItem key={sem.id_smt} textValue={sem.nm_smt}>
                      <span className="text-xs">{sem.nm_smt}</span>
                    </SelectItem>
                  ))}
                </Select>

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
                        <span className="font-semibold text-blue-600 text-[10px] flex-shrink-0">{prodi.nm_jenj_didik}</span>
                        <span className="text-gray-400 text-[10px]">-</span>
                        <span className="truncate text-[10px]">{prodi.nama_prodi}</span>
                      </div>
                    );
                  }}
                >
                  {prodiOptions.map((prodi) => (
                    <SelectItem key={prodi.id_sms} textValue={`${prodi.nm_jenj_didik} - ${prodi.nama_prodi}`}>
                      <div className="flex items-center gap-2 py-1">
                        <span className="font-semibold text-blue-600 text-xs flex-shrink-0 min-w-[30px]">{prodi.nm_jenj_didik}</span>
                        <span className="text-gray-400">-</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300">{prodi.nama_prodi}</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  aria-label="Filter Jenis"
                  placeholder="Semua Jenis"
                  selectedKeys={filterJenis ? [filterJenis] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFilterJenis(selected || "");
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
                  <SelectItem key="konversi" textValue="Konversi MBKM">
                    <span className="text-xs">Konversi MBKM</span>
                  </SelectItem>
                  <SelectItem key="transfer" textValue="Nilai Transfer">
                    <span className="text-xs">Nilai Transfer</span>
                  </SelectItem>
                </Select>
              </div>

              <div className="flex gap-2 items-center">
                <Button
                  size="sm"
                  variant="flat"
                  color="default"
                  onPress={() => {
                    setFilterSemester([]);
                    setFilterProdi("");
                    setFilterJenis("");
                    setCurrentPage(1);
                  }}
                  className="h-10 px-3 text-[10px] whitespace-nowrap bg-white hover:bg-gray-100 border border-gray-200"
                  isDisabled={filterSemester.length === 0 && filterProdi === "" && filterJenis === ""}
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
