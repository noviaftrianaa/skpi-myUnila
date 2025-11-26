"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Chip, Select, SelectItem, Button } from "@heroui/react";
import { feederClient } from "@/lib/api/feederClient";

interface RencanaEvaluasiListItem {
  id_re_mk: string;
  id_jns_eval: number | null;
  id_mk: string | null;
  no_urut: number | null;
  komponen_evaluasi: string | null;
  bobot_evaluasi: number | null;
  desk_indo: string | null;
  desk_ing: string | null;
  kode_matkul: string | null;
  nama_matkul: string | null;
  sks_matkul: number | null;
  jenis_evaluasi: string | null;
  last_sync: string | null;
}

interface ProdiOption {
  id_sms: string;
  nama_prodi: string;
  kode_prodi: string | null;
  nm_jenj_didik: string | null;
}

interface FeederRencanaEvaluasiTableProps {
  onFilterChange?: (filters: { id_matkul?: string; id_prodi?: string }) => void;
}

export default function FeederRencanaEvaluasiTable({ onFilterChange }: FeederRencanaEvaluasiTableProps) {
  const [data, setData] = useState<RencanaEvaluasiListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterMatkul, setFilterMatkul] = useState<string>("");
  const [filterProdi, setFilterProdi] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("no_urut");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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
        const prodiRes = await feederClient.get("/rencana-evaluasi/helper/prodi");
        if (prodiRes.data.success) {
          setProdiOptions(prodiRes.data.data);
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
        });

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        if (filterProdi) {
          params.append("id_prodi", filterProdi);
        }

        if (filterMatkul) {
          params.append("id_matkul", filterMatkul);
        }

        if (sortBy) {
          params.append("sort_by", sortBy);
          params.append("sort_order", sortOrder);
        }

        const response = await feederClient.get(`/rencana-evaluasi?${params.toString()}`);

        if (response.data.success) {
          setData(response.data.data.data || []);
          setTotalRecords(response.data.data.total || 0);
        }
      } catch (error) {
        console.error('Error loading rencana evaluasi:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterProdi, filterMatkul, sortBy, sortOrder]);

  // Notify parent about filter changes for sync
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        id_matkul: filterMatkul || undefined,
        id_prodi: filterProdi || undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMatkul, filterProdi]);

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

  const columns: Column<RencanaEvaluasiListItem>[] = [
    {
      key: "kode_matkul",
      label: "MATA KULIAH",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white text-sm">
            {item.nama_matkul || "-"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
            <span className="font-mono">{item.kode_matkul || "-"}</span>
            {item.sks_matkul && (
              <Chip size="sm" variant="flat" color="primary" className="text-[10px] px-1 py-0 h-4">
                {item.sks_matkul} SKS
              </Chip>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "jenis_evaluasi",
      label: "JENIS EVALUASI",
      align: "center",
      width: "160px",
      render: (item) => {
        let color: "success" | "primary" | "warning" | "danger" | "default" = "default";
        const jenis = item.jenis_evaluasi?.toUpperCase() || "";

        if (jenis.includes("TUGAS")) color = "primary";
        else if (jenis.includes("QUIZ") || jenis.includes("KUIS")) color = "success";
        else if (jenis.includes("UTS")) color = "warning";
        else if (jenis.includes("UAS")) color = "danger";

        return (
          <Chip
            size="sm"
            variant="flat"
            color={color}
          >
            {item.jenis_evaluasi || "-"}
          </Chip>
        );
      },
    },
    {
      key: "komponen_evaluasi",
      label: "KOMPONEN EVALUASI",
      sortable: true,
      width: "220px",
      render: (item) => (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {item.komponen_evaluasi || "-"}
        </div>
      ),
    },
    {
      key: "bobot_evaluasi",
      label: "BOBOT",
      align: "center",
      width: "100px",
      sortable: true,
      render: (item) => (
        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          {item.bobot_evaluasi ? `${item.bobot_evaluasi}%` : "-"}
        </div>
      ),
    },
    {
      key: "desk_indo",
      label: "DESKRIPSI",
      width: "280px",
      render: (item) => (
        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
          {item.desk_indo || "-"}
        </div>
      ),
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      align: "center",
      width: "140px",
      sortable: true,
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.last_sync)}
        </div>
      ),
    },
  ];

  // Filter slot
  const filterSlot = (
    <div className="flex gap-2 w-full">
      {/* Filter dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
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
                <span className="font-semibold text-blue-600 text-[10px] flex-shrink-0">{prodi.nm_jenj_didik || ""}</span>
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
            setFilterProdi("");
            setFilterMatkul("");
            setCurrentPage(1);
          }}
          className="h-10 px-3 text-[10px] whitespace-nowrap bg-white hover:bg-gray-100 border border-gray-200"
          isDisabled={filterProdi === "" && filterMatkul === ""}
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
          searchPlaceholder="Cari komponen evaluasi atau mata kuliah..."
          loading={loading}
          serverSide={true}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(size) => {
            setRowsPerPage(size);
            setCurrentPage(1);
          }}
          onSearchChange={setSearchQuery}
          onSortChange={handleSortChange}
          filterSlot={filterSlot}
        />
      </motion.div>
    </motion.div>
  );
}
