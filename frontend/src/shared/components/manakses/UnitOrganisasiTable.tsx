"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure } from "@heroui/react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { unitOrganisasiService, type UnitOrganisasi, type UnitOrganisasiStats, type UnitOrganisasiCreateData } from "@/lib/services/manakses/unitOrganisasiService";
import { toast } from "react-hot-toast";

interface UnitOrganisasiTableProps {
  onStatsLoaded?: (stats: UnitOrganisasiStats) => void;
}

export default function UnitOrganisasiTable({ onStatsLoaded }: UnitOrganisasiTableProps) {
  const [data, setData] = useState<UnitOrganisasi[]>([]);
  const [stats, setStats] = useState<UnitOrganisasiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal states
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<UnitOrganisasi | null>(null);
  const [formData, setFormData] = useState<UnitOrganisasiCreateData>({
    nm_lemb: "",
    jln: "",
    no_tel: "",
    email: "",
    website: "",
    level_organisasi: null,
    a_aktif: true,
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
        const statsData = await unitOrganisasiService.getStats();
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
        const response = await unitOrganisasiService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          status: filterStatus !== "all" ? (filterStatus as 'aktif' | 'nonaktif') : undefined,
        });

        setData(response.data);
        setTotalRecords(response.total);
      } catch (error) {
        console.error('Error loading unit organisasi:', error);
        toast.error('Gagal memuat data unit organisasi');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterStatus]);

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
      nm_lemb: "",
      jln: "",
      no_tel: "",
      email: "",
      website: "",
      level_organisasi: null,
      a_aktif: true,
    });
    onAddOpen();
  };

  const handleEdit = (item: UnitOrganisasi) => {
    setSelectedItem(item);
    setFormData({
      nm_lemb: item.nm_lemb,
      jln: item.jln || "",
      no_tel: item.no_tel || "",
      email: item.email || "",
      website: item.website || "",
      level_organisasi: item.level_organisasi,
      a_aktif: item.a_aktif,
    });
    onEditOpen();
  };

  const handleDelete = (item: UnitOrganisasi) => {
    setSelectedItem(item);
    onDeleteOpen();
  };

  const handleSubmitAdd = async () => {
    if (!formData.nm_lemb.trim()) {
      toast.error('Nama organisasi harus diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      await unitOrganisasiService.create(formData);
      toast.success('Unit organisasi berhasil ditambahkan');
      onAddClose();
      // Reload data
      setCurrentPage(1);
    } catch (error: unknown) {
      console.error('Error creating unit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal menambahkan unit organisasi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedItem || !formData.nm_lemb.trim()) {
      toast.error('Nama organisasi harus diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      await unitOrganisasiService.update(selectedItem.id_organisasi, formData);
      toast.success('Unit organisasi berhasil diperbarui');
      onEditClose();
      // Reload data
      const response = await unitOrganisasiService.getList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        status: filterStatus !== "all" ? (filterStatus as 'aktif' | 'nonaktif') : undefined,
      });
      setData(response.data);
    } catch (error: unknown) {
      console.error('Error updating unit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal memperbarui unit organisasi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await unitOrganisasiService.delete(selectedItem.id_organisasi);
      toast.success('Unit organisasi berhasil dihapus');
      onDeleteClose();
      // Reload data
      const response = await unitOrganisasiService.getList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        status: filterStatus !== "all" ? (filterStatus as 'aktif' | 'nonaktif') : undefined,
      });
      setData(response.data);
      setTotalRecords(response.total);
    } catch (error: unknown) {
      console.error('Error deleting unit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus unit organisasi';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<UnitOrganisasi>[] = [
    {
      key: "nm_lemb",
      label: "NAMA UNIT",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {item.nm_lemb}
          </div>
          {item.nm_induk_organisasi && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {item.nm_induk_organisasi}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "email",
      label: "KONTAK",
      render: (item) => (
        <div className="text-sm">
          {item.email && (
            <div className="text-gray-700 dark:text-gray-300">{item.email}</div>
          )}
          {item.no_tel && (
            <div className="text-gray-500 dark:text-gray-400 text-xs">{item.no_tel}</div>
          )}
          {!item.email && !item.no_tel && "-"}
        </div>
      ),
    },
    {
      key: "level_organisasi",
      label: "LEVEL",
      align: "center",
      width: "80px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={
            item.level_organisasi === 1 ? "primary" :
            item.level_organisasi === 2 ? "secondary" :
            item.level_organisasi === 3 ? "warning" : "default"
          }
        >
          {item.level_organisasi || "-"}
        </Chip>
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
          {item.a_aktif ? "Aktif" : "Tidak Aktif"}
        </Chip>
      ),
    },
    {
      key: "jumlah_child",
      label: "SUB UNIT",
      align: "center",
      width: "100px",
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.jumlah_child || 0}
        </span>
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
    <div className="flex items-center gap-3 w-full">
      <Select
        aria-label="Filter Status"
        placeholder="Semua Status"
        selectedKeys={[filterStatus]}
        onChange={(e) => {
          setFilterStatus(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-full max-w-[200px]",
          trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-8",
          popoverContent: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg",
          listbox: "bg-white dark:bg-gray-800",
        }}
        popoverProps={{
          classNames: {
            content: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg",
          },
        }}
        size="sm"
        variant="bordered"
      >
        <SelectItem key="all" value="all" className="text-gray-700 dark:text-gray-300 data-[hover=true]:bg-gray-100 dark:data-[hover=true]:bg-gray-700">
          Semua Status ({stats?.total_unit || 0})
        </SelectItem>
        <SelectItem key="aktif" value="aktif" className="text-gray-700 dark:text-gray-300 data-[hover=true]:bg-gray-100 dark:data-[hover=true]:bg-gray-700">
          Aktif ({stats?.total_aktif || 0})
        </SelectItem>
        <SelectItem key="nonaktif" value="nonaktif" className="text-gray-700 dark:text-gray-300 data-[hover=true]:bg-gray-100 dark:data-[hover=true]:bg-gray-700">
          Tidak Aktif ({stats?.total_nonaktif || 0})
        </SelectItem>
      </Select>
      <Button
        color="primary"
        startContent={<FiPlus className="w-4 h-4" />}
        onPress={handleAdd}
        size="sm"
      >
        Tambah Unit
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
            searchKeys={["nm_lemb", "email", "no_tel"]}
            searchPlaceholder="Cari nama unit, email, atau telepon..."
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
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
        <ModalContent>
          <ModalHeader>Tambah Unit Organisasi</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Nama Organisasi"
                placeholder="Masukkan nama organisasi"
                value={formData.nm_lemb}
                onChange={(e) => setFormData({ ...formData, nm_lemb: e.target.value })}
                isRequired
              />
              <Input
                label="Alamat"
                placeholder="Masukkan alamat"
                value={formData.jln || ""}
                onChange={(e) => setFormData({ ...formData, jln: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  placeholder="email@example.com"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Telepon"
                  placeholder="021-xxx"
                  value={formData.no_tel || ""}
                  onChange={(e) => setFormData({ ...formData, no_tel: e.target.value })}
                />
              </div>
              <Input
                label="Website"
                placeholder="https://..."
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Level Organisasi"
                  placeholder="Pilih level"
                  selectedKeys={formData.level_organisasi ? [String(formData.level_organisasi)] : []}
                  onChange={(e) => setFormData({ ...formData, level_organisasi: e.target.value ? parseInt(e.target.value) : null })}
                >
                  <SelectItem key="1" value="1">Level 1 (Universitas)</SelectItem>
                  <SelectItem key="2" value="2">Level 2 (Fakultas)</SelectItem>
                  <SelectItem key="3" value="3">Level 3 (Jurusan)</SelectItem>
                  <SelectItem key="4" value="4">Level 4 (Prodi)</SelectItem>
                </Select>
                <Select
                  label="Status"
                  placeholder="Pilih status"
                  selectedKeys={[formData.a_aktif ? "aktif" : "nonaktif"]}
                  onChange={(e) => setFormData({ ...formData, a_aktif: e.target.value === "aktif" })}
                >
                  <SelectItem key="aktif" value="aktif">Aktif</SelectItem>
                  <SelectItem key="nonaktif" value="nonaktif">Tidak Aktif</SelectItem>
                </Select>
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
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalContent>
          <ModalHeader>Edit Unit Organisasi</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Nama Organisasi"
                placeholder="Masukkan nama organisasi"
                value={formData.nm_lemb}
                onChange={(e) => setFormData({ ...formData, nm_lemb: e.target.value })}
                isRequired
              />
              <Input
                label="Alamat"
                placeholder="Masukkan alamat"
                value={formData.jln || ""}
                onChange={(e) => setFormData({ ...formData, jln: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  placeholder="email@example.com"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Telepon"
                  placeholder="021-xxx"
                  value={formData.no_tel || ""}
                  onChange={(e) => setFormData({ ...formData, no_tel: e.target.value })}
                />
              </div>
              <Input
                label="Website"
                placeholder="https://..."
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Level Organisasi"
                  placeholder="Pilih level"
                  selectedKeys={formData.level_organisasi ? [String(formData.level_organisasi)] : []}
                  onChange={(e) => setFormData({ ...formData, level_organisasi: e.target.value ? parseInt(e.target.value) : null })}
                >
                  <SelectItem key="1" value="1">Level 1 (Universitas)</SelectItem>
                  <SelectItem key="2" value="2">Level 2 (Fakultas)</SelectItem>
                  <SelectItem key="3" value="3">Level 3 (Jurusan)</SelectItem>
                  <SelectItem key="4" value="4">Level 4 (Prodi)</SelectItem>
                </Select>
                <Select
                  label="Status"
                  placeholder="Pilih status"
                  selectedKeys={[formData.a_aktif ? "aktif" : "nonaktif"]}
                  onChange={(e) => setFormData({ ...formData, a_aktif: e.target.value === "aktif" })}
                >
                  <SelectItem key="aktif" value="aktif">Aktif</SelectItem>
                  <SelectItem key="nonaktif" value="nonaktif">Tidak Aktif</SelectItem>
                </Select>
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
            <p>Apakah Anda yakin ingin menghapus unit organisasi <strong>{selectedItem?.nm_lemb}</strong>?</p>
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
