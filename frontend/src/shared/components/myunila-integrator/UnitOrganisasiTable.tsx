"use client";
import { useState, useEffect, useCallback } from "react";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button } from "@heroui/react";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import {
  unitOrganisasiSyncService,
  UnitOrganisasiItem,
  ComparisonItem,
} from "@/lib/services/myunila/manakses/unitOrganisasiSyncService";

interface UnitOrganisasiTableProps {
  mode: "comparison" | "sms" | "unit_org";
  onDataLoaded?: (total: number) => void;
}

export default function UnitOrganisasiTable({ mode, onDataLoaded }: UnitOrganisasiTableProps) {
  const [data, setData] = useState<(UnitOrganisasiItem | ComparisonItem)[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Filter options for comparison mode
  const statusFilterOptions = [
    { value: "synced", label: "Sudah Sync" },
    { value: "not_synced", label: "Belum Sync" },
  ];

  // Load data when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (mode === "comparison") {
          const filter = filterStatus as 'all' | 'synced' | 'not_synced' || 'all';
          const response = await unitOrganisasiSyncService.getComparisonList(
            currentPage,
            rowsPerPage,
            searchQuery,
            filter
          );
          setData(response.data);
          setTotalRecords(response.meta.total);
          onDataLoaded?.(response.meta.total);
        } else if (mode === "sms") {
          const response = await unitOrganisasiSyncService.getSMSList(
            currentPage,
            rowsPerPage,
            searchQuery
          );
          setData(response.data);
          setTotalRecords(response.meta.total);
          onDataLoaded?.(response.meta.total);
        } else if (mode === "unit_org") {
          const response = await unitOrganisasiSyncService.getUnitOrganisasiList(
            currentPage,
            rowsPerPage,
            searchQuery
          );
          setData(response.data);
          setTotalRecords(response.meta.total);
          onDataLoaded?.(response.meta.total);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterStatus, mode, onDataLoaded]);

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

  const cleanString = (str: string | null | undefined): string => {
    if (!str) return "-";
    return str.trim();
  };

  // Columns for comparison mode
  const comparisonColumns: Column<ComparisonItem>[] = [
    {
      key: "nm_lemb_sms",
      label: "NAMA LEMBAGA (SMS)",
      sortable: true,
      render: (item) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {item.nm_lemb_sms}
        </div>
      ),
    },
    {
      key: "exists_in_manakses",
      label: "STATUS SYNC",
      align: "center",
      width: "140px",
      render: (item) => (
        item.exists_in_manakses ? (
          <Chip
            size="sm"
            variant="flat"
            color="success"
            startContent={<FiCheckCircle className="w-3 h-3" />}
          >
            Synced
          </Chip>
        ) : (
          <Chip
            size="sm"
            variant="flat"
            color="warning"
            startContent={<FiAlertCircle className="w-3 h-3" />}
          >
            Belum Sync
          </Chip>
        )
      ),
    },
    {
      key: "nm_lemb_manakses",
      label: "NAMA DI MANAKSES",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {item.nm_lemb_manakses || "-"}
        </div>
      ),
    },
  ];

  // Columns for SMS and Unit Organisasi modes
  const dataColumns: Column<UnitOrganisasiItem>[] = [
    {
      key: "nm_lemb",
      label: "NAMA LEMBAGA",
      sortable: true,
      render: (item) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {item.nm_lemb}
        </div>
      ),
    },
    {
      key: "ds_kel",
      label: "DESA/KELURAHAN",
      width: "150px",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {cleanString(item.ds_kel)}
        </div>
      ),
    },
    {
      key: "no_tel",
      label: "NO. TELP",
      width: "150px",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
          {cleanString(item.no_tel)}
        </div>
      ),
    },
    {
      key: "email",
      label: "EMAIL",
      width: "200px",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 truncate" title={item.email || ""}>
          {cleanString(item.email)}
        </div>
      ),
    },
    {
      key: "a_aktif",
      label: "STATUS",
      align: "center",
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.a_aktif === 1 ? "success" : "danger"}
        >
          {item.a_aktif === 1 ? "Aktif" : "Nonaktif"}
        </Chip>
      ),
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      align: "center",
      width: "120px",
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.last_sync)}
        </div>
      ),
    },
  ];

  // Filter slot for comparison mode
  const filterSlot = mode === "comparison" ? (
    <div className="flex gap-2 w-full">
      <div className="flex-1">
        <Select
          aria-label="Filter Status Sync"
          placeholder="Semua Status"
          selectedKeys={filterStatus ? [filterStatus] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setFilterStatus(selected || "");
            setCurrentPage(1);
          }}
          classNames={{
            base: "w-full max-w-[200px]",
            trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm",
            value: "text-[10px] font-medium text-gray-700 dark:text-gray-300",
            innerWrapper: "!bg-white dark:!bg-gray-800 pr-8",
            popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[180px]",
            listbox: "!bg-white dark:!bg-gray-800",
            selectorIcon: "right-2",
          }}
          size="sm"
          variant="bordered"
        >
          {statusFilterOptions.map((option) => (
            <SelectItem key={option.value} textValue={option.label}>
              <span className="text-xs">{option.label}</span>
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
            setFilterStatus("");
            setCurrentPage(1);
          }}
          className="h-10 px-3 text-[10px] whitespace-nowrap bg-white hover:bg-gray-100 border border-gray-200"
          isDisabled={filterStatus === ""}
        >
          Reset Filter
        </Button>
      </div>
    </div>
  ) : undefined;

  const getSearchPlaceholder = () => {
    switch (mode) {
      case "comparison":
        return "Cari nama lembaga...";
      case "sms":
        return "Cari nama lembaga SMS...";
      case "unit_org":
        return "Cari nama unit organisasi...";
      default:
        return "Cari data...";
    }
  };

  const emptyContent = (
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      </div>
      <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
        Tidak ada data
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
        {mode === "comparison"
          ? "Coba ubah filter atau kata kunci pencarian"
          : mode === "sms"
          ? "Lakukan sinkronisasi untuk memuat data dari SMS"
          : "Coba ubah kata kunci pencarian"}
      </p>
    </div>
  );

  if (mode === "comparison") {
    return (
      <DataTable
        data={data as ComparisonItem[]}
        columns={comparisonColumns}
        searchable={true}
        searchPlaceholder={getSearchPlaceholder()}
        loading={loading}
        serverSide={true}
        totalRecords={totalRecords}
        noWrapper={true}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(size) => {
          setRowsPerPage(size);
          setCurrentPage(1);
        }}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setCurrentPage(1);
        }}
        filterSlot={filterSlot}
        emptyMessage={emptyContent}
      />
    );
  }

  return (
    <DataTable
      data={data as UnitOrganisasiItem[]}
      columns={dataColumns}
      searchable={true}
      searchPlaceholder={getSearchPlaceholder()}
      loading={loading}
      serverSide={true}
      totalRecords={totalRecords}
      noWrapper={true}
      onPageChange={setCurrentPage}
      onRowsPerPageChange={(size) => {
        setRowsPerPage(size);
        setCurrentPage(1);
      }}
      onSearchChange={(query) => {
        setSearchQuery(query);
        setCurrentPage(1);
      }}
      emptyMessage={emptyContent}
    />
  );
}
