"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { FiMoreVertical, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { kategoriAplikasiService, type KategoriAplikasiListItem, type KategoriAplikasiStats } from "@/lib/services/manakses/kategoriAplikasiService";
import KategoriAplikasiFormModal from "./KategoriAplikasiFormModal";
import toast from "react-hot-toast";

interface KategoriAplikasiTableProps {
  onStatsLoaded?: (stats: KategoriAplikasiStats) => void;
}

export default function KategoriAplikasiTable({ onStatsLoaded }: KategoriAplikasiTableProps) {
  const [data, setData] = useState<KategoriAplikasiListItem[]>([]);
  const [stats, setStats] = useState<KategoriAplikasiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sortBy, setSortBy] = useState<string>("urutan");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingKategori, setEditingKategori] = useState<KategoriAplikasiListItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingKategori, setDeletingKategori] = useState<KategoriAplikasiListItem | null>(null);
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
        const statsData = await kategoriAplikasiService.getStats();
        setStats(statsData);
        if (onStatsLoadedRef.current) {
          onStatsLoadedRef.current(statsData);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, []);

  // Load data when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await kategoriAplikasiService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          sort_by: sortBy as 'nm_kategori' | 'urutan' | 'jumlah_aplikasi' | 'tgl_create' | 'last_update',
          sort_order: sortOrder,
        });

        setData(response.data);
        setTotalRecords(response.total);
      } catch (error) {
        console.error('Error loading kategori:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, refreshTrigger, sortBy, sortOrder]);

  // Handle sort change
  const handleSortChange = (column: string, direction: "asc" | "desc") => {
    setSortBy(column);
    setSortOrder(direction);
    setCurrentPage(1);
  };

  // Handlers
  const handleAdd = () => {
    setEditingKategori(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (kategori: KategoriAplikasiListItem) => {
    setEditingKategori(kategori);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (kategori: KategoriAplikasiListItem) => {
    setDeletingKategori(kategori);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingKategori) return;

    const deletedName = deletingKategori.nm_kategori;
    setDeleteLoading(true);
    try {
      await kategoriAplikasiService.delete(deletingKategori.id_kategori);
      setRefreshTrigger((prev) => prev + 1);
      setIsDeleteModalOpen(false);
      setDeletingKategori(null);
      // Reload stats
      const statsData = await kategoriAplikasiService.getStats();
      setStats(statsData);
      if (onStatsLoadedRef.current) {
        onStatsLoadedRef.current(statsData);
      }
      toast.success(`Kategori "${deletedName}" berhasil dihapus`, {
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
    } catch (error: unknown) {
      console.error("Error deleting kategori:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || "Gagal menghapus kategori", {
        duration: 4000,
        style: {
          borderRadius: "12px",
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#EF4444",
        },
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSuccess = async () => {
    setRefreshTrigger((prev) => prev + 1);
    // Reload stats
    const statsData = await kategoriAplikasiService.getStats();
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

  // Get color from tailwind class
  const getColorFromClass = (colorClass: string | null): string => {
    if (!colorClass) return "#6B7280";
    const colorMap: Record<string, string> = {
      "text-blue-500": "#3B82F6",
      "text-indigo-500": "#6366F1",
      "text-purple-500": "#A855F7",
      "text-pink-500": "#EC4899",
      "text-red-500": "#EF4444",
      "text-orange-500": "#F97316",
      "text-amber-500": "#F59E0B",
      "text-yellow-500": "#EAB308",
      "text-lime-500": "#84CC16",
      "text-green-500": "#22C55E",
      "text-emerald-500": "#10B981",
      "text-teal-500": "#14B8A6",
      "text-cyan-500": "#06B6D4",
      "text-sky-500": "#0EA5E9",
      "text-gray-500": "#6B7280",
      "text-slate-500": "#64748B",
    };
    return colorMap[colorClass] || "#6B7280";
  };

  const columns: Column<KategoriAplikasiListItem>[] = [
    {
      key: "nm_kategori",
      label: "NAMA KATEGORI",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: getColorFromClass(item.icon_color) + "20" }}
          >
            <span style={{ color: getColorFromClass(item.icon_color) }} className="text-lg font-bold">
              {item.nm_kategori.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {item.nm_kategori}
            </div>
            {item.icon_kategori && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {item.icon_kategori}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "jumlah_aplikasi",
      label: "JUMLAH APLIKASI",
      align: "center",
      width: "140px",
      sortable: true,
      render: (item) => (
        <Chip size="sm" variant="flat" color="primary">
          {item.jumlah_aplikasi} App
        </Chip>
      ),
    },
    {
      key: "urutan",
      label: "URUTAN",
      align: "center",
      width: "100px",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {item.urutan}
        </span>
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
          color={item.a_aktif ? "success" : "danger"}
        >
          {item.a_aktif ? "Aktif" : "Nonaktif"}
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
      width: "100px",
      render: (item) => (
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Aksi"
            className="min-w-[120px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg rounded-lg"
          >
            <DropdownItem
              key="edit"
              startContent={<FiEdit2 className="w-4 h-4" />}
              onPress={() => handleEdit(item)}
            >
              Edit
            </DropdownItem>
            <DropdownItem
              key="delete"
              startContent={<FiTrash2 className="w-4 h-4" />}
              onPress={() => handleDeleteClick(item)}
              color="danger"
              className="text-danger"
              isDisabled={item.jumlah_aplikasi > 0}
            >
              Hapus
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ),
    },
  ];

  // Action slot with Add button
  const actionSlot = (
    <Button
      color="primary"
      startContent={<FiPlus className="w-4 h-4" />}
      onPress={handleAdd}
      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all rounded-lg"
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
          searchKeys={["nm_kategori"]}
          searchPlaceholder="Cari nama kategori..."
          defaultRowsPerPage={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
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
          actionSlot={actionSlot}
          className="shadow-lg"
        />
      </motion.div>

      {/* Form Modal */}
      <KategoriAplikasiFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingKategori(null);
        }}
        onSuccess={handleFormSuccess}
        kategori={editingKategori}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingKategori(null);
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
              Apakah Anda yakin ingin menghapus kategori{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {deletingKategori?.nm_kategori}
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
                setDeletingKategori(null);
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
