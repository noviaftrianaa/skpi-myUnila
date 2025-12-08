"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Switch, useDisclosure } from "@heroui/react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { rolePenggunaService, type RolePengguna, type RolePenggunaCreateData } from "@/lib/services/manakses/rolePenggunaService";
import { peranService, type PeranOption } from "@/lib/services/manakses/peranService";
import { unitOrganisasiService, type UnitOrganisasiOption } from "@/lib/services/manakses/unitOrganisasiService";
import { toast } from "react-hot-toast";

export default function RolePenggunaTable() {
  const [data, setData] = useState<RolePengguna[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterPeran, setFilterPeran] = useState<string>("all");

  // Dropdown options
  const [peranOptions, setPeranOptions] = useState<PeranOption[]>([]);
  const [unitOptions, setUnitOptions] = useState<UnitOrganisasiOption[]>([]);

  // Modal states
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<RolePengguna | null>(null);
  const [formData, setFormData] = useState<RolePenggunaCreateData>({
    id_pengguna: "",
    id_peran: 0,
    id_organisasi: null,
    sk_penugasan: null,
    tgl_sk_penugasan: null,
    approval_peran: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Load dropdown options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [peranData, unitData] = await Promise.all([
          peranService.getAll(),
          unitOrganisasiService.getAll(),
        ]);
        setPeranOptions(peranData);
        setUnitOptions(unitData);
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };
    loadOptions();
  }, []);

  // Load data when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await rolePenggunaService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          id_peran: filterPeran !== "all" ? parseInt(filterPeran) : undefined,
        });

        setData(response.data);
        setTotalRecords(response.total);
      } catch (error) {
        console.error('Error loading role pengguna:', error);
        toast.error('Gagal memuat data role pengguna');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterPeran]);

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
      id_pengguna: "",
      id_peran: 0,
      id_organisasi: null,
      sk_penugasan: null,
      tgl_sk_penugasan: null,
      approval_peran: false,
    });
    onAddOpen();
  };

  const handleEdit = (item: RolePengguna) => {
    setSelectedItem(item);
    setFormData({
      id_pengguna: item.id_pengguna,
      id_peran: item.id_peran,
      id_organisasi: item.id_organisasi,
      sk_penugasan: item.sk_penugasan,
      tgl_sk_penugasan: item.tgl_sk_penugasan,
      approval_peran: item.approval_peran,
    });
    onEditOpen();
  };

  const handleDelete = (item: RolePengguna) => {
    setSelectedItem(item);
    onDeleteOpen();
  };

  const handleSubmitAdd = async () => {
    if (!formData.id_pengguna.trim()) {
      toast.error('ID Pengguna harus diisi');
      return;
    }
    if (!formData.id_peran) {
      toast.error('Peran harus dipilih');
      return;
    }
    setIsSubmitting(true);
    try {
      await rolePenggunaService.create(formData);
      toast.success('Role pengguna berhasil ditambahkan');
      onAddClose();
      setCurrentPage(1);
    } catch (error: unknown) {
      console.error('Error creating role pengguna:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal menambahkan role pengguna';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedItem) return;
    if (!formData.id_peran) {
      toast.error('Peran harus dipilih');
      return;
    }
    setIsSubmitting(true);
    try {
      await rolePenggunaService.update(selectedItem.id_role_pengguna, {
        id_peran: formData.id_peran,
        id_organisasi: formData.id_organisasi,
        sk_penugasan: formData.sk_penugasan,
        tgl_sk_penugasan: formData.tgl_sk_penugasan,
        approval_peran: formData.approval_peran,
      });
      toast.success('Role pengguna berhasil diperbarui');
      onEditClose();
      // Reload data
      const response = await rolePenggunaService.getList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        id_peran: filterPeran !== "all" ? parseInt(filterPeran) : undefined,
      });
      setData(response.data);
    } catch (error: unknown) {
      console.error('Error updating role pengguna:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal memperbarui role pengguna';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await rolePenggunaService.delete(selectedItem.id_role_pengguna);
      toast.success('Role pengguna berhasil dihapus');
      onDeleteClose();
      // Reload data
      const response = await rolePenggunaService.getList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        id_peran: filterPeran !== "all" ? parseInt(filterPeran) : undefined,
      });
      setData(response.data);
      setTotalRecords(response.total);
    } catch (error: unknown) {
      console.error('Error deleting role pengguna:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus role pengguna';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<RolePengguna>[] = [
    {
      key: "nm_pengguna",
      label: "PENGGUNA",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {item.nm_pengguna}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {item.username}
          </div>
        </div>
      ),
    },
    {
      key: "nm_peran",
      label: "PERAN",
      render: (item) => (
        <Chip size="sm" variant="flat" color="primary">
          {item.nm_peran}
        </Chip>
      ),
    },
    {
      key: "nm_organisasi",
      label: "ORGANISASI",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
          {item.nm_organisasi || "-"}
        </div>
      ),
    },
    {
      key: "sk_penugasan",
      label: "SK PENUGASAN",
      render: (item) => (
        <div className="text-sm">
          {item.sk_penugasan ? (
            <>
              <div className="text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{item.sk_penugasan}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.tgl_sk_penugasan)}</div>
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "approval_peran",
      label: "APPROVAL",
      align: "center",
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.approval_peran ? "success" : "warning"}
        >
          {item.approval_peran ? "Approved" : "Pending"}
        </Chip>
      ),
    },
    {
      key: "last_active",
      label: "AKTIVITAS TERAKHIR",
      align: "center",
      width: "130px",
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.last_active)}
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
        aria-label="Filter Peran"
        placeholder="Semua Peran"
        selectedKeys={[filterPeran]}
        onChange={(e) => {
          setFilterPeran(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-full max-w-[200px]",
          trigger: "h-10 !bg-white dark:!bg-gray-800 border-gray-200",
        }}
        size="sm"
        variant="bordered"
      >
        <SelectItem key="all" value="all">
          Semua Peran
        </SelectItem>
        {peranOptions.map((peran) => (
          <SelectItem key={String(peran.id_peran)} value={String(peran.id_peran)}>
            {peran.nm_peran}
          </SelectItem>
        ))}
      </Select>
      <Button
        color="primary"
        startContent={<FiPlus className="w-4 h-4" />}
        onPress={handleAdd}
        size="sm"
      >
        Tambah Role
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
            searchKeys={["nm_pengguna", "username", "nm_peran"]}
            searchPlaceholder="Cari nama pengguna atau peran..."
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
          <ModalHeader>Tambah Role Pengguna</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="ID Pengguna"
                placeholder="Masukkan ID pengguna (UUID)"
                value={formData.id_pengguna}
                onChange={(e) => setFormData({ ...formData, id_pengguna: e.target.value })}
                isRequired
              />
              <Select
                label="Peran"
                placeholder="Pilih peran"
                selectedKeys={formData.id_peran ? [String(formData.id_peran)] : []}
                onChange={(e) => setFormData({ ...formData, id_peran: parseInt(e.target.value) })}
                isRequired
              >
                {peranOptions.map((peran) => (
                  <SelectItem key={String(peran.id_peran)} value={String(peran.id_peran)}>
                    {peran.nm_peran}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Unit Organisasi"
                placeholder="Pilih unit organisasi (opsional)"
                selectedKeys={formData.id_organisasi ? [formData.id_organisasi] : []}
                onChange={(e) => setFormData({ ...formData, id_organisasi: e.target.value || null })}
              >
                {unitOptions.map((unit) => (
                  <SelectItem key={unit.id_organisasi} value={unit.id_organisasi}>
                    {unit.nm_lemb}
                  </SelectItem>
                ))}
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="No. SK Penugasan"
                  placeholder="SK/001/2024"
                  value={formData.sk_penugasan || ""}
                  onChange={(e) => setFormData({ ...formData, sk_penugasan: e.target.value || null })}
                />
                <Input
                  label="Tanggal SK"
                  type="date"
                  value={formData.tgl_sk_penugasan || ""}
                  onChange={(e) => setFormData({ ...formData, tgl_sk_penugasan: e.target.value || null })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Approval</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Setujui role pengguna ini
                  </p>
                </div>
                <Switch
                  isSelected={formData.approval_peran}
                  onValueChange={(value) => setFormData({ ...formData, approval_peran: value })}
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
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalContent>
          <ModalHeader>Edit Role Pengguna</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Pengguna"
                value={selectedItem?.nm_pengguna || ""}
                isReadOnly
                isDisabled
              />
              <Select
                label="Peran"
                placeholder="Pilih peran"
                selectedKeys={formData.id_peran ? [String(formData.id_peran)] : []}
                onChange={(e) => setFormData({ ...formData, id_peran: parseInt(e.target.value) })}
                isRequired
              >
                {peranOptions.map((peran) => (
                  <SelectItem key={String(peran.id_peran)} value={String(peran.id_peran)}>
                    {peran.nm_peran}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Unit Organisasi"
                placeholder="Pilih unit organisasi (opsional)"
                selectedKeys={formData.id_organisasi ? [formData.id_organisasi] : []}
                onChange={(e) => setFormData({ ...formData, id_organisasi: e.target.value || null })}
              >
                {unitOptions.map((unit) => (
                  <SelectItem key={unit.id_organisasi} value={unit.id_organisasi}>
                    {unit.nm_lemb}
                  </SelectItem>
                ))}
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="No. SK Penugasan"
                  placeholder="SK/001/2024"
                  value={formData.sk_penugasan || ""}
                  onChange={(e) => setFormData({ ...formData, sk_penugasan: e.target.value || null })}
                />
                <Input
                  label="Tanggal SK"
                  type="date"
                  value={formData.tgl_sk_penugasan || ""}
                  onChange={(e) => setFormData({ ...formData, tgl_sk_penugasan: e.target.value || null })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Approval</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Setujui role pengguna ini
                  </p>
                </div>
                <Switch
                  isSelected={formData.approval_peran}
                  onValueChange={(value) => setFormData({ ...formData, approval_peran: value })}
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
            <p>Apakah Anda yakin ingin menghapus role <strong>{selectedItem?.nm_peran}</strong> dari pengguna <strong>{selectedItem?.nm_pengguna}</strong>?</p>
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
