"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import {
  Chip,
  Select,
  SelectItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
} from "@heroui/react";
import { FiPlus, FiEdit2, FiTrash2, FiShield, FiMoreVertical } from "react-icons/fi";
import {
  menuRoleService,
  type MenuRoleAssignment,
  type MenuRoleStats,
  type CreateMenuRoleRequest,
  type UpdateMenuRoleRequest,
} from "@/lib/services/manakses/menuRoleService";
import { aplikasiService, type Aplikasi } from "@/lib/services/manakses/aplikasiService";
import { menuService, type Menu } from "@/lib/services/manakses/menuService";
import { peranService, type Peran } from "@/lib/services/manakses/peranService";
import { toast } from "react-hot-toast";

interface MenuRoleTableProps {
  onStatsLoaded?: (stats: MenuRoleStats) => void;
}

export default function MenuRoleTable({ onStatsLoaded }: MenuRoleTableProps) {
  const [data, setData] = useState<MenuRoleAssignment[]>([]);
  const [stats, setStats] = useState<MenuRoleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterAplikasi, setFilterAplikasi] = useState<string>("all");
  const [filterPeran, setFilterPeran] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("nm_aplikasi");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Dropdown options
  const [aplikasiOptions, setAplikasiOptions] = useState<Aplikasi[]>([]);
  const [peranOptions, setPeranOptions] = useState<Peran[]>([]);
  const [menuOptions, setMenuOptions] = useState<Menu[]>([]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuRoleAssignment | null>(null);
  const [formData, setFormData] = useState<CreateMenuRoleRequest>({
    id_menu: "",
    id_peran: 0,
    akses_menu: "full",
    a_boleh_show: true,
    a_boleh_insert: false,
    a_boleh_update: false,
    a_boleh_delete: false,
    a_boleh_sanggah: false,
    approval_menu: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For add modal - select aplikasi first then load menus
  const [selectedAddAplikasi, setSelectedAddAplikasi] = useState<string>("");

  // Ref for callback
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

  // Load dropdown options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [aplikasiData, peranResult] = await Promise.all([
          aplikasiService.getList({ limit: 100 }),
          peranService.getList({ limit: 100 }),
        ]);
        setAplikasiOptions(aplikasiData.data);
        setPeranOptions(peranResult.data);
      } catch (error) {
        console.error("Error loading options:", error);
      }
    };
    loadOptions();
  }, []);

  // Load stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await menuRoleService.getStats();
        setStats(statsData);
        if (onStatsLoadedRef.current) {
          onStatsLoadedRef.current(statsData);
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    };
    loadStats();
  }, []);

  // Load menus when aplikasi is selected in add modal
  useEffect(() => {
    const loadMenus = async () => {
      if (!selectedAddAplikasi) {
        setMenuOptions([]);
        return;
      }
      try {
        const result = await menuService.getByAplikasi(selectedAddAplikasi, "flat");
        setMenuOptions(result.menus);
      } catch (error) {
        console.error("Error loading menus:", error);
        setMenuOptions([]);
      }
    };
    loadMenus();
  }, [selectedAddAplikasi]);

  // Load data when filters change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await menuRoleService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          id_aplikasi: filterAplikasi !== "all" ? filterAplikasi : undefined,
          id_peran: filterPeran !== "all" ? parseInt(filterPeran) : undefined,
          sort_by: sortBy as 'nm_menu' | 'nm_peran' | 'nm_aplikasi' | 'akses_menu' | 'tgl_create' | 'last_update',
          sort_order: sortOrder,
        });

        setData(response.data);
        setTotalRecords(response.total);
      } catch (error) {
        console.error("Error loading menu roles:", error);
        toast.error("Gagal memuat data menu role", {
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
        setLoading(false);
      }
    };

    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterAplikasi, filterPeran, sortBy, sortOrder]);

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
      id_menu: "",
      id_peran: 0,
      akses_menu: "full",
      a_boleh_show: true,
      a_boleh_insert: false,
      a_boleh_update: false,
      a_boleh_delete: false,
      a_boleh_sanggah: false,
      approval_menu: false,
    });
    setSelectedAddAplikasi("");
    setIsAddModalOpen(true);
  };

  const handleEdit = (item: MenuRoleAssignment) => {
    setSelectedItem(item);
    setFormData({
      id_menu: item.id_menu,
      id_peran: item.id_peran,
      akses_menu: item.akses_menu || "full",
      a_boleh_show: item.a_boleh_show,
      a_boleh_insert: item.a_boleh_insert,
      a_boleh_update: item.a_boleh_update,
      a_boleh_delete: item.a_boleh_delete,
      a_boleh_sanggah: item.a_boleh_sanggah,
      approval_menu: item.approval_menu,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: MenuRoleAssignment) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitAdd = async () => {
    if (!formData.id_menu) {
      toast.error("Menu harus dipilih", {
        duration: 3000,
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
      return;
    }
    if (!formData.id_peran) {
      toast.error("Peran harus dipilih", {
        duration: 3000,
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
      return;
    }
    setIsSubmitting(true);
    try {
      await menuRoleService.create(formData);
      toast.success("Menu role berhasil ditambahkan", {
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
      setIsAddModalOpen(false);
      setCurrentPage(1);
      // Reload stats
      const statsData = await menuRoleService.getStats();
      setStats(statsData);
      if (onStatsLoadedRef.current) {
        onStatsLoadedRef.current(statsData);
      }
    } catch (error: unknown) {
      console.error("Error creating menu role:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal menambahkan menu role";
      toast.error(errorMessage, {
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
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      const updateData: UpdateMenuRoleRequest = {
        akses_menu: formData.akses_menu,
        a_boleh_show: formData.a_boleh_show,
        a_boleh_insert: formData.a_boleh_insert,
        a_boleh_update: formData.a_boleh_update,
        a_boleh_delete: formData.a_boleh_delete,
        a_boleh_sanggah: formData.a_boleh_sanggah,
        approval_menu: formData.approval_menu,
      };
      await menuRoleService.update(selectedItem.id_menu, selectedItem.id_peran, updateData);
      toast.success("Menu role berhasil diperbarui", {
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
      setIsEditModalOpen(false);
      // Reload data
      const response = await menuRoleService.getList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        id_aplikasi: filterAplikasi !== "all" ? filterAplikasi : undefined,
        id_peran: filterPeran !== "all" ? parseInt(filterPeran) : undefined,
      });
      setData(response.data);
    } catch (error: unknown) {
      console.error("Error updating menu role:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal memperbarui menu role";
      toast.error(errorMessage, {
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
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await menuRoleService.delete(selectedItem.id_menu, selectedItem.id_peran);
      toast.success("Menu role berhasil dihapus", {
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
      setIsDeleteModalOpen(false);
      // Reload data
      const response = await menuRoleService.getList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        id_aplikasi: filterAplikasi !== "all" ? filterAplikasi : undefined,
        id_peran: filterPeran !== "all" ? parseInt(filterPeran) : undefined,
      });
      setData(response.data);
      setTotalRecords(response.total);
      // Reload stats
      const statsData = await menuRoleService.getStats();
      setStats(statsData);
      if (onStatsLoadedRef.current) {
        onStatsLoadedRef.current(statsData);
      }
    } catch (error: unknown) {
      console.error("Error deleting menu role:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus menu role";
      toast.error(errorMessage, {
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
      setIsSubmitting(false);
    }
  };

  const columns: Column<MenuRoleAssignment>[] = [
    {
      key: "nm_menu",
      label: "MENU",
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{item.nm_menu}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{item.nm_aplikasi}</div>
        </div>
      ),
    },
    {
      key: "nm_peran",
      label: "PERAN",
      sortable: true,
      render: (item) => (
        <Chip size="sm" variant="flat" color="primary" startContent={<FiShield className="w-3 h-3" />}>
          {item.nm_peran}
        </Chip>
      ),
    },
    {
      key: "permissions",
      label: "PERMISSIONS",
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          <Tooltip content="Boleh Show">
            <Chip
              size="sm"
              variant={item.a_boleh_show ? "solid" : "bordered"}
              color={item.a_boleh_show ? "success" : "default"}
              className="min-w-[24px]"
            >
              S
            </Chip>
          </Tooltip>
          <Tooltip content="Boleh Insert">
            <Chip
              size="sm"
              variant={item.a_boleh_insert ? "solid" : "bordered"}
              color={item.a_boleh_insert ? "success" : "default"}
              className="min-w-[24px]"
            >
              I
            </Chip>
          </Tooltip>
          <Tooltip content="Boleh Update">
            <Chip
              size="sm"
              variant={item.a_boleh_update ? "solid" : "bordered"}
              color={item.a_boleh_update ? "success" : "default"}
              className="min-w-[24px]"
            >
              U
            </Chip>
          </Tooltip>
          <Tooltip content="Boleh Delete">
            <Chip
              size="sm"
              variant={item.a_boleh_delete ? "solid" : "bordered"}
              color={item.a_boleh_delete ? "danger" : "default"}
              className="min-w-[24px]"
            >
              D
            </Chip>
          </Tooltip>
          <Tooltip content="Approval">
            <Chip
              size="sm"
              variant={item.approval_menu ? "solid" : "bordered"}
              color={item.approval_menu ? "warning" : "default"}
              className="min-w-[24px]"
            >
              A
            </Chip>
          </Tooltip>
        </div>
      ),
    },
    {
      key: "akses_menu",
      label: "AKSES",
      align: "center",
      width: "100px",
      sortable: true,
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.akses_menu === "full" ? "success" : item.akses_menu === "read" ? "warning" : "default"}
        >
          {item.akses_menu || "full"}
        </Chip>
      ),
    },
    {
      key: "last_update",
      label: "TERAKHIR UPDATE",
      align: "center",
      width: "130px",
      sortable: true,
      render: (item) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.last_update)}</div>
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
          <DropdownMenu
            aria-label="Aksi"
            className="min-w-[120px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg rounded-lg"
          >
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
              onPress={() => handleDelete(item)}
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

  // Calculate totals for counting
  const totalAllAplikasi = aplikasiOptions.reduce((sum, app) => sum + (app.jumlah_menu || 0), 0);
  const totalAllPengguna = peranOptions.reduce((sum, p) => sum + (p.jumlah_pengguna || 0), 0);

  // Filter slot
  const filterSlot = (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        aria-label="Filter Aplikasi"
        placeholder="Semua Aplikasi"
        selectedKeys={[filterAplikasi]}
        onChange={(e) => {
          setFilterAplikasi(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-44",
          trigger: "h-9 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-6",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[280px]",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        size="sm"
        variant="bordered"
        renderValue={(items) => {
          if (!items || items.length === 0) return "Semua Aplikasi";
          const item = items[0];
          if (item.key === "all") return "Semua Aplikasi";
          return item.textValue || "Semua Aplikasi";
        }}
      >
        <SelectItem key="all" value="all" textValue="Semua Aplikasi">
          <span className="text-sm">Semua Aplikasi ({totalAllAplikasi})</span>
        </SelectItem>
        {aplikasiOptions.map((app) => (
          <SelectItem key={app.id_aplikasi} value={app.id_aplikasi} textValue={app.nm_aplikasi}>
            <span className="text-sm">{app.nm_aplikasi} ({app.jumlah_menu || 0})</span>
          </SelectItem>
        ))}
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
          base: "w-44",
          trigger: "h-9 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-6",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[280px]",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        size="sm"
        variant="bordered"
        renderValue={(items) => {
          if (!items || items.length === 0) return "Semua Peran";
          const item = items[0];
          if (item.key === "all") return "Semua Peran";
          return item.textValue || "Semua Peran";
        }}
      >
        <SelectItem key="all" value="all" textValue="Semua Peran">
          <span className="text-sm">Semua Peran ({totalAllPengguna})</span>
        </SelectItem>
        {peranOptions.map((peran) => (
          <SelectItem key={String(peran.id_peran)} value={String(peran.id_peran)} textValue={peran.nm_peran}>
            <span className="text-sm">{peran.nm_peran} ({peran.jumlah_pengguna || 0})</span>
          </SelectItem>
        ))}
      </Select>
    </div>
  );

  // Action slot with Add button (right side)
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
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants}>
          <DataTable
            data={data}
            columns={columns}
            searchable={true}
            searchKeys={["nm_menu", "nm_peran", "nm_aplikasi"]}
            searchPlaceholder="Cari menu atau peran..."
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
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
          closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-2 px-6 py-5 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Tambah Menu Role Assignment
            </h3>
            <p className="text-sm font-normal text-gray-600 dark:text-slate-400">
              Assign role ke menu untuk mengatur akses
            </p>
          </ModalHeader>
          <ModalBody className="px-6 py-5">
            <div className="space-y-5">
              {/* Menu Selection Section */}
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Pilih Menu
                </h4>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Aplikasi <span className="text-red-500">*</span>
                    </label>
                    <Select
                      aria-label="Pilih Aplikasi"
                      placeholder="Pilih aplikasi terlebih dahulu"
                      selectedKeys={selectedAddAplikasi ? [selectedAddAplikasi] : []}
                      onChange={(e) => {
                        setSelectedAddAplikasi(e.target.value);
                        setFormData({ ...formData, id_menu: "" });
                      }}
                      variant="bordered"
                      size="sm"
                      classNames={{
                        trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                        value: "text-gray-900 dark:text-white",
                        popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600",
                      }}
                    >
                      {aplikasiOptions.map((app) => (
                        <SelectItem key={app.id_aplikasi} value={app.id_aplikasi}>
                          {app.nm_aplikasi}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Menu <span className="text-red-500">*</span>
                    </label>
                    <Select
                      aria-label="Pilih Menu"
                      placeholder={selectedAddAplikasi ? "Pilih menu" : "Pilih aplikasi terlebih dahulu"}
                      selectedKeys={formData.id_menu ? [formData.id_menu] : []}
                      onChange={(e) => setFormData({ ...formData, id_menu: e.target.value })}
                      isDisabled={!selectedAddAplikasi || menuOptions.length === 0}
                      variant="bordered"
                      size="sm"
                      classNames={{
                        trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                        value: "text-gray-900 dark:text-white",
                        popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600",
                      }}
                    >
                      {menuOptions.map((menu) => (
                        <SelectItem key={menu.id_menu} value={menu.id_menu}>
                          {menu.nm_menu}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              {/* Role Selection Section */}
              <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Pilih Peran
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Peran <span className="text-red-500">*</span>
                    </label>
                    <Select
                      aria-label="Pilih Peran"
                      placeholder="Pilih peran"
                      selectedKeys={formData.id_peran ? [String(formData.id_peran)] : []}
                      onChange={(e) => setFormData({ ...formData, id_peran: parseInt(e.target.value) })}
                      variant="bordered"
                      size="sm"
                      classNames={{
                        trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                        value: "text-gray-900 dark:text-white",
                        popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600",
                      }}
                    >
                      {peranOptions.map((peran) => (
                        <SelectItem key={String(peran.id_peran)} value={String(peran.id_peran)}>
                          {peran.nm_peran}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Tipe Akses
                    </label>
                    <Select
                      aria-label="Pilih Tipe Akses"
                      placeholder="Pilih tipe akses"
                      selectedKeys={formData.akses_menu ? [formData.akses_menu] : ["full"]}
                      onChange={(e) => setFormData({ ...formData, akses_menu: e.target.value || "full" })}
                      variant="bordered"
                      size="sm"
                      classNames={{
                        trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                        value: "text-gray-900 dark:text-white",
                        popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600",
                      }}
                    >
                      <SelectItem key="full" value="full">Full Access</SelectItem>
                      <SelectItem key="read" value="read">Read Only</SelectItem>
                      <SelectItem key="custom" value="custom">Custom</SelectItem>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Permissions Section */}
              <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Permissions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* Boleh Show */}
                  <label
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      formData.a_boleh_show
                        ? "border-success-400 bg-white dark:bg-success-900/20 shadow-sm"
                        : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.a_boleh_show || false}
                      onChange={(e) => setFormData({ ...formData, a_boleh_show: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-success-600 focus:ring-success-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Boleh Show (Lihat)</span>
                  </label>

                  {/* Boleh Insert */}
                  <label
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      formData.a_boleh_insert
                        ? "border-primary-400 bg-white dark:bg-primary-900/20 shadow-sm"
                        : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.a_boleh_insert || false}
                      onChange={(e) => setFormData({ ...formData, a_boleh_insert: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Boleh Insert (Tambah)</span>
                  </label>

                  {/* Boleh Update */}
                  <label
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      formData.a_boleh_update
                        ? "border-warning-400 bg-white dark:bg-warning-900/20 shadow-sm"
                        : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.a_boleh_update || false}
                      onChange={(e) => setFormData({ ...formData, a_boleh_update: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-warning-600 focus:ring-warning-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Boleh Update (Edit)</span>
                  </label>

                  {/* Boleh Delete */}
                  <label
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      formData.a_boleh_delete
                        ? "border-danger-400 bg-white dark:bg-danger-900/20 shadow-sm"
                        : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.a_boleh_delete || false}
                      onChange={(e) => setFormData({ ...formData, a_boleh_delete: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-danger-600 focus:ring-danger-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Boleh Delete (Hapus)</span>
                  </label>

                  {/* Boleh Sanggah */}
                  <label
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      formData.a_boleh_sanggah
                        ? "border-secondary-400 bg-white dark:bg-secondary-900/20 shadow-sm"
                        : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.a_boleh_sanggah || false}
                      onChange={(e) => setFormData({ ...formData, a_boleh_sanggah: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-secondary-600 focus:ring-secondary-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Boleh Sanggah</span>
                  </label>

                  {/* Approval Menu */}
                  <label
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      formData.approval_menu
                        ? "border-amber-400 bg-white dark:bg-amber-900/20 shadow-sm"
                        : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.approval_menu || false}
                      onChange={(e) => setFormData({ ...formData, approval_menu: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Approval Menu</span>
                  </label>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="light" onPress={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button color="primary" onPress={handleSubmitAdd} isLoading={isSubmitting}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
          closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-2 px-6 py-5 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Edit Menu Role Permissions
            </h3>
            <p className="text-sm font-normal text-gray-600 dark:text-slate-400">
              Ubah permission untuk menu role ini
            </p>
          </ModalHeader>
          <ModalBody className="px-6 py-5">
            <div className="space-y-5">
              {/* Info Section */}
              <div className="bg-gray-50/80 dark:bg-slate-700/20 rounded-xl p-4 border border-gray-200/80 dark:border-slate-600/50">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                  Informasi
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Menu</div>
                    <div className="font-medium text-gray-900 dark:text-white">{selectedItem?.nm_menu}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedItem?.nm_aplikasi}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Peran</div>
                    <div className="font-medium text-gray-900 dark:text-white">{selectedItem?.nm_peran}</div>
                  </div>
                </div>
              </div>

              {/* Tipe Akses */}
              <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  Tipe Akses
                </h4>
                <Select
                  aria-label="Pilih Tipe Akses"
                  placeholder="Pilih tipe akses"
                  selectedKeys={formData.akses_menu ? [formData.akses_menu] : ["full"]}
                  onChange={(e) => setFormData({ ...formData, akses_menu: e.target.value || "full" })}
                  variant="bordered"
                  size="sm"
                  classNames={{
                    trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                    value: "text-gray-900 dark:text-white",
                    popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600",
                  }}
                >
                  <SelectItem key="full" value="full">Full Access</SelectItem>
                  <SelectItem key="read" value="read">Read Only</SelectItem>
                  <SelectItem key="custom" value="custom">Custom</SelectItem>
                </Select>
              </div>

              {/* Permissions Section */}
              <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Permissions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* Boleh Show */}
                  <label
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      formData.a_boleh_show
                        ? "border-success-400 bg-white dark:bg-success-900/20 shadow-sm"
                        : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.a_boleh_show || false}
                      onChange={(e) => setFormData({ ...formData, a_boleh_show: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-success-600 focus:ring-success-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Boleh Show (Lihat)</span>
                  </label>

                  {/* Boleh Insert */}
                  <label
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      formData.a_boleh_insert
                        ? "border-primary-400 bg-white dark:bg-primary-900/20 shadow-sm"
                        : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.a_boleh_insert || false}
                      onChange={(e) => setFormData({ ...formData, a_boleh_insert: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Boleh Insert (Tambah)</span>
                  </label>

                  {/* Boleh Update */}
                  <label
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      formData.a_boleh_update
                        ? "border-warning-400 bg-white dark:bg-warning-900/20 shadow-sm"
                        : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.a_boleh_update || false}
                      onChange={(e) => setFormData({ ...formData, a_boleh_update: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-warning-600 focus:ring-warning-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Boleh Update (Edit)</span>
                  </label>

                  {/* Boleh Delete */}
                  <label
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      formData.a_boleh_delete
                        ? "border-danger-400 bg-white dark:bg-danger-900/20 shadow-sm"
                        : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.a_boleh_delete || false}
                      onChange={(e) => setFormData({ ...formData, a_boleh_delete: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-danger-600 focus:ring-danger-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Boleh Delete (Hapus)</span>
                  </label>

                  {/* Boleh Sanggah */}
                  <label
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      formData.a_boleh_sanggah
                        ? "border-secondary-400 bg-white dark:bg-secondary-900/20 shadow-sm"
                        : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.a_boleh_sanggah || false}
                      onChange={(e) => setFormData({ ...formData, a_boleh_sanggah: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-secondary-600 focus:ring-secondary-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Boleh Sanggah</span>
                  </label>

                  {/* Approval Menu */}
                  <label
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                      formData.approval_menu
                        ? "border-amber-400 bg-white dark:bg-amber-900/20 shadow-sm"
                        : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.approval_menu || false}
                      onChange={(e) => setFormData({ ...formData, approval_menu: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-white">Approval Menu</span>
                  </label>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="light" onPress={() => setIsEditModalOpen(false)}>
              Batal
            </Button>
            <Button color="primary" onPress={handleSubmitEdit} isLoading={isSubmitting}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
          closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        }}
      >
        <ModalContent>
          <ModalHeader className="px-6 py-5 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Konfirmasi Hapus</h3>
          </ModalHeader>
          <ModalBody className="px-6 py-5">
            <p className="text-gray-700 dark:text-gray-300">
              Apakah Anda yakin ingin menghapus akses peran <strong>{selectedItem?.nm_peran}</strong> dari menu{" "}
              <strong>{selectedItem?.nm_menu}</strong>?
            </p>
          </ModalBody>
          <ModalFooter className="px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="light" onPress={() => setIsDeleteModalOpen(false)}>
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
