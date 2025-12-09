"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { FiMoreVertical, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { aplikasiService, type Aplikasi, type AplikasiStats } from "@/lib/services/manakses/aplikasiService";
import AplikasiFormModal from "./AplikasiFormModal";

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
  const [filterJenis, setFilterJenis] = useState<string>("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAplikasi, setEditingAplikasi] = useState<Aplikasi | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAplikasi, setDeletingAplikasi] = useState<Aplikasi | null>(null);
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
          jenis: filterJenis !== "all" ? (filterJenis as 'internal' | 'external') : undefined,
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
  }, [currentPage, rowsPerPage, searchQuery, filterStatus, filterJenis, refreshTrigger]);

  // Handlers
  const handleAdd = () => {
    setEditingAplikasi(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (aplikasi: Aplikasi) => {
    setEditingAplikasi(aplikasi);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (aplikasi: Aplikasi) => {
    setDeletingAplikasi(aplikasi);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAplikasi) return;

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
    } catch (error) {
      console.error("Error deleting aplikasi:", error);
      alert("Gagal menghapus aplikasi");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSuccess = async () => {
    setRefreshTrigger((prev) => prev + 1);
    // Reload stats
    const statsData = await aplikasiService.getStats();
    setStats(statsData);
    if (onStatsLoadedRef.current) {
      onStatsLoadedRef.current(statsData);
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
      key: "teknologi",
      label: "TEKNOLOGI",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
          {item.teknologi || "-"}
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      align: "center",
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.status === "Aktif" ? "success" : "danger"}
        >
          {item.status}
        </Chip>
      ),
    },
    {
      key: "jenis",
      label: "JENIS",
      align: "center",
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.jenis === "Internal" ? "primary" : "warning"}
        >
          {item.jenis}
        </Chip>
      ),
    },
    {
      key: "a_integrasi_cas",
      label: "SSO/CAS",
      align: "center",
      width: "80px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.a_integrasi_cas ? "success" : "default"}
        >
          {item.a_integrasi_cas ? "Ya" : "Tidak"}
        </Chip>
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
          <DropdownMenu aria-label="Aksi" className="min-w-[120px]">
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
          Semua Status ({stats?.total_aplikasi || 0})
        </SelectItem>
        <SelectItem key="aktif" value="aktif" textValue="Aktif">
          Aktif ({stats?.total_aktif || 0})
        </SelectItem>
        <SelectItem key="nonaktif" value="nonaktif" textValue="Tidak Aktif">
          Tidak Aktif ({stats?.total_nonaktif || 0})
        </SelectItem>
      </Select>
      <Select
        aria-label="Filter Jenis"
        placeholder="Semua Jenis"
        selectedKeys={[filterJenis]}
        onChange={(e) => {
          setFilterJenis(e.target.value || "all");
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
          if (!items || items.length === 0) return "Semua Jenis";
          const item = items[0];
          if (item.key === "all") return "Semua Jenis";
          return item.textValue || "Semua Jenis";
        }}
      >
        <SelectItem key="all" value="all" textValue="Semua Jenis">
          Semua Jenis ({stats?.total_aplikasi || 0})
        </SelectItem>
        <SelectItem key="internal" value="internal" textValue="Internal">
          Internal ({stats?.total_internal || 0})
        </SelectItem>
        <SelectItem key="external" value="external" textValue="External">
          External ({stats?.total_external || 0})
        </SelectItem>
      </Select>
    </div>
  );

  // Action slot with Add button
  const actionSlot = (
    <Button
      color="primary"
      startContent={<FiPlus className="w-4 h-4" />}
      onPress={handleAdd}
      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
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
    </motion.div>
  );
}
