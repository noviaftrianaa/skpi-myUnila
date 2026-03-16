"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import {
  Chip, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Input, Select, SelectItem, useDisclosure, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
} from "@heroui/react";
import { authClient } from "@/lib/api/client";
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiPhone, FiMail, FiMoreVertical, FiBriefcase } from "react-icons/fi";
import toast from "react-hot-toast";

interface PjItem {
  id_pj_aplikasi: string;
  id_pengguna: string | null;
  id_aplikasi: string;
  nm_pj: string;
  jabatan_pj: string;
  no_hp: string;
  email: string;
  a_masih: number;
  wkt_selesai: string | null;
  nm_aplikasi: string;
  nm_pengguna: string | null;
  username: string | null;
  tgl_create: string;
  last_update: string;
}

interface AppOption {
  id_aplikasi: string;
  nm_aplikasi: string;
}

const toastSuccess = (msg: string) =>
  toast.success(msg, {
    duration: 3000,
    style: { borderRadius: "12px", background: "#10B981", color: "#fff", fontWeight: "500" },
    iconTheme: { primary: "#fff", secondary: "#10B981" },
  });

const toastError = (msg: string) =>
  toast.error(msg, {
    duration: 4000,
    style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
    iconTheme: { primary: "#fff", secondary: "#EF4444" },
  });

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

