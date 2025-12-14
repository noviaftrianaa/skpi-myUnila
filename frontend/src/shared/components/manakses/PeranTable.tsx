"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { FiPlus, FiEdit2, FiTrash2, FiMoreVertical } from "react-icons/fi";
import { peranService, type Peran, type PeranStats, type PeranCreateData } from "@/lib/services/manakses/peranService";
import toast from "react-hot-toast";

interface PeranTableProps {
  onStatsLoaded?: (stats: PeranStats) => void;
}

export default function PeranTable({ onStatsLoaded }: PeranTableProps) {
  const [data, setData] = useState<Peran[]>([]);
  const [stats, setStats] = useState<PeranStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState<string>("nm_peran");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modal states
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<Peran | null>(null);
  const [formData, setFormData] = useState<PeranCreateData>({
    nm_peran: "",
    a_perlu_sk: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const statsData = await peranService.getStats();
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
        const response = await peranService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          sort_by: sortBy as 'id_peran' | 'nm_peran' | 'jumlah_pengguna' | 'tgl_create' | 'last_update',
          sort_order: sortOrder,
        });

        setData(response.data);
        setTotalRecords(response.total);
      } catch (error) {
        console.error('Error loading peran:', error);
        toast.error('Gagal memuat data peran');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, sortBy, sortOrder]);

  // Handle sort change
  const handleSortChange = (column: string, direction: "asc" | "desc") => {
    setSortBy(column);
    setSortOrder(direction);
    setCurrentPage(1);
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

  const handleAdd = () => {
    setFormData({
      nm_peran: "",
      a_perlu_sk: false,
    });
    onAddOpen();
  };

  const handleEdit = (item: Peran) => {
    setSelectedItem(item);
    setFormData({
      nm_peran: item.nm_peran,
      a_perlu_sk: item.a_perlu_sk,
    });
    onEditOpen();
  };

  const handleDelete = (item: Peran) => {
    setSelectedItem(item);
    onDeleteOpen();
  };

  const handleSubmitAdd = async () => {
    if (!formData.nm_peran.trim()) {
      toast.error('Nama peran harus diisi', {
        duration: 3000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#EF4444" },
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await peranService.create(formData);
      toast.success('Peran berhasil ditambahkan', {
        duration: 3000,
        style: { borderRadius: "12px", background: "#10B981", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#10B981" },
      });
      onAddClose();
      setCurrentPage(1);
      // Reload stats
      const statsData = await peranService.getStats();
      setStats(statsData);
      if (onStatsLoadedRef.current) {
        onStatsLoadedRef.current(statsData);
      }
    } catch (error: unknown) {
      console.error('Error creating peran:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal menambahkan peran';
      toast.error(errorMessage, {
        duration: 4000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#EF4444" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedItem || !formData.nm_peran.trim()) {
      toast.error('Nama peran harus diisi', {
        duration: 3000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#EF4444" },
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await peranService.update(selectedItem.id_peran, formData);
      toast.success('Peran berhasil diperbarui', {
        duration: 3000,
        style: { borderRadius: "12px", background: "#10B981", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#10B981" },
      });
      onEditClose();
      // Reload data
      const response = await peranService.getList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
      });
      setData(response.data);
    } catch (error: unknown) {
      console.error('Error updating peran:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal memperbarui peran';
      toast.error(errorMessage, {
        duration: 4000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#EF4444" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    const deletedName = selectedItem.nm_peran;
    setIsSubmitting(true);
    try {
      await peranService.delete(selectedItem.id_peran);
      toast.success(`Peran "${deletedName}" berhasil dihapus`, {
        duration: 3000,
        style: { borderRadius: "12px", background: "#10B981", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#10B981" },
      });
      onDeleteClose();
      // Reload data
      const response = await peranService.getList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
      });
      setData(response.data);
      setTotalRecords(response.total);
      // Reload stats
      const statsData = await peranService.getStats();
      setStats(statsData);
      if (onStatsLoadedRef.current) {
        onStatsLoadedRef.current(statsData);
      }
    } catch (error: unknown) {
      console.error('Error deleting peran:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus peran';
      toast.error(errorMessage, {
        duration: 4000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#EF4444" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Peran>[] = [
    {
      key: "id_peran",
      label: "ID",
      width: "80px",
      render: (item) => (
        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
          {item.id_peran}
        </span>
      ),
    },
    {
      key: "nm_peran",
      label: "NAMA PERAN",
      sortable: true,
      render: (item) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {item.nm_peran}
        </div>
      ),
    },
    {
      key: "a_perlu_sk",
      label: "PERLU SK",
      align: "center",
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.a_perlu_sk ? "warning" : "default"}
        >
          {item.a_perlu_sk ? "Ya" : "Tidak"}
        </Chip>
      ),
    },
    {
      key: "jumlah_pengguna",
      label: "JUMLAH PENGGUNA",
      align: "center",
      width: "140px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.jumlah_pengguna > 0 ? "primary" : "default"}
        >
          {item.jumlah_pengguna || 0} pengguna
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
              onPress={() => handleDelete(item)}
              color="danger"
              className="text-danger"
              isDisabled={item.jumlah_pengguna > 0}
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
      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-md hover:shadow-lg transition-all rounded-lg"
      size="sm"
    >
      Tambah Data
    </Button>
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
            searchKeys={["nm_peran"]}
            searchPlaceholder="Cari nama peran..."
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
      </motion.div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={onAddClose}
        size="md"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Tambah Peran
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Isi form berikut untuk menambahkan peran baru
            </p>
          </ModalHeader>
          <ModalBody className="px-6 py-5">
            <div className="space-y-5">
              {/* Informasi Dasar */}
              <div className="bg-gray-50/80 dark:bg-slate-700/20 rounded-xl p-4 border border-gray-200/80 dark:border-slate-600/50">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Informasi Dasar
                </h4>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Nama Peran <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Masukkan nama peran"
                    value={formData.nm_peran}
                    onChange={(e) => setFormData({ ...formData, nm_peran: e.target.value })}
                    variant="bordered"
                    size="sm"
                    classNames={{
                      input: "text-gray-900 dark:text-white",
                      inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                    }}
                  />
                </div>
              </div>

              {/* Pengaturan */}
              <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Pengaturan
                </h4>
                <label
                  className={`flex items-start gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-all ${
                    formData.a_perlu_sk
                      ? "border-amber-400 bg-white dark:bg-amber-900/20 shadow-sm"
                      : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.a_perlu_sk}
                    onChange={(e) => setFormData({ ...formData, a_perlu_sk: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Perlu SK Penugasan</span>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Peran ini memerlukan SK untuk aktivasi
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="flat" onPress={onAddClose} isDisabled={isSubmitting} className="font-medium">
              Batal
            </Button>
            <Button
              color="primary"
              onPress={handleSubmitAdd}
              isLoading={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={onEditClose}
        size="md"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Edit Peran
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ubah informasi peran di bawah ini
            </p>
          </ModalHeader>
          <ModalBody className="px-6 py-5">
            <div className="space-y-5">
              {/* Informasi Dasar */}
              <div className="bg-gray-50/80 dark:bg-slate-700/20 rounded-xl p-4 border border-gray-200/80 dark:border-slate-600/50">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Informasi Dasar
                </h4>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Nama Peran <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Masukkan nama peran"
                    value={formData.nm_peran}
                    onChange={(e) => setFormData({ ...formData, nm_peran: e.target.value })}
                    variant="bordered"
                    size="sm"
                    classNames={{
                      input: "text-gray-900 dark:text-white",
                      inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                    }}
                  />
                </div>
              </div>

              {/* Pengaturan */}
              <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Pengaturan
                </h4>
                <label
                  className={`flex items-start gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-all ${
                    formData.a_perlu_sk
                      ? "border-amber-400 bg-white dark:bg-amber-900/20 shadow-sm"
                      : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.a_perlu_sk}
                    onChange={(e) => setFormData({ ...formData, a_perlu_sk: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Perlu SK Penugasan</span>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Peran ini memerlukan SK untuk aktivasi
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="flat" onPress={onEditClose} isDisabled={isSubmitting} className="font-medium">
              Batal
            </Button>
            <Button
              color="primary"
              onPress={handleSubmitEdit}
              isLoading={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Simpan Perubahan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
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
              Apakah Anda yakin ingin menghapus peran{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {selectedItem?.nm_peran}
              </span>
              ?
            </p>
            {selectedItem && selectedItem.jumlah_pengguna > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Peringatan: Peran ini memiliki {selectedItem.jumlah_pengguna} pengguna yang terhubung.
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </ModalBody>
          <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="flat" onPress={onDeleteClose} isDisabled={isSubmitting}>
              Batal
            </Button>
            <Button color="danger" onPress={handleConfirmDelete} isLoading={isSubmitting}>
              Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
