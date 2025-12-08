"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Switch, useDisclosure } from "@heroui/react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { peranService, type Peran, type PeranStats, type PeranCreateData } from "@/lib/services/manakses/peranService";
import { toast } from "react-hot-toast";

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
  }, [currentPage, rowsPerPage, searchQuery]);

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
      toast.error('Nama peran harus diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      await peranService.create(formData);
      toast.success('Peran berhasil ditambahkan');
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
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedItem || !formData.nm_peran.trim()) {
      toast.error('Nama peran harus diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      await peranService.update(selectedItem.id_peran, formData);
      toast.success('Peran berhasil diperbarui');
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
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await peranService.delete(selectedItem.id_peran);
      toast.success('Peran berhasil dihapus');
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
      toast.error(errorMessage);
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
      width: "100px",
      render: (item) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="primary"
            onPress={() => handleEdit(item)}
          >
            <FiEdit2 className="w-4 h-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            onPress={() => handleDelete(item)}
          >
            <FiTrash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Filter slot
  const filterSlot = (
    <div className="flex items-center gap-3 w-full justify-end">
      <Button
        color="primary"
        startContent={<FiPlus className="w-4 h-4" />}
        onPress={handleAdd}
        size="sm"
      >
        Tambah Peran
      </Button>
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
            searchKeys={["nm_peran"]}
            searchPlaceholder="Cari nama peran..."
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

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalContent>
          <ModalHeader>Tambah Peran</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Nama Peran"
                placeholder="Masukkan nama peran"
                value={formData.nm_peran}
                onChange={(e) => setFormData({ ...formData, nm_peran: e.target.value })}
                isRequired
              />
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Perlu SK Penugasan</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Peran ini memerlukan SK untuk aktivasi
                  </p>
                </div>
                <Switch
                  isSelected={formData.a_perlu_sk}
                  onValueChange={(value) => setFormData({ ...formData, a_perlu_sk: value })}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onAddClose}>Batal</Button>
            <Button color="primary" onPress={handleSubmitAdd} isLoading={isSubmitting}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalContent>
          <ModalHeader>Edit Peran</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Nama Peran"
                placeholder="Masukkan nama peran"
                value={formData.nm_peran}
                onChange={(e) => setFormData({ ...formData, nm_peran: e.target.value })}
                isRequired
              />
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Perlu SK Penugasan</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Peran ini memerlukan SK untuk aktivasi
                  </p>
                </div>
                <Switch
                  isSelected={formData.a_perlu_sk}
                  onValueChange={(value) => setFormData({ ...formData, a_perlu_sk: value })}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onEditClose}>Batal</Button>
            <Button color="primary" onPress={handleSubmitEdit} isLoading={isSubmitting}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Konfirmasi Hapus</ModalHeader>
          <ModalBody>
            <p>Apakah Anda yakin ingin menghapus peran <strong>{selectedItem?.nm_peran}</strong>?</p>
            {selectedItem && selectedItem.jumlah_pengguna > 0 && (
              <p className="text-sm text-warning-600 mt-2">
                Peringatan: Peran ini memiliki {selectedItem.jumlah_pengguna} pengguna yang terhubung.
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>Batal</Button>
            <Button color="danger" onPress={handleConfirmDelete} isLoading={isSubmitting}>
              Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
