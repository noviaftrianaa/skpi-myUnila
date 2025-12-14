"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { FiPlus, FiEdit2, FiTrash2, FiMoreVertical } from "react-icons/fi";
import { unitOrganisasiService, type UnitOrganisasi, type UnitOrganisasiStats, type UnitOrganisasiCreateData } from "@/lib/services/manakses/unitOrganisasiService";
import toast from "react-hot-toast";

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
  const [sortBy, setSortBy] = useState<string>("nm_lemb");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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
          sort_by: sortBy as 'nm_lemb' | 'email' | 'level_organisasi' | 'nm_induk_organisasi' | 'tgl_create' | 'last_update',
          sort_order: sortOrder,
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
  }, [currentPage, rowsPerPage, searchQuery, filterStatus, sortBy, sortOrder]);

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
      toast.error('Nama organisasi harus diisi', {
        duration: 3000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#EF4444" },
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await unitOrganisasiService.create(formData);
      toast.success('Unit organisasi berhasil ditambahkan', {
        duration: 3000,
        style: { borderRadius: "12px", background: "#10B981", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#10B981" },
      });
      onAddClose();
      setCurrentPage(1);
    } catch (error: unknown) {
      console.error('Error creating unit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal menambahkan unit organisasi';
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
    if (!selectedItem || !formData.nm_lemb.trim()) {
      toast.error('Nama organisasi harus diisi', {
        duration: 3000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#EF4444" },
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await unitOrganisasiService.update(selectedItem.id_organisasi, formData);
      toast.success('Unit organisasi berhasil diperbarui', {
        duration: 3000,
        style: { borderRadius: "12px", background: "#10B981", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#10B981" },
      });
      onEditClose();
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
    const deletedName = selectedItem.nm_lemb;
    setIsSubmitting(true);
    try {
      await unitOrganisasiService.delete(selectedItem.id_organisasi);
      toast.success(`Unit organisasi "${deletedName}" berhasil dihapus`, {
        duration: 3000,
        style: { borderRadius: "12px", background: "#10B981", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#10B981" },
      });
      onDeleteClose();
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
      toast.error(errorMessage, {
        duration: 4000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#EF4444" },
      });
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
    <div className="flex items-center gap-2 flex-wrap">
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
          Semua Status ({stats?.total_unit || 0})
        </SelectItem>
        <SelectItem key="aktif" value="aktif" textValue="Aktif">
          Aktif ({stats?.total_aktif || 0})
        </SelectItem>
        <SelectItem key="nonaktif" value="nonaktif" textValue="Tidak Aktif">
          Tidak Aktif ({stats?.total_nonaktif || 0})
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
      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all rounded-lg"
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
            onSortChange={handleSortChange}
            filterSlot={filterSlot}
            actionSlot={actionSlot}
            className="shadow-lg"
          />
        </motion.div>
      </motion.div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={onAddClose}
        size="lg"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
          closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tambah Unit Organisasi</h3>
            <p className="text-sm font-normal text-gray-600 dark:text-slate-400">Tambahkan unit organisasi baru ke sistem</p>
          </ModalHeader>
          <ModalBody className="px-6 py-5">
            <div className="space-y-5">
              <div className="bg-gray-50/80 dark:bg-slate-700/20 rounded-xl p-4 border border-gray-200/80 dark:border-slate-600/50">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Informasi Dasar
                </h4>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Nama Organisasi <span className="text-red-500">*</span></label>
                    <Input placeholder="Masukkan nama organisasi" value={formData.nm_lemb} onChange={(e) => setFormData({ ...formData, nm_lemb: e.target.value })} variant="bordered" size="sm" classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm" }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Alamat</label>
                    <Input placeholder="Masukkan alamat" value={formData.jln || ""} onChange={(e) => setFormData({ ...formData, jln: e.target.value })} variant="bordered" size="sm" classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Level Organisasi</label>
                      <Select aria-label="Level" placeholder="Pilih level" selectedKeys={formData.level_organisasi ? [String(formData.level_organisasi)] : []} onChange={(e) => setFormData({ ...formData, level_organisasi: e.target.value ? parseInt(e.target.value) : null })} variant="bordered" size="sm" classNames={{ trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm", value: "text-gray-900 dark:text-white", popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg" }}>
                        <SelectItem key="1" value="1">Level 1 (Universitas)</SelectItem>
                        <SelectItem key="2" value="2">Level 2 (Fakultas)</SelectItem>
                        <SelectItem key="3" value="3">Level 3 (Jurusan)</SelectItem>
                        <SelectItem key="4" value="4">Level 4 (Prodi)</SelectItem>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Status</label>
                      <Select aria-label="Status" placeholder="Pilih status" selectedKeys={[formData.a_aktif ? "aktif" : "nonaktif"]} onChange={(e) => setFormData({ ...formData, a_aktif: e.target.value === "aktif" })} variant="bordered" size="sm" classNames={{ trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm", value: "text-gray-900 dark:text-white", popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg" }}>
                        <SelectItem key="aktif" value="aktif">Aktif</SelectItem>
                        <SelectItem key="nonaktif" value="nonaktif">Tidak Aktif</SelectItem>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Kontak
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Email</label>
                      <Input placeholder="email@example.com" type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} variant="bordered" size="sm" classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm" }} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Telepon</label>
                      <Input placeholder="021-xxx" value={formData.no_tel || ""} onChange={(e) => setFormData({ ...formData, no_tel: e.target.value })} variant="bordered" size="sm" classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm" }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Website</label>
                    <Input placeholder="https://..." value={formData.website || ""} onChange={(e) => setFormData({ ...formData, website: e.target.value })} variant="bordered" size="sm" classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm" }} />
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="flat" onPress={onAddClose} className="font-medium">Batal</Button>
            <Button color="primary" onPress={handleSubmitAdd} isLoading={isSubmitting} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">Simpan</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={onEditClose}
        size="lg"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
          closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Unit Organisasi</h3>
            <p className="text-sm font-normal text-gray-600 dark:text-slate-400">Perbarui data unit organisasi</p>
          </ModalHeader>
          <ModalBody className="px-6 py-5">
            <div className="space-y-5">
              <div className="bg-gray-50/80 dark:bg-slate-700/20 rounded-xl p-4 border border-gray-200/80 dark:border-slate-600/50">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Informasi Dasar
                </h4>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Nama Organisasi <span className="text-red-500">*</span></label>
                    <Input placeholder="Masukkan nama organisasi" value={formData.nm_lemb} onChange={(e) => setFormData({ ...formData, nm_lemb: e.target.value })} variant="bordered" size="sm" classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm" }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Alamat</label>
                    <Input placeholder="Masukkan alamat" value={formData.jln || ""} onChange={(e) => setFormData({ ...formData, jln: e.target.value })} variant="bordered" size="sm" classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Level Organisasi</label>
                      <Select aria-label="Level" placeholder="Pilih level" selectedKeys={formData.level_organisasi ? [String(formData.level_organisasi)] : []} onChange={(e) => setFormData({ ...formData, level_organisasi: e.target.value ? parseInt(e.target.value) : null })} variant="bordered" size="sm" classNames={{ trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm", value: "text-gray-900 dark:text-white", popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg" }}>
                        <SelectItem key="1" value="1">Level 1 (Universitas)</SelectItem>
                        <SelectItem key="2" value="2">Level 2 (Fakultas)</SelectItem>
                        <SelectItem key="3" value="3">Level 3 (Jurusan)</SelectItem>
                        <SelectItem key="4" value="4">Level 4 (Prodi)</SelectItem>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Status</label>
                      <Select aria-label="Status" placeholder="Pilih status" selectedKeys={[formData.a_aktif ? "aktif" : "nonaktif"]} onChange={(e) => setFormData({ ...formData, a_aktif: e.target.value === "aktif" })} variant="bordered" size="sm" classNames={{ trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm", value: "text-gray-900 dark:text-white", popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg" }}>
                        <SelectItem key="aktif" value="aktif">Aktif</SelectItem>
                        <SelectItem key="nonaktif" value="nonaktif">Tidak Aktif</SelectItem>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Kontak
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Email</label>
                      <Input placeholder="email@example.com" type="email" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} variant="bordered" size="sm" classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm" }} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Telepon</label>
                      <Input placeholder="021-xxx" value={formData.no_tel || ""} onChange={(e) => setFormData({ ...formData, no_tel: e.target.value })} variant="bordered" size="sm" classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm" }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Website</label>
                    <Input placeholder="https://..." value={formData.website || ""} onChange={(e) => setFormData({ ...formData, website: e.target.value })} variant="bordered" size="sm" classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm" }} />
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="flat" onPress={onEditClose} className="font-medium">Batal</Button>
            <Button color="primary" onPress={handleSubmitEdit} isLoading={isSubmitting} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">Simpan Perubahan</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
          closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        }}
      >
        <ModalContent>
          <ModalHeader className="text-gray-900 dark:text-white">Konfirmasi Hapus</ModalHeader>
          <ModalBody>
            <p className="text-gray-700 dark:text-gray-300">Apakah Anda yakin ingin menghapus unit organisasi <strong>{selectedItem?.nm_lemb}</strong>?</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>Batal</Button>
            <Button color="danger" onPress={handleConfirmDelete} isLoading={isSubmitting}>Hapus</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
