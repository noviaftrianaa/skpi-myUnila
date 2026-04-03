"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import { Chip, Select, SelectItem, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure } from "@heroui/react";
import { FiEye, FiEdit2, FiMoreVertical, FiTrash2, FiPlus, FiShield, FiShieldOff, FiKey, FiUser } from "react-icons/fi";
import { authClient } from "@/lib/api/authClient";
import { penggunaService, type Pengguna, type PenggunaStats, type PenggunaDetail, type PeranOption } from "@/lib/services/manakses/penggunaService";
import PenggunaDetailModal from "./PenggunaDetailModal";
import PenggunaEditModal from "./PenggunaEditModal";
import toast from "react-hot-toast";

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
  const [filterPeran, setFilterPeran] = useState<string>("all");
  const [peranOptions, setPeranOptions] = useState<PeranOption[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sortBy, setSortBy] = useState<string>("username");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Add modal
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addForm, setAddForm] = useState({
    username: "", password: "", nm_pengguna: "", email: "",
    tempat_lahir: "", tgl_lahir: "", jenis_kelamin: "L",
    alamat: "", no_tel: "", no_hp: "", jabatan: "", id_peran: "",
  });

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPenggunaId, setSelectedPenggunaId] = useState<string | null>(null);
  const [selectedPengguna, setSelectedPengguna] = useState<PenggunaDetail | null>(null);
  const [deletingPengguna, setDeletingPengguna] = useState<Pengguna | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Reset MFA modal states
  const [resetMfaModalOpen, setResetMfaModalOpen] = useState(false);
  const [resetMfaPengguna, setResetMfaPengguna] = useState<Pengguna | null>(null);
  const [resetMfaLoading, setResetMfaLoading] = useState(false);

  // Reset Password modal states
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [resetPasswordPengguna, setResetPasswordPengguna] = useState<Pengguna | null>(null);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

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

  // Load stats and peran options on mount only
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        // Load stats and peran options in parallel
        const [statsData, peranData] = await Promise.all([
          penggunaService.getStats(),
          penggunaService.getPeranOptions(),
        ]);
        if (isMounted) {
          setStats(statsData);
          setPeranOptions(peranData);
          if (onStatsLoadedRef.current) {
            onStatsLoadedRef.current(statsData);
          }
        }
      } catch (error: unknown) {
        // Ignore aborted requests (happens in React Strict Mode)
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNABORTED') return;
        console.error('Error loading initial data:', error);
      }
    };
    loadInitialData();
    return () => { isMounted = false; };
  }, []); // Empty dependency - only run on mount

  // Load data when filters change
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await penggunaService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          status: filterStatus !== "all" ? (filterStatus as 'aktif' | 'nonaktif') : undefined,
          id_peran: filterPeran !== "all" ? filterPeran : undefined,
          sort_by: sortBy as 'username' | 'nm_pengguna' | 'email' | 'tgl_create' | 'last_update' | 'last_login_at',
          sort_order: sortOrder,
        });

        if (isMounted) {
          setData(response.data);
          setTotalRecords(response.total);
        }
      } catch (error: unknown) {
        // Ignore aborted requests (happens in React Strict Mode)
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNABORTED') return;
        console.error('Error loading pengguna:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [currentPage, rowsPerPage, searchQuery, filterStatus, filterPeran, refreshTrigger, sortBy, sortOrder]);

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
      toast.error("Gagal memuat data pengguna", {
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
      });
    }
  };

  const handleEditSuccess = async () => {
    // Reload data after edit
    setRefreshTrigger((prev) => prev + 1);
    // Reload stats
    const statsData = await penggunaService.getStats();
    setStats(statsData);
    if (onStatsLoadedRef.current) {
      onStatsLoadedRef.current(statsData);
    }
    toast.success("Data pengguna berhasil diperbarui", {
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
  };

  const handleDeleteClick = (pengguna: Pengguna) => {
    setDeletingPengguna(pengguna);
    setDeleteModalOpen(true);
  };

  const handleResetMfaClick = (pengguna: Pengguna) => {
    setResetMfaPengguna(pengguna);
    setResetMfaModalOpen(true);
  };

  const handleResetMfaConfirm = async () => {
    if (!resetMfaPengguna) return;

    setResetMfaLoading(true);
    try {
      const result = await penggunaService.resetMfa(resetMfaPengguna.id_pengguna);
      setRefreshTrigger((prev) => prev + 1);
      setResetMfaModalOpen(false);
      setResetMfaPengguna(null);

      if (result.mfa_was_enabled) {
        toast.success(`MFA untuk "${result.nm_pengguna}" berhasil direset`, {
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
      } else {
        toast(result.message, {
          duration: 3000,
          icon: "ℹ️",
          style: {
            borderRadius: "12px",
            background: "#3B82F6",
            color: "#fff",
            fontWeight: "500",
          },
        });
      }
    } catch (error) {
      console.error('Error resetting MFA:', error);
      toast.error("Gagal mereset MFA. Silakan coba lagi.", {
        duration: 4000,
        style: {
          borderRadius: "12px",
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
      });
    } finally {
      setResetMfaLoading(false);
    }
  };

  const handleResetPasswordClick = (pengguna: Pengguna) => {
    setResetPasswordPengguna(pengguna);
    setResetPasswordModalOpen(true);
  };

  const handleResetPasswordConfirm = async () => {
    if (!resetPasswordPengguna) return;

    setResetPasswordLoading(true);
    try {
      const result = await penggunaService.resetPassword(resetPasswordPengguna.id_pengguna);
      setResetPasswordModalOpen(false);
      setResetPasswordPengguna(null);

      toast.success(`Password untuk "${result.nm_pengguna}" berhasil direset ke default`, {
        duration: 4000,
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
      console.error('Error resetting password:', error);
      toast.error("Gagal mereset password. Silakan coba lagi.", {
        duration: 4000,
        style: {
          borderRadius: "12px",
          background: "#EF4444",
          color: "#fff",
          fontWeight: "500",
        },
      });
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPengguna) return;

    const deletedName = deletingPengguna.nm_pengguna;
    setDeleteLoading(true);
    try {
      await penggunaService.delete(deletingPengguna.id_pengguna);
      setRefreshTrigger((prev) => prev + 1);
      setDeleteModalOpen(false);
      setDeletingPengguna(null);
      // Reload stats
      const statsData = await penggunaService.getStats();
      setStats(statsData);
      if (onStatsLoadedRef.current) {
        onStatsLoadedRef.current(statsData);
      }
      toast.success(`Pengguna "${deletedName}" berhasil dihapus`, {
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
      console.error('Error deleting pengguna:', error);
      toast.error("Gagal menghapus pengguna. Silakan coba lagi.", {
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
      key: "jenis_kelamin",
      label: "L/P",
      align: "center",
      width: "60px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.jenis_kelamin === "L" ? "primary" : item.jenis_kelamin === "P" ? "secondary" : "default"}
          className="min-w-[28px]"
        >
          {item.jenis_kelamin || "-"}
        </Chip>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      align: "center",
      width: "140px",
      render: (item) => (
        <div className="flex flex-col items-center gap-1">
          <Chip
            size="sm"
            variant="flat"
            color={item.a_aktif && !item.disable ? "success" : "danger"}
          >
            {item.a_aktif && !item.disable ? "Aktif" : "Tidak Aktif"}
          </Chip>
          <div className="flex items-center gap-1 text-xs">
            {item.mfa_enabled ? (
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                <FiShield className="w-3 h-3" />
                MFA
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-gray-400">
                <FiShieldOff className="w-3 h-3" />
                MFA
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "active_role",
      label: "ROLE AKTIF",
      width: "220px",
      render: (item) => (
        <div className="text-sm">
          {item.active_role ? (
            <>
              <div className="font-medium text-gray-900 dark:text-white">
                {item.active_role}
              </div>
              {item.active_display_organisasi ? (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.active_display_organisasi}
                </div>
              ) : item.active_organisasi ? (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.active_organisasi}
                </div>
              ) : null}
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
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
          <DropdownMenu aria-label="Aksi Pengguna" className="min-w-[140px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg rounded-lg">
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
              key="reset-mfa"
              startContent={<FiShieldOff className="w-4 h-4" />}
              onPress={() => handleResetMfaClick(item)}
              className={item.mfa_enabled ? "text-warning" : "text-gray-400"}
              isDisabled={!item.mfa_enabled}
            >
              Reset MFA
            </DropdownItem>
            <DropdownItem
              key="reset-password"
              startContent={<FiKey className="w-4 h-4" />}
              onPress={() => handleResetPasswordClick(item)}
              className="text-warning"
            >
              Reset Password
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
    <div className="flex items-center gap-2 w-full flex-wrap">
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
        aria-label="Filter Peran"
        placeholder="Semua Peran"
        selectedKeys={[filterPeran]}
        onChange={(e) => {
          setFilterPeran(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-40",
          trigger: "h-9 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-6",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 max-h-72 min-w-[280px]",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        size="sm"
        variant="bordered"
        renderValue={(items) => {
          if (!items || items.length === 0) return "Semua Peran";
          const item = items[0];
          if (item.key === "all") return "Semua Peran";
          // Find the peran to get jumlah_pengguna
          const selectedPeran = peranOptions.find(p => p.id_peran === item.key);
          if (selectedPeran) {
            return `${selectedPeran.nm_peran} (${selectedPeran.jumlah_pengguna})`;
          }
          return item.textValue || "Semua Peran";
        }}
      >
        <SelectItem key="all" value="all" textValue="Semua Peran">
          <span className="text-sm">Semua Peran</span>
        </SelectItem>
        {peranOptions.map((peran) => (
          <SelectItem key={peran.id_peran} value={peran.id_peran} textValue={peran.nm_peran}>
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-sm truncate">{peran.nm_peran}</span>
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                {peran.jumlah_pengguna}
              </span>
            </div>
          </SelectItem>
        ))}
      </Select>
    </div>
  );

  // Handle add pengguna (placeholder for future implementation)
  const handleAdd = () => {
    setAddForm({
      username: "", password: "", nm_pengguna: "", email: "",
      tempat_lahir: "", tgl_lahir: "", jenis_kelamin: "L",
      alamat: "", no_tel: "", no_hp: "", jabatan: "", id_peran: "",
    });
    onAddOpen();
  };

  const handleSubmitAdd = async () => {
    if (!addForm.username.trim() || !addForm.password.trim() || !addForm.nm_pengguna.trim()) {
      toast.error("Username, password, dan nama pengguna wajib diisi", {
        duration: 3000, style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#EF4444" },
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {
        username: addForm.username,
        password: addForm.password,
        nm_pengguna: addForm.nm_pengguna,
        jenis_kelamin: addForm.jenis_kelamin || "L",
      };
      if (addForm.email) payload.email = addForm.email;
      if (addForm.tempat_lahir) payload.tempat_lahir = addForm.tempat_lahir;
      if (addForm.tgl_lahir) payload.tgl_lahir = addForm.tgl_lahir;
      if (addForm.alamat) payload.alamat = addForm.alamat;
      if (addForm.no_tel) payload.no_tel = addForm.no_tel;
      if (addForm.no_hp) payload.no_hp = addForm.no_hp;
      if (addForm.jabatan) payload.jabatan = addForm.jabatan;
      if (addForm.id_peran) payload.id_peran = parseInt(addForm.id_peran);

      await authClient.post("/manakses/pengguna", payload);
      toast.success("Pengguna berhasil ditambahkan", {
        duration: 3000, style: { borderRadius: "12px", background: "#10B981", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#10B981" },
      });
      onAddClose();
      setRefreshTrigger((t) => t + 1);
    } catch (e: any) {
      const msg = e.response?.data?.message || "Gagal menambahkan pengguna";
      toast.error(msg, {
        duration: 4000, style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
        iconTheme: { primary: "#fff", secondary: "#EF4444" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle sort change
  const handleSortChange = (column: string, direction: "asc" | "desc") => {
    setSortBy(column);
    setSortOrder(direction);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

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
            onSortChange={handleSortChange}
            filterSlot={filterSlot}
            actionSlot={actionSlot}
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

      {/* Reset MFA Confirmation Modal */}
      <Modal
        isOpen={resetMfaModalOpen}
        onClose={() => {
          setResetMfaModalOpen(false);
          setResetMfaPengguna(null);
        }}
        size="md"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <FiShieldOff className="w-5 h-5 text-warning" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Reset MFA
              </h3>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <p className="text-gray-700 dark:text-gray-300">
              Apakah Anda yakin ingin mereset MFA untuk pengguna{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {resetMfaPengguna?.nm_pengguna}
              </span>
              ?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Pengguna harus melakukan setup ulang MFA setelah direset.
            </p>
          </ModalBody>
          <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button
              variant="flat"
              onPress={() => {
                setResetMfaModalOpen(false);
                setResetMfaPengguna(null);
              }}
              isDisabled={resetMfaLoading}
            >
              Batal
            </Button>
            <Button
              color="warning"
              onPress={handleResetMfaConfirm}
              isLoading={resetMfaLoading}
            >
              Reset MFA
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reset Password Confirmation Modal */}
      <Modal
        isOpen={resetPasswordModalOpen}
        onClose={() => {
          setResetPasswordModalOpen(false);
          setResetPasswordPengguna(null);
        }}
        size="md"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <FiKey className="w-5 h-5 text-warning" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Reset Password
              </h3>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <p className="text-gray-700 dark:text-gray-300">
              Apakah Anda yakin ingin mereset password untuk pengguna{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {resetPasswordPengguna?.nm_pengguna}
              </span>
              ?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Password akan direset ke default:{" "}
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                unilajaya
              </span>
            </p>
          </ModalBody>
          <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button
              variant="flat"
              onPress={() => {
                setResetPasswordModalOpen(false);
                setResetPasswordPengguna(null);
              }}
              isDisabled={resetPasswordLoading}
            >
              Batal
            </Button>
            <Button
              color="warning"
              onPress={handleResetPasswordConfirm}
              isLoading={resetPasswordLoading}
            >
              Reset Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add Pengguna Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="2xl" scrollBehavior="inside"
        classNames={{ backdrop: "bg-black/50 backdrop-blur-sm", base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-2 sm:mx-4" }}>
        <ModalContent>
          <ModalHeader className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                <FiUser className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tambah Pengguna</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">Daftarkan pengguna baru ke sistem</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-5 px-4 sm:px-6">
            <div className="space-y-5">
              {/* Akun Section */}
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Informasi Akun
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Username <span className="text-red-500">*</span></label>
                    <Input aria-label="Username" placeholder="username" value={addForm.username}
                      onValueChange={(v) => setAddForm({...addForm, username: v})} variant="bordered" size="sm"
                      classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm" }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Password <span className="text-red-500">*</span></label>
                    <Input aria-label="Password" placeholder="Min 6 karakter" type="password" value={addForm.password}
                      onValueChange={(v) => setAddForm({...addForm, password: v})} variant="bordered" size="sm"
                      classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm" }} />
                  </div>
                </div>
              </div>

              {/* Data Pribadi Section */}
              <div className="bg-gray-50/80 dark:bg-slate-700/20 rounded-xl p-4 border border-gray-200/80 dark:border-slate-600/50">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />Data Pribadi
                </h4>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Nama Lengkap <span className="text-red-500">*</span></label>
                    <Input aria-label="Nama" placeholder="Nama lengkap pengguna" value={addForm.nm_pengguna}
                      onValueChange={(v) => setAddForm({...addForm, nm_pengguna: v})} variant="bordered" size="sm"
                      classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm" }} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Email</label>
                      <Input aria-label="Email" placeholder="email@unila.ac.id" type="email" value={addForm.email}
                        onValueChange={(v) => setAddForm({...addForm, email: v})} variant="bordered" size="sm"
                        classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm" }} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Jenis Kelamin <span className="text-red-500">*</span></label>
                      <Select aria-label="JK" placeholder="Pilih" selectedKeys={[addForm.jenis_kelamin]}
                        onChange={(e) => setAddForm({...addForm, jenis_kelamin: e.target.value || "L"})}
                        variant="bordered" size="sm"
                        classNames={{ trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm", value: "text-gray-900 dark:text-white" }}>
                        <SelectItem key="L">Laki-laki</SelectItem>
                        <SelectItem key="P">Perempuan</SelectItem>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Tempat Lahir</label>
                      <Input aria-label="Tempat Lahir" placeholder="Kota" value={addForm.tempat_lahir}
                        onValueChange={(v) => setAddForm({...addForm, tempat_lahir: v})} variant="bordered" size="sm"
                        classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm" }} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Tanggal Lahir</label>
                      <Input aria-label="Tanggal Lahir" type="date" value={addForm.tgl_lahir}
                        onValueChange={(v) => setAddForm({...addForm, tgl_lahir: v})} variant="bordered" size="sm"
                        classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm" }} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Alamat</label>
                    <Input aria-label="Alamat" placeholder="Alamat lengkap" value={addForm.alamat}
                      onValueChange={(v) => setAddForm({...addForm, alamat: v})} variant="bordered" size="sm"
                      classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm" }} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">No Telpon</label>
                      <Input aria-label="No Telpon" placeholder="021-xxx" value={addForm.no_tel}
                        onValueChange={(v) => setAddForm({...addForm, no_tel: v})} variant="bordered" size="sm"
                        classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm" }} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">No HP</label>
                      <Input aria-label="No HP" placeholder="08xxx" value={addForm.no_hp}
                        onValueChange={(v) => setAddForm({...addForm, no_hp: v})} variant="bordered" size="sm"
                        classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm" }} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Jabatan</label>
                      <Input aria-label="Jabatan" placeholder="Jabatan" value={addForm.jabatan}
                        onValueChange={(v) => setAddForm({...addForm, jabatan: v})} variant="bordered" size="sm"
                        classNames={{ input: "text-gray-900 dark:text-white", inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Peran Section */}
              <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />Peran (Opsional)
                </h4>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Peran Awal</label>
                  <Select aria-label="Peran" placeholder="Pilih peran (opsional)"
                    selectedKeys={addForm.id_peran ? [addForm.id_peran] : []}
                    onChange={(e) => setAddForm({...addForm, id_peran: e.target.value})}
                    variant="bordered" size="sm"
                    classNames={{ trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 shadow-sm", value: "text-gray-900 dark:text-white", popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg" }}>
                    {peranOptions.map((p) => (
                      <SelectItem key={String(p.id_peran)}>{p.nm_peran}</SelectItem>
                    ))}
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Jika dipilih, peran akan otomatis di-assign ke pengguna</p>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
            <Button variant="flat" onPress={onAddClose} className="font-medium">Batal</Button>
            <Button onPress={handleSubmitAdd} isLoading={isSubmitting}
              className="font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg transition-all rounded-lg">
              Tambah Pengguna
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
