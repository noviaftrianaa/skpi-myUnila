"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { FiEye, FiEdit2, FiMoreVertical, FiTrash2 } from "react-icons/fi";
import { penggunaService, type Pengguna, type PenggunaStats, type PenggunaDetail } from "@/lib/services/manakses/penggunaService";
import PenggunaDetailModal from "./PenggunaDetailModal";
import PenggunaEditModal from "./PenggunaEditModal";

interface PenggunaTableProps {
  onStatsLoaded?: (stats: PenggunaStats) => void;
}

export default function PenggunaTable({ onStatsLoaded }: PenggunaTableProps) {
  const [data, setData] = useState<Pengguna[]>([]);
  const [stats, setStats] = useState<PenggunaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSso, setFilterSso] = useState<string>("all");

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPenggunaId, setSelectedPenggunaId] = useState<string | null>(null);
  const [selectedPengguna, setSelectedPengguna] = useState<PenggunaDetail | null>(null);
  const [deletingPengguna, setDeletingPengguna] = useState<Pengguna | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
        const statsData = await penggunaService.getStats();
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

  // Load data function
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await penggunaService.getList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        status: filterStatus !== "all" ? (filterStatus as 'aktif' | 'nonaktif') : undefined,
        has_sso: filterSso !== "all" ? (filterSso as 'yes' | 'no') : undefined,
      });

      setData(response.data);
      setTotalRecords(response.total);
    } catch (error) {
      console.error('Error loading pengguna:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when filters change
  useEffect(() => {
    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterStatus, filterSso]);

  const handleViewDetail = (penggunaId: string) => {
    setSelectedPenggunaId(penggunaId);
    setDetailModalOpen(true);
  };

  const handleEditPengguna = async (pengguna: PenggunaDetail) => {
    setSelectedPengguna(pengguna);
    setDetailModalOpen(false);
    setEditModalOpen(true);
  };

  const handleEditFromRow = async (penggunaId: string) => {
    try {
      const detail = await penggunaService.getDetail(penggunaId);
      setSelectedPengguna(detail);
      setEditModalOpen(true);
    } catch (error) {
      console.error('Error loading pengguna for edit:', error);
    }
  };

  const handleEditSuccess = () => {
    // Reload data after edit
    loadData();
  };

  const handleDeleteClick = (pengguna: Pengguna) => {
    setDeletingPengguna(pengguna);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPengguna) return;

    setDeleteLoading(true);
    try {
      await penggunaService.delete(deletingPengguna.id_pengguna);
      loadData();
      setDeleteModalOpen(false);
      setDeletingPengguna(null);
    } catch (error) {
      console.error('Error deleting pengguna:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

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

  const formatDateTime = (dateString?: string | null) => {
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

  const columns: Column<Pengguna>[] = [
    {
      key: "nm_pengguna",
      label: "NAMA",
      sortable: true,
      render: (item) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {item.nm_pengguna}
        </div>
      ),
    },
    {
      key: "username",
      label: "USERNAME",
      render: (item) => (
        <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
          {item.username}
        </div>
      ),
    },
    {
      key: "email",
      label: "EMAIL",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
          {item.email || "-"}
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      align: "center",
      width: "120px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.a_aktif && !item.disable ? "success" : "danger"}
        >
          {item.a_aktif && !item.disable ? "Aktif" : "Tidak Aktif"}
        </Chip>
      ),
    },
    {
      key: "active_role",
      label: "ROLE AKTIF",
      width: "200px",
      render: (item) => (
        <div className="text-sm">
          {item.active_role ? (
            <>
              <div className="font-medium text-gray-900 dark:text-white">
                {item.active_role}
              </div>
              {item.active_organisasi && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.active_organisasi}
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "sumber_data",
      label: "SUMBER DATA",
      align: "center",
      width: "150px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.has_sso ? "primary" : "warning"}
        >
          {item.sumber_data}
        </Chip>
      ),
    },
    {
      key: "last_login_at",
      label: "LAST LOGIN",
      align: "center",
      width: "150px",
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDateTime(item.last_login_at)}
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
          <DropdownMenu aria-label="Aksi Pengguna" className="min-w-[120px]">
            <DropdownItem
              key="view"
              startContent={<FiEye className="w-4 h-4" />}
              onPress={() => handleViewDetail(item.id_pengguna)}
              className="text-gray-700 dark:text-gray-300"
            >
              Lihat Detail
            </DropdownItem>
            <DropdownItem
              key="edit"
              startContent={<FiEdit2 className="w-4 h-4" />}
              onPress={() => handleEditFromRow(item.id_pengguna)}
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

  // Filter slot
  const filterSlot = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
      <Select
        aria-label="Filter Status"
        placeholder="Semua Status"
        selectedKeys={[filterStatus]}
        onChange={(e) => {
          setFilterStatus(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-full",
          trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-8",
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
          Semua Status ({stats?.total_pengguna || 0})
        </SelectItem>
        <SelectItem key="aktif" value="aktif" textValue="Aktif">
          Aktif ({stats?.total_aktif || 0})
        </SelectItem>
        <SelectItem key="nonaktif" value="nonaktif" textValue="Tidak Aktif">
          Tidak Aktif ({stats?.total_nonaktif || 0})
        </SelectItem>
      </Select>
      <Select
        aria-label="Filter Sumber Data"
        placeholder="Semua Sumber"
        selectedKeys={[filterSso]}
        onChange={(e) => {
          setFilterSso(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-full",
          trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-8",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        size="sm"
        variant="bordered"
        renderValue={(items) => {
          if (!items || items.length === 0) return "Semua Sumber";
          const item = items[0];
          if (item.key === "all") return "Semua Sumber";
          return item.textValue || "Semua Sumber";
        }}
      >
        <SelectItem key="all" value="all" textValue="Semua Sumber">
          Semua Sumber ({stats?.total_pengguna || 0})
        </SelectItem>
        <SelectItem key="yes" value="yes" textValue="SSO Radius">
          SSO Radius ({stats?.total_sso || 0})
        </SelectItem>
        <SelectItem key="no" value="no" textValue="Manajemen Akses">
          Manajemen Akses ({stats?.total_non_sso || 0})
        </SelectItem>
      </Select>
    </div>
  );

  return (
    <>
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
            searchKeys={["nm_pengguna", "username", "email"]}
            searchPlaceholder="Cari nama, username, atau email..."
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
            className="shadow-lg"
          />
        </motion.div>
      </motion.div>

      {/* Detail Modal */}
      <PenggunaDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedPenggunaId(null);
        }}
        penggunaId={selectedPenggunaId}
        onEdit={handleEditPengguna}
      />

      {/* Edit Modal */}
      <PenggunaEditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedPengguna(null);
        }}
        pengguna={selectedPengguna}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingPengguna(null);
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
              Apakah Anda yakin ingin menghapus pengguna{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {deletingPengguna?.nm_pengguna}
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
                setDeleteModalOpen(false);
                setDeletingPengguna(null);
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
    </>
  );
}
