"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button } from "@heroui/react";
import { feederClient } from "@/lib/api/feederClient";

interface AktivitasListItem {
  id_akt_mhs: string;
  judul_akt_mhs: string;
  nama_jenis_aktivitas: string | null;
  id_semester: string;
  nama_semester: string | null;
  lokasi_kegiatan: string | null;
  sk_tugas: string | null;
  tgl_sk_tugas: string | null;
  a_komunal: number;
  jumlah_anggota: number;
  last_sync: string;
  id_prodi: string;
  nama_prodi: string | null;
  nama_jenjang: string | null;
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

interface JenisAktivitasOption {
  id_jns_akt_mhs: number;
  nm_jns_akt_mhs: string;
}

interface FeederAktivitasMahasiswaTableProps {
  onFilterChange?: (filters: { id_semester?: string[]; id_prodi?: string; id_jenis_aktivitas?: number }) => void;
}

export default function FeederAktivitasMahasiswaTable({ onFilterChange }: FeederAktivitasMahasiswaTableProps) {
  const [data, setData] = useState<AktivitasListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterSemester, setFilterSemester] = useState<string[]>([]); // Default: all semesters (no filter)
  const [filterProdi, setFilterProdi] = useState<string>("");
  const [filterJenisAktivitas, setFilterJenisAktivitas] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Options for filters
  const [semesterOptions, setSemesterOptions] = useState<SemesterOption[]>([]);
  const [prodiOptions, setProdiOptions] = useState<ProdiOption[]>([]);
  const [jenisAktivitasOptions, setJenisAktivitasOptions] = useState<JenisAktivitasOption[]>([]);

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
        const semesterRes = await feederClient.get("/aktivitas-mahasiswa/semester");
        if (semesterRes.data.success) {
          setSemesterOptions(semesterRes.data.data);
        }

        // Load prodi list
        const prodiRes = await feederClient.get("/aktivitas-mahasiswa/prodi");
        if (prodiRes.data.success) {
          setProdiOptions(prodiRes.data.data);
        }

        // Load jenis aktivitas list
        const jenisAktivitasRes = await feederClient.get("/aktivitas-mahasiswa/jenis");
        if (jenisAktivitasRes.data.success) {
          setJenisAktivitasOptions(jenisAktivitasRes.data.data);
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
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Load data when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: rowsPerPage.toString(),
          _t: Date.now().toString(), // Cache busting
        });

        // Add semester filter only if selected
        if (filterSemester.length > 0) {
          params.append("id_semester", filterSemester.join(","));
        }

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        if (filterProdi) {
          params.append("id_prodi", filterProdi);
        }

        if (filterJenisAktivitas) {
          params.append("id_jenis_aktivitas", filterJenisAktivitas);
        }

        if (sortBy) {
          params.append("sort_by", sortBy);
          params.append("sort_order", sortOrder);
        }

        const response = await feederClient.get(`/aktivitas-mahasiswa?${params.toString()}`);

        if (response.data.success) {
          setData(response.data.data.data || []);
          setTotalRecords(response.data.data.total || 0);
        }
      } catch (error) {
        console.error('Error loading aktivitas:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterSemester, filterProdi, filterJenisAktivitas, sortBy, sortOrder]);

  // Notify parent about filter changes for sync
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        id_semester: filterSemester.length > 0 ? filterSemester : undefined,
        id_prodi: filterProdi || undefined,
        id_jenis_aktivitas: filterJenisAktivitas ? parseInt(filterJenisAktivitas) : undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterProdi, filterSemester, filterJenisAktivitas]);

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

  const columns: Column<AktivitasListItem>[] = [
    {
      key: "judul_akt_mhs",
      label: "JUDUL AKTIVITAS",
      sortable: true,
      render: (item) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900 dark:text-white line-clamp-2">
            {item.judul_akt_mhs}
          </div>
          {item.lokasi_kegiatan && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              📍 {item.lokasi_kegiatan}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "jenis_aktivitas",
      label: "JENIS AKTIVITAS",
      sortable: true,
      width: "180px",
      render: (item) => (
        <Chip size="sm" variant="flat" color="primary" className="font-medium">
          {item.nama_jenis_aktivitas || "-"}
        </Chip>
      ),
    },
    {
      key: "id_semester",
      label: "SEMESTER",
      sortable: true,
      width: "180px",
      render: (item) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">
            {item.nama_semester || item.id_semester}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {item.id_semester}
          </div>
        </div>
      ),
    },
    {
      key: "nama_prodi",
      label: "PROGRAM STUDI",
      sortable: false,
      render: (item) => (
        <div className="text-sm max-w-xs">
          <div className="font-medium text-gray-900 dark:text-white line-clamp-1">
            {item.nama_prodi || "-"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {item.nama_jenjang || ""}
          </div>
        </div>
      ),
    },
    {
      key: "jumlah_anggota",
      label: "ANGGOTA",
      sortable: false,
      width: "100px",
      render: (item) => (
        <div className="flex items-center justify-center">
          <Chip
            size="sm"
            variant="flat"
            color={item.jumlah_anggota > 0 ? "success" : "default"}
            className="font-semibold"
          >
            {item.jumlah_anggota} orang
          </Chip>
        </div>
      ),
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      sortable: true,
      width: "130px",
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
          searchPlaceholder="Cari judul aktivitas..."
          defaultRowsPerPage={10}
          filterSlot={
            <div className="flex gap-2 w-full">
              {/* Filter dropdowns */}
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
                  aria-label="Filter Jenis Aktivitas"
                  placeholder="Semua Jenis"
                  selectedKeys={filterJenisAktivitas ? [filterJenisAktivitas] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setFilterJenisAktivitas(selected || "");
                    setCurrentPage(1);
                  }}
                  classNames={{
                    base: "w-full",
                    trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm",
                    value: "text-[10px] font-medium text-gray-700 dark:text-gray-300",
                    innerWrapper: "!bg-white dark:!bg-gray-800 pr-8",
                    popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[250px]",
                    listbox: "!bg-white dark:!bg-gray-800",
                    selectorIcon: "right-2",
                  }}
                  size="sm"
                  variant="bordered"
                  renderValue={(items) => {
                    if (!items || items.length === 0) return <span className="text-[10px]">Semua Jenis</span>;
                    const item = items[0];
                    const jenis = jenisAktivitasOptions.find(j => j.id_jns_akt_mhs.toString() === item.key);
                    if (!jenis) return <span className="text-[10px]">Semua Jenis</span>;
                    return <span className="text-[10px] truncate">{jenis.nm_jns_akt_mhs}</span>;
                  }}
                >
                  {jenisAktivitasOptions.map((jenis) => (
                    <SelectItem key={jenis.id_jns_akt_mhs.toString()} textValue={jenis.nm_jns_akt_mhs}>
                      <span className="text-xs">{jenis.nm_jns_akt_mhs}</span>
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
              </div>

              {/* Reset filter button */}
              <div className="flex gap-2 items-center">
                <Button
                  size="sm"
                  variant="flat"
                  color="default"
                  onPress={() => {
                    setFilterSemester([]);
                    setFilterProdi("");
                    setFilterJenisAktivitas("");
                    setCurrentPage(1);
                  }}
                  className="h-10 px-3 text-[10px] whitespace-nowrap bg-white hover:bg-gray-100 border border-gray-200"
                  isDisabled={filterSemester.length === 0 && filterProdi === "" && filterJenisAktivitas === ""}
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
