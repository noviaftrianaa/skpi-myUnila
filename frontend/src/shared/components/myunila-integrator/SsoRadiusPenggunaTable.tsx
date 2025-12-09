"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button } from "@heroui/react";
import { myunilaClient } from "@/lib/api/myunilaClient";

interface PenggunaListItem {
  id_pengguna: string;
  username: string;
  nm_pengguna: string;
  email: string | null;
  a_aktif: number;
  a_sso: number;
  last_sync: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface SsoRadiusPenggunaTableProps {
  refreshTrigger?: number;
}

export default function SsoRadiusPenggunaTable({ refreshTrigger }: SsoRadiusPenggunaTableProps) {
  const [data, setData] = useState<PenggunaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterSso, setFilterSso] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("username");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Options for filters
  const statusOptions = [
    { value: "aktif", label: "Aktif" },
    { value: "nonaktif", label: "Non-Aktif" },
  ];

  const ssoOptions = [
    { value: "yes", label: "Sudah Sync SSO" },
    { value: "no", label: "Belum Sync SSO" },
  ];

  // Handle sort change
  const handleSortChange = (key: string, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
    setCurrentPage(1);
  };

  // Load data when filters change or refreshTrigger changes
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

        if (filterStatus) {
          params.append("status", filterStatus);
        }

        if (filterSso) {
          params.append("has_sso", filterSso);
        }

        if (sortBy) {
          params.append("sort_by", sortBy);
          params.append("sort_order", sortOrder);
        }

        const response = await myunilaClient.get(`/radius/pengguna?${params.toString()}`);

        if (response.data.success) {
          setData(response.data.data || []);
          setTotalRecords(response.data.meta?.total || 0);
        }
      } catch (error) {
        console.error('Error loading pengguna:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterStatus, filterSso, sortBy, sortOrder, refreshTrigger]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const cleanString = (str: string | null | undefined): string => {
    if (!str) return "-";
    return str.trim();
  };

  const columns: Column<PenggunaListItem>[] = [
    {
      key: "username",
      label: "USERNAME",
      sortable: true,
      width: "180px",
      render: (item) => (
        <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
          {cleanString(item.username)}
        </div>
      ),
    },
    {
      key: "nm_pengguna",
      label: "NAMA PENGGUNA",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {item.nm_pengguna || "-"}
          </div>
          {item.email && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {item.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "a_aktif",
      label: "STATUS",
      align: "center",
      width: "120px",
      sortable: true,
      render: (item) => {
        const isAktif = item.a_aktif === 1;
        return (
          <Chip
            size="sm"
            variant="flat"
            color={isAktif ? "success" : "danger"}
          >
            {isAktif ? "Aktif" : "Non-Aktif"}
          </Chip>
        );
      },
    },
    {
      key: "a_sso",
      label: "SSO RADIUS",
      align: "center",
      width: "140px",
      sortable: true,
      render: (item) => {
        const hasSso = item.a_sso === 1;
        return (
          <Chip
            size="sm"
            variant="flat"
            color={hasSso ? "primary" : "default"}
            startContent={
              hasSso ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )
            }
          >
            {hasSso ? "Sudah Sync" : "Belum Sync"}
          </Chip>
        );
      },
    },
    {
      key: "last_sync",
      label: "LAST SYNC",
      align: "center",
      width: "160px",
      sortable: true,
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.last_sync)}
        </div>
      ),
    },
    {
      key: "updated_at",
      label: "UPDATED AT",
      align: "center",
      width: "160px",
      sortable: true,
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.updated_at)}
        </div>
      ),
    },
  ];

  // Filter slot
  const filterSlot = (
    <div className="flex gap-2 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
        <Select
          aria-label="Filter Status"
          placeholder="Semua Status"
          selectedKeys={filterStatus ? [filterStatus] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setFilterStatus(selected || "");
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
        >
          {statusOptions.map((option) => (
            <SelectItem key={option.value} textValue={option.label}>
              <span className="text-xs">{option.label}</span>
            </SelectItem>
          ))}
        </Select>

        <Select
          aria-label="Filter SSO"
          placeholder="Semua SSO Status"
          selectedKeys={filterSso ? [filterSso] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            setFilterSso(selected || "");
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
        >
          {ssoOptions.map((option) => (
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
            setFilterSso("");
            setCurrentPage(1);
          }}
          className="h-10 px-3 text-[10px] whitespace-nowrap bg-white hover:bg-gray-100 border border-gray-200"
          isDisabled={filterStatus === "" && filterSso === ""}
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
          searchPlaceholder="Cari username atau nama pengguna..."
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                Tidak ada data pengguna
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Coba ubah filter atau lakukan sinkronisasi dari Radius SSO
              </p>
            </div>
          }
        />
      </motion.div>
    </motion.div>
  );
}