export default function PjAplikasiTable() {
  const [data, setData] = useState<PjItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [apps, setApps] = useState<AppOption[]>([]);
  const [filterApp, setFilterApp] = useState("");
  const [sortBy, setSortBy] = useState<string>("nm_pj");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [reloadKey, setReloadKey] = useState(0);

  // Separate modals (pattern PeranTable)
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<PjItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id_aplikasi: "",
    nm_pj: "",
    jabatan_pj: "",
    no_hp: "",
    email: "",
    a_masih: true,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Load apps for dropdown
  useEffect(() => {
    const loadApps = async () => {
      try {
        const res = await authClient.get("/manakses/aplikasi?limit=200");
        setApps(
          (res.data.data || []).map((a: any) => ({
            id_aplikasi: a.id_aplikasi,
            nm_aplikasi: a.nm_aplikasi,
          }))
        );
      } catch (e) {
        console.error(e);
      }
    };
    loadApps();
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: rowsPerPage.toString(),
        });
        if (searchQuery) params.append("search", searchQuery);
        if (filterApp) params.append("id_aplikasi", filterApp);

        const res = await authClient.get(`/manakses/pj-aplikasi?${params}`);
        if (res.data.success) {
          setData(res.data.data || []);
          setTotalRecords(res.data.total || 0);
        }
      } catch (e) {
        console.error(e);
        toastError("Gagal memuat data PJ Aplikasi");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterApp, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  // Sort handler
  const handleSortChange = (column: string, direction: "asc" | "desc") => {
    setSortBy(column);
    setSortOrder(direction);
    setCurrentPage(1);
  };

  // Add
  const handleAdd = () => {
    setFormData({
      id_aplikasi: "",
      nm_pj: "",
      jabatan_pj: "",
      no_hp: "",
      email: "",
      a_masih: true,
    });
    onAddOpen();
  };

  // Edit
  const handleEdit = (item: PjItem) => {
    setSelectedItem(item);
    setFormData({
      id_aplikasi: item.id_aplikasi,
      nm_pj: item.nm_pj,
      jabatan_pj: item.jabatan_pj,
      no_hp: item.no_hp || "",
      email: item.email || "",
      a_masih: item.a_masih === 1,
    });
    onEditOpen();
  };

  // Delete
  const handleDelete = (item: PjItem) => {
    setSelectedItem(item);
    onDeleteOpen();
  };

  // Submit Add
  const handleSubmitAdd = async () => {
    if (!formData.nm_pj.trim() || !formData.jabatan_pj.trim() || !formData.email.trim() || !formData.id_aplikasi) {
      toastError("Lengkapi semua field yang wajib");
      return;
    }
    setIsSubmitting(true);
    try {
      await authClient.post("/manakses/pj-aplikasi", formData);
      toastSuccess("PJ berhasil ditambahkan");
      onAddClose();
      setCurrentPage(1);
      reload();
    } catch (e: any) {
      toastError(e.response?.data?.message || "Gagal menambahkan PJ");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleSubmitEdit = async () => {
    if (!selectedItem || !formData.nm_pj.trim() || !formData.jabatan_pj.trim() || !formData.email.trim()) {
      toastError("Lengkapi semua field yang wajib");
      return;
    }
    setIsSubmitting(true);
    try {
      await authClient.put(`/manakses/pj-aplikasi/${selectedItem.id_pj_aplikasi}`, formData);
      toastSuccess("PJ berhasil diperbarui");
      onEditClose();
      reload();
    } catch (e: any) {
      toastError(e.response?.data?.message || "Gagal memperbarui PJ");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    const name = selectedItem.nm_pj;
    setIsSubmitting(true);
    try {
      await authClient.delete(`/manakses/pj-aplikasi/${selectedItem.id_pj_aplikasi}`);
      toastSuccess(`PJ "${name}" berhasil dihapus`);
      onDeleteClose();
      reload();
    } catch (e: any) {
      toastError(e.response?.data?.message || "Gagal menghapus PJ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<PjItem>[] = [
    {
      key: "nm_pj",
      label: "NAMA PJ",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{item.nm_pj}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.jabatan_pj}</div>
        </div>
      ),
    },
    {
      key: "nm_aplikasi",
      label: "APLIKASI",
      sortable: true,
      render: (item) => (
        <Chip size="sm" variant="flat" color="primary" className="font-medium">
          {item.nm_aplikasi}
        </Chip>
      ),
    },
    {
      key: "email",
      label: "KONTAK",
      render: (item) => (
        <div className="space-y-1">
          {item.email && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <FiMail className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[180px]">{item.email}</span>
            </div>
          )}
          {item.no_hp && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <FiPhone className="w-3 h-3 shrink-0" />
              <span>{item.no_hp}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "a_masih",
      label: "STATUS",
      align: "center" as const,
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.a_masih ? "success" : "default"}
          className="font-semibold"
        >
          {item.a_masih ? "Aktif" : "Selesai"}
        </Chip>
      ),
    },
    {
      key: "tgl_create",
      label: "DIBUAT",
      width: "120px",
      render: (item) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.tgl_create)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "60px",
      align: "center" as const,
      render: (item) => (
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly size="sm" variant="light" className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Aksi PJ">
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
              className="text-danger"
              color="danger"
              onPress={() => handleDelete(item)}
            >
              Hapus
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ),
    },
  ];

  // Form fields (reusable for Add & Edit)
  const renderFormFields = (isEdit: boolean) => (
    <div className="space-y-5">
      <Select
        label="Aplikasi"
        placeholder="Pilih aplikasi"
        selectedKeys={formData.id_aplikasi ? [formData.id_aplikasi] : []}
        onSelectionChange={(keys) =>
          setFormData({ ...formData, id_aplikasi: Array.from(keys)[0] as string || "" })
        }
        isRequired
        isDisabled={isEdit}
        variant="bordered"
        classNames={{
          trigger: "h-12",
          label: "text-sm font-medium",
        }}
      >
        {apps.map((a) => (
          <SelectItem key={a.id_aplikasi}>{a.nm_aplikasi}</SelectItem>
        ))}
      </Select>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nama PJ"
          placeholder="Nama penanggung jawab"
          value={formData.nm_pj}
          onValueChange={(v) => setFormData({ ...formData, nm_pj: v })}
          isRequired
          variant="bordered"
          startContent={<FiUser className="w-4 h-4 text-gray-400 shrink-0" />}
          classNames={{ inputWrapper: "h-12" }}
        />
        <Input
          label="Jabatan"
          placeholder="Jabatan PJ"
          value={formData.jabatan_pj}
          onValueChange={(v) => setFormData({ ...formData, jabatan_pj: v })}
          isRequired
          variant="bordered"
          startContent={<FiBriefcase className="w-4 h-4 text-gray-400 shrink-0" />}
          classNames={{ inputWrapper: "h-12" }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email"
          placeholder="email@unila.ac.id"
          type="email"
          value={formData.email}
          onValueChange={(v) => setFormData({ ...formData, email: v })}
          isRequired
          variant="bordered"
          startContent={<FiMail className="w-4 h-4 text-gray-400 shrink-0" />}
          classNames={{ inputWrapper: "h-12" }}
        />
        <Input
          label="No HP"
          placeholder="08xxxxxxxxxx"
          value={formData.no_hp}
          onValueChange={(v) => setFormData({ ...formData, no_hp: v })}
          variant="bordered"
          startContent={<FiPhone className="w-4 h-4 text-gray-400 shrink-0" />}
          classNames={{ inputWrapper: "h-12" }}
        />
      </div>

      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
          formData.a_masih
            ? "border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600"
            : "border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
        }`}
        onClick={() => setFormData({ ...formData, a_masih: !formData.a_masih })}
      >
        <div
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            formData.a_masih
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 dark:border-gray-500"
          }`}
        >
          {formData.a_masih && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {formData.a_masih ? "Masih Aktif sebagai PJ" : "Sudah Selesai"}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {formData.a_masih
              ? "PJ sedang aktif menangani aplikasi ini"
              : "PJ sudah selesai masa tugasnya"}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          serverSide
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
          onSortChange={handleSortChange}
          searchPlaceholder="Cari nama, jabatan, atau email..."
          defaultRowsPerPage={10}
          filterSlot={
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select
                aria-label="Filter Aplikasi"
                placeholder="Semua Aplikasi"
                selectedKeys={filterApp ? [filterApp] : []}
                onSelectionChange={(keys) => {
                  setFilterApp(Array.from(keys)[0] as string || "");
                  setCurrentPage(1);
                }}
                size="sm"
                variant="bordered"
                classNames={{
                  base: "w-full sm:w-[220px]",
                  trigger: "h-10",
                }}
              >
                {apps.map((a) => (
                  <SelectItem key={a.id_aplikasi}>{a.nm_aplikasi}</SelectItem>
                ))}
              </Select>
              <Button
                size="sm"
                color="primary"
                startContent={<FiPlus className="w-4 h-4" />}
                onPress={handleAdd}
                className="h-10 font-medium w-full sm:w-auto"
              >
                Tambah PJ
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* ============ ADD MODAL ============ */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                <FiUser className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah PJ Baru</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                  Penanggung jawab aplikasi
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">{renderFormFields(false)}</ModalBody>
          <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
            <Button variant="flat" onPress={onAddClose} className="font-medium">
              Batal
            </Button>
            <Button
              color="primary"
              onPress={handleSubmitAdd}
              isLoading={isSubmitting}
              className="font-medium"
            >
              Tambah PJ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ============ EDIT MODAL ============ */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <FiEdit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit PJ</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                  {selectedItem?.nm_pj} — {selectedItem?.nm_aplikasi}
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">{renderFormFields(true)}</ModalBody>
          <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
            <Button variant="flat" onPress={onEditClose} className="font-medium">
              Batal
            </Button>
            <Button
              color="primary"
              onPress={handleSubmitEdit}
              isLoading={isSubmitting}
              className="font-medium"
            >
              Simpan Perubahan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ============ DELETE CONFIRMATION MODAL ============ */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm">
        <ModalContent>
          <ModalHeader className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <FiTrash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hapus PJ</h3>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <p className="text-gray-700 dark:text-gray-300">
              Apakah Anda yakin ingin menghapus PJ{" "}
              <strong className="text-gray-900 dark:text-white">&quot;{selectedItem?.nm_pj}&quot;</strong>{" "}
              dari aplikasi{" "}
              <strong className="text-gray-900 dark:text-white">{selectedItem?.nm_aplikasi}</strong>?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </ModalBody>
          <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
            <Button variant="flat" onPress={onDeleteClose} className="font-medium">
              Batal
            </Button>
            <Button
              color="danger"
              onPress={handleConfirmDelete}
              isLoading={isSubmitting}
              className="font-medium"
            >
              Ya, Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
