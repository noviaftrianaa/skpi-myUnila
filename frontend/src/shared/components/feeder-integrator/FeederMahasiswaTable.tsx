"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button } from "@heroui/react";
import { feederClient } from "@/lib/api/feederClient";

interface MahasiswaListItem {
  id_pd: string;
  nama: string;
  npm: string | null;
  angkatan: string | null;
  jalur_masuk: string | null;
  jenis_pendaftaran: string | null;
  semester_sekarang: number | null;
  status_mahasiswa: string | null;
  jenis_keluar: string | null;
  last_sync: string | null;
  id_prodi: string | null;
  nama_prodi: string | null;
  nama_jenjang: string | null;
}

interface AngkatanOption {
  value: string;
  label: string;
  count: number;
}

interface ProdiOption {
  id_sms: string;
  nama_prodi: string;
  kode_prodi: string;
  nm_jenj_didik: string;
}

export default function FeederMahasiswaTable() {
  const [data, setData] = useState<MahasiswaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterAngkatan, setFilterAngkatan] = useState<string[]>([]);
  const [filterProdi, setFilterProdi] = useState<string>("");

  // Options for filters
  const [angkatanOptions, setAngkatanOptions] = useState<AngkatanOption[]>([]);
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
        // Load angkatan list
        const angkatanRes = await feederClient.get("/mahasiswa/helper/angkatan");
        if (angkatanRes.data.success) {
          const options = angkatanRes.data.data.map((year: string) => ({
            value: year,
            label: `Angkatan ${year}`,
            count: 0
          }));
          setAngkatanOptions(options);

          // Default: Semua angkatan (no filter)
          // User can select specific angkatan if needed
        }

        // Load prodi list
        const prodiRes = await feederClient.get("/mahasiswa/helper/prodi");
        if (prodiRes.data.success) {
          setProdiOptions(prodiRes.data.data);
        }
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };
    loadOptions();
  }, []);

  // Load data when filters change
  useEffect(() => {
    // Don't wait for angkatan options - load data immediately
    const loadData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: rowsPerPage.toString(),
        });

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        if (filterAngkatan.length > 0) {
          params.append("angkatan", filterAngkatan.join(","));
        }

        if (filterProdi) {
          params.append("id_prodi", filterProdi);
        }

        const response = await feederClient.get(`/mahasiswa?${params.toString()}`);

        if (response.data.success) {
          setData(response.data.data.data || []);
          setTotalRecords(response.data.data.total || 0);
        }
      } catch (error) {
        console.error('Error loading mahasiswa:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterAngkatan, filterProdi, angkatanOptions]);

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

  const columns: Column<MahasiswaListItem>[] = [
    {
      key: "npm",
      label: "NPM",
      sortable: true,
      width: "140px",
      render: (item) => (
        <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
          {item.npm || "-"}
        </div>
      ),
    },
    {
      key: "nama",
      label: "NAMA MAHASISWA",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {item.nama}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {item.nama_jenjang && `${item.nama_jenjang} - `}{item.nama_prodi || "-"}
          </div>
        </div>
      ),
    },
    {
      key: "angkatan",
      label: "ANGKATAN",
      align: "center",
      width: "120px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color="primary"
        >
          {item.angkatan || "-"}
        </Chip>
      ),
    },
    {
      key: "jenis_pendaftaran",
      label: "JENIS PENDAFTARAN",
      width: "200px",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {item.jenis_pendaftaran || "-"}
        </div>
      ),
    },
    {
      key: "semester_sekarang",
      label: "SEMESTER",
      align: "center",
      width: "110px",
      render: (item) => (
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {item.semester_sekarang ? `Semester ${item.semester_sekarang}` : "-"}
        </div>
      ),
    },
    {
      key: "status_mahasiswa",
      label: "STATUS",
      align: "center",
      width: "130px",
      render: (item) => {
        const status = item.status_mahasiswa?.toUpperCase() || "";
        let color: "success" | "primary" | "warning" | "danger" | "default" = "default";

        // Prioritas warna berdasarkan status
        if (status.includes("AKTIF")) {
          color = "success"; // Hijau untuk aktif
        } else if (status.includes("LULUS")) {
          color = "primary"; // Biru untuk lulus
        } else if (status.includes("CUTI") || status.includes("NON")) {
          color = "warning"; // Orange untuk cuti/non-aktif
        } else if (
          status.includes("KELUAR") ||
          status.includes("DO") ||
          status.includes("DROPOUT") ||
          status.includes("MENGUNDURKAN") ||
          status.includes("MENINGGAL") ||
          status.includes("PUTUS")
        ) {
          color = "danger"; // Merah untuk keluar/DO/meninggal
        }

        return (
          <Chip
            size="sm"
            variant="flat"
            color={color}
          >
            {item.status_mahasiswa || "-"}
          </Chip>
        );
      },
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      align: "center",
      width: "140px",
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.last_sync)}
        </div>
      ),
    },
  ];

  // Filter slot - filters on left, reset buttons on right
  const filterSlot = (
    <div className="flex gap-2 w-full">
      {/* Filter dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
        <Select
          aria-label="Filter Angkatan"
          placeholder="Semua Angkatan"
          selectionMode="multiple"
          selectedKeys={new Set(filterAngkatan)}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys) as string[];
            setFilterAngkatan(selected);
            setCurrentPage(1);
          }}
          classNames={{
            base: "w-full",
            trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm",
            value: "text-[10px] font-medium text-gray-700 dark:text-gray-300",
            innerWrapper: "!bg-white dark:!bg-gray-800 pr-8",
            popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[180px]",
            listbox: "!bg-white dark:!bg-gray-800",
            selectorIcon: "right-2",
          }}
          size="sm"
          variant="bordered"
          renderValue={(items) => {
            if (!items || items.length === 0) return <span className="text-[10px]">Semua Angkatan</span>;
            const count = Array.from(items).length;
            if (count === angkatanOptions.length) return <span className="text-[10px]">Semua Angkatan</span>;
            return <span className="text-[10px]">{count} Angkatan</span>;
          }}
        >
          {angkatanOptions.map((option) => (
            <SelectItem key={option.value} textValue={option.label}>
              <span className="text-xs">{option.label}</span>
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

      {/* Reset filter buttons - beside search */}
      <div className="flex gap-2 items-center">
        <Button
          size="sm"
          variant="flat"
          color="default"
          onPress={() => {
            setFilterAngkatan([]);
            setFilterProdi("");
            setCurrentPage(1);
          }}
          className="h-10 px-3 text-[10px] whitespace-nowrap bg-white hover:bg-gray-100 border border-gray-200"
          isDisabled={filterAngkatan.length === 0 && filterProdi === ""}
        >
          Reset Filter
        </Button>
      </div>
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <DataTable
          data={data}
          columns={columns}
          searchable={true}
          searchPlaceholder="Cari nama, NPM mahasiswa..."
          loading={loading}
          serverSide={true}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(size) => {
            setRowsPerPage(size);
            setCurrentPage(1);
          }}
          onSearchChange={setSearchQuery}
          filterSlot={filterSlot}
          emptyMessage={
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                Tidak ada data mahasiswa
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Coba ubah filter atau lakukan sinkronisasi
              </p>
            </div>
          }
        />
      </motion.div>
    </motion.div>
  );
}
