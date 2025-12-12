"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { FiMoreVertical, FiEdit2, FiTrash2, FiPlus, FiRefreshCw, FiFilter, FiEye } from "react-icons/fi";
import { aplikasiService, type Aplikasi, type AplikasiDetail, type AplikasiStats, type AplikasiMenu } from "@/lib/services/manakses/aplikasiService";
import AplikasiFormModal from "./AplikasiFormModal";
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
  }, [currentPage, rowsPerPage, searchQuery, filterStatus, filterProduction, filterPortal, filterTerintegrasi, filterSSOCAS, filterMaintenance, filterComingSoon, refreshTrigger]);

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
      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all rounded-lg"
      size="sm"
    >
      Tambah
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
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailAplikasi(null);
        }}
        size="3xl"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Detail Aplikasi
            </h3>
            {detailAplikasi && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {detailAplikasi.nm_aplikasi}
              </p>
            )}
          </ModalHeader>
          <ModalBody className="py-6 px-6">
            {isLoadingDetailModal ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-500 dark:text-gray-400">Memuat detail...</span>
              </div>
            ) : detailAplikasi ? (
              <div className="space-y-5">
                {/* Statistics Cards - Top */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-3 rounded-xl text-center border border-indigo-200/50 dark:border-indigo-700/30">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{detailAplikasi.jumlah_table || 0}</div>
                    <div className="text-xs text-indigo-600/70 dark:text-indigo-400/70 font-medium">Tabel</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 rounded-xl text-center border border-green-200/50 dark:border-green-700/30">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{detailAplikasi.jumlah_pj || 0}</div>
                    <div className="text-xs text-green-600/70 dark:text-green-400/70 font-medium">Penanggung Jawab</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 rounded-xl text-center border border-purple-200/50 dark:border-purple-700/30">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{detailAplikasi.menus?.length || 0}</div>
                    <div className="text-xs text-purple-600/70 dark:text-purple-400/70 font-medium">Menu</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-3 rounded-xl text-center border border-orange-200/50 dark:border-orange-700/30">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{detailAplikasi.urutan || 0}</div>
                    <div className="text-xs text-orange-600/70 dark:text-orange-400/70 font-medium">Urutan</div>
                  </div>
                </div>

                {/* Basic Info & Teknis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Informasi Dasar */}
                  <div className="bg-gray-50/80 dark:bg-slate-700/20 rounded-xl p-4 border border-gray-200/80 dark:border-slate-600/50">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      Informasi Dasar
                    </h4>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                        <span className="text-gray-500 dark:text-gray-400">ID Aplikasi</span>
                        <span className="text-gray-900 dark:text-white font-mono text-xs bg-gray-100 dark:bg-slate-600 px-2 py-0.5 rounded">{detailAplikasi.id_aplikasi.substring(0, 12)}...</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                        <span className="text-gray-500 dark:text-gray-400">Status</span>
                        <Chip size="sm" color={detailAplikasi.status === "Aktif" ? "success" : "danger"} variant="flat">
                          {detailAplikasi.status}
                        </Chip>
                      </div>
                      <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                        <span className="text-gray-500 dark:text-gray-400">Jenis</span>
                        <span className="text-gray-900 dark:text-white font-medium">{detailAplikasi.jenis || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                        <span className="text-gray-500 dark:text-gray-400">Kategori</span>
                        <span className="text-gray-900 dark:text-white font-medium">{detailAplikasi.nm_kategori || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                        <span className="text-gray-500 dark:text-gray-400">Organisasi</span>
                        <span className="text-gray-900 dark:text-white font-medium text-right max-w-[150px] truncate">{detailAplikasi.nm_organisasi || "-"}</span>
                      </div>
                      {detailAplikasi.ket_aplikasi && (
                        <div className="pt-1">
                          <span className="text-gray-500 dark:text-gray-400 text-xs block mb-1.5 px-2">Keterangan:</span>
                          <p className="text-gray-800 dark:text-gray-200 text-xs bg-white dark:bg-slate-700 p-2.5 rounded-lg border border-gray-200 dark:border-slate-600">{detailAplikasi.ket_aplikasi}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Teknis */}
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Informasi Teknis
                    </h4>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                        <span className="text-gray-500 dark:text-gray-400">URL</span>
                        <span className="text-right max-w-[180px] truncate">
                          {detailAplikasi.url ? (
                            <a href={detailAplikasi.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs font-mono">
                              {detailAplikasi.url}
                            </a>
                          ) : <span className="text-gray-400">-</span>}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                        <span className="text-gray-500 dark:text-gray-400">Port</span>
                        <span className="text-gray-900 dark:text-white font-mono">{detailAplikasi.port || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                        <span className="text-gray-500 dark:text-gray-400">Teknologi</span>
                        <span className="text-gray-900 dark:text-white">{detailAplikasi.teknologi || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                        <span className="text-gray-500 dark:text-gray-400">App Slug</span>
                        <span className="text-gray-900 dark:text-white font-mono text-xs">{detailAplikasi.app_slug || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                        <span className="text-gray-500 dark:text-gray-400">Endpoint WS</span>
                        <span className="text-gray-900 dark:text-white font-mono text-xs max-w-[150px] truncate">{detailAplikasi.endpoint_ws || "-"}</span>
                      </div>
                      {detailAplikasi.app_key && (
                        <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/60 dark:bg-slate-700/40">
                          <span className="text-gray-500 dark:text-gray-400">App Key</span>
                          <span className="text-gray-900 dark:text-white font-mono text-xs bg-gray-100 dark:bg-slate-600 px-2 py-0.5 rounded">{detailAplikasi.app_key.substring(0, 16)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pengaturan Flags */}
                <div className="bg-slate-50/80 dark:bg-slate-700/20 rounded-xl p-4 border border-slate-200/80 dark:border-slate-600/50">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    Pengaturan
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${detailAplikasi.a_live ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30" : "bg-gray-100 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600"}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${detailAplikasi.a_live ? "bg-green-500" : "bg-gray-300 dark:bg-slate-500"}`}></span>
                      <span className={`text-xs font-medium ${detailAplikasi.a_live ? "text-green-700 dark:text-green-400" : "text-gray-500 dark:text-slate-400"}`}>Production</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${detailAplikasi.a_tampil_portal ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30" : "bg-gray-100 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600"}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${detailAplikasi.a_tampil_portal ? "bg-blue-500" : "bg-gray-300 dark:bg-slate-500"}`}></span>
                      <span className={`text-xs font-medium ${detailAplikasi.a_tampil_portal ? "text-blue-700 dark:text-blue-400" : "text-gray-500 dark:text-slate-400"}`}>Portal</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${detailAplikasi.a_terintegrasi ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30" : "bg-gray-100 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600"}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${detailAplikasi.a_terintegrasi ? "bg-purple-500" : "bg-gray-300 dark:bg-slate-500"}`}></span>
                      <span className={`text-xs font-medium ${detailAplikasi.a_terintegrasi ? "text-purple-700 dark:text-purple-400" : "text-gray-500 dark:text-slate-400"}`}>myUnila</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${detailAplikasi.a_integrasi_cas ? "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/30" : "bg-gray-100 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600"}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${detailAplikasi.a_integrasi_cas ? "bg-teal-500" : "bg-gray-300 dark:bg-slate-500"}`}></span>
                      <span className={`text-xs font-medium ${detailAplikasi.a_integrasi_cas ? "text-teal-700 dark:text-teal-400" : "text-gray-500 dark:text-slate-400"}`}>SSO/CAS</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${detailAplikasi.a_maintenance ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/30" : "bg-gray-100 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600"}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${detailAplikasi.a_maintenance ? "bg-yellow-500" : "bg-gray-300 dark:bg-slate-500"}`}></span>
                      <span className={`text-xs font-medium ${detailAplikasi.a_maintenance ? "text-yellow-700 dark:text-yellow-400" : "text-gray-500 dark:text-slate-400"}`}>Maintenance</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${detailAplikasi.a_coming_soon ? "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800/30" : "bg-gray-100 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600"}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${detailAplikasi.a_coming_soon ? "bg-cyan-500" : "bg-gray-300 dark:bg-slate-500"}`}></span>
                      <span className={`text-xs font-medium ${detailAplikasi.a_coming_soon ? "text-cyan-700 dark:text-cyan-400" : "text-gray-500 dark:text-slate-400"}`}>Coming Soon</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${detailAplikasi.a_generate_menu ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/30" : "bg-gray-100 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600"}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${detailAplikasi.a_generate_menu ? "bg-indigo-500" : "bg-gray-300 dark:bg-slate-500"}`}></span>
                      <span className={`text-xs font-medium ${detailAplikasi.a_generate_menu ? "text-indigo-700 dark:text-indigo-400" : "text-gray-500 dark:text-slate-400"}`}>Gen Menu</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${detailAplikasi.a_sistem_internal_pt ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/30" : "bg-gray-100 dark:bg-slate-700/30 border-gray-200 dark:border-slate-600"}`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${detailAplikasi.a_sistem_internal_pt ? "bg-rose-500" : "bg-gray-300 dark:bg-slate-500"}`}></span>
                      <span className={`text-xs font-medium ${detailAplikasi.a_sistem_internal_pt ? "text-rose-700 dark:text-rose-400" : "text-gray-500 dark:text-slate-400"}`}>Internal PT</span>
                    </div>
                  </div>
                </div>

                {/* Tanggal */}
                <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Tanggal
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/60 dark:bg-slate-700/40 p-2.5 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400 block text-xs mb-1">Dibuat</span>
                      <span className="text-gray-900 dark:text-white text-sm font-medium">{formatDate(detailAplikasi.tgl_create)}</span>
                    </div>
                    <div className="bg-white/60 dark:bg-slate-700/40 p-2.5 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400 block text-xs mb-1">Update Terakhir</span>
                      <span className="text-gray-900 dark:text-white text-sm font-medium">{formatDate(detailAplikasi.last_update)}</span>
                    </div>
                    <div className="bg-white/60 dark:bg-slate-700/40 p-2.5 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400 block text-xs mb-1">Sync Terakhir</span>
                      <span className="text-gray-900 dark:text-white text-sm font-medium">{formatDate(detailAplikasi.last_sync)}</span>
                    </div>
                    <div className="bg-white/60 dark:bg-slate-700/40 p-2.5 rounded-lg">
                      <span className="text-gray-500 dark:text-gray-400 block text-xs mb-1">Expired</span>
                      <span className="text-gray-900 dark:text-white text-sm font-medium">{formatDate(detailAplikasi.expired_date)}</span>
                    </div>
                  </div>
                </div>

                {/* PJ List */}
                {detailAplikasi.pj_list && detailAplikasi.pj_list.length > 0 && (
                  <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Penanggung Jawab ({detailAplikasi.pj_list.length})
                    </h4>
                    <div className="overflow-x-auto rounded-lg border border-green-200/50 dark:border-green-800/30">
                      <table className="w-full text-sm">
                        <thead className="bg-green-100/50 dark:bg-green-900/30">
                          <tr>
                            <th className="text-left py-2.5 px-3 text-green-700 dark:text-green-400 font-medium text-xs">Nama</th>
                            <th className="text-left py-2.5 px-3 text-green-700 dark:text-green-400 font-medium text-xs">Username</th>
                            <th className="text-left py-2.5 px-3 text-green-700 dark:text-green-400 font-medium text-xs">Email</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800/50">
                          {detailAplikasi.pj_list.map((pj) => (
                            <tr key={pj.id_pj_aplikasi} className="border-t border-green-100 dark:border-green-900/30">
                              <td className="py-2 px-3 text-gray-900 dark:text-white">{pj.nm_pengguna}</td>
                              <td className="py-2 px-3 text-gray-600 dark:text-gray-300 font-mono text-xs">{pj.username}</td>
                              <td className="py-2 px-3 text-gray-600 dark:text-gray-300">{pj.email || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tables List */}
                {detailAplikasi.tables && detailAplikasi.tables.length > 0 && (
                  <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-200/50 dark:border-indigo-800/30">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      Tabel Akses ({detailAplikasi.tables.length})
                    </h4>
                    <div className="overflow-x-auto rounded-lg border border-indigo-200/50 dark:border-indigo-800/30">
                      <table className="w-full text-sm">
                        <thead className="bg-indigo-100/50 dark:bg-indigo-900/30">
                          <tr>
                            <th className="text-left py-2.5 px-3 text-indigo-700 dark:text-indigo-400 font-medium text-xs">Nama Tabel</th>
                            <th className="text-center py-2.5 px-3 text-indigo-700 dark:text-indigo-400 font-medium text-xs">GET</th>
                            <th className="text-center py-2.5 px-3 text-indigo-700 dark:text-indigo-400 font-medium text-xs">INSERT</th>
                            <th className="text-center py-2.5 px-3 text-indigo-700 dark:text-indigo-400 font-medium text-xs">UPDATE</th>
                            <th className="text-center py-2.5 px-3 text-indigo-700 dark:text-indigo-400 font-medium text-xs">DELETE</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800/50">
                          {detailAplikasi.tables.slice(0, 10).map((table) => (
                            <tr key={table.id_akses_table_app} className="border-t border-indigo-100 dark:border-indigo-900/30">
                              <td className="py-2 px-3 text-gray-900 dark:text-white font-mono text-xs">{table.nm_table}</td>
                              <td className="py-2 px-3 text-center">
                                <span className={`w-3 h-3 rounded-full inline-block ${table.a_boleh_get ? "bg-green-500" : "bg-gray-300 dark:bg-slate-500"}`}></span>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className={`w-3 h-3 rounded-full inline-block ${table.a_boleh_insert ? "bg-green-500" : "bg-gray-300 dark:bg-slate-500"}`}></span>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className={`w-3 h-3 rounded-full inline-block ${table.a_boleh_update ? "bg-green-500" : "bg-gray-300 dark:bg-slate-500"}`}></span>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className={`w-3 h-3 rounded-full inline-block ${table.a_boleh_delete ? "bg-green-500" : "bg-gray-300 dark:bg-slate-500"}`}></span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {detailAplikasi.tables.length > 10 && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 py-2 text-center bg-indigo-50/50 dark:bg-indigo-900/20">
                          Menampilkan 10 dari {detailAplikasi.tables.length} tabel
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                Gagal memuat detail aplikasi
              </div>
            )}
          </ModalBody>
          <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button
              variant="flat"
              onPress={() => {
                setIsDetailModalOpen(false);
                setDetailAplikasi(null);
              }}
            >
              Tutup
            </Button>
            {detailAplikasi && (
              <Button
                color="primary"
                startContent={<FiEdit2 className="w-4 h-4" />}
                onPress={() => {
                  setIsDetailModalOpen(false);
                  handleEdit(detailAplikasi);
                }}
              >
                Edit
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
