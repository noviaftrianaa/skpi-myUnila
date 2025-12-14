"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { FiMoreVertical, FiEdit2, FiTrash2, FiPlus, FiRefreshCw, FiFilter, FiEye } from "react-icons/fi";
import { aplikasiService, type Aplikasi, type AplikasiDetail, type AplikasiStats, type AplikasiMenu } from "@/lib/services/manakses/aplikasiService";
import AplikasiFormModal from "./AplikasiFormModal";
import AplikasiDetailModal from "./AplikasiDetailModal";
import toast from "react-hot-toast";

interface AplikasiTableProps {
  onStatsLoaded?: (stats: AplikasiStats) => void;
}

export default function AplikasiTable({ onStatsLoaded }: AplikasiTableProps) {
  const [data, setData] = useState<Aplikasi[]>([]);
  const [stats, setStats] = useState<AplikasiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  // Checkbox-style filters for INFO column
  const [filterProduction, setFilterProduction] = useState<boolean | null>(null); // null=all, true=production, false=development
  const [filterPortal, setFilterPortal] = useState<boolean | null>(null); // null=all, true=tampil, false=tidak
  const [filterTerintegrasi, setFilterTerintegrasi] = useState<boolean | null>(null); // null=all, true=ya, false=tidak
  const [filterSSOCAS, setFilterSSOCAS] = useState<boolean | null>(null); // null=all, true=ya, false=tidak
  const [filterMaintenance, setFilterMaintenance] = useState<boolean | null>(null); // null=all, true=ya, false=tidak
  const [filterComingSoon, setFilterComingSoon] = useState<boolean | null>(null); // null=all, true=ya, false=tidak
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sortBy, setSortBy] = useState<string>("last_update");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAplikasi, setEditingAplikasi] = useState<(Aplikasi & { app_key?: string | null; menus?: AplikasiMenu[] }) | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAplikasi, setDeletingAplikasi] = useState<Aplikasi | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Detail modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailAplikasi, setDetailAplikasi] = useState<AplikasiDetail | null>(null);
  const [isLoadingDetailModal, setIsLoadingDetailModal] = useState(false);

  // Use ref to store callback to avoid infinite loop
  const onStatsLoadedRef = useRef(onStatsLoaded);
  onStatsLoadedRef.current = onStatsLoaded;


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Load stats on mount only
  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await aplikasiService.getStats();
        setStats(statsData);
        if (onStatsLoadedRef.current) {
          onStatsLoadedRef.current(statsData);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, []); // Empty dependency - only run on mount

  // Load data when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await aplikasiService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          status: filterStatus !== "all" ? (filterStatus as 'aktif' | 'nonaktif') : undefined,
          mode: filterProduction === null ? undefined : (filterProduction ? 'production' : 'development'),
          portal: filterPortal === null ? undefined : (filterPortal ? 'ya' : 'tidak'),
          terintegrasi: filterTerintegrasi === null ? undefined : (filterTerintegrasi ? 'ya' : 'tidak'),
          sso_cas: filterSSOCAS === null ? undefined : (filterSSOCAS ? 'ya' : 'tidak'),
          maintenance: filterMaintenance === null ? undefined : (filterMaintenance ? 'ya' : 'tidak'),
          coming_soon: filterComingSoon === null ? undefined : (filterComingSoon ? 'ya' : 'tidak'),
          sort_by: sortBy as 'nm_aplikasi' | 'url' | 'teknologi' | 'nm_kategori' | 'nm_organisasi' | 'tgl_create' | 'last_update' | 'urutan',
          sort_order: sortOrder,
        });

        setData(response.data);
        setTotalRecords(response.total);
      } catch (error) {
        console.error('Error loading aplikasi:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterStatus, filterProduction, filterPortal, filterTerintegrasi, filterSSOCAS, filterMaintenance, filterComingSoon, refreshTrigger, sortBy, sortOrder]);

  // Handle sort change
  const handleSortChange = (column: string, direction: "asc" | "desc") => {
    setSortBy(column);
    setSortOrder(direction);
    setCurrentPage(1);
  };

  // Handlers
  const handleAdd = () => {
    setEditingAplikasi(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = async (aplikasi: Aplikasi) => {
    setIsLoadingDetail(true);
    try {
      // Fetch detail to get app_key and menus
      const detail = await aplikasiService.getDetail(aplikasi.id_aplikasi);
      setEditingAplikasi({
        ...aplikasi,
        app_key: detail.app_key,
        menus: detail.menus,
      });
      setIsFormModalOpen(true);
    } catch (error) {
      console.error("Error fetching aplikasi detail:", error);
      // Still open modal with basic data if detail fetch fails
      setEditingAplikasi(aplikasi);
      setIsFormModalOpen(true);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleViewDetail = async (aplikasi: Aplikasi) => {
    setIsLoadingDetailModal(true);
    setIsDetailModalOpen(true);
    try {
      const detail = await aplikasiService.getDetail(aplikasi.id_aplikasi);
      setDetailAplikasi(detail);
    } catch (error) {
      console.error("Error fetching aplikasi detail:", error);
      setDetailAplikasi(null);
    } finally {
      setIsLoadingDetailModal(false);
    }
  };

  const handleDeleteClick = (aplikasi: Aplikasi) => {
    setDeletingAplikasi(aplikasi);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAplikasi) return;

    const deletedName = deletingAplikasi.nm_aplikasi;
    setDeleteLoading(true);
    try {
      await aplikasiService.delete(deletingAplikasi.id_aplikasi);
      setRefreshTrigger((prev) => prev + 1);
      setIsDeleteModalOpen(false);
      setDeletingAplikasi(null);
      // Reload stats
      const statsData = await aplikasiService.getStats();
      setStats(statsData);
      if (onStatsLoadedRef.current) {
        onStatsLoadedRef.current(statsData);
      }
      // Show success notification
      toast.success(`Aplikasi "${deletedName}" berhasil dihapus`, {
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#10B981",
          color: "#fff",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#10B981",
        },
      });
    } catch (error) {
      console.error("Error deleting aplikasi:", error);
      toast.error("Gagal menghapus aplikasi. Silakan coba lagi.", {
        duration: 4000,
        style: {
          borderRadius: "12px",
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSuccess = async (isEdit: boolean, appName: string) => {
    setRefreshTrigger((prev) => prev + 1);
    // Reload stats
    const statsData = await aplikasiService.getStats();
    setStats(statsData);
    if (onStatsLoadedRef.current) {
      onStatsLoadedRef.current(statsData);
    }
    // Show success notification
    toast.success(
      isEdit
        ? `Aplikasi "${appName}" berhasil diperbarui`
        : `Aplikasi "${appName}" berhasil ditambahkan`,
      {
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#10B981",
          color: "#fff",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#10B981",
        },
      }
    );
  };

  const handleResetFilters = () => {
    setFilterStatus("all");
    setFilterProduction(null);
    setFilterPortal(null);
    setFilterTerintegrasi(null);
    setFilterSSOCAS(null);
    setFilterMaintenance(null);
    setFilterComingSoon(null);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = filterStatus !== "all" || filterProduction !== null || filterPortal !== null || filterTerintegrasi !== null || filterSSOCAS !== null || filterMaintenance !== null || filterComingSoon !== null || searchQuery !== "";

  const activeFilterCount = [
    filterProduction !== null,
    filterPortal !== null,
    filterTerintegrasi !== null,
    filterSSOCAS !== null,
    filterMaintenance !== null,
    filterComingSoon !== null,
  ].filter(Boolean).length;

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

  const columns: Column<Aplikasi>[] = [
    {
      key: "nm_aplikasi",
      label: "NAMA APLIKASI",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {item.nm_aplikasi}
          </div>
          {item.ket_aplikasi && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {item.ket_aplikasi}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "url",
      label: "URL",
      render: (item) => (
        <div className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate max-w-xs">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {item.url}
            </a>
          ) : (
            "-"
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      align: "center",
      width: "100px",
      render: (item) => {
        // Check if expired based on expired_date
        const isExpired = item.expired_date ? new Date(item.expired_date) < new Date() : false;
        const statusLabel = isExpired ? "Expired" : item.status;
        const statusColor = isExpired ? "warning" : (item.status === "Aktif" ? "success" : "danger");

        return (
          <Chip
            size="sm"
            variant="flat"
            color={statusColor}
          >
            {statusLabel}
          </Chip>
        );
      },
    },
    {
      key: "flags",
      label: "INFO",
      align: "left",
      width: "180px",
      render: (item) => (
        <div className="text-[11px] space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 dark:text-gray-400 w-24">Mode:</span>
            <span className={item.a_live ? "text-success-600 dark:text-success-400 font-medium" : "text-warning-600 dark:text-warning-400 font-medium"}>
              {item.a_live ? "Production" : "Development"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 dark:text-gray-400 w-24">Tampil Di Portal:</span>
            <span className={item.a_tampil_portal ? "text-primary-600 dark:text-primary-400 font-medium" : "text-gray-400"}>
              {item.a_tampil_portal ? "Ya" : "Tidak"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 dark:text-gray-400 w-24">Terintegrasi:</span>
            <span className={item.a_terintegrasi ? "text-success-600 dark:text-success-400 font-medium" : "text-gray-400"}>
              {item.a_terintegrasi ? "Ya" : "Tidak"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 dark:text-gray-400 w-24">SSO/CAS:</span>
            <span className={item.a_integrasi_cas ? "text-success-600 dark:text-success-400 font-medium" : "text-gray-400"}>
              {item.a_integrasi_cas ? "Ya" : "Tidak"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 dark:text-gray-400 w-24">Maintenance:</span>
            <span className={item.a_maintenance ? "text-warning-600 dark:text-warning-400 font-medium" : "text-gray-400"}>
              {item.a_maintenance ? "Ya" : "Tidak"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 dark:text-gray-400 w-24">Coming Soon:</span>
            <span className={item.a_coming_soon ? "text-secondary-600 dark:text-secondary-400 font-medium" : "text-gray-400"}>
              {item.a_coming_soon ? "Ya" : "Tidak"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "last_update",
      label: "TERAKHIR UPDATE",
      align: "center",
      width: "140px",
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.last_update)}
        </div>
      ),
    },
    {
      key: "actions",
      label: "AKSI",
      align: "center",
      width: "80px",
      render: (item) => (
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-gray-500 hover:text-gray-700"
            >
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Aksi" className="min-w-[120px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg rounded-lg">
            <DropdownItem
              key="detail"
              startContent={<FiEye className="w-4 h-4" />}
              onPress={() => handleViewDetail(item)}
              className="text-gray-700 dark:text-gray-300"
            >
              Detail
            </DropdownItem>
            <DropdownItem
              key="edit"
              startContent={<FiEdit2 className="w-4 h-4" />}
              onPress={() => handleEdit(item)}
              className="text-gray-700 dark:text-gray-300"
            >
              Edit
            </DropdownItem>
            <DropdownItem
              key="delete"
              startContent={<FiTrash2 className="w-4 h-4" />}
              onPress={() => handleDeleteClick(item)}
              className="text-danger"
              color="danger"
            >
              Hapus
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ),
    },
  ];

  // Filter slot - compact version with Status Select + Filter Popover
  const filterSlot = (
    <div className="flex items-center gap-2 w-full">
      {/* Filter Status - Select */}
      <Select
        aria-label="Filter Status"
        placeholder="Semua Status"
        selectedKeys={[filterStatus]}
        onChange={(e) => {
          setFilterStatus(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-40",
          trigger: "h-9 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-6",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        size="sm"
        variant="bordered"
        renderValue={(items) => {
          if (!items || items.length === 0) return "Semua Status";
          const item = items[0];
          if (item.key === "all") return "Semua Status";
          return item.textValue || "Semua Status";
        }}
      >
        <SelectItem key="all" value="all" textValue="Semua Status">
          Semua Status ({stats?.total_aplikasi || 0})
        </SelectItem>
        <SelectItem key="aktif" value="aktif" textValue="Aktif">
          Aktif ({stats?.total_aktif || 0})
        </SelectItem>
        <SelectItem key="nonaktif" value="nonaktif" textValue="Tidak Aktif">
          Tidak Aktif ({stats?.total_nonaktif || 0})
        </SelectItem>
      </Select>

      {/* Filter Popover with Checkboxes */}
      <Popover placement="bottom-start">
        <PopoverTrigger>
          <Button
            size="sm"
            variant="bordered"
            startContent={<FiFilter className="w-3.5 h-3.5" />}
            className={`h-9 px-3 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 ${
              activeFilterCount > 0 ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" : ""
            }`}
          >
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500 text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-xl rounded-lg">
          <div className="p-3 min-w-[240px]">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Filter Berdasarkan
            </div>
            <div className="space-y-1">
              {/* Mode Filter */}
              <label className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filterProduction === true}
                  ref={(el) => { if (el) el.indeterminate = filterProduction === false; }}
                  onChange={() => {
                    if (filterProduction === null) {
                      setFilterProduction(true);
                    } else if (filterProduction === true) {
                      setFilterProduction(false);
                    } else {
                      setFilterProduction(null);
                    }
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-500 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Mode</span>
                  <span className="ml-2 text-[10px] text-gray-400 dark:text-gray-500">
                    {filterProduction === null ? "(Semua)" : filterProduction ? `Production (${stats?.total_live || 0})` : `Development (${stats?.total_dev || 0})`}
                  </span>
                </div>
              </label>

              {/* Tampil di Portal Filter */}
              <label className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filterPortal === true}
                  ref={(el) => { if (el) el.indeterminate = filterPortal === false; }}
                  onChange={() => {
                    if (filterPortal === null) {
                      setFilterPortal(true);
                    } else if (filterPortal === true) {
                      setFilterPortal(false);
                    } else {
                      setFilterPortal(null);
                    }
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-500 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Tampil di Portal</span>
                  <span className="ml-2 text-[10px] text-gray-400 dark:text-gray-500">
                    {filterPortal === null ? "(Semua)" : filterPortal ? `Ya (${stats?.total_portal || 0})` : "Tidak"}
                  </span>
                </div>
              </label>

              {/* Terintegrasi Filter */}
              <label className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filterTerintegrasi === true}
                  ref={(el) => { if (el) el.indeterminate = filterTerintegrasi === false; }}
                  onChange={() => {
                    if (filterTerintegrasi === null) {
                      setFilterTerintegrasi(true);
                    } else if (filterTerintegrasi === true) {
                      setFilterTerintegrasi(false);
                    } else {
                      setFilterTerintegrasi(null);
                    }
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-500 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Terintegrasi</span>
                  <span className="ml-2 text-[10px] text-gray-400 dark:text-gray-500">
                    {filterTerintegrasi === null ? "(Semua)" : filterTerintegrasi ? `Ya (${stats?.total_terintegrasi || 0})` : "Tidak"}
                  </span>
                </div>
              </label>

              {/* SSO/CAS Filter */}
              <label className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filterSSOCAS === true}
                  ref={(el) => { if (el) el.indeterminate = filterSSOCAS === false; }}
                  onChange={() => {
                    if (filterSSOCAS === null) {
                      setFilterSSOCAS(true);
                    } else if (filterSSOCAS === true) {
                      setFilterSSOCAS(false);
                    } else {
                      setFilterSSOCAS(null);
                    }
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-500 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">SSO/CAS</span>
                  <span className="ml-2 text-[10px] text-gray-400 dark:text-gray-500">
                    {filterSSOCAS === null ? "(Semua)" : filterSSOCAS ? "Ya" : "Tidak"}
                  </span>
                </div>
              </label>

              {/* Maintenance Filter */}
              <label className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filterMaintenance === true}
                  ref={(el) => { if (el) el.indeterminate = filterMaintenance === false; }}
                  onChange={() => {
                    if (filterMaintenance === null) {
                      setFilterMaintenance(true);
                    } else if (filterMaintenance === true) {
                      setFilterMaintenance(false);
                    } else {
                      setFilterMaintenance(null);
                    }
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-500 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Maintenance</span>
                  <span className="ml-2 text-[10px] text-gray-400 dark:text-gray-500">
                    {filterMaintenance === null ? "(Semua)" : filterMaintenance ? `Ya (${stats?.total_maintenance || 0})` : "Tidak"}
                  </span>
                </div>
              </label>

              {/* Coming Soon Filter */}
              <label className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filterComingSoon === true}
                  ref={(el) => { if (el) el.indeterminate = filterComingSoon === false; }}
                  onChange={() => {
                    if (filterComingSoon === null) {
                      setFilterComingSoon(true);
                    } else if (filterComingSoon === true) {
                      setFilterComingSoon(false);
                    } else {
                      setFilterComingSoon(null);
                    }
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-500 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Coming Soon</span>
                  <span className="ml-2 text-[10px] text-gray-400 dark:text-gray-500">
                    {filterComingSoon === null ? "(Semua)" : filterComingSoon ? "Ya" : "Tidak"}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          size="sm"
          variant="flat"
          color="default"
          isIconOnly
          onPress={handleResetFilters}
          className="h-9 w-9 min-w-9 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <FiRefreshCw className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );

  // Action slot with Add button
  const actionSlot = (
    <Button
      color="primary"
      startContent={<FiPlus className="w-4 h-4" />}
      onPress={handleAdd}
      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-md hover:shadow-lg transition-all rounded-lg"
      size="sm"
    >
      Tambah Data
    </Button>
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
          searchKeys={["nm_aplikasi", "ket_aplikasi", "url", "teknologi"]}
          searchPlaceholder="Cari nama aplikasi, URL, atau teknologi..."
          defaultRowsPerPage={10}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          loading={loading}
          serverSide={true}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setCurrentPage(1);
          }}
          onSearchChange={(query) => {
            setSearchQuery(query);
            setCurrentPage(1);
          }}
          onSortChange={handleSortChange}
          filterSlot={filterSlot}
          actionSlot={actionSlot}
          className="shadow-lg"
        />
      </motion.div>

      {/* Form Modal */}
      <AplikasiFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingAplikasi(null);
        }}
        onSuccess={handleFormSuccess}
        aplikasi={editingAplikasi}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingAplikasi(null);
        }}
        size="md"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Konfirmasi Hapus
            </h3>
          </ModalHeader>
          <ModalBody className="py-6">
            <p className="text-gray-700 dark:text-gray-300">
              Apakah Anda yakin ingin menghapus aplikasi{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {deletingAplikasi?.nm_aplikasi}
              </span>
              ?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </ModalBody>
          <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button
              variant="flat"
              onPress={() => {
                setIsDeleteModalOpen(false);
                setDeletingAplikasi(null);
              }}
              isDisabled={deleteLoading}
            >
              Batal
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteConfirm}
              isLoading={deleteLoading}
            >
              Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Detail Modal */}
      <AplikasiDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailAplikasi(null);
        }}
        aplikasi={detailAplikasi}
        isLoading={isLoadingDetailModal}
        onEdit={(app) => {
          setIsDetailModalOpen(false);
          handleEdit(app);
        }}
      />
    </motion.div>
  );
}
